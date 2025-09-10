const express = require('express');
const app = express();
const mysql2 = require('mysql2');
const path = require('path');

app.use(express.static('public')); 
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

const connection = mysql2.createConnection({
  user: 'root',
  password: 'Glsarah25!',
  database: 'pi_bbd'
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar no banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL!');
  console.log('Tabela usuarios verificada/criada com sucesso!');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'public', 'index.html'));
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
//LOGIN
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }

    const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
    connection.query(sql, [email, senha], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar usuário:", erro);
            return res.status(500).json({ message: "Erro no servidor." });
        }

        if (resultados.length > 0) {
            return res.status(200).json({ message: "Login bem-sucedido!" });
        } else {
            return res.status(401).json({ message: "Email ou senha incorretos." });
        }
    });
  });

//rota para testar se o servidor esta funcionando (sarah)
app.get('/teste', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});
//so a rota do servidor  
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
  console.log('Acesse http://localhost:3000 para ver o formulario');
});

// node.js, npm install mysql2, npm install express, node bancologin.js (maria)