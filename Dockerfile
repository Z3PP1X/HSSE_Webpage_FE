FROM node:22-alpine

# Setze das Arbeitsverzeichnis
WORKDIR /frontend

# Kopiere package.json und package-lock.json, installiere die Abhängigkeiten
COPY ./frontend/package*.json ./
RUN npm install -g @angular/cli
RUN npm install
RUN npm install -D tailwindcss postcss autoprefixer


# Kopiere den restlichen Code ins Container-Image
COPY ./frontend ./

# Exponiere den Angular-Standardport
EXPOSE 4200

# Starte den Angular Dev Server, bind an alle IPs
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
