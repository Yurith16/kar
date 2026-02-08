FROM node:18-bullseye-slim

# Instalar dependencias
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --no-audit

COPY . .

RUN mkdir -p sessions tmp

ENV NODE_ENV=production \
    PORT=3000 \
    LOGIN_MODE=code

EXPOSE 3000

CMD ["npm", "start"]