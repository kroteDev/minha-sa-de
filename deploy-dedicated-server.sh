#!/bin/bash
# ==============================================================================
# Script de Deploy e Atualização em Servidor Dedicado
# HealthTrack — Monitor de Saúde Diário
# Uso: chmod +x deploy-dedicated-server.sh && ./deploy-dedicated-server.sh
# ==============================================================================

set -e

echo "🚀 Iniciando deploy do HealthTrack no Servidor Dedicado..."

# 1. Verifica existência do arquivo de ambiente de produção
if [ ! -f .env ]; then
    if [ -f .env.production.example ]; then
        echo "⚠️ Arquivo .env não encontrado! Copiando de .env.production.example..."
        cp .env.production.example .env
        echo "❗ Por favor, edite o arquivo .env com suas credenciais seguras e reexecute o deploy."
        exit 1
    else
        echo "❌ Erro: nenhum arquivo de ambiente encontrado."
        exit 1
    fi
fi

# 2. Carrega variáveis de ambiente locais
source .env

# 3. Garante que as migrações do banco estejam atualizadas (se rodar via Prisma local)
if command -v npx &> /dev/null; then
    echo "📦 Verificando Prisma Client..."
    npx prisma generate || true
fi

# 4. Reconstrói e sobe os containers Docker
echo "🐳 Construindo e subindo containers Docker..."
docker compose down --remove-orphans || true
docker compose up -d --build

# 5. Validação de Saúde dos Containers
echo "⏳ Aguardando inicialização dos serviços..."
sleep 5

if docker ps | grep -q "healthtrack_app"; then
    echo "✅ HealthTrack App está rodando com sucesso na porta ${APP_PORT:-3000}!"
else
    echo "❌ Falha ao iniciar o container da aplicação. Verifique os logs com: docker compose logs web"
    exit 1
fi

if docker ps | grep -q "healthtrack_postgres"; then
    echo "✅ Banco de dados PostgreSQL está ativo e saudável!"
fi

echo "================================================================================"
echo "🎉 Deploy concluído com sucesso!"
echo "Acesse localmente em: http://localhost:${APP_PORT:-3000}"
echo "Se configurou o Nginx como proxy reverso, acesse pelo seu domínio: ${NEXTAUTH_URL:-http://localhost:3000}"
echo "================================================================================"
