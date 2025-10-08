const inputFoto = document.getElementById("upload-foto");
const fotoPreview = document.getElementById("foto-preview");
const icone = document.getElementById("icone");

// Quando o usuário escolhe uma imagem
inputFoto.addEventListener("change", function () {
  const arquivo = this.files[0];

  if (arquivo) {
    const leitor = new FileReader();

    leitor.addEventListener("load", function () {
      // Esconde o ícone e mostra a imagem escolhida
      icone.style.display = "none";
      fotoPreview.style.backgroundImage = `url(${this.result})`;
      fotoPreview.style.backgroundSize = "cover";
      fotoPreview.style.backgroundPosition = "center";
    });

    leitor.readAsDataURL(arquivo);
  } else {
    // Se o usuário cancelar, volta ao estado original
    icone.style.display = "flex";
    fotoPreview.style.backgroundImage = "none";
  }
});
