const express = require('express');
const app = express();
const mysql2 = require('mysql2');
const path = require('path');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connection = mysql2.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Glsarah25!',
  database: 'pi_bbd'
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar no banco de dados:');
    console.error('Código:', err.code);
    console.error('Mensagem:', err.message);
    console.error('SQL State:', err.sqlState);
    return;
  }
  console.log('Conectado ao banco de dados MySQL!');
  
  connection.query('SHOW TABLES LIKE "usuario"', (err, results) => {
    if (err) {
      console.error('Erro ao verificar tabela:', err);
      return;
    }
    if (results.length > 0) {
      console.log('Tabela usuarios encontrada!');
    } else {
      console.log('Tabela usuarios NAO encontrada!');
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.post('/cadastro', (req, res) => {
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
    VALUES (?, ?, ?, ?, ?, ?, '', '')`;

  connection.query(query, [nome, telefone, cpf, cidade, email, senha], (error, results) => {
    if (error) {
      console.error('Erro ao inserir no banco:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Email ou CPF já cadastrado!'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Erro ao cadastrar usuario'
      });
    }
    console.log('Usuário cadastrado com sucesso!');
    res.json({
      success: true,
      message: 'Usuário cadastrado com sucesso!'
    });
  });
});

// LOGIN
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  console.log('Tentativa de login para:', email);

  if (!email || !senha) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  const sql = "SELECT * FROM usuario WHERE email = ? AND senha = ?";
  connection.query(sql, [email, senha], (erro, resultados) => {
    if (erro) {
      console.error("Erro ao buscar usuário:", erro);
      return res.status(500).json({ message: "Erro no servidor." });
    }

    console.log('Resultados encontrados:', resultados.length);

    if (resultados.length > 0) {
      console.log('Login bem-sucedido para:', email);
      return res.status(200).json({ message: "Login bem-sucedido!" });
    } else {
      console.log('Usuario nao encontrado ou senha incorreta para:', email);
      return res.status(401).json({ message: "Email ou senha incorretos." });
    }
  });
});

app.get('/usuarios', (req, res) => {
  connection.query('SELECT id, nome, email FROM usuario', (erro, resultados) => {
    if (erro) {
      console.error('Erro ao buscar usuários:', erro);
      return res.status(500).json({ message: 'Erro no servidor' });
    }
    res.json(resultados);
  });
});

app.get('/teste', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando!',
    timestamp: new Date().toISOString(),
    database: connection.state
  });
});

app.get('/teste-banco', (req, res) => {
  connection.query('SELECT 1 as test', (erro, resultados) => {
    if (erro) {
      return res.status(500).json({
        success: false,
        message: 'Erro na conexão com o banco',
        error: erro.message
      });
    }
    res.json({
      success: true,
      message: 'Conexão com banco funcionando!',
      result: resultados
    });
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
  console.log('Acesse http://localhost:3000 para ver o formulario');
  console.log('Teste: http://localhost:3000/teste');
  console.log('Teste banco: http://localhost:3000/teste-banco');
});

