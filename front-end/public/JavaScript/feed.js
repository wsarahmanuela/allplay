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
                <div class="post-header">
                  <img src="${novoPost.fotoDePerfil}" class="foto-perfil">
                  <strong>${novoPost.nome}</strong>
                </div>
                <p class="conteudo">${novoPost.conteudo}</p>
                <small class="data">${novoPost.data_publicacao}</small>
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
        <div class="post-header">
          <img src="${pub.fotoDePerfil || 'default.png'}" class="foto-perfil">
          <strong>${pub.nome}</strong>
        </div>
        <p class="conteudo">${pub.conteudo}</p>
        <small class="data">${pub.data_publicacao}</small>
      `;
      feed.appendChild(div);
    });
  } catch (erro) {
    console.error("Erro ao carregar feed:", erro);
  }
}

// Carrega feed ao abrir a página
document.addEventListener("DOMContentLoaded", carregarFeed);
