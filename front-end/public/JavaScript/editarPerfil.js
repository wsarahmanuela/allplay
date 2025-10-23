const LISTA_MESTRA_ESPORTES = [
    "Basquete", "Futebol", "Vôlei", "Natação", "Corrida",
    "Ciclismo", "Tênis de mesa", "E-Sports", "Atletismo", "Handebol"
];

// **********************************
// 1. UPLOAD DE BANNER E FOTO
// **********************************

// Banner
const uploadBanner = document.getElementById("upload-banner");
const bannerImg = document.getElementById("banner-imagem");
document.getElementById("btn-alterar-banner").addEventListener("click", () => uploadBanner.click());

uploadBanner.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        bannerImg.src = ev.target.result;
        bannerImg.classList.add('loaded'); // Exibe a imagem via CSS
    };
    reader.readAsDataURL(file);
});

// Foto de Perfil
const uploadFoto = document.getElementById("upload-foto");
const fotoPreview = document.getElementById("foto-preview");

fotoPreview.addEventListener("click", () => uploadFoto.click());

uploadFoto.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        fotoPreview.innerHTML = `<img src="${ev.target.result}" alt="Foto de perfil">`;
    };
    reader.readAsDataURL(file);
});


// **********************************
// 2. BIOGRAFIA: CONTADOR DE CARACTERES
// **********************************

const bioTextarea = document.getElementById('bio-textarea');
const bioRestante = document.getElementById('bio-restante');
const LIMITE_CARACTERES = 200; // Limite máximo para a biografia

if (bioTextarea && bioRestante) {
    const atualizarContador = () => {
        const restantes = LIMITE_CARACTERES - bioTextarea.value.length;
        bioRestante.textContent = restantes;
        bioRestante.style.color = restantes < 20 ? '#e53935' : '#0d7826';
    };

    bioTextarea.addEventListener('input', atualizarContador);
    atualizarContador();
}


// **********************************
// 3. ESPORTES: TAGS E DATALIST
// **********************************

const inputNovoEsporte = document.getElementById('input-novo-esporte');
const btnAdicionarEsporte = document.getElementById('btn-adicionar-esporte');
const tagsContainer = document.querySelector('.tags');
const listaEsportesElement = document.getElementById('lista-esportes');


// Cria os <option>s no <datalist> para sugestão
const preencherListaDeSugestao = () => {
    if (!listaEsportesElement) return;
    listaEsportesElement.innerHTML = ''; 
    LISTA_MESTRA_ESPORTES.forEach(esporte => {
        const option = document.createElement('option');
        option.value = esporte;
        listaEsportesElement.appendChild(option);
    });
};

// Remove a tag quando o botão 'x' é clicado
const removerTag = (event) => {
    event.target.closest('.tag')?.remove(); 
};

// Cria a tag HTML e anexa o botão de remoção
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

// Inicializa tags existentes no HTML com a funcionalidade de remoção
const inicializarTagsExistentes = () => {
    tagsContainer.querySelectorAll('.tag').forEach(tag => {
        // Verifica se o botão já existe para evitar duplicação no HTML
        if (!tag.querySelector('.remover-tag')) { 
            const nomeEsporte = tag.textContent.trim();
            
            // Remove o texto original (pois a função criarTagComRemocao já o faz)
            tag.textContent = ''; 
            
            // Reutiliza a função principal para adicionar o botão de remoção
            const tagCompleta = criarTagComRemocao(nomeEsporte);
            
            // Substitui a tag existente pela tag completa (com botão e listener)
            tagsContainer.replaceChild(tagCompleta, tag);
        }
    });
};

// Adiciona um novo esporte ao container
btnAdicionarEsporte.addEventListener('click', (e) => {
    e.preventDefault(); 
    
    const novoEsporte = inputNovoEsporte.value.trim();
    if (!novoEsporte) return;
    
    // Validação do Esporte e Normalização
    const esporteValido = LISTA_MESTRA_ESPORTES.find(
        esporte => esporte.toLowerCase() === novoEsporte.toLowerCase()
    );

    if (!esporteValido) {
        alert(`"${novoEsporte}" não é um esporte válido. Por favor, selecione na lista de sugestões.`);
        inputNovoEsporte.value = '';
        return;
    }
    const nomeEsporteNormalizado = esporteValido; 

    // Validação de Duplicidade
    const jaExiste = Array.from(tagsContainer.querySelectorAll('.tag'))
        .some(tag => tag.textContent.trim().toLowerCase() === nomeEsporteNormalizado.toLowerCase());

    if (jaExiste) {
        alert(`O esporte "${nomeEsporteNormalizado}" já foi adicionado!`);
        inputNovoEsporte.value = '';
        return;
    }

    // Adiciona e Limpa
    const novaTag = criarTagComRemocao(nomeEsporteNormalizado);
    tagsContainer.appendChild(novaTag);
    inputNovoEsporte.value = '';
});


// Execução inicial
preencherListaDeSugestao();
inicializarTagsExistentes();