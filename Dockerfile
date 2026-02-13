FROM node:18-alpine

# Instalar dependencias necesarias para WhatsApp
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++ \
    git \
    bash \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY yarn.lock* ./
COPY npm-shrinkwrap.json* ./

# Instalar dependencias
RUN npm ci --only=production --no-audit --omit=dev || \
    npm install --production --no-audit

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p sessions tmp auth_info && \
    chmod -R 777 sessions tmp auth_info

# Variables de entorno para Back4app
ENV NODE_ENV=production
ENV PORT=3000
ENV LOGIN_MODE=code
ENV CHROME_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Back4app usa puerto 3000 por defecto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]