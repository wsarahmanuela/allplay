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
async function carregarFeed(filtroEsporte = "") {
  const cpf = localStorage.getItem("cpf");
  const feed = document.getElementById("feed");
  if (!feed) return;

  try {
    const url = filtroEsporte
      ? `http://localhost:3000/publicacoes/${cpf}?esporte=${encodeURIComponent(filtroEsporte)}`
      : "http://localhost:3000/publicacoes";

    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error("Erro ao buscar publicações");

    const dados = await resposta.json();
    console.log(" Retorno do servidor:", dados);

    console.log("CPF logado:", localStorage.getItem("cpf"));

if (Array.isArray(dados)) {
  dados.forEach(p => console.log("Campos disponíveis em cada post:", Object.keys(p)));
} else if (Array.isArray(dados.posts)) {
  dados.posts.forEach(p => console.log("Campos disponíveis em cada post:", Object.keys(p)));
}


    //  garante que seja sempre um array
    let posts = [];
    if (Array.isArray(dados)) {
      posts = dados;
    } else if (Array.isArray(dados.posts)) {
      posts = dados.posts;
    }

    feed.innerHTML = ""; // limpa feed antes de exibir novos posts

    if (!Array.isArray(posts) || posts.length === 0) {
      feed.innerHTML = "<p>Nenhuma publicação encontrada.</p>";
      return;
    }

    posts.forEach(post => {
  const div = document.createElement("div");
  div.classList.add("post");

  const caminhoFoto = post.fotoDePerfil
    ? `http://localhost:3000/uploads/${post.fotoDePerfil}`
    : "imagens/profile.picture.jpg";

  // CPF do usuário logado
  const cpfLogado = localStorage.getItem("cpf");

  // Verifica se o post pertence ao usuário logado
  const podeExcluir = post.cpf === cpfLogado;

  // Monta o menu (aparece só pro dono do post)
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

  // Estrutura principal do post
  div.innerHTML = `
    <div class="post-header">
      <img class="foto-perfil" src="${caminhoFoto}" alt="Foto de perfil">
      <div class="post-info">
        <strong class="nome">${post.nome || "Usuário sem nome"}</strong>
        <span class="usuario">@${(post.nomeUsuario || "usuario").replace("@", "")}</span>
      </div>
      ${menuHtml}
    </div>
  `;

  // Se houver botão de menu, adiciona o evento
  if (podeExcluir) {
    const menuBtn = div.querySelector(".menu-btn");
    const menuOpcoes = div.querySelector(".menu-opcoes");

    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menuOpcoes.classList.toggle("ativo");
    });

    document.addEventListener("click", () => menuOpcoes.classList.remove("ativo"));

    // Função de exclusão
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

  // Conteúdo do post
  const conteudoDiv = document.createElement("div");
  conteudoDiv.classList.add("conteudo");
  conteudoDiv.innerHTML = post.conteudo && post.conteudo !== "null" ? post.conteudo : "";
  div.appendChild(conteudoDiv);

  // Imagem do post
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

 // ================== DATA FORMATADA CORRIGIDA ==================
const dataDiv = document.createElement("div");
dataDiv.classList.add("data");

if (post.data_publicacao) {
  try {
    let dataString = post.data_publicacao.trim();

    // ✅ Garante formato ISO válido (ex: 2025-11-10T14:23:00)
    if (dataString.includes('/')) {
      // formato dd/mm/yyyy hh:mm:ss
      const [dataParte, tempoParte = "00:00:00"] = dataString.split(' ');
      const [dia, mes, ano] = dataParte.split('/');
      dataString = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${tempoParte}`;
    } else if (dataString.includes(' ')) {
      // formato "2025-11-10 14:00:00"
      dataString = dataString.replace(' ', 'T');
    }

    // ✅ Cria o objeto Date
    const data = new Date(dataString);

    if (isNaN(data)) {
      dataDiv.textContent = "Data inválida";
    } else {
      // ✅ Ajusta automaticamente para o fuso horário do Brasil
      const dataLocal = new Date(data.getTime() - data.getTimezoneOffset() * 60000);

      // ✅ Formata no padrão pt-BR com fuso correto
      dataDiv.textContent = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "America/Sao_Paulo"
      }).format(dataLocal);
    }
  } catch (erro) {
    console.error("Erro ao formatar data:", erro);
    dataDiv.textContent = "Data inválida";
  }
} else {
  // Caso a API ainda não tenha enviado data (por segurança)
  const agora = new Date();
  dataDiv.textContent = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "America/Sao_Paulo"
  }).format(agora);
}

div.appendChild(dataDiv);



  // Esporte (tag)
  if (post.esporte) {
    const tag = document.createElement("span");
    tag.classList.add("tag-esporte");
    tag.textContent = post.esporte;
    div.appendChild(tag);
  }
  // === CURTIDAS ===
  const curtidaDiv = document.createElement("div");
  curtidaDiv.classList.add("curtidas");

  const btnCurtir = document.createElement("button");
  btnCurtir.classList.add("btn-curtir");
  btnCurtir.innerHTML = "❤️ Curtir";//COLOCAR ICONE AQUI NATAN DE CORAÇÃO TA BOM NAO ESQUECE 

  const contador = document.createElement("span");
  contador.classList.add("contador-curtidas");
  contador.textContent = "0 curtidas";

  async function atualizarCurtidas() {
    const resp = await fetch(`http://localhost:3000/publicacoes/${post.IDpublicacao}/curtidas`);
    const dados = await resp.json();
    contador.textContent = `${dados.total} curtida${dados.total !== 1 ? "s" : ""}`;
  }

  btnCurtir.addEventListener("click", async () => {
    const resp = await fetch("http://localhost:3000/publicacoes/curtir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idPublicacao: post.IDpublicacao, cpf: cpfLogado }),
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
  div.appendChild(curtidaDiv);
  atualizarCurtidas();

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
        // Usuários
        resultados.usuarios.forEach(usuario => {
          const div = document.createElement("div");
          div.classList.add("result-item");
          div.innerHTML = `
            <img src="${usuario.fotoDePerfil ? `http://localhost:3000/uploads/${usuario.fotoDePerfil}` : 'imagens/profile.picture.jpg'}" alt="${usuario.nome}">
            <span>${usuario.nome} (@${usuario.nomeUsuario})</span>
          `;
          div.addEventListener("click", () => {
            // exemplo: ir pro perfil do usuário
            window.location.href = `/perfil.html?cpf=${usuario.CPF}`;
          });
          resultsDiv.appendChild(div);
        });

        // Posts
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

  // aqui ta fazendo que nao é obrigrtorio selecionar um esporte 
  const formData = new FormData();
  formData.append("autor_CPF", cpf);
  formData.append("conteudo", texto || "");

  // Envia o esporte apenas se o usuário escolheu
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
      await carregarFeed(); // recarrega o feed geral
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

      //  Quando clica, o nome fica verde e o feed é filtrado
      div.addEventListener("click", () => {
        // remove ativo dos outros
        document.querySelectorAll("#atalhos-esportes .esporte-item a").forEach(link => {
          link.classList.remove("ativo");
        });

        // adiciona ativo ao clicado
        const link = div.querySelector("a");
        link.classList.add("ativo");

        // filtra feed
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

// ================== INICIALIZAÇÃO ==================
document.addEventListener("DOMContentLoaded", () => {
  preencherPerfil();
  carregarFeed();
  carregarEsportes();
  preencherSelectEsportes();
});
