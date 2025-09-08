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

router.post("/login", (req, res) => {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
        return res.status(400).json({ mensagem: "Email e senha são obrigatórios." });
    }

    const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
    db.query(sql, [email, senha], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar usuário:", erro);
            return res.status(500).json({ mensagem: "Erro interno do servidor." });
        }

        if (resultados.length > 0) {
            return res.json({ mensagem: "Login bem-sucedido!" });
        } else {
            return res.status(401).json({ mensagem: "Email ou senha incorretos." });
        }
    });
});
module.exports = router;

