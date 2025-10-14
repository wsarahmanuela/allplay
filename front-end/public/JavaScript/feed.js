// Função para criar e enviar um post
async function criarPost() {
  console.log("criar post cahmado")
    const texto = document.getElementById("post-text").value.trim();
    if (!texto) return; // se vazio, não faz nada

    console.log("cpf: ", localStorage.getItem("cpf"))

    // Objeto do post
    const novoPost = {
        autor_CPF: localStorage.getItem("cpf"), // ou pegar do login
        conteudo: texto,
        fotoDePerfil: 'imagens/profile.picture.jpg',
        nome: 'Usuário sem nome',
        data_publicacao: new Date().toLocaleString()
    };

    try {
        // envia para o backend
        const resposta = await fetch('/publicacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoPost)
        });

        console.log("status: " + resposta.status)
        console.log("body: " + resposta.body)

        const dados = await resposta.json();

        if (dados.success) {
            // limpa o campo
            document.getElementById("post-text").value = "";

            // adiciona o post no feed dinamicamente
            const feed = document.getElementById('feed');
            const div = document.createElement('div');
            div.classList.add('post');

            div.innerHTML = `
            <div class="post">
                <div class="post-header">
                  <img src="${novoPost.fotoDePerfil}" class="foto-perfil">
                  <strong>${novoPost.nome}</strong>
                </div>
                <p class="conteudo">${novoPost.conteudo}</p>
                <small class="data">${novoPost.data_publicacao}</small>
                </div>
            `;

            feed.prepend(div); // adiciona no topo do feed
        } else {
            alert(dados.message || "Erro ao publicar.");
        }
    } catch (erro) {
        console.error("Erro na postagem:", erro);
        alert("Erro no servidor. Tente novamente.");
    }
}

// Configurações do menu
var configmenu = document.querySelector(".config-menu");
function configuracoesMenuAlter(){
    configmenu.classList.toggle("config-menu-height");
}

// Função para carregar o feed
async function carregarFeed() {
  console.log("carregar feed chamado")
  try {
    const resposta = await fetch('/publicacoes', {
      method: "GET",
      headers: { 'Content-Type': 'application/json' },
    });

    console.log("status: " + resposta.status)
    console.log("body: " + resposta.body)
 
    const publicacoes = await resposta.json();
   console.log("publicacoes: " + publicacoes.length); 

    const feed = document.getElementById('feed');
    feed.innerHTML = '';

    publicacoes.forEach(pub => {
      const div = document.createElement('div');
      div.classList.add('post');

      div.innerHTML = `
      <div class="post">
        <div class="post-header">
          <img src="${pub.fotoDePerfil || 'default.png'}" class="foto-perfil">
          <strong>${pub.nome}</strong>
        </div>
        <p class="conteudo">${pub.conteudo}</p>
        <small class="data">${pub.data_publicacao}</small>
        </div>
      `;
      feed.appendChild(div);
    });
  } catch (erro) {
    console.error("Erro ao carregar feed:", erro);
  }
}

// Carrega feed ao abrir a página
document.addEventListener("DOMContentLoaded", carregarFeed);

// ================== MOSTRAR ESPORTES DO USUÁRIO NO FEED ==================

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("atalhos-esportes");
  if (!container) return; // se não existir essa div no HTML, sai

  const cpf = localStorage.getItem("cpf");
  if (!cpf) {
    container.innerHTML += "<p>CPF não encontrado. Faça login novamente.</p>";
    return;
  }

  try {
    // Busca os esportes do usuário no backend
    const resposta = await fetch(`http://localhost:3000/esportes/${cpf}`);
    if (!resposta.ok) throw new Error("Erro ao buscar esportes.");

    const esportes = await resposta.json();

    // Caminho base das imagens
    const caminhoImagens = "ImagensEscolhaEsportes/";

    // Limpa e adiciona o título
    container.innerHTML = "<p>Seus esportes</p>";

    if (esportes.length === 0) {
      container.innerHTML += "<p>Você ainda não escolheu esportes.</p>";
      return;
    }

    // Cria os elementos dinamicamente
    esportes.forEach(nome => {
      const a = document.createElement("a");
      a.href = "#";

      // Substitui espaços por nada e letras maiúsculas/minúsculas
      const nomeArquivo = nome
        .normalize("NFD") // remove acentos
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
    container.innerHTML += "<p>Erro ao carregar seus esportes.</p>";
  }
});
//onde o usuario vai postar 
function preencherPerfil() {
    const perfilDiv = document.querySelector(".perfil-usuario div");
    const imgPerfil = document.querySelector(".perfil-usuario img");

    imgPerfil.src = usuarioLogado.foto;
    perfilDiv.innerHTML = `
        <p>${usuarioLogado.nome}</p>
        <small>${usuarioLogado.username} <i class="fa-solid fa-square-arrow-up-right"></i></small>
    `;
}

// Chamar a função ao carregar a página
window.addEventListener("DOMContentLoaded", preencherPerfil);



//VAI BUSCAR O NOME NO BANCO E MOSTRAR NA TELA
document.addEventListener("DOMContentLoaded", async () => {
  const cpf = localStorage.getItem("cpf");

  if (!cpf) {
    alert("Erro: CPF não encontrado. Faça login novamente.");
    window.location.href = "login.html";
    return;
  }

  try {
    const resposta = await fetch(`http://localhost:3000/usuario/${cpf}`);
    const dados = await resposta.json();

    if (dados.success) {
      const usuario = dados.usuario;

      // Atualiza o nome e o @ na tela
      document.getElementById("nomeUsuarioFeed").textContent = usuario.nome;
      document.getElementById("arrobaFeed").textContent = usuario.nomeUsuario;

      // Atualiza a foto de perfil
      const caminhoFoto = `uploads/${usuario.fotoDePerfil}`;
      document.getElementById("fotoPerfilFeed").src = caminhoFoto;
    } else {
      console.error("Erro:", dados.message);
    }
  } catch (erro) {
    console.error("Erro ao carregar dados do usuário:", erro);
  }
});

async function carregarFeed() {
    try {
        const resposta = await fetch('/publicacoes');
        const posts = await resposta.json();

        const feed = document.getElementById("feed");
        feed.innerHTML = ""; // limpa antes de adicionar

        posts.forEach(post => {
            const postDiv = document.createElement("div");
            postDiv.classList.add("post");
            postDiv.innerHTML = `
                <div class="perfil-usuario">
                    <img src="uploads/${post.fotoDePerfil}" alt="Foto de perfil">
                    <div>
                        <p>${post.nome}</p>
                        <small>${post.nomeUsuario} <i class="fa-solid fa-square-arrow-up-right"></i></small>
                    </div>
                </div>
                <div class="post-texto">
                    <p>${post.conteudo}</p>
                </div>
            `;
            feed.appendChild(postDiv);
        });
    } catch (erro) {
        console.error("Erro ao carregar o feed:", erro);
    }
}

window.addEventListener("DOMContentLoaded", carregarFeed);
