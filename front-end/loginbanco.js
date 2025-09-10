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