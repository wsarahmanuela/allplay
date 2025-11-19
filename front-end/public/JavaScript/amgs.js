// amigos.js — versão defensiva com logs e formatação de CPF

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

    console.info("[amigos.js] preencherPerfil: preenchido", { nome, arroba });
  } catch (err) {
    console.error("[amigos.js] preencherPerfil erro:", err);
  }
}

// ================== CARREGAR AMIGOS (DEFENSIVO) ==================
async function carregarAmigos() {
  try {
    const container = document.getElementById("listaAmigos");
    if (!container) {
      console.error("[amigos.js] carregarAmigos: elemento #listaAmigos NÃO encontrado no HTML.");
      return;
    }

    let cpf = localStorage.getItem("cpf");
    if (!cpf) {
      container.innerHTML = "<p>Erro: usuário não logado (cpf não encontrado).</p>";
      console.warn("[amigos.js] carregarAmigos: cpf não encontrado no localStorage.");
      return;
    }

    cpf = formatarCPF(cpf);
    console.info("[amigos.js] carregarAmigos: buscando amizades para CPF:", cpf);
    
    const resposta = await fetch(`http://localhost:3000/mutuos/${encodeURIComponent(cpf)}`);

    if (!resposta.ok) {
      console.error("[amigos.js] carregarAmigos: fetch retornou status", resposta.status);
      container.innerHTML = `<p>Erro ao buscar amigos (status ${resposta.status}).</p>`;
      return;
    }

    const amigos = await resposta.json();
    console.log("[amigos.js] carregarAmigos: resposta do servidor:", amigos);

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
      console.info("[amigos.js] carregarAmigos: lista vazia.");
      return;
    }

    lista.forEach(amigo => {
      const cpfAmigo = amigo.CPF || amigo.cpf;
      
      console.log("[amigos.js] CPF do amigo:", cpfAmigo);

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
          console.log("[amigos.js] Redirecionando para perfil do CPF:", cpfAmigo);
          window.location.href = `perfilSeguir.html?cpf=${encodeURIComponent(cpfAmigo)}`;
        } else {
          console.error("[amigos.js] CPF do amigo não encontrado!");
        }
      });

      container.appendChild(div);
    });

    console.info("[amigos.js] carregarAmigos: renderizado", lista.length, "amigos.");
  } catch (err) {
    console.error("[amigos.js] carregarAmigos erro:", err);
    const container = document.getElementById("listaAmigos");
    if (container) container.innerHTML = "<p>Erro ao carregar amigos. Veja o console.</p>";
  }
}

// ================== CARREGAR ESPORTES (OPCIONAL) ==================
async function carregarEsportes() {
  try {
    let cpf = localStorage.getItem("cpf");
    if (!cpf) return;

    cpf = formatarCPF(cpf);

    const container = document.getElementById("atalhos-esportes");
    if (!container) return;

    const resposta = await fetch(`http://localhost:3000/esportes/${encodeURIComponent(cpf)}`);
    if (!resposta.ok) return;

    const esportes = await resposta.json();
    
    const titulo = container.querySelector("p");
    container.innerHTML = "";
    if (titulo) container.appendChild(titulo);

    if (!Array.isArray(esportes) || esportes.length === 0) {
      const p = document.createElement("p");
      p.textContent = "Nenhum esporte cadastrado";
      p.style.fontSize = "12px";
      p.style.color = "#666";
      container.appendChild(p);
      return;
    }

    esportes.forEach(esporte => {
      const a = document.createElement("a");
      a.href = "#";
      a.innerHTML = `<img src="imagens/esporte-icon.png" onerror="this.style.display='none'"> ${escapeHtml(esporte)}`;
      container.appendChild(a);
    });

    console.info("[amigos.js] carregarEsportes: carregado", esportes.length, "esportes.");
  } catch (err) {
    console.error("[amigos.js] carregarEsportes erro:", err);
  }
}

// ================== PREENCHER SELECT DE ESPORTES (OPCIONAL) ==================
async function preencherSelectEsportes() {
  console.info("[amigos.js] preencherSelectEsportes: função chamada (não implementada nesta página)");
}

// ================== INICIALIZAÇÃO ==================
document.addEventListener("DOMContentLoaded", () => {
  console.log("[amigos.js] 🚀 Inicializando página de amigos...");
  preencherPerfil();
  carregarAmigos();
  carregarEsportes();
  preencherSelectEsportes();
});