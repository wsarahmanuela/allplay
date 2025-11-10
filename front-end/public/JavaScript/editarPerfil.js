// URLs e Variáveis
const BASE_URL = 'http://localhost:3000';
let LISTA_MESTRA_ESPORTES = []; 

// VARIÁVEIS DE ESTADO PARA O UPLOAD DE ARQUIVOS
let arquivoBannerParaUpload = null; 
let arquivoFotoParaUpload = null; 

// Elementos de Esporte
const inputNovoEsporte = document.getElementById('input-novo-esporte');
const btnAdicionarEsporte = document.getElementById('btn-adicionar-esporte');
const tagsContainer = document.querySelector('.tags');
const listaSugestoesCustom = document.getElementById('lista-sugestoes-custom'); 

// Elementos de Edição
const btnSalvar = document.querySelector('.btn-salvar');
const bioTextarea = document.getElementById('bio-textarea');
const bioRestante = document.getElementById('bio-restante');
const LIMITE_CARACTERES = 300; 

// Campos de Input
const inputNomeUsuario = document.getElementById('nome-usuario');
const inputNomeCompleto = document.getElementById('nome-completo');
const inputLocalizacao = document.getElementById('localizacao');

// Elementos de Upload
const uploadBanner = document.getElementById("upload-banner");
const bannerImg = document.getElementById("banner-imagem");
const uploadFoto = document.getElementById("upload-foto");
const fotoPreview = document.getElementById("foto-preview");


// =================================================================
// FUNÇÕES DE UTILIDADE E DOM
// =================================================================

// 1. Contador de Caracteres da Biografia
const atualizarContador = () => {
    if (bioTextarea && bioRestante) {
        const restantes = LIMITE_CARACTERES - bioTextarea.value.length;
        bioRestante.textContent = restantes;
        bioRestante.style.color = restantes < 20 ? '#e53935' : '#0d7826';
    }
};

// 2. Lógica de Tags
const removerTag = (event) => {
    event.target.closest('.tag')?.remove(); 
};

const criarTagComRemocao = (nomeEsporte) => {
    const novaTag = document.createElement('span');
    novaTag.classList.add('tag');
    novaTag.textContent = nomeEsporte; 

    const btnRemover = document.createElement('button');
    btnRemover.textContent = '×';
    btnRemover.classList.add('remover-tag');
    btnRemover.addEventListener('click', removerTag);
    
    novaTag.appendChild(btnRemover);
    return novaTag;
};

// Preenche o <ul> customizado com a lista mestra
const preencherListaDeSugestao = () => {
    if (!listaSugestoesCustom) return;
    listaSugestoesCustom.innerHTML = ''; 

    LISTA_MESTRA_ESPORTES.forEach(esporte => {
        const item = document.createElement('li');
        item.textContent = esporte;
        
        item.addEventListener('click', () => {
            inputNovoEsporte.value = esporte;
            listaSugestoesCustom.classList.remove('ativo'); 
        });
        
        listaSugestoesCustom.appendChild(item);
    });
};

// Carrega as tags do usuário
const carregarTagsIniciais = (esportes) => {
    tagsContainer.innerHTML = ''; // Limpa tags existentes
    esportes.forEach(esporte => {
        const novaTag = criarTagComRemocao(esporte);
        tagsContainer.appendChild(novaTag);
    });
};

//Botão de cancelar
document.querySelector('.btn-cancelar').addEventListener('click', function() {
    window.history.back();
});


// 3. Lógica de Upload e Preview (AGORA ARMAZENA O ARQUIVO NOVO)

// Listener do Botão do Banner
if (document.getElementById("btn-alterar-banner")) {
    document.getElementById("btn-alterar-banner").addEventListener("click", () => uploadBanner.click());
}

uploadBanner.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    arquivoBannerParaUpload = file; // ARMAZENA O ARQUIVO NOVO
    
    const reader = new FileReader();
    reader.onload = (ev) => {
        bannerImg.src = ev.target.result;
        bannerImg.classList.add('loaded');
    };
    reader.readAsDataURL(file);
});

// Listener da Foto de Perfil
if (fotoPreview) {
    fotoPreview.addEventListener("click", () => uploadFoto.click());
}

uploadFoto.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    arquivoFotoParaUpload = file; // ARMAZENA O ARQUIVO NOVO

    const reader = new FileReader();
    reader.onload = (ev) => {
        fotoPreview.innerHTML = `<img src="${ev.target.result}" alt="Foto de perfil">`;
    };
    reader.readAsDataURL(file);
});


// Função utilitária para obter o caminho completo da imagem
const caminhoFoto = (nomeArquivo) => {
     if (!nomeArquivo) return "imagens/profile.picture.jpg";
     if (nomeArquivo.startsWith("http") || nomeArquivo.startsWith("/")) return nomeArquivo;
     return `${BASE_URL}/uploads/${nomeArquivo}`;
};


// =================================================================
// INTEGRAÇÃO COM BACKEND (BUSCA INICIAL)
// =================================================================

/**
 * Carrega a lista de todos os esportes disponíveis (Lista Mestra)
 */
async function carregarEsportesMestres() {
    try {
        const response = await fetch(`${BASE_URL}/esportes/mestra`); 
        if (!response.ok) throw new Error('Falha ao carregar esportes mestres.');
        
        const dadosEsportes = await response.json(); 
        
        LISTA_MESTRA_ESPORTES = Array.isArray(dadosEsportes) ? dadosEsportes : [];
        preencherListaDeSugestao(); 
        
    } catch (error) {
        console.error("Erro ao carregar lista mestra de esportes:", error);
        LISTA_MESTRA_ESPORTES = ["Basquete", "Futebol", "Vôlei", "Natação", "Corrida"];
        preencherListaDeSugestao();
    }
}


/**
 * Carrega os dados do perfil atual (Nome, Bio, Localização, Fotos) e os esportes favoritos
 */
async function carregarPerfilInicial() {
    const cpf = localStorage.getItem("cpf");
    if (!cpf) {
        alert("Erro: CPF não encontrado. Faça login novamente.");
        return;
    }

    try {
        // 1. Buscar Dados Principais do Usuário (incluindo bannerUrl)
        let resposta = await fetch(`${BASE_URL}/usuario/${encodeURIComponent(cpf)}`); 
        if (!resposta.ok) throw new Error('Falha ao carregar dados principais.');
        
        let dadosPerfil = await resposta.json();
        const usuario = dadosPerfil.usuario || {};

        // Preenche campos de texto
        inputNomeUsuario.value = usuario.nomeUsuario || '';
        inputNomeCompleto.value = usuario.nome || '';
        inputLocalizacao.value = usuario.cidade || '';
        bioTextarea.value = usuario.bio || '';
        atualizarContador();

        // Foto de Perfil
        if (usuario.fotoDePerfil) {
             const fotoUrl = caminhoFoto(usuario.fotoDePerfil);
             fotoPreview.innerHTML = `<img src="${fotoUrl}" alt="Foto de perfil">`;
        }
        
        // Banner (NOVO: Carrega o bannerUrl que deve ser retornado pelo backend)
        if (usuario.bannerUrl) {
            const bannerUrl = caminhoFoto(usuario.bannerUrl);
            bannerImg.src = bannerUrl;
            bannerImg.classList.add('loaded');
        } else {
             // Caso não haja banner, garante que o src esteja vazio ou seja um placeholder
             bannerImg.src = ''; 
             bannerImg.classList.remove('loaded');
        }


        // 2. Buscar Esportes Favoritos
        resposta = await fetch(`${BASE_URL}/esportes/${encodeURIComponent(cpf)}`); 
        if (!resposta.ok) throw new Error('Falha ao carregar esportes favoritos.');

        const esportesFavoritos = await resposta.json();
        
        if (Array.isArray(esportesFavoritos)) {
            carregarTagsIniciais(esportesFavoritos);
        }

    } catch (error) {
        console.error("Erro ao carregar perfil inicial:", error);
        alert("Não foi possível carregar seus dados para edição. Tente novamente.");
    }
}


// =================================================================
// INTEGRAÇÃO COM BACKEND (SALVAMENTO)
// =================================================================

/**
 * Envia o banner e a foto de perfil para o novo endpoint de upload.
 */
async function fazerUploadImagens(cpf) {
    if (!arquivoBannerParaUpload && !arquivoFotoParaUpload) {
        return { success: true, message: "Nenhuma imagem para upload." };
    }
    
    const formData = new FormData();
    // Adiciona os arquivos se existirem. Nomes devem bater com o `upload.fields` no servidor!
    if (arquivoBannerParaUpload) {
        formData.append("banner", arquivoBannerParaUpload); // Campo 'banner'
    }
    if (arquivoFotoParaUpload) {
        formData.append("fotoDePerfil", arquivoFotoParaUpload); // Campo 'fotoDePerfil'
    }

    try {
        const response = await fetch(`${BASE_URL}/usuario/upload-perfil/${encodeURIComponent(cpf)}`, { 
            method: 'POST',
            body: formData, // Envia o FormData
        });

        const resultado = await response.json();
        if (!resultado.success) {
            throw new Error(resultado.message || "Erro desconhecido ao enviar imagens.");
        }
        
        // Limpa o estado após o upload bem-sucedido
        arquivoBannerParaUpload = null;
        arquivoFotoParaUpload = null;
        return resultado;

    } catch (error) {
        console.error("Erro no upload de imagens:", error);
        throw new Error("Falha no upload de imagens. Verifique se a rota '/usuario/upload-perfil/:cpf' está correta no Node.js.");
    }
}


/**
 * Coleta todos os dados e envia para o backend.
 */
async function salvarPerfil(e) {
    e.preventDefault();
    const cpf = localStorage.getItem("cpf");
    if (!cpf) return alert("CPF não encontrado. Não é possível salvar.");

    const esportesAtuais = Array.from(tagsContainer.querySelectorAll('.tag'))
        .map(tag => tag.textContent.trim().replace('×', ''));

    // 1. Dados Principais (Nome, Bio, Localização)
    const dadosPrincipais = {
        cpf: cpf,
        nomeCompleto: inputNomeCompleto.value,
        nomeUsuario: inputNomeUsuario.value,
        bio: bioTextarea.value,
        localizacao: inputLocalizacao.value,
    };

    try {
        btnSalvar.textContent = 'Salvando...';
        btnSalvar.disabled = true;
        
        // --- 1. UPLOAD DE FOTOS/BANNER ---
        await fazerUploadImagens(cpf);

        // --- 2. SALVAR DADOS PRINCIPAIS (Nome, Bio, Localização) ---
        let response = await fetch(`${BASE_URL}/usuario/atualizar`, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosPrincipais),
        });

        if (!response.ok) throw new Error('Falha ao salvar dados principais.');
        
        // --- 3. SALVAR ESPORTES ---
        response = await fetch(`${BASE_URL}/esportes`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf: cpf, esportes: esportesAtuais }),
        });

        if (!response.ok) throw new Error('Falha ao salvar esportes.');
        
        alert("Perfil atualizado com sucesso!");
        window.location.href = 'perfil.html'; // Redireciona

    } catch (error) {
        console.error("Erro ao salvar perfil:", error);
        alert("Erro ao salvar o perfil. Detalhes: " + error.message);
    } finally {
        btnSalvar.textContent = 'Salvar Alterações';
        btnSalvar.disabled = false;
    }
}


// =================================================================
// EVENTOS E INICIALIZAÇÃO
// =================================================================

// Adiciona o evento de contagem na Bio
if (bioTextarea) {
    bioTextarea.addEventListener('input', atualizarContador);
}

// Lógica de Adição de Tags
btnAdicionarEsporte.addEventListener('click', (e) => {
    e.preventDefault(); 
    const novoEsporte = inputNovoEsporte.value.trim();
    if (!novoEsporte) return;
    
    const esporteValido = LISTA_MESTRA_ESPORTES.find(
        esporte => esporte.toLowerCase() === novoEsporte.toLowerCase()
    );

    if (!esporteValido) {
        alert(`"${novoEsporte}" não é um esporte válido. Por favor, selecione na lista.`);
        inputNovoEsporte.value = '';
        return;
    }
    const nomeEsporteNormalizado = esporteValido; 

    const jaExiste = Array.from(tagsContainer.querySelectorAll('.tag'))
        .some(tag => tag.textContent.trim().replace('×', '').toLowerCase() === nomeEsporteNormalizado.toLowerCase());

    if (jaExiste) {
        alert(`O esporte "${nomeEsporteNormalizado}" já foi adicionado!`);
        inputNovoEsporte.value = '';
        return;
    }

    const novaTag = criarTagComRemocao(nomeEsporteNormalizado);
    tagsContainer.appendChild(novaTag);
    inputNovoEsporte.value = '';
});


// Lógica de Exibição do Dropdown
const inputArea = inputNovoEsporte.closest('.input-com-dropdown');
if (inputNovoEsporte) {
    inputNovoEsporte.addEventListener('click', () => {
        listaSugestoesCustom.classList.toggle('ativo');
    });
}


document.addEventListener('click', (e) => {
    if (inputArea && !inputArea.contains(e.target)) {
        listaSugestoesCustom.classList.remove('ativo');
    }
});


// Evento Salvar
if (btnSalvar) {
    btnSalvar.addEventListener('click', salvarPerfil);
}


// INICIALIZAÇÃO DA PÁGINA
document.addEventListener("DOMContentLoaded", () => {
    carregarEsportesMestres();
    carregarPerfilInicial();
});