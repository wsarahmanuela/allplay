document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const resposta = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const resultado = await resposta.json();
    document.getElementById('mensagem').innerText = resultado.message;

    if (resposta.ok) {
      // Redireciona se login for bem-sucedido
      window.location.href = 'feed.html';
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    document.getElementById('mensagem').innerText = 'Erro ao conectar com o servidor.';
  }
});
