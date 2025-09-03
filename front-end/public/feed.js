function criarPost() {
    let texto = document.getElementById("post-text").value.trim();
    if (texto === "") return;

    let feed = document.querySelector(".main-content");

    let novoPost = document.createElement("div");
    novoPost.className = "conteudo-post";

    novoPost.innerHTML = `
        <div class="perfil-usuario">
            <img src="imagens/profile.picture.jpg">
            <div>
                <p>Usuário sem nome</p>
                <small>Agora mesmo</small>
            </div>
        </div>
        <p style="margin-top:10px; color:#333;">${texto}</p>`;

    feed.appendChild(novoPost);

    document.getElementById("post-text").value = "";
}
var configmenu = document.querySelector(".config-menu");
function configuracoesMenuAlter(){
    configmenu.classList.toggle("config-menu-height");
}