---
name: deploy-dedicated-server
description: "Procedimentos e scripts para testar localmente e implantar o HealthTrack em servidor dedicado Linux (Ubuntu/Debian) com Docker Compose, Nginx e PostgreSQL. Enfatiza a diretriz SEM VERCEL e variáveis estritamente locais."
---

# 🖥️ Skill: Implantação em Servidor Dedicado & Execução Local

Esta skill orienta sobre a infraestrutura do **HealthTrack**, configurada para ser 100% autossuficiente e independente de plataformas serverless ou nuvens proprietárias como a Vercel.

---

## 🚫 Regra Inviolável: SEM VERCEL

- O HealthTrack é concebido para:
  1. **Ambiente Local**: Testes imediatos, desenvolvimento e validação de código.
  2. **Servidor Dedicado (VPS ou Bare Metal Linux)**: Produção com Docker Compose ou Nginx reverso com PostgreSQL 16.
- Todas as variáveis de ambiente devem ser **locais** lidas do arquivo `.env` no próprio servidor ou máquina.

---

## 💻 Fluxo de Execução Local

```bash
# 1. Utilizar a versão recomendada do Node (Node >= 22.12.0)
nvm use

# 2. Instalar dependências sem conflitos
npm install

# 3. Copiar variáveis de ambiente locais
cp .env.local .env

# 4. Validar tipagem e testes
npm run lint

# 5. Iniciar servidor Vite na porta 3000
npm run dev
```

---

## 🐳 Execução com Docker Local (Espelho de Produção)

Para rodar exatamente como rodará no servidor dedicado:

```bash
# Sobe o container do PostgreSQL 16 e a aplicação servida por Nginx Alpine
docker compose up -d --build

# Visualizar logs
docker compose logs -f

# Acessar aplicação
# http://localhost:3000
```

---

## 🚀 Deploy no Servidor Dedicado Linux (Ubuntu 22.04 / 24.04 LTS ou Debian 12)

### Método 1: Script Automatizado (`deploy-dedicated-server.sh`)
```bash
# No servidor dedicado:
chmod +x deploy-dedicated-server.sh
./deploy-dedicated-server.sh
```

### Método 2: Nginx Reverso Nativo com SSL Gratuito (Certbot / Let's Encrypt)
1. Copie o arquivo `nginx-dedicated-server.conf` para `/etc/nginx/sites-available/healthtrack.conf`.
2. Habilite o site e gere o certificado HTTPS:
   ```bash
   sudo ln -s /etc/nginx/sites-available/healthtrack.conf /etc/nginx/sites-enabled/
   sudo certbot --nginx -d seu-dominio.com.br
   sudo nginx -t && sudo systemctl reload nginx
   ```

### Método 3: Backup Automático do Banco de Dados
Configure o crontab (`crontab -e`) para realizar backup diário às 03:00 da manhã:
```bash
0 3 * * * docker exec healthtrack_postgres pg_dump -U health_prod_user healthtrack_production | gzip > /backups/healthtrack_$(date +\%F).sql.gz
```
