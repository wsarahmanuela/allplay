# Usa uma imagem Node.js oficial
FROM node:18

# Cria e define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o projeto
COPY . .

# Expõe a porta da aplicação
EXPOSE 3000

# Muda o diretório para onde está o app principal
WORKDIR /usr/src/app/front-end

# Comando de inicialização
CMD ["node", "appbanco.js"]
