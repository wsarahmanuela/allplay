console.log("perfilseguir.js carregado");

// ===== FUNÇÕES GERAIS =====
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replace(/\n/g, "<br>");
}

function caminhoFoto(fotoDePerfil) {
  if (!fotoDePerfil) return "imagens/profile.picture.jpg";
  if (fotoDePerfil.startsWith("http") || fotoDePerfil.startsWith("/")) return fotoDePerfil;
  return `http://localhost:3000/uploads/${fotoDePerfil}`;
}

function caminhoBanner(banner) {
  if (!banner) return "";
  if (banner.startsWith("http") || banner.startsWith("/")) return banner;
  return `http://localhost:3000/uploads/${banner}`;
}

// ===== PEGAR CPF =====
const params = new URLSearchParams(window.location.search);
let cpfDaUrl = params.get("cpf"); // cpf vindo da URL

// CPF do usuário logado
let cpfLogado = null;
const userLocal = localStorage.getItem("usuarioLogado");
if (userLocal) {
  try {
    const userObj = JSON.parse(userLocal);
    cpfLogado = userObj.cpf || userObj.CPF || null;
  } catch {
    cpfLogado = localStorage.getItem("cpf") || null;
  }
}

let cpfPerfil = null;

if (cpfDaUrl && cpfDaUrl.trim() !== "") {
  cpfPerfil = cpfDaUrl;
  console.log(" Visualizando perfil de OUTRO usuário:", cpfPerfil);
}
else if (cpfLogado) {
  cpfPerfil = cpfLogado;
  console.log(" Visualizando perfil PRÓPRIO:", cpfPerfil);
}

else {
  alert("Erro: Nenhum perfil encontrado!");
  window.location.href = "home.html";
}

// Debug:
console.log("CPF logado:", cpfLogado);
console.log("CPF sendo exibido:", cpfPerfil);

// ===== FUNÇÃO PARA PREENCHER PERFIL =====
async function preencherPerfilVisitado() {
  try {
    const resposta = await fetch(`http://localhost:3000/usuario/${encodeURIComponent(cpfPerfil)}`);
    const dados = await resposta.json();

    if (!resposta.ok || !dados.success) {
      console.error("Erro ao buscar perfil:", dados);
      return;
    }

    const usuario = dados.usuario || {};
    const nome = usuario.nome || "Usuário sem nome";
    const arroba = usuario.nomeUsuario ? `@${usuario.nomeUsuario}` : "@usuario";
    const foto = caminhoFoto(usuario.fotoDePerfil);
    const bio = usuario.bio || usuario.biografia || "";
    const bannerPath = caminhoBanner(usuario.banner || usuario.bannerURL);

    const fotoElem = document.querySelector("#container-meio .usuario-foto img");
    const nomeH3 = document.querySelector("#container-segue .nome h3");
    const arrobaH5 = document.querySelector("#container-segue .nome h5");
    const bioElem = document.getElementById("bio");
    const bannerElem = document.getElementById("banner-perfil");

    if (fotoElem) fotoElem.src = foto;
    if (nomeH3) nomeH3.textContent = nome;
    if (arrobaH5) arrobaH5.textContent = arroba;
    if (bioElem) bioElem.textContent = bio;

    if (bannerElem) {
      if (bannerPath) {
        bannerElem.style.backgroundImage = `url(${bannerPath})`;
        bannerElem.style.backgroundSize = "cover";
        bannerElem.style.backgroundPosition = "center";
      } else {
        bannerElem.style.backgroundImage = "none";
      }
    }

    console.log(" Perfil carregado com sucesso:", nome);
  } catch (err) {
    console.error("Erro ao carregar perfil visitado:", err);
  }
}

// ===== CARREGAR POSTS DO PERFIL =====
async function carregarPostsVisitado() {
  const container = document.getElementById("container-baixo");
  if (!container) return console.error("#container-baixo não encontrado no DOM");

  try {
    const resp = await fetch(`http://localhost:3000/publicacoes/${encodeURIComponent(cpfPerfil)}`);
    if (!resp.ok) throw new Error("Erro ao buscar publicações");
    const dados = await resp.json();

    let posts = [];
    if (Array.isArray(dados)) posts = dados;
    else if (Array.isArray(dados.posts)) posts = dados.posts;

    container.innerHTML = "";

    if (posts.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px; color:#666;">
          <h3 style="margin-bottom:8px">Ainda não há nenhuma publicação</h3>
          <img src="imagensPerfil/camera.png" alt="Ícone de câmera" style="width:120px; opacity:0.7">
        </div>`;
      return;
    }

    posts.forEach(post => {
      const card = document.createElement("div");
      card.className = "post";

      const fotoPath = caminhoFoto(post.fotoDePerfil);
      const nome = post.nome || "Usuário";
      const username = post.nomeUsuario || "";
      const conteudo = post.conteudo && post.conteudo !== "null" ? post.conteudo : "";
      const dataRaw = post.data_publicacao || post.data || "";

      const header = document.createElement("div");
      header.className = "post-header";
      header.innerHTML = `
        <img class="foto-perfil" src="${escapeHtml(fotoPath)}" alt="${escapeHtml(nome)}">
        <div class="post-info">
          <strong class="nome">${escapeHtml(nome)}</strong>
          <span class="usuario">@${escapeHtml(username).replace("@", "")}</span>
        </div>
      `;
      card.appendChild(header);

      const conteudoDiv = document.createElement("div");
      conteudoDiv.className = "conteudo";
      conteudoDiv.innerHTML = escapeHtml(conteudo);
      card.appendChild(conteudoDiv);

      if (post.imagem) {
        const img = document.createElement("img");
        img.className = "post-imagem";
        img.src = post.imagem.startsWith("http")
          ? post.imagem
          : `http://localhost:3000/uploads/${post.imagem}`;
        img.alt = "Imagem do post";
        card.appendChild(img);
      }

      const dataDiv = document.createElement("div");
      dataDiv.className = "data";
      if (dataRaw) {
        let dataValida = dataRaw.replace("Z", "").replace("T", " ");
        const d = new Date(dataValida);
        dataDiv.textContent = !isNaN(d)
          ? d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
          : dataRaw;
      }
      card.appendChild(dataDiv);

      container.appendChild(card);
    });

    console.log(` ${posts.length} publicações carregadas para CPF ${cpfPerfil}`);
  } catch (err) {
    console.error("Erro ao carregar posts do perfil visitado:", err);
  }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", () => {
  console.log("Inicializando perfilseguir...");
  console.log("CPF da URL:", cpfDaUrl);
  console.log("CPF logado:", cpfLogado);
  console.log("CPF sendo usado:", cpfPerfil);
  preencherPerfilVisitado();
  carregarPostsVisitado();
});
