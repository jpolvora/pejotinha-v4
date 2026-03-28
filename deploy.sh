#!/bin/bash

# Pejotinha-v4 - Production Deployment Script
# Este script builda a imagem otimizada e sobe para um registry (padrão GHCR)

# Configurações (Precedência: .env.local > Hardcoded)
REGISTRY="ghcr.io"
USERNAME="jpolvora"
IMAGE_NAME="pejotinha-v4"
TAG="latest"

# 0. Detectar ambiente e variáveis Coolify
PJ_ENV="local"
if [ -f ".env.local" ]; then
    PJ_ENV=$(grep "^PJ_ENV=" .env.local | cut -d '=' -f2)
    # Tentar extrair registry e username do .env.local se existirem
    ENV_REGISTRY=$(grep "^PJ_DOCKER_REGISTRY=" .env.local | cut -d '=' -f2)
    ENV_USERNAME=$(grep "^PJ_DOCKER_USERNAME=" .env.local | cut -d '=' -f2)
    ENV_IMAGE_NAME=$(grep "^PJ_COOLIFY_APP_NAME=" .env.local | cut -d '=' -f2)
    
    [ ! -z "$ENV_REGISTRY" ] && REGISTRY=$ENV_REGISTRY
    [ ! -z "$ENV_USERNAME" ] && USERNAME=$ENV_USERNAME
    [ ! -z "$ENV_IMAGE_NAME" ] && IMAGE_NAME=$ENV_IMAGE_NAME
fi

IMAGE_PATH="$REGISTRY/$USERNAME/$IMAGE_NAME:$TAG"

ENV_FILE=".env"
if [ "$PJ_ENV" == "cloud" ]; then
    ENV_FILE=".env.cloud"
fi

echo "🚀 [Context: ${PJ_ENV^^}] Usando $ENV_FILE para o build..."
echo "📦 Buildando: $IMAGE_PATH"

# 1. Build da imagem usando o estágio 'runner' (produção standalone)
docker build --target runner --build-arg ENV_FILE=$ENV_FILE -t $IMAGE_PATH .

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
else
    echo "❌ Erro durante o build."
    exit 1
fi

# 2. Login no Registry (Se necessário)
echo "🔑 Tentando login no $REGISTRY..."
# docker login $REGISTRY

# 3. Push para o Registry
echo "🚀 Subindo imagem para o registry..."
docker push $IMAGE_PATH

if [ $? -eq 0 ]; then
    echo "🎉 Imagem disponível em: $IMAGE_PATH"
else
    echo "❌ Erro ao subir a imagem."
    exit 1
fi

# 4. Trigger Coolify API (Novo!)
if [ -f "scripts/coolify-trigger.mjs" ]; then
    echo "🔔 Avisando o Coolify sobre a nova versão..."
    node scripts/coolify-trigger.mjs
fi
