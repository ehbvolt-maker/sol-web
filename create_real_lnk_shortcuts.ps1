# Script para crear accesos directos Windows LNK oficiales
$WshShell = New-Object -ComObject WScript.Shell

$desktops = @(
    [Environment]::GetFolderPath('Desktop'),
    "C:\Users\elyeh\Desktop",
    "D:\OneDrive\Desktop",
    "C:\Users\Public\Desktop"
)

foreach ($desktopPath in $desktops) {
    if (Test-Path $desktopPath) {
        Write-Host "Creando accesos directos LNK en: $desktopPath"

        # 1. Acceso directo LNK para abrir el Estudio Web en el Navegador
        $lnkWeb = $WshShell.CreateShortcut("$desktopPath\Sabes Quien Soy - Estudio Romantico.lnk")
        $lnkWeb.TargetPath = "cmd.exe"
        $lnkWeb.Arguments = "/c start file:///c:/Users/elyeh/.gemini/antigravity/playground/entropic-equinox/youtube_romantic_studio/index.html"
        $lnkWeb.WorkingDirectory = "c:\Users\elyeh\.gemini\antigravity\playground\entropic-equinox\youtube_romantic_studio"
        $lnkWeb.Description = "Estudio de Produccion de Musica Romantica AI"
        $lnkWeb.IconLocation = "shell32.dll, 13" # Red Heart / Music / Folder Icon
        $lnkWeb.Save()

        # 2. Acceso directo LNK para el Generador Diario Batch
        $lnkBat = $WshShell.CreateShortcut("$desktopPath\Sabes Quien Soy - Generar Video Diario.lnk")
        $lnkBat.TargetPath = "c:\Users\elyeh\.gemini\antigravity\playground\entropic-equinox\iniciar_estudio_romantico.bat"
        $lnkBat.WorkingDirectory = "c:\Users\elyeh\.gemini\antigravity\playground\entropic-equinox"
        $lnkBat.Description = "Generador Diario de Canciones y Videos para YouTube"
        $lnkBat.IconLocation = "shell32.dll, 238"
        $lnkBat.Save()
    }
}

# Crear el archivo BAT maestro en la raiz del proyecto
$masterBatPath = "c:\Users\elyeh\.gemini\antigravity\playground\entropic-equinox\iniciar_estudio_romantico.bat"
$masterBatContent = @"
@echo off
chcp 65001 > nul
title Sabes Quien Soy - Tu Fantasia (Estudio AI)
color 0C
cd /d c:\Users\elyeh\.gemini\antigravity\playground\entropic-equinox
cls
echo ===================================================================
echo   SABES QUIEN SOY - TU FANTASIA | GENERADOR DIARIO Y ESTUDIO WEB
echo ===================================================================
echo.
echo [1/2] Ejecutando el generador diario de canciones y metadatos SEO...
echo.
python backend/daily_automation.py
echo.
echo [2/2] Abriendo el Estudio Web de Produccion y Visualizador de Video...
start youtube_romantic_studio/index.html
echo.
echo ===================================================================
echo  Proceso completado exitosamente. Puedes cerrar esta ventana.
echo ===================================================================
timeout /t 5
"@
[System.IO.File]::WriteAllText($masterBatPath, $masterBatContent)

Write-Host "✅ Accesos directos LNK creados y registrados exitosamente!"
