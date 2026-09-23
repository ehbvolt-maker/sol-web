import os
import subprocess

desktop_paths = set([
    os.path.expanduser('~/Desktop'),
    'C:/Users/elyeh/Desktop',
    'D:/OneDrive/Desktop',
    'C:/Users/Public/Desktop'
])

crm_keywords = ['crm_sol', 'dashboard_crm_sol', 'sistema_crm_sol', 'crm_dashboard', 'crm_panel_completo', 'crm solar - dashboard']

deleted_count = 0
for d in desktop_paths:
    if os.path.exists(d):
        for fname in os.listdir(d):
            fname_lower = fname.lower()
            if any(k in fname_lower for k in crm_keywords) or (fname_lower.startswith('crm') and fname_lower.endswith(('.lnk', '.url', '.bat'))):
                fpath = os.path.join(d, fname)
                try:
                    os.remove(fpath)
                    print(f"Eliminado: {fpath}")
                    deleted_count += 1
                except Exception as e:
                    print(f"Error al eliminar {fpath}: {e}")

# Crear ÚNICO acceso directo oficial .lnk
powershell_cmd = '''
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
        $lnk.TargetPath = 'C:\\Users\\elyeh\\.gemini\\antigravity\\playground\\entropic-equinox\\iniciar_crm.bat'
        $lnk.WorkingDirectory = 'C:\\Users\\elyeh\\.gemini\\antigravity\\playground\\entropic-equinox\\sol'
        $lnk.Description = 'Acceso Unico al Sistema CRM Solar'
        $lnk.IconLocation = 'shell32.dll, 220'
        $lnk.Save()
        Write-Host "Acceso directo unico creado en: $lnkPath"
    }
}
'''

subprocess.run(["powershell", "-Command", powershell_cmd], capture_output=True, text=True)
print("Limpieza completada. Único acceso directo 'CRM Solar.lnk' registrado.")
