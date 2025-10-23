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

    const fotoNavbar = document.querySelector(".nav-user-icon img");
    if (fotoNavbar) fotoNavbar.src = foto;


  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
  }
}

// ================== CARREGAR FEED ==================
async function carregarFeed() {
  try {
    const resposta = await fetch("http://localhost:3000/publicacoes");
    if (!resposta.ok) throw new Error('Erro ao buscar publicações');
    const posts = await resposta.json();

    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    posts.forEach(post => {
      const div = document.createElement("div");
      div.classList.add("post");

      const caminhoFoto = post.fotoDePerfil
        ? `http://localhost:3000/uploads/${post.fotoDePerfil}`
        : "imagens/profile.picture.jpg";

      // Cabeçalho do post
      div.innerHTML = `
        <div class="post-header">
          <img class="foto-perfil" src="${caminhoFoto}" alt="Foto de perfil">
          <div class="post-info">
            <strong class="nome">${post.nome || "Usuário sem nome"}</strong>
            <span class="usuario">@${(post.nomeUsuario || "usuario").replace("@", "")}</span>
          </div>
          <div class="post-menu">
            <button class="menu-btn">⋮</button>
            <div class="menu-opcoes">
              <button class="excluir-btn" data-id="${post.IDpublicacao}">Excluir</button>
            </div>
          </div>
        </div>
      `;

      // Mostra/oculta o menu ao clicar nos três pontinhos
      const menuBtn = div.querySelector(".menu-btn");
      const menuOpcoes = div.querySelector(".menu-opcoes");
      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        menuOpcoes.classList.toggle("ativo");
      });
      document.addEventListener("click", () => menuOpcoes.classList.remove("ativo"));

      // Botão de excluir
      const btnExcluir = div.querySelector(".excluir-btn");
      btnExcluir.addEventListener("click", async () => {
        if (confirm("Deseja realmente excluir esta publicação?")) {
          const id = btnExcluir.dataset.id;
          try {
            const resp = await fetch(`http://localhost:3000/publicacoes/${id}`, { method: "DELETE" });
            const resultado = await resp.json();
            if (resultado.success) {
              carregarFeed(); // atualiza o feed
            } else {
              alert("Erro ao excluir publicação.");
            }
          } catch (erro) {
            console.error("Erro ao excluir:", erro);
          }
        }
      });

      // Conteúdo de texto
      const conteudoDiv = document.createElement("div");
      conteudoDiv.classList.add("conteudo");
      conteudoDiv.innerHTML = post.conteudo && post.conteudo !== "null" ? post.conteudo : "";
      div.appendChild(conteudoDiv);

      // Imagem (se existir)
      if (post.imagem) {
        const imagemPath = post.imagem.startsWith("/")
          ? `http://localhost:3000${post.imagem}`
          : `http://localhost:3000/uploads/${post.imagem}`;
        const img = document.createElement("img");
        img.src = imagemPath;
        img.alt = "Imagem do post";
        img.classList.add("post-imagem");
        div.appendChild(img);
      }

     // Data
const dataDiv = document.createElement("div");
dataDiv.classList.add("data");

// Se vier no formato ISO do MySQL, formata para dd/mm/aaaa hh:mm
if (post.data_publicacao) {
  // Garante que sempre tenha hora
  const dataValida = post.data_publicacao.includes("T")
    ? post.data_publicacao
    : `${post.data_publicacao}T00:00:00`;

  const data = new Date(dataValida);

  if (!isNaN(data)) {
    dataDiv.textContent = data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  } else {
    dataDiv.textContent = post.data_publicacao; // fallback se der erro
  }
} else {
  dataDiv.textContent = "";
}


      div.appendChild(dataDiv);
      feed.appendChild(div);
    });
  } catch (erro) {
    console.error("Erro ao carregar o feed:", erro);
  }
}


// ================== BARRA DE PESQUISA ==================
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("resultsDiv");

if (searchInput && resultsDiv) {
  async function fazerBusca() {
    const termo = searchInput.value.trim();
    if (!termo) return;

    try {
      const resposta = await fetch(`http://localhost:3000/search?query=${encodeURIComponent(termo)}`);
      if (!resposta.ok) throw new Error("Erro ao buscar dados");

      const resultados = await resposta.json();
      resultsDiv.innerHTML = "";

      if (resultados.posts.length === 0 && resultados.usuarios.length === 0) {
        resultsDiv.textContent = "Nenhum resultado encontrado.";
        return;
      }

      // Mostrar usuários
      if (resultados.usuarios.length > 0) {
        const tituloUsuarios = document.createElement("h3");
        tituloUsuarios.textContent = "Usuários";
        resultsDiv.appendChild(tituloUsuarios);

        resultados.usuarios.forEach(usuario => {
          const div = document.createElement("div");
          div.classList.add("resultado-usuario");
          div.textContent = `${usuario.nome} (@${usuario.nomeUsuario})`;
          resultsDiv.appendChild(div);
        });
      }

      // Mostrar posts
      if (resultados.posts.length > 0) {
        const tituloPosts = document.createElement("h3");
        tituloPosts.textContent = "Postagens";
        resultsDiv.appendChild(tituloPosts);

        resultados.posts.forEach(post => {
          const div = document.createElement("div");
          div.classList.add("resultado-post");
          div.innerHTML = `<strong>${post.nome || "Usuário sem nome"}</strong>: ${post.conteudo}`;
          resultsDiv.appendChild(div);
        });
      }

    } catch (erro) {
      console.error("Erro ao fazer busca:", erro);
      resultsDiv.textContent = "Erro ao buscar. Tente novamente.";
    }
  }

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      fazerBusca();
    }
  });
}

// ================== UPLOAD DE IMAGEM + CRIAR POST ==================
let imagemSelecionada = null;

document.addEventListener("DOMContentLoaded", () => {
  const btnImagem = document.getElementById("btn-imagem");
  const inputImagem = document.getElementById("input-imagem");
  const preview = document.getElementById("preview-imagem");

  if (btnImagem && inputImagem) {
    btnImagem.addEventListener("click", (e) => {
      e.preventDefault();
      inputImagem.click();
    });

    // Mostrar pré-visualização da imagem
    inputImagem.addEventListener("change", (e) => {
      const arquivo = e.target.files[0];
      if (arquivo) {
        imagemSelecionada = arquivo;
        console.log("Imagem selecionada:", arquivo.name);

        const reader = new FileReader();
        reader.onload = (ev) => {
          if (preview) {
            preview.src = ev.target.result;
            preview.style.display = "block";
          }
        };
        reader.readAsDataURL(arquivo);
      } else {
        if (preview) {
          preview.src = "";
          preview.style.display = "none";
        }
      }
    });
  }
});

async function criarPost() {
  const texto = document.getElementById("post-text").value.trim();
  const cpf = localStorage.getItem("cpf");
  const preview = document.getElementById("preview-imagem"); 

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
      if (preview) {
        preview.src = "";
        preview.style.display = "none";
      }
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

// ================== MENU DE CONFIGURAÇÃO ==================
var configmenu = document.querySelector(".config-menu");
function configuracoesMenuAlter(){
  configmenu.classList.toggle("config-menu-height");
}

// ================== INICIALIZAÇÃO ==================
document.addEventListener("DOMContentLoaded", () => {
  preencherPerfil();
  carregarFeed();
  carregarEsportes();
});