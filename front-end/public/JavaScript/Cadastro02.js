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
        icone.style.display = "none";
        fotoPreview.style.backgroundImage = `url(${this.result})`;
        fotoPreview.style.backgroundSize = "cover";
        fotoPreview.style.backgroundPosition = "center";
      });

      leitor.readAsDataURL(arquivo);
    } else {
      icone.style.display = "flex";
      fotoPreview.style.backgroundImage = "none";
    }
  });

  // === PARTE 2: Envio do formulário para o servidor ===
  const form = document.getElementById("cadastroForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cpf = localStorage.getItem("cpf");
    const nomeUsuario = document.getElementById("usuario").value.trim();
    const foto = document.getElementById("upload-foto").files[0];
    const bio = document.getElementById("bio").value.trim();

    // === Validação dos campos ===
    if (!cpf) {
      alert("Erro: CPF não encontrado. Faça o cadastro novamente.");
      return;
    }

    if (!foto || !bio || !nomeUsuario) {
      alert("Preencha todos os campos: Foto, Nome de usuário e Biografia!");
      return;
    }

    // === Monta o FormData (dados + arquivo) ===
    const formData = new FormData();
    formData.append("cpf", cpf);
    formData.append("bio", bio);
    formData.append("foto", foto);
    formData.append("nomeUsuario", nomeUsuario); // <-- Adicionamos aqui!

    console.log("Enviando dados do cadastro:", { cpf, nomeUsuario, bio, foto: foto.name });

    try {
      const resposta = await fetch("http://localhost:3000/cadastro/foto", {
        method: "POST",
        body: formData
      });

      if (!resposta.ok) {
        const erroJson = await resposta.json().catch(() => ({ message: `Erro HTTP ${resposta.status}` }));
        throw new Error("Erro no servidor: " + erroJson.message);
      }

      const resultado = await resposta.json();
      console.log("Resposta do servidor:", resultado);

      if (resultado.success) {
        alert("Cadastro finalizado com sucesso!");
        window.location.href = "EscolhaEsporte.html";
      } else {
        throw new Error(resultado.message || "Erro desconhecido no servidor.");
      }
      
    } catch (erro) {
      console.error("Erro fatal ao finalizar o cadastro:", erro);
      alert("Erro ao finalizar o cadastro: " + erro.message);
    }
  });
});

// === CONTADOR DE BIOGRAFIA ===
const bio = document.getElementById('bio');
const contador = document.getElementById('contador');
const limite = 200;

bio.addEventListener('input', () => {
  const tamanho = bio.value.length;
  contador.textContent = `${tamanho}/${limite}`;

  if (tamanho > limite) {
    contador.style.color = 'red';
    bio.value = bio.value.substring(0, limite);
    contador.textContent = `${limite}/${limite}`;
  } else {
    contador.style.color = '#777';
  }
});
