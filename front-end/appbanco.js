const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const mysql2 = require("mysql2");

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, "uploads");
// =================== CONFIGURAÇÃO DO MULTER ===================
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const nomeArquivo = Date.now() + path.extname(file.originalname);
    cb(null, nomeArquivo);
  }
});

const upload = multer({ storage });


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
      (nome, telefone, cpf, cidade, email, senha) 
      VALUES (?, ?, ?, ?, ?, ?)`;

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

// LOGIN ------------------------------------------------
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  console.log('Tentativa de login para:', email);

  if (!email || !senha) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  const sql = "SELECT * FROM usuario WHERE email = ? AND senha = ?";
  connection.query(sql, [email, senha], (erro, resultados) => {
    if (erro) {
      console.error('Erro ao buscar usuário:', erro);
      return res.status(500).json({ message: "Erro no servidor." });
    }

    console.log('Resultados encontrados:', resultados.length);

    if (resultados.length > 0) {
      console.log('Login bem-sucedido para:', email);

      const usuario = resultados[0];

      return res.status(200).json({
        cpf: usuario.CPF,
        message: "Login bem-sucedido!"
      })
    } else {
      console.log('Usuario nao encontrado ou senha incorreta para:', email);
      return res.status(401).json({ message: "Email ou senha incorretos." });
    }
  });
});

app.get('/usuario', (req, res) => {
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



//CADASTRO02 -----------------------------------------------------------------


// ESCOLHA DE ESPORTE --------------------------------------------------------
app.post('/esportes', (req, res) => {
  const { cpf, esportes } = req.body;

  if (!cpf || !esportes || esportes.length === 0) {
    return res.status(400).json({ mensagem: "CPF e esportes são obrigatórios" });
  }

  connection.query("DELETE FROM usuario_esportesdeinteresse WHERE CPF_usuario = ?", [cpf], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensagem: "Erro ao deletar esportes antigos" });
    }

    const valores = esportes.map(e => [cpf, e]);
    connection.query(
      "INSERT INTO usuario_esportesdeinteresse (CPF_usuario, nome_esporte) VALUES ?",
      [valores],
      (err2) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ mensagem: "Erro ao salvar no banco" });
        }

        res.json({ mensagem: "Esportes salvos com sucesso" });
      }
    );
  });
});

app.get("/esportes/:cpf", (req, res) => {// Buscar esportes do ususrio pelo CPF
  const cpf = req.params.cpf;

  connection.query(
    "SELECT nome_esporte FROM usuario_esportesdeinteresse WHERE CPF_usuario = ?",
    [cpf],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ mensagem: "Erro ao buscar esportes" });
      }

      const esportes = rows.map(r => r.nome_esporte);
      res.json(esportes);
    }
  );
});//aqui mai mostrar no feed 

// CARREGAR FEED  
// essa func é importante p carregar as proximas postagens
async function carregarFeed() {
  console.log("Tentando carregar o feed...");

  try {
    const response = await fetch('/publicacoes', {
      method: "GET"
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ao buscar posts! Status: ${response.status}`);
    }

    const posts = await response.json();

    console.log(" Posts recebidos com sucesso. Total:", posts.length);

    // exibirPostsNoHTML(posts); 

  } catch (erro) {
    console.error("Erro fatal ao carregar o feed:", erro);
  }
}

// ===================== PUBLICAÇÕES DO USUÁRIO =====================
app.get('/publicacoes/:cpf', (req, res) => {
  const cpf = req.params.cpf;
  const { esporte } = req.query; // opcional: ?esporte=Vôlei

  console.log(`\n Rota /publicacoes/:cpf chamada com:`);
  console.log(`   CPF: ${cpf}`);
  console.log(`   Esporte: ${esporte || 'todos'}`);
let query = `
  SELECT 
    p.IDpublicacao,
    p.conteudo,
    p.imagem, 
    DATE_FORMAT(CONVERT_TZ(p.data_publicacao, '+00:00', '-03:00'), '%d/%m/%Y %H:%i:%s') AS data_publicacao,
    u.nome,
    u.nomeUsuario,
    u.fotoDePerfil,
    p.esporte,
    p.autor_CPF AS cpf
  FROM publicacao p
  JOIN usuario u ON p.autor_CPF = u.CPF
  WHERE p.autor_CPF = ?
`;

  const params = [cpf];

  if (esporte) {
    query += ' AND p.esporte = ?';
    params.push(esporte);
  }

  query += ' ORDER BY p.data_publicacao DESC';

  connection.query(query, params, (erro, resultados) => {
    if (erro) {
      console.error('Erro ao buscar publicações:', erro);
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar publicações do usuário.',
      });
    }

    console.log(` ${resultados.length} publicações encontradas para CPF ${cpf}`);
    res.json({
      success: true,
      posts: resultados,
    });
  });
});


// PUBLICACOES -------------------------------------------------------------
app.post('/publicacoes', (req, res) => {
  console.log("POST PUBLICACOES");

  const { autor_CPF, conteudo, esporte } = req.body;

  if (!autor_CPF || !conteudo) {
    return res.status(400).json({
      success: false,
      message: 'O CPF do autor e o conteúdo da publicação são obrigatórios!'
    });
  }

  const query = `
    INSERT INTO publicacao (autor_CPF, conteudo, imagem, esporte, data_publicacao)
    VALUES (?, ?, ?, ?, NOW())
  `;

  connection.query(query, [autor_CPF, conteudo, null, esporte], (erro, resultado) => {
    if (erro) {
      console.error('Erro ao inserir publicação:', erro);
      return res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }

    res.json({ success: true, id: resultado.insertId });
  });
});


app.get('/publicacoes', (req, res) => {
  console.log("GET PUBLICACOES");

  const query = `
  SELECT 
    p.IDpublicacao,
    p.conteudo,
    p.imagem,
    DATE_FORMAT(CONVERT_TZ(p.data_publicacao, '+00:00', '-03:00'), '%d/%m/%Y %H:%i:%s') AS data_publicacao,
    u.nome,
    u.nomeUsuario,
    u.fotoDePerfil,
    p.esporte,
    p.autor_CPF AS cpf
  FROM publicacao p
  JOIN usuario u ON p.autor_CPF = u.CPF
  ORDER BY p.data_publicacao DESC
`;
  connection.query(query, (erro, resultados) => {
    if (erro) {
      console.error('Erro ao buscar publicações:', erro);
      return res.status(500).json({ success: false, message: 'Erro ao carregar publicações.' });
    }
    res.json(resultados);
  });
});
// =================== PUBLICAR POSTAGEM (com imagem ou texto) ===================
app.post("/publicacoes/imagem", upload.single("imagem"), (req, res) => {
  const { autor_CPF, conteudo, esporte } = req.body;
  const imagem = req.file ? req.file.filename : null;

  console.log("   Nova publicação recebida:");
  console.log("   CPF:", autor_CPF);
  console.log("   Esporte:", esporte || "nenhum");
  console.log("   Conteúdo:", conteudo?.substring(0, 40) || "(vazio)");

  if (!autor_CPF) {
    return res.status(400).json({
      success: false,
      message: "CPF do autor não informado."
    });
  }

  const sql = `
    INSERT INTO publicacao (autor_CPF, conteudo, imagem, esporte, data_publicacao)
    VALUES (?, ?, ?, ?, NOW())
  `;

  connection.query(sql, [autor_CPF, conteudo, imagem, esporte], (erro) => {
    if (erro) {
      console.error("Erro ao salvar publicação:", erro);
      return res.status(500).json({
        success: false,
        message: "Erro ao salvar publicação no banco."
      });
    }

    res.json({
      success: true,
      message: "Publicação criada com sucesso!"
    });
  });
});

// ==================== EXCLUIR PUBLICAÇÃO ====================
app.delete("/publicacoes/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM publicacao WHERE IDpublicacao = ?";
  connection.query(sql, [id], (erro, resultado) => {
    if (erro) {
      console.error("Erro ao excluir publicação:", erro);
      return res.status(500).json({
        success: false,
        message: "Erro no servidor ao excluir a publicação.",
        erro
      });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Publicação não encontrada.",
      });
    }

    res.json({
      success: true,
      message: "Publicação excluída com sucesso!",
    });
  });
});

// ==================== CURTIDAS ====================
app.post("/publicacoes/curtir", (req, res) => {
  const { idPublicacao, cpf } = req.body;
  console.log("Recebido no /curtir:", req.body);

  const sqlCheck = "SELECT * FROM curtida WHERE publicacao_ID = ? AND usuario_CPF = ?";
  connection.query(sqlCheck, [idPublicacao, cpf], (err, result) => {
    if (err) {
      console.error("Erro SQL ao verificar curtida:", err);
      return res.status(500).json({ error: err.message });
    }

    if (result.length > 0) {
      const sqlDelete = "DELETE FROM curtida WHERE publicacao_ID = ? AND usuario_CPF = ?";
      connection.query(sqlDelete, [idPublicacao, cpf], (err2) => {
        if (err2) {
          console.error("Erro SQL ao remover curtida:", err2);
          return res.status(500).json({ error: err2.message });
        }
        return res.json({ message: "Curtida removida" });
      });
    } else {
      const sqlInsert = "INSERT INTO curtida (publicacao_ID, usuario_CPF) VALUES (?, ?)";
      connection.query(sqlInsert, [idPublicacao, cpf], (err3) => {
        if (err3) {
          console.error("Erro SQL ao inserir curtida:", err3);
          return res.status(500).json({ error: err3.message });
        }
        return res.json({ message: "Curtida adicionada" });
      });
    }
  });
});
// Contar curtidas de cada publicação tem 
app.get("/publicacoes/:id/curtidas", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT COUNT(*) AS total FROM curtida WHERE publicacao_ID = ?";
  connection.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0]);
  });
});

//================ MAP ================
// ROTA 1: ATUALIZA LOCALIZAÇÃO E BUSCA USUÁRIOS PRÓXIMOS (Rota POST que estava faltando)
app.post('/api/usuarios-proximos', (req, res) => {
  const { latitude, longitude, cpf } = req.body;
  const raio_metros = 20000; // Raio de busca

  if (!cpf || !latitude || !longitude) {
    return res.status(400).json({ success: false, message: 'Dados incompletos.' });
  }

  // 1. ATUALIZA a localização do usuário logado
  const updateSql = "UPDATE usuario SET latitude = ?, longitude = ? WHERE cpf = ?";
  connection.query(updateSql, [latitude, longitude, cpf], (err) => {
    // Se houver erro, apenas logamos, mas continuamos a busca
    if (err) console.error('Erro ao atualizar localização:', err);

    // 2. BUSCA com a Fórmula de Haversine
    const haversineQuery = `
              SELECT
                  u.nome,
                  u.fotoDePerfil,
                  ( 6371000 * acos(
                      cos( radians(?) ) * cos( radians( latitude ) )
                      * cos( radians( longitude ) - radians(?) )
                      + sin( radians(?) ) * sin( radians( latitude ) )
                  ) ) AS distancia_m
              FROM
                  usuario u
              WHERE
                  u.cpf != ?
              HAVING
                  distancia_m < ?
              ORDER BY
                  distancia_m
              LIMIT 10
          `;

    const params = [latitude, longitude, latitude, cpf, raio_metros];

    connection.query(haversineQuery, params, (erroBusca, resultados) => {
      if (erroBusca) {
        console.error('Erro na busca Haversine:', erroBusca);
        return res.status(500).json({ success: false, message: 'Erro ao buscar usuários próximos.' });
      }

      const usuariosProximos = resultados.map(usuario => ({
        nome: usuario.nome,
        distancia: Math.round(usuario.distancia_m)
      }));

      res.json({ success: true, usuarios: usuariosProximos });
    });
  });
});

// ROTA 2: BUSCA TODOS OS USUÁRIOS PARA O MAPA (Rota GET que estava dando 404)
app.get('/api/todos-usuarios-mapa', (req, res) => {

  // SQL: Seleciona nome, latitude e longitude da tabela 'usuario'.
  const sql = `
          SELECT CPF, nome, latitude, longitude
          FROM usuario
          WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      `;

  connection.query(sql, (erro, resultados) => {
    if (erro) {
      console.error('Erro ao buscar todos os usuários do MySQL:', erro);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor ao consultar o banco de dados."
      });
    }

    const usuariosParaMapa = resultados.map(u => ({
      cpf: u.CPF,
      nome: u.nome,
      latitude: parseFloat(u.latitude),
      longitude: parseFloat(u.longitude)
    }));

    console.log(`[API] Retornando ${usuariosParaMapa.length} usuários para o mapa.`);

    res.json({
      success: true,
      message: "Lista de todos os usuários para o mapa obtida com sucesso.",
      usuarios: usuariosParaMapa
    });
  });
});





// barra de pesquisa
app.get("/search", (req, res) => {
  const termo = req.query.query;

  if (!termo || termo.trim() === "") {
    return res.json({ usuarios: [], posts: [] });
  }

  const termoLike = `%${termo}%`;

  // Buscar usuários
  const queryUsuarios = `
    SELECT nome, nomeUsuario, fotoDePerfil
    FROM usuario
    WHERE nome LIKE ? OR nomeUsuario LIKE ?
  `;

  // Buscar posts
  const queryPosts = `
    SELECT p.conteudo, u.nome, u.nomeUsuario, u.fotoDePerfil
    FROM publicacao p
    JOIN usuario u ON p.autor_CPF = u.CPF
    WHERE p.conteudo LIKE ?
  `;

  // Executar as duas buscas em paralelo
  connection.query(queryUsuarios, [termoLike, termoLike], (errUsuarios, usuarios) => {
    if (errUsuarios) {
      console.error("Erro ao buscar usuários:", errUsuarios);
      return res.status(500).json({ success: false, message: "Erro ao buscar usuários." });
    }

    connection.query(queryPosts, [termoLike], (errPosts, posts) => {
      if (errPosts) {
        console.error("Erro ao buscar posts:", errPosts);
        return res.status(500).json({ success: false, message: "Erro ao buscar posts." });
      }

      res.json({ usuarios, posts });
    });
  });
});

//NOME DE USUARIO ---------------------------------------------------
app.get("/usuario/:cpf", (req, res) => {
  const cpf = req.params.cpf;

const sql = "SELECT nome, nomeUsuario, fotoDePerfil, bio, banner AS bannerURL, cidade FROM usuario WHERE cpf = ?"

connection.query(sql, [cpf], (erro, resultados) => {
    if (erro) {
      console.error("Erro ao buscar dados do usuário:", erro);
      return res.status(500).json({ success: false, message: "Erro no servidor." });
    }

    if (resultados.length === 0) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    res.json({
      success: true,
      usuario: resultados[0]
    });
  });
});

//==============EDITAR PERFIL==============

// LISTA MESTRA DE ESPORTES (NOVA ROTA)
app.get("/esportes/mestra", (req, res) => {
  // Na vida real, você buscaria isso de uma tabela 'esportes' no seu banco.
  // Aqui, usamos uma lista fixa para o exemplo.
  const todosEsportes = [
    "Basquete", "Futebol", "Vôlei", "Natação", "Corrida",
    "Ciclismo", "Tênis de mesa", "E-Sports", "Atletismo", "Handebol"
  ];
  res.json(todosEsportes);
});

// ==================== ROTA CORRETA DE UPLOAD DE FOTOS/BANNER ====================
app.post("/usuario/upload-perfil/:cpf", upload.fields([
  { name: 'fotoDePerfil', maxCount: 1 }, // Nome do campo deve ser 'fotoDePerfil'
  { name: 'banner', maxCount: 1 }      // Nome do campo deve ser 'banner'
]), (req, res) => {
  const cpf = req.params.cpf;
  const fotoDePerfilFile = req.files?.fotoDePerfil?.[0];
  const bannerFile = req.files?.banner?.[0]; // Agora é o campo 'banner'

  if (!cpf) {
    return res.status(400).json({ success: false, message: "CPF é obrigatório." });
  }

  const updates = [];
  const params = [];

  // 1. Verifica e adiciona o banner
  if (bannerFile) {
    updates.push("banner = ?"); // <<<<<<<<<< CORRIGIDO PARA 'banner'
    params.push(bannerFile.filename);
  }

  // 2. Verifica e adiciona a foto de perfil
  if (fotoDePerfilFile) {
    updates.push("fotoDePerfil = ?");
    params.push(fotoDePerfilFile.filename);
  }

  if (updates.length === 0) {
    return res.status(200).json({ success: true, message: "Nenhuma imagem para atualizar." });
  }

  // Constrói a query de UPDATE
  const sql = `UPDATE usuario SET ${updates.join(', ')} WHERE cpf = ?`;
  params.push(cpf);

  connection.query(sql, params, (erro) => {
    if (erro) {
      console.error("Erro ao salvar imagens no banco:", erro);
      // IMPORTANTE: Se o erro persistir, o problema será nesta query.
      return res.status(500).json({ success: false, message: "Erro ao atualizar imagens no servidor (Erro de Banco de Dados)." });
    }
    res.json({ success: true, message: "Imagens do perfil atualizadas com sucesso." });
  });
});


// ATUALIZAR DADOS DO PERFIL (NOVA ROTA)
app.put("/usuario/atualizar", (req, res) => {
  const { cpf, nomeCompleto, nomeUsuario, bio, localizacao } = req.body;

  if (!cpf) {
    return res.status(400).json({ success: false, message: "CPF é obrigatório para atualização." });
  }

  // Nota: O campo 'cidade' no seu cadastro inicial provavelmente é a 'localizacao'
  const sql = `
        UPDATE usuario 
        SET nome = ?, nomeUsuario = ?, bio = ?, cidade = ?
        WHERE cpf = ?
    `;

  // A foto e o banner são atualizados na rota '/cadastro/foto' (requer FormData)

  connection.query(sql, [nomeCompleto, nomeUsuario, bio, localizacao, cpf], (erro, resultados) => {
    if (erro) {
      console.error("Erro ao atualizar perfil:", erro);
      return res.status(500).json({ success: false, message: "Erro ao atualizar dados no servidor." });
    }

    if (resultados.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    res.json({ success: true, message: "Dados do perfil atualizados com sucesso." });
  });
});

// A LINHA app.listen DEVE SER A ÚLTIMA!
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});