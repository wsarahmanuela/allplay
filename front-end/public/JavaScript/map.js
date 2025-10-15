// ===============================================
// VARIÁVEIS GLOBAIS
// ===============================================
var map;
var circle;
var ultimaBusca = 0;
const intervaloMinimoBusca = 5000; // 5 segundos
var userMarkers = L.layerGroup();

// ===============================================
// FUNÇÃO SUCESSO - COM LÓGICA DE MAPA E TEMPORIZADOR
// ===============================================
function sucesso(posicao) {
    // CORREÇÃO: Pegar lat E lon da posição
    const lat = posicao.coords.latitude;
    const lon = posicao.coords.longitude;

    const usuarioCpf = localStorage.getItem('cpf');
    const agora = Date.now(); // Pega o tempo atual

    console.log(`Localização obtida: Lat=${lat}, Lon=${lon}`);

    // 1. INICIALIZAÇÃO/ATUALIZAÇÃO DO MAPA (Leaflet)
    if (map === undefined) {
        map = L.map('map').setView([lat, lon], 16);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.zoomControl.setPosition('bottomleft');

        // CHAMA A FUNÇÃO DE PONTOS FIXOS APENAS UMA VEZ
        adicionarPontosFixos(map);
        userMarkers.addTo(map);
        buscarEExibirTodosUsuarios();

    } else {
        // Atualiza posição do mapa (sem recriar)
        map.setView([lat, lon], 16);
    }

    // Remove o círculo anterior (caso exista)
    if (circle) {
        circle.remove();
    }

    // Adiciona marcador da posição atual
    L.marker([lat, lon]).addTo(map)
        .bindPopup('Você está por aqui')
        .openPopup();

    // Adiciona círculo de alcance
    circle = L.circle([lat, lon], {
        color: 'green',
        fillColor: '#0f9800',
        fillOpacity: 0.5,
        radius: 200
    }).addTo(map);


    // 2. CONTROLE DA BUSCA DE USUÁRIOS (COM TEMPORIZADOR)
    if (usuarioCpf) {
        // Verifica se já se passaram 'intervaloMinimoBusca' milissegundos
        if (agora - ultimaBusca > intervaloMinimoBusca) {
            ultimaBusca = agora; // Atualiza o tempo da última busca
            console.log("Intervalo atingido. Chamando API de usuários...");

            // Chama a função de busca
            buscarEExibirUsuariosProximos(lat, lon, usuarioCpf);
        } else {
            console.log("Aguardando intervalo mínimo para nova busca...");
        }
    } else {
        // Se não houver CPF, exibe a mensagem no painel e não chama a API.
        document.getElementById('usuarios-proximos-lista').innerHTML = `<p>Faça login para ver usuários próximos.</p>`;
    }
}

// ===============================================
// FUNÇÃO DE PONTOS FIXOS (PARA NÃO DUPLICAR)
// ===============================================
function adicionarPontosFixos(mapInstance) {
    const pontosfixos = [
        { latitude: -26.899, longitude: -49.013, nome: "Bela Vista Country Club" },
        { latitude: -26.90931657006177, longitude: -48.93409310678638, nome: "Ginásio João dos Santos" },
        { latitude: -26.942276903407773, longitude: -48.95252988781849, nome: "Inove Pádel e Esportes de Areia" },
        { latitude: -26.920699351438124, longitude: -48.976817816654595, nome: "Arena Gaspar" },
        { latitude: -26.89727287050033, longitude: -49.00191333964011, nome: "Praça Bela Vista" },
        { latitude: -26.929304174804965, longitude: -48.938080845490035, nome: "Isete Esportes by Inove" },
        { latitude: -26.926521747537407, longitude: -48.96974992262432, nome: "Gasparense" },
        { latitude: -26.92922675702557, longitude: -48.96479585213692, nome: "Tupi" },
        { latitude: -26.927208801355135, longitude: -48.96500408151238, nome: "Like Fitness Coloninha" },
        { latitude: -26.92906452085177, longitude: -48.962847585571936, nome: "Pamp´s Academia" },
        { latitude: -26.929294092275676, longitude: -48.96162449832212, nome: "DO Treinamento Personalizado" },
        { latitude: -26.932125434751175, longitude: -48.96106659887484, nome: "Jaguar Cross" },
        { latitude: -26.93221152175355, longitude: -48.958384389993675, nome: "Centro de treinamento Thai Gaspar" },
        { latitude: -26.929263377155838, longitude: -48.955749602066895, nome: "Academia UFit Gaspar - Centro" },
        { latitude: -26.92785724446791, longitude: -48.953850598179024, nome: "Like Fitness Centro" },
        { latitude: -26.8967637423627, longitude: -49.00532891371167, nome: "CHJ Academia" },
        { latitude: -26.900112570930116, longitude: -49.00392343625794, nome: "Like Fitness Bela Vista" },
        { latitude: -26.930199494218737, longitude: -48.95102937323139, nome: "Orsi Academia" },
        { latitude: -26.932624513902397, longitude: -48.95793030206691, nome: "Centro de treinamento Thai Gaspar punch boxing" },
        { latitude: -26.900112570930116, longitude: -49.00392343625794, nome: "Like Fitness Bela Vista" },
        { latitude: -26.933599120347086, longitude: -48.97256029836956, nome: "SESC Academia" },
        { latitude: -26.914676082775536, longitude: -48.979895829053774, nome: "Blulive Academia" },
        { latitude: -26.935220798867068, longitude: -48.95269971371167, nome: "Centro de Treinamento Moving Body" },
        { latitude: -26.923765312276494, longitude: -48.96392968046372, nome: "Estúdio Súrya" },
        { latitude: -26.900584693288597, longitude: -49.0121259379343, nome: "LionFit Centro de Treinamento" },
        { latitude: -26.929446657814676, longitude: -48.93838527802032, nome: "Like Acqua Academia" },
        { latitude: -26.925832879772365, longitude: -48.95567080195778, nome: "Benessere Studio de Pilates" },
        { latitude: -26.926841037718802, longitude: -48.940049528944634, nome: "Academia Expressão Corporal" },
        { latitude: -26.937699496576315, longitude: -48.936195500109115, nome: "Ct Cleiton Costa" },
        { latitude: -26.908357992472418, longitude: -49.04136050010095, nome: "Full Body Academia" },
        { latitude: -26.928931525298378, longitude: -48.95336691197814, nome: "Estúdio de Pilates Fisioterapeuta Gisele Soares" },
        { latitude: -26.893886470570475, longitude: -49.08157080131342, nome: "Blupadel" },
        { latitude: -26.909286069060038, longitude: -49.03394665605987, nome: "SESI" },
        { latitude: -26.891760538757826, longitude: -49.11026000524971, nome: "Clube ADHering" },
        { latitude: -26.938292848480764, longitude: -49.07043456778216, nome: "Nucleo Aefa" },
        { latitude: -26.875837187884308, longitude: -49.08142089535941, nome: "Guarani Esporte Clube" },
        { latitude: -26.896659579924098, longitude: -49.087600704621615, nome: "Ginásio de Esportes Sebastião Cruz - Galegão" },
        { latitude: -26.912579996172106, longitude: -49.06150817662564, nome: "Grêmio Esportivo Olímpico" },
        { latitude: -26.850722731304646, longitude: -49.04708862168049, nome: "Passa a Bola Bar e Soçaite" },
        { latitude: -26.896659579924098, longitude: -49.09378051388382, nome: "Sport Center Academia e Futebol Society" },
        { latitude: -26.850110113932228, longitude: -49.12193297830054, nome: "Salto Do Norte Esporte Clube" },
        { latitude: -26.858073881109405, longitude: -49.10476684146108, nome: "Sociedade Esportiva Recreativa e Cultural" },
        { latitude: -26.79679971473135, longitude: -49.06974792230857, nome: "Esporte Clube Alvorada" },
        { latitude: -26.869712224846324, longitude: -49.082107540832986, nome: "Programa Paradesporto de Blumenau" },
        { latitude: -26.89972137275732, longitude: -49.085540768200886, nome: "Parque Ramiro Ruediger" },
        { latitude: -26.897884307017517, longitude: -49.06631469494069, nome: "Sesc Blumenau (Academia)" },
        { latitude: -26.902783082586033, longitude: -49.076614377044365, nome: "ISMA Wyng Tjun" },
        { latitude: -26.905844709403766, longitude: -49.071121213255736, nome: "Academia AD3 Blumenau - Centro" },
        { latitude: -26.89727194513081, longitude: -49.07798766799152, nome: "CrossFit Blumenau III" },
        { latitude: -26.91010019166055, longitude: -49.07253363000451, nome: "MOVE.ME Treinamento Funcional" },
        { latitude: -26.90504865329306, longitude: -49.04180624506188, nome: "Full Body Academia" },
        { latitude: -26.915304570529994, longitude: -49.06377890021639, nome: "Academia Body For Life" },
        { latitude: -26.919131166600067, longitude: -49.06480886842675, nome: "Academia Engenharia do Corpo" },
        { latitude: -26.88836166299941, longitude: -49.07236196863612, nome: "Academia Panobianco" },
        { latitude: -26.91055941121309, longitude: -49.08060171431906, nome: "Force One Academia - Blumenau" },
        { latitude: -26.935048413433016, longitude: -49.0666971434791, nome: "Real Fit Academia" },
        { latitude: -26.920508709420982, longitude: -49.06051733421689, nome: "Master Fitness Club" },
        { latitude: -26.925406503247252, longitude: -49.05502417042826, nome: "Academia Fonte Fitness" },
        { latitude: -26.9341301717857, longitude: -49.06463720705836, nome: "UX MULTIFIT" },
        { latitude: -26.905354813567524, longitude: -49.08060171431906, nome: "ACADEMIA BLUFIT LTDA" },
        { latitude: -26.959379092061805, longitude: -49.06532385253194, nome: "Optimus Fit" },
        { latitude: -26.925406503247252, longitude: -49.06292059337442, nome: "Runners Blu" },
        { latitude: -26.871212830340138, longitude: -49.052620911270736, nome: "Loop Academia" },
        { latitude: -26.88943337864911, longitude: -49.078541777898316, nome: "Speed Time Academia" },
        { latitude: -26.89341394777548, longitude: -49.078885100635105, nome: "Boo Academia" },
        { latitude: -26.908416370652123, longitude: -49.095536253369396, nome: "Academia Universe Fitness" },
        { latitude: -26.84931366524631, longitude: -49.0857515553709, nome: "Academia T2 Itoupava" },
        { latitude: -26.90060923602751, longitude: -49.09124471915952, nome: "Academia Due FitClub" },
        { latitude: -26.93627272399831, longitude: -49.0696153867418, nome: "WELLNESS ACADEMIA" },
        { latitude: -26.884074698752393, longitude: -49.08077337568745, nome: "GTS Academia" },
        { latitude: -26.897547467263827, longitude: -49.07819845516154, nome: "Academia Due FitClub" },
        { latitude: -26.90060923602751, longitude: -49.09124471915952, nome: "Academia AD3 Blumenau - Itoupava" },
        { latitude: -26.917434499551494, longitude: -49.118861431376125, nome: "Academia Physicus" },
        { latitude: -26.910852575023323, longitude: -49.11250996074552, nome: "Academia Iron Man" },
        { latitude: -26.930138058947357, longitude: -49.13722919779434, nome: "Body Evolution Academia" },
        { latitude: -26.96301743763229, longitude: -49.07786118966654, nome: "Parque do Garcia (Prefeito Carlos Curt Zadrozny)" },
        { latitude: -27.005552348265184, longitude: -49.111030531994174, nome: "Parque Ecológico Spitzkopf" },
        { latitude: -26.900227577383472, longitude: -49.046292844334126, nome: "Praça José Ferreira da Silva" },
        { latitude: -26.90744356313233, longitude: -49.040672131997276, nome: "Clube Blumenauense de Caça e Tiro" },
        { latitude: -26.506664221517816, longitude: -49.125793891529725, nome: "Armalwee Associação Recreativa Malwee" },
        { latitude: -26.906928301350785, longitude: -49.08344095532099, nome: "Splash Fitness" },
        { latitude: -26.920147281793152, longitude: -49.06913090316139, nome: "Fórmula Academia - Shopping Neumarkt" },
        { latitude: -26.886435285714985, longitude: -49.06870413014913, nome: "Academia Smart Fit - Blumenau" },
        { latitude: -26.91409174340167, longitude: -49.113919069595894, nome: "Academia Energia" },
        { latitude: -26.879493056916182, longitude: -49.08576660517918, nome: "Academia New Energy" },
        { latitude: -26.89974376993694, longitude: -49.13517838966871, nome: "CT Masser" },
        { latitude: -26.86047653817281, longitude: -49.08123313384737, nome: "Parque das Itoupavas" },
        { latitude: -26.888616221280966, longitude: -49.05608552056383, nome: "Academia ao ar livre" },
        { latitude: -26.913427531948987, longitude: -49.088642134384685, nome: "Arena BeacHaus" },
        { latitude: -26.885412432811496, longitude: -49.0907020678356, nome: "Blu Beach Arena" },
        { latitude: -26.86872254232852, longitude: -49.11456299804246, nome: "Arena catarinense" },
        { latitude: -26.911590689091874, longitude: -49.09190369741437, nome: "Villaggio Arena" },
        { latitude: -26.798264738295444, longitude: -49.08643377422121, nome: "SUNSET Arena Beach Club" },
        { latitude: -26.934500072643434, longitude: -49.069797481063205, nome: "Blu Padel JunioR" },
        { latitude: -26.891004282068224, longitude: -49.07683566525126, nome: "Blu Praia" },
        { latitude: -26.876612023795026, longitude: -49.06911090367351, nome: "SR Beach Tennis" },
        { latitude: -26.877071379498865, longitude: -49.07099917872584, nome: "Arena Quintino Blumenau | Quadras de Areia" },
        { latitude: -26.922222468410567, longitude: -49.054931994100706, nome: "Tabajara Tênis Clube" },
        { latitude: -26.89881313227676, longitude: -48.82609418781993, nome: "Academia Vida e Saúde" },
        { latitude: -26.90444656005533, longitude: -48.8384353465013, nome: "Orsi Academia - Unidade Ilhota" },
        { latitude: -26.85946827301462, longitude: -48.77285215444869, nome: "Academia ao Ar Livre" },
        { latitude: -26.902319941901055, longitude: -48.82977072746184, nome: "Nara & Fran Pilates" },
        { latitude: -26.912552130554896, longitude: -48.913873931159195, nome: "Ative Academia" },
        { latitude: -26.805153522297417, longitude: -48.95497187802994, nome: "Cachoeira do Baú" },
        { latitude: -27.0957613371662, longitude: -48.907089080152176, nome: "Arena Brusque" },
        { latitude: -27.056326596766812, longitude: -48.87541755768337, nome: "SESI - Centro Esportivo Brusque" },
        { latitude: -27.095720122013105, longitude: -48.93375318711059, nome: "Clube Esportivo Guarani" },
        { latitude: -27.118946503478394, longitude: -48.93881719747823, nome: "Life Arena Beach Sports" },
        { latitude: -27.06928375363341, longitude: -48.887949179163215, nome: "Lob Sports Arena" },
        { latitude: -27.101149918143058, longitude: -48.91326923100143, nome: "Sociedade Esportiva Bandeirante" },
        { latitude: -27.09916332393507, longitude: -48.916444966316725, nome: "Estádio Augusto Bauer" },
        { latitude: -27.121738886986993, longitude: -48.93958439395252, nome: "Rio Soccer" },
        { latitude: -27.077941290373072, longitude: -48.90153358600514, nome: "Viva Sport Academia" },
        { latitude: -27.07251515272094, longitude: -48.90307853832069, nome: "Ginásio Poliesportivo Marcelino Pedro Pereira" },
        { latitude: -27.09620480891787, longitude: -48.92204711952829, nome: "CONCENTRO" },
        { latitude: -27.09933758190846, longitude: -48.91655395573967, nome: "Meninos do Boxe Brusque" },
        { latitude: -27.099097411135517, longitude: -48.92126453958164, nome: "Clube Caça e Tiro Araújo Brusque" },
        { latitude: -27.074110445376647, longitude: -48.901662335594374, nome: "Wonder Size" },
    ];

    pontosfixos.forEach(local => {
        L.marker([local.latitude, local.longitude])
            .addTo(mapInstance)
            .bindPopup(`<b>${local.nome}</b>`);
    });
}

// ===============================================
// FUNÇÃO PARA BUSCAR USUÁRIOS PRÓXIMOS (CHAMA A API DO NODE.JS)
// ===============================================
async function buscarEExibirUsuariosProximos(lat, lon, cpf) {
    const listaDiv = document.getElementById('usuarios-proximos-lista');

    // Indica que a busca está em andamento
    listaDiv.innerHTML = `<p>Buscando usuários próximos...</p>`;

    try {
        const response = await fetch('http://localhost:3000/api/usuarios-proximos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                latitude: lat,
                longitude: lon,
                cpf: cpf
            })
        });

        const data = await response.json();

        if (response.ok && data.success && data.usuarios) {

            if (data.usuarios.length > 0) {
                // Montar lista de usuários
                const htmlUsuarios = data.usuarios.map(usuario => `
                    <div class="usuario-item">
                        <i class="fa-solid fa-circle-user"></i> 
                        ${usuario.nome} 
                        <span style="float: right; color: #555; font-weight: normal;">${usuario.distancia} m</span>
                    </div>
                `).join('');

                listaDiv.innerHTML = `<h3>Pessoas Próximas (em 200m):</h3>` + htmlUsuarios;
            } else {
                // Caso não encontre ninguém
                listaDiv.innerHTML = `<p>Nenhum usuário encontrado a 200m.</p>`;
            }

        } else {
            // Se o servidor retornou um erro 400 ou 500 (com JSON)
            listaDiv.innerHTML = `<p style="color: red;">Erro na busca: ${data.message || 'Erro desconhecido.'}</p>`;
        }

    } catch (error) {
        // Se a rede falhar ou o servidor estiver offline
        console.error('Erro fatal ao buscar usuários (rede/servidor offline):', error);
        listaDiv.innerHTML = `<p style="color: red;">Erro de conexão com o servidor.</p>`;
    }
}

async function buscarEExibirTodosUsuarios() {
    console.log("Buscando todos os usuários para exibição no mapa...");

    try {
        // Chama o novo endpoint que você criará no Node.js
        const response = await fetch('http://localhost:3000/api/todos-usuarios-mapa');

        const data = await response.json();

        if (response.ok && data.success && data.usuarios) {

            // 1. Limpa os marcadores anteriores (embora só seja chamada uma vez, é boa prática)
            userMarkers.clearLayers();

            // 2. Adiciona os novos marcadores
            data.usuarios.forEach(usuario => {
                // Filtra dados inválidos
                if (usuario.latitude && usuario.longitude) {

                    L.marker([usuario.latitude, usuario.longitude])
                        .bindPopup(`<b>${usuario.nome || 'Usuário'}</b>`)
                        .addTo(userMarkers)
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
// INICIALIZAÇÃO DA GEOLOCALIZAÇÃO
// ===============================================
function CasoNãoDeixePegarLocalização() {
    alert("Não foi permitido o acesso à localização!");
}

// Solicita e monitora a localização do usuário
var watchID = navigator.geolocation.watchPosition(
    sucesso,
    CasoNãoDeixePegarLocalização,
    { enableHighAccuracy: true }
);