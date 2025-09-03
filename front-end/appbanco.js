const express = require('express');//isso é pra criar um servidor web rm node
const app = express();//onde vc configura rotas e servidor e app é uma variavel
const mysql2 = require('mysql2');//isso é a biblioteca para conectar o banco
const path = require('path');//nativo do node para trabalhar com os arquivos

app.use(express.static('public')); //permite servir os aruivos(html,css e o js da pasta public por isso tem que colocar numa pasta publico)
app.use(express.json());//permite que os dados dos usuario chegam no fetch
app.use(express.urlencoded({ extended: true })); // necessario para funcionar com <form> e permite ler oq o usuario colocou no cadastro

const connection = mysql2.createConnection({//isso tudo só é conexao com o banco, ai aqui vai a senha de vcs do banco e o nome da tabela, isso vai mudando
  host: 'localhost',
  user: 'root',
  password: 'Glsarah25!',
  database: 'pi_bbd'//o nome do nosso banco
});

connection.connect((err) => {//verificaçao com banco, vai tentar conectar com o bando se der errado mostra no terminar vc code e ser der certo tbm mostra maas mostar com as informacções 
  if (err) {
    console.error('Erro ao conectar no banco de dados:', err);//tipo se o usuario colocar algo vai aparecer essa mensagem
    return;
  }
  console.log('Conectado ao banco de dados MySQL!');// e esse comentario se estiver tudo certo, isso aparece no terminal ta
  console.log('Tabela usuarios verificada/criada com sucesso!');
});
// envia o arquivo indexhtml oara a pasta public 
app.get('/', (req, res) => {//GET que envia o HTML pro navegador
  res.sendFile(path.join(__dirname,'public', 'index.html'));//ta na pasta publica 
});


app.post('/cadastro', (req, res) => {// isso vai ser usando quando o usuario nao esvrever em todos os campos
  const { nome, telefone, cpf, cidade, email, senha } = req.body;

  if (!nome || !telefone || !cpf || !cidade || !email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Todos os campos são obrigatórios!'
    });
  }

  const query = `
    INSERT INTO usuario 
      (nome, telefone, cpf, cidade, email, senha, bio, fotoDePerfil) 
    VALUES (?, ?, ?, ?, ?, ?, '', '')`;//isso so ta mostrando que vai ser adicionado novas informacoes na tabela



  connection.query(query, [nome, telefone, cpf, cidade, email, senha], (error, results) => {//isso ta executando no banco
    if (error) {//isso verefica se tem algum erro ai vai aparecer essa mensagem
      console.error('Erro ao inserir no banco:', error);
      if (error.code === 'ER_DUP_ENTRY') {//isso vai vereficar se ja tem o email ou spf ja cadastrado no banco 
        return res.status(400).json({
          success: false,
          message: 'Email ou CPF já cadastrado!'
        });
      }
      return res.status(500).json({//ai aqui vai ser outro tipo de erro 
        success: false,
        message: 'Erro ao cadastrar usuario'
      });
    }
    console.log('Usuário cadastrado com sucesso!');
    res.json({
      success: true,
      message: 'Usuário cadastrado com sucesso!'// e aqui mostra se deu certo so 
    });
  });
});

//rota para testar se o servidor esta funcionando
app.get('/teste', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});
//so a rota do servidor 
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
  console.log('Acesse http://localhost:3000 para ver o formulario');
});
