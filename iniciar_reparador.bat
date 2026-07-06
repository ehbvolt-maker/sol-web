@echo off
title Pago Reparador de Credito - Equity Solar
cd /d "C:\Users\elyeh\.gemini\antigravity\playground\entropic-equinox\sol"
echo Iniciando el servidor y abriendo el formulario de pago...
start "" "http://localhost:3000/comprar.html"
npm start
pause
