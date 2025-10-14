document.addEventListener('DOMContentLoaded', function () {
    console.log('JavaScript externo carregado!');

    const form = document.getElementById('cadastroForm');
    const botao = form.querySelector('.btn-cadastrar');
    const textoOriginal = botao.textContent;
    
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const dados = Object.fromEntries(formData.entries());

        console.log('Dados do formulário:', dados);

        // Validação dos campos obrigatórios
        const camposObrigatorios = ['nome', 'telefone', 'cpf', 'cidade', 'email', 'senha'];
        for (let campo of camposObrigatorios) {
            if (!dados[campo] || dados[campo].trim() === '') {
                alert(`Por favor, preencha o campo ${campo.charAt(0).toUpperCase() + campo.slice(1)}`);
                return;
            }
        }

        // Validação das senhas
        if (dados.senha !== dados['confirmar-senha']) {
            alert('As senhas não coincidem!');
            return;
        }

        if (dados.senha.length < 4) {
            alert('A senha deve ter pelo menos 4 caracteres!');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dados.email)) {
            alert('Por favor, insira um email válido!');
            return;
        }

        // Validação do CPF (verificar se tem 11 dígitos)
        const cpfNumeros = dados.cpf.replace(/\D/g, '');
        if (cpfNumeros.length !== 11) {
            alert('Por favor, insira um CPF válido com 11 dígitos!');
            return;
        }

        // Validação do telefone (verificar se tem 10 ou 11 dígitos)
        const telefoneNumeros = dados.telefone.replace(/\D/g, '');
        if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
            alert('Por favor, insira um telefone válido!');
            return;
        }

        botao.textContent = 'Cadastrando...';
        botao.disabled = true;

        try {
            const response = await fetch('/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados)
            });

            const resultado = await response.json();
            console.log('Resposta do servidor:', resultado);

            if (resultado.success) {
                alert('Cadastro realizado com sucesso!');

                // salva o CPF no localStorage (para usar na tela de esportes)
                localStorage.setItem("cpf", dados.cpf);

                // Redirecionamento para a página de escolha de esporte
                setTimeout(() => {
                    window.location.href = 'Cadastro02.html';
                }, 1500); 
            } else {
                alert('Erro: ' + resultado.message);
            }

        } catch (error) {
            console.error('Erro ao enviar:', error);
            alert('Erro de conexão! Verifique se o servidor está rodando.');
        } finally {
            botao.textContent = textoOriginal;
            botao.disabled = false;
        }
    });

    // Formatação do telefone
    document.getElementById('telefone').addEventListener('input', function (e) {
        let valor = e.target.value.replace(/\D/g, '');
        if (valor.length > 11) valor = valor.slice(0, 11);
        valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
        e.target.value = valor.trim();
    });

    // Formatação do CPF
    document.getElementById('cpf').addEventListener('input', function (e) {
        let valor = e.target.value.replace(/\D/g, '');
        if (valor.length > 11) valor = valor.slice(0, 11);
        valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, '$1.$2.$3-$4');
        e.target.value = valor.trim();
    });

});
