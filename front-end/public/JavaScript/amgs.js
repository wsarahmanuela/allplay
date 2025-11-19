// ================== FUNÇÃO PARA FORMATAR CPF ==================
function formatarCPF(cpf) {
  if (!cpf) return '';
  const numeros = cpf.replace(/\D/g, '');
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// utilitário simples para evitar XSS ao injetar valores
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ================== CARREGAR FOTO DO NAVBAR ==================
async function carregarFotoNavbar() {
  try {
    let cpf = localStorage.getItem("cpf");
    if (!cpf) return;

    cpf = formatarCPF(cpf);
    
    const resp = await fetch(`http://localhost:3000/usuario/${encodeURIComponent(cpf)}`);
    if (!resp.ok) return;
    
    const dados = await resp.json();
    if (!dados || !dados.usuario) return;

    const usuario = dados.usuario;
    const foto = usuario.fotoDePerfil 
      ? `http://localhost:3000/uploads/${usuario.fotoDePerfil}` 
      : "imagens/profile.picture.jpg";

    // Tentar diferentes seletores para encontrar a imagem do navbar
    const fotoNavbar = document.querySelector(".nav-user-icon img") 
                    || document.querySelector("header img")
                    || document.getElementById("fotoPerfilNavbar");
    
    if (fotoNavbar) {
      fotoNavbar.src = foto;
      console.log("[amigos.js] ✅ Foto do navbar carregada:", foto);
    } else {
      console.warn("[amigos.js] ⚠️ Elemento da foto do navbar não encontrado");
    }

  } catch (err) {
    console.error("[amigos.js] ❌ carregarFotoNavbar erro:", err);
  }
}

// ================== PREENCHER PERFIL (SIMPLIFICADO) ==================
async function preencherPerfil() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const cpfDaURL = urlParams.get('cpf');
    let cpf = cpfDaURL || localStorage.getItem("cpf");
    if (!cpf) {
      console.info("[amigos.js] preencherPerfil: cpf não encontrado no localStorage/URL.");
      return;
    }

    cpf = formatarCPF(cpf);
    console.log("[amigos.js] preencherPerfil: CPF formatado:", cpf);

    const resp = await fetch(`http://localhost:3000/usuario/${encodeURIComponent(cpf)}`);
    if (!resp.ok) {
      console.warn("[amigos.js] preencherPerfil: resposta do servidor não OK", resp.status);
      return;
    }
    const dados = await resp.json();
    if (!dados || !dados.usuario) return;

    const usuario = dados.usuario;
    const nome = usuario.nome || "Usuário sem nome";
    const arroba = usuario.nomeUsuario ? `@${usuario.nomeUsuario}` : "@usuario";
    const foto = usuario.fotoDePerfil ? `http://localhost:3000/uploads/${usuario.fotoDePerfil}` : "imagens/profile.picture.jpg";

    const nomeTopo = document.getElementById("nomeUsuarioFeed");
    const arrobaTopo = document.getElementById("arrobaFeed");
    const fotoTopo = document.getElementById("fotoPerfilFeed");

    if (nomeTopo) nomeTopo.textContent = nome;
    if (arrobaTopo) arrobaTopo.textContent = arroba;
    if (fotoTopo) fotoTopo.src = foto;

    console.info("[amigos.js]  preencherPerfil: preenchido", { nome, arroba });
  } catch (err) {
    console.error("[amigos.js]  preencherPerfil erro:", err);
  }
}

// ================== CARREGAR AMIGOS ==================
async function carregarAmigos() {
  try {
    const container = document.getElementById("listaAmigos");
    if (!container) {
      console.error("[amigos.js]  carregarAmigos: elemento #listaAmigos NÃO encontrado no HTML.");
      return;
    }

    let cpf = localStorage.getItem("cpf");
    if (!cpf) {
      container.innerHTML = "<p>Erro: usuário não logado (cpf não encontrado).</p>";
      console.warn("[amigos.js]  carregarAmigos: cpf não encontrado no localStorage.");
      return;
    }

    cpf = formatarCPF(cpf);
    console.info("[amigos.js]  carregarAmigos: buscando amizades para CPF:", cpf);
    
    const resposta = await fetch(`http://localhost:3000/mutuos/${encodeURIComponent(cpf)}`);

    if (!resposta.ok) {
      console.error("[amigos.js]  carregarAmigos: fetch retornou status", resposta.status);
      container.innerHTML = `<p>Erro ao buscar amigos (status ${resposta.status}).</p>`;
      return;
    }

    const amigos = await resposta.json();
    console.log("[amigos.js]  carregarAmigos: resposta do servidor:", amigos);

    let lista = [];
    if (Array.isArray(amigos)) {
      lista = amigos;
    } else if (Array.isArray(amigos.amigos)) {
      lista = amigos.amigos;
    } else if (Array.isArray(amigos.data)) {
      lista = amigos.data;
    }

    container.innerHTML = "";

    if (!Array.isArray(lista) || lista.length === 0) {
      container.innerHTML = "<p>Você ainda não possui amigos mútuos.</p>";
      console.info("[amigos.js] ℹ carregarAmigos: lista vazia.");
      return;
    }

    lista.forEach(amigo => {
      const cpfAmigo = amigo.CPF || amigo.cpf;
      
      console.log("[amigos.js]  CPF do amigo:", cpfAmigo);

      const esportes = Array.isArray(amigo.esportes) ? amigo.esportes : (amigo.esportes ? [String(amigo.esportes)] : []);
      const foto = amigo.fotoDePerfil ? `http://localhost:3000/uploads/${amigo.fotoDePerfil}` : "imagens/profile.picture.jpg";
      const nome = amigo.nome || amigo.nomeUsuario || "Usuário";
      const nomeUsuario = amigo.nomeUsuario || (amigo.arroba ? amigo.arroba.replace(/^@/, "") : "usuario");

      const div = document.createElement("div");
      div.className = "user-card";
      div.style.cursor = "pointer";

      div.innerHTML = `
        <img class="user-avatar" src="${foto}" alt="${escapeHtml(nome)}">
        <div class="user-info">
          <h3>${escapeHtml(nome)}</h3>
          <p class="arroba">@${escapeHtml(nomeUsuario)}</p>
          <div class="tags">${esportes.map(e => `<span class="tag">${escapeHtml(e)}</span>`).join("")}</div>
        </div>
      `;

      div.addEventListener("click", () => {
        if (cpfAmigo) {
          console.log("[amigos.js]  Redirecionando para perfil do CPF:", cpfAmigo);
          window.location.href = `perfilSeguir.html?cpf=${encodeURIComponent(cpfAmigo)}`;
        } else {
          console.error("[amigos.js]  CPF do amigo não encontrado!");
        }
      });

      container.appendChild(div);
    });

    console.info("[amigos.js]  carregarAmigos: renderizado", lista.length, "amigos.");
  } catch (err) {
    console.error("[amigos.js]  carregarAmigos erro:", err);
    const container = document.getElementById("listaAmigos");
    if (container) container.innerHTML = "<p>Erro ao carregar amigos. Veja o console.</p>";
  }
}

// ================== CARREGAR ESPORTES COM IMAGENS ==================
async function carregarEsportes() {
  try {
    let cpf = localStorage.getItem("cpf");
    if (!cpf) return;

    cpf = formatarCPF(cpf);

    const container = document.getElementById("atalhos-esportes");
    if (!container) {
      console.warn("[amigos.js] Elemento #atalhos-esportes não encontrado");
      return;
    }

    const resposta = await fetch(`http://localhost:3000/esportes/${encodeURIComponent(cpf)}`);
    if (!resposta.ok) {
      console.warn("[amigos.js]  Erro ao buscar esportes:", resposta.status);
      return;
    }

    const esportes = await resposta.json();
    
    // Manter título "Seus esportes" se existir
    const titulo = container.querySelector("p");
    container.innerHTML = "";
    
    const p = document.createElement("p");
    p.textContent = "Seus esportes";
    container.appendChild(p);

    if (!Array.isArray(esportes) || esportes.length === 0) {
      const pVazio = document.createElement("p");
      pVazio.textContent = "Nenhum esporte cadastrado";
      pVazio.style.fontSize = "12px";
      pVazio.style.color = "#666";
      container.appendChild(pVazio);
      console.info("[amigos.js] ℹ Nenhum esporte encontrado");
      return;
    }

    const caminhoImagens = "ImagensEscolhaEsportes/";

    esportes.forEach(esporte => {
      const div = document.createElement("div");
      div.classList.add("esporte-item");

      // Normalizar nome do arquivo (remover acentos e espaços)
      const nomeArquivo = esporte
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .toLowerCase();
      
      const nomeArquivoCapitalizado = nomeArquivo.charAt(0).toUpperCase() + nomeArquivo.slice(1);

      div.innerHTML = `
        <a href="#" class="atalho-esporte-link">
          <img src="${caminhoImagens}${nomeArquivoCapitalizado}.png"
               onerror="this.src='imagens/default.png'; console.warn('Imagem não encontrada: ${nomeArquivoCapitalizado}.png')"
               alt="${escapeHtml(esporte)}"
               style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;">
          <span>${escapeHtml(esporte)}</span>
        </a>
      `;

      div.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("[amigos.js]  Esporte clicado:", esporte);
        // Adicione aqui a lógica de filtro se necessário
      });

      container.appendChild(div);
    });

    console.info("[amigos.js]  carregarEsportes: carregado", esportes.length, "esportes.");
  } catch (err) {
    console.error("[amigos.js]  carregarEsportes erro:", err);
  }
}

// ================== PREENCHER SELECT DE ESPORTES (OPCIONAL) ==================
async function preencherSelectEsportes() {
  console.info("[amigos.js] ℹ preencherSelectEsportes: função chamada (não implementada nesta página)");
}

// ================== INICIALIZAÇÃO ==================
document.addEventListener("DOMContentLoaded", () => {
  console.log("[amigos.js]  Inicializando página de amigos...");
  carregarFotoNavbar();     
  preencherPerfil();        
  carregarAmigos();         
  carregarEsportes();      
  preencherSelectEsportes(); 
});