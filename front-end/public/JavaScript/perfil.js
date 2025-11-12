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

// 🔥 FUNÇÃO NOVA: Pega o CPF correto (URL ou localStorage)
function obterCPFDaPagina() {
  const urlParams = new URLSearchParams(window.location.search);
  const cpfDaURL = urlParams.get('cpf');
  return cpfDaURL || localStorage.getItem("cpf");
}

// 🔥 FUNÇÃO NOVA: Verifica se é o próprio perfil
function ehPerfilProprio() {
  const cpfDaPagina = obterCPFDaPagina();
  const cpfLogado = localStorage.getItem("cpf");
  return cpfDaPagina === cpfLogado;
}

// ===== PREENCHER PERFIL (CORRIGIDO) =====
async function preencherPerfil() {
  console.log("preencherPerfil() iniciado");
  
  // 🔥 CORREÇÃO: Pega CPF da URL ou localStorage
  const cpf = obterCPFDaPagina();
  
  if (!cpf) return console.warn("CPF não encontrado");

  console.log("🔍 Carregando perfil do CPF:", cpf);

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

    // 🔥 NOVO: Esconde botão "Editar" se NÃO for seu perfil
    const btnEditar = document.getElementById('btn-editar-perfil');
    if (btnEditar) {
      if (ehPerfilProprio()) {
        btnEditar.style.display = 'block';
      } else {
        btnEditar.style.display = 'none';
      }
    }

  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
  }
}

// ===== CARREGAR POSTS (CORRIGIDO) =====
async function carregarPostsDoUsuario(filtroEsporte = "") {
  // 🔥 CORREÇÃO: Pega CPF da URL ou localStorage
  const cpf = obterCPFDaPagina();
  
  if (!cpf) return console.warn("CPF não encontrado para carregar posts");

  console.log("📝 Carregando posts do CPF:", cpf);

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

    const cpfLogado = localStorage.getItem("cpf");

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

      // Função utilitária: converte vários formatos para um Date local seguro
      function parseDateToLocal(input) {
        if (!input) return null;
        if (input instanceof Date) return input;
        if (!isNaN(Number(input))) return new Date(Number(input));

        const s = String(input).trim();

        // formato dd/mm/yyyy [HH:MM:SS]
        if (s.includes("/") && s.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
          const [dataParte, tempoParte = "00:00:00"] = s.split(" ");
          const [dia, mes, ano] = dataParte.split("/").map(n => parseInt(n, 10));
          const [hh = "0", mm = "0", ss = "0"] = tempoParte.split(":");
          return new Date(ano, mes - 1, dia, parseInt(hh, 10), parseInt(mm, 10), parseInt(ss, 10));
        }

        // formato ISO com T
        if (s.includes("T")) {
          try {
            return new Date(s);
          } catch (e) {
            // continua abaixo
          }
        }

        // formato yyyy-mm-dd HH:MM:SS
        if (s.match(/^\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{2}(:\d{2})?/)) {
          const [dataParte, tempoParte = "00:00:00"] = s.split(" ");
          const [ano, mes, dia] = dataParte.split("-").map(n => parseInt(n, 10));
          const [hh = "0", mm = "0", ss = "0"] = tempoParte.split(":");
          return new Date(ano, mes - 1, dia, parseInt(hh, 10), parseInt(mm, 10), parseInt(ss, 10));
        }

        const tentativa = new Date(s);
        if (!isNaN(tentativa)) return tentativa;

        return null;
      }

      // data
      const dataDiv = document.createElement("div");
      dataDiv.className = "data";
      if (dataRaw) {
        const d = parseDateToLocal(dataRaw);
        if (d && !isNaN(d.getTime())) {
          dataDiv.textContent = d.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
        } else {
          dataDiv.textContent = dataRaw;
        }
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
      contador.textContent = "0 curtidas";

      async function atualizarCurtidas() {
        try {
          const resp = await fetch(`http://localhost:3000/publicacoes/${post.IDpublicacao}/curtidas`);
          const dados = await resp.json();
          contador.textContent = `${dados.total} curtida${dados.total !== 1 ? "s" : ""}`;
        } catch (erro) {
          console.error("Erro ao atualizar curtidas:", erro);
        }
      }

      async function verificarCurtidaUsuario() {
        try {
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
        } catch (erro) {
          console.error("Erro ao verificar curtida:", erro);
        }
      }

      btnCurtir.addEventListener("click", async () => {
        try {
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
        } catch (erro) {
          console.error("Erro ao curtir:", erro);
        }
      });

      curtidaDiv.appendChild(btnCurtir);
      curtidaDiv.appendChild(contador);
      card.appendChild(curtidaDiv);
      container.appendChild(card);

      setTimeout(async () => {
        try {
          await atualizarCurtidas();
          await verificarCurtidaUsuario();
        } catch (erro) {
          console.error("Erro ao inicializar curtidas:", erro);
        }
      }, 100);
    }); 
  } catch (err) {
    console.error("Erro ao carregar posts do usuário:", err);
  }
}

// ===== ESPORTES (CORRIGIDO) =====
async function carregarEsportes() {
  const container = document.getElementById("atalhos-esportes");
  if (!container) return console.warn("Elemento #atalhos-esportes não encontrado.");

  // 🔥 CORREÇÃO: Pega CPF da URL ou localStorage
  const cpf = obterCPFDaPagina();
  
  if (!cpf) {
    container.innerHTML = "<p>CPF não encontrado. Faça login para ver seus esportes.</p>";
    return;
  }

  try {
    const resposta = await fetch(`http://localhost:3000/esportes/${encodeURIComponent(cpf)}`);
    if (!resposta.ok) throw new Error("Erro ao buscar esportes.");
    const esportes = await resposta.json();
    const caminhoImagens = "ImagensEscolhaEsportes/";

    // 🔥 NOVO: Muda título se for perfil de outra pessoa
    const titulo = ehPerfilProprio() ? "Seus esportes" : "Esportes";
    container.innerHTML = `<p>${titulo}</p>`;

    if (!Array.isArray(esportes) || esportes.length === 0) {
      const msg = ehPerfilProprio() 
        ? "Você ainda não escolheu esportes." 
        : "Este usuário ainda não escolheu esportes.";
      container.insertAdjacentHTML("beforeend", `<p>${msg}</p>`);
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
    container.innerHTML = `<p>Erro ao carregar esportes: ${escapeHtml(erro.message)}</p>`;
  }
}

// ===== CRIAR POST (mantém como está, só posta no seu perfil) =====
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
      await carregarPostsDoUsuario();
    } else {
      alert(dados.message || "Erro ao publicar.");
    }
  } catch (erro) {
    console.error("Erro ao criar post:", erro);
    alert("Erro no servidor. Tente novamente.");
  }
}

// ===== BOTÃO EDITAR =====
function configurarBotaoEditar() {
  const btnEditar = document.getElementById('btn-editar-perfil');
  
  if (btnEditar) {
    btnEditar.addEventListener('click', () => {
      console.log('Botão Editar Perfil clicado. Redirecionando...');
      window.location.href = 'editPerfil.html'; 
    });
  } else {
    console.warn("Elemento com ID 'btn-editar-perfil' não encontrado.");
  }
}

var configmenu = document.querySelector(".config-menu");
function configuracoesMenuAlter() {
  configmenu.classList.toggle("config-menu-height");
}

// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", () => {
  preencherPerfil();
  carregarPostsDoUsuario();
  carregarEsportes();
  configurarBotaoEditar(); 
  console.log("perfil inicializado");
});