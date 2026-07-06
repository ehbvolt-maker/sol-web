@echo off
title Servidor CRM GHL - GHL Setup Pro
cd /d "C:\Users\elyeh\.gemini\antigravity\playground\entropic-equinox\ghl_crm_setup"
echo Iniciando el servidor Node.js en http://localhost:3000...
start "" "http://localhost:3000"
npm start
pause
