#!/bin/bash

# Pejotinha-v4 - Self-Hosted Setup Script (Linux/macOS/Bash)
cd "$(dirname "$0")"

echo "🚀 Iniciando configuração do Pejotinha-v4 (Self-Hosted Architecture)..."

# Executar o setup centralizado no package.json
if npm run setup; then
    echo ""
    echo "🎉 Setup concluído com sucesso!"
    echo "--------------------------------------------------"
    echo "Supabase Studio: http://localhost:54323"
    echo "Inbucket (Email): http://localhost:54324"
    echo "App Local: http://localhost:3000 (npm run dev)"
    echo "--------------------------------------------------"
    echo ""
else
    echo "❌ Erro durante o setup. Verifique os logs acima."
    exit 1
fi
