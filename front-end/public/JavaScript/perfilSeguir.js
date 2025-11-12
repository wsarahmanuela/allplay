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

// ===== CAPTURA CPF DO PERFIL VISUALIZADO =====
const cpfLogado = localStorage.getItem("cpf");
const perfilVisualizado = localStorage.getItem("perfilVisualizado"); 
// ou: const cpfVisitado = new URLSearchParams(window.location.search).get("usuario");

if (!perfilVisualizado) {
  alert("Erro: Nenhum perfil selecionado!");
  window.location.href = "home.html";
}

// ===== PREENCHER PERFIL DO OUTRO USUÁRIO =====
async function preencherPerfilVisitado() {
  try {
    const resposta = await fetch(`http://localhost:3000/usuario/${encodeURIComponent(perfilVisualizado)}`);
    const dados = await resposta.json();
    if (!resposta.ok || !dados.success) return console.error("Erro ao buscar perfil:", dados);

    const usuario = dados.usuario || {};
    const nome = usuario.nome || "Usuário sem nome";
    const arroba = usuario.nomeUsuario ? `@${usuario.nomeUsuario}` : "@usuario";
    const foto = caminhoFoto(usuario.fotoDePerfil);
    const bio = usuario.bio || usuario.biografia || "";
    const bannerPath = caminhoBanner(usuario.banner || usuario.bannerURL);

    // aplica no HTML
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

  } catch (err) {
    console.error("Erro ao carregar perfil visitado:", err);
  }
}

// ===== CARREGAR POSTS DO OUTRO USUÁRIO =====
async function carregarPostsVisitado() {
  const container = document.getElementById("container-baixo");
  if (!container) return console.error("#container-baixo não encontrado no DOM");

  try {
    const resp = await fetch(`http://localhost:3000/publicacoes/${encodeURIComponent(perfilVisualizado)}`);
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

      // Header
      const header = document.createElement("div");
      header.className = "post-header";
      header.innerHTML = `
        <img class="foto-perfil" src="${escapeHtml(fotoPath)}" alt="${escapeHtml(nome)}">
        <div class="post-info">
          <strong class="nome">${escapeHtml(nome)}</strong>
          <span class="usuario">@${escapeHtml(username).replace("@","")}</span>
        </div>
      `;

      // (sem menu de excluir, pois é outro perfil)
      card.appendChild(header);

      // Conteúdo
      const conteudoDiv = document.createElement("div");
      conteudoDiv.className = "conteudo";
      conteudoDiv.innerHTML = escapeHtml(conteudo);
      card.appendChild(conteudoDiv);

      // Imagem
      if (post.imagem) {
        const img = document.createElement("img");
        img.className = "post-imagem";
        img.src = post.imagem.startsWith("http") ? post.imagem : `http://localhost:3000/uploads/${post.imagem}`;
        img.alt = "Imagem do post";
        card.appendChild(img);
      }

      // Data
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

      // Curtidas
      const curtidaDiv = document.createElement("div");
      curtidaDiv.classList.add("curtidas");

      const btnCurtir = document.createElement("button");
      btnCurtir.classList.add("btn-curtir");
      btnCurtir.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" class="icone-coracao">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>
        </svg>
      `;

      const contador = document.createElement("span");
      contador.classList.add("contador-curtidas");
      contador.textContent = "0 curtidas";

      async function atualizarCurtidas() {
        const resp = await fetch(`http://localhost:3000/publicacoes/${post.IDpublicacao}/curtidas`);
        const dados = await resp.json();
        contador.textContent = `${dados.total} curtida${dados.total !== 1 ? "s" : ""}`;
      }

      async function verificarCurtidaUsuario() {
        const resp = await fetch(
          `http://localhost:3000/publicacoes/${post.IDpublicacao}/verificar-curtida?cpf=${cpfLogado}`
        );
        const dados = await resp.json();
        const icone = btnCurtir.querySelector(".icone-coracao path");
        if (dados.jaCurtiu) {
          btnCurtir.classList.add("curtido");
          icone.setAttribute("fill", "red");
        } else {
          btnCurtir.classList.remove("curtido");
          icone.setAttribute("fill", "none");
        }
      }

      btnCurtir.addEventListener("click", async () => {
        const resp = await fetch("http://localhost:3000/publicacoes/curtir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicacao_ID: post.IDpublicacao,
            usuario_cpf: cpfLogado,
          }),
        });
        const resultado = await resp.json();
        const icone = btnCurtir.querySelector(".icone-coracao path");
        if (resultado.liked) {
          btnCurtir.classList.add("curtido");
          icone.setAttribute("fill", "red");
        } else {
          btnCurtir.classList.remove("curtido");
          icone.setAttribute("fill", "none");
        }
        await atualizarCurtidas();
      });

      curtidaDiv.appendChild(btnCurtir);
      curtidaDiv.appendChild(contador);
      card.appendChild(curtidaDiv);
      container.appendChild(card);

      setTimeout(async () => {
        await atualizarCurtidas();
        await verificarCurtidaUsuario();
      }, 100);
    });
  } catch (err) {
    console.error("Erro ao carregar posts do perfil visitado:", err);
  }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", () => {
  preencherPerfilVisitado();
  carregarPostsVisitado();
  console.log("perfilseguir inicializado");
});
