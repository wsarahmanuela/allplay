document.addEventListener('DOMContentLoaded', function () {
    console.log('JavaScript do login carregado!');

    const form = document.getElementById('loginForm');
    const botaoEntrar = document.querySelector('.btn-primary');
    
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            console.log('Tentando fazer login com:', { email, senha: '***' });

            if (!email || !senha) {
                alert('Por favor, preencha email e senha!');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, insira um email válido!');
                return;
            }

            const textoOriginal = botaoEntrar.textContent;

            try {
                const resposta = await fetch('/login', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ email, senha })
                });

                const resultado = await resposta.json();
                console.log('Resposta do servidor:', resultado);

                if (resposta.ok && resultado.message === "Login bem-sucedido!") {
                    console.log('Login bem-sucedido! Redirecionando...');
                    localStorage.setItem("cpf", resultado.cpf)
                    window.location.href = 'feed.html';
                } else {
                    alert('Erro no login: ' + (resultado.message || 'Email ou senha incorretos'));
                }

            } catch (error) {
                console.error('Erro ao fazer login:', error);
                alert('Erro de conexão! Verifique se o servidor está rodando.');
            } finally {
                botaoEntrar.textContent = textoOriginal;
                botaoEntrar.disabled = false;
            }
        });
    }
});
