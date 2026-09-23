@echo off
chcp 65001 >nul
title Sistema CRM Solar - Equity Solar / Puronics
color 0A

echo ============================================================
echo      INICIANDO SISTEMA CRM SOLAR - EQUITY SOLAR / PURONICS
echo ============================================================
echo.

cd /d "C:\Users\elyeh\.gemini\antigravity\playground\entropic-equinox\sol"

echo [1/2] Asegurando servidor Backend Node.js...
start /b node server.js >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/2] Abriendo CRM Solar Dashboard en el navegador...
start "" "http://localhost:3000/dashboard.html"

echo.
echo ============================================================
echo      CRM SOLAR ACTIVO EN: HTTP://LOCALHOST:3000/DASHBOARD.HTML
echo ============================================================
echo.
timeout /t 3
