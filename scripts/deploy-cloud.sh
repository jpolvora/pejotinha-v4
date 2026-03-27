#!/bin/bash

# Pejotinha-v4 - Supabase Cloud Deployment Script
# Este script sincroniza o projeto local com a conta do Supabase

echo "☁️  Iniciando sincronização com Supabase Cloud..."

# 1. Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI não encontrado. Por favor, instale com 'npm install -g supabase'."
    exit 1
fi

# 2. Verificar se o projeto está linkado
if [ ! -f "supabase/.temp/project-ref" ]; then
    echo "⚠️  Projeto não linkado ao Supabase."
    echo "Dica: Rode 'npm run supabase:link' primeiro."
    exit 1
fi

PROJECT_REF=$(cat supabase/.temp/project-ref)
echo "🔗 Projeto linkado: $PROJECT_REF"

# 3. Sincronizar banco de dados (Prisma -> Supabase)
echo "📂 Sincronizando schema do banco de dados..."
# Primeiro garantimos que o Prisma gerou o que precisa
npx prisma generate

# O usuário pode querer rodar migrations do Supabase ou apenas o db push
# Como o projeto usa Prisma, o db push é o caminho mais comum para sincronizar schema
# Mas o Supabase CLI também tem o 'db push' que aplica migrations locais
echo "🚀 Aplicando mudanças no banco de dados remoto..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Sincronização do banco concluída!"
else
    echo "❌ Erro ao sincronizar o banco de dados."
    exit 1
fi

# 4. Deploy de Edge Functions (se existirem)
if [ -d "supabase/functions" ]; then
    echo "⚡ Deploying Edge Functions..."
    supabase functions deploy
fi

echo "🎉 Sincronização com Supabase concluída com sucesso!"
echo "Lembre-se: O deploy do Next.js (Frontend) deve ser feito separadamente (ex: Vercel ou via Docker)."
