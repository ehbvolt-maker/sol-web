# Script para crear accesos directos en el Escritorio
$desktop = [Environment]::GetFolderPath('Desktop')
Write-Host "Directorio de Escritorio detectado: $desktop"

# 1. Acceso directo al Estudio Web (.url)
$urlPath = Join-Path $desktop "Sabes Quien Soy - Estudio Romantico.url"
$urlContent = @"
[InternetShortcut]
URL=file:///c:/Users/elyeh/.gemini/antigravity/playground/entropic-equinox/youtube_romantic_studio/index.html
IconIndex=0
IconFile=C:\Windows\System32\shell32.dll
"@
[System.IO.File]::WriteAllText($urlPath, $urlContent)

# 2. Acceso directo ejecutable Batch (.bat)
$batPath = Join-Path $desktop "Sabes Quien Soy - Generar Video Diario.bat"
$batContent = @"
@echo off
chcp 65001 > nul
title Sabes Quien Soy - Tu Fantasia (Estudio AI)
cd /d c:\Users\elyeh\.gemini\antigravity\playground\entropic-equinox
echo ====================================================
echo  SABES QUIEN SOY - TU FANTASIA | PROCESO DIARIO
echo ====================================================
echo.
python backend/daily_automation.py
echo.
echo Abriendo Estudio Web de Edicion...
start youtube_romantic_studio/index.html
echo.
pause
"@
[System.IO.File]::WriteAllText($batPath, $batContent)

Write-Host "✅ Accesos directos creados correctamente en el Escritorio!"
