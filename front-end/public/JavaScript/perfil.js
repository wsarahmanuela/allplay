//---------------- MOSTRAR OS ESPORTES --------------------------------
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
    const esportes = Array.isArray(dados) ? dados : dados.esportes || [];
    const caminhoImagens = "ImagensEscolhaEsportes/";

    container.innerHTML = "<p>Seus esportes</p>";

    if (esportes.length === 0) {
      container.insertAdjacentHTML("beforeend", "<p>Você ainda não escolheu esportes.</p>");
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
      img.src = `${caminhoImagens}${nomeArquivo}.png`;
      img.alt = nome;
      img.onerror = () => (img.style.display = "none"); // evita erro 404 travando o carregamento

      a.appendChild(img);
      a.appendChild(document.createTextNode(nome));
      container.appendChild(a);
    });

  } catch (erro) {
    console.error("Erro ao carregar esportes:", erro);
    container.innerHTML = `<p>Erro ao carregar seus esportes: ${erro.message}</p>`;
  }
}

//--------------- FOTO DE PERFIL, NOME E BIO ------------------------
async function preencherPerfil() {
  const cpf = localStorage.getItem("cpf");
  if (!cpf) {
    console.error("CPF não encontrado no localStorage. Faça login novamente.");
    return;
  }

  try {
    const resposta = await fetch(`http://localhost:3000/usuario/${encodeURIComponent(cpf)}`);
    console.log("Status da resposta:", resposta.status);
    const dados = await resposta.json();
    console.log("Dados recebidos do servidor:", dados);

    if (!resposta.ok || !dados.success) {
      console.error("Erro:", dados.message);
      return;
    }

    const usuario = dados.usuario;
    console.log("Bio recebida:", usuario.bio);

    const nome = usuario.nome || "Usuário sem nome";
    const arroba = usuario.nomeUsuario ? `@${usuario.nomeUsuario}` : "@usuario";
    const foto = usuario.fotoDePerfil
      ? `http://localhost:3000/uploads/${usuario.fotoDePerfil}`
      : "imagens/profile.picture.jpg";
    const bio = usuario.bio && usuario.bio.trim() !== "" 
      ? usuario.bio 
      : "Nenhuma biografia adicionada ainda.";

    console.log("Bio final que será exibida:", bio);

    const fotoPerfil = document.querySelector("#container-meio .usuario-foto img");
    const nomePerfil = document.querySelector("#container-segue .nome h3");
    const arrobaPerfil = document.querySelector("#container-segue .nome h5");
    const bioPerfil = document.getElementById("bio");

    console.log("Elemento bio encontrado no DOM:", bioPerfil);

    if (fotoPerfil) fotoPerfil.src = foto;
    if (nomePerfil) nomePerfil.textContent = nome;
    if (arrobaPerfil) arrobaPerfil.textContent = arroba;
    if (bioPerfil) bioPerfil.textContent = bio;
    else console.warn("Elemento com id='bio' não encontrado no HTML!");

  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
  }
}


//--------------- FEED DE PUBLICAÇÕES ------------------------
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
      console.error("Resposta não OK", resposta.status);
      return;
    }

    const posts = await resposta.json();
    console.log("Posts recebidos:", posts);

    const containerBaixo = document.getElementById("container-baixo");
    containerBaixo.innerHTML = "";

    if (!posts || posts.length === 0) {
      containerBaixo.innerHTML = `
        <h2>Ainda não há nenhuma publicação</h2>
        <div class="foto">
          <img src="imagensPerfil/camera.png" alt="Ícone de câmera">
        </div>`;
      return;
    }

    posts.forEach(post => {
      const div = document.createElement("div");
      div.classList.add("post-perfil");

      const data = post.data_publicacao ? post.data_publicacao : "";

      div.innerHTML = `
        <div class="post-header">
          <p>${escapeHtml(post.conteudo)}</p>
          <span class="data">${data}</span>
        </div>`;
      containerBaixo.appendChild(div);
    });

  } catch (erro) {
    console.error("Erro ao carregar publicações:", erro);
  }
}

// Função para evitar injeção de HTML
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ================== INICIALIZAÇÃO ==================
document.addEventListener("DOMContentLoaded", () => {
  preencherPerfil();
  carregarFeed();
  carregarEsportes();
});
