// ================== FUNÇÃO PARA FORMATAR CPF ==================
function formatarCPF(cpf) {
  if (!cpf) return '';
  const numeros = cpf.replace(/\D/g, '');
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// utilitário simples para evitar XSS ao injetar valores
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ================== CARREGAR FOTO DO NAVBAR ==================
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

    // Tentar diferentes seletores para encontrar a imagem do navbar
    const fotoNavbar = document.querySelector(".nav-user-icon img") 
                    || document.querySelector("header img")
                    || document.getElementById("fotoPerfilNavbar");
    
    if (fotoNavbar) {
      fotoNavbar.src = foto;
      console.log("[amigos.js] ✅ Foto do navbar carregada:", foto);
    } else {
      console.warn("[amigos.js] ⚠️ Elemento da foto do navbar não encontrado");
    }

  } catch (err) {
    console.error("[amigos.js] ❌ carregarFotoNavbar erro:", err);
  }
}

// ================== PREENCHER PERFIL (SIMPLIFICADO) ==================
async function preencherPerfil() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const cpfDaURL = urlParams.get('cpf');
    let cpf = cpfDaURL || localStorage.getItem("cpf");
    if (!cpf) {
      console.info("[amigos.js] preencherPerfil: cpf não encontrado no localStorage/URL.");
      return;
    }

    cpf = formatarCPF(cpf);
    console.log("[amigos.js] preencherPerfil: CPF formatado:", cpf);

    const resp = await fetch(`http://localhost:3000/usuario/${encodeURIComponent(cpf)}`);
    if (!resp.ok) {
      console.warn("[amigos.js] preencherPerfil: resposta do servidor não OK", resp.status);
      return;
    }
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

    console.info("[amigos.js]  preencherPerfil: preenchido", { nome, arroba });
  } catch (err) {
    console.error("[amigos.js]  preencherPerfil erro:", err);
  }
}

// ================== CARREGAR AMIGOS ==================
async function carregarAmigos() {
  try {
    const container = document.getElementById("listaAmigos");
    if (!container) {
      console.error("[amigos.js]  carregarAmigos: elemento #listaAmigos NÃO encontrado no HTML.");
      return;
    }

    let cpf = localStorage.getItem("cpf");
    if (!cpf) {
      container.innerHTML = "<p>Erro: usuário não logado (cpf não encontrado).</p>";
      console.warn("[amigos.js]  carregarAmigos: cpf não encontrado no localStorage.");
      return;
    }

    cpf = formatarCPF(cpf);
    console.info("[amigos.js]  carregarAmigos: buscando amizades para CPF:", cpf);
    
    const resposta = await fetch(`http://localhost:3000/mutuos/${encodeURIComponent(cpf)}`);

    if (!resposta.ok) {
      console.error("[amigos.js]  carregarAmigos: fetch retornou status", resposta.status);
      container.innerHTML = `<p>Erro ao buscar amigos (status ${resposta.status}).</p>`;
      return;
    }

    const amigos = await resposta.json();
    console.log("[amigos.js]  carregarAmigos: resposta do servidor:", amigos);

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
      console.info("[amigos.js] ℹ carregarAmigos: lista vazia.");
      return;
    }

    lista.forEach(amigo => {
      const cpfAmigo = amigo.CPF || amigo.cpf;
      
      console.log("[amigos.js]  CPF do amigo:", cpfAmigo);

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
          console.log("[amigos.js]  Redirecionando para perfil do CPF:", cpfAmigo);
          window.location.href = `perfilSeguir.html?cpf=${encodeURIComponent(cpfAmigo)}`;
        } else {
          console.error("[amigos.js]  CPF do amigo não encontrado!");
        }
      });

      container.appendChild(div);
    });

    console.info("[amigos.js]  carregarAmigos: renderizado", lista.length, "amigos.");
  } catch (err) {
    console.error("[amigos.js]  carregarAmigos erro:", err);
    const container = document.getElementById("listaAmigos");
    if (container) container.innerHTML = "<p>Erro ao carregar amigos. Veja o console.</p>";
  }
}

// ================== CARREGAR ESPORTES COM IMAGENS ==================
async function carregarEsportes() {
  try {
    let cpf = localStorage.getItem("cpf");
    if (!cpf) return;

    cpf = formatarCPF(cpf);

    const container = document.getElementById("atalhos-esportes");
    if (!container) {
      console.warn("[amigos.js] Elemento #atalhos-esportes não encontrado");
      return;
    }

    const resposta = await fetch(`http://localhost:3000/esportes/${encodeURIComponent(cpf)}`);
    if (!resposta.ok) {
      console.warn("[amigos.js]  Erro ao buscar esportes:", resposta.status);
      return;
    }

    const esportes = await resposta.json();
    
    // Manter título "Seus esportes" se existir
    const titulo = container.querySelector("p");
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
      console.info("[amigos.js] ℹ Nenhum esporte encontrado");
      return;
    }

    const caminhoImagens = "ImagensEscolhaEsportes/";

    esportes.forEach(esporte => {
      const div = document.createElement("div");
      div.classList.add("esporte-item");

      // Normalizar nome do arquivo (remover acentos e espaços)
      const nomeArquivo = esporte
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .toLowerCase();
      
      const nomeArquivoCapitalizado = nomeArquivo.charAt(0).toUpperCase() + nomeArquivo.slice(1);

      div.innerHTML = `
        <a href="#" class="atalho-esporte-link">
          <img src="${caminhoImagens}${nomeArquivoCapitalizado}.png"
               onerror="this.src='imagens/default.png'; console.warn('Imagem não encontrada: ${nomeArquivoCapitalizado}.png')"
               alt="${escapeHtml(esporte)}"
               style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;">
          <span>${escapeHtml(esporte)}</span>
        </a>
      `;

      div.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("[amigos.js]  Esporte clicado:", esporte);
        // Adicione aqui a lógica de filtro se necessário
      });

      container.appendChild(div);
    });

    console.info("[amigos.js]  carregarEsportes: carregado", esportes.length, "esportes.");
  } catch (err) {
    console.error("[amigos.js]  carregarEsportes erro:", err);
  }
}

// ================== PREENCHER SELECT DE ESPORTES (OPCIONAL) ==================
async function preencherSelectEsportes() {
  console.info("[amigos.js] ℹ preencherSelectEsportes: função chamada (não implementada nesta página)");
}

function abrirModalCriarEvento() {
  document.getElementById('modalCriarEvento').classList.add('ativo');
  carregarEsportesCheckbox();
  carregarClubesEvento();
  preencherSelectLocais(); // ← NOVA FUNÇÃO

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

// Fechar ao clicar fora
document.getElementById('modalCriarEvento')?.addEventListener('click', (e) => {
  if (e.target.id === 'modalCriarEvento') fecharModalCriar();
});

document.getElementById('modalDetalhesEvento')?.addEventListener('click', (e) => {
  if (e.target.id === 'modalDetalhesEvento') fecharModalDetalhes();
});

// ==================== PREENCHER SELECT DE LOCAIS ====================
function preencherSelectLocais() {
  const select = document.getElementById('localEvento');
  if (!select) return;

  // Limpa e adiciona opção padrão
  select.innerHTML = '<option value="">Selecione um local</option>';

  // Ordena alfabeticamente
  const locaisOrdenados = [...locaisDisponiveis].sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  // Adiciona cada local
  locaisOrdenados.forEach(local => {
    const option = document.createElement('option');
    option.value = local.nome;
    option.dataset.lat = local.lat;
    option.dataset.lon = local.lon;
    option.textContent = local.nome;
    select.appendChild(option);
  });

  // Adiciona opção "Outro local"
  const optionOutro = document.createElement('option');
  optionOutro.value = 'outro';
  optionOutro.textContent = 'Outro local (digite abaixo)';
  select.appendChild(optionOutro);

  // Evento de mudança
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

// ==================== CARREGAR ESPORTES ====================
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

// ==================== CARREGAR CLUBES ====================
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

// ==================== CRIAR EVENTO (ATUALIZADO) ====================
async function criarEvento(event) {
  event.preventDefault();

  const cpf = localStorage.getItem('cpf');
  if (!cpf) {
    alert('Você precisa estar logado para criar um evento');
    return;
  }

  // Pegar esportes selecionados
  const checkboxes = document.querySelectorAll('input[name="esportes"]:checked');
  const esportesSelecionados = Array.from(checkboxes).map(cb => cb.value);

  if (esportesSelecionados.length === 0) {
    alert('Selecione pelo menos um esporte');
    return;
  }

  // Pegar local (do select ou do input custom)
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

  console.log(' Enviando dados do evento:', dadosEvento);

  try {
    const resposta = await fetch('http://localhost:3000/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosEvento)
    });

    const resultado = await resposta.json();

    if (resultado.success) {
      alert(' Evento criado com sucesso!');
      fecharModalCriar();
      carregarEventos();
    } else {
      alert('Erro' + (resultado.message || 'Erro ao criar evento'));
    }
  } catch (erro) {
    console.error('Erro ao criar evento:', erro);
    alert('Erro ao criar evento. Verifique sua conexão e tente novamente.');
  }
}

// ==================== CARREGAR EVENTOS (COM BOTÃO EXCLUIR) ====================
async function carregarEventos() {
  const container = document.getElementById('container-eventos');
  if (!container) return;

  const cpfLogado = localStorage.getItem('cpf');

  console.log(' Carregando eventos...');

  try {
    const resposta = await fetch('http://localhost:3000/eventos');

    console.log('Status da resposta:', resposta.status);

    if (!resposta.ok) {
      const erro = await resposta.json();
      console.error(' Erro do servidor:', erro);
      throw new Error(erro.message || 'Erro ao buscar eventos');
    }

    const eventos = await resposta.json();
    console.log('Eventos recebidos:', eventos.length);

    container.innerHTML = '';

    if (eventos.length === 0) {
      container.innerHTML = '<p class="mensagem-eventos-vazia">Nenhum evento cadastrado no momento</p>';
      return;
    }

    eventos.forEach((evento, index) => {
      console.log(` Processando evento ${index + 1}:`, {
        id: evento.IDevento,
        titulo: evento.titulo,
        data_evento: evento.data_evento
      });

      const dataEvento = new Date(evento.data_evento);
      dataEvento.setHours(dataEvento.getHours() + 3);

      if (isNaN(dataEvento.getTime())) {
        console.error(' Data inválida para evento:', evento);
        return;
      }

      const dia = String(dataEvento.getDate()).padStart(2, '0');
      const mes = dataEvento.toLocaleDateString('pt-BR', { month: 'long' });
      const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);

      console.log(` Data processada: ${dia} de ${mesCapitalizado}`);

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

    console.log(' Eventos carregados com sucesso!');

  } catch (erro) {
    console.error(' Erro ao carregar eventos:', erro);
    container.innerHTML = '<p class="mensagem-eventos-vazia" style="color:#ff0000;">Erro ao carregar eventos: ' + erro.message + '</p>';
  }
}

// ==================== EXCLUIR EVENTO ====================
async function confirmarExcluirEvento(idEvento, tituloEvento) {
  console.log(' Tentando excluir evento:', idEvento, tituloEvento);

  const confirmar = confirm(`Deseja realmente excluir o evento "${tituloEvento}"?\n\nEsta ação não pode ser desfeita.`);

  if (!confirmar) {
    console.log(' Exclusão cancelada pelo usuário');
    return;
  }

  console.log('Usuário confirmou exclusão');

  try {
    console.log(' Enviando DELETE para:', `http://localhost:3000/eventos/${idEvento}`);

    const resposta = await fetch(`http://localhost:3000/eventos/${idEvento}`, {
      method: 'DELETE'
    });

    console.log(' Resposta recebida, status:', resposta.status);

    const resultado = await resposta.json();
    console.log(' Resultado:', resultado);

    if (resultado.success) {
      alert('Evento excluído com sucesso!');
      carregarEventos();
    } else {
      alert('Erro: ' + (resultado.message || 'Erro ao excluir evento'));
    }
  } catch (erro) {
    console.error(' Erro ao excluir evento:', erro);
    alert(' Erro ao excluir evento. Tente novamente.');
  }
}
// ==================== ABRIR DETALHES (COM DESTAQUE NO LOCAL) ====================
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

    // Verifica se o local está na lista de locais do mapa
    const localEncontrado = locaisDisponiveis.find(local => local.nome === e.local);
    const badgeLocal = localEncontrado ?
      `<span style="background: #e8f5e9; color: #0f9800; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-left: 8px;">NO MAPA</span>` :
      '';

    document.getElementById('tituloDetalhes').textContent = e.titulo;
    document.getElementById('conteudoDetalhes').innerHTML = `
              <p>📅 <strong>Data:</strong> ${dataFormatada}</p>
              <p>⏰ <strong>Horário:</strong> ${e.horario}</p>
              <p>📍 <strong>Local:</strong> ${e.local}</p>
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



// ================== INICIALIZAÇÃO ==================
document.addEventListener("DOMContentLoaded", () => {
  console.log("[amigos.js]  Inicializando página de amigos...");
  carregarFotoNavbar();     
  preencherPerfil();        
  carregarAmigos();         
  carregarEsportes();      
  preencherSelectEsportes(); 
  carregarEventos();
});