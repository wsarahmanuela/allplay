console.log("perfilseguir.js carregado");

// CONFIGURACOES
const BASE_URL = 'http://localhost:3000';

// FUNCOES GERAIS
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
  
  if (!isNaN(Number(input))) return new Date(Number(input));
  
  const s = String(input).trim();
  
  if (s.includes("/") && s.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
    const [dataParte, tempoParte = "00:00:00"] = s.split(" ");
    const [dia, mes, ano] = dataParte.split("/").map(n => parseInt(n, 10));
    const [hh = "0", mm = "0", ss = "0"] = tempoParte.split(":");
    return new Date(ano, mes - 1, dia, parseInt(hh, 10), parseInt(mm, 10), parseInt(ss, 10));
  }
  
  if (s.includes("T")) {
    try {
      return new Date(s);
    } catch (e) {
      // fallback
    }
  }
  
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

// PEGAR CPF
const params = new URLSearchParams(window.location.search);
let cpfDaUrl = params.get("cpf");

let cpfLogado = localStorage.getItem("cpf");

let cpfPerfil = null;

if (cpfDaUrl && cpfDaUrl.trim() !== "") {
  cpfPerfil = cpfDaUrl;
  console.log("Visualizando perfil de OUTRO usuario:", cpfPerfil);
}
else if (cpfLogado) {
  cpfPerfil = cpfLogado;
  console.log("Visualizando perfil PROPRIO:", cpfPerfil);
}
else {
  alert("Erro: Nenhum perfil encontrado!");
  window.location.href = "home.html";
}

console.log("CPF logado:", cpfLogado);
console.log("CPF sendo exibido:", cpfPerfil);

// REMOVER BOTOES EDITAR SE NAO FOR PROPRIO
function removerBotoesEditarSeNaoForProprio() {
  if (cpfPerfil === cpfLogado) return;
  
  const seletores = [
    "#editar-perfil",
    "#btn-editar",
    ".btn-editar",
    ".botao-editar",
    ".editar"
  ];
  seletores.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.remove());
  });

  document.querySelectorAll("button, a").forEach(el => {
    try {
      const txt = el.textContent || "";
      if (txt.trim().toLowerCase().includes("editar")) {
        el.remove();
      }
    } catch (e) {
      // ignore
    }
  });
}

// PREENCHER PERFIL VISITADO
async function preencherPerfilVisitado() {
  try {
    const resposta = await fetch(`${BASE_URL}/usuario/${encodeURIComponent(cpfPerfil)}`);
    const dados = await resposta.json();

    if (!resposta.ok || !dados.success) {
      console.error("Erro ao buscar perfil:", dados);
      return;
    }

    const usuario = dados.usuario || {};
    const nome = usuario.nome || "Usuario sem nome";
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

    console.log("Perfil carregado com sucesso:", nome);
  } catch (err) {
    console.error("Erro ao carregar perfil visitado:", err);
  }
}

// CARREGAR FOTO DO USUARIO LOGADO NO NAVBAR
async function carregarFotoNavbar() {
  if (!cpfLogado) return;
  
  try {
    const resposta = await fetch(`${BASE_URL}/usuario/${encodeURIComponent(cpfLogado)}`);
    const dados = await resposta.json();
    
    if (resposta.ok && dados.success) {
      const usuario = dados.usuario || {};
      const foto = caminhoFoto(usuario.fotoDePerfil);
      const fotoNavbar = document.querySelector(".nav-user-icon img");
      
      if (fotoNavbar) {
        fotoNavbar.src = foto;
      }
    }
  } catch (err) {
    console.error("Erro ao carregar foto do navbar:", err);
  }
}
// BARRA DE PESQUISA
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("resultsDiv");

if (searchInput && resultsDiv) {
  async function fazerBusca() {
    const termo = searchInput.value.trim();
    if (!termo) {
      resultsDiv.style.display = "none";
      return;
    }

    try {
      const resposta = await fetch(`http://localhost:3000/search?query=${encodeURIComponent(termo)}`);
      if (!resposta.ok) throw new Error("Erro ao buscar dados");

      const resultados = await resposta.json();
      resultsDiv.innerHTML = "";

      if (resultados.usuarios.length === 0 && resultados.posts.length === 0) {
        resultsDiv.textContent = "Nenhum resultado encontrado.";
      } else {
        resultados.usuarios.forEach(usuario => {
          const div = document.createElement("div");
          div.classList.add("result-item");
          div.innerHTML = `
            <img src="${usuario.fotoDePerfil ? `http://localhost:3000/uploads/${usuario.fotoDePerfil}` : 'imagens/profile.picture.jpg'}" alt="${usuario.nome}">
            <span>${usuario.nome} (@${usuario.nomeUsuario})</span>
          `;

          div.dataset.cpf = usuario.CPF;

          div.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const cpfDoUsuario = div.dataset.cpf;
            console.log(" Indo para perfil do CPF:", cpfDoUsuario);
            window.location.href = `/perfilSeguir.html?cpf=${encodeURIComponent(cpfDoUsuario)}`;
          });

          resultsDiv.appendChild(div);
        });

        resultados.posts.forEach(post => {
          const div = document.createElement("div");
          div.classList.add("result-item");
          div.innerHTML = `
            <strong>${post.nome}</strong>: ${post.conteudo}
          `;
          resultsDiv.appendChild(div);
        });
      }

      resultsDiv.style.display = "block";

    } catch (erro) {
      console.error("Erro ao fazer busca:", erro);
      resultsDiv.textContent = "Erro ao buscar. Tente novamente.";
      resultsDiv.style.display = "block";
    }
  }

  searchInput.addEventListener("input", fazerBusca);

  document.addEventListener("click", (e) => {
    if (!resultsDiv.contains(e.target) && e.target !== searchInput) {
      resultsDiv.style.display = "none";
    }
  });
}

// SISTEMA DE CURTIDAS
function criarSistemaCurtidas(post, card) {
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
    if (!cpfLogado) return;
    
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
    if (!cpfLogado) {
      alert("Faca login para curtir publicacoes!");
      return;
    }
    
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

  setTimeout(async () => {
    try {
      await atualizarCurtidas();
      await verificarCurtidaUsuario();
    } catch (erro) {
      console.error("Erro ao inicializar curtidas:", erro);
    }
  }, 100);
}

// CARREGAR POSTS DO PERFIL VISITADO
async function carregarPostsVisitado() {
  const container = document.getElementById("container-baixo");
  if (!container) return console.error("#container-baixo nao encontrado no DOM");

  try {
    const resp = await fetch(`${BASE_URL}/publicacoes/${encodeURIComponent(cpfPerfil)}`);
    if (!resp.ok) throw new Error("Erro ao buscar publicacoes");
    const dados = await resp.json();

    let posts = [];
    if (Array.isArray(dados)) posts = dados;
    else if (Array.isArray(dados.posts)) posts = dados.posts;

    container.innerHTML = "";

    if (posts.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px; color:#666;">
          <h3 style="margin-bottom:8px">Ainda nao ha nenhuma publicacao</h3>
          <img src="imagensPerfil/camera.png" alt="Icone de camera" style="width:120px; opacity:0.7">
        </div>`;
      return;
    }

    posts.forEach(post => {
      const card = document.createElement("div");
      card.className = "post";

      const fotoPath = caminhoFoto(post.fotoDePerfil);
      const nome = post.nome || "Usuario";
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

      if (conteudo) {
        const conteudoDiv = document.createElement("div");
        conteudoDiv.className = "conteudo";
        conteudoDiv.innerHTML = escapeHtml(conteudo);
        card.appendChild(conteudoDiv);
      }

      if (post.imagem) {
        const img = document.createElement("img");
        img.className = "post-imagem";
        img.src = post.imagem.startsWith("http")
          ? post.imagem
          : `${BASE_URL}/uploads/${post.imagem}`;
        img.alt = "Imagem do post";
        card.appendChild(img);
      }

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

      criarSistemaCurtidas(post, card);

      container.appendChild(card);
    });

    console.log(`${posts.length} publicacoes carregadas para CPF ${cpfPerfil}`);
  } catch (err) {
    console.error("Erro ao carregar posts do perfil visitado:", err);
  }
}

// CRIAR BOTAO DE SEGUIR OU EDITAR
async function criarBotaoSeguir() {
  const areaNome = document.getElementById("area-botao-seguir");
  if (!areaNome) return;

  areaNome.innerHTML = "";

  // Se for o próprio perfil, mostra botão de editar
  if (cpfPerfil === cpfLogado) {
    const btnEditar = document.createElement("button");
    btnEditar.id = "btn-editar";
    btnEditar.textContent = "Editar";
    btnEditar.style.padding = "8px 16px";
    btnEditar.style.borderRadius = "8px";
    btnEditar.style.border = "none";
    btnEditar.style.cursor = "pointer";
    btnEditar.style.fontSize = "16px";
    btnEditar.style.background = "#37bb1c";
    btnEditar.style.color = "white";
    btnEditar.style.marginLeft = "10px";

    btnEditar.addEventListener("click", () => {
      window.location.href = "editPerfil.html";
    });

    areaNome.appendChild(btnEditar);
    return;
  }

  removerBotoesEditarSeNaoForProprio();

  // Criar botão de seguir
  const btn = document.createElement("button");
  btn.id = "btn-seguir";
  btn.textContent = "Carregando...";
  btn.disabled = true;
  btn.style.padding = "8px 16px";
  btn.style.borderRadius = "8px";
  btn.style.border = "none";
  btn.style.cursor = "pointer";
  btn.style.fontSize = "16px";
  btn.style.background = "#ccc";
  btn.style.color = "white";
  btn.style.marginLeft = "10px";

  areaNome.appendChild(btn);

  // Verificar se já está seguindo
  try {
    console.log(`Verificando se ${cpfLogado} segue ${cpfPerfil}`);
    
    const resp = await fetch(`${BASE_URL}/segue/${cpfLogado}/${cpfPerfil}`);
    const dados = await resp.json();

    console.log("Resposta da verificação:", dados);

    if (dados.success && dados.segue === true) {
      btn.textContent = "Seguindo";
      btn.style.background = "#4caf50";
      btn.dataset.seguindo = "true";
    } else {
      btn.textContent = "Seguir";
      btn.style.background = "#007bff";
      btn.dataset.seguindo = "false";
    }
    
    btn.disabled = false;
    btn.style.cursor = "pointer";
    
  } catch (err) {
    console.error("Erro ao verificar follow:", err);
    btn.textContent = "Seguir";
    btn.style.background = "#007bff";
    btn.dataset.seguindo = "false";
    btn.disabled = false;
    btn.style.cursor = "pointer";
  }

  // Adicionar evento de clique
  btn.addEventListener("click", async () => {
    const estaSeguindo = btn.dataset.seguindo === "true";
    
    // Desabilitar botão durante a requisição
    btn.disabled = true;
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";
    
    try {
      if (!estaSeguindo) {
        // SEGUIR
        console.log(`Tentando seguir ${cpfPerfil}`);
        
        const resp = await fetch(`${BASE_URL}/seguir`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cpf_seguidor: cpfLogado,
            cpf_seguido: cpfPerfil
          })
        });

        const resultado = await resp.json();
        
        if (resp.ok && resultado.success) {
          btn.textContent = "Seguindo";
          btn.style.background = "#4caf50";
          btn.dataset.seguindo = "true";
          console.log("Agora seguindo o usuário");
          
          // Atualizar contador de seguidores
          await atualizarContadores();
        } else {
          alert(resultado.message || "Erro ao seguir usuário");
        }
        
      } else {
        // DEIXAR DE SEGUIR
        console.log(`Tentando deixar de seguir ${cpfPerfil}`);
        
        const resp = await fetch(`${BASE_URL}/seguir`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cpf_seguidor: cpfLogado,
            cpf_seguido: cpfPerfil
          })
        });

        const resultado = await resp.json();
        
        if (resp.ok && resultado.success) {
          btn.textContent = "Seguir";
          btn.style.background = "#007bff";
          btn.dataset.seguindo = "false";
          console.log("Deixou de seguir o usuário");
          
          // Atualizar contador de seguidores
          await atualizarContadores();
        } else {
          alert(resultado.message || "Erro ao deixar de seguir");
        }
      }
    } catch (err) {
      console.error("Erro ao seguir/deixar seguir:", err);
      alert("Erro ao processar ação. Tente novamente.");
    } finally {
      // Reabilitar botão
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }
  });
}

// ATUALIZAR CONTADORES DE SEGUIDORES E SEGUINDO
async function atualizarContadores() {
  try {
    const resp = await fetch(`${BASE_URL}/seguidores/${cpfPerfil}`);
    const dados = await resp.json();
    
    if (dados.success) {
      const seguidoresElem = document.querySelector("#seguidores-count");
      const seguindoElem = document.querySelector("#seguindo-count");
      
      if (seguidoresElem) {
        seguidoresElem.textContent = dados.seguidores || 0;
      }
      
      if (seguindoElem) {
        seguindoElem.textContent = dados.seguindo || 0;
      }
      
      console.log(`Contadores atualizados: ${dados.seguidores} seguidores, ${dados.seguindo} seguindo`);
    }
  } catch (err) {
    console.error("Erro ao atualizar contadores:", err);
  }
}

// ======================= CARREGAR MEUS ESPORTES (LADO ESQUERDO - #atalhos-esportes) =======================
async function carregarMeusEsportes() {
  const container = document.getElementById("atalhos-esportes");
  if (!container) return console.warn("Elemento #atalhos-esportes não encontrado.");

  if (!cpfLogado) {
    container.innerHTML = "<p>Faça login para ver seus esportes.</p>";
    return;
  }

  try {
    const resposta = await fetch(`${BASE_URL}/esportes/${encodeURIComponent(cpfLogado)}`);
    if (!resposta.ok) throw new Error("Erro ao buscar seus esportes.");
    const esportes = await resposta.json();
    const caminhoImagens = "ImagensEscolhaEsportes/";

    container.innerHTML = `<p>Seus esportes</p>`;

    if (!Array.isArray(esportes) || esportes.length === 0) {
      container.insertAdjacentHTML("beforeend", `<p>Você ainda não escolheu esportes.</p>`);
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
        // Aqui você pode filtrar SEUS posts por esporte se desejar
      });

      container.appendChild(div);
    });

    console.log(`${esportes.length} SEUS esportes carregados no lado esquerdo`);
  } catch (erro) {
    console.error("Erro ao carregar seus esportes:", erro);
    container.innerHTML = `<p>Erro ao carregar esportes: ${escapeHtml(erro.message)}</p>`;
  }
}

// ======================= CARREGAR ESPORTES DO VISITADO (LADO DIREITO - .esportes) =======================
async function carregarEsportesDoVisitado() {
  const container = document.querySelector(".esportes");

  if (!container) {
    console.warn("Elemento .esportes não encontrado.");
    return;
  }

  // IMPORTANTE: Só mostrar se houver CPF na URL (visitando outra pessoa)
  if (!cpfDaUrl || cpfDaUrl === cpfLogado) {
    console.log("Próprio perfil ou sem visitante - não mostra esportes da direita");
    container.style.display = "none"; // Esconder se for próprio perfil
    return;
  }

  console.log("Carregando esportes do CPF visitado:", cpfDaUrl);

  try {
    // Usar cpfDaUrl diretamente, não cpfPerfil
    const resp = await fetch(`${BASE_URL}/esportes/${encodeURIComponent(cpfDaUrl)}`);
    if (!resp.ok) throw new Error("Erro ao buscar esportes.");

    const esportes = await resp.json();

    // Limpar esportes estáticos
    container.innerHTML = "";
    container.style.display = "block"; // Garantir que está visível

    if (!Array.isArray(esportes) || esportes.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:#888; padding:20px;">Nenhum esporte escolhido</p>`;
      return;
    }

    // Criar os elementos de esporte
    esportes.forEach(esporte => {
      const div = document.createElement("div");
      div.classList.add("esporte");
      div.textContent = esporte;
      container.appendChild(div);
    });

    console.log(`✅ ${esportes.length} esportes do visitado carregados:`, esportes);

  } catch (err) {
    console.error("Erro ao carregar esportes do visitado:", err);
    container.innerHTML = `<p style="text-align:center; color:#e53935; padding:20px;">Erro ao carregar esportes</p>`;
  }
}

// CARREGAR CLUBES DO USUARIO VISITADO
async function carregarClubesDoVisitado() {
  console.log("carregarClubesDoVisitado() iniciado");
  
  if (!cpfPerfil) {
    console.warn("CPF do perfil nao encontrado para carregar clubes");
    return;
  }

  const containerClubes = document.querySelector(".clubes");
  if (!containerClubes) {
    console.warn("Container .clubes nao encontrado no DOM");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/usuario/${encodeURIComponent(cpfPerfil)}/clubes`);
    
    if (!response.ok) throw new Error('Erro ao buscar clubes do usuario');
    
    const data = await response.json();
    const clubes = data.clubes || [];
    
    console.log("Clubes do usuario visitado carregados:", clubes);
    
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

// INICIALIZACAO
document.addEventListener("DOMContentLoaded", () => {
  console.log("Inicializando perfilseguir...");
  console.log("CPF da URL:", cpfDaUrl);
  console.log("CPF logado:", cpfLogado);
  console.log("CPF sendo usado:", cpfPerfil);

  removerBotoesEditarSeNaoForProprio();
  preencherPerfilVisitado();
  carregarFotoNavbar();
  carregarPostsVisitado();
  criarBotaoSeguir();
  carregarMeusEsportes();           // ← LADO ESQUERDO: seus esportes
  carregarEsportesDoVisitado();     // ← LADO DIREITO: esportes do visitado
  carregarClubesDoVisitado();
  atualizarContadores();
});