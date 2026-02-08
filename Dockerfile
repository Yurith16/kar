FROM node:18-alpine

RUN apk add --no-cache ffmpeg python3 make g++ git bash

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --no-audit

COPY . .

# Directorios necesarios
RUN mkdir -p sessions tmp

# Koyeb usa puerto 8000 por defecto
ENV PORT=8000
ENV NODE_ENV=production
ENV LOGIN_MODE=qr

EXPOSE 8000

CMD ["npm", "start"]