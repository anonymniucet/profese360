const { chromium } = require('playwright');
const fs = require('fs');

// Obal, který kolem obsahu přidává Artifact při publikaci
const body = fs.readFileSync('../profese360.html', 'utf8');
const page_html = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body{margin:0;font:14px system-ui;background:#fafaf9}img{max-width:100%}[hidden]{display:none!important}</style>
</head><body>${body}</body></html>`;
fs.writeFileSync('preview.html', page_html);

const errs = [];
let fail = 0;
const chk = (ok, msg) => { console.log((ok ? '  ok   ' : '  FAIL ') + msg); if (!ok) fail++; };

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

  for (const vp of [{ name:'desktop', width:1280, height:900 }, { name:'mobil', width:390, height:844 }]) {
    const ctx = await browser.newContext({ viewport: { width:vp.width, height:vp.height } });
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error') errs.push(`[${vp.name}] ${m.text()}`); });
    page.on('pageerror', e => errs.push(`[${vp.name}] pageerror: ${e.message}`));

    const url = 'file://' + process.cwd() +
      '/preview.html?utm_source=google&utm_medium=cpc&utm_campaign=truhlar_brno&gclid=TEST123';
    await page.goto(url);
    await page.waitForTimeout(1400);

    console.log(`\n═══ ${vp.name} (${vp.width}×${vp.height}) ═══`);

    // 1 · homepage
    chk(await page.locator('#scHome').isVisible(), 'homepage se zobrazila');
    chk((await page.locator('#scHome .hero h1').textContent()).includes('utíkají peníze'), 'hero copy ze spec');
    chk(await page.locator('#profGrid button.prof').count() === 2, 'dvě dostupné profese');
    chk(await page.locator('#profGrid .prof.soon').count() === 1, 'karta dalších profesí');
    chk((await page.locator('#scHome .gVal').textContent()) === '72', 'ukázkové měřidlo dopočítalo na 72');

    // horizontální scroll
    const ow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    chk(!ow, 'žádný vodorovný scroll');

    if (vp.name === 'desktop') await page.screenshot({ path:'s1-home.png', fullPage:true });

    // 2 · Spustit diagnostiku → profesní landing
    await page.locator('#profGrid button.prof').first().click();
    await page.waitForTimeout(450);
    chk(await page.locator('#scProf').isVisible(), 'SPUSTIT DIAGNOSTIKU otevřelo profesní landing');
    chk((await page.locator('#scProf h1').textContent()).includes('Vyrábíte kvalitu'), 'TRUHLÁŘ hero copy ze spec');
    chk(await page.locator('#scProf .aitem').count() === 8, 'osm oblastí s max. body');
    chk(await page.locator('#scProf .pscale-row').count() === 5, 'pětistupňová bodová škála');
    if (vp.name === 'desktop') await page.screenshot({ path:'s2-prof.png', fullPage:true });

    // 3 · úvod
    await page.locator('#scProf [data-start]').first().click();
    await page.waitForTimeout(400);
    chk(await page.locator('#scIntro').isVisible(), 'CTA otevřelo úvod Quick Checku');
    chk(await page.locator('#navApp').isVisible(), 'aplikační hlavička s progress barem');

    // 4 · otázky
    await page.locator('#scIntro [data-act="beginQuiz"]').click();
    await page.waitForTimeout(400);
    chk(await page.locator('#scQuiz').isVisible(), 'Quick Check se spustil');
    chk(await page.locator('#scQuiz .opt').count() === 5, 'pět možností u otázky');
    if (vp.name === 'mobil') await page.screenshot({ path:'s3-quiz-mobil.png' });

    let answered = 0;
    for (let i = 0; i < 25; i++) {
      if (!(await page.locator('#scQuiz').isVisible())) break;
      await page.locator('#scQuiz .opt').nth(3).click();  // vždy „Systematicky" = 3 body
      answered++;
      await page.waitForTimeout(620);
      const btn = page.locator('#scQuiz [data-act="nextQ"]');
      if (await btn.count() && (await btn.textContent()).includes('Spočítat')) { await btn.click(); break; }
    }
    chk(answered === 12, `zodpovězeno 12 otázek (bylo ${answered})`);

    // 5 · výpočet → výsledek
    await page.waitForTimeout(2600);
    chk(await page.locator('#scResult').isVisible(), 'výsledková obrazovka');
    const h = await page.locator('#scResult h1').textContent();
    chk(h.includes('75'), `SCORE 75 při odpovědích 3/4 (${h.trim()})`);
    chk((await page.locator('#scResult .gauge-lvl').textContent()).includes('FUNKČNÍ DÍLNA'), 'pásmo FUNKČNÍ DÍLNA');
    chk(await page.locator('#scResult .arow').count() === 8, 'rozpad na osm oblastí');
    chk(await page.locator('#scResult .witem').count() > 0, 'slabá místa / další krok');
    if (vp.name === 'desktop') await page.screenshot({ path:'s4-result.png', fullPage:true });
    if (vp.name === 'mobil') await page.screenshot({ path:'s5-result-mobil.png', fullPage:true });

    // 6 · lead capture — validace
    await page.locator('#scResult [data-act="toLead"]').click();
    await page.waitForTimeout(350);
    chk(await page.locator('#scLead').isVisible(), 'lead capture formulář');
    await page.locator('#leadForm button[type="submit"]').click();
    await page.waitForTimeout(200);
    chk(await page.locator('#errName').isVisible(), 'validace: prázdné jméno');
    chk(await page.locator('#errConsent').isVisible(), 'validace: chybí souhlas');
    await page.fill('#lfName', 'Truhlářství Novák s.r.o.');
    await page.fill('#lfMail', 'nefunkcni-mail');
    await page.locator('#leadForm button[type="submit"]').click();
    await page.waitForTimeout(200);
    chk(await page.locator('#errMail').isVisible(), 'validace: neplatný e-mail');
    await page.fill('#lfMail', 'novak@truhlarstvi.cz');
    await page.fill('#lfTel', '+420 601 234 567');
    await page.check('#lfConsent');
    if (vp.name === 'desktop') await page.screenshot({ path:'s6-lead.png', fullPage:true });
    await page.locator('#leadForm button[type="submit"]').click();
    await page.waitForTimeout(400);

    // 7 · potvrzení
    chk(await page.locator('#scThanks').isVisible(), 'potvrzovací obrazovka');
    chk(await page.locator('#scThanks .pipe-s').count() === 5, 'CRM pipeline o pěti stavech');
    await page.locator('#scThanks [data-act="consult"]').click();
    await page.waitForTimeout(250);
    chk((await page.locator('#scThanks [data-act="consult"]').textContent()).includes('odeslána'), 'žádost o konzultaci');
    if (vp.name === 'desktop') await page.screenshot({ path:'s7-thanks.png', fullPage:true });

    // 8 · attribution + eventy
    const tr = await page.evaluate(() => ({
      attr: JSON.parse(JSON.stringify(window.dataLayer[0].attribution)),
      events: window.dataLayer.map(e => e.event)
    }));
    chk(tr.attr.first_touch.utm_source === 'google', 'utm_source zachyceno');
    chk(tr.attr.first_touch.utm_campaign === 'truhlar_brno', 'utm_campaign zachyceno');
    chk(tr.attr.first_touch.gclid === 'TEST123', 'GCLID zachyceno');
    const want = ['landing_view','quickcheck_start','quickcheck_progress','quickcheck_complete','lead_created','consultation_requested'];
    const miss = want.filter(w => !tr.events.includes(w));
    chk(miss.length === 0, 'všechny eventy ze spec' + (miss.length ? ' — chybí ' + miss : ''));

    // 9 · first-touch se nepřepisuje při návratu z jiného zdroje
    await page.goto('file://' + process.cwd() + '/preview.html?utm_source=facebook&utm_medium=social');
    await page.waitForTimeout(700);
    const ft = await page.evaluate(() => ({
      first: window.dataLayer[0].attribution.first_touch.utm_source,
      last:  window.dataLayer[0].attribution.last_touch.utm_source,
      visits: window.dataLayer[0].attribution.visits
    }));
    chk(ft.first === 'google' && ft.last === 'facebook', `first-touch zůstal google, last-touch facebook (${ft.first}/${ft.last})`);
    chk(ft.visits === 2, 'počet návštěv se inkrementuje');

    // 10 · druhá profese na stejném engine
    await page.locator('.nav-cta').click();
    await page.waitForTimeout(400);
    await page.locator('#profGrid button.prof').nth(1).click();
    await page.waitForTimeout(400);
    chk((await page.locator('#scProf h1').textContent()).includes('Techniky máte'), 'PLYNOSERVIS landing na stejné šabloně');
    await page.locator('#scProf [data-start]').first().click();
    await page.waitForTimeout(350);
    await page.locator('#scIntro [data-act="beginQuiz"]').click();
    await page.waitForTimeout(350);
    let a2 = 0;
    for (let i = 0; i < 20; i++) {
      if (!(await page.locator('#scQuiz').isVisible())) break;
      await page.locator('#scQuiz .opt').nth(4).click();  // „Řídí a měří" = 4 body
      a2++;
      await page.waitForTimeout(620);
      const btn = page.locator('#scQuiz [data-act="nextQ"]');
      if (await btn.count() && (await btn.textContent()).includes('Spočítat')) { await btn.click(); break; }
    }
    chk(a2 === 8, `PLYNOSERVIS má 8 otázek (bylo ${a2})`);
    await page.waitForTimeout(2600);
    chk((await page.locator('#scResult h1').textContent()).includes('100'), 'maximální odpovědi → SCORE 100');
    chk((await page.locator('#scResult .gauge-lvl').textContent()).includes('PROFI SYSTÉM'), 'pásmo PROFI SYSTÉM');

    // 11 · tlačítko zpět
    await page.locator('#appBack').click();
    await page.waitForTimeout(300);
    chk(await page.locator('#scIntro').isVisible(), 'tlačítko zpět z výsledku');

    // 12 · dev panel
    await page.locator('#devBtn').click();
    await page.waitForTimeout(250);
    chk(await page.locator('#devPanel').isVisible(), 'vývojářský panel');
    if (vp.name === 'desktop') await page.screenshot({ path:'s8-dev.png' });

    await ctx.close();
  }

  await browser.close();
  console.log('\nKonzolové chyby: ' + (errs.length ? '\n' + errs.join('\n') : 'žádné'));
  if (errs.length) fail += errs.length;
  console.log(fail ? `\n${fail} CHYB` : '\n✓ CELÝ PRŮCHOD FUNGUJE');
  process.exit(fail ? 1 : 0);
})();
