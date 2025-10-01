var map;
var circle;

function sucesso(posicao) {
    console.log(posicao.coords.latitude, posicao.coords.longitude); //Pega as cordenadas de latitude e longitude (natan)

    if (map === undefined) {
        map = L.map('map').setView([posicao.coords.latitude, posicao.coords.longitude], 16);
    } else {
        map.remove();
        map = L.map('map').setView([posicao.coords.latitude, posicao.coords.longitude], 16);
    }

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { //mostra as imagens do mapa propriamente
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' //creditos ao site
    }).addTo(map);

   //map.setMinZoom(-100);

    L.marker([posicao.coords.latitude, posicao.coords.longitude]).addTo(map)
        .bindPopup('Vc está por aqui')
        .openPopup(); //point de localização


    map.zoomControl.setPosition('bottomleft');

    circle = L.circle([posicao.coords.latitude, posicao.coords.longitude], {
        color: 'green',
        fillColor: '#0f9800',
        fillOpacity: 0.5,
        radius: 250
    }).addTo(map);

    const pontosfixos= [
    { latitude: -26.899, longitude: -49.013, nome: "Bela Vista Country Club" }, 
    { latitude: -26.896, longitude: -49.010, nome: "Ginásio Wilmar Sully Pereira (Bela Vista)" },
    { latitude: -26.897, longitude: -49.011, nome: "Parque Natural Municipal dos Bugios" }, 
    { latitude: -26.898, longitude: -49.012, nome: "Parque Municipal do Bela Vista" }, 
    { latitude: -26.91019366521823, longitude: -48.933948188079384, nome: "Ginásio Prefeito João dos Santos (Poço Grande)" }, 
    { latitude: -26.900, longitude: -49.020, nome: "Arena Multiuso – Margem Esquerda"}
    ];

    pontosfixos.forEach(local => {
    L.marker([local.latitude, local.longitude])
        .addTo(map)
        .bindPopup(`<b>${local.nome}</b>`);
});
}

function CasoNãoDeixePegarLocalização() {
    alert("Não foi permitido o acesso a localização!"); //Aviso de que nn foi possivel pegar as cordenadas (natan)
}

var watchID = navigator.geolocation.watchPosition(sucesso, CasoNãoDeixePegarLocalização, {
    enableHighAccuracy: true //deixa o mais preciso possivel a localizaçõa

}); //Função que mostra as cordenadas dos usuários e atualiza as cordenadas(natan)