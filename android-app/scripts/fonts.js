// Вгражда шрифтовете в APK (работят и без интернет). При проблем оставя Google Fonts.
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..'), www = path.join(root, 'www'), out = path.join(www, 'fonts');
const R = {
  cyrillic: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
  latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
};
const FONTS = [['unbounded', 'Unbounded', [500, 600, 700, 800]], ['manrope', 'Manrope', [400, 500, 600, 700, 800]]];
try {
  fs.mkdirSync(out, { recursive: true });
  let css = '', n = 0;
  for (const [pkg, fam, ws] of FONTS) for (const sub of ['cyrillic', 'latin']) for (const w of ws) {
    const f = `${pkg}-${sub}-${w}-normal.woff2`, src = path.join(root, 'node_modules', '@fontsource', pkg, 'files', f);
    if (!fs.existsSync(src)) { console.log('липсва ' + f); continue; }
    fs.copyFileSync(src, path.join(out, f)); n++;
    css += `@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url(${f}) format('woff2');unicode-range:${R[sub]}}\n`;
  }
  if (n < 8) throw new Error('твърде малко файлове (' + n + ')');
  fs.writeFileSync(path.join(out, 'fonts.css'), css);
  const ip = path.join(www, 'index.html'); let h = fs.readFileSync(ip, 'utf8');
  h = h.replace(/<link rel="preconnect"[^>]*fonts\.g[^>]*>\s*/g, '').replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link rel="stylesheet" href="fonts/fonts.css">');
  fs.writeFileSync(ip, h);
  console.log('Шрифтове вградени: ' + n + ' файла');
} catch (err) { console.log('Шрифтовете не са вградени, остават от Google: ' + err.message); }
