document.addEventListener('DOMContentLoaded', function () {//espera o html funcionar
    console.log('JavaScript externo carregado!');

    const form = document.getElementById('cadastroForm');
    const botao = form.querySelector('.btn-cadastrar');
    const textoOriginal = botao.textContent;


    form.addEventListener('submit', async function (e) {
        e.preventDefault();//bloqueia o envio automatico e ele coleta os dados  

        const formData = new FormData(this);//pega os dados do do usuario e transforma em uM "objeto"
        const dados = Object.fromEntries(formData.entries());

        console.log('Dados do formulário:', dados);// ta exibindo o cadastro na web

        if (dados.senha !== dados['confirmar-senha']) {//isso verifica se as duas senha estao certas
            alert('As senhas não coincidem!');
            return;
        }

        if (dados.senha.length < 4) {//valida a senha
            alert('A senha deve ter pelo menos 4 caracteres!');
            return;
        }

        try {//isso ta enviando os dados para o backend (node)
            const response = await fetch('/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados)
            });

            const resultado = await response.json();//isso ta recebendo a resposta pra mostrar se deu erro ou nao
            console.log('Resposta do servidor:', resultado);
            if (resultado.success) {
                alert('Certo' + resultado.message);
                form.reset();
            } else {
                alert('Erro: ' + resultado.message);
            }

        } catch (error) {//isso trata dos erros enviado
            console.error('Erro ao enviar:', error);
            alert('Erro de conexão! Verifique se o servidor está rodando.');
        } finally {
            botao.textContent = textoOriginal;
            botao.disabled = false;
        }
    });

    //telefone
    document.getElementById('telefone').addEventListener('input', function (e) {
        let valor = e.target.value.replace(/\D/g, '');
        valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        e.target.value = valor;
    });

    //CPF
    document.getElementById('cpf').addEventListener('input', function (e) {
        let valor = e.target.value.replace(/\D/g, '');
        valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
        e.target.value = valor;
    });
});
