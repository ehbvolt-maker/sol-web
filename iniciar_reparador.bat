@echo off
title Reparador de Credito - Menu de Inicio
cd /d "C:\Users\elyeh\.gemini\antigravity\playground\entropic-equinox\sol"

echo ============================================================
echo         REPARADOR DE CREDITO - MENU DE CONFIGURACION
echo ============================================================
echo.
echo [1] Iniciar localmente (Solo para uso en esta PC)
echo [2] Generar enlace publico (Para compartir con clientes)
echo.
set /p opcion="Selecciona una opcion (1 o 2): "

if "%opcion%"=="1" (
    echo.
    echo Iniciando servidor local...
    start "" "http://localhost:3000/comprar.html"
    npm start
) else if "%opcion%"=="2" (
    echo.
    echo Iniciando servidor en segundo plano...
    start "Servidor Local" /min cmd /c "npm start"
    echo.
    echo Generando tu enlace publico para compartir...
    echo.
    echo ============================================================
    echo  Copia el enlace que termina en '.run.pinggy-free.link'
    echo  y enviaselo a tus clientes (recuerda agregar /comprar.html)
    echo ============================================================
    echo.
    ssh -o StrictHostKeyChecking=no -p 443 -R 80:localhost:3000 a.pinggy.io
) else (
    echo Opcion invalida.
    pause
)
