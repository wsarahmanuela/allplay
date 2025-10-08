var map;
var circle;

function sucesso(posicao) {
    const lat = posicao.coords.latitude;
    const lon = posicao.coords.longitude;

    console.log(lat, lon); // Pega as coordenadas (Natan)

    // Se o mapa ainda não foi criado
    if (map === undefined) {
        map = L.map('map').setView([lat, lon], 16);

        // Adiciona camada de mapa
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.zoomControl.setPosition('bottomleft');
    } else {
        // Atualiza posição do mapa sem recriar tudo
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

    // Pontos fixos
    const pontosfixos = [
        { latitude: -26.899, longitude: -49.013, nome: "Bela Vista Country Club" },
        { latitude: -26.90931657006177, longitude: -48.93409310678638, nome: "Ginásio João dos Santos" },
        { latitude: -26.942276903407773,   longitude: -48.95252988781849, nome: "Inove Pádel e Esportes de Areia" },
        { latitude: -26.920699351438124,    longitude: -48.976817816654595, nome: "Arena Gaspar"},
        { latitude: -26.89727287050033,     longitude: -49.00191333964011, nome: "Praça Bela Vista"},
        { latitude: -26.929304174804965,    longitude:  -48.938080845490035,  nome: "Isete Esportes by Inove"},
        { latitude: -26.926521747537407,     longitude:  -48.96974992262432,  nome: "Gasparense"},
        { latitude: -26.92922675702557,      longitude:  -48.96479585213692,  nome: "Tupi"},
        { latitude: -26.927208801355135,      longitude:  -48.96500408151238,  nome: "Like Fitness Coloninha"},
        { latitude: -26.92906452085177,      longitude:  -48.962847585571936,  nome: "Pamp´s Academia"},
        { latitude: -26.929294092275676,      longitude:  -48.96162449832212,  nome: "DO Treinamento Personalizado"},
        { latitude: -26.932125434751175,       longitude:  -48.96106659887484,  nome: "Jaguar Cross"},
        { latitude: -26.93221152175355,       longitude:  -48.958384389993675,  nome: "Centro de treinamento Thai Gaspar"},
        { latitude: -26.929263377155838,       longitude:  -48.955749602066895,  nome: "Academia UFit Gaspar - Centro"},
        { latitude: -26.92785724446791,        longitude:  -48.953850598179024,  nome: "Like Fitness Centro"},
        { latitude: -26.8967637423627,       longitude:  -49.00532891371167 ,  nome: "CHJ Academia"},
        { latitude: -26.900112570930116,        longitude:  -49.00392343625794,  nome: "Like Fitness Bela Vista"},
        { latitude: -26.930199494218737,        longitude:  -48.95102937323139,  nome: "Orsi Academia"},
        { latitude: -26.932624513902397,         longitude:  -48.95793030206691,  nome: "Centro de treinamento Thai Gaspar punch boxing"},
        { latitude: -26.900112570930116,        longitude:  -49.00392343625794,  nome: "Like Fitness Bela Vista"},
        { latitude: -26.933599120347086,         longitude:  -48.97256029836956,  nome: "SESC Academia"},
        { latitude: -26.914676082775536,         longitude:  -48.979895829053774,  nome: "Blulive Academia"},
        { latitude: -26.935220798867068,         longitude:  -48.95269971371167,  nome: "Centro de Treinamento Moving Body"},
        { latitude: -26.923765312276494,          longitude:  -48.96392968046372,  nome: "Estúdio Súrya"},
        { latitude: -26.900584693288597,          longitude:  -49.0121259379343,  nome: "LionFit Centro de Treinamento"},
        { latitude: -26.929446657814676,          longitude:  -48.93838527802032,  nome: "Like Acqua Academia"},
        { latitude: -26.925832879772365,           longitude:  -48.95567080195778,  nome: "Benessere Studio de Pilates"},
        { latitude: -26.926841037718802,           longitude:  -48.940049528944634,  nome: "Academia Expressão Corporal"},
        { latitude: -26.937699496576315,           longitude:  -48.936195500109115,  nome: "Ct Cleiton Costa"},
        { latitude: -26.908357992472418,           longitude:  -49.04136050010095,  nome: "Full Body Academia"},
        { latitude: -26.928931525298378,           longitude:  -48.95336691197814,  nome: "Estúdio de Pilates Fisioterapeuta Gisele Soares"},
        { latitude: -26.929446657814676,          longitude:  -48.93838527802032,  nome: "Like Acqua Academia"},

        // Outros pontos podem ser adicionados aqui
    ];

    pontosfixos.forEach(local => {
        L.marker([local.latitude, local.longitude])
            .addTo(map)
            .bindPopup(`<b>${local.nome}</b>`);
    });
}

// Caso o usuário negue o acesso à localização
function CasoNãoDeixePegarLocalização() {
    alert("Não foi permitido o acesso à localização!");
}

// Solicita e monitora a localização do usuário
var watchID = navigator.geolocation.watchPosition(
    sucesso,
    CasoNãoDeixePegarLocalização,
    { enableHighAccuracy: true }
);
