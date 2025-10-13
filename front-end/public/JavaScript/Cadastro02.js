document.addEventListener("DOMContentLoaded", () => {
  // === PARTE 1: Preview da imagem ===
  const inputFoto = document.getElementById("upload-foto");
  const fotoPreview = document.getElementById("foto-preview");
  const icone = document.getElementById("icone");

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

  // === PARTE 2: Envio do formulário para o servidor ===
  const form = document.getElementById("cadastroFotoForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cpf = localStorage.getItem("cpf");
    if (!cpf) {
      alert("Erro: CPF não encontrado. Faça o cadastro novamente.");
      return;
    }

    const foto = document.getElementById("upload-foto").files[0];
    const bio = document.getElementById("bio").value.trim();

    if (!foto || !bio) {
      alert("Preencha todos os campos!");
      return;
    }

    const formData = new FormData();
    formData.append("cpf", cpf);
    formData.append("bio", bio);
    formData.append("foto", foto);

    try {
      const resposta = await fetch("http://localhost:3000/cadastro/foto", {
        method: "POST",
        body: formData
      });

      const resultado = await resposta.json();

      if (resultado.success) {
        alert("Cadastro finalizado com sucesso!");
        window.location.href = "EscolhaEsporte.html";
      } else {
        alert("Erro: " + resultado.message);
      }

    } catch (erro) {
      console.error("Erro ao enviar foto:", erro);
      alert("Erro de conexão com o servidor.");
    }
  });

});

const bio = document.getElementById('bio');
const contador = document.getElementById('contador');
const limite = 200;

bio.addEventListener('input', () => {
  const tamanho = bio.value.length;
  contador.textContent = `${tamanho}/${limite}`;

  // Se passar do limite, muda a cor e impede digitação extra
  if (tamanho > limite) {
    contador.style.color = 'red';
    bio.value = bio.value.substring(0, limite); // corta o excesso
    contador.textContent = `${limite}/${limite}`;
  } else {
    contador.style.color = '#777';
  }
});

const usuario = document.getElementById('usuario');

usuario.addEventListener('input', () => {
  if (usuario.value && !usuario.value.startsWith('@')) {
    usuario.value = '@' + usuario.value.replace(/^@+/, '');
  }
});