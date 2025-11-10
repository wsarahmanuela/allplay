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
  const form = document.getElementById("cadastroForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cpf = localStorage.getItem("cpf");
    if (!cpf) {
      alert("Erro: CPF não encontrado. Faça o cadastro novamente.");
      return;
    }

    const foto = document.getElementById("upload-foto").files[0];
    const bio = document.getElementById("bio").value.trim();
    const nomeUsuario = document.getElementById("usuario").value.trim();
    // Você pode precisar de outros campos, como 'cidade' ou 'localizacao'
    // const localizacao = document.getElementById("cidade").value.trim(); 

    if (!foto || !bio || !nomeUsuario) {
      alert("Preencha todos os campos: Foto, Biografia e Nome de Usuário!");
      return;
    }

    // =========================================================================
    // 1. REQUISIÇÃO PARA UPLOAD DA FOTO (Rota: /usuario/upload-perfil/:cpf)
    // Isso usa FormData e a rota correta para o Multer
    // =========================================================================

    const formData = new FormData();
    // O nome do campo deve ser 'fotoDePerfil' para bater com o seu Node.js
    formData.append("fotoDePerfil", foto);

    // URL CORRETA: /usuario/upload-perfil/CPF
    const uploadUrl = `http://localhost:3000/usuario/upload-perfil/${cpf}`;

    console.log("Iniciando upload da foto para:", uploadUrl);

    try {
      // --- PASSO A: Enviar a foto ---
      const respostaFoto = await fetch(uploadUrl, {
        method: "POST",
        body: formData // Envia o arquivo
      });

      // Garante que a resposta é JSON e não um erro HTML (que causa o SyntaxError)
      if (!respostaFoto.ok) {
        // Tenta ler o erro em JSON (se o servidor for bem comportado)
        // Se falhar, lança um erro com o status HTTP
        const erroJson = await respostaFoto.json().catch(() => ({ message: `Erro HTTP ${respostaFoto.status}` }));
        throw new Error("Erro no servidor (Upload): " + erroJson.message);
      }

      const resultadoFoto = await respostaFoto.json();
      console.log("Upload da foto concluído:", resultadoFoto.message);

      // =========================================================================
      // 2. REQUISIÇÃO PARA ATUALIZAR DADOS DE TEXTO (Rota: /usuario/atualizar)
      // Isso usa JSON e a rota PUT para atualizar bio e nomeUsuario
      // =========================================================================

      // --- PASSO B: Enviar dados de texto ---
      const dadosPerfil = {
        cpf: cpf,
        nomeUsuario: nomeUsuario,
        bio: bio,
        // Se tiver campo de localizacao: localizacao: localizacao
      };

      const updateUrl = "http://localhost:3000/usuario/atualizar";

      console.log("Enviando atualização de dados:", dadosPerfil)

      const respostaDados = await fetch(updateUrl, {
        method: "PUT", // Sua rota de atualização é PUT
        headers: {
          'Content-Type': 'application/json' // O Express espera JSON nesta rota
        },
        body: JSON.stringify(dadosPerfil)
      });

      // Garante que a resposta é JSON
      if (!respostaDados.ok) {
        const erroJson = await respostaDados.json().catch(() => ({ message: `Erro HTTP ${respostaDados.status}` }));
        throw new Error("Erro no servidor (Dados): " + erroJson.message);
      }

      const resultadoDados = await respostaDados.json();
      console.log("Atualização de dados concluída:", resultadoDados.message);

      // --- PASSO C: Finalização ---
      alert("Cadastro finalizado com sucesso!");
      window.location.href = "EscolhaEsporte.html";

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

  // Se passar do limite, muda a cor e impede digitação extra
  if (tamanho > limite) {
    contador.style.color = 'red';
    bio.value = bio.value.substring(0, limite); // corta o excesso
    contador.textContent = `${limite}/${limite}`;
  } else {
    contador.style.color = '#777';
  }
});

// === AJUSTE AUTOMÁTICO DO NOME DE USUÁRIO (adiciona @) ===
// (Código original não fornecido, mantendo o comentário)