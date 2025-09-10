document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  console.log(email);

  try {
    const resposta = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const resultado = await resposta.json();
    document.getElementById('mensagem').innerText = resultado.message;

    if (resposta.ok) {
      //aqui é quando o usuario entar no feed com login
      window.location.href = 'feed.html';
    }
  } catch (error) {
    const msg = document.getElementById('mensagem');
       if (msg) msg.innerText = resultado.message;
  }
});
