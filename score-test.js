/* Test scoringu — ověřuje, že výpočet SCORE odpovídá závazným tabulkám
   z MASTER SPECIFICATION V2.0 (kap. 5.3).
   Spuštění:  node tests/sync-engine.js && node tests/score-test.js            */

const { PROFESSIONS, ENGINE } = require('./engine.js');

let fail = 0;
const chk = (ok, msg) => { console.log((ok ? '  ok   ' : '  FAIL ') + msg); if (!ok) fail++; };

for (const key of Object.keys(PROFESSIONS)) {
  const p = PROFESSIONS[key];
  console.log('\n=== ' + p.name + ' (' + p.diagVersion + ') ===');

  /* Oblasti a váhy */
  const sum = p.areas.reduce((s, x) => s + x.max, 0);
  chk(sum === 100, 'součet max. bodů oblastí = 100 (je ' + sum + ')');
  chk(p.areas.length === 8, 'osm diagnostických oblastí');

  /* Pokrytí otázkami */
  const used = new Set(p.questions.map(q => q.area));
  const orphan = p.areas.filter(x => !used.has(x.key)).map(x => x.key);
  chk(orphan.length === 0, 'každá oblast má aspoň jednu otázku' + (orphan.length ? ' — chybí ' + orphan : ''));
  const ghost = [...used].filter(k => !p.areas.some(a => a.key === k));
  chk(ghost.length === 0, 'žádná otázka nemíří do neexistující oblasti' + (ghost.length ? ' — ' + ghost : ''));

  /* Krajní a střední hodnoty */
  const at = v => Object.fromEntries(p.questions.map(q => [q.id, v(q)]));
  const rMin = ENGINE.score(p, at(() => 0));
  const rMax = ENGINE.score(p, at(q => Math.max(...q.options.map(o => o.p))));
  const rMid = ENGINE.score(p, at(() => 2));

  chk(rMin.score === 0,   'všechny nejnižší odpovědi → SCORE 0 (je ' + rMin.score + ')');
  chk(rMax.score === 100, 'všechny nejvyšší odpovědi → SCORE 100 (je ' + rMax.score + ')');
  chk(rMid.score === 50,  'polovina bodů → SCORE 50 (je ' + rMid.score + ')');

  /* Pásma */
  chk(rMin.band.n === 'START', 'SCORE 0 → pásmo START');
  chk(rMax.band.n === p.bands[3].n, 'SCORE 100 → pásmo ' + p.bands[3].n);
  let gaps = [];
  for (let i = 1; i < p.bands.length; i++) {
    if (p.bands[i].min !== p.bands[i - 1].max + 1) gaps.push(p.bands[i].n);
  }
  chk(gaps.length === 0, 'pásma navazují bez mezer' + (gaps.length ? ' — ' + gaps : ''));
  let noBand = 0;
  for (let s = 0; s <= 100; s++) if (!p.bands.find(x => s >= x.min && s <= x.max)) noBand++;
  chk(noBand === 0, 'každé SCORE 0–100 spadá do některého pásma');

  /* Dílčí SCORE oblastí */
  const wrong = rMax.areas.filter(x => Math.round(x.pts) !== x.max).map(x => x.key);
  chk(wrong.length === 0, 'na maximu má každá oblast plné body' + (wrong.length ? ' — ' + wrong : ''));
  chk(rMid.areas.reduce((s, x) => s + x.pts, 0).toFixed(1) === '50.0',
      'součet dílčích bodů oblastí = celkové SCORE');

  /* Doporučení */
  const noRec = p.areas.filter(x => !p.recs[x.key]).map(x => x.key);
  chk(noRec.length === 0, 'doporučení pro každou oblast' + (noRec.length ? ' — chybí ' + noRec : ''));
  chk(rMin.recs.length > 0,  'nejhorší výsledek generuje doporučení (' + rMin.recs.length + ')');
  chk(rMax.recs.length === 0, 'nejlepší výsledek negeneruje slabá místa');

  console.log('  otázek: ' + p.questions.length +
              ' · rozložení: ' + p.areas.map(a => a.key + '=' + p.questions.filter(q => q.area === a.key).length).join(' '));
}

console.log('\n' + (fail ? fail + ' CHYB' : 'Vše prošlo.'));
process.exit(fail ? 1 : 0);
