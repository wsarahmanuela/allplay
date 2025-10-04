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
        radius: 200
    }).addTo(map);

        radius: 250
    }).addTo(map);

    const pontosfixos= [
    { latitude: -26.899, longitude: -49.013, nome: "Bela Vista Country Club" }, 
    //{ latitude: , longitude: , nome: ""},
    //{ latitude: , longitude: , nome: ""}, 
    //{ latitude: , longitude: , nome: ""}, 
    //{ latitude: , longitude: , nome: ""}, 
    //{ latitude: , longitude: , nome: ""}
    ];

    pontosfixos.forEach(local => {
    L.marker([local.latitude, local.longitude])
        .addTo(map)
        .bindPopup(`<b>${local.nome}</b>`);
});


function CasoNãoDeixePegarLocalização() {
    alert("Não foi permitido o acesso a localização!"); //Aviso de que nn foi possivel pegar as cordenadas (natan)
}

var watchID = navigator.geolocation.watchPosition(sucesso, CasoNãoDeixePegarLocalização, {
    enableHighAccuracy: true //deixa o mais preciso possivel a localizaçõa

}); //Função que mostra as cordenadas dos usuários e atualiza as cordenadas(natan)