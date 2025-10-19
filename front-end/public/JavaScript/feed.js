// ================== CRIAR POST ==================
async function criarPost() {
  console.log("Função criarPost chamada");

  const texto = document.getElementById("post-text").value.trim();
  if (!texto) return; // não posta vazio

  const cpf = localStorage.getItem("cpf");
  if (!cpf) {
    alert("Erro: CPF não encontrado. Faça login novamente.");
    return;
  }

  const novoPost = {
    autor_CPF: cpf,
    conteudo: texto
  };

  try {
    const resposta = await fetch("http://localhost:3000/publicacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoPost)
    });

    const dados = await resposta.json();
    console.log("Resposta do POST:", dados);

    if (dados.success) {
      document.getElementById("post-text").value = "";
      await carregarFeed(); // recarrega o feed para mostrar o novo post
    } else {
      alert(dados.message || "Erro ao publicar.");
    }
  } catch (erro) {
    console.error("Erro ao criar post:", erro);
    alert("Erro no servidor. Tente novamente.");
  }
}

// ================== CARREGAR FEED ==================
async function carregarFeed() {
  console.log("Função carregarFeed chamada");

  try {
    const resposta = await fetch("http://localhost:3000/publicacoes");
    const posts = await resposta.json();

    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    posts.forEach(post => {
      const div = document.createElement("div");
      div.classList.add("post");

      const caminhoFoto = post.fotoDePerfil
        ? `http://localhost:3000/uploads/${post.fotoDePerfil}`
        : "imagens/profile.picture.jpg";

      div.innerHTML = `
        <div class="post-header">
          <img class="foto-perfil" src="${caminhoFoto}" alt="Foto de perfil">
          <div class="post-info">
            <strong class="nome">${post.nome || "Usuário sem nome"}</strong>
            <span class="usuario">@${(post.nomeUsuario || "usuario").replace("@", "")}</span>
          </div>
        </div>
        <div class="conteudo">${post.conteudo}</div>
        <div class="data">${post.data_publicacao || ""}</div>
      `;

      feed.appendChild(div);
    });

  } catch (erro) {
    console.error("Erro ao carregar o feed:", erro);
  }
}

// ================== PREENCHER PERFIL ==================
async function preencherPerfil() {
  const cpf = localStorage.getItem("cpf");
  if (!cpf) return;

  try {
    const resposta = await fetch(`http://localhost:3000/usuario/${cpf}`);
    const dados = await resposta.json();

    if (!dados.success) {
      console.error("Erro:", dados.message);
      return;
    }

    const usuario = dados.usuario;
    const nome = usuario.nome || "Usuário sem nome";
    const arroba = usuario.nomeUsuario ? `@${usuario.nomeUsuario}` : "@usuario";
    const foto = usuario.fotoDePerfil
      ? `http://localhost:3000/uploads/${usuario.fotoDePerfil}`
      : "imagens/profile.picture.jpg";

    const nomeTopo = document.getElementById("nomeUsuarioFeed");
    const arrobaTopo = document.getElementById("arrobaFeed");
    const fotoTopo = document.getElementById("fotoPerfilFeed");

    if (nomeTopo) nomeTopo.textContent = nome;
    if (arrobaTopo) arrobaTopo.textContent = arroba;
    if (fotoTopo) fotoTopo.src = foto;

    const nomePostar = document.getElementById("nomeUsuarioPost");
    const fotoPostar = document.getElementById("fotoUsuarioPost");

    if (nomePostar) nomePostar.textContent = nome;
    if (fotoPostar) fotoPostar.src = foto;

    const nomeTela = document.getElementById("nome_usuario");
    if (nomeTela) nomeTela.textContent = nome;

  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
  }
}

// ================== MOSTRAR ESPORTES ==================
async function carregarEsportes() {
  const container = document.getElementById("atalhos-esportes");
  if (!container) return;

  const cpf = localStorage.getItem("cpf");
  if (!cpf) return;

  try {
    const resposta = await fetch(`http://localhost:3000/esportes/${cpf}`);
    const esportes = await resposta.json();

    const caminhoImagens = "ImagensEscolhaEsportes/";
    container.innerHTML = "<p>Seus esportes</p>";

    if (esportes.length === 0) {
      container.innerHTML += "<p>Você ainda não escolheu esportes.</p>";
      return;
    }

    esportes.forEach(nome => {
      const a = document.createElement("a");
      a.href = "#";

      const nomeArquivo = nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .toLowerCase();

      const img = document.createElement("img");
      img.src = `${caminhoImagens}${nomeArquivo.charAt(0).toUpperCase() + nomeArquivo.slice(1)}.png`;
      img.alt = nome;

      a.appendChild(img);
      a.appendChild(document.createTextNode(nome));
      container.appendChild(a);
    });
  } catch (erro) {
    console.error("Erro ao carregar esportes:", erro);
  }
}

// ================== INICIALIZAÇÃO ==================
document.addEventListener("DOMContentLoaded", () => {
  preencherPerfil();
  carregarFeed();
  carregarEsportes();
});
