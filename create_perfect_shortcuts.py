import os
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')

desktop_paths = set([
    os.path.expanduser('~/Desktop'),
    'C:/Users/elyeh/Desktop',
    'D:/OneDrive/Desktop',
    'C:/Users/Public/Desktop'
])

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
target_url = "http://localhost:3000/dashboard.html"

url_content = f"[InternetShortcut]\r\nURL={target_url}\r\nIconFile={chrome_path}\r\nIconIndex=0\r\n"
bat_content = f"@echo off\r\nchcp 65001 >nul\r\ntitle CRM Solar\r\nstart \"\" \"{target_url}\"\r\n"

for d in desktop_paths:
    if os.path.exists(d):
        for fname in os.listdir(d):
            if 'crm' in fname.lower():
                try:
                    os.remove(os.path.join(d, fname))
                    print(f"Eliminado archivo antiguo/dañado: {os.path.join(d, fname)}")
                except Exception as e:
                    print(f"No se pudo eliminar {fname}: {e}")

        url_file = os.path.join(d, "CRM Solar.url")
        with open(url_file, "wb") as f:
            f.write(url_content.encode('utf-8'))
        print(f"[OK] Creado acceso directo impecable URL: {url_file}")

        bat_file = os.path.join(d, "CRM Solar.bat")
        with open(bat_file, "wb") as f:
            f.write(bat_content.encode('utf-8'))
        print(f"[OK] Creado acceso directo impecable BAT: {bat_file}")

ps_script = '''
$WshShell = New-Object -ComObject WScript.Shell
$desktops = @(
    [Environment]::GetFolderPath('Desktop'),
    'C:\\Users\\elyeh\\Desktop',
    'D:\\OneDrive\\Desktop'
)

foreach ($d in $desktops) {
    if (Test-Path $d) {
        $lnkPath = Join-Path $d 'CRM Solar.lnk'
        $lnk = $WshShell.CreateShortcut($lnkPath)
        $lnk.TargetPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        $lnk.Arguments = 'http://localhost:3000/dashboard.html'
        $lnk.WorkingDirectory = 'C:\\Users\\elyeh\\.gemini\\antigravity\\playground\\entropic-equinox\\sol'
        $lnk.Description = 'CRM Solar Dashboard'
        $lnk.IconLocation = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe,0'
        $lnk.Save()
        Write-Host "[OK] LNK registrado: $lnkPath"
    }
}
'''

res = subprocess.run(["powershell", "-Command", ps_script], capture_output=True, text=True)
print(res.stdout)
print("=== Proceso de regeneración de accesos directos completado ===")
