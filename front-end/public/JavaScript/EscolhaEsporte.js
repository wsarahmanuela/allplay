document.addEventListener("DOMContentLoaded", () => {
    const esportes = document.querySelectorAll(".esporte"); 
    const contador = document.querySelector("#contador h3"); 
    const form = document.getElementById("cadastroForm");
    let selecionados = [];

    // Seleção de esportes
    esportes.forEach(card => {
        card.addEventListener("click", () => {
            const nomeEsporte = card.querySelector(".cardText").innerText;

            if (selecionados.includes(nomeEsporte)) {
                selecionados = selecionados.filter(e => e !== nomeEsporte);
                card.style.border = "2px solid #838186";
                card.style.background = "white";
            } else if (selecionados.length < 5) {
                selecionados.push(nomeEsporte);
                card.style.border = "2px solid #2BA848";
                card.style.background = "#d8f5df";
            } else {
                alert("Você só pode selecionar até 5 esportes.");
            }

            contador.innerText = `${selecionados.length}/5 Selecionados`;
        });
    });

    // Envio para Node e redirecionamento
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // evita envio padrão

        const cpf = document.getElementById('cpf').value.trim();

        if (!cpf) {
            alert("Digite seu CPF!");
            return;
        }
        if (selecionados.length === 0) {
            alert("Você precisa selecionar pelo menos 1 esporte!");
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/esportes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf, esportes: selecionados })
            });

            const data = await res.json();
            console.log(data);

            // Redireciona para o feed passando o CPF
            window.location.href = "feed.html?cpf=" + cpf;

        } catch (err) {
            console.error(err);
            alert("Erro ao salvar os esportes no banco!");
        }
    });
});
