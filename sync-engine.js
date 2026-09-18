/* Vytáhne konfiguraci profesí + scoring engine z profese360.html do tests/engine.js,
   aby testy měřily přesně ten kód, který běží v aplikaci.
   Spuštění:  node tests/sync-engine.js                                        */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'profese360.html');
const OUT = path.join(__dirname, 'engine.js');

const html = fs.readFileSync(SRC, 'utf8');
const from = html.indexOf('const SCALE5');
const to   = html.indexOf('const ADS =');

if (from < 0 || to < 0 || to <= from) {
  console.error('Nenašel jsem hranice bloku (const SCALE5 … const ADS). Změnila se struktura profese360.html?');
  process.exit(1);
}

const header =
`/* Vygenerováno z profese360.html pomocí tests/sync-engine.js — needitovat ručně.
   Zdroj pravdy je profese360.html. */
`;

fs.writeFileSync(OUT,
  header + html.slice(from, to) +
  '\nmodule.exports = { PROFESSIONS, ENGINE, SCALE5, BANDS_TRUHLAR, BANDS_PLYNO };\n');

console.log('tests/engine.js aktualizován (' + (to - from) + ' znaků)');
