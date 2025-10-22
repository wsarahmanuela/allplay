// perfil.js completo

// ===== util =====
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replace(/\n/g, "<br>"); // preserva quebras de linha
}

// retorna caminho correto da foto de perfil (ajuste conforme necessário)
function caminhoFoto(fotoDePerfil) {
  if (!fotoDePerfil) return "imagens/profile.picture.jpg";
  if (fotoDePerfil.startsWith("http") || fotoDePerfil.startsWith("/")) return fotoDePerfil;
  // assume que backend salva só o filename e expõe em /uploads
  return `/uploads/${fotoDePerfil}`;
}

// ===== ESCOLHA DE ESPORTES =====
async function carregarEsportes() {
  const container = document.getElementById("atalhos-esportes");
  if (!container) return;

  const cpf = localStorage.getItem("cpf");
  if (!cpf) {
    container.innerHTML = "<p>CPF não encontrado. Faça login novamente.</p>";
    return;
  }

  try {
    const resposta = await fetch(`http://localhost:3000/esportes/${encodeURIComponent(cpf)}`);
    if (!resposta.ok) throw new Error("Erro ao buscar esportes.");

    const dados = await resposta.json();
    const esportes = Array.isArray(dados) ? dados : (dados.esportes || []);
    const caminhoImagens = "ImagensEscolhaEsportes/";

    container.innerHTML = "<p>Seus esportes</p>";

    if (esportes.length === 0) {
      container.insertAdjacentHTML("beforeend", "<p>Você ainda não escolheu esportes.</p>");
      return;
    }

    esportes.forEach(nome => {
      const a = document.createElement("a");
      a.href = "#";
      a.style.display = "flex";
      a.style.alignItems = "center";
      a.style.gap = "8px";
      a.style.marginBottom = "12px";

      const nomeArquivo = nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .toLowerCase();

      const img = document.createElement("img");
      img.src = `${caminhoImagens}${nomeArquivo}.png`;
      img.alt = nome;
      img.style.width = "30px";
      img.onerror = () => (img.style.display = "none"); // evita erro 404 travando

      const texto = document.createElement("span");
      texto.textContent = nome;

      a.appendChild(img);
      a.appendChild(texto);
      container.appendChild(a);
    });

  } catch (erro) {
    console.error("Erro ao carregar esportes:", erro);
    container.innerHTML = `<p>Erro ao carregar seus esportes: ${escapeHtml(erro.message || String(erro))}</p>`;
  }
}

// ===== FOTO DE PERFIL, NOME E BIO =====
async function preencherPerfil() {
  const cpf = localStorage.getItem("cpf");
  if (!cpf) {
    console.error("CPF não encontrado no localStorage. Faça login novamente.");
    return;
  }

  try {
    const resposta = await fetch(`http://localhost:3000/usuario/${encodeURIComponent(cpf)}`);
    console.log("Status da resposta (perfil):", resposta.status);
    const dados = await resposta.json();
    console.log("Dados recebidos do servidor (perfil):", dados);

    if (!resposta.ok) {
      console.error("Erro HTTP ao buscar perfil:", resposta.status);
      return;
    }

    if (!dados || !dados.success) {
      console.error("Erro nos dados do perfil:", dados && dados.message ? dados.message : dados);
      return;
    }

    const usuario = dados.usuario || {};
    const nome = usuario.nome || "Usuário sem nome";
    const arroba = usuario.nomeUsuario ? `@${usuario.nomeUsuario}` : "@usuario";
    const foto = caminhoFoto(usuario.fotoDePerfil);
    const bio = (usuario.bio && usuario.bio.trim() !== "") ? usuario.bio : "Nenhuma biografia adicionada ainda.";

    const fotoPerfil = document.querySelector("#container-meio .usuario-foto img");
    const nomePerfil = document.querySelector("#container-segue .nome h3");
    const arrobaPerfil = document.querySelector("#container-segue .nome h5");
    const bioPerfil = document.getElementById("bio");

    if (fotoPerfil) fotoPerfil.src = foto;
    if (nomePerfil) nomePerfil.textContent = nome;
    if (arrobaPerfil) arrobaPerfil.textContent = arroba;
    if (bioPerfil) bioPerfil.textContent = bio;

  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
  }
}

// ===== FEED DE PUBLICAÇÕES (perfil) =====
async function carregarFeed() {
  const cpf = localStorage.getItem("cpf");
  if (!cpf) {
    console.warn("CPF não encontrado no localStorage");
    return;
  }

  try {
    console.log("Buscando publicações para CPF:", cpf);
    const resposta = await fetch(`http://localhost:3000/publicacoes/${encodeURIComponent(cpf)}`);
if (!resposta.ok) {
  console.error("Resposta não OK ao buscar publicações", resposta.status);
  return;
}
let dados = await resposta.json();
console.log("Posts recebidos:", dados);

// Corrige estrutura para pegar os posts do backend
let posts = [];

if (Array.isArray(dados)) {
  posts = dados;
} else if (dados && Array.isArray(dados.posts)) {
  posts = dados.posts;
} else if (dados && dados.success && typeof dados === "object") {
  posts = dados.posts || [];
} else {
  console.warn("Formato inesperado de resposta do backend:", dados);
  posts = [];
}


    const containerBaixo = document.getElementById("container-baixo");
    if (!containerBaixo) {
      console.error("Elemento #container-baixo não encontrado no DOM.");
      return;
    }

    let postsContainer = containerBaixo.querySelector(".publicacoes-container");
    if (!postsContainer) {
      postsContainer = document.createElement("div");
      postsContainer.className = "publicacoes-container";
      postsContainer.style.width = "100%";
      postsContainer.style.boxSizing = "border-box";
      containerBaixo.appendChild(postsContainer);
    } else {
      postsContainer.innerHTML = "";
    }

    if (!Array.isArray(posts) || posts.length === 0) {
      postsContainer.innerHTML = `
        <div style="text-align:center; padding:40px; color:#666;">
          <h3 style="margin-bottom:8px">Ainda não há nenhuma publicação</h3>
          <img src="imagensPerfil/camera.png" alt="Ícone de câmera" style="width:120px; opacity:0.7">
        </div>
      `;
      return;
    }

    posts.forEach(post => {
      const card = document.createElement("div");
      card.className = "publicacao-card";

      const fotoPath = caminhoFoto(post.fotoDePerfil);

      const nome = post.nome || "Usuário";
      const username = post.nomeUsuario || "";
      const conteudo = post.conteudo || "";
      const data = post.data_publicacao || "";

      card.innerHTML = `
        <div class="publicacao-header">
          <img src="${escapeHtml(fotoPath)}" alt="${escapeHtml(nome)}">
          <div class="publicacao-info">
            <div class="nome">${escapeHtml(nome)}</div>
            <div class="username">@${escapeHtml(username)}</div>
          </div>
        </div>
        <div class="publicacao-conteudo">${escapeHtml(conteudo)}</div>
        <div class="publicacao-footer">
          <div></div>
          <div class="publicacao-data">${escapeHtml(data)}</div>
        </div>
      `;

      postsContainer.appendChild(card);
    });

  } catch (erro) {
    console.error("Erro ao carregar publicações:", erro);
  }
}

// ===== inicialização =====
document.addEventListener("DOMContentLoaded", () => {
  preencherPerfil();
  carregarFeed();
  carregarEsportes();
});
