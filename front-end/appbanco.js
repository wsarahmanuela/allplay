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

  console.log(" Executando query:", sql);

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
const queryPromise = (sql, params) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};

app.get('/seguidores/:cpf', async (req, res) => {
    const cpf = req.params.cpf;
    
    console.log(`\n Rota /seguidores/:cpf chamada com:`);
    console.log(`   CPF: ${cpf}`);

    if (!cpf) {
        return res.status(400).json({ success: false, message: 'CPF é obrigatório.' });
    }
    const seguidoresQuery = `
        SELECT COUNT(*) AS total_seguidores 
        FROM Seguidores 
        WHERE CPF_seguido = ?
    `;
    const seguindoQuery = `
        SELECT COUNT(*) AS total_seguindo 
        FROM Seguidores 
        WHERE CPF_seguidor = ?
    `;

    try {

        const [resultadosSeguidores, resultadosSeguindo] = await Promise.all([
            queryPromise(seguidoresQuery, [cpf]),
            queryPromise(seguindoQuery, [cpf])
        ]);

        const totalSeguidores = resultadosSeguidores[0]?.total_seguidores || 0;
        const totalSeguindo = resultadosSeguindo[0]?.total_seguindo || 0;
        
        console.log(` Contagem encontrada: Seguidores: ${totalSeguidores}, Seguindo: ${totalSeguindo}`);

        res.json({
            success: true,
            seguidores: totalSeguidores,
            seguindo: totalSeguindo
        });

    } catch (erro) {
        console.error('Erro ao buscar contagens de seguidores:', erro);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro no servidor ao buscar a contagem.',
            // Opcional, mas útil para debug
            error: erro.message 
        });
    }
});
// Rota para seguir um usuário
app.post('/seguir', async (req, res) => {
    const { cpf_seguidor, cpf_seguido } = req.body;
    
    console.log(`\n Rota /seguir chamada com:`);
    console.log(`   CPF Seguidor: ${cpf_seguidor}`);
    console.log(`   CPF Seguido: ${cpf_seguido}`);

    // Validações
    if (!cpf_seguidor || !cpf_seguido) {
        return res.status(400).json({ 
            success: false, 
            message: 'CPF do seguidor e CPF do seguido são obrigatórios.' 
        });
    }

    if (cpf_seguidor === cpf_seguido) {
        return res.status(400).json({ 
            success: false, 
            message: 'Você não pode seguir a si mesmo.' 
        });
    }

    try {
        // Verificar se já está seguindo
        const verificarQuery = `
            SELECT * FROM Seguidores 
            WHERE CPF_seguidor = ? AND CPF_seguido = ?
        `;
        
        const jaSegue = await queryPromise(verificarQuery, [cpf_seguidor, cpf_seguido]);

        if (jaSegue.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Você já está seguindo este usuário.' 
            });
        }

        // Inserir o novo seguidor
        const inserirQuery = `
            INSERT INTO Seguidores (CPF_seguidor, CPF_seguido) 
            VALUES (?, ?)
        `;
        
        await queryPromise(inserirQuery, [cpf_seguidor, cpf_seguido]);

        console.log(` Usuário ${cpf_seguidor} agora segue ${cpf_seguido}`);

        res.json({
            success: true,
            message: 'Você está seguindo este usuário!'
        });

    } catch (erro) {
        console.error(' Erro ao seguir usuário:', erro);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro no servidor ao seguir o usuário.',
            error: erro.message 
        });
    }
});
// Rota para verificar se um usuário segue outro
app.get('/segue/:cpf_seguidor/:cpf_seguido', async (req, res) => {
    const { cpf_seguidor, cpf_seguido } = req.params;
    
    console.log(`\n🔍 Verificando se ${cpf_seguidor} segue ${cpf_seguido}`);
    
    try {
        const query = `
            SELECT * FROM Seguidores 
            WHERE CPF_seguidor = ? AND CPF_seguido = ?
        `;
        
        const resultado = await queryPromise(query, [cpf_seguidor, cpf_seguido]);
        
        const segue = resultado.length > 0;
        
        console.log(`Resultado: ${segue ? 'Já segue' : 'Não segue'}`);
        
        res.json({ 
            success: true, 
            segue: segue 
        });
        
    } catch (erro) {
        console.error(' Erro ao verificar follow:', erro);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao verificar follow',
            error: erro.message 
        });
    }
});

// Rota para deixar de seguir um usuário
app.delete('/seguir', async (req, res) => {
    const { cpf_seguidor, cpf_seguido } = req.body;
    
    console.log(`\n Rota DELETE /seguir chamada com:`);
    console.log(`   CPF Seguidor: ${cpf_seguidor}`);
    console.log(`   CPF Seguido: ${cpf_seguido}`);

    if (!cpf_seguidor || !cpf_seguido) {
        return res.status(400).json({ 
            success: false, 
            message: 'CPF do seguidor e CPF do seguido são obrigatórios.' 
        });
    }

    try {
        const deletarQuery = `
            DELETE FROM Seguidores 
            WHERE CPF_seguidor = ? AND CPF_seguido = ?
        `;
        
        const resultado = await queryPromise(deletarQuery, [cpf_seguidor, cpf_seguido]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Você não estava seguindo este usuário.' 
            });
        }

        console.log(` Usuário ${cpf_seguidor} deixou de seguir ${cpf_seguido}`);

        res.json({
            success: true,
            message: 'Você deixou de seguir este usuário!'
        });

    } catch (erro) {
        console.error(' Erro ao deixar de seguir:', erro);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro no servidor ao deixar de seguir.',
            error: erro.message 
        });
    }
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

  console.log(`\n [DELETE] Recebida requisição para excluir publicação ID: ${id}`);
  console.log(`   Tipo do ID: ${typeof id}`);

  if (!id || isNaN(id)) {
    console.log('    ID inválido');
    return res.status(400).json({ 
      success: false, 
      message: 'ID da publicação é inválido' 
    });
  }

  try {
    console.log('    Verificando se a publicação existe...');
    const [rows] = await connection
      .promise()
      .query('SELECT IDpublicacao FROM publicacao WHERE IDpublicacao = ?', [id]);

    if (!rows || rows.length === 0) {
      console.log('    Publicação não encontrada no banco');
      return res.status(404).json({ 
        success: false, 
        message: 'Publicação não encontrada' 
      });
    }

    console.log('   ✓ Publicação encontrada, iniciando exclusão...');

    console.log('    Excluindo curtidas...');
    const [resultadoCurtidas] = await connection
      .promise()
      .query('DELETE FROM curtida WHERE publicacao_ID = ?', [id]);
    
    console.log(`   ✓ ${resultadoCurtidas.affectedRows} curtida(s) excluída(s)`);

    console.log('    Excluindo publicação...');
    const [resultadoPublicacao] = await connection
      .promise()
      .query('DELETE FROM publicacao WHERE IDpublicacao = ?', [id]);

    if (resultadoPublicacao.affectedRows === 0) {
      console.log('   Nenhuma linha afetada ao excluir publicação');
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao excluir publicação' 
      });
    }

    console.log('    Publicação excluída com sucesso!\n');

    return res.status(200).json({ 
      success: true, 
      message: 'Publicação excluída com sucesso!' 
    });

  } catch (error) {
    console.error('\n[ERRO CRÍTICO] Erro ao excluir publicação:');
    console.error('   Mensagem:', error.message);
    console.error('   Stack:', error.stack);
    console.error('   SQL State:', error.sqlState);
    console.error('   SQL Message:', error.sqlMessage);
    console.error('   Código:', error.code);

    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao excluir publicação',
      erro: error.message,
      codigo: error.code || 'UNKNOWN'
    });
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

//================ MAP ================
// ROTA 1: ATUALIZA LOCALIZAÇÃO E BUSCA USUÁRIOS PRÓXIMOS (Rota POST que estava faltando)
app.post('/api/usuarios-proximos', (req, res) => {
    const { latitude, longitude, cpf } = req.body;
    const raio_metros = 20000; // 20 km

    console.log('\n Rota /api/usuarios-proximos chamada');
    console.log('   CPF:', cpf);
    console.log('   Lat:', latitude);
    console.log('   Lon:', longitude);

    if (!cpf || !latitude || !longitude) {
        return res.status(400).json({ 
            success: false, 
            message: 'CPF, latitude e longitude são obrigatórios.' 
        });
    }

    const updateSql = "UPDATE usuario SET latitude = ?, longitude = ? WHERE cpf = ?";
    
    connection.query(updateSql, [latitude, longitude, cpf], (errUpdate) => {
        if (errUpdate) {
            console.error(' Erro ao atualizar localização:', errUpdate);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao atualizar localização' 
            });
        }

        console.log(' Localização atualizada');

        const haversineQuery = `
            SELECT
                u.cpf,
                u.nome,
                u.fotoDePerfil,
                ( 6371000 * acos(
                    cos(radians(?)) * cos(radians(u.latitude))
                    * cos(radians(u.longitude) - radians(?))
                    + sin(radians(?)) * sin(radians(u.latitude))
                )) AS distancia_m
            FROM usuario u
            WHERE u.cpf != ?
              AND u.latitude IS NOT NULL 
              AND u.longitude IS NOT NULL
            HAVING distancia_m < ?
            ORDER BY distancia_m
            LIMIT 10
        `;

        const params = [latitude, longitude, latitude, cpf, raio_metros];

        connection.query(haversineQuery, params, (erroBusca, resultados) => {
            if (erroBusca) {
                console.error(' Erro na busca Haversine:', erroBusca);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao buscar usuários próximos.',
                    erro: erroBusca.sqlMessage 
                });
            }

            res.json({
                success: true,
                usuarios: resultados
            });

            console.log(` Retornados ${resultados.length} usuários próximos`);
        });
    });
});

// ENDPOINT: LOCAIS POPULARES
app.get("/api/locais-populares", (req, res) => {
    const sql = `
        SELECT DISTINCT local 
        FROM evento
        WHERE local IS NOT NULL AND local != ''
    `;

    connection.query(sql, (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar locais populares:", erro);
            return res.status(500).json({
                success: false,
                message: "Erro ao buscar locais populares."
            });
        }

        const locais = resultados.map(r => r.local);

        res.json({
            success: true,
            locais
        });
    });
});

app.get('/api/todos-usuarios-mapa', (req, res) => {
  console.log('\n Buscando todos os usuários para o mapa...');

  const sql = `
    SELECT CPF, nome, latitude, longitude
    FROM usuario
    WHERE latitude IS NOT NULL 
      AND longitude IS NOT NULL
  `;

  connection.query(sql, (erro, resultados) => {
    if (erro) {
      console.error(' Erro ao buscar usuários do mapa:', erro);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor ao consultar o banco de dados.",
        erro: erro.sqlMessage
      });
    }

    const usuariosParaMapa = resultados.map(u => ({
      cpf: u.CPF,
      nome: u.nome,
      latitude: parseFloat(u.latitude),
      longitude: parseFloat(u.longitude)
    }));

    console.log(` Retornando ${usuariosParaMapa.length} usuários para o mapa`);

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

// ==================== ROTA DE EXCLUSÃO DE CONTA ====================

app.delete('/usuario/excluir-conta', async (req, res) => {
  const { cpf, confirmacao } = req.body;

  console.log('\n Solicitação de exclusão de conta recebida');
  console.log('   CPF:', cpf);
  console.log('   Confirmação:', confirmacao);

  if (!cpf || !confirmacao) {
    return res.status(400).json({
      success: false,
      message: 'CPF e confirmação são obrigatórios.'
    });
  }

  if (confirmacao !== 'EXCLUIR') {
    return res.status(400).json({
      success: false,
      message: 'Confirmação inválida.'
    });
  }

  try {
    await connection.promise().beginTransaction();

    await connection.promise().query('DELETE FROM curtida WHERE usuario_cpf = ?', [cpf]);
    console.log('   ✓ Curtidas excluídas');

    await connection.promise().query(
      'DELETE FROM curtida WHERE publicacao_ID IN (SELECT IDpublicacao FROM publicacao WHERE autor_CPF = ?)',
      [cpf]
    );
    console.log('   ✓ Curtidas nas publicações excluídas');

    await connection.promise().query('DELETE FROM publicacao WHERE autor_CPF = ?', [cpf]);
    console.log('   ✓ Publicações excluídas');

    await connection.promise().query('DELETE FROM usuario_esportesdeinteresse WHERE CPF_usuario = ?', [cpf]);
    console.log('   ✓ Esportes de interesse excluídos');

    await connection.promise().query('DELETE FROM usuario_clube WHERE cpf_usuario = ?', [cpf]);
    console.log('   ✓ Relação com clubes excluída');

    await connection.promise().query('DELETE FROM Seguidores WHERE CPF_seguido = ?', [cpf]);
    console.log('   ✓ Seguidores excluídos');

    await connection.promise().query('DELETE FROM Seguidores WHERE CPF_seguidor = ?', [cpf]);
    console.log('   ✓ Seguindo excluído');

    const [resultadoUsuario] = await connection.promise().query('DELETE FROM usuario WHERE CPF = ?', [cpf]);

    if (resultadoUsuario.affectedRows === 0) {
      await connection.promise().rollback();
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }
    console.log('   ✓ Usuário excluído');

    await connection.promise().commit();
    console.log(' Conta excluída com sucesso!\n');

    res.json({
      success: true,
      message: 'Conta excluída com sucesso!'
    });

  } catch (erro) {
    await connection.promise().rollback();

    console.error('❌ Erro ao excluir conta:', erro);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir conta. Tente novamente.'
    });
  }
});


// ==================== BUSCAR AMIGOS MÚTUOS ====================
app.get("/mutuos/:cpf", (req, res) => {
  const cpf = req.params.cpf;

  console.log('\n👥 [API] Rota /mutuos/:cpf CHAMADA!');
  console.log('   CPF recebido:', cpf);

  const sql = `
    SELECT DISTINCT
      u.CPF,
      u.nome,
      u.nomeUsuario,
      u.fotoDePerfil,
      GROUP_CONCAT(DISTINCT e.nome_esporte) as esportes
    FROM usuario u
    INNER JOIN Seguidores s1 
      ON s1.CPF_seguidor = ? AND s1.CPF_seguido = u.CPF
    INNER JOIN Seguidores s2 
      ON s2.CPF_seguido = ? AND s2.CPF_seguidor = u.CPF
    LEFT JOIN usuario_esportesdeinteresse e 
      ON e.CPF_usuario = u.CPF
    GROUP BY u.CPF, u.nome, u.nomeUsuario, u.fotoDePerfil
    ORDER BY u.nome ASC
  `;

  connection.query(sql, [cpf, cpf], (erro, resultados) => {
    if (erro) {
      console.error("❌ Erro SQL ao buscar amigos mútuos:", erro);
      return res.status(500).json({ 
        success: false,
        message: "Erro no servidor ao buscar amigos.",
        amigos: [] 
      });
    }

    console.log(`✅ Query executada! ${resultados.length} amigos mútuos encontrados`);

    const amigosFormatados = resultados.map(amigo => ({
      ...amigo,
      esportes: amigo.esportes ? amigo.esportes.split(',') : []
    }));

    console.log('📤 Enviando resposta:', amigosFormatados);
    res.json(amigosFormatados);
  });
});


// ==================== ROTAS DE EVENTOS ====================

// 1. CRIAR EVENTO
app.post('/eventos', (req, res) => {
  console.log('\n========================================');
  console.log(' ROTA POST /eventos CHAMADA');
  console.log('========================================');
  
  // Log do body recebido
  console.log(' Body recebido:', JSON.stringify(req.body, null, 2));
  
  const { titulo, responsavel, local, data_evento, horario, descricao, esportes, clube_id, criador_cpf } = req.body;

  // Log de cada campo
  console.log('\n Campos extraídos:');
  console.log('   - titulo:', titulo);
  console.log('   - responsavel:', responsavel);
  console.log('   - local:', local);
  console.log('   - data_evento:', data_evento);
  console.log('   - horario:', horario);
  console.log('   - descricao:', descricao);
  console.log('   - esportes:', esportes);
  console.log('   - clube_id:', clube_id);
  console.log('   - criador_cpf:', criador_cpf);

  // Validação com logs específicos
  if (!titulo) {
    console.log(' ERRO: Título não informado');
    return res.status(400).json({
      success: false,
      message: 'Título é obrigatório'
    });
  }

  if (!responsavel) {
    console.log(' ERRO: Responsável não informado');
    return res.status(400).json({
      success: false,
      message: 'Responsável é obrigatório'
    });
  }

  if (!local) {
    console.log(' ERRO: Local não informado');
    return res.status(400).json({
      success: false,
      message: 'Local é obrigatório'
    });
  }

  if (!data_evento) {
    console.log(' ERRO: Data não informada');
    return res.status(400).json({
      success: false,
      message: 'Data do evento é obrigatória'
    });
  }

  if (!horario) {
    console.log(' ERRO: Horário não informado');
    return res.status(400).json({
      success: false,
      message: 'Horário é obrigatório'
    });
  }

  if (!criador_cpf) {
    console.log(' ERRO: CPF do criador não informado');
    return res.status(400).json({
      success: false,
      message: 'CPF do criador é obrigatório'
    });
  }

  console.log('\n Validação passou! Preparando SQL...');

  const sql = `
    INSERT INTO evento (titulo, responsavel, local, data_evento, horario, descricao, esportes, clube_id, criador_cpf)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  console.log(' SQL preparado:', sql);
  console.log(' Parâmetros:', [
    titulo,
    responsavel,
    local,
    data_evento,
    horario,
    descricao || null,
    esportes || null,
    clube_id || null,
    criador_cpf
  ]);

  connection.query(sql, [
    titulo,
    responsavel,
    local,
    data_evento,
    horario,
    descricao || null,
    esportes || null,
    clube_id || null,
    criador_cpf
  ], (erro, resultado) => {
    if (erro) {
      console.log('\n========================================');
      console.error(' ERRO SQL COMPLETO:', erro);
      console.log('========================================');
      console.error('   Código do erro:', erro.code);
      console.error('   SQL State:', erro.sqlState);
      console.error('   Mensagem:', erro.sqlMessage);
      console.error('   SQL:', erro.sql);
      
      return res.status(500).json({
        success: false,
        message: 'Erro no servidor ao criar evento',
        erro: erro.sqlMessage // Adiciona mensagem de erro para debug
      });
    }

    console.log('\n========================================');
    console.log(' EVENTO CRIADO COM SUCESSO!');
    console.log('========================================');
    console.log('   ID do evento:', resultado.insertId);
    console.log('   Linhas afetadas:', resultado.affectedRows);
    
    res.json({
      success: true,
      message: 'Evento criado com sucesso',
      eventoId: resultado.insertId
    });
  });
});

// 2. LISTAR TODOS OS EVENTOS (ordenados por data)
app.get('/eventos', (req, res) => {
  console.log('\n Buscando todos os eventos...');

  // ATENÇÃO: Mudei para 'evento' (singular) baseado nos seus ALTER TABLE
  const sql = `
    SELECT 
      e.*,
      c.nome as clube_nome,
      u.nome as criador_nome
    FROM evento e
    LEFT JOIN clube c ON e.clube_id = c.IDclube
    LEFT JOIN usuario u ON e.criador_cpf = u.CPF
    WHERE e.data_evento >= CURDATE()
    ORDER BY e.data_evento ASC, e.horario ASC
  `;

  connection.query(sql, (erro, eventos) => {
    if (erro) {
      console.error(' Erro ao listar eventos:', erro);
      console.error('   SQL State:', erro.sqlState);
      console.error('   Mensagem:', erro.sqlMessage);
      
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar eventos',
        erro: erro.sqlMessage
      });
    }

    console.log(` ${eventos.length} eventos encontrados`);
    res.json(eventos);
  });
});

// 3. BUSCAR EVENTO POR ID (com detalhes completos)
app.get('/eventos/:id', (req, res) => {
  const { id } = req.params;
  console.log(`\n Buscando evento ID: ${id}`);

  const sql = `
    SELECT 
      e.*,
      c.nome as clube_nome,
      u.nome as criador_nome,
      u.nomeUsuario as criador_usuario
    FROM evento e
    LEFT JOIN clube c ON e.clube_id = c.IDclube
    LEFT JOIN usuario u ON e.criador_cpf = u.CPF
    WHERE e.IDevento = ?
  `;

  connection.query(sql, [id], (erro, eventos) => {
    if (erro) {
      console.error(' Erro ao buscar evento:', erro);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar evento',
        erro: erro.sqlMessage
      });
    }

    if (eventos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado'
      });
    }

    console.log(' Evento encontrado:', eventos[0].titulo);
    res.json({
      success: true,
      evento: eventos[0]
    });
  });
});

// 4. ATUALIZAR EVENTO
app.put('/eventos/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, responsavel, local, data_evento, horario, descricao, esportes, clube_id } = req.body;

  console.log(`\n Atualizando evento ID: ${id}`);

  const sql = `
    UPDATE evento
    SET titulo = ?, responsavel = ?, local = ?, data_evento = ?, 
        horario = ?, descricao = ?, esportes = ?, clube_id = ?
    WHERE IDevento = ?
  `;

  connection.query(sql, [
    titulo,
    responsavel,
    local,
    data_evento,
    horario,
    descricao || null,
    esportes || null,
    clube_id || null,
    id
  ], (erro, resultado) => {
    if (erro) {
      console.error(' Erro ao atualizar evento:', erro);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar evento'
      });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado'
      });
    }

    console.log(' Evento atualizado com sucesso');
    res.json({
      success: true,
      message: 'Evento atualizado com sucesso'
    });
  });
});

// 5. DELETAR EVENTO
app.delete('/eventos/:id', (req, res) => {
  const { id } = req.params;

  console.log(`\n Deletando evento ID: ${id}`);

  const sql = 'DELETE FROM evento WHERE IDevento = ?';

  connection.query(sql, [id], (erro, resultado) => {
    if (erro) {
      console.error(' Erro ao deletar evento:', erro);
      return res.status(500).json({
        success: false,
        message: 'Erro ao deletar evento'
      });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado'
      });
    }

    console.log(' Evento deletado com sucesso');
    res.json({
      success: true,
      message: 'Evento deletado com sucesso'
    });
  });
});

// 6. BUSCAR EVENTOS POR ESPORTE
app.get('/eventos/esporte/:esporte', (req, res) => {
  const { esporte } = req.params;

  console.log(`\n Buscando eventos do esporte: ${esporte}`);

  const sql = `
    SELECT e.*, c.nome as clube_nome
    FROM evento e
    LEFT JOIN clube c ON e.clube_id = c.IDclube
    WHERE e.esportes LIKE ? AND e.data_evento >= CURDATE()
    ORDER BY e.data_evento ASC
  `;

  connection.query(sql, [`%${esporte}%`], (erro, evento) => {
    if (erro) {
      console.error(' Erro ao buscar eventos por esporte:', erro);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar eventos'
      });
    }

    console.log(` ${evento.length} eventos encontrados`);
    res.json(evento);
  });
});

// 7. BUSCAR EVENTOS DE UM USUÁRIO
app.get('/eventos/usuario/:cpf', (req, res) => {
  const { cpf } = req.params;

  console.log(`\n Buscando eventos criados pelo CPF: ${cpf}`);

  const sql = `
    SELECT e.*, c.nome as clube_nome
    FROM evento e
    LEFT JOIN clube c ON e.clube_id = c.IDclube
    WHERE e.criador_cpf = ?
    ORDER BY e.data_evento DESC
  `;

  connection.query(sql, [cpf], (erro, evento) => {
    if (erro) {
      console.error(' Erro ao buscar eventos do usuário:', erro);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar eventos'
      });
    }

    console.log(` ${evento.length} eventos encontrados`);
    res.json({
      success: true,
      eventos: evento
    });
  });
});
// ==================== TESTE DE ROTAS ====================
app.get("/teste-rotas", (req, res) => {
  res.json({
    message: "Servidor funcionando!",
    rotas_disponiveis: [
      "GET /mutuos/:cpf",
      "GET /usuario/:cpf",
      "POST /seguir",
      "DELETE /seguir"
    ]
  });
});
// A LINHA app.listen DEVE SER A ÚLTIMA!
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});