var map;
var circle;

function sucesso(posicao) {
    console.log(posicao.coords.latitude, posicao.coords.longitude); //Pega as cordenadas de latitude e longitude (natan)

    if (map === undefined) {
        map = L.map('map').setView([posicao.coords.latitude, posicao.coords.longitude], 2500);
    } else {
        map.remove();
        map = L.map('map').setView([posicao.coords.latitude, posicao.coords.longitude], 2500);
    }

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { //mostra as imagens do mapa propriamente
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' //creditos ao site
    }).addTo(map);

    L.marker([posicao.coords.latitude, posicao.coords.longitude]).addTo(map)
        .bindPopup('Vc está por aqui')
        .openPopup(); //point de localização

    map.zoomControl.setPosition('bottomleft');

    circle = L.circle([posicao.coords.latitude, posicao.coords.longitude], {
        color: 'green',
        fillColor: '#0f9800',
        fillOpacity: 0.5,
        radius: 100
    }).addTo(map);

}

function CasoNãoDeixePegarLocalização() {
    alert("Não foi permitido o acesso a localização!"); //Aviso de que nn foi possivel pegar as cordenadas (natan)
}

var watchID = navigator.geolocation.watchPosition(sucesso, CasoNãoDeixePegarLocalização, {
    enableHighAccuracy: true //deixa o mais preciso possivel a localizaçõa

}); //Função que mostra as cordenadas dos usuários e atualiza as cordenadas(natan)