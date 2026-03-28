#!/bin/bash

# Pejotinha-v4 - Production Deployment Script
# Este script builda a imagem otimizada e sobe para um registry (padrão GHCR)

# Configurações (Altere conforme sua conta)
REGISTRY="ghcr.io"
USERNAME="jpolvora" # Coloque seu usuário do GitHub
IMAGE_NAME="pejotinha-v4"
TAG="latest"

IMAGE_PATH="$REGISTRY/$USERNAME/$IMAGE_NAME:$TAG"

# 0. Detectar ambiente salvo
PJ_ENV="local"
if [ -f ".env.local" ]; then
    PJ_ENV=$(grep "^PJ_ENV=" .env.local | cut -d '=' -f2)
fi

ENV_FILE=".env"
if [ "$PJ_ENV" == "cloud" ]; then
    ENV_FILE=".env.cloud"
fi

echo "🚀 [Context: ${PJ_ENV^^}] Usando $ENV_FILE para o build..."

# 1. Build da imagem usando o estágio 'runner' (produção standalone)
# Passamos as variáveis do arquivo selecionado para o build se necessário
docker build --target runner --build-arg ENV_FILE=$ENV_FILE -t $IMAGE_PATH .

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
else
    echo "❌ Erro durante o build."
    exit 1
fi

# 2. Login no Registry (Caso ainda não esteja logado)
# Para o GHCR no GitHub, você precisará de um PAT (Personal Access Token)
echo "🔑 Tentando login no $REGISTRY..."
echo "(Se falhar, rode: echo OPAT | docker login ghcr.io -u SEU_USUARIO --password-stdin)"
# docker login $REGISTRY

# 3. Push para o Registry
echo "🚀 Subindo imagem para o registry..."
docker push $IMAGE_PATH

if [ $? -eq 0 ]; then
    echo "🎉 Imagem disponível em: $IMAGE_PATH"
    echo "Agora você pode usar esta imagem no Portainer (Arcane) ou Coolify/Umbrel!"
else
    echo "❌ Erro ao subir a imagem. Verifique suas credenciais."
    exit 1
fi
