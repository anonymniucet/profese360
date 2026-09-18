/* ═══════════════════════════════════════════════════════════════
   PROFESE360 · build.js
   Slepí rozdělené zdroje zpět do jednoho souboru.

   node build/build.js              → dist/profese360.html
        samostatný HTML soubor bez závislostí — pro předání klientovi
        a offline demo, otevře se dvojklikem

   node build/build.js --artifact   → dist/artifact.html
        fragment bez <!doctype>/<html>/<head>/<body> pro publikaci
        jako Artifact na claude.ai (obal dodává platforma)

   Zdroj pravdy jsou vždy index.html + css/ + js/, nikdy dist/.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const artifactMode = process.argv.includes('--artifact');

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* Pořadí souborů se čte z index.html, ať se build nemůže rozejít se zdrojem */
const cssFiles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+\.css)">/g)].map(m => m[1]);
const jsFiles  = [...html.matchAll(/<script src="([^"]+\.js)"><\/script>/g)].map(m => m[1]);

if (!cssFiles.length || !jsFiles.length) {
  console.error('V index.html jsem nenašel odkazy na css/js. Změnila se struktura?');
  process.exit(1);
}

const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8').trim();
const css  = cssFiles.map(f => '/* ═══ ' + f + ' ═══ */\n' + read(f)).join('\n\n');
const js   = jsFiles.map(f => '/* ═══ ' + f + ' ═══ */\n' +
                               read(f).replace(/^'use strict';\n/, '')).join('\n\n');

/* Markup mezi </head> a <script src=…> */
const markup = html
  .slice(html.indexOf('<body>') + '<body>'.length, html.indexOf('<script src='))
  .replace(/<script>document\.documentElement[^<]*<\/script>\s*/, '')
  .trim();

const fontLinks = [...html.matchAll(/<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>/g)]
  .map(m => m[0]).join('\n');

const head =
  '<title>PROFESE360</title>\n' +
  fontLinks + '\n\n' +
  '<style>\n' + css + '\n</style>\n' +
  "<script>document.documentElement.classList.add('js');</script>";

const body = markup + '\n\n<script>\n\'use strict\';\n' + js + '\n</script>';

fs.mkdirSync(DIST, { recursive: true });

let out, file;
if (artifactMode) {
  file = 'artifact.html';
  out  = head + '\n\n' + body + '\n';
} else {
  file = 'profese360.html';
  const meta = [...html.matchAll(/<meta[^>]*>/g)].map(m => m[0]).join('\n  ');
  out = '<!doctype html>\n<html lang="cs">\n<head>\n  ' + meta + '\n' +
        head.split('\n').map(l => l ? '  ' + l : l).join('\n') +
        '\n</head>\n<body>\n' + body + '\n</body>\n</html>\n';
}

fs.writeFileSync(path.join(DIST, file), out);
console.log('dist/' + file + '  ' + (Buffer.byteLength(out) / 1024).toFixed(1) + ' kB' +
            '  (' + cssFiles.length + ' css + ' + jsFiles.length + ' js)');
