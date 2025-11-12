console.log("perfil.js carregado");

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

// ===== PREENCHER PERFIL =====
async function preencherPerfil() {
  console.log("preencherPerfil() iniciado");
  const cpf = localStorage.getItem("cpf");
  if (!cpf) return console.warn("CPF não encontrado no localStorage");

  try {
    const resposta = await fetch(`http://localhost:3000/usuario/${encodeURIComponent(cpf)}`);
    const dados = await resposta.json();
    if (!resposta.ok || !dados.success) return console.error("Erro ao buscar perfil:", dados);

    const usuario = dados.usuario || {};
    const nome = usuario.nome || "Usuário sem nome";
    const arroba = usuario.nomeUsuario ? `@${usuario.nomeUsuario}` : "@usuario";
    const foto = caminhoFoto(usuario.fotoDePerfil);
    const bio = usuario.bio || "";
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

    // foto da nav
    const fotoNavbar = document.querySelector(".nav-user-icon img");
    if (fotoNavbar) fotoNavbar.src = foto;
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
  }
}
// ===== CARREGAR SEGUIDORES ========
async function carregarSeguidores() { 
  
    
    try {
       const cpf = localStorage.getItem("cpf");
        if (!cpf) {
            throw new Error("CPF não pode ser nulo.");
        }
        const response = await fetch(`/seguidores/${encodeURIComponent(cpf)}`, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(`Falha ao carregar contagem. Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            console.log(" Contagem de seguidores e seguindo recebida com sucesso.");
            
            // Atualize seus elementos HTML:
            document.getElementById('seguidores').innerText ="seguidores\n " +data.seguidores;
            document.getElementById('seguindo').innerText ="seguindo\n " +data.seguindo;
            
        } else {
            throw new Error(data.message || 'Resposta da API incompleta.');
        }

    } catch (erro) {
        console.error("Erro ao carregar seguidores:", erro);
    }
}
// ===== CARREGAR POSTS =====
async function carregarPostsDoUsuario(filtroEsporte = "") {
  const cpf = localStorage.getItem("cpf");
  if (!cpf) return console.warn("CPF não encontrado para carregar posts");

  const container = document.getElementById("container-baixo");
  if (!container) return console.error("#container-baixo não encontrado no DOM");

  try {
    const resp = await fetch(`http://localhost:3000/publicacoes/${encodeURIComponent(cpf)}`);
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

    // filtrar por esporte, se houver
    if (filtroEsporte) {
      posts = posts.filter(p => p.esporte && p.esporte.toLowerCase() === filtroEsporte.toLowerCase());
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

      // menu de excluir se for o dono
      const cpfLogado = localStorage.getItem("cpf");
      if (post.cpf && post.cpf === cpfLogado) {
        const menuHtml = document.createElement("div");
        menuHtml.className = "post-menu";
        menuHtml.innerHTML = `
          <button class="menu-btn">⋮</button>
          <div class="menu-opcoes">
            <button class="excluir-btn" data-id="${post.IDpublicacao}">Excluir</button>
          </div>
        `;
        header.appendChild(menuHtml);

        const menuBtn = menuHtml.querySelector(".menu-btn");
        const menuOpcoes = menuHtml.querySelector(".menu-opcoes");
        menuBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          menuOpcoes.classList.toggle("ativo");
        });
        document.addEventListener("click", () => menuOpcoes.classList.remove("ativo"));

        // excluir post
        menuHtml.querySelector(".excluir-btn").addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          if (!confirm("Deseja realmente excluir esta publicação?")) return;
          try {
            const r = await fetch(`http://localhost:3000/publicacoes/${id}`, { method: "DELETE" });
            const resJson = await r.json();
            if (resJson.success) carregarPostsDoUsuario(filtroEsporte);
            else alert("Erro ao excluir publicação.");
          } catch (err) {
            console.error("Erro ao excluir:", err);
          }
        });
      }

      card.appendChild(header);

      // conteúdo do post
      const conteudoDiv = document.createElement("div");
      conteudoDiv.className = "conteudo";
      conteudoDiv.innerHTML = escapeHtml(conteudo);
      card.appendChild(conteudoDiv);

      // imagem (se houver)
      if (post.imagem) {
        const img = document.createElement("img");
        img.className = "post-imagem";
        img.src = post.imagem.startsWith("http") ? post.imagem : `http://localhost:3000/uploads/${post.imagem}`;
        img.alt = "Imagem do post";
        card.appendChild(img);
      }

      // data
      const dataDiv = document.createElement("div");
      dataDiv.className = "data";
      if (dataRaw) {
        let dataValida = dataRaw;
        if (typeof dataRaw === "string" && dataRaw.includes("/")) {
          const [dataParte, tempoParte = "00:00:00"] = dataRaw.split(" ");
          const [dia, mes, ano] = dataParte.split("/");
          dataValida = `${ano}-${mes}-${dia} ${tempoParte}`;
        } else if (typeof dataRaw === "string" && dataRaw.includes("T")) {
          dataValida = dataRaw.replace("Z", "").replace("T", " ");
        }
        const d = new Date(dataValida);
        dataDiv.textContent = !isNaN(d)
          ? d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
          : dataRaw;
      }
      card.appendChild(dataDiv);

        // === CURTIDAS ===
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
  contador.textContent = "0 ";

  async function atualizarCurtidas() {
    const resp = await fetch(`http://localhost:3000/publicacoes/${post.IDpublicacao}/curtidas`);
    const dados = await resp.json();
    contador.textContent = `${dados.total} curtida${dados.total !== 1 ? "s" : ""}`;
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
    if (resultado.liked) {
      btnCurtir.classList.add("curtido");
    } else {
      btnCurtir.classList.remove("curtido");
    }
    atualizarCurtidas();
  });

  curtidaDiv.appendChild(btnCurtir);
  curtidaDiv.appendChild(contador);
  card.appendChild(curtidaDiv); 
  atualizarCurtidas();

  container.appendChild(card);
});

  } catch (err) {
    console.error("Erro ao carregar posts do usuário:", err);
  }
}

// ===== ESPORTES (LADO ESQUERDO) =====
async function carregarEsportes() {
  const container = document.getElementById("atalhos-esportes");
  if (!container) return console.warn("Elemento #atalhos-esportes não encontrado.");

  const cpf = localStorage.getItem("cpf");
  if (!cpf) {
    container.innerHTML = "<p>CPF não encontrado. Faça login para ver seus esportes.</p>";
    return;
  }

  try {
    const resposta = await fetch(`http://localhost:3000/esportes/${encodeURIComponent(cpf)}`);
    if (!resposta.ok) throw new Error("Erro ao buscar esportes.");
    const esportes = await resposta.json();
    const caminhoImagens = "ImagensEscolhaEsportes/";

    container.innerHTML = "<p>Seus esportes</p>";

    if (!Array.isArray(esportes) || esportes.length === 0) {
      container.insertAdjacentHTML("beforeend", "<p>Você ainda não escolheu esportes.</p>");
      return;
    }

    esportes.forEach(nome => {
      const div = document.createElement("div");
      div.classList.add("esporte-item");
      div.dataset.esporte = nome;

      const nomeArquivo = nome
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "").toLowerCase();

      div.innerHTML = `
        <a href="#" class="atalho-esporte-link">
          <img src="${caminhoImagens}${nomeArquivo.charAt(0).toUpperCase() + nomeArquivo.slice(1)}.png"
               onerror="this.src='imagens/default.png'"
               alt="${escapeHtml(nome)}">
          <span>${escapeHtml(nome)}</span>
        </a>
      `;

      // filtro por esporte
      div.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelectorAll("#atalhos-esportes .atalho-esporte-link").forEach(a => a.classList.remove("ativo"));
        div.querySelector("a").classList.add("ativo");
        carregarPostsDoUsuario(nome);
      });

      container.appendChild(div);
    });
  } catch (erro) {
    console.error("Erro ao carregar esportes:", erro);
    container.innerHTML = `<p>Erro ao carregar seus esportes: ${escapeHtml(erro.message)}</p>`;
  }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", () => {
  preencherPerfil();
  carregarPostsDoUsuario();
  carregarEsportes();
  console.log("perfil inicializado");
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

// =================================================================
// FUNÇÃO DE NAVEGAÇÃO PARA EDIÇÃO DE PERFIL
// =================================================================
function configurarBotaoEditar() {
    const btnEditar = document.getElementById('btn-editar-perfil');
    
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            console.log('Botão Editar Perfil clicado. Redirecionando...');
            window.location.href = 'editPerfil.html'; 
        });
    } else {
        console.warn("Elemento com ID 'btn-editar-perfil' não encontrado. O botão de edição pode estar ausente.");
    }
}
 var configmenu = document.querySelector(".config-menu");
  function configuracoesMenuAlter() {
    configmenu.classList.toggle("config-menu-height");
  }


// ===== inicialização (Tudo que deve rodar ao carregar a página) =====
document.addEventListener("DOMContentLoaded", () => {
    // Chamadas principais
    preencherPerfil();
    //carregarFeed();
    carregarEsportes();
    //carregar Seguidores 
       carregarSeguidores();
    // Chamada do botão de edição
    configurarBotaoEditar(); 
});

