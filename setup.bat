@echo off
setlocal

:: Pejotinha-v4 - Self-Hosted Setup Script (Windows)
cd /d %~dp0

echo 🚀 Iniciando configuração do Pejotinha-v4 (Self-Hosted Architecture)...

:: Executar o setup centralizado no package.json
call npm run setup
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro durante o setup. Verifique os logs acima.
    pause
    exit /b 1
)

echo.
echo 🎉 Setup concluído com sucesso!
echo --------------------------------------------------
echo Supabase Studio: http://localhost:54323
echo Inbucket (Email): http://localhost:54324
echo App Local: http://localhost:3000 (npm run dev)
echo --------------------------------------------------
echo.
pause
