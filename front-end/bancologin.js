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
  database: 'pi_bbd'
});

connection.connect((err) => {//verificação com banco, vai tentar conectar com o bando se der errado mostra no terminar vc code e ser der certo tbm mostra maas mostar com as informacções 
  if (err) {
    console.error('Erro ao conectar no banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL!');
  console.log('Tabela usuarios verificada/criada com sucesso!');
});
// envia o arquivo indexhtml oara a pasta public 
app.get('/', (req, res) => {//GET que envia o HTML pro navegador
  res.sendFile(path.join(__dirname,'public', 'index.html'));
});

app.post('/cadastro', (req, res) => {//isso que envia se der certo as informaçoes para o terminal vc code (POST que recebe os dados do formulario e insere no banco)
  console.log('Requisição recebida:', req.body); // Log para debug
  console.log('Corpo da requisição:', req.body);



  const { nome, telefone, cpf, localizacaoAtual_id, email, senha } = req.body;
    console.log('Dados recebidos para inserção:');
  console.log({
  nome, telefone, cpf, localizacaoAtual_id, email, senha
  });

  //isso so é as validacões
  if (!nome || !telefone || !cpf || !localizacaoAtual_id || !email || !senha) {
    return res.status(400).json({ 
      success: false, 
      message: 'Todos os campos são obrigatorios!' 
    });
  }
//isso é oq insire os dados do usuario no banco(os ? é oq o usario responde)
  const query = `INSERT INTO usuario (nome, telefone, cpf, localizacaoAtual_id, email, senha, bio, fotoDePerfil) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  connection.query(query, [nome, telefone, cpf, localizacaoAtual_id, email, senha, '', ''], (error, results) => {
    if (error) {
      console.error('Erro ao inserir no banco:', error);
      
      //isso é se o erro for pq o cep ou email ja estao cadastrado no nosso sistema, ai avisa o usuario
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
          success: false, 
          message: 'localizacao ou email ja cadastrado!' 
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao cadastrar usuario' 
      });
    }
    //usuario casdastrado com susceso
    console.log('Usuario cadastrado com sucesso!', results);
    res.json({ 
      success: true, 
      message: 'Usuario cadastrado com sucesso!' 
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
