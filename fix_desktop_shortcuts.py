import os
import subprocess

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

ps_script = f'''
$WshShell = New-Object -ComObject WScript.Shell
$desktops = @(
    [Environment]::GetFolderPath('Desktop'),
    'C:\\Users\\elyeh\\Desktop',
    'D:\\OneDrive\\Desktop',
    'C:\\Users\\Public\\Desktop'
)

foreach ($d in $desktops) {{
    if (Test-Path $d) {{
        $lnkPath = Join-Path $d 'CRM Solar.lnk'
        $lnk = $WshShell.CreateShortcut($lnkPath)
        $lnk.TargetPath = '{chrome_path}'
        $lnk.Arguments = 'http://localhost:3000/dashboard.html'
        $lnk.WorkingDirectory = 'C:\\Users\\elyeh\\.gemini\\antigravity\\playground\\entropic-equinox\\sol'
        $lnk.Description = 'Abrir CRM Solar en Google Chrome'
        $lnk.IconLocation = '{chrome_path}, 0'
        $lnk.Save()
        Write-Host "Acceso directo LNK creado en: $lnkPath"

        $urlPath = Join-Path $d 'CRM Solar.url'
        $urlContent = "[InternetShortcut]`nURL=http://localhost:3000/dashboard.html`nIconIndex=0`nIconFile=C:\\Windows\\System32\\shell32.dll"
        [System.IO.File]::WriteAllText($urlPath, $urlContent)
        Write-Host "Acceso directo URL creado en: $urlPath"
    }}
}}
'''

res = subprocess.run(["powershell", "-Command", ps_script], capture_output=True, text=True)
print(res.stdout)
print("Configuración de accesos directos completada.")
