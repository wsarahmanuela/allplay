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
        { latitude: -26.899, longitude: -49.013, nome: "Bela Vista Country Club" }
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
