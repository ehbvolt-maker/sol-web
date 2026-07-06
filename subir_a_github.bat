@echo off
title Subir Cambios a GitHub - sol-web
cd /d "C:\Users\elyeh\.gemini\antigravity\playground\entropic-equinox"
echo ============================================================
echo   SUBIENDO CAMBIOS A GITHUB (ehbvolt-maker/sol-web)
echo ============================================================
echo.
echo Agregando y confirmando cambios locales...
git\cmd\git.exe add .
git\cmd\git.exe commit -m "Actualizacion Reparador de Credito: modulo bancarrotas, traduccion, checkout y desktop"
echo.
echo Ejecutando git push para actualizar tu repositorio...
echo.
echo NOTA: Si aparece una ventana emergente de GitHub, por favor
echo autorizala en tu navegador para completar la subida.
echo.
git\cmd\git.exe push -u -f origin main
echo.
echo ============================================================
echo Proceso finalizado.
echo ============================================================
pause
