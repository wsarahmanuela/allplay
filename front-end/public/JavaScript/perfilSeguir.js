// Carrega dados do perfil visualizado
async function carregarPerfilSeguir() {
  const perfilVisualizado = localStorage.getItem("perfilVisualizado");
  if (!perfilVisualizado) return;

  try {
    const resposta = await fetch(`http://localhost:3000/usuario/id/${perfilVisualizado}`);
    if (!resposta.ok) throw new Error("Erro ao buscar perfil");

    const dados = await resposta.json();
    if (!dados.success || !dados.usuario) {
      document.body.innerHTML = "<p>Usuário não encontrado.</p>";
      return;
    }

    const usuario = dados.usuario;

    // FOTO do perfil visualizado
    const fotoPerfilEl = document.querySelector(".usuario-foto img");
    if (fotoPerfilEl) {
      fotoPerfilEl.src = usuario.fotoDePerfil
        ? `http://localhost:3000/uploads/${usuario.fotoDePerfil}`
        : "imagens/profile.picture.jpg"; // fallback
    }

    // NOME e USERNAME
    const nomeEl = document.querySelector(".nome h3");
    const nomeUsuarioEl = document.querySelector(".nome h5");
    if (nomeEl) nomeEl.textContent = usuario.nome;
    if (nomeUsuarioEl) nomeUsuarioEl.textContent = `@${usuario.nomeUsuario}`;

    // BIOGRAFIA
    const bioEl = document.getElementById("bio");
    if (bioEl) bioEl.textContent = usuario.biografia || "Biografia não preenchida";

    // CIDADE
    const infosGeralEl = document.querySelector(".infos-geral");
    if (infosGeralEl) {
      infosGeralEl.innerHTML = `
        <p>Cidade: ${usuario.cidade || "Não informada"}</p>
        <div class="biografia">
          <h2>Biografia</h2>
          <p id="bio">${usuario.biografia || "Biografia não preenchida"}</p>
        </div>
      `;
    }

  } catch (erro) {
    console.error("Erro ao carregar perfilSeguir:", erro);
  }
}

// Carrega publicações do perfil visualizado
async function carregarFeedPerfilSeguir() {
  const cpf = localStorage.getItem("perfilVisualizado");
  if (!cpf) return;

  try {
    const resposta = await fetch(`http://localhost:3000/publicacoes/${encodeURIComponent(cpf)}`);
    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);

    const dados = await resposta.json();
    const posts = Array.isArray(dados.posts) ? dados.posts : [];

    const containerBaixo = document.getElementById("container-baixo");
    if (!containerBaixo) return;

    let postsContainer = containerBaixo.querySelector(".publicacoes-container");
    if (!postsContainer) {
      postsContainer = document.createElement("div");
      postsContainer.className = "publicacoes-container";
      postsContainer.style.width = "100%";
      postsContainer.style.boxSizing = "border-box";
      containerBaixo.appendChild(postsContainer);
    }
    postsContainer.innerHTML = "";

    if (posts.length === 0) {
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

      const fotoPath = post.fotoDePerfil
        ? `http://localhost:3000/uploads/${post.fotoDePerfil}`
        : "imagens/profile.picture.jpg";

      const nome = post.nome || "Usuário";
      const username = post.nomeUsuario || "";
      const conteudo = post.conteudo || "";
      const data = post.data_publicacao || "";

      card.innerHTML = `
        <div class="publicacao-header">
          <img src="${fotoPath}" alt="${nome}">
          <div class="publicacao-info">
            <div class="nome">${nome}</div>
            <div class="username">@${username}</div>
          </div>
        </div>
        <div class="publicacao-conteudo">${conteudo}</div>
      `;

      // Imagem do post, se houver
      if (post.imagem) {
        const imagemPath = post.imagem.startsWith("http")
          ? post.imagem
          : `http://localhost:3000/uploads/${post.imagem}`;
        const img = document.createElement("img");
        img.src = imagemPath;
        img.classList.add("post-imagem");
        img.alt = "Imagem do post";
        card.appendChild(img);
      }

      // Data da publicação
      const footer = document.createElement("div");
      footer.className = "publicacao-footer";
      if (data) {
        const dataObj = new Date(data);
        footer.innerHTML = `<div class="publicacao-data">${dataObj.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</div>`;
      }
      card.appendChild(footer);

      postsContainer.appendChild(card);
    });

  } catch (erro) {
    console.error("Erro ao carregar publicações:", erro);
  }
}

 var configmenu = document.querySelector(".config-menu");
  function configuracoesMenuAlter() {
    configmenu.classList.toggle("config-menu-height");
  }

// Carrega perfil e posts ao abrir a página
document.addEventListener("DOMContentLoaded", () => {
  carregarPerfilSeguir();
  carregarFeedPerfilSeguir();
});
