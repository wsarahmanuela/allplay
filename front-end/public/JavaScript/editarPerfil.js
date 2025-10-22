// BANNER
const btnBanner = document.getElementById("btn-alterar-banner");
const uploadBanner = document.getElementById("upload-banner");
const bannerImg = document.getElementById("banner-imagem");

btnBanner.addEventListener("click", () => uploadBanner.click());

uploadBanner.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    bannerImg.src = ev.target.result;
    
    // **********************************************
    // ADIÇÃO CRUCIAL: Adiciona a classe 'loaded' para que o CSS exiba a imagem
    // **********************************************
    bannerImg.classList.add('loaded'); 
  };
  reader.readAsDataURL(file);
});

// FOTO DE PERFIL (canto inferior esquerdo)
const uploadFoto = document.getElementById("upload-foto");
const fotoPreview = document.getElementById("foto-preview");

// clicar no próprio circle para abrir (opcional)
fotoPreview.addEventListener("click", () => uploadFoto.click());

uploadFoto.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    // substitui o conteúdo interno para colocar a <img> com crop correto
    fotoPreview.innerHTML = `<img src="${ev.target.result}" alt="Foto de perfil">`;
    // OBS: O CSS está configurado para o .foto img garantir o corte circular
  };
  reader.readAsDataURL(file);
});

// ********** RESTRIÇÃO DE CARACTERES PARA BIOGRAFIA **********

// Elementos
const bioTextarea = document.getElementById('bio-textarea');
const bioRestante = document.getElementById('bio-restante');

// Define o limite máximo de caracteres (deve ser o mesmo do HTML maxlength)
const LIMITE_CARACTERES = 200; 

// Inicializa o contador
if (bioTextarea && bioRestante) {
    // Função para atualizar o contador
    function atualizarContador() {
        const caracteresDigitados = bioTextarea.value.length;
        const caracteresRestantes = LIMITE_CARACTERES - caracteresDigitados;
        
        bioRestante.textContent = caracteresRestantes;

        // Opcional: Altera a cor se estiver perto do limite
        if (caracteresRestantes < 20) {
            bioRestante.style.color = '#e53935'; // Vermelho
        } else {
            bioRestante.style.color = '#0d7826'; // Verde
        }
    }

    // Adiciona o evento para monitorar a digitação em tempo real
    bioTextarea.addEventListener('input', atualizarContador);

    // Garante que o contador esteja correto ao carregar a página (se houver texto pré-existente)
    atualizarContador(); 
}