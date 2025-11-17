console.log("perfil.js carregado");

// ======================= CONFIGURAÇÕES =======================
const BASE_URL = 'http://localhost:3000';

// ======================= FUNÇÕES UTILITÁRIAS =======================
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
  return `${BASE_URL}/uploads/${fotoDePerfil}`;
}

function caminhoBanner(banner) {
  if (!banner) return "";
  if (banner.startsWith("http") || banner.startsWith("/")) return banner;
  return `${BASE_URL}/uploads/${banner}`;
}

function parseDateToLocal(input) {
  if (!input) return null;
  if (input instanceof Date) return input;
  
  // Timestamp
  if (!isNaN(Number(input))) return new Date(Number(input));
  
  const s = String(input).trim();
  
  // Formato dd/mm/yyyy [HH:MM:SS]
  if (s.includes("/") && s.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
    const [dataParte, tempoParte = "00:00:00"] = s.split(" ");
    const [dia, mes, ano] = dataParte.split("/").map(n => parseInt(n, 10));
    const [hh = "0", mm = "0", ss = "0"] = tempoParte.split(":");
    return new Date(ano, mes - 1, dia, parseInt(hh, 10), parseInt(mm, 10), parseInt(ss, 10));
  }
  
  // Formato ISO com T
  if (s.includes("T")) {
    try {
      return new Date(s);
    } catch (e) {
      // fallback
    }
  }
  
  // Formato yyyy-mm-dd HH:MM:SS
  if (s.match(/^\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{2}(:\d{2})?/)) {
    const [dataParte, tempoParte = "00:00:00"] = s.split(" ");
    const [ano, mes, dia] = dataParte.split("-").map(n => parseInt(n, 10));
    const [hh = "0", mm = "0", ss = "0"] = tempoParte.split(":");
    return new Date(ano, mes - 1, dia, parseInt(hh, 10), parseInt(mm, 10), parseInt(ss, 10));
  }
  
  // Tentativa genérica
  const tentativa = new Date(s);
  if (!isNaN(tentativa)) return tentativa;
  
  return null;
}

// 🔥 NOVA FUNÇÃO: Obtém CPF da URL ou localStorage
function obterCPFDaPagina() {
  // Tenta pegar CPF da URL (?cpf=123456789)
  const urlParams = new URLSearchParams(window.location.search);
  const cpfUrl = urlParams.get('cpf');
  
  if (cpfUrl) {
    console.log("CPF obtido da URL:", cpfUrl);
    return cpfUrl;
  }
  
  // Se não houver na URL, pega do localStorage (perfil próprio)
  const cpfLocal = localStorage.getItem('cpf');
  console.log("CPF obtido do localStorage:", cpfLocal);
  return cpfLocal;
}

// 🔥 NOVA FUNÇÃO: Verifica se é o perfil do usuário logado
function ehPerfilProprio() {
  const cpfPagina = obterCPFDaPagina();
  const cpfLogado = localStorage.getItem('cpf');
  return cpfPagina === cpfLogado;
}

// ======================= PERFIL DO USUÁRIO =======================
async function preencherPerfil() {
  console.log("preencherPerfil() iniciado");
  
  const cpf = obterCPFDaPagina();
  
  if (!cpf) return console.warn("CPF não encontrado");

  console.log("🔍 Carregando perfil do CPF:", cpf);

  try {
    const resposta = await fetch(`${BASE_URL}/usuario/${encodeURIComponent(cpf)}`);
    const dados = await resposta.json();
    if (!resposta.ok || !dados.success) return console.error("Erro ao buscar perfil:", dados);

    const usuario = dados.usuario || {};
    const nome = usuario.nome || "Usuário sem nome";
    const arroba = usuario.nomeUsuario ? `@${usuario.nomeUsuario}` : "@usuario";
    const foto = caminhoFoto(usuario.fotoDePerfil);
    const bio = usuario.bio || "";
    const bannerPath = caminhoBanner(usuario.banner || usuario.bannerURL);

    // Aplica no HTML
    const fotoElem = document.querySelector("#container-meio .usuario-foto img");
    const nomeH3 = document.querySelector("#container-segue .nome h3");
    const arrobaH5 = document.querySelector("#container-segue .nome h5");
    const bioElem = document.getElementById("bio");
    const bannerElem = document.getElementById("banner-perfil");
    const fotoNavbar = document.querySelector(".nav-user-icon img");

    if (fotoElem) fotoElem.src = foto;
    if (nomeH3) nomeH3.textContent = nome;
    if (arrobaH5) arrobaH5.textContent = arroba;
    if (bioElem) bioElem.textContent = bio;
    if (fotoNavbar) fotoNavbar.src = foto;

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
    console.error("Erro ao carregar perfil:", err);
  }
}
//======================= BOATO DE EDITAR==============

// ======================= CURTIDAS =======================
function criarSistemaCurtidas(post, card, cpfLogado) {
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
      const resp = await fetch(`${BASE_URL}/publicacoes/${post.IDpublicacao}/curtidas`);
      const dados = await resp.json();
      contador.textContent = `${dados.total} curtida${dados.total !== 1 ? "s" : ""}`;
    } catch (erro) {
      console.error("Erro ao atualizar curtidas:", erro);
    }
  }

  async function verificarCurtidaUsuario() {
    try {
      const resp = await fetch(
        `${BASE_URL}/publicacoes/${post.IDpublicacao}/verificar-curtida?cpf=${cpfLogado}`
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
      const resp = await fetch(`${BASE_URL}/publicacoes/curtir`, {
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

  // Inicializa curtidas
  setTimeout(async () => {
    try {
      await atualizarCurtidas();
      await verificarCurtidaUsuario();
    } catch (erro) {
      console.error("Erro ao inicializar curtidas:", erro);
    }
  }, 100);
}

// ======================= PUBLICAÇÕES =======================
async function carregarPostsDoUsuario(filtroEsporte = "") {
  const cpf = obterCPFDaPagina();
  
  if (!cpf) return console.warn("CPF não encontrado para carregar posts");

  console.log("📝 Carregando posts do CPF:", cpf);

  const container = document.getElementById("container-baixo");
  if (!container) return console.error("#container-baixo não encontrado no DOM");

  try {
    const resp = await fetch(`${BASE_URL}/publicacoes/${encodeURIComponent(cpf)}`);
    if (!resp.ok) throw new Error("Erro ao buscar publicações");
    const dados = await resp.json();

    let posts = Array.isArray(dados) ? dados : (dados.posts || []);
    
    // Filtrar por esporte
    if (filtroEsporte) {
      posts = posts.filter(p => p.esporte && p.esporte.toLowerCase() === filtroEsporte.toLowerCase());
    }

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

      // Header
      const header = criarHeaderPost(post, filtroEsporte);
      card.appendChild(header);

      // Conteúdo
      if (post.conteudo && post.conteudo !== "null") {
        const conteudoDiv = document.createElement("div");
        conteudoDiv.className = "conteudo";
        conteudoDiv.innerHTML = escapeHtml(post.conteudo);
        card.appendChild(conteudoDiv);
      }

      // Imagem
      if (post.imagem) {
        const img = document.createElement("img");
        img.className = "post-imagem";
        img.src = post.imagem.startsWith("http") ? post.imagem : `${BASE_URL}/uploads/${post.imagem}`;
        img.alt = "Imagem do post";
        card.appendChild(img);
      }

      // Data
      const dataDiv = document.createElement("div");
      dataDiv.className = "data";
      const dataRaw = post.data_publicacao || post.data || "";
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

      // Curtidas
      criarSistemaCurtidas(post, card, cpf);

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar posts do usuário:", err);
  }
}

function criarHeaderPost(post, filtroEsporte) {
  const header = document.createElement("div");
  header.className = "post-header";

  const fotoPath = caminhoFoto(post.fotoDePerfil);
  const nome = post.nome || "Usuário";
  const username = post.nomeUsuario || "";

  header.innerHTML = `
    <img class="foto-perfil" src="${escapeHtml(fotoPath)}" alt="${escapeHtml(nome)}">
    <div class="post-info">
      <strong class="nome">${escapeHtml(nome)}</strong>
      <span class="usuario">@${escapeHtml(username).replace("@","")}</span>
    </div>
  `;

  // Menu de excluir se for o dono
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
    
    const menuBtn = menuHtml.querySelector(".menu-btn");
    const menuOpcoes = menuHtml.querySelector(".menu-opcoes");
    
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menuOpcoes.classList.toggle("ativo");
    });
    
    document.addEventListener("click", () => menuOpcoes.classList.remove("ativo"));

    menuHtml.querySelector(".excluir-btn").addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (!confirm("Deseja realmente excluir esta publicação?")) return;
      
      try {
        const r = await fetch(`${BASE_URL}/publicacoes/${id}`, { method: "DELETE" });
        const resJson = await r.json();
        if (resJson.success) {
          carregarPostsDoUsuario(filtroEsporte);
        } else {
          alert("Erro ao excluir publicação.");
        }
      } catch (err) {
        console.error("Erro ao excluir:", err);
        alert("Erro ao excluir publicação.");
      }
    });

    header.appendChild(menuHtml);
  }

  return header;
}

// ======================= ESPORTES =======================
async function carregarEsportes() {
  const container = document.getElementById("atalhos-esportes");
  if (!container) return console.warn("Elemento #atalhos-esportes não encontrado.");

  const cpf = obterCPFDaPagina();
  
  if (!cpf) {
    container.innerHTML = "<p>CPF não encontrado. Faça login para ver seus esportes.</p>";
    return;
  }

  try {
    const resposta = await fetch(`${BASE_URL}/esportes/${encodeURIComponent(cpf)}`);
    if (!resposta.ok) throw new Error("Erro ao buscar esportes.");
    const esportes = await resposta.json();
    const caminhoImagens = "ImagensEscolhaEsportes/";

    // Muda título se for perfil de outra pessoa
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
//==esporte direito===
// ======================= ESPORTES DO LADO DIREITO =======================
async function carregarEsportesDireita() {
  const container = document.getElementById("esportes-direita");

  if (!container) {
    console.warn("Elemento #esportes-direita não encontrado.");
    return;
  }

  const cpf = obterCPFDaPagina();
  if (!cpf) return;

  try {
    const resp = await fetch(`${BASE_URL}/esportes/${encodeURIComponent(cpf)}`);
    if (!resp.ok) throw new Error("Erro ao buscar esportes.");

    const esportes = await resp.json();

    container.innerHTML = ""; // limpar

    if (!Array.isArray(esportes) || esportes.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:#888;">Sem esportes</p>`;
      return;
    }

    esportes.forEach(esporte => {
      const btn = document.createElement("button");
      btn.classList.add("btn-esporte-direita");
      btn.textContent = esporte;

      btn.addEventListener("click", () => {
        carregarPostsDoUsuario(esporte);
      });

      container.appendChild(btn);
    });

  } catch (err) {
    console.error("Erro ao carregar esportes da direita:", err);
  }
}

// ======================= CLUBES =======================
async function carregarClubesNoPerfil() {
  console.log("carregarClubesNoPerfil() iniciado");
  
  const cpf = obterCPFDaPagina();
  if (!cpf) {
    console.warn("CPF não encontrado para carregar clubes");
    return;
  }

  const containerClubes = document.querySelector(".clubes");
  if (!containerClubes) {
    console.warn("Container .clubes não encontrado no DOM");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/usuario/${encodeURIComponent(cpf)}/clubes`);
    
    if (!response.ok) throw new Error('Erro ao buscar clubes do usuário');
    
    const data = await response.json();
    const clubes = data.clubes || [];
    
    console.log("Clubes carregados:", clubes);
    
    containerClubes.innerHTML = '<h2>Clubes que frequento</h2>';
    
    if (clubes.length === 0) {
      containerClubes.innerHTML += `
        <p style="color: #999; text-align: center; padding: 20px 0;">
          Nenhum clube adicionado ainda.
        </p>
      `;
      return;
    }
    
    clubes.forEach(clube => {
      const clubeCard = document.createElement('div');
      clubeCard.classList.add('clube-card');
      
      clubeCard.innerHTML = `
        <p><strong>${escapeHtml(clube.nome)}</strong></p>
        <p>${escapeHtml(clube.esporteClube)}</p>
      `;
      
      containerClubes.appendChild(clubeCard);
    });
    
  } catch (error) {
    console.error("Erro ao carregar clubes:", error);
    
    const containerClubes = document.querySelector(".clubes");
    if (containerClubes) {
      containerClubes.innerHTML = `
        <h2>Clubes que frequento</h2>
        <p style="color: #e53935; text-align: center; padding: 20px 0;">
          Erro ao carregar clubes. Tente novamente.
        </p>
      `;
    }
  }
}

// ======================= NAVEGAÇÃO =======================
function criarBotaoEditar() {
  // só mostra se for o perfil do próprio usuário
  if (!ehPerfilProprio()) return;

  const container = document.querySelector("#container-segue");
  if (!container) {
    console.warn("container-segue não encontrado");
    return;
  }

  // procura área do botão
  let area = document.querySelector("#area-botao-seguir");

  // se não existir, cria
  if (!area) {
    area = document.createElement("div");
    area.id = "area-botao-seguir";
    area.style.display = "flex";
    area.style.alignItems = "center";
    area.style.marginLeft = "20px";

    container.appendChild(area);
  }

  // criar botão
  const botao = document.createElement("button");
  botao.id = "btn-editar-perfil";
  botao.className = "botao-editar";
  botao.textContent = "Editar";

  botao.addEventListener("click", () => {
    console.log("Redirecionando para editPerfil.html");
    window.location.href = "editPerfil.html";
  });

  // inserir na área correta
  area.appendChild(botao);
}
function configurarMenuConfiguracao() {
  console.log("configurarMenuConfiguracao() não implementada");
}


// ======================= INICIALIZAÇÃO =======================
document.addEventListener("DOMContentLoaded", () => {
  preencherPerfil();
  carregarPostsDoUsuario();
  carregarEsportes();
  carregarEsportesDireita();
  carregarClubesNoPerfil();
  criarBotaoEditar(); 
  configurarMenuConfiguracao();
  console.log("perfil inicializado");
});
