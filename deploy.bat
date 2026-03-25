@echo off
setlocal

:: Pejotinha-v4 - Production Deployment Script (Windows)

:: Configurações (Altere conforme sua conta)
set REGISTRY=ghcr.io
set USERNAME=jpolvora
set IMAGE_NAME=pejotinha-v4
set TAG=latest

set IMAGE_PATH=%REGISTRY%/%USERNAME%/%IMAGE_NAME%:%TAG%

echo 🏗️  Iniciando build de produção: %IMAGE_PATH%...

:: 1. Build da imagem usando o estágio 'runner' (produção standalone)
docker build --target runner -t %IMAGE_PATH% .

if %errorlevel% neq 0 (
    echo ❌ Erro durante o build.
    pause
    exit /b %errorlevel%
)

echo ✅ Build concluído com sucesso!

:: 2. Login e Push
echo 🚀 Subindo imagem para o registry (%REGISTRY%)...
echo (Verifique se você está logado no Docker: docker login ghcr.io)
docker push %IMAGE_PATH%

if %errorlevel% neq 0 (
    echo ❌ Erro ao subir a imagem para o registry. Verifique suas credenciais.
    pause
    exit /b %errorlevel%
)

echo.
echo 🎉 Imagem disponível em: %IMAGE_PATH%
echo Você pode usar esta imagem no Portainer (Arcane), Coolify ou Umbrel!
echo.
pause
