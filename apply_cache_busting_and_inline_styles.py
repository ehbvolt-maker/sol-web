import os

inline_banner_html = '''            <!-- Zero Down Savings Section -->
            <div class="zero-down-banner" id="zeroDownBanner" style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%); border: 2px solid #f59e0b; border-radius: 16px; padding: 20px 24px; max-width: 900px; margin: 20px auto; text-align: center; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.35); display: block; position: relative; z-index: 10;">
                <div class="zero-down-badge" id="zeroDownBadge" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; font-weight: 800; font-size: 1rem; padding: 8px 22px; border-radius: 30px; letter-spacing: 0.5px; margin-bottom: 12px; box-shadow: 0 4px 18px rgba(245, 158, 11, 0.5); text-transform: uppercase;">
                    ⚡ Empieza a Ahorrar — $0 Inicial (Cero Inicial)
                </div>
                <p class="zero-down-text" id="zeroDownText" style="color: #ffffff; font-size: 1rem; line-height: 1.6; margin: 0; font-weight: 500;">
                    Este comercial abarca las garantías reales de los programas federales de energía renovable. Opción de renta, compra financiada o en efectivo, con precios de costos respaldados y grabados por el programa ENERGÍA NETA, impidiendo sean modificados por vendedores. <button class="btn-check-qualify" onclick="openCalcModal()" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; border: none; padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 0.8rem; margin-left: 8px; cursor: pointer;">🏡 Mira si tu propiedad califica</button>
                </p>
            </div>'''

html_files = [
    'comercial.html', 'sol/comercial.html',
    'puronics_comercial.html', 'sol/puronics_comercial.html',
    'index.html', 'sol/index.html',
    'puronics.html', 'sol/puronics.html',
    'agua_es_vida.html', 'sol/agua_es_vida.html'
]

for filepath in html_files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            c = f.read()

        # Update puronics_styles.css and puronics_app.js to use ?v=20260728_v2
        c = c.replace('href="puronics_styles.css"', 'href="puronics_styles.css?v=20260728_v2"')
        c = c.replace('href="puronics_styles.css?v=20260728_v1"', 'href="puronics_styles.css?v=20260728_v2"')
        c = c.replace('src="puronics_app.js"', 'src="puronics_app.js?v=20260728_v2"')
        c = c.replace('src="puronics_app.js?v=20260728_v1"', 'src="puronics_app.js?v=20260728_v2"')

        # Replace zero-down-banner block with fully inline styled block
        if '<div class="zero-down-banner"' in c:
            idx = c.find('<!-- Zero Down Savings Section -->')
            if idx != -1:
                end_idx = c.find('</div>', c.find('id="zeroDownText"', idx))
                if end_idx != -1:
                    end_pos = end_idx + len('</div>') + 10
                    # Find closing div of zero-down-banner
                    banner_end = c.find('</div>', end_idx + 6)
                    if banner_end != -1:
                        c = c[:idx] + inline_banner_html + c[banner_end + 6:]

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f'Updated cache busting & inline styles in {filepath}')

# Update sol/server.js to disable static file caching so Render serves fresh content
server_path = 'sol/server.js'
if os.path.exists(server_path):
    with open(server_path, 'r', encoding='utf-8') as f:
        sc = f.read()
    
    old_static = 'app.use(express.static(path.join(__dirname)));'
    new_static = '''app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));'''
    if old_static in sc:
        sc = sc.replace(old_static, new_static)
        with open(server_path, 'w', encoding='utf-8') as f:
            f.write(sc)
        print('Updated sol/server.js with Cache-Control headers')

print('Completed cache busting script!')
