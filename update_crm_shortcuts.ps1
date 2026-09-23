$WshShell = New-Object -ComObject WScript.Shell
$desktopPaths = @(
    [Environment]::GetFolderPath('Desktop'),
    'C:\Users\elyeh\Desktop',
    'D:\OneDrive\Desktop',
    'C:\Users\Public\Desktop'
)

$batContent = @"
@echo off
chcp 65001 >nul
title Sistema CRM Solar - Equity Solar / Puronics
color 0A

echo ============================================================
echo      INICIANDO SISTEMA CRM SOLAR - EQUITY SOLAR / PURONICS
echo ============================================================
echo.

cd /d "C:\Users\elyeh\.gemini\antigravity\playground\entropic-equinox\sol"

echo [1/3] Verificando puerto 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Puerto 3000 activo (PID %%a).
)

echo [2/3] Asegurando servidor Backend Node.js...
start /b node server.js >nul 2>&1
timeout /t 2 /nobreak >nul

echo [3/3] Abriendo CRM Solar Dashboard en el navegador...
start "" "http://localhost:3000/dashboard.html"

echo.
echo ============================================================
echo      CRM SOLAR ACTIVO EN: HTTP://LOCALHOST:3000/DASHBOARD.HTML
echo ============================================================
echo.
timeout /t 5
"@

foreach ($desktopPath in $desktopPaths) {
    if (Test-Path $desktopPath) {
        Write-Host "Configurando accesos directos de CRM en: $desktopPath"

        # Guardar archivos .bat
        [System.IO.File]::WriteAllText((Join-Path $desktopPath 'CRM_Sol.bat'), $batContent)
        [System.IO.File]::WriteAllText((Join-Path $desktopPath 'Dashboard_CRM_Sol.bat'), $batContent)
        [System.IO.File]::WriteAllText((Join-Path $desktopPath 'Sistema_CRM_Sol.bat'), $batContent)

        # Crear accesos directos .url
        $urlContent = "[InternetShortcut]`nURL=http://localhost:3000/dashboard.html`nIconIndex=0"
        [System.IO.File]::WriteAllText((Join-Path $desktopPath 'CRM_Dashboard.url'), $urlContent)
        [System.IO.File]::WriteAllText((Join-Path $desktopPath 'CRM_Panel_Completo.url'), $urlContent)

        # Crear acceso directo oficial .lnk
        $lnkPath = Join-Path $desktopPath 'CRM Solar - Dashboard.lnk'
        $lnk = $WshShell.CreateShortcut($lnkPath)
        $lnk.TargetPath = Join-Path $desktopPath 'CRM_Sol.bat'
        $lnk.WorkingDirectory = 'C:\Users\elyeh\.gemini\antigravity\playground\entropic-equinox\sol'
        $lnk.Description = 'Panel de Control CRM Solar Sol Energy'
        $lnk.IconLocation = 'shell32.dll, 220'
        $lnk.Save()
    }
}

Write-Host "✅ Accesos directos de CRM actualizados exitosamente en todos los Escritorios!"
