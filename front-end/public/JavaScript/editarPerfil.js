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
    };
    reader.readAsDataURL(file);
  });