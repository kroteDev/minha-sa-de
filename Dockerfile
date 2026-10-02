# syntax=docker/dockerfile:1
# Multi-stage Dockerfile otimizado para Hospedagem Local e Servidor Dedicado
# Compatível com Docker Compose e execução independente

# Estágio 1: Dependências
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Estágio 2: Builder
FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN npx prisma generate || true
RUN npm run build

# Estágio 3: Runner de Produção
# Imagem Nginx Alpine super leve (~25MB), segura, com gzip e suporte total a SPA
FROM nginx:alpine AS runner

# Copia os arquivos compilados da aplicação
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a configuração customizada do Nginx com roteamento e cabeçalhos de segurança
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta padrão configurada no docker-compose (3000)
EXPOSE 3000

# Inicia o Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]

