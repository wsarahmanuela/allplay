document.addEventListener("DOMContentLoaded", () => {
    const esportes = document.querySelectorAll(".esporte"); 
    const contador = document.querySelector("#contador h3"); 
    let selecionados = [];

    esportes.forEach(card => {
        card.addEventListener("click", () => {
            const nomeEsporte = card.querySelector(".cardText").innerText;

            // Se já está selecionado desseleciona
            if (selecionados.includes(nomeEsporte)) {
                selecionados = selecionados.filter(e => e !== nomeEsporte);
                card.style.border = "2px solid #838186"; // volta para o padrão
                card.style.background = "white";
            } 
            // Se ainda não foi selecionado e ainda tem espaço
            else if (selecionados.length < 5) {
                selecionados.push(nomeEsporte);
                card.style.border = "2px solid #2BA848"; 
                card.style.background = "#d8f5df"; 
            } 
            // Se já tiver 5 impede
            else {
                alert("Você só pode selecionar até 5 esportes.");
            }

            // Atualiza o contador
            contador.innerText = `${selecionados.length}/5 Selecionados`;
        });
    });

    // Captura o botão de finalizar cadastro
    const form = document.getElementById("cadastroForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // Evita enviar direto

        if (selecionados.length === 0) {
            alert("Selecione pelo menos 1 esporte!");
            return;
        }

        // Aqui você poderia mandar para o back-end (PHP, Node, etc)
        // Por enquanto vamos salvar no localStorage (simulação)
        localStorage.setItem("esportesSelecionados", JSON.stringify(selecionados));

        // Redireciona para o feed.html
        window.location.href = "feed.html";
    });
});