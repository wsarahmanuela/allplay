function criarPost() {
    let texto = document.getElementById("post-text").value.trim();
    // se o campo estiver vazio, sai da função (maria)
    if (texto === "") return;

    //seleciona onde vai ficar o post (maria)
    let feed = document.querySelector(".main-content");

    // cria uma div-classe p novo post (maria)
    let novoPost = document.createElement("div");
    novoPost.className = "conteudo-post";

        // modelo do post provisorio (maria)
        // inner = sintaxe do ngc
    novoPost.innerHTML = `
        <div class="perfil-usuario">
            <img src="imagens/profile.picture.jpg">
            <div>
                <p>Usuário sem nome</p>
                <small>Agora mesmo</small>
            </div>
        </div>
        <p style="margin-top:10px; color:#333;">${texto}</p>`;

    // só p aparecer no container (por isso vai la pra baixo) - adiciona no final (maria)
    // mudar p cima dps do feed estatico (sarah)
    feed.appendChild(novoPost);

    // limpa o campo antes d postar (maria)
    document.getElementById("post-text").value = "";
}
var configmenu = document.querySelector(".config-menu");
function configuracoesMenuAlter(){
    // toggle = alternar - comando de alternar entre 2 estados (maria)
    configmenu.classList.toggle("config-menu-height");
}