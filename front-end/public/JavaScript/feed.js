// ================== PREENCHER PERFIL (CORRIGIDO) ==================
async function preencherPerfil() {
  const urlParams = new URLSearchParams(window.location.search);
  const cpfDaURL = urlParams.get('cpf');

  // Se tem CPF na URL, usa ele. Senão, usa o do localStorage
  const cpf = cpfDaURL || localStorage.getItem("cpf");

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

// ================== CARREGAR FEED (CORRIGIDO) ==================
async function carregarFeed(filtroEsporte = "") {
  const urlParams = new URLSearchParams(window.location.search);
  const cpfDaURL = urlParams.get('cpf');

  const cpf = cpfDaURL || localStorage.getItem("cpf");
  const feed = document.getElementById("feed");
  if (!feed) return;

  try {
    let url;

    if (cpfDaURL) {
      url = filtroEsporte
        ? `http://localhost:3000/publicacoes/${cpfDaURL}?esporte=${encodeURIComponent(filtroEsporte)}`
        : `http://localhost:3000/publicacoes/${cpfDaURL}`;
    } else {
      url = filtroEsporte
        ? `http://localhost:3000/publicacoes/${cpf}?esporte=${encodeURIComponent(filtroEsporte)}`
        : "http://localhost:3000/publicacoes";
    }

    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error("Erro ao buscar publicações");

    const dados = await resposta.json();
    console.log(" Retorno do servidor:", dados);

    const cpfLogado = localStorage.getItem("cpf");
    console.log("CPF logado:", cpfLogado);

    if (Array.isArray(dados)) {
      dados.forEach(p => console.log("Campos disponíveis em cada post:", Object.keys(p)));
    } else if (Array.isArray(dados.posts)) {
      dados.posts.forEach(p => console.log("Campos disponíveis em cada post:", Object.keys(p)));
    }

    let posts = [];
    if (Array.isArray(dados)) {
      posts = dados;
    } else if (Array.isArray(dados.posts)) {
      posts = dados.posts;
    }

    feed.innerHTML = "";

    if (!Array.isArray(posts) || posts.length === 0) {
      feed.innerHTML = `<p class="mensagem-vazia">Nenhuma publicação encontrada.</p>`;
      return;
    }

    posts.forEach(post => {
      const div = document.createElement("div");
      div.classList.add("post");

      const caminhoFoto = post.fotoDePerfil
        ? `http://localhost:3000/uploads/${post.fotoDePerfil}`
        : "imagens/profile.picture.jpg";

      const podeExcluir = post.cpf === cpfLogado;

      let menuHtml = "";
      if (podeExcluir) {
        menuHtml = `
          <div class="post-menu">
            <button class="menu-btn">⋮</button>
            <div class="menu-opcoes">
              <button class="excluir-btn" data-id="${post.IDpublicacao}">Excluir</button>
            </div>
          </div>
        `;
      }

      div.innerHTML = `
        <div class="post-header">
          <img class="foto-perfil" src="${caminhoFoto}" alt="Foto de perfil">
          <div class="post-info">
            <strong class="nome">${post.nome || "Usuário sem nome"}${post.esporte ? ` • <span class="categoria">${post.esporte}</span>` : ""}</strong>
            <span class="usuario">@${(post.nomeUsuario || "usuario").replace("@", "")}</span>
          </div>
          ${menuHtml}
        </div>
      `;

      if (podeExcluir) {
        const menuBtn = div.querySelector(".menu-btn");
        const menuOpcoes = div.querySelector(".menu-opcoes");

        menuBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          menuOpcoes.classList.toggle("ativo");
        });

        document.addEventListener("click", () => menuOpcoes.classList.remove("ativo"));

        const btnExcluir = div.querySelector(".excluir-btn");
        btnExcluir.addEventListener("click", async () => {
          if (confirm("Deseja realmente excluir esta publicação?")) {
            const id = btnExcluir.dataset.id;
            try {
              const resp = await fetch(`http://localhost:3000/publicacoes/${id}`, { method: "DELETE" });
              const resultado = await resp.json();
              if (resultado.success) {
                carregarFeed(filtroEsporte);
              } else {
                alert("Erro ao excluir publicação.");
              }
            } catch (erro) {
              console.error("Erro ao excluir:", erro);
            }
          }
        });
      }

      const conteudoDiv = document.createElement("div");
      conteudoDiv.classList.add("conteudo");
      conteudoDiv.innerHTML = post.conteudo && post.conteudo !== "null" ? post.conteudo : "";
      div.appendChild(conteudoDiv);

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

      const dataDiv = document.createElement("div");
      dataDiv.classList.add("data");

      if (post.data_publicacao) {
        try {
          const data = new Date(post.data_publicacao);

          if (isNaN(data)) {
            dataDiv.textContent = "Data inválida";
          } else {
            dataDiv.textContent = new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "America/Sao_Paulo"
            }).format(data);
          }
        } catch (erro) {
          console.error("Erro ao formatar data:", erro);
          dataDiv.textContent = "Data inválida";
        }
      } else {
        const agora = new Date();
        dataDiv.textContent = new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "America/Sao_Paulo"
        }).format(agora);
      }

      div.appendChild(dataDiv);

      if (post.esporte) {
        const tag = document.createElement("span");
        tag.classList.add("tag-esporte");
        tag.textContent = post.esporte;
        div.appendChild(tag);
      }

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
          console.error("Erro ao curtir publicação:", erro);
        }
      });

      curtidaDiv.appendChild(btnCurtir);
      curtidaDiv.appendChild(contador);
      div.appendChild(curtidaDiv);
      feed.appendChild(div);

      setTimeout(async () => {
        try {
          await atualizarCurtidas();
          await verificarCurtidaUsuario();
        } catch (erro) {
          console.error("Erro ao inicializar curtidas:", erro);
        }
      }, 100);
    });

  } catch (erro) {
    console.error("Erro ao carregar o feed:", erro);
  }
}
// ==================  REMOVER IMAGEM ==================
document.addEventListener("DOMContentLoaded", () => {

  const inputImagem = document.getElementById("input-imagem");
  const preview = document.getElementById("preview-imagem");

  if (!inputImagem || !preview) {
    console.warn("Elementos de imagem não encontrados.");
    return;
  }

  let btnRemover = document.createElement("button");
  btnRemover.id = "btn-remover-imagem";
  btnRemover.innerHTML = "✕";

  Object.assign(btnRemover.style, {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "rgba(0,0,0,0.6)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    padding: "0",
    zIndex: "100"
  });

  const previewContainer = preview.parentElement;
  previewContainer.style.position = "relative";
  previewContainer.appendChild(btnRemover);

  inputImagem.addEventListener("change", (e) => {
    const arquivo = e.target.files[0];

    if (arquivo) {
      imagemSelecionada = arquivo;

      const reader = new FileReader();
      reader.onload = (ev) => {
        preview.src = ev.target.result;
        preview.style.display = "block";
        btnRemover.style.display = "flex";
      };

      reader.readAsDataURL(arquivo);

    } else {
      limparPreview();
    }
  });

  function limparPreview() {
    imagemSelecionada = null;
    preview.src = "";
    preview.style.display = "none";
    inputImagem.value = "";
    btnRemover.style.display = "none";
  }

  btnRemover.addEventListener("click", () => {
    limparPreview();
  });
});
// ================== BARRA DE PESQUISA ==================
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

    inputImagem.addEventListener("change", (e) => {
      const arquivo = e.target.files[0];
      if (arquivo) {
        imagemSelecionada = arquivo;
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
  const selectEsporte = document.getElementById("esportes");
  const esporte = selectEsporte ? selectEsporte.value : "";

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

  if (esporte) formData.append("esporte", esporte);
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
      if (selectEsporte) selectEsporte.value = "";
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
      const div = document.createElement("div");
      div.classList.add("esporte-item");
      div.dataset.esporte = nome;

      const nomeArquivo = nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .toLowerCase();

      div.innerHTML = `
        <a href="#">
          <img src="${caminhoImagens}${nomeArquivo.charAt(0).toUpperCase() + nomeArquivo.slice(1)}.png" 
               onerror="this.src='imagens/default.png'" 
               alt="${nome}">
          ${nome}
        </a>
      `;

      div.addEventListener("click", () => {
        document.querySelectorAll("#atalhos-esportes .esporte-item a").forEach(link => {
          link.classList.remove("ativo");
        });

        const link = div.querySelector("a");
        link.classList.add("ativo");

        carregarFeed(nome);
      });

      container.appendChild(div);
    });

  } catch (erro) {
    console.error("Erro ao carregar esportes:", erro);
  }
}

// ================== PREENCHER SELECT DE ESPORTES ==================
async function preencherSelectEsportes() {
  const select = document.getElementById("esportes");
  if (!select) return;

  const cpf = localStorage.getItem("cpf");
  if (!cpf) return;

  try {
    const resposta = await fetch(`http://localhost:3000/esportes/${cpf}`);
    const esportes = await resposta.json();

    select.innerHTML = '<option value="">Selecionar esporte</option>';

    esportes.forEach(nome => {
      const option = document.createElement("option");
      option.value = nome;
      option.textContent = nome;
      select.appendChild(option);
    });

  } catch (erro) {
    console.error("Erro ao preencher o select de esportes:", erro);
  }
}

// ================== MENU DE CONFIGURAÇÃO ==================
var configmenu = document.querySelector(".config-menu");
function configuracoesMenuAlter() {
  configmenu.classList.toggle("config-menu-height");
}

// ======================================== FUNÇÕES DO EVENTO ========================================
// ==================== ADICIONE ESTE CÓDIGO NO SEU feed.js ====================

// Lista de locais do mapa (mesma do map.js)
// ==================== ADICIONE ESTE CÓDIGO NO SEU feed.js ====================

// Lista de locais do mapa (mesma do map.js)
const locaisDisponiveis = [
  { nome: "Bela Vista Country Club", lat: -26.899, lon: -49.013 },
  { nome: "Ginásio João dos Santos", lat: -26.90931657006177, lon: -48.93409310678638 },
  { nome: "Inove Pádel e Esportes de Areia", lat: -26.942276903407773, lon: -48.95252988781849 },
  { nome: "Arena Gaspar", lat: -26.920699351438124, lon: -48.976817816654595 },
  { nome: "Praça Bela Vista", lat: -26.89727287050033, lon: -49.00191333964011 },
  { nome: "Isete Esportes by Inove", lat: -26.929304174804965, lon: -48.938080845490035 },
  { nome: "Gasparense", lat: -26.926521747537407, lon: -48.96974992262432 },
  { nome: "Tupi", lat: -26.92922675702557, lon: -48.96479585213692 },
  { nome: "Like Fitness Coloninha", lat: -26.927208801355135, lon: -48.96500408151238 },
  { nome: "Pamp´s Academia", lat: -26.92906452085177, lon: -48.962847585571936 },
  { nome: "DO Treinamento Personalizado", lat: -26.929294092275676, lon: -48.96162449832212 },
  { nome: "Jaguar Cross", lat: -26.932125434751175, lon: -48.96106659887484 },
  { nome: "Centro de treinamento Thai Gaspar", lat: -26.93221152175355, lon: -48.958384389993675 },
  { nome: "Academia UFit Gaspar - Centro", lat: -26.929263377155838, lon: -48.955749602066895 },
  { nome: "Like Fitness Centro", lat: -26.92785724446791, lon: -48.953850598179024 },
  { nome: "CHJ Academia", lat: -26.8967637423627, lon: -49.00532891371167 },
  { nome: "Like Fitness Bela Vista", lat: -26.900112570930116, lon: -49.00392343625794 },
  { nome: "Orsi Academia", lat: -26.930199494218737, lon: -48.95102937323139 },
  { nome: "SESC Academia", lat: -26.933599120347086, lon: -48.97256029836956 },
  { nome: "Blulive Academia", lat: -26.914676082775536, lon: -48.979895829053774 },
  { nome: "Parque Ramiro Ruediger", lat: -26.89972137275732, lon: -49.085540768200886 },
  { nome: "Arena BeacHaus", lat: -26.913427531948987, lon: -49.088642134384685 },
  { nome: "Blu Beach Arena", lat: -26.885412432811496, lon: -49.0907020678356 },
  { nome: "Arena catarinense", lat: -26.86872254232852, lon: -49.11456299804246 },
  { nome: "Villaggio Arena", lat: -26.911590689091874, lon: -49.09190369741437 },
  { nome: "Arena Brusque", lat: -27.0957613371662, lon: -48.907089080152176 },
  { nome: "Estádio Augusto Bauer", lat: -27.09916332393507, lon: -48.916444966316725 }
];

// ==================== MODAL DE CRIAR EVENTO (ATUALIZADO) ====================
function abrirModalCriarEvento() {
  document.getElementById('modalCriarEvento').classList.add('ativo');
  carregarEsportesCheckbox();
  carregarClubesEvento();
  preencherSelectLocais(); // ← NOVA FUNÇÃO

  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('dataEvento').min = hoje;
}

function fecharModalCriar() {
  document.getElementById('modalCriarEvento').classList.remove('ativo');
  document.getElementById('formCriarEvento').reset();
}

function fecharModalDetalhes() {
  document.getElementById('modalDetalhesEvento').classList.remove('ativo');
}

// Fechar ao clicar fora
document.getElementById('modalCriarEvento')?.addEventListener('click', (e) => {
  if (e.target.id === 'modalCriarEvento') fecharModalCriar();
});

document.getElementById('modalDetalhesEvento')?.addEventListener('click', (e) => {
  if (e.target.id === 'modalDetalhesEvento') fecharModalDetalhes();
});

// ==================== PREENCHER SELECT DE LOCAIS ====================
function preencherSelectLocais() {
  const select = document.getElementById('localEvento');
  if (!select) return;

  // Limpa e adiciona opção padrão
  select.innerHTML = '<option value="">Selecione um local</option>';

  // Ordena alfabeticamente
  const locaisOrdenados = [...locaisDisponiveis].sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  // Adiciona cada local
  locaisOrdenados.forEach(local => {
    const option = document.createElement('option');
    option.value = local.nome;
    option.dataset.lat = local.lat;
    option.dataset.lon = local.lon;
    option.textContent = local.nome;
    select.appendChild(option);
  });

  // Adiciona opção "Outro local"
  const optionOutro = document.createElement('option');
  optionOutro.value = 'outro';
  optionOutro.textContent = 'Outro local (digite abaixo)';
  select.appendChild(optionOutro);

  // Evento de mudança
  select.addEventListener('change', function () {
    const inputCustom = document.getElementById('localEventoCustom');
    if (this.value === 'outro') {
      if (!inputCustom) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'localEventoCustom';
        input.placeholder = 'Digite o nome do local';
        input.className = 'form-grupo input';
        input.style.marginTop = '10px';
        select.parentElement.appendChild(input);
      }
    } else {
      if (inputCustom) inputCustom.remove();
    }
  });
}

// ==================== CARREGAR ESPORTES ====================
async function carregarEsportesCheckbox() {
  const container = document.getElementById('esportesCheckbox');
  if (!container) return;

  const cpf = localStorage.getItem('cpf');
  if (!cpf) return;

  try {
    const resposta = await fetch(`http://localhost:3000/esportes/${cpf}`);
    const esportes = await resposta.json();

    container.innerHTML = '';

    if (esportes.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#666;">Você ainda não possui esportes cadastrados</p>';
      return;
    }

    esportes.forEach((esporte, index) => {
      const div = document.createElement('div');
      div.classList.add('checkbox-item');
      div.innerHTML = `
                <input type="checkbox" id="esporte${index}" value="${esporte}" name="esportes">
                <label for="esporte${index}">${esporte}</label>
            `;
      container.appendChild(div);
    });
  } catch (erro) {
    console.error('Erro ao carregar esportes:', erro);
    container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#ff0000;">Erro ao carregar esportes</p>';
  }
}

// ==================== CARREGAR CLUBES ====================
async function carregarClubesEvento() {
  const select = document.getElementById('clubeEvento');
  if (!select) return;

  try {
    const resposta = await fetch('http://localhost:3000/clubes/todos');
    const clubes = await resposta.json();

    select.innerHTML = '<option value="">Nenhum clube</option>';
    clubes.forEach(clube => {
      const option = document.createElement('option');
      option.value = clube.IDclube;
      option.textContent = `${clube.nome} - ${clube.esporteClube}`;
      select.appendChild(option);
    });
  } catch (erro) {
    console.error('Erro ao carregar clubes:', erro);
  }
}

// ==================== CRIAR EVENTO (ATUALIZADO) ====================
async function criarEvento(event) {
  event.preventDefault();

  const cpf = localStorage.getItem('cpf');
  if (!cpf) {
    alert('Você precisa estar logado para criar um evento');
    return;
  }

  // Pegar esportes selecionados
  const checkboxes = document.querySelectorAll('input[name="esportes"]:checked');
  const esportesSelecionados = Array.from(checkboxes).map(cb => cb.value);

  if (esportesSelecionados.length === 0) {
    alert('Selecione pelo menos um esporte');
    return;
  }

  // Pegar local (do select ou do input custom)
  const selectLocal = document.getElementById('localEvento');
  const inputCustom = document.getElementById('localEventoCustom');
  let local = '';

  if (selectLocal.value === 'outro' && inputCustom) {
    local = inputCustom.value.trim();
    if (!local) {
      alert('Digite o nome do local');
      return;
    }
  } else {
    local = selectLocal.value;
    if (!local) {
      alert('Selecione um local');
      return;
    }
  }

  const dadosEvento = {
    titulo: document.getElementById('tituloEvento').value,
    responsavel: document.getElementById('responsavelEvento').value,
    local: local,
    data_evento: document.getElementById('dataEvento').value,
    horario: document.getElementById('horarioEvento').value,
    descricao: document.getElementById('descricaoEvento').value,
    esportes: esportesSelecionados.join(', '),
    clube_id: document.getElementById('clubeEvento').value || null,
    criador_cpf: cpf
  };

  console.log('📤 Enviando dados do evento:', dadosEvento);

  try {
    const resposta = await fetch('http://localhost:3000/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosEvento)
    });

    const resultado = await resposta.json();

    if (resultado.success) {
      alert('✅ Evento criado com sucesso!');
      fecharModalCriar();
      carregarEventos();
    } else {
      alert('❌ ' + (resultado.message || 'Erro ao criar evento'));
    }
  } catch (erro) {
    console.error('Erro ao criar evento:', erro);
    alert('Erro ao criar evento. Verifique sua conexão e tente novamente.');
  }
}

// ==================== CARREGAR EVENTOS (COM BOTÃO EXCLUIR) ====================
async function carregarEventos() {
  const container = document.getElementById('container-eventos');
  if (!container) return;

  const cpfLogado = localStorage.getItem('cpf');

  console.log('📥 Carregando eventos...');

  try {
    const resposta = await fetch('http://localhost:3000/eventos');

    console.log('📡 Status da resposta:', resposta.status);

    if (!resposta.ok) {
      const erro = await resposta.json();
      console.error('❌ Erro do servidor:', erro);
      throw new Error(erro.message || 'Erro ao buscar eventos');
    }

    const eventos = await resposta.json();
    console.log('📦 Eventos recebidos:', eventos.length);

    container.innerHTML = '';

    if (eventos.length === 0) {
      container.innerHTML = '<p class="mensagem-eventos-vazia">Nenhum evento cadastrado no momento</p>';
      return;
    }

    eventos.forEach((evento, index) => {
      console.log(`📌 Processando evento ${index + 1}:`, {
        id: evento.IDevento,
        titulo: evento.titulo,
        data_evento: evento.data_evento
      });

      // CORREÇÃO: Adicionar timezone para evitar problema de data
      const dataEvento = new Date(evento.data_evento);

        // Ajuste para fuso horário brasileiro (opcional, mas recomendado)
        dataEvento.setHours(dataEvento.getHours() + 3);

      // Validação da data
      if (isNaN(dataEvento.getTime())) {
        console.error('❌ Data inválida para evento:', evento);
        return; // Pula este evento
      }

      const dia = String(dataEvento.getDate()).padStart(2, '0');
      const mes = dataEvento.toLocaleDateString('pt-BR', { month: 'long' });
      const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);

      console.log(`   ✅ Data processada: ${dia} de ${mesCapitalizado}`);

      const eventoDiv = document.createElement('div');
      eventoDiv.classList.add('event');

      // Verifica se é o criador
      const ehCriador = evento.criador_cpf === cpfLogado;

      eventoDiv.innerHTML = `
                <div class="left-event">
                    <h3>${dia}</h3>
                    <span>${mesCapitalizado}</span>
                </div>
                <div class="right-event">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1; cursor: pointer;" onclick="abrirDetalhesEvento(${evento.IDevento})">
                            <h4>${evento.titulo}</h4>
                            <p><i class="fa-solid fa-location-dot"></i> ${evento.local}</p>
                            <a href="#" onclick="event.preventDefault(); event.stopPropagation(); abrirDetalhesEvento(${evento.IDevento});">Mais informações</a>
                        </div>
                        ${ehCriador ? `
                            <button class="btn-excluir-evento" onclick="confirmarExcluirEvento(${evento.IDevento}, '${evento.titulo.replace(/'/g, "\\'")}'); event.stopPropagation();" title="Excluir evento">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;

      container.appendChild(eventoDiv);
    });

    console.log('✅ Eventos carregados com sucesso!');

  } catch (erro) {
    console.error('❌ Erro ao carregar eventos:', erro);
    container.innerHTML = '<p class="mensagem-eventos-vazia" style="color:#ff0000;">Erro ao carregar eventos: ' + erro.message + '</p>';
  }
}

// ==================== EXCLUIR EVENTO ====================
async function confirmarExcluirEvento(idEvento, tituloEvento) {
  console.log('🗑️ Tentando excluir evento:', idEvento, tituloEvento);

  const confirmar = confirm(`Deseja realmente excluir o evento "${tituloEvento}"?\n\nEsta ação não pode ser desfeita.`);

  if (!confirmar) {
    console.log('❌ Exclusão cancelada pelo usuário');
    return;
  }

  console.log('✅ Usuário confirmou exclusão');

  try {
    console.log('📤 Enviando DELETE para:', `http://localhost:3000/eventos/${idEvento}`);

    const resposta = await fetch(`http://localhost:3000/eventos/${idEvento}`, {
      method: 'DELETE'
    });

    console.log('📥 Resposta recebida, status:', resposta.status);

    const resultado = await resposta.json();
    console.log('📦 Resultado:', resultado);

    if (resultado.success) {
      alert('✅ Evento excluído com sucesso!');
      carregarEventos();
    } else {
      alert('❌ ' + (resultado.message || 'Erro ao excluir evento'));
    }
  } catch (erro) {
    console.error('❌ Erro ao excluir evento:', erro);
    alert('Erro ao excluir evento. Tente novamente.');
  }
}

// ==================== ABRIR DETALHES (COM DESTAQUE NO LOCAL) ====================
async function abrirDetalhesEvento(idEvento) {
  try {
    const resposta = await fetch(`http://localhost:3000/eventos/${idEvento}`);
    const evento = await resposta.json();

    if (!evento.success) {
      alert('Erro ao carregar detalhes do evento');
      return;
    }

    const e = evento.evento;
    const dataEvento = new Date(e.data_evento + 'T00:00:00');
    const dataFormatada = dataEvento.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const esportesArray = e.esportes ? e.esportes.split(',').map(s => s.trim()) : [];
    const esportesTags = esportesArray.map(esp =>
      `<span class="tag-esporte-modal">${esp}</span>`
    ).join('');

    // Verifica se o local está na lista de locais do mapa
    const localEncontrado = locaisDisponiveis.find(local => local.nome === e.local);
    const badgeLocal = localEncontrado ?
      `<span style="background: #e8f5e9; color: #0f9800; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-left: 8px;">NO MAPA</span>` :
      '';

    document.getElementById('tituloDetalhes').textContent = e.titulo;
    document.getElementById('conteudoDetalhes').innerHTML = `
              <p>📅 <strong>Data:</strong> ${dataFormatada}</p>
              <p>⏰ <strong>Horário:</strong> ${e.horario}</p>
              <p>📍 <strong>Local:</strong> ${e.local}</p>
              <p>👤 <strong>Responsável:</strong> ${e.responsavel}</p>
              ${e.descricao ? `<p>📝 <strong>Descrição:</strong><br>${e.descricao}</p>` : ''}
              ${e.clube_nome ? `<p>🛡️ <strong>Clube:</strong> ${e.clube_nome}</p>` : ''}
              ${e.criador_nome ? `<p>👥 <strong>Criado por:</strong> ${e.criador_nome}</p>` : ''}
              <p><strong>Esportes:</strong></p>
              <div class="esportes-tags">${esportesTags}</div>
        `;

    document.getElementById('modalDetalhesEvento').classList.add('ativo');
  } catch (erro) {
    console.error('Erro ao abrir detalhes:', erro);
    alert('Erro ao carregar detalhes do evento');
  }
}


// ================== INICIALIZAÇÃO ==================
document.addEventListener("DOMContentLoaded", () => {
  preencherPerfil();
  carregarFeed();
  carregarEsportes();
  preencherSelectEsportes();
  carregarEventos();
});