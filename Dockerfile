FROM node:18-alpine

# Instalar dependencias
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++ \
    git \
    bash

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias primero
COPY package*.json ./
RUN npm ci --only=production --no-audit

# Copiar código
COPY . .

# Directorios necesarios
RUN mkdir -p sessions tmp

# Variables de entorno
ENV PORT=7860
ENV NODE_ENV=production
ENV LOGIN_MODE=code

# Exponer puerto (HF usa 7860)
EXPOSE 7860

# Health check (opcional)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:7860/health || exit 1

# Comando de inicio
CMD ["npm", "start"]