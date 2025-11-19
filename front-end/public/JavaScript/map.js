// ===============================================
// VARIÁVEIS GLOBAIS
// ===============================================
let map;
let usuarioMarker;
let circle;
let ultimaBusca = 0;
const intervaloMinimoBusca = 5000; // 5 segundos
const userMarkers = L.layerGroup();

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
// FUNÇÃO: ADICIONAR PONTOS FIXOS
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
    console.log(local.nome, local.lat, local.lon);
    const lat = parseFloat(local.lat);
    const lon = parseFloat(local.lon);

    if (isNaN(lat) || isNaN(lon)) {
        console.error("Ponto inválido:", local);
    } else {
        L.marker([lat, lon])
            .addTo(mapInstance)
            .bindPopup(`<b>${escapeHtml(local.nome)}</b>`);
    }
    });
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
                    L.marker([usuario.latitude, usuario.longitude])
                        .bindPopup(`<b>${escapeHtml(usuario.nome || 'Usuário')}</b>`)
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
// FUNÇÃO: EXIBIR USUÁRIOS NA LISTA
// ===============================================
function exibirUsuariosProximos(lista) {
    const div = document.getElementById("usuarios-proximos-lista");
    if (!div) return;

    div.innerHTML = "";

    lista.forEach(usuario => {
        const item = document.createElement("div");
        item.classList.add("usuario-item");

        const foto = usuario.fotoPerfil
    ? `http://localhost:3000/uploads/${usuario.fotoPerfil}`
    : "http://localhost:3000/img/perfil-default.png";

        item.innerHTML = `
            <img src="${foto}" class="foto-usuario">
            <div><strong>${escapeHtml(usuario.nome)}</strong></div>
        `;

        item.addEventListener("click", () => abrirPerfil(usuario.cpf));
        div.appendChild(item);
    });
}

// ===============================================
// FUNÇÃO: ABRIR PERFIL
// ===============================================
function abrirPerfil(cpf) {
    window.location.href = `perfil.html?cpf=${encodeURIComponent(cpf)}`;
}

// ===============================================
// FUNÇÃO: TOGGLE DE PAINEL
// ===============================================
function togglePainel(header) {
    const grupo = header.parentElement;
    grupo.classList.toggle("ativo");
}

// ===============================================
// FUNÇÃO: CASO NÃO PERMITA GEOLOCALIZAÇÃO
// ===============================================
function CasoNãoDeixePegarLocalização() {
    alert("Não foi permitido o acesso à localização!");
}

// ===============================================
// FUNÇÃO: CARREGAR LOCAIS POPULARES
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

        dados.locais.forEach(nome => {
            const item = document.createElement("div");
            item.classList.add("local-popular-item");
            item.textContent = nome;
            container.appendChild(item);
        });

        console.log("📍 Locais populares carregados:", dados.locais);

    } catch (err) {
        console.error("Erro ao buscar locais populares:", err);
    }
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
