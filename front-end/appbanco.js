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

app.post("/cadastro/foto", upload.single("foto"), (req, res) => {
  const { cpf, bio, nomeUsuario } = req.body; 
  const foto = req.file ? req.file.filename : null;

  if (!cpf || !bio || !foto || !nomeUsuario) { 
    return res.status(400).json({ success: false, message: "Dados incompletos." });
  }

  const sql = "UPDATE usuario SET bio = ?, fotoDePerfil = ?, nomeUsuario = ? WHERE cpf = ?";
  connection.query(sql, [bio, foto, nomeUsuario, cpf], (erro) => {
    if (erro) {
      console.error(erro);
      return res.status(500).json({ success: false, message: "Erro ao salvar no banco." });
    }
    res.json({ success: true });
  });
});

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

app.get("/esportes/mestra", (req, res) => {
  const sql = "SELECT * FROM esporte ORDER BY nome ASC";

  console.log("🔍 Executando query:", sql);

  connection.query(sql, (err, results) => {
    if (err) {
      console.error(" Erro ao buscar esportes:", err);
      return res.status(500).json({ error: "Erro ao buscar esportes." });
    }

    console.log(" Resultados brutos do banco:", results);
    console.log(" Número de registros:", results.length);

    if (results.length > 0) {
      console.log(" Primeiro registro:", results[0]);
      console.log(" Colunas disponíveis:", Object.keys(results[0]));
    }

    const esportes = results.map(row => row.nome);
    console.log(" Enviando para o frontend:", esportes);

    res.json(esportes);
  });
});

// CARREGAR FEED  
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
};

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
      p.data_publicacao,
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

  // filtro opcional por esporte
  if (esporte && esporte.trim() !== "") {
    query += " AND p.esporte = ?";
    params.push(esporte);
  }

  query += " ORDER BY p.data_publicacao DESC";

  connection.query(query, params, (erro, resultados) => {
    if (erro) {
      console.error(" Erro ao buscar publicações do usuário:", erro);
      return res.status(500).json({
        success: false,
        message: "Erro ao carregar publicações do usuário."
      });
    }

    console.log(` ${resultados.length} publicações encontradas para CPF ${cpf}`);
    res.json({
      success: true,
      posts: resultados
    });
  });
});

// ==================== EXCLUIR PUBLICAÇÃO ====================
app.delete('/publicacoes/:id', async (req, res) => {
  const id = req.params.id;

  if (esporte) {
    query += ' AND p.esporte = ?';
    params.push(esporte);
  }

  query += " ORDER BY p.data_publicacao DESC";

  connection.query(query, params, (erro, resultados) => {
    if (erro) {
      console.error(" Erro ao buscar publicações do usuário:", erro);
      return res.status(500).json({
        success: false,
        message: "Erro ao carregar publicações do usuário."
      });
    }

    console.log(` ${resultados.length} publicações encontradas para CPF ${cpf}`);
    res.json({
      success: true,
      posts: resultados
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

// ===================== LISTAR TODAS AS PUBLICAÇÕES =====================
app.get('/publicacoes', (req, res) => {
  console.log("GET PUBLICACOES");

  const query = `
    SELECT 
      p.IDpublicacao,
      p.conteudo,
      p.imagem,
      p.data_publicacao,
      u.nome,
      u.nomeUsuario,
      u.fotoDePerfil,
      p.autor_CPF AS cpf
    FROM publicacao p
    JOIN usuario u ON p.autor_CPF = u.CPF
    ORDER BY p.data_publicacao DESC
  `;

  connection.query(query, (erro, resultados) => {
    if (erro) {
      console.error('Erro ao buscar publicações:', erro);
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar publicações.'
      });
    }

    res.json({
      success: true,
      posts: resultados
    });
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
app.delete('/publicacoes/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await connection
      .promise()
      .query('DELETE FROM curtida WHERE publicacao_ID = ?', [id]);

    await connection
      .promise()
      .query('DELETE FROM publicacao WHERE IDpublicacao = ?', [id]);

    res.json({ success: true, message: 'Publicação excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir publicação:', error);
    res
      .status(500)
      .json({ success: false, message: 'Erro ao excluir publicação.' });
  }
});


// ===================== CURTIDAS =====================
app.get("/publicacoes/:id/curtidas", (req, res) => {
  const id = req.params.id;

  const sql = "SELECT COUNT(*) AS total FROM curtida WHERE publicacao_ID = ?";
  connection.query(sql, [id], (erro, resultados) => {
    if (erro) {
      console.error("Erro ao buscar curtidas:", erro.sqlMessage || erro);
      return res.status(500).json({ success: false, total: 0 });
    }

    const total = resultados[0]?.total || 0;
    res.json({ success: true, total });
  });
});

app.post("/publicacoes/curtir", (req, res) => {
  const { publicacao_ID, usuario_cpf } = req.body;

  if (!publicacao_ID || !usuario_cpf) {
    return res.status(400).json({ success: false, message: "Dados inválidos." });
  }

  const checkSql = "SELECT * FROM curtida WHERE publicacao_ID = ? AND usuario_cpf = ?";
  connection.query(checkSql, [publicacao_ID, usuario_cpf], (erro, resultados) => {
    if (erro) {
      console.error("Erro ao verificar curtida:", erro.sqlMessage || erro);
      return res.status(500).json({ success: false });
    }

    if (resultados.length > 0) {
      const deleteSql = "DELETE FROM curtida WHERE publicacao_ID = ? AND usuario_cpf = ?";
      connection.query(deleteSql, [publicacao_ID, usuario_cpf], (erro2) => {
        if (erro2) {
          console.error("Erro ao remover curtida:", erro2.sqlMessage || erro2);
          return res.status(500).json({ success: false });
        }
        return res.json({ success: true, liked: false });
      });
    } else {
      const insertSql = "INSERT INTO curtida (publicacao_ID, usuario_cpf) VALUES (?, ?)";
      connection.query(insertSql, [publicacao_ID, usuario_cpf], (erro3) => {
        if (erro3) {
          console.error("Erro ao adicionar curtida:", erro3.sqlMessage || erro3);
          return res.status(500).json({ success: false });
        }
        return res.json({ success: true, liked: true });
      });
    }
  });
});

app.get("/publicacoes/:id/verificar-curtida", (req, res) => {
  const id = req.params.id;
  const cpf = req.query.cpf;

  if (!id || !cpf) {
    return res.status(400).json({ success: false, message: "Parâmetros inválidos." });
  }

  const sql = "SELECT * FROM curtida WHERE publicacao_ID = ? AND usuario_cpf = ?";
  connection.query(sql, [id, cpf], (erro, resultados) => {
    if (erro) {
      console.error("Erro ao verificar curtida:", erro.sqlMessage || erro);
      return res.status(500).json({ success: false });
    }

    const jaCurtiu = resultados.length > 0;
    res.json({ success: true, jaCurtiu });
  });
});

app.use(express.static("public"));

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});

//================ MAP ================
// ROTA 1: ATUALIZA LOCALIZAÇÃO E BUSCA USUÁRIOS PRÓXIMOS (Rota POST que estava faltando)
app.post('/api/usuarios-proximos', (req, res) => {
  const { latitude, longitude, cpf } = req.body;
  const raio_metros = 20000; // Raio de busca

  if (!cpf || !latitude || !longitude) {
    return res.status(400).json({ success: false, message: 'Dados incompletos.' });
  }

  const updateSql = "UPDATE usuario SET latitude = ?, longitude = ? WHERE cpf = ?";
  connection.query(updateSql, [latitude, longitude, cpf], (err) => {
    if (err) console.error('Erro ao atualizar localização:', err);
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

app.get('/api/todos-usuarios-mapa', (req, res) => {

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
  SELECT nome, nomeUsuario, fotoDePerfil, CPF
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

app.get("/esportes/:cpf", (req, res) => {
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
});

// ==================== ROTA CORRETA DE UPLOAD DE FOTOS/BANNER ====================
app.post("/usuario/upload-perfil/:cpf", upload.fields([
  { name: 'fotoDePerfil', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), (req, res) => {
  const cpf = req.params.cpf;
  const fotoDePerfilFile = req.files?.fotoDePerfil?.[0];
  const bannerFile = req.files?.banner?.[0];

  if (!cpf) {
    return res.status(400).json({ success: false, message: "CPF é obrigatório." });
  }

  const updates = [];
  const params = [];

  // 1. Verifica e adiciona o banner
  if (bannerFile) {
    updates.push("banner = ?");
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

  const sql = `UPDATE usuario SET ${updates.join(', ')} WHERE cpf = ?`;
  params.push(cpf);

  connection.query(sql, params, (erro) => {
    if (erro) {
      console.error("Erro ao salvar imagens no banco:", erro);
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

  const sql = `
        UPDATE usuario 
        SET nome = ?, nomeUsuario = ?, bio = ?, cidade = ?
        WHERE cpf = ?
    `;


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


// ==================== ROTAS DE CLUBES ====================
// Adicione estas rotas no seu arquivo appbanco.js (Node.js)

// 1. BUSCAR TODOS OS CLUBES CADASTRADOS
app.get("/clubes/todos", (req, res) => {
  const sql = "SELECT IDclube, nome, esporteClube FROM clube ORDER BY nome ASC";
  
  connection.query(sql, (erro, resultados) => {
    if (erro) {
      console.error("Erro ao buscar clubes:", erro);
      return res.status(500).json({ success: false, message: "Erro ao buscar clubes." });
    }
    
    res.json(resultados);
  });
});

// 2. BUSCAR CLUBES DE UM USUÁRIO ESPECÍFICO
app.get("/usuario/:cpf/clubes", (req, res) => {
  const cpf = req.params.cpf;
  
  const sql = `
    SELECT c.IDclube, c.nome, c.esporteClube
    FROM clube c
    INNER JOIN usuario_clube uc ON c.IDclube = uc.IDclube
    WHERE uc.cpf_usuario = ?
    ORDER BY c.nome ASC
  `;
  
  connection.query(sql, [cpf], (erro, resultados) => {
    if (erro) {
      console.error("Erro ao buscar clubes do usuário:", erro);
      return res.status(500).json({ 
        success: false, 
        message: "Erro ao buscar clubes do usuário." 
      });
    }
    
    res.json({ success: true, clubes: resultados });
  });
});

// 3. ADICIONAR CLUBE EXISTENTE AO USUÁRIO
app.post("/usuario/clube/adicionar", (req, res) => {
  const { cpf, idClube } = req.body;
  
  if (!cpf || !idClube) {
    return res.status(400).json({ 
      success: false, 
      message: "CPF e ID do clube são obrigatórios." 
    });
  }
  
  // Verifica se o usuário já tem esse clube
  const checkSql = "SELECT * FROM usuario_clube WHERE cpf_usuario = ? AND IDclube = ?";
  
  connection.query(checkSql, [cpf, idClube], (erro, resultados) => {
    if (erro) {
      console.error("Erro ao verificar clube:", erro);
      return res.status(500).json({ 
        success: false, 
        message: "Erro ao verificar clube." 
      });
    }
    
    if (resultados.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Você já adicionou este clube." 
      });
    }
    
    // Adiciona o clube ao usuário
    const insertSql = "INSERT INTO usuario_clube (cpf_usuario, IDclube) VALUES (?, ?)";
    
    connection.query(insertSql, [cpf, idClube], (erro2) => {
      if (erro2) {
        console.error("Erro ao adicionar clube ao usuário:", erro2);
        return res.status(500).json({ 
          success: false, 
          message: "Erro ao adicionar clube." 
        });
      }
      
      res.json({ success: true, message: "Clube adicionado com sucesso!" });
    });
  });
});

// 4. CRIAR NOVO CLUBE E ADICIONAR AO USUÁRIO
app.post("/usuario/clube/criar", (req, res) => {
  const { cpf, nomeClube, esporte } = req.body;
  
  if (!cpf || !nomeClube || !esporte) {
    return res.status(400).json({ 
      success: false, 
      message: "CPF, nome do clube e esporte são obrigatórios." 
    });
  }
  
  // Verifica se o clube já existe
  const checkSql = "SELECT IDclube FROM clube WHERE nome = ? AND esporteClube = ?";
  
  connection.query(checkSql, [nomeClube, esporte], (erro, resultados) => {
    if (erro) {
      console.error("Erro ao verificar clube existente:", erro);
      return res.status(500).json({ 
        success: false, 
        message: "Erro ao verificar clube." 
      });
    }
    
    if (resultados.length > 0) {
      // Clube já existe, apenas adiciona ao usuário
      const idClubeExistente = resultados[0].IDclube;
      
      const insertRelacao = "INSERT INTO usuario_clube (cpf_usuario, IDclube) VALUES (?, ?)";
      connection.query(insertRelacao, [cpf, idClubeExistente], (erro2) => {
        if (erro2) {
          console.error("Erro ao adicionar clube existente:", erro2);
          return res.status(500).json({ 
            success: false, 
            message: "Erro ao adicionar clube." 
          });
        }
        
        res.json({ 
          success: true, 
          message: "Clube adicionado com sucesso!" 
        });
      });
      
    } else {
      // Cria novo clube
      const insertClube = "INSERT INTO clube (nome, esporteClube) VALUES (?, ?)";
      
      connection.query(insertClube, [nomeClube, esporte], (erro3, resultado) => {
        if (erro3) {
          console.error("Erro ao criar novo clube:", erro3);
          return res.status(500).json({ 
            success: false, 
            message: "Erro ao criar clube." 
          });
        }
        
        const novoIdClube = resultado.insertId;
        
        // Adiciona o novo clube ao usuário
        const insertRelacao = "INSERT INTO usuario_clube (cpf_usuario, IDclube) VALUES (?, ?)";
        
        connection.query(insertRelacao, [cpf, novoIdClube], (erro4) => {
          if (erro4) {
            console.error("Erro ao adicionar novo clube ao usuário:", erro4);
            return res.status(500).json({ 
              success: false, 
              message: "Erro ao adicionar clube." 
            });
          }
          
          res.json({ 
            success: true, 
            message: "Clube criado e adicionado com sucesso!" 
          });
        });
      });
    }
  });
});

// 5. REMOVER CLUBE DO USUÁRIO
app.delete("/usuario/clube/remover", (req, res) => {
  const { cpf, idClube } = req.body;
  
  if (!cpf || !idClube) {
    return res.status(400).json({ 
      success: false, 
      message: "CPF e ID do clube são obrigatórios." 
    });
  }
  
  const sql = "DELETE FROM usuario_clube WHERE cpf_usuario = ? AND IDclube = ?";
  
  connection.query(sql, [cpf, idClube], (erro, resultado) => {
    if (erro) {
      console.error("Erro ao remover clube:", erro);
      return res.status(500).json({ 
        success: false, 
        message: "Erro ao remover clube." 
      });
    }
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Clube não encontrado para este usuário." 
      });
    }
    
    res.json({ success: true, message: "Clube removido com sucesso!" });
  });
});


// A LINHA app.listen DEVE SER A ÚLTIMA!
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});