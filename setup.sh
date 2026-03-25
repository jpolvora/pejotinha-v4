#!/bin/bash

# Pejotinha-v4 - Self-Hosted Setup Script (Linux/macOS/Bash)
# Garantir que o script rode no diretório raiz do projeto
cd "$(dirname "$0")"

echo "🚀 Iniciando configuração do Pejotinha-v4 (Self-Hosted Architecture)..."

# 1. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 2. Configurar Ambiente e Supabase (Desejado pelo usuário)
echo "📦 Configurando Ambiente e Supabase..."
if node scripts/setup-env.mjs; then
    echo "✅ Ambiente configurado."
else
    echo "❌ Erro durante a configuração inicial. Verifique se o Docker está rodando."
    exit 1
fi

# 2. Sincronizar Banco com Prisma
echo "🏗️  Sincronizando Banco de Dados com Prisma..."
npx prisma db push

# 3. Sincronizar Autenticação (Garante login funcional)
echo "🔑 Sincronizando usuários de Autenticação..."
node scripts/sync-auth.mjs

# 4. Popular dados (Seed)
echo "🌱 Populando banco de dados (public schema)..."
npx prisma db seed

echo ""
echo "🎉 Setup concluído com sucesso!"
echo "--------------------------------------------------"
echo "Supabase Studio: http://localhost:54323"
echo "Inbucket (Email): http://localhost:54324"
echo "App Local: http://localhost:3000 (npm run dev)"
echo "--------------------------------------------------"
echo ""
