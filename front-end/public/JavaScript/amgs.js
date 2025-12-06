// ================== UTILITÁRIOS ==================
function formatarCPF(cpf) {
  if (!cpf) return '';
  const numeros = cpf.replace(/\D/g, '');
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ================== LOCAIS DO MAPA ==================
const locaisDisponiveis = [
  { nome: "Bela Vista Country Club", lat: -26.899, lon: -49.013 },
  { nome: "Ginásio João dos Santos", lat: -26.90931657006177, lon: -48.93409310678638 },
  { nome: "Inove Pádel e Esportes de Areia", lat: -26.942276903407773, lon: -48.95252988781849 },
  { nome: "Arena Gaspar", lat: -26.920699351438124, lon: -48.976817816654595 },
  { nome: "Praça Bela Vista", lat: -26.89727287050033, lon: -49.00191333964011 },
  { nome: "Isete Esportes by Inove", lat: -26.929304174804965, lon: -48.938080845490035 },
  { nome: "Gasparense", lat: -26.926521747537407, lon: -48.96974992262432 },
  { nome: "Tupi", lat: -26.92922675702557, lon: -48.96479585213692 },
  { nome: "Like Fitness Coloninha", lat: -26.927208801355135, lon: -48.96500408151238 },
  { nome: "Pamp´s Academia", lat: -26.92906452085177, lon: -48.962847585571936 },
  { nome: "DO Treinamento Personalizado", lat: -26.929294092275676, lon: -48.96162449832212 },
  { nome: "Jaguar Cross", lat: -26.932125434751175, lon: -48.96106659887484 },
  { nome: "Centro de treinamento Thai Gaspar", lat: -26.93221152175355, lon: -48.958384389993675 },
  { nome: "Academia UFit Gaspar - Centro", lat: -26.929263377155838, lon: -48.955749602066895 },
  { nome: "Like Fitness Centro", lat: -26.92785724446791, lon: -48.953850598179024 },
  { nome: "CHJ Academia", lat: -26.8967637423627, lon: -49.00532891371167 },
  { nome: "Like Fitness Bela Vista", lat: -26.900112570930116, lon: -49.00392343625794 },
  { nome: "Orsi Academia", lat: -26.930199494218737, lon: -48.95102937323139 },
  { nome: "SESC Academia", lat: -26.933599120347086, lon: -48.97256029836956 },
  { nome: "Blulive Academia", lat: -26.914676082775536, lon: -48.979895829053774 },
  { nome: "Parque Ramiro Ruediger", lat: -26.89972137275732, lon: -49.085540768200886 },
  { nome: "Arena BeacHaus", lat: -26.913427531948987, lon: -49.088642134384685 },
  { nome: "Blu Beach Arena", lat: -26.885412432811496, lon: -49.0907020678356 },
  { nome: "Arena catarinense", lat: -26.86872254232852, lon: -49.11456299804246 },
  { nome: "Villaggio Arena", lat: -26.911590689091874, lon: -49.09190369741437 },
  { nome: "Arena Brusque", lat: -27.0957613371662, lon: -48.907089080152176 },
  { nome: "Estádio Augusto Bauer", lat: -27.09916332393507, lon: -48.916444966316725 }
];

// ================== PERFIL E NAVBAR ==================
async function carregarFotoNavbar() {
  try {
    let cpf = localStorage.getItem("cpf");
    if (!cpf) return;

    cpf = formatarCPF(cpf);
    
    const resp = await fetch(`http://localhost:3000/usuario/${encodeURIComponent(cpf)}`);
    if (!resp.ok) return;
    
    const dados = await resp.json();
    if (!dados || !dados.usuario) return;

    const usuario = dados.usuario;
    const foto = usuario.fotoDePerfil 
      ? `http://localhost:3000/uploads/${usuario.fotoDePerfil}` 
      : "imagens/profile.picture.jpg";

    const fotoNavbar = document.querySelector(".nav-user-icon img") 
                    || document.querySelector("header img")
                    || document.getElementById("fotoPerfilNavbar");
    
    if (fotoNavbar) {
      fotoNavbar.src = foto;
      console.log("[amigos.js] ✅ Foto do navbar carregada");
    }

  } catch (err) {
    console.error("[amigos.js] ❌ carregarFotoNavbar erro:", err);
  }
}

async function preencherPerfil() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const cpfDaURL = urlParams.get('cpf');
    let cpf = cpfDaURL || localStorage.getItem("cpf");
    if (!cpf) return;

    cpf = formatarCPF(cpf);

    const resp = await fetch(`http://localhost:3000/usuario/${encodeURIComponent(cpf)}`);
    if (!resp.ok) return;
    
    const dados = await resp.json();
    if (!dados || !dados.usuario) return;

    const usuario = dados.usuario;
    const nome = usuario.nome || "Usuário sem nome";
    const arroba = usuario.nomeUsuario ? `@${usuario.nomeUsuario}` : "@usuario";
    const foto = usuario.fotoDePerfil ? `http://localhost:3000/uploads/${usuario.fotoDePerfil}` : "imagens/profile.picture.jpg";

    const nomeTopo = document.getElementById("nomeUsuarioFeed");
    const arrobaTopo = document.getElementById("arrobaFeed");
    const fotoTopo = document.getElementById("fotoPerfilFeed");

    if (nomeTopo) nomeTopo.textContent = nome;
    if (arrobaTopo) arrobaTopo.textContent = arroba;
    if (fotoTopo) fotoTopo.src = foto;

  } catch (err) {
    console.error("[amigos.js] ❌ preencherPerfil erro:", err);
  }
}

// ================== AMIGOS ==================
async function carregarAmigos() {
  try {
    const container = document.getElementById("listaAmigos");
    if (!container) {
      console.error("[amigos.js] ❌ #listaAmigos não encontrado");
      return;
    }

    let cpf = localStorage.getItem("cpf");
    if (!cpf) {
      container.innerHTML = "<p>Erro: usuário não logado.</p>";
      return;
    }

    cpf = formatarCPF(cpf);
    
    const resposta = await fetch(`http://localhost:3000/mutuos/${encodeURIComponent(cpf)}`);

    if (!resposta.ok) {
      container.innerHTML = `<p>Erro ao buscar amigos (status ${resposta.status}).</p>`;
      return;
    }

    const amigos = await resposta.json();

    let lista = [];
    if (Array.isArray(amigos)) {
      lista = amigos;
    } else if (Array.isArray(amigos.amigos)) {
      lista = amigos.amigos;
    } else if (Array.isArray(amigos.data)) {
      lista = amigos.data;
    }

    container.innerHTML = "";

    if (!Array.isArray(lista) || lista.length === 0) {
      container.innerHTML = "<p>Você ainda não possui amigos mútuos.</p>";
      return;
    }

    lista.forEach(amigo => {
      const cpfAmigo = amigo.CPF || amigo.cpf;
      const esportes = Array.isArray(amigo.esportes) ? amigo.esportes : (amigo.esportes ? [String(amigo.esportes)] : []);
      const foto = amigo.fotoDePerfil ? `http://localhost:3000/uploads/${amigo.fotoDePerfil}` : "imagens/profile.picture.jpg";
      const nome = amigo.nome || amigo.nomeUsuario || "Usuário";
      const nomeUsuario = amigo.nomeUsuario || (amigo.arroba ? amigo.arroba.replace(/^@/, "") : "usuario");

      const div = document.createElement("div");
      div.className = "user-card";
      div.style.cursor = "pointer";

      div.innerHTML = `
        <img class="user-avatar" src="${foto}" alt="${escapeHtml(nome)}">
        <div class="user-info">
          <h3>${escapeHtml(nome)}</h3>
          <p class="arroba">@${escapeHtml(nomeUsuario)}</p>
          <div class="tags">${esportes.map(e => `<span class="tag">${escapeHtml(e)}</span>`).join("")}</div>
        </div>
      `;

      div.addEventListener("click", () => {
        if (cpfAmigo) {
          window.location.href = `perfilSeguir.html?cpf=${encodeURIComponent(cpfAmigo)}`;
        }
      });

      container.appendChild(div);
    });

  } catch (err) {
    console.error("[amigos.js] ❌ carregarAmigos erro:", err);
    const container = document.getElementById("listaAmigos");
    if (container) container.innerHTML = "<p>Erro ao carregar amigos.</p>";
  }
}

// ================== ESPORTES ==================
async function carregarEsportes() {
  try {
    let cpf = localStorage.getItem("cpf");
    if (!cpf) return;

    cpf = formatarCPF(cpf);

    const container = document.getElementById("atalhos-esportes");
    if (!container) return;

    const resposta = await fetch(`http://localhost:3000/esportes/${encodeURIComponent(cpf)}`);
    if (!resposta.ok) return;

    const esportes = await resposta.json();
    
    container.innerHTML = "";
    
    const p = document.createElement("p");
    p.textContent = "Seus esportes";
    container.appendChild(p);

    if (!Array.isArray(esportes) || esportes.length === 0) {
      const pVazio = document.createElement("p");
      pVazio.textContent = "Nenhum esporte cadastrado";
      pVazio.style.fontSize = "12px";
      pVazio.style.color = "#666";
      container.appendChild(pVazio);
      return;
    }

    const caminhoImagens = "ImagensEscolhaEsportes/";

    esportes.forEach(esporte => {
      const div = document.createElement("div");
      div.classList.add("esporte-item");

      const nomeArquivo = esporte
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .toLowerCase();
      
      const nomeArquivoCapitalizado = nomeArquivo.charAt(0).toUpperCase() + nomeArquivo.slice(1);

      div.innerHTML = `
        <a href="#" class="atalho-esporte-link">
          <img src="${caminhoImagens}${nomeArquivoCapitalizado}.png"
               onerror="this.src='imagens/default.png'"
               alt="${escapeHtml(esporte)}"
               style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;">
          <span>${escapeHtml(esporte)}</span>
        </a>
      `;

      div.addEventListener("click", (e) => {
        e.preventDefault();
      });

      container.appendChild(div);
    });

  } catch (err) {
    console.error("[amigos.js] ❌ carregarEsportes erro:", err);
  }
}

async function carregarEsportesCheckbox() {
  const container = document.getElementById('esportesCheckbox');
  if (!container) return;

  const cpf = localStorage.getItem('cpf');
  if (!cpf) return;

  try {
    const resposta = await fetch(`http://localhost:3000/esportes/${cpf}`);
    const esportes = await resposta.json();

    container.innerHTML = '';

    if (esportes.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#666;">Você ainda não possui esportes cadastrados</p>';
      return;
    }

    esportes.forEach((esporte, index) => {
      const div = document.createElement('div');
      div.classList.add('checkbox-item');
      div.innerHTML = `
        <input type="checkbox" id="esporte${index}" value="${esporte}" name="esportes">
        <label for="esporte${index}">${esporte}</label>
      `;
      container.appendChild(div);
    });
  } catch (erro) {
    console.error('Erro ao carregar esportes:', erro);
    container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#ff0000;">Erro ao carregar esportes</p>';
  }
}

function preencherSelectEsportes() {
  // Função placeholder
}

// ================== EVENTOS - MODAIS ==================
function abrirModalCriarEvento() {
  document.getElementById('modalCriarEvento').classList.add('ativo');
  carregarEsportesCheckbox();
  carregarClubesEvento();
  preencherSelectLocais();

  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('dataEvento').min = hoje;
}

function fecharModalCriar() {
  document.getElementById('modalCriarEvento').classList.remove('ativo');
  document.getElementById('formCriarEvento').reset();
}

function fecharModalDetalhes() {
  document.getElementById('modalDetalhesEvento').classList.remove('ativo');
}

// ================== EVENTOS - SELECT DE LOCAIS ==================
function preencherSelectLocais() {
  const select = document.getElementById('localEvento');
  if (!select) return;

  select.innerHTML = '<option value="">Selecione um local</option>';

  const locaisOrdenados = [...locaisDisponiveis].sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  locaisOrdenados.forEach(local => {
    const option = document.createElement('option');
    option.value = local.nome;
    option.dataset.lat = local.lat;
    option.dataset.lon = local.lon;
    option.textContent = local.nome;
    select.appendChild(option);
  });

  const optionOutro = document.createElement('option');
  optionOutro.value = 'outro';
  optionOutro.textContent = 'Outro local (digite abaixo)';
  select.appendChild(optionOutro);

  select.addEventListener('change', function () {
    const inputCustom = document.getElementById('localEventoCustom');
    if (this.value === 'outro') {
      if (!inputCustom) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'localEventoCustom';
        input.placeholder = 'Digite o nome do local';
        input.className = 'form-grupo input';
        input.style.marginTop = '10px';
        select.parentElement.appendChild(input);
      }
    } else {
      if (inputCustom) inputCustom.remove();
    }
  });
}

// ================== EVENTOS - CLUBES ==================
async function carregarClubesEvento() {
  const select = document.getElementById('clubeEvento');
  if (!select) return;

  try {
    const resposta = await fetch('http://localhost:3000/clubes/todos');
    const clubes = await resposta.json();

    select.innerHTML = '<option value="">Nenhum clube</option>';
    clubes.forEach(clube => {
      const option = document.createElement('option');
      option.value = clube.IDclube;
      option.textContent = `${clube.nome} - ${clube.esporteClube}`;
      select.appendChild(option);
    });
  } catch (erro) {
    console.error('Erro ao carregar clubes:', erro);
  }
}

// ================== EVENTOS - CRIAR ==================
async function criarEvento(event) {
  event.preventDefault();

  const cpf = localStorage.getItem('cpf');
  if (!cpf) {
    alert('Você precisa estar logado para criar um evento');
    return;
  }

  const checkboxes = document.querySelectorAll('input[name="esportes"]:checked');
  const esportesSelecionados = Array.from(checkboxes).map(cb => cb.value);

  if (esportesSelecionados.length === 0) {
    alert('Selecione pelo menos um esporte');
    return;
  }

  const selectLocal = document.getElementById('localEvento');
  const inputCustom = document.getElementById('localEventoCustom');
  let local = '';

  if (selectLocal.value === 'outro' && inputCustom) {
    local = inputCustom.value.trim();
    if (!local) {
      alert('Digite o nome do local');
      return;
    }
  } else {
    local = selectLocal.value;
    if (!local) {
      alert('Selecione um local');
      return;
    }
  }

  const dadosEvento = {
    titulo: document.getElementById('tituloEvento').value,
    responsavel: document.getElementById('responsavelEvento').value,
    local: local,
    data_evento: document.getElementById('dataEvento').value,
    horario: document.getElementById('horarioEvento').value,
    descricao: document.getElementById('descricaoEvento').value,
    esportes: esportesSelecionados.join(', '),
    clube_id: document.getElementById('clubeEvento').value || null,
    criador_cpf: cpf
  };

  try {
    const resposta = await fetch('http://localhost:3000/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosEvento)
    });

    const resultado = await resposta.json();

    if (resultado.success) {
      alert('✅ Evento criado com sucesso!');
      fecharModalCriar();
      carregarEventos();
    } else {
      alert('❌ Erro: ' + (resultado.message || 'Erro ao criar evento'));
    }
  } catch (erro) {
    console.error('Erro ao criar evento:', erro);
    alert('❌ Erro ao criar evento. Verifique sua conexão.');
  }
}

// ================== EVENTOS - CARREGAR ==================
async function carregarEventos() {
  const container = document.getElementById('container-eventos');
  if (!container) return;

  const cpfLogado = localStorage.getItem('cpf');

  try {
    const resposta = await fetch('http://localhost:3000/eventos');

    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.message || 'Erro ao buscar eventos');
    }

    const eventos = await resposta.json();

    container.innerHTML = '';

    if (eventos.length === 0) {
      container.innerHTML = '<p class="mensagem-eventos-vazia">Nenhum evento cadastrado no momento</p>';
      return;
    }

    eventos.forEach((evento) => {
      const dataEvento = new Date(evento.data_evento);
      dataEvento.setHours(dataEvento.getHours() + 3);

      if (isNaN(dataEvento.getTime())) return;

      const dia = String(dataEvento.getDate()).padStart(2, '0');
      const mes = dataEvento.toLocaleDateString('pt-BR', { month: 'long' });
      const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);

      const eventoDiv = document.createElement('div');
      eventoDiv.classList.add('event');

      const ehCriador = evento.criador_cpf === cpfLogado;

      eventoDiv.innerHTML = `
        <div class="left-event">
          <h3>${dia}</h3>
          <span>${mesCapitalizado}</span>
        </div>
        <div class="right-event">
          <div style="display: flex; justify-content: space-between; align-items: start; width: 100%;">
            <div style="flex: 1; cursor: pointer;" onclick="abrirDetalhesEvento(${evento.IDevento})">
              <h4>${evento.titulo}</h4>
              <p>📍 ${evento.local}</p>
              <a href="#" onclick="event.preventDefault(); event.stopPropagation(); abrirDetalhesEvento(${evento.IDevento});">Mais informações</a>
            </div>
            ${ehCriador ? `
              <button class="btn-excluir-evento" onclick="confirmarExcluirEvento(${evento.IDevento}, '${evento.titulo.replace(/'/g, "\\'")}'); event.stopPropagation();" title="Excluir evento">
                ✕
              </button>
            ` : ''}
          </div>
        </div>
      `;

      container.appendChild(eventoDiv);
    });

  } catch (erro) {
    console.error('❌ Erro ao carregar eventos:', erro);
    container.innerHTML = '<p class="mensagem-eventos-vazia" style="color:#ff0000;">Erro ao carregar eventos</p>';
  }
}

// ================== EVENTOS - EXCLUIR ==================
async function confirmarExcluirEvento(idEvento, tituloEvento) {
  const confirmar = confirm(`Deseja realmente excluir o evento "${tituloEvento}"?\n\nEsta ação não pode ser desfeita.`);

  if (!confirmar) return;

  try {
    const resposta = await fetch(`http://localhost:3000/eventos/${idEvento}`, {
      method: 'DELETE'
    });

    const resultado = await resposta.json();

    if (resultado.success) {
      alert('✅ Evento excluído com sucesso!');
      carregarEventos();
    } else {
      alert('❌ Erro: ' + (resultado.message || 'Erro ao excluir evento'));
    }
  } catch (erro) {
    console.error('❌ Erro ao excluir evento:', erro);
    alert('❌ Erro ao excluir evento. Tente novamente.');
  }
}

// ================== EVENTOS - DETALHES ==================
async function abrirDetalhesEvento(idEvento) {
  try {
    const resposta = await fetch(`http://localhost:3000/eventos/${idEvento}`);
    const evento = await resposta.json();

    if (!evento.success) {
      alert('Erro ao carregar detalhes do evento');
      return;
    }

    const e = evento.evento;
    const dataEvento = new Date(e.data_evento + 'T00:00:00');
    const dataFormatada = dataEvento.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const esportesArray = e.esportes ? e.esportes.split(',').map(s => s.trim()) : [];
    const esportesTags = esportesArray.map(esp =>
      `<span class="tag-esporte-modal">${esp}</span>`
    ).join('');

    const localEncontrado = locaisDisponiveis.find(local => local.nome === e.local);
    const badgeLocal = localEncontrado ?
      `<span style="background: #e8f5e9; color: #0f9800; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-left: 8px;">NO MAPA</span>` :
      '';

    document.getElementById('tituloDetalhes').textContent = e.titulo;
    document.getElementById('conteudoDetalhes').innerHTML = `
      <p>📅 <strong>Data:</strong> ${dataFormatada}</p>
      <p>⏰ <strong>Horário:</strong> ${e.horario}</p>
      <p>📍 <strong>Local:</strong> ${e.local} ${badgeLocal}</p>
      <p>👤 <strong>Responsável:</strong> ${e.responsavel}</p>
      ${e.descricao ? `<p>📝 <strong>Descrição:</strong><br>${e.descricao}</p>` : ''}
      ${e.clube_nome ? `<p>🛡️ <strong>Clube:</strong> ${e.clube_nome}</p>` : ''}
      ${e.criador_nome ? `<p>👥 <strong>Criado por:</strong> ${e.criador_nome}</p>` : ''}
      <p><strong>Esportes:</strong></p>
      <div class="esportes-tags">${esportesTags}</div>
    `;

    document.getElementById('modalDetalhesEvento').classList.add('ativo');
  } catch (erro) {
    console.error('Erro ao abrir detalhes:', erro);
    alert('Erro ao carregar detalhes do evento');
  }
}

// ================== ANÚNCIOS - VARIÁVEIS GLOBAIS ==================
let imagensAnuncioSelecionadas = [];
let usuarioPodeAnunciar = false;
const carrosselIndices = {};

// ================== ANÚNCIOS - PERMISSÕES ==================
async function verificarPermissaoAnuncio() {
  const cpf = localStorage.getItem('cpf');
  
  console.log('🔐 Verificando permissão de anúncio...');
  
  if (!cpf) {
    usuarioPodeAnunciar = false;
    ocultarBotaoAnuncio();
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:3000/api/verificar-permissao-anuncio?cpf=${cpf}`);
    const data = await response.json();
    
    usuarioPodeAnunciar = data.podeAnunciar || false;
    
    console.log(`✅ Permissão: ${usuarioPodeAnunciar ? 'AUTORIZADO ✓' : 'NÃO AUTORIZADO ✗'}`);
    
    if (usuarioPodeAnunciar) {
      mostrarBotaoAnuncio();
    } else {
      ocultarBotaoAnuncio();
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar permissão:', error);
    usuarioPodeAnunciar = false;
    ocultarBotaoAnuncio();
  }
}

function mostrarBotaoAnuncio() {
  const btnNovoAnuncio = document.querySelector('.btn-novo-anuncio');
  if (btnNovoAnuncio) {
    btnNovoAnuncio.style.display = 'flex';
    btnNovoAnuncio.title = 'Você tem permissão para criar anúncios';
  }
}

function ocultarBotaoAnuncio() {
  const btnNovoAnuncio = document.querySelector('.btn-novo-anuncio');
  if (btnNovoAnuncio) {
    btnNovoAnuncio.style.display = 'none';
  }
}

// ================== ANÚNCIOS - MODAIS ==================
function abrirModalCriarAnuncio() {
  if (!usuarioPodeAnunciar) {
    alert('🚫 Você não tem permissão para criar anúncios.\n\nEntre em contato com o suporte.');
    return;
  }
  
  document.getElementById('modalCriarAnuncio').classList.add('ativo');
  imagensAnuncioSelecionadas = [];
  document.getElementById('previewImagens').innerHTML = '';
  document.getElementById('infoImagens').textContent = 'Nenhuma imagem selecionada';
  document.getElementById('formCriarAnuncio').reset();
}

function fecharModalAnuncio() {
  document.getElementById('modalCriarAnuncio').classList.remove('ativo');
  document.getElementById('formCriarAnuncio').reset();
  imagensAnuncioSelecionadas = [];
  document.getElementById('previewImagens').innerHTML = '';
  document.getElementById('infoImagens').textContent = 'Nenhuma imagem selecionada';
}

// ================== ANÚNCIOS - PREVIEW DE IMAGENS ==================
function mostrarPreviewImagens(files) {
  const container = document.getElementById('previewImagens');
  container.innerHTML = '';
  
  files.forEach((file, index) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const div = document.createElement('div');
      div.classList.add('preview-item');
      div.innerHTML = `
        <img src="${e.target.result}" alt="Preview ${index + 1}">
        <button type="button" class="btn-remover-preview" onclick="removerImagemAnuncio(${index})" title="Remover imagem">
          ×
        </button>
      `;
      container.appendChild(div);
    };
    
    reader.readAsDataURL(file);
  });
}

function removerImagemAnuncio(index) {
  console.log('🗑️ Removendo imagem:', index);
  
  const novosArquivos = Array.from(imagensAnuncioSelecionadas);
  novosArquivos.splice(index, 1);
  
  imagensAnuncioSelecionadas = novosArquivos;
  
  const dataTransfer = new DataTransfer();
  novosArquivos.forEach(file => dataTransfer.items.add(file));
  document.getElementById('imagensAnuncio').files = dataTransfer.files;
  
  if (novosArquivos.length > 0) {
    mostrarPreviewImagens(novosArquivos);
    const infoTexto = novosArquivos.length === 1 
      ? '✓ 1 imagem selecionada' 
      : `✓ ${novosArquivos.length} imagens selecionadas`;
    document.getElementById('infoImagens').textContent = infoTexto;
  } else {
    document.getElementById('previewImagens').innerHTML = '';
    document.getElementById('infoImagens').textContent = 'Nenhuma imagem selecionada';
  }
}

// ================== ANÚNCIOS - CRIAR ==================
async function criarAnuncio(event) {
  event.preventDefault();
  
  console.log('\n📝 Iniciando criação de anúncio...');
  
  if (!usuarioPodeAnunciar) {
    alert('🚫 Você não tem permissão para criar anúncios.');
    fecharModalAnuncio();
    return;
  }
  
  const titulo = document.getElementById('tituloAnuncio').value.trim();
  const descricao = document.getElementById('descricaoAnuncio').value.trim();
  const cpf = localStorage.getItem('cpf');
  
  if (!titulo) {
    alert('⚠️ Por favor, insira um título para o anúncio');
    return;
  }
  
  if (titulo.length > 200) {
    alert('⚠️ O título deve ter no máximo 200 caracteres');
    return;
  }
  
  if (!descricao) {
    alert('⚠️ Por favor, insira uma descrição para o anúncio');
    return;
  }
  
  if (!cpf) {
    alert('❌ Erro: Você precisa estar logado');
    fecharModalAnuncio();
    return;
  }
  
  if (imagensAnuncioSelecionadas.length === 0) {
    alert('⚠️ Por favor, selecione pelo menos 1 imagem');
    return;
  }
  
  const formData = new FormData();
  formData.append('titulo', titulo);
  formData.append('descricao', descricao);
  formData.append('criador_cpf', cpf);
  
  imagensAnuncioSelecionadas.forEach((file) => {
    formData.append('imagens', file);
  });
  
  try {
    console.log('⏳ Enviando para o servidor...');
    
    const response = await fetch('http://localhost:3000/anuncios', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ Anúncio criado com sucesso!');
      fecharModalAnuncio();
      carregarAnuncios();
    } else {
      if (response.status === 403) {
        alert('🚫 Você não tem permissão para criar anúncios.\n\n' + result.message);
        usuarioPodeAnunciar = false;
        ocultarBotaoAnuncio();
        fecharModalAnuncio();
      } else {
        alert('❌ Erro ao criar anúncio:\n\n' + (result.message || 'Erro desconhecido'));
      }
    }
  } catch (erro) {
    console.error('❌ Erro ao criar anúncio:', erro);
    alert('❌ Erro ao criar anúncio. Verifique sua conexão.');
  }
}

// ================== ANÚNCIOS - CARREGAR ==================
async function carregarAnuncios() {
  console.log('📋 Carregando anúncios...');
  
  const container = document.getElementById('container-anuncios');
  if (!container) {
    console.error('❌ Container de anúncios não encontrado');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3000/anuncios');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const anuncios = await response.json();
    
    console.log(`✅ ${anuncios.length} anúncio(s) recebido(s)`);
    
    if (!Array.isArray(anuncios)) {
      container.innerHTML = '<p class="mensagem-anuncios-vazia">❌ Erro ao carregar anúncios</p>';
      return;
    }
    
    if (anuncios.length === 0) {
      container.innerHTML = '<p class="mensagem-anuncios-vazia">📢 Nenhum anúncio cadastrado ainda</p>';
      return;
    }
    
    renderizarAnuncios(anuncios);
    
  } catch (erro) {
    console.error('❌ Erro ao carregar anúncios:', erro);
    container.innerHTML = '<p class="mensagem-anuncios-vazia">❌ Erro ao carregar anúncios</p>';
  }
}

// ================== ANÚNCIOS - RENDERIZAR ==================
function renderizarAnuncios(anuncios) {
  const container = document.getElementById('container-anuncios');
  container.innerHTML = '';
  
  const cpfLogado = localStorage.getItem('cpf');
  
  anuncios.forEach(anuncio => {
    const imagens = [anuncio.imagem1, anuncio.imagem2, anuncio.imagem3].filter(img => img);
    
    const anuncioCard = document.createElement('div');
    anuncioCard.classList.add('anuncio-card');
    
    anuncioCard.innerHTML = `
      ${anuncio.criador_cpf === cpfLogado ? `
        <button class="btn-excluir-anuncio" 
                onclick="excluirAnuncio(${anuncio.id}, '${anuncio.titulo.replace(/'/g, "\\'")}')"
                title="Excluir anúncio">
          ×
        </button>
      ` : ''}
      
      <div class="anuncio-carrossel" id="carrossel-${anuncio.id}">
        ${imagens.length > 1 ? `
          <div class="contador-imagens">
            <i class="fa-solid fa-images"></i>
            <span id="contador-${anuncio.id}">1/${imagens.length}</span>
          </div>
        ` : ''}
        
        ${imagens.map((img, idx) => `
          <img src="http://localhost:3000/uploads/${img}" 
               alt="${anuncio.titulo}" 
               class="${idx === 0 ? 'ativo' : ''}"
               onerror="this.src='http://localhost:3000/img/placeholder-anuncio.png'">
        `).join('')}
        
        ${imagens.length > 1 ? `
          <button class="carrossel-btn prev" onclick="navegarCarrosselAnuncio(${anuncio.id}, -1)">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <button class="carrossel-btn next" onclick="navegarCarrosselAnuncio(${anuncio.id}, 1)">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
          
          <div class="carrossel-indicadores">
            ${imagens.map((_, idx) => `
              <div class="indicador ${idx === 0 ? 'ativo' : ''}" 
                   onclick="irParaSlideAnuncio(${anuncio.id}, ${idx})"></div>
            `).join('')}
          </div>
        ` : ''}
      </div>
      
      <div class="anuncio-header">
        <h4>${anuncio.titulo}</h4>
        <p>${anuncio.descricao}</p>
      </div>
    `;
    
    container.appendChild(anuncioCard);
    
    if (!carrosselIndices[anuncio.id]) {
      carrosselIndices[anuncio.id] = 0;
    }
  });
  
  console.log(`✅ ${anuncios.length} anúncio(s) renderizado(s)`);
}

// ================== ANÚNCIOS - CARROSSEL ==================
function navegarCarrosselAnuncio(id, direcao) {
  const carrossel = document.getElementById(`carrossel-${id}`);
  if (!carrossel) return;
  
  const imagens = carrossel.querySelectorAll('img');
  const indicadores = carrossel.querySelectorAll('.indicador');
  const contador = document.getElementById(`contador-${id}`);
  
  if (imagens.length === 0) return;
  
  if (!carrosselIndices[id]) {
    carrosselIndices[id] = 0;
  }
  
  imagens[carrosselIndices[id]].classList.remove('ativo');
  if (indicadores.length > 0) {
    indicadores[carrosselIndices[id]].classList.remove('ativo');
  }
  
  carrosselIndices[id] += direcao;
  
  if (carrosselIndices[id] < 0) {
    carrosselIndices[id] = imagens.length - 1;
  } else if (carrosselIndices[id] >= imagens.length) {
    carrosselIndices[id] = 0;
  }
  
  imagens[carrosselIndices[id]].classList.add('ativo');
  if (indicadores.length > 0) {
    indicadores[carrosselIndices[id]].classList.add('ativo');
  }
  
  if (contador) {
    contador.textContent = `${carrosselIndices[id] + 1}/${imagens.length}`;
  }
}

function irParaSlideAnuncio(id, index) {
  const carrossel = document.getElementById(`carrossel-${id}`);
  if (!carrossel) return;
  
  const imagens = carrossel.querySelectorAll('img');
  const indicadores = carrossel.querySelectorAll('.indicador');
  const contador = document.getElementById(`contador-${id}`);
  
  if (imagens.length === 0) return;
  
  imagens.forEach(img => img.classList.remove('ativo'));
  indicadores.forEach(ind => ind.classList.remove('ativo'));
  
  if (imagens[index]) {
    imagens[index].classList.add('ativo');
  }
  if (indicadores[index]) {
    indicadores[index].classList.add('ativo');
  }
  
  carrosselIndices[id] = index;
  
  if (contador) {
    contador.textContent = `${index + 1}/${imagens.length}`;
  }
}

// ================== ANÚNCIOS - EXCLUIR ==================
async function excluirAnuncio(id, titulo) {
  const confirmar = confirm(`Deseja realmente excluir o anúncio "${titulo}"?\n\nEsta ação não pode ser desfeita.`);
  
  if (!confirmar) return;
  
  try {
    const response = await fetch(`http://localhost:3000/anuncios/${id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ Anúncio excluído com sucesso!');
      carregarAnuncios();
    } else {
      alert('❌ Erro ao excluir anúncio: ' + (result.message || 'Erro desconhecido'));
    }
  } catch (erro) {
    console.error('❌ Erro ao excluir anúncio:', erro);
    alert('❌ Erro ao excluir anúncio. Tente novamente.');
  }
}

// ================== ANÚNCIOS - AUTOPLAY ==================
let autoplayIntervals = {};

function iniciarAutoplay(id, intervalo = 5000) {
  if (autoplayIntervals[id]) {
    clearInterval(autoplayIntervals[id]);
  }
  
  autoplayIntervals[id] = setInterval(() => {
    const carrossel = document.getElementById(`carrossel-${id}`);
    if (carrossel) {
      const anuncioCard = carrossel.closest('.anuncio-card');
      if (!anuncioCard.matches(':hover')) {
        navegarCarrosselAnuncio(id, 1);
      }
    } else {
      clearInterval(autoplayIntervals[id]);
      delete autoplayIntervals[id];
    }
  }, intervalo);
}

function pararAutoplay(id) {
  if (autoplayIntervals[id]) {
    clearInterval(autoplayIntervals[id]);
    delete autoplayIntervals[id];
  }
}

// ================== LISTENERS DE EVENTOS ==================
// Fechar modais ao clicar fora
document.getElementById('modalCriarEvento')?.addEventListener('click', (e) => {
  if (e.target.id === 'modalCriarEvento') fecharModalCriar();
});

document.getElementById('modalDetalhesEvento')?.addEventListener('click', (e) => {
  if (e.target.id === 'modalDetalhesEvento') fecharModalDetalhes();
});

document.getElementById('modalCriarAnuncio')?.addEventListener('click', (e) => {
  if (e.target.id === 'modalCriarAnuncio') fecharModalAnuncio();
});

// Navegação por teclado nos carrosséis
document.addEventListener('keydown', function(e) {
  const anunciosVisiveis = document.querySelectorAll('.anuncio-card:hover');
  
  if (anunciosVisiveis.length > 0) {
    const anuncio = anunciosVisiveis[0];
    const carrossel = anuncio.querySelector('.anuncio-carrossel');
    
    if (carrossel) {
      const id = parseInt(carrossel.id.replace('carrossel-', ''));
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navegarCarrosselAnuncio(id, -1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navegarCarrosselAnuncio(id, 1);
      }
    }
  }
});

// ================== INICIALIZAÇÃO ==================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Iniciando aplicação (amigos.js completo)...");
  
  // Carregar perfil e navbar
  carregarFotoNavbar();
  preencherPerfil();
  
  // Carregar amigos e esportes
  carregarAmigos();
  carregarEsportes();
  preencherSelectEsportes();
  
  // Carregar eventos e anúncios
  carregarEventos();
  carregarAnuncios();
  
  // Verificar permissão de anúncios
  verificarPermissaoAnuncio();
  
  // Configurar listener de upload de imagens
  const inputImagens = document.getElementById('imagensAnuncio');
  
  if (inputImagens) {
    inputImagens.addEventListener('change', function(e) {
      const files = Array.from(e.target.files);
      
      console.log('📸 Imagens selecionadas:', files.length);
      
      if (files.length > 3) {
        alert('⚠️ Você pode selecionar no máximo 3 imagens!');
        this.value = '';
        return;
      }
      
      if (files.length === 0) {
        imagensAnuncioSelecionadas = [];
        document.getElementById('previewImagens').innerHTML = '';
        document.getElementById('infoImagens').textContent = 'Nenhuma imagem selecionada';
        return;
      }
      
      imagensAnuncioSelecionadas = files;
      mostrarPreviewImagens(files);
      
      const infoTexto = files.length === 1 
        ? '✓ 1 imagem selecionada' 
        : `✓ ${files.length} imagens selecionadas`;
      document.getElementById('infoImagens').textContent = infoTexto;
    });
  }
  
  // Iniciar autoplay dos carrosséis após 1 segundo
  setTimeout(() => {
    const carrosseis = document.querySelectorAll('.anuncio-carrossel');
    carrosseis.forEach(carrossel => {
      const id = parseInt(carrossel.id.replace('carrossel-', ''));
      const imagens = carrossel.querySelectorAll('img');
      if (imagens.length > 1) {
        iniciarAutoplay(id);
      }
    });
  }, 1000);
  
  console.log("✅ Todas as funções inicializadas com sucesso!");
});