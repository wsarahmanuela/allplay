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
      img.onerror = () => (img.style.display = "none");

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

    if (!resposta.ok || !dados.success) {
      console.error("Erro ao buscar perfil:", dados);
      return;
    }

    const usuario = dados.usuario || {};
    const nome = usuario.nome || "Usuário sem nome";
    const arroba = usuario.nomeUsuario ? `@${usuario.nomeUsuario}` : "@usuario";
    const foto = caminhoFoto(usuario.fotoDePerfil);
    const bio = usuario.bio?.trim() || "Nenhuma biografia adicionada ainda.";

    const fotoPerfil = document.querySelector("#container-meio .usuario-foto img");
    const nomePerfil = document.querySelector("#container-segue .nome h3");
    const arrobaPerfil = document.querySelector("#container-segue .nome h5");
    const bioPerfil = document.getElementById("bio");

    if (fotoPerfil) fotoPerfil.src = foto;
    if (nomePerfil) nomePerfil.textContent = nome;
    if (arrobaPerfil) arrobaPerfil.textContent = arroba;
    if (bioPerfil) bioPerfil.textContent = bio;

    const fotoNavbar = document.querySelector(".nav-user-icon img");
    if (fotoNavbar) fotoNavbar.src = foto;

  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
  }
}

// ===== FEED DE PUBLICAÇÕES DO USUÁRIO =====
async function carregarFeed() {
  const cpf = localStorage.getItem("cpf");
  if (!cpf) {
    console.warn("CPF não encontrado no localStorage");
    return;
  }

  try {
    console.log("Buscando publicações para CPF:", cpf);
    const resposta = await fetch(`http://localhost:3000/publicacoes/${encodeURIComponent(cpf)}`);
    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);

    const dados = await resposta.json();
    console.log("Posts recebidos:", dados);

    const posts = Array.isArray(dados.posts) ? dados.posts : [];
    console.log("Publicações normalizadas:", posts);

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
      `;

      // imagem (se tiver)
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

      const footer = document.createElement("div");
      footer.className = "publicacao-footer";
      footer.innerHTML = `<div class="publicacao-data">${escapeHtml(data)}</div>`;
      card.appendChild(footer);

      postsContainer.appendChild(card);
    });
  } catch (erro) {
    console.error("Erro ao carregar publicações:", erro);
  }
}

// ================== UPLOAD DE IMAGEM + CRIAR POST ==================
let imagemSelecionada = null;

document.addEventListener("DOMContentLoaded", () => {
  const btnImagem = document.getElementById("btn-imagem");
  const inputImagem = document.getElementById("input-imagem");

  if (btnImagem && inputImagem) {
    btnImagem.addEventListener("click", (e) => {
      e.preventDefault();
      inputImagem.click();
    });

    inputImagem.addEventListener("change", (e) => {
      const arquivo = e.target.files[0];
      if (arquivo) {
        imagemSelecionada = arquivo;
        console.log("Imagem selecionada:", arquivo.name);
      }
    });
  }
});

async function criarPost() {
  const texto = document.getElementById("post-text").value.trim();
  const cpf = localStorage.getItem("cpf");

  if (!cpf) {
    alert("Erro: CPF não encontrado. Faça login novamente.");
    return;
  }

  if (!texto && !imagemSelecionada) {
    alert("Escreva algo ou selecione uma imagem para postar.");
    return;
  }

  const formData = new FormData();
  formData.append("autor_CPF", cpf);
  formData.append("conteudo", texto || "");
  if (imagemSelecionada) formData.append("imagem", imagemSelecionada);

  try {
    const resposta = await fetch("http://localhost:3000/publicacoes/imagem", {
      method: "POST",
      body: formData,
    });

    const dados = await resposta.json();
    console.log("Resposta do servidor:", dados);

    if (dados.success) {
      document.getElementById("post-text").value = "";
      document.getElementById("input-imagem").value = "";
      imagemSelecionada = null;
      await carregarFeed();
    } else {
      alert(dados.message || "Erro ao publicar.");
    }
  } catch (erro) {
    console.error("Erro ao criar post:", erro);
    alert("Erro no servidor. Tente novamente.");
  }
}

// ===== inicialização =====
document.addEventListener("DOMContentLoaded", () => {
  preencherPerfil();
  carregarFeed();
  carregarEsportes();
});
