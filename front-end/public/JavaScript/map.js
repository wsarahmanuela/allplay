// ===============================================
// VARIÁVEIS GLOBAIS
// ===============================================
let map;
let usuarioMarker;
let circle;
let ultimaBusca = 0;
const intervaloMinimoBusca = 5000; // 5 segundos
const userMarkers = L.layerGroup();

// Armazenar pontos fixos para referência futura
let pontosFixosMap = {};

// Armazenar marcadores de locais com eventos
let marcadoresEventos = {};

// ===============================================
// FUNÇÃO UTILITÁRIA: ESCAPAR HTML
// ===============================================
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ===============================================
// FUNÇÃO PRINCIPAL: SUCESSO GEOLOCALIZAÇÃO
// ===============================================
function sucesso(posicao) {
    const lat = posicao.coords.latitude;
    const lon = posicao.coords.longitude;
    const usuarioCpf = localStorage.getItem('cpf');
    const agora = Date.now();

    console.log(`Localização obtida: Lat=${lat}, Lon=${lon}`);

    // Inicializar mapa se ainda não existe
    if (!map) {
        map = L.map('map').setView([lat, lon], 16);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.zoomControl.setPosition('bottomleft');

        adicionarPontosFixos(map);
        userMarkers.addTo(map);
        buscarEExibirTodosUsuarios();
        
        // CORREÇÃO: Expandir painéis por padrão
        setTimeout(() => {
            document.querySelectorAll('.painel-grupo').forEach(painel => {
                painel.classList.add('ativo');
            });
        }, 100);
    } else {
        map.setView([lat, lon], 16);
    }

    // Atualizar marcador do usuário
    if (usuarioMarker) {
        usuarioMarker.setLatLng([lat, lon]);
    } else {
        usuarioMarker = L.marker([lat, lon])
            .addTo(map)
            .bindPopup('Você está por aqui')
            .openPopup();
    }

    // Atualizar círculo de alcance
    if (circle) circle.remove();
    circle = L.circle([lat, lon], {
        color: 'green',
        fillColor: '#0f9800',
        fillOpacity: 0.5,
        radius: 200
    }).addTo(map);

    // Controle de busca de usuários
    if (usuarioCpf) {
        if (agora - ultimaBusca > intervaloMinimoBusca) {
            ultimaBusca = agora;
            console.log("Intervalo atingido. Chamando API de usuários...");
            buscarEExibirUsuariosProximos(lat, lon, usuarioCpf);
        } else {
            console.log("Aguardando intervalo mínimo para nova busca...");
        }
    } else {
        const listaDiv = document.getElementById('usuarios-proximos-lista');
        if (listaDiv) {
            listaDiv.innerHTML = `<p>Faça login para ver usuários próximos.</p>`;
        }
    }
}

// ===============================================
// FUNÇÃO: CRIAR ÍCONE PERSONALIZADO PARA LOCAIS
// ===============================================
const iconeLocal = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// ===============================================
// FUNÇÃO: CRIAR ÍCONE PERSONALIZADO PARA USUÁRIOS
// ===============================================
const iconeUsuario = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// ===============================================
// FUNÇÃO: ADICIONAR PONTOS FIXOS (TODOS VISÍVEIS)
// ===============================================
function adicionarPontosFixos(mapInstance) {
    const pontosfixos = [
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

    pontosfixos.forEach(local => {
        const lat = parseFloat(local.lat);
        const lon = parseFloat(local.lon);

        if (isNaN(lat) || isNaN(lon)) {
            console.error("Ponto inválido:", local);
        } else {
            // Armazenar coordenadas para referência
            pontosFixosMap[local.nome] = { lat, lon };
            
            // CRIAR MARCADOR VERMELHO para todos os pontos fixos
            const marcador = L.marker([lat, lon], { icon: iconeLocal })
                .addTo(mapInstance)
                .bindPopup(`<b>📍 ${escapeHtml(local.nome)}</b><br><span style="font-size: 12px; color: #666;">Carregando eventos...</span>`);
            
            // Armazenar o marcador (será atualizado se houver eventos)
            marcadoresEventos[local.nome] = marcador;
            
            console.log(`✓ Marcador criado para: ${local.nome}`);
        }
    });
    
    console.log(`📍 Total de ${pontosfixos.length} pontos fixos adicionados ao mapa`);
}

// ===============================================
// FUNÇÃO: BUSCAR E EXIBIR USUÁRIOS PRÓXIMOS
// ===============================================
async function buscarEExibirUsuariosProximos(lat, lon, cpf) {
    console.log("[map.js] Buscando usuários próximos...");

    const listaDiv = document.getElementById("usuarios-proximos-lista");
    if (!listaDiv) return;

    try {
        const resposta = await fetch('http://localhost:3000/api/usuarios-proximos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude: lat, longitude: lon, cpf })
        });

        if (!resposta.ok) {
            console.error("ERRO HTTP:", resposta.status);
            listaDiv.innerHTML = "<p>Erro ao carregar usuários.</p>";
            return;
        }

        const dados = await resposta.json();
        if (!dados.success || !dados.usuarios) {
            console.error("Erro retornado pelo servidor:", dados.message || dados.error);
            listaDiv.innerHTML = "<p>Erro ao carregar usuários.</p>";
            return;
        }

        exibirUsuariosProximos(dados.usuarios);

    } catch (erro) {
        console.error("[map.js] Erro fatal ao buscar usuários:", erro);
        listaDiv.innerHTML = "<p>Erro ao carregar usuários.</p>";
    }
}

// ===============================================
// FUNÇÃO: BUSCAR E EXIBIR TODOS OS USUÁRIOS NO MAPA
// ===============================================
async function buscarEExibirTodosUsuarios() {
    console.log("Buscando todos os usuários para exibição no mapa...");

    try {
        const response = await fetch('http://localhost:3000/api/todos-usuarios-mapa');
        const data = await response.json();

        if (response.ok && data.success && data.usuarios) {
            userMarkers.clearLayers();

            data.usuarios.forEach(usuario => {
                if (usuario.latitude && usuario.longitude) {
                    // Usar ícone verde para usuários
                    L.marker([usuario.latitude, usuario.longitude], { icon: iconeUsuario })
                        .bindPopup(`<b>👤 ${escapeHtml(usuario.nome || 'Usuário')}</b>`)
                        .addTo(userMarkers);
                }
            });

            console.log(`Exibidos ${data.usuarios.length} usuários no mapa.`);
        } else {
            console.error('Erro ao carregar lista de todos os usuários:', data.message || 'Erro desconhecido.');
        }

    } catch (error) {
        console.error('Erro de conexão ao buscar todos os usuários:', error);
    }
}

// ===============================================
// FUNÇÃO: EXIBIR USUÁRIOS NA LISTA (CORRIGIDA)
// ===============================================
function exibirUsuariosProximos(lista) {
    const div = document.getElementById("usuarios-proximos-lista");
    if (!div) return;

    div.innerHTML = "";

    if (!lista || lista.length === 0) {
        div.innerHTML = "<p>Nenhum usuário próximo encontrado.</p>";
        return;
    }

    lista.forEach(usuario => {
        const item = document.createElement("div");
        item.classList.add("usuario-item");

        // CORREÇÃO: Backend retorna "fotoDePerfil", não "fotoPerfil"
        const caminhoFoto = usuario.fotoDePerfil || usuario.fotoPerfil;
        
        console.log(`📸 Processando foto do usuário ${usuario.nome}:`, caminhoFoto);

        // Construir URL da foto corretamente
        let fotoUrl = "http://localhost:3000/img/perfil-default.png";
        
        if (caminhoFoto && caminhoFoto.trim() !== '') {
            // Se já vier com caminho completo
            if (caminhoFoto.startsWith('http')) {
                fotoUrl = caminhoFoto;
            } 
            // Se vier com "uploads/"
            else if (caminhoFoto.includes('uploads/')) {
                fotoUrl = `http://localhost:3000/${caminhoFoto}`;
            } 
            // Se vier apenas o nome do arquivo
            else {
                fotoUrl = `http://localhost:3000/uploads/${caminhoFoto}`;
            }
        }

        console.log(`   → URL final da foto: ${fotoUrl}`);

        // Calcular distância se disponível
        const distanciaTexto = usuario.distancia_m 
            ? `<span class="usuario-distancia">${Math.round(usuario.distancia_m)}m</span>` 
            : '';

        item.innerHTML = `
            <img src="${fotoUrl}" 
                 class="usuario-foto" 
                 onerror="this.src='http://localhost:3000/img/perfil-default.png'"
                 alt="Foto de ${escapeHtml(usuario.nome)}">
            <div class="usuario-info">
                <span class="usuario-nome">${escapeHtml(usuario.nome)}</span>
                ${distanciaTexto}
            </div>
        `;

        item.addEventListener("click", () => abrirPerfil(usuario.cpf));
        div.appendChild(item);
    });

    console.log(`✅ Exibidos ${lista.length} usuários próximos na lista`);
}

// ===============================================
// FUNÇÃO: ABRIR PERFIL
// ===============================================
function abrirPerfil(cpf) {
    window.location.href = `perfilSeguir.html?cpf=${encodeURIComponent(cpf)}`;
}

// ===============================================
// FUNÇÃO: TOGGLE DE PAINEL
// ===============================================
function togglePainel(header) {
    const grupo = header.parentElement;
    grupo.classList.toggle("ativo");
}

// ===============================================
// FUNÇÃO: BUSCAR EVENTOS DE UM LOCAL
// ===============================================
async function buscarEventosDoLocal(nomeLocal) {
    try {
        console.log(`      📡 Buscando eventos para: ${nomeLocal}`);
        const resposta = await fetch(`http://localhost:3000/api/eventos-por-local?local=${encodeURIComponent(nomeLocal)}`);
        const dados = await resposta.json();
        
        console.log(`      📦 Resposta recebida:`, dados);
        
        if (dados.success && dados.eventos) {
            return dados.eventos;
        }
        return [];
    } catch (erro) {
        console.error(`      ❌ Erro ao buscar eventos do local ${nomeLocal}:`, erro);
        return [];
    }
}

// ===============================================
// FUNÇÃO: CRIAR POPUP COM EVENTOS
// ===============================================
function criarPopupComEventos(nomeLocal, eventos) {
    console.log(`      🎨 Criando popup para ${nomeLocal} com ${eventos.length} eventos`);
    
    if (!eventos || eventos.length === 0) {
        return `<div class="popup-local">
            <h3>📍 ${escapeHtml(nomeLocal)}</h3>
            <p style="color: #666; font-size: 13px; margin: 0;">Nenhum evento programado</p>
        </div>`;
    }

    let html = `<div class="popup-local">
        <h3>📍 ${escapeHtml(nomeLocal)}</h3>
        <div class="eventos-lista">`;
    
    eventos.forEach(evento => {
        const data = new Date(evento.dataEvento).toLocaleDateString('pt-BR');
        const hora = evento.horaEvento || 'Horário não definido';
        
        html += `
            <div class="evento-item-popup">
                <strong>${escapeHtml(evento.titulo)}</strong><br>
                <span style="font-size: 12px; color: #666;">
                    📅 ${data} às ${hora}
                </span>
            </div>
        `;
    });
    
    html += `</div></div>`;
    
    console.log(`      ✓ Popup HTML criado`);
    return html;
}

// ===============================================
// FUNÇÃO: CENTRALIZAR MAPA EM UM LOCAL E ABRIR POPUP
// ===============================================
async function centralizarNoLocal(nomeLocal) {
    const coordenadas = pontosFixosMap[nomeLocal];
    
    if (coordenadas && map) {
        // Centralizar o mapa no local SEM mudar muito o zoom
        map.setView([coordenadas.lat, coordenadas.lon], 15);
        
        console.log(`📍 Centralizando no local: ${nomeLocal}`);
        
        // Buscar eventos e abrir popup do marcador
        if (marcadoresEventos[nomeLocal]) {
            const eventos = await buscarEventosDoLocal(nomeLocal);
            const popupHtml = criarPopupComEventos(nomeLocal, eventos);
            marcadoresEventos[nomeLocal].setPopupContent(popupHtml).openPopup();
        }
        
        // Adicionar um pulso temporário no local (mais sutil)
        const pulseCircle = L.circle([coordenadas.lat, coordenadas.lon], {
            color: '#dc2626',
            fillColor: '#dc2626',
            fillOpacity: 0.2,
            radius: 150,
            weight: 2
        }).addTo(map);

        // Animação de pulso
        let opacity = 0.3;
        let growing = false;
        const pulseInterval = setInterval(() => {
            opacity = growing ? opacity + 0.05 : opacity - 0.05;
            if (opacity >= 0.4) growing = false;
            if (opacity <= 0.1) growing = true;
            pulseCircle.setStyle({ fillOpacity: opacity });
        }, 100);

        // Remover o círculo após 3 segundos
        setTimeout(() => {
            clearInterval(pulseInterval);
            map.removeLayer(pulseCircle);
        }, 3000);
    } else {
        console.error("Local não encontrado:", nomeLocal);
    }
}

// ===============================================
// FUNÇÃO: CARREGAR LOCAIS POPULARES E ATUALIZAR POPUPS
// ===============================================
async function carregarLocaisPopulares() {
    try {
        const resposta = await fetch("http://localhost:3000/api/locais-populares");
        const dados = await resposta.json();

        if (!dados.success) {
            console.error("Erro ao carregar locais populares:", dados.message);
            return;
        }

        const container = document.getElementById("locais-populares");
        if (!container) return;

        container.innerHTML = "";

        if (!dados.locais || dados.locais.length === 0) {
            container.innerHTML = "<p>Nenhum evento programado.</p>";
            return;
        }

        console.log("📍 Atualizando popups dos locais com eventos:", dados.locais);

        // Processar cada local sequencialmente
        for (const nomeLocal of dados.locais) {
            const coordenadas = pontosFixosMap[nomeLocal];
            
            console.log(`   → ${nomeLocal}:`, coordenadas ? "✓ tem coordenadas" : "✗ sem coordenadas");
            
            if (coordenadas && marcadoresEventos[nomeLocal]) {
                try {
                    // Buscar eventos para este local
                    const eventos = await buscarEventosDoLocal(nomeLocal);
                    console.log(`      Eventos encontrados: ${eventos.length}`);
                    
                    // ATUALIZAR o popup do marcador que já existe
                    const popupHtml = criarPopupComEventos(nomeLocal, eventos);
                    marcadoresEventos[nomeLocal].setPopupContent(popupHtml);
                    
                    // Adicionar evento de clique para atualizar popup
                    marcadoresEventos[nomeLocal].off('click'); // Remove listeners antigos
                    marcadoresEventos[nomeLocal].on('click', async function() {
                        console.log(`🖱️ Clicado em: ${nomeLocal}`);
                        const eventosAtualizados = await buscarEventosDoLocal(nomeLocal);
                        const novoHtml = criarPopupComEventos(nomeLocal, eventosAtualizados);
                        this.setPopupContent(novoHtml);
                    });
                    
                    console.log(`      ✓ Popup atualizado para ${nomeLocal}`);
                    
                } catch (erro) {
                    console.error(`      ✗ Erro ao processar ${nomeLocal}:`, erro);
                }
            }
            
            // Adicionar à lista lateral (APENAS locais com eventos)
            const item = document.createElement("div");
            item.classList.add("local-popular-item");
            
            if (coordenadas) {
                item.innerHTML = `<i class="fa-solid fa-location-dot" style="color: #dc2626; margin-right: 6px;"></i>${nomeLocal}`;
                item.style.cursor = "pointer";
                item.addEventListener("click", () => centralizarNoLocal(nomeLocal));
            } else {
                item.innerHTML = `<i class="fa-solid fa-map-pin" style="color: #999; margin-right: 6px;"></i>${nomeLocal}`;
                item.style.opacity = "0.6";
                item.title = "Local sem coordenadas cadastradas";
            }
            
            container.appendChild(item);
        }

        console.log(`✅ Popups atualizados para ${dados.locais.length} locais com eventos`);

    } catch (err) {
        console.error("❌ Erro ao buscar locais populares:", err);
    }
}

// ===============================================
// FUNÇÃO: CASO NÃO PERMITA GEOLOCALIZAÇÃO
// ===============================================
function CasoNãoDeixePegarLocalização() {
    alert("Não foi permitido o acesso à localização!");
}

// ===============================================
// INICIALIZAÇÃO
// ===============================================
carregarLocaisPopulares();

const watchID = navigator.geolocation.watchPosition(
    sucesso,
    CasoNãoDeixePegarLocalização,
    { enableHighAccuracy: true }
);