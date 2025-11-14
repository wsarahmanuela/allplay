// URLs e Variáveis
const BASE_URL = 'http://localhost:3000';
let LISTA_MESTRA_ESPORTES = []; 

// VARIÁVEIS DE ESTADO PARA O UPLOAD DE ARQUIVOS
let arquivoBannerParaUpload = null; 
let arquivoFotoParaUpload = null; 

// Elementos de Esporte
const inputNovoEsporte = document.getElementById('input-novo-esporte');
const tagsContainer = document.querySelector('.tags');
const listaSugestoesCustom = document.getElementById('lista-sugestoes-custom'); 

// Elementos de Edição
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

// CONSTANTES DE LIMITE
const MAX_ESPORTES = 5;
const MIN_ESPORTES = 1;
const LIMITE_CARACTERES_CLUBE = 50;

// Variável para armazenar clubes do usuário
let clubesDoUsuario = [];

// =================================================================
// FUNÇÕES DE UTILIDADE E DOM
// =================================================================

// Contador de Caracteres da Biografia
const atualizarContador = () => {
    if (bioTextarea && bioRestante) {
        const restantes = LIMITE_CARACTERES - bioTextarea.value.length;
        bioRestante.textContent = restantes;
        bioRestante.style.color = restantes < 20 ? '#e53935' : '#0d7826';
    }
};

// Lógica de Tags de Esportes
const removerTag = (event) => {
    event.target.closest('.tag')?.remove();
    atualizarContadorEsportes();
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

const atualizarContadorEsportes = () => {
    const qtdAtual = tagsContainer.querySelectorAll('.tag').length;
    
    let contador = document.getElementById('contador-esportes');
    if (!contador) {
        contador = document.createElement('p');
        contador.id = 'contador-esportes';
        contador.style.fontSize = '14px';
        contador.style.marginTop = '10px';
        tagsContainer.parentElement.appendChild(contador);
    }
    
    contador.textContent = `${qtdAtual}/${MAX_ESPORTES} esportes selecionados`;
    
    if (qtdAtual >= MAX_ESPORTES) {
        contador.style.color = '#e53935';
        inputNovoEsporte.disabled = true;
        inputNovoEsporte.placeholder = 'Limite de esportes atingido';
    } else if (qtdAtual < MIN_ESPORTES) {
        contador.style.color = '#ff9800';
        inputNovoEsporte.disabled = false;
        inputNovoEsporte.placeholder = 'Selecione pelo menos 1 esporte';
    } else {
        contador.style.color = '#0d7826';
        inputNovoEsporte.disabled = false;
        inputNovoEsporte.placeholder = 'Selecione um esporte';
    }
};

function preencherListaDeSugestao() {
    const lista = document.getElementById("lista-sugestoes-custom");
    lista.innerHTML = "";

    LISTA_MESTRA_ESPORTES.forEach((esporte) => {
        const li = document.createElement("li");
        li.textContent = esporte;
        
        li.addEventListener("click", () => {
            const qtdAtual = tagsContainer.querySelectorAll('.tag').length;
            if (qtdAtual >= MAX_ESPORTES) {
                alert(`Você só pode adicionar até ${MAX_ESPORTES} esportes!`);
                lista.classList.remove('ativo');
                return;
            }
            
            const jaExiste = Array.from(tagsContainer.querySelectorAll('.tag'))
                .some(tag => tag.textContent.trim().replace('×', '').toLowerCase() === esporte.toLowerCase());
            
            if (jaExiste) {
                alert(`O esporte "${esporte}" já foi adicionado!`);
                lista.classList.remove('ativo');
                return;
            }
            
            const novaTag = criarTagComRemocao(esporte);
            tagsContainer.appendChild(novaTag);
            inputNovoEsporte.value = '';
            lista.classList.remove('ativo');
            atualizarContadorEsportes();
        });
        
        lista.appendChild(li);
    });
}

const carregarTagsIniciais = (esportes) => {
    tagsContainer.innerHTML = '';
    esportes.forEach(esporte => {
        const novaTag = criarTagComRemocao(esporte);
        tagsContainer.appendChild(novaTag);
    });
    atualizarContadorEsportes();
};

// Botão de cancelar
if (document.querySelector('.btn-cancelar')) {
    document.querySelector('.btn-cancelar').addEventListener('click', function() {
        window.history.back();
    });
}

// Upload e Preview de Imagens
function caminhoBanner(banner) {
    if (!banner) return ""; 
    if (banner.startsWith("http") || banner.startsWith("/")) return banner;
    return `${BASE_URL}/uploads/${banner}`;
}

if (document.getElementById("btn-alterar-banner")) {
    document.getElementById("btn-alterar-banner").addEventListener("click", () => uploadBanner.click());
}

if (uploadBanner) {
    uploadBanner.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        arquivoBannerParaUpload = file;
        
        const reader = new FileReader();
        reader.onload = (ev) => {
            bannerImg.src = ev.target.result;
            bannerImg.classList.add('loaded');
        };
        reader.readAsDataURL(file);
    });
}

if (fotoPreview) {
    fotoPreview.addEventListener("click", () => uploadFoto.click());
}

if (uploadFoto) {
    uploadFoto.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        arquivoFotoParaUpload = file;

        const reader = new FileReader();
        reader.onload = (ev) => {
            fotoPreview.innerHTML = `<img src="${ev.target.result}" alt="Foto de perfil">`;
        };
        reader.readAsDataURL(file);
    });
}

const caminhoFoto = (nomeArquivo) => {
    if (!nomeArquivo) return "imagens/profile.picture.jpg";
    if (nomeArquivo.startsWith("http") || nomeArquivo.startsWith("/")) return nomeArquivo;
    return `${BASE_URL}/uploads/${nomeArquivo}`;
};

// =================================================================
// INTEGRAÇÃO COM BACKEND (BUSCA INICIAL)
// =================================================================

async function carregarEsportesMestres() {
    console.log("carregarEsportesMestres() foi chamada");
    try {
        const response = await fetch(`${BASE_URL}/esportes/mestra`); 
        if (!response.ok) throw new Error('Falha ao carregar esportes mestres.');
        
        const dadosEsportes = await response.json(); 
        console.log("Resposta do servidor:", dadosEsportes); 
        
        if (Array.isArray(dadosEsportes) && dadosEsportes.length > 0) {
            LISTA_MESTRA_ESPORTES = dadosEsportes;
            console.log("✅ Esportes carregados:", LISTA_MESTRA_ESPORTES);
            preencherListaDeSugestao(); 
        } else {
            console.warn("⚠️ Nenhum esporte encontrado");
            LISTA_MESTRA_ESPORTES = [];
        }
        
    } catch (error) {
        console.error("❌ Erro ao carregar esportes:", error);
        LISTA_MESTRA_ESPORTES = [];
        alert("Não foi possível carregar a lista de esportes.");
    }
}

async function carregarPerfilInicial() {
    const cpf = localStorage.getItem("cpf");
    if (!cpf) {
        alert("Erro: CPF não encontrado. Faça login novamente.");
        return;
    }

    try {
        let resposta = await fetch(`${BASE_URL}/usuario/${encodeURIComponent(cpf)}`); 
        if (!resposta.ok) throw new Error('Falha ao carregar dados principais.');
        
        let dadosPerfil = await resposta.json();
        const usuario = dadosPerfil.usuario || {};

        inputNomeUsuario.value = usuario.nomeUsuario || '';
        inputNomeCompleto.value = usuario.nome || '';
        inputLocalizacao.value = usuario.cidade || '';
        bioTextarea.value = usuario.bio || '';
        atualizarContador();

        if (usuario.fotoDePerfil) {
            const fotoUrl = caminhoFoto(usuario.fotoDePerfil);
            fotoPreview.innerHTML = `<img src="${fotoUrl}" alt="Foto de perfil">`;
        }
        
        const bannerPath = caminhoBanner(usuario.bannerURL); 
        const bannerElement = document.getElementById("banner"); 
        if (bannerElement) {
            if (bannerPath) {
                bannerElement.style.backgroundImage = `url(${bannerPath})`;
                bannerElement.style.backgroundColor = 'transparent';
            } else {
                bannerElement.style.backgroundImage = 'none'; 
            }
        }
        
        if (usuario.bannerUrl) {
            const bannerUrl = caminhoFoto(usuario.bannerUrl);
            bannerImg.src = bannerUrl;
            bannerImg.classList.add('loaded');
        } else {
            bannerImg.src = ''; 
            bannerImg.classList.remove('loaded');
        }

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

async function fazerUploadImagens(cpf) {
    if (!arquivoBannerParaUpload && !arquivoFotoParaUpload) {
        return { success: true, message: "Nenhuma imagem para upload." };
    }
    
    const formData = new FormData();
    if (arquivoBannerParaUpload) {
        formData.append("banner", arquivoBannerParaUpload);
    }
    if (arquivoFotoParaUpload) {
        formData.append("fotoDePerfil", arquivoFotoParaUpload);
    }

    try {
        const response = await fetch(`${BASE_URL}/usuario/upload-perfil/${encodeURIComponent(cpf)}`, { 
            method: 'POST',
            body: formData,
        });

        const resultado = await response.json();
        if (!resultado.success) {
            throw new Error(resultado.message || "Erro desconhecido ao enviar imagens.");
        }
        
        arquivoBannerParaUpload = null;
        arquivoFotoParaUpload = null;
        return resultado;

    } catch (error) {
        console.error("Erro no upload de imagens:", error);
        throw new Error("Falha no upload de imagens.");
    }
}

async function salvarPerfil(e) {
    e.preventDefault();
    
    const btnSalvar = document.querySelector('.btn-salvar');
    if (!btnSalvar) {
        console.error("Botão salvar não encontrado!");
        return;
    }
    
    const cpf = localStorage.getItem("cpf");
    if (!cpf) return alert("CPF não encontrado. Não é possível salvar.");

    const esportesAtuais = Array.from(tagsContainer.querySelectorAll('.tag'))
        .map(tag => tag.textContent.trim().replace('×', ''));

    if (esportesAtuais.length < MIN_ESPORTES) {
        alert(`Você precisa selecionar pelo menos ${MIN_ESPORTES} esporte!`);
        return;
    }

    if (esportesAtuais.length > MAX_ESPORTES) {
        alert(`Você pode selecionar no máximo ${MAX_ESPORTES} esportes!`);
        return;
    }

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
        
        await fazerUploadImagens(cpf);

        let response = await fetch(`${BASE_URL}/usuario/atualizar`, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosPrincipais),
        });

        if (!response.ok) throw new Error('Falha ao salvar dados principais.');
        
        response = await fetch(`${BASE_URL}/esportes`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf: cpf, esportes: esportesAtuais }),
        });

        if (!response.ok) throw new Error('Falha ao salvar esportes.');
        
        alert("Perfil atualizado com sucesso!");
        window.location.href = 'perfil.html';

    } catch (error) {
        console.error("Erro ao salvar perfil:", error);
        alert("Erro ao salvar o perfil. Detalhes: " + error.message);
    } finally {
        btnSalvar.textContent = 'Salvar Alterações';
        btnSalvar.disabled = false;
    }
}

// =================================================================
// SISTEMA DE CLUBES - FUNÇÕES
// =================================================================

async function carregarClubesExistentes() {
    try {
        const response = await fetch(`${BASE_URL}/clubes/todos`);
        if (!response.ok) throw new Error('Erro ao carregar clubes');
        
        const clubes = await response.json();
        const selectClubeExistente = document.getElementById('select-clube-existente');
        
        if (selectClubeExistente) {
            selectClubeExistente.innerHTML = '<option value="">-- Selecione um clube --</option>';
            clubes.forEach(clube => {
                const option = document.createElement('option');
                option.value = clube.IDclube;
                option.textContent = `${clube.nome} - ${clube.esporteClube}`;
                selectClubeExistente.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('Erro ao carregar clubes existentes:', error);
    }
}

function preencherEsportesDoModal() {
    const selectEsporteClube = document.getElementById('select-esporte-clube');
    if (selectEsporteClube) {
        selectEsporteClube.innerHTML = '<option value="">-- Selecione o esporte --</option>';
        LISTA_MESTRA_ESPORTES.forEach(esporte => {
            const option = document.createElement('option');
            option.value = esporte;
            option.textContent = esporte;
            selectEsporteClube.appendChild(option);
        });
    }
}

async function carregarClubesDoUsuario() {
    const cpf = localStorage.getItem('cpf');
    if (!cpf) return;
    
    try {
        const response = await fetch(`${BASE_URL}/usuario/${encodeURIComponent(cpf)}/clubes`);
        if (!response.ok) throw new Error('Erro ao carregar clubes do usuário');
        
        const data = await response.json();
        clubesDoUsuario = data.clubes || [];
        
        renderizarClubes();
        
    } catch (error) {
        console.error('Erro ao carregar clubes do usuário:', error);
        clubesDoUsuario = [];
    }
}

function renderizarClubes() {
    const listaClubescont = document.querySelector('.lista-clubes');
    if (!listaClubescont) return;
    
    listaClubescont.innerHTML = '';
    
    if (clubesDoUsuario.length === 0) {
        listaClubescont.innerHTML = '<p style="color: #999; text-align: center;">Nenhum clube adicionado ainda.</p>';
        return;
    }
    
    clubesDoUsuario.forEach(clube => {
        const divClube = document.createElement('div');
        divClube.classList.add('clube');
        divClube.dataset.idclube = clube.IDclube;
        
        divClube.innerHTML = `
            <p><strong>${clube.nome}</strong><br><small>${clube.esporteClube}</small></p>
            <button class="remover" data-idclube="${clube.IDclube}">&times;</button>
        `;
        
        const btnRemover = divClube.querySelector('.remover');
        btnRemover.addEventListener('click', () => removerClube(clube.IDclube));
        
        listaClubescont.appendChild(divClube);
    });
}

async function removerClube(idClube) {
    const cpf = localStorage.getItem('cpf');
    if (!cpf) return;
    
    const confirmar = confirm('Tem certeza que deseja remover este clube?');
    if (!confirmar) return;
    
    try {
        const response = await fetch(`${BASE_URL}/usuario/clube/remover`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf, idClube })
        });
        
        if (!response.ok) throw new Error('Erro ao remover clube');
        
        clubesDoUsuario = clubesDoUsuario.filter(c => c.IDclube !== idClube);
        renderizarClubes();
        
        alert('Clube removido com sucesso!');
        
    } catch (error) {
        console.error('Erro ao remover clube:', error);
        alert('Erro ao remover clube. Tente novamente.');
    }
}

function abrirModal() {
    const modalClube = document.getElementById('modal-clube');
    if (modalClube) {
        modalClube.classList.add('ativo');
        carregarClubesExistentes();
        preencherEsportesDoModal();
        limparCamposModal();
    }
}

function fecharModalClube() {
    const modalClube = document.getElementById('modal-clube');
    if (modalClube) {
        modalClube.classList.remove('ativo');
        limparCamposModal();
    }
}

function limparCamposModal() {
    const selectClubeExistente = document.getElementById('select-clube-existente');
    const inputNomeClube = document.getElementById('input-nome-clube');
    const selectEsporteClube = document.getElementById('select-esporte-clube');
    
    if (selectClubeExistente) selectClubeExistente.value = '';
    if (inputNomeClube) inputNomeClube.value = '';
    if (selectEsporteClube) selectEsporteClube.value = '';
    atualizarContadorClube();
}

function atualizarContadorClube() {
    const contador = document.getElementById('contador-clube');
    const inputNomeClube = document.getElementById('input-nome-clube');
    
    if (!contador || !inputNomeClube) return;
    
    const atual = inputNomeClube.value.length;
    contador.textContent = `${atual}/${LIMITE_CARACTERES_CLUBE} caracteres`;
    
    if (atual >= LIMITE_CARACTERES_CLUBE) {
        contador.style.color = '#e53935';
    } else {
        contador.style.color = '#777';
    }
}

async function adicionarClube() {
    const cpf = localStorage.getItem('cpf');
    if (!cpf) {
        alert('CPF não encontrado. Faça login novamente.');
        return;
    }
    
    const selectClubeExistente = document.getElementById('select-clube-existente');
    const inputNomeClube = document.getElementById('input-nome-clube');
    const selectEsporteClube = document.getElementById('select-esporte-clube');
    const salvarClube = document.getElementById('salvar-clube');
    
    const clubeExistenteId = selectClubeExistente?.value;
    const nomeNovoClube = inputNomeClube?.value.trim();
    const esporteNovoClube = selectEsporteClube?.value;
    
    if (!clubeExistenteId && !nomeNovoClube) {
        alert('Selecione um clube existente ou preencha o nome do novo clube.');
        return;
    }
    
    if (nomeNovoClube && !esporteNovoClube) {
        alert('Selecione o esporte do novo clube.');
        return;
    }
    
    try {
        if (salvarClube) {
            salvarClube.textContent = 'Salvando...';
            salvarClube.disabled = true;
        }
        
        let response;
        
        if (clubeExistenteId) {
            response = await fetch(`${BASE_URL}/usuario/clube/adicionar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf, idClube: clubeExistenteId })
            });
        } else {
            response = await fetch(`${BASE_URL}/usuario/clube/criar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    cpf, 
                    nomeClube: nomeNovoClube, 
                    esporte: esporteNovoClube 
                })
            });
        }
        
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.message || 'Erro ao adicionar clube');
        }
        
        alert('Clube adicionado com sucesso!');
        fecharModalClube();
        await carregarClubesDoUsuario();
        
    } catch (error) {
        console.error('Erro ao adicionar clube:', error);
        alert('Erro: ' + error.message);
    } finally {
        if (salvarClube) {
            salvarClube.textContent = 'Adicionar';
            salvarClube.disabled = false;
        }
    }
}

// =================================================================
// EVENTOS E INICIALIZAÇÃO
// =================================================================
document.addEventListener("DOMContentLoaded", () => {

    const btnSalvar = document.querySelector('.btn-salvar');
    const btnAdicionarClube = document.querySelector('.btn-adicionar');
    const fecharModal = document.getElementById('fechar-modal');
    const cancelarClube = document.getElementById('cancelar-clube');
    const salvarClube = document.getElementById('salvar-clube');
    const modalClube = document.getElementById('modal-clube');
    const selectClubeExistente = document.getElementById('select-clube-existente');
    const inputNomeClube = document.getElementById('input-nome-clube');
    const selectEsporteClube = document.getElementById('select-esporte-clube');
    
    // Inicializações principais
    carregarEsportesMestres();
    carregarPerfilInicial();
    carregarClubesDoUsuario();

    // Contador da biografia
    if (bioTextarea) {
        bioTextarea.addEventListener('input', atualizarContador);
    }

    // Dropdown de esportes
    if (inputNovoEsporte) {
        inputNovoEsporte.addEventListener('click', (e) => {
            e.stopPropagation();
            if (listaSugestoesCustom) {
                listaSugestoesCustom.classList.toggle('ativo');
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (listaSugestoesCustom && !listaSugestoesCustom.contains(e.target) && e.target !== inputNovoEsporte) {
            listaSugestoesCustom.classList.remove('ativo');
        }
    });

    // Botão de salvar perfil
    if (btnSalvar) {
        console.log("✅ Botão Salvar encontrado");
        btnSalvar.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            try {
                await salvarPerfil(e);
            } catch (error) {
                console.error("❌ Erro ao executar salvarPerfil:", error);
                alert("Erro: " + error.message);
            }
        });
    }

    // Eventos dos clubes
    if (btnAdicionarClube) {
        btnAdicionarClube.addEventListener('click', abrirModal);
    }

    if (fecharModal) {
        fecharModal.addEventListener('click', fecharModalClube);
    }

    if (cancelarClube) {
        cancelarClube.addEventListener('click', fecharModalClube);
    }

    if (salvarClube) {
        salvarClube.addEventListener('click', adicionarClube);
    }

    if (modalClube) {
        modalClube.addEventListener('click', (e) => {
            if (e.target === modalClube) {
                fecharModalClube();
            }
        });
    }

    // Interação entre campos do modal
    if (selectClubeExistente && inputNomeClube && selectEsporteClube) {
        selectClubeExistente.addEventListener('change', () => {
            const temClubeExistente = selectClubeExistente.value !== '';
            inputNomeClube.disabled = temClubeExistente;
            selectEsporteClube.disabled = temClubeExistente;
            
            if (temClubeExistente) {
                inputNomeClube.value = '';
                selectEsporteClube.value = '';
            }
        });

        inputNomeClube.addEventListener('input', () => {
            const temNomeNovo = inputNomeClube.value.trim() !== '';
            selectClubeExistente.disabled = temNomeNovo;
            
            if (temNomeNovo) {
                selectClubeExistente.value = '';
            }
            
            atualizarContadorClube();
        });
    }

    console.log("✅ EditarPerfil.js totalmente inicializado!");
});