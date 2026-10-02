---
description: "Verifica e prepara o pacote de deploy para servidor dedicado Linux (Docker Compose, Nginx, PostgreSQL e variáveis locais)."
---

# Comando: `/deploy-server`

Verifica o estado dos arquivos de infraestrutura dedicados antes de enviar o código para o servidor VPS de produção.

## Verificações Realizadas:

1. **Validação do `Dockerfile`:**
   - Garante compilação multi-stage com `node:22-alpine` e runner com `nginx:alpine`.
   - Verifica se os arquivos de build estáticos são copiados para `/usr/share/nginx/html`.

2. **Validação do `docker-compose.yml`:**
   - Verifica se o container do PostgreSQL 16 está configurado com volume persistente (`postgres_data`).
   - Verifica se a porta da aplicação utiliza `${APP_PORT:-3000}`.
   - Confirma que o atributo obsoleto `version:` não está presente.

3. **Validação do `nginx-dedicated-server.conf`:**
   - Confirma se o proxy reverso para `localhost:3000` está configurado corretamente.
   - Verifica se as diretivas de SSL do Let's Encrypt / Certbot e cabeçalhos de segurança estão presentes.

4. **Validação de Variáveis de Ambiente:**
   - Confirma que `.env.production.example` e `.env.local` estão atualizados com todas as variáveis necessárias.
   - Verifica a ausência de chaves de nuvem proprietárias (Vercel, Netlify, etc.).

5. **Script de Deploy:**
   - Verifica se o script `deploy-dedicated-server.sh` possui permissão de execução e comandos corretos de `docker compose pull && docker compose up -d --build`.
