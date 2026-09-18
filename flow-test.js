/* ═══════════════════════════════════════════════════════════════
   End-to-end test celého průchodu (MASTER SPECIFICATION V2.0, kap. 4)
   na desktopu i mobilu, pro obě profese.

   Testuje index.html i s rozdělenými css/ a js/ soubory.
   Volitelně sloučený build:  node tests/flow-test.js --dist

   Spuštění:  npm run test:flow
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const { chromium } = require('playwright');
const path = require('path');
const fs   = require('fs');

const ROOT    = path.join(__dirname, '..');
const useDist = process.argv.includes('--dist');
const TARGET  = useDist ? 'dist/profese360.html' : 'index.html';

if (!fs.existsSync(path.join(ROOT, TARGET))) {
  console.error('Nenašel jsem ' + TARGET + (useDist ? ' — spusťte nejdřív: npm run build' : ''));
  process.exit(1);
}

const SHOTS = path.join(ROOT, 'tests', 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const errs = [];
let fail = 0;
const chk  = (ok, msg) => { console.log((ok ? '  ok   ' : '  FAIL ') + msg); if (!ok) fail++; };
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name), fullPage: true });

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobil',   width: 390,  height: 844 }
];

(async () => {
  console.log('Testuji: ' + TARGET + '\n');
  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    const ctx  = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();

    page.on('console', m => {
      if (m.type() !== 'error') return;
      /* Zablokovaný Google Fonts v offline prostředí není chyba aplikace.
         URL je v location(), ne v textu zprávy. */
      const where = (m.location() && m.location().url) || '';
      if (/fonts\.(googleapis|gstatic)/.test(where + m.text())) return;
      errs.push('[' + vp.name + '] ' + m.text() + (where ? '  ← ' + where : ''));
    });
    page.on('pageerror', e => errs.push('[' + vp.name + '] pageerror: ' + e.message));

    const base = 'file://' + path.join(ROOT, TARGET);
    await page.goto(base + '?utm_source=google&utm_medium=cpc&utm_campaign=truhlar_brno&gclid=TEST123');
    await page.waitForTimeout(1400);

    console.log('═══ ' + vp.name + ' (' + vp.width + '×' + vp.height + ') ═══');

    /* ── 1 · Homepage ── */
    chk(await page.locator('#scHome').isVisible(), 'homepage se zobrazila');
    chk((await page.locator('#scHome .hero h1').textContent()).includes('utíkají peníze'), 'hero copy ze spec');
    chk(await page.locator('#profGrid button.prof').count() === 2, 'dvě dostupné profese');
    chk(await page.locator('#profGrid .prof.soon').count() === 1, 'karta dalších profesí');
    chk((await page.locator('#scHome .gVal').textContent()) === '72', 'ukázkové měřidlo dopočítalo na 72');
    chk(!(await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)),
      'žádný vodorovný scroll');
    if (vp.name === 'desktop') await shot(page, '1-homepage.png');

    /* ── 2 · Spustit diagnostiku → profesní landing ── */
    await page.locator('#profGrid button.prof').first().click();
    await page.waitForTimeout(450);
    chk(await page.locator('#scProf').isVisible(), 'SPUSTIT DIAGNOSTIKU otevřelo profesní landing');
    chk((await page.locator('#scProf h1').textContent()).includes('Vyrábíte kvalitu'), 'TRUHLÁŘ hero copy ze spec');
    chk(await page.locator('#scProf .aitem').count() === 8, 'osm oblastí s max. body');
    chk(await page.locator('#scProf .pscale-row').count() === 5, 'pětistupňová škála odpovědí');
    if (vp.name === 'desktop') await shot(page, '2-profese.png');

    /* ── 3 · Úvod Quick Checku ── */
    await page.locator('#scProf [data-start]').first().click();
    await page.waitForTimeout(400);
    chk(await page.locator('#scIntro').isVisible(), 'CTA otevřelo úvod Quick Checku');
    chk(await page.locator('#navApp').isVisible(), 'aplikační hlavička s progress barem');

    /* ── 4 · Otázky ── */
    await page.locator('#scIntro [data-act="beginQuiz"]').click();
    await page.waitForTimeout(400);
    chk(await page.locator('#scQuiz').isVisible(), 'Quick Check se spustil');
    chk(await page.locator('#scQuiz .opt').count() === 5, 'pět možností u otázky');
    chk(await page.locator('#scQuiz .opt-p').count() === 0, 'bodové hodnoty se uživateli nezobrazují');
    if (vp.name === 'mobil') await shot(page, '3-otazka-mobil.png');

    const answerAll = async (optIndex, expected) => {
      let n = 0;
      for (let i = 0; i < expected + 8; i++) {
        if (!(await page.locator('#scQuiz').isVisible())) break;
        await page.locator('#scQuiz .opt').nth(optIndex).click();
        n++;
        await page.waitForTimeout(620);
        const btn = page.locator('#scQuiz [data-act="nextQ"]');
        if (await btn.count() && (await btn.textContent()).includes('Spočítat')) { await btn.click(); break; }
      }
      return n;
    };

    chk(await answerAll(3, 12) === 12, 'zodpovězeno 12 otázek TRUHLÁŘE');

    /* ── 5 · Výpočet → výsledek ── */
    await page.waitForTimeout(2600);
    chk(await page.locator('#scResult').isVisible(), 'výsledková obrazovka');
    chk((await page.locator('#scResult h1').textContent()).includes('75'), 'odpovědi „systematicky" → SCORE 75');
    chk((await page.locator('#scResult .gauge-lvl').textContent()).includes('FUNKČNÍ DÍLNA'), 'pásmo FUNKČNÍ DÍLNA');
    chk(await page.locator('#scResult .arow').count() === 8, 'rozpad na osm oblastí');
    chk(await page.locator('#scResult .witem').count() > 0, 'slabá místa / další krok');
    await shot(page, '4-vysledek-' + vp.name + '.png');

    /* ── 6 · Lead capture a validace ── */
    await page.locator('#scResult [data-act="toLead"]').click();
    await page.waitForTimeout(350);
    chk(await page.locator('#scLead').isVisible(), 'lead capture formulář');

    await page.locator('#leadForm button[type="submit"]').click();
    await page.waitForTimeout(200);
    chk(await page.locator('#errName').isVisible(),    'validace: prázdné jméno');
    chk(await page.locator('#errConsent').isVisible(), 'validace: chybí souhlas');

    await page.fill('#lfName', 'Truhlářství Novák s.r.o.');
    await page.fill('#lfMail', 'nefunkcni-mail');
    await page.locator('#leadForm button[type="submit"]').click();
    await page.waitForTimeout(200);
    chk(await page.locator('#errMail').isVisible(), 'validace: neplatný e-mail');

    await page.fill('#lfMail', 'novak@truhlarstvi.cz');
    await page.fill('#lfTel', '+420 601 234 567');
    await page.check('#lfConsent');
    if (vp.name === 'desktop') await shot(page, '5-kontakt.png');
    await page.locator('#leadForm button[type="submit"]').click();
    await page.waitForTimeout(400);

    /* ── 7 · Potvrzení ── */
    chk(await page.locator('#scThanks').isVisible(), 'potvrzovací obrazovka');
    chk(await page.locator('#scThanks .pipe-s').count() === 5, 'CRM pipeline o pěti stavech');
    await page.locator('#scThanks [data-act="consult"]').click();
    await page.waitForTimeout(250);
    chk((await page.locator('#scThanks [data-act="consult"]').textContent()).includes('odeslána'),
        'žádost o konzultaci');
    if (vp.name === 'desktop') await shot(page, '6-potvrzeni.png');

    /* ── 8 · Attribution a eventy (kap. 9) ── */
    const tr = await page.evaluate(() => ({
      attr:   JSON.parse(JSON.stringify(window.dataLayer[0].attribution)),
      events: window.dataLayer.map(e => e.event)
    }));
    chk(tr.attr.first_touch.utm_source === 'google',         'utm_source zachyceno');
    chk(tr.attr.first_touch.utm_campaign === 'truhlar_brno', 'utm_campaign zachyceno');
    chk(tr.attr.first_touch.gclid === 'TEST123',             'GCLID zachyceno');

    const want = ['landing_view', 'quickcheck_start', 'quickcheck_progress',
                  'quickcheck_complete', 'lead_created', 'consultation_requested'];
    const miss = want.filter(w => !tr.events.includes(w));
    chk(miss.length === 0, 'všechny eventy ze spec' + (miss.length ? ' — chybí ' + miss : ''));

    /* ── 9 · First-touch se při návratu z jiného zdroje nepřepíše ── */
    await page.goto(base + '?utm_source=facebook&utm_medium=social');
    await page.waitForTimeout(700);
    const ft = await page.evaluate(() => ({
      first:  window.dataLayer[0].attribution.first_touch.utm_source,
      last:   window.dataLayer[0].attribution.last_touch.utm_source,
      visits: window.dataLayer[0].attribution.visits
    }));
    chk(ft.first === 'google' && ft.last === 'facebook',
        'first-touch zůstal google, last-touch facebook (' + ft.first + '/' + ft.last + ')');
    chk(ft.visits === 2, 'počet návštěv se inkrementuje');

    /* ── 10 · Druhá profese na stejném engine (kap. 6) ── */
    await page.locator('.nav-cta').click();
    await page.waitForTimeout(400);
    await page.locator('#profGrid button.prof').nth(1).click();
    await page.waitForTimeout(400);
    chk((await page.locator('#scProf h1').textContent()).includes('Techniky máte'),
        'PLYNOSERVIS landing na stejné šabloně');
    await page.locator('#scProf [data-start]').first().click();
    await page.waitForTimeout(350);
    await page.locator('#scIntro [data-act="beginQuiz"]').click();
    await page.waitForTimeout(350);
    chk(await answerAll(4, 8) === 8, 'PLYNOSERVIS má 8 otázek');
    await page.waitForTimeout(2600);
    chk((await page.locator('#scResult h1').textContent()).includes('100'), 'maximální odpovědi → SCORE 100');
    chk((await page.locator('#scResult .gauge-lvl').textContent()).includes('PROFI SYSTÉM'), 'pásmo PROFI SYSTÉM');

    /* ── 11 · Navigace zpět ── */
    await page.locator('#appBack').click();
    await page.waitForTimeout(300);
    chk(await page.locator('#scIntro').isVisible(), 'tlačítko zpět z výsledku');

    /* ── 12 · Vývojářský panel ── */
    await page.locator('#devBtn').click();
    await page.waitForTimeout(250);
    chk(await page.locator('#devPanel').isVisible(), 'vývojářský panel');

    console.log('');
    await ctx.close();
  }

  await browser.close();

  if (errs.length) { console.log('Konzolové chyby:\n' + errs.join('\n') + '\n'); fail += errs.length; }
  console.log(fail ? fail + ' CHYB' : 'Celý průchod funguje. Screenshoty: tests/screenshots/');
  process.exit(fail ? 1 : 0);
})();
