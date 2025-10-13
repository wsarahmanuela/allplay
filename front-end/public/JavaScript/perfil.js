document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("atalhos-esportes");
  if (!container) return;

  const cpf = localStorage.getItem("cpf");
  if (!cpf) {
    container.innerHTML = "<p>CPF não encontrado. Faça login novamente.</p>";
    return;
  }

  try {
    const resposta = await fetch(`http://localhost:3000/esportes/${cpf}`);
    if (!resposta.ok) throw new Error("Erro ao buscar esportes.");

    let dados;
    try {
      dados = await resposta.json();
    } catch {
      throw new Error("Resposta do servidor não é JSON válida.");
    }

    const esportes = Array.isArray(dados) ? dados : dados.esportes || [];
    const caminhoImagens = "ImagensEscolhaEsportes/";

    container.innerHTML = "<p>Seus esportes</p>";

    if (esportes.length === 0) {
      container.insertAdjacentHTML("beforeend", "<p>Você ainda não escolheu esportes.</p>");
      return;
    }

    esportes.forEach(nome => {
      const a = document.createElement("a");
      a.href = "#";

      const nomeArquivo = nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .toLowerCase();

      const img = document.createElement("img");
      img.src = `${caminhoImagens}${nomeArquivo}.png`;
      img.alt = nome;

      a.appendChild(img);
      a.appendChild(document.createTextNode(nome));
      container.appendChild(a);
    });

  } catch (erro) {
    console.error("Erro ao carregar esportes:", erro);
    container.innerHTML = `<p>Erro ao carregar seus esportes: ${erro.message}</p>`;
  }
});
