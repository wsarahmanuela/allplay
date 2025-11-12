# Use a lightweight Node.js image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose port 3000 for your app
EXPOSE 3000

# Command to start the application
CMD ["node", "appbanco.js"]
