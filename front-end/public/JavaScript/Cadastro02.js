const inputFoto = document.getElementById("upload-foto"); //campo onde o usuário escolhe a foto
const preView = document.getElementById("foto-preview"); //campo onde a foto vai ficar

inputFoto.addEventListener("change", function(){
    const file =  this.files[0];

    if(file){
        const reader = new FileReader(); //objeto que serve para ler o contéudo de arquivos, no caso a foto
        
        reader.onload = function(e) {
        preview.innerHTML = `
        <img src="${e.target.result}" alt="Foto de perfil"
         style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
        <div class="upload-imagen"><i class="fa-solid fa-arrow-up-from-bracket"></i></div>
         `;
        };
    };

    reader.readAsDataURL(file);
});