'use strict';
/* ═══════════════════════════════════════════════════════════════
   PROFESE360 · screens.js
   Vykreslení jednotlivých obrazovek průchodu (kap. 4)
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   1 · HOMEPAGE — karty profesí
   ═══════════════════════════════════════════════════════════════ */
function renderProfGrid(){
  const cards = Object.keys(PROFESSIONS).map((k, i) => {
    const p = PROFESSIONS[k];
    return '<button class="prof rv rv-' + (i + 1) + '" data-prof="' + p.id + '">' +
      '<div class="prof-top">' +
        '<svg class="prof-ico" viewBox="0 0 26 26" fill="none" aria-hidden="true">' + p.icon + '</svg>' +
        '<span class="prof-tag on">Dostupné</span>' +
      '</div>' +
      '<h3>' + esc(p.name) + '</h3>' +
      '<p class="prof-sub">' + esc(p.short) + '</p>' +
      '<div class="prof-areas">' +
        p.areas.map(a => '<span class="chip">' + esc(a.key + ' ' + a.name) + '</span>').join('') +
      '</div>' +
      '<span class="prof-go">Spustit diagnostiku' +
        '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</span></button>';
  }).join('');

  const soon = '<div class="prof soon rv rv-3">' +
    '<div class="prof-top">' +
      '<svg class="prof-ico" viewBox="0 0 26 26" fill="none" aria-hidden="true" style="color:#66716C">' + ICON_MORE + '</svg>' +
      '<span class="prof-tag off">V přípravě</span>' +
    '</div>' +
    '<h3 style="color:var(--muted)">Další profese</h3>' +
    '<p class="prof-sub">Platforma je modulární — nová profese vzniká konfigurací, ne novou aplikací.</p>' +
    '<div class="prof-areas">' + PLANNED.map(n => '<span class="chip dim">' + esc(n) + '</span>').join('') + '</div>' +
  '</div>';

  $('profGrid').innerHTML = cards + soon;
}

/* ═══════════════════════════════════════════════════════════════
   2 · PROFESNÍ LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
function renderProf(id){
  const p = PROFESSIONS[id];
  if (!p) return;
  S.prof = id;

  const areaRows = p.areas.map(a =>
    '<div class="aitem"><span class="aitem-k">' + esc(a.key) + '</span>' +
    '<span class="aitem-n">' + esc(a.name) + '</span>' +
    '<span class="aitem-w">max ' + a.max + ' b.</span></div>').join('');

  const scaleRows = SCALE5.map((s, i) =>
    '<div class="pscale-row"><span class="pscale-p" aria-hidden="true"><span class="stepg">' +
      [0,1,2,3,4].map(k => '<i class="' + (k <= i ? 'on' : '') + '"></i>').join('') +
    '</span></span><div>' +
    '<div class="pscale-n">' + esc(s.n) + '</div>' +
    '<div class="pscale-d">' + esc(s.d) + '</div></div></div>').join('');

  $('scProf').innerHTML =
    '<section class="phero"><div class="phero-in">' +
      '<p class="eyebrow on-dark">' + esc(p.hero.eyebrow) + '</p>' +
      '<h1>' + p.hero.h1 + '</h1>' +
      '<p class="phero-sub">' + esc(p.hero.sub) + '</p>' +
      '<div class="phero-btns">' +
        '<button class="btn btn-p" data-start="' + p.id + '">' + esc(p.hero.cta) +
          '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
        '<button class="btn btn-s" data-home="profese">Jiná profese</button>' +
      '</div>' +
      '<div class="hero-meta">' +
        '<div><div class="hm-n">' + p.questions.length + '</div><div class="hm-l">otázek</div></div>' +
        '<div><div class="hm-n">' + p.areas.length + '</div><div class="hm-l">oblastí</div></div>' +
        '<div><div class="hm-n">3–5</div><div class="hm-l">minut</div></div>' +
      '</div>' +
    '</div><div class="ruler on-dark" aria-hidden="true"></div></section>' +

    '<section class="pbody"><div class="wrap pgrid">' +
      '<div><p class="eyebrow">Co diagnostika měří</p>' +
        '<h2 class="h2" style="margin:14px 0 14px">Osm oblastí, každá s vlastní váhou.</h2>' +
        '<p class="lede" style="margin-bottom:22px">Součet vážených oblastí dává SCORE 0–100. Oblast s nejnižším výsledkem určuje, co má smysl řešit jako první.</p>' +
        '<div class="acard"><div class="acard-h"><span class="acard-t">Oblasti a max. body</span>' +
          '<span class="aitem-w">celkem 100 b.</span></div>' +
          '<div class="acard-b">' + areaRows + '</div></div>' +
      '</div>' +
      '<div><p class="eyebrow">Jak se odpovídá</p>' +
        '<h2 class="h2" style="margin:14px 0 14px">Pět úrovní, žádné hádání.</h2>' +
        '<p class="lede" style="margin-bottom:22px">U každé otázky vyberete úroveň, která nejlépe popisuje váš současný stav.</p>' +
        '<div class="acard"><div class="acard-h"><span class="acard-t">Úrovně odpovědí</span></div>' +
          '<div class="acard-b pscale">' + scaleRows + '</div></div>' +
        '<div style="margin-top:22px"><button class="btn btn-p btn-wide" data-start="' + p.id + '">' +
          'Spustit Quick Check' +
          '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button></div>' +
      '</div>' +
    '</div></section>' +

    '<footer class="foot"><div class="wrap foot-in">' +
      '<div class="foot-l"><span class="foot-brand">PROFESE<b>360</b></span>' +
      '<span class="foot-cl">© 2026 The Specialist s.r.o. · ' + esc(p.name) + ' ' + esc(p.diagVersion) + '</span></div>' +
      '<nav class="foot-links"><button class="foot-a" data-home="top">Zpět na PROFESE360</button></nav>' +
    '</div></footer>';
}

/* ═══════════════════════════════════════════════════════════════
   3 · ÚVOD QUICK CHECKU (spec kap. 4 — délka, účel, co dostanete)
   ═══════════════════════════════════════════════════════════════ */
function renderIntro(){
  const p = PROFESSIONS[S.prof];
  const n = ENGINE.visible(p, S.answers).length;
  const row = (t, d) =>
    '<div class="irow"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true">' +
    '<circle cx="10" cy="10" r="8.5" stroke="currentColor" stroke-width="1.6"/>' +
    '<path d="M6.2 10.2l2.5 2.5 5-5.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg><div><div class="irow-t">' + esc(t) + '</div><div class="irow-d">' + esc(d) + '</div></div></div>';

  $('scIntro').innerHTML = '<div class="intro">' +
    '<p class="eyebrow">' + esc(p.name) + ' · ' + esc(p.diagVersion) + '</p>' +
    '<h1>Než začneme — co vás čeká</h1>' +
    '<p class="lede">' + n + ' otázek, 3–5 minut. Odpovídáte podle toho, jak to ve firmě funguje dnes, ne jak by to mělo být.</p>' +
    '<div class="ilist">' +
      row('Délka 3–5 minut', n + ' otázek, jedna otázka na obrazovku, kdykoli se můžete vrátit zpět.') +
      row('SCORE 0–100 hned po dokončení', 'Včetně rozpadu na ' + p.areas.length + ' oblastí a výsledkové úrovně.') +
      row('Pojmenovaná slabá místa', 'Oblasti s nejnižším výsledkem a doporučený další krok.') +
      row('Kontakt až na konci', 'Výsledek uvidíte ještě předtím, než zadáte e-mail.') +
    '</div>' +
    '<button class="btn btn-p btn-wide" data-act="beginQuiz">Spustit Quick Check' +
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    '</button>' +
    '<p class="disclaim">SCORE není známka člověka ani kvality řemeslné práce. Měří míru řízení podnikání podle vašich odpovědí. Výsledek zůstává svázaný s verzí diagnostiky ' + esc(p.diagVersion) + '.</p>' +
  '</div>';
}

/* ═══════════════════════════════════════════════════════════════
   4 · OTÁZKY — jedna na obrazovku, progress, velké tap targets
   ═══════════════════════════════════════════════════════════════ */
function renderQuiz(){
  const p  = PROFESSIONS[S.prof];
  const qs = ENGINE.visible(p, S.answers);
  if (S.qi >= qs.length){ finishQuiz(); return; }

  const q    = qs[S.qi];
  const area = p.areas.find(a => a.key === q.area);
  const cur  = S.answers[q.id];

  const opts = q.options.map(o =>
    '<button class="opt' + (cur === o.p ? ' sel' : '') + '" data-q="' + q.id + '" data-p="' + o.p + '"' +
      ' role="radio" aria-checked="' + (cur === o.p ? 'true' : 'false') + '">' +
      '<span class="opt-r" aria-hidden="true"></span>' +
      '<span><span class="opt-n">' + esc(o.n) + '</span>' +
      (o.d ? '<span class="opt-d">' + esc(o.d) + '</span>' : '') + '</span>' +
    '</button>').join('');

  $('scQuiz').innerHTML = '<div class="appw">' +
    '<div class="qmeta">' +
      '<span class="qbadge">' + esc(q.area + ' · ' + (area ? area.name : '')) + '</span>' +
      '<span class="qcount">' + (S.qi + 1) + ' / ' + qs.length + '</span>' +
    '</div>' +
    '<h1 class="qtext">' + esc(q.text) + '</h1>' +
    (q.hint ? '<p class="qhint">' + esc(q.hint) + '</p>' : '') +
    '<div class="opts" role="radiogroup" aria-label="' + esc(q.text) + '">' + opts + '</div>' +
    '<div class="qnav">' +
      (S.qi > 0 ? '<button class="btn btn-s light" data-act="prevQ">Zpět</button>' : '') +
      (cur !== undefined ? '<button class="btn btn-p" data-act="nextQ">' +
        (S.qi === qs.length - 1 ? 'Spočítat SCORE' : 'Další otázka') +
        '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' : '') +
    '</div>' +
  '</div>';

  syncAppNav();
  const el = $('scQuiz');
  if (!REDUCE){ el.classList.remove('fade'); void el.offsetWidth; el.classList.add('fade'); }
}

function answer(qid, p){
  const prev = S.answers[qid];
  S.answers[qid] = p;
  const qs = ENGINE.visible(PROFESSIONS[S.prof], S.answers);
  if (prev === undefined){
    TRACK.push('quickcheck_progress', {
      profession:S.prof, question:qid, index:S.qi + 1, total:qs.length
    });
  }
  renderQuiz();
  /* Automatický posun po krátké pauze — dost rychle, aby průchod nezdržoval */
  if (S.qi < qs.length - 1){
    clearTimeout(S._t);
    S._t = setTimeout(() => { if (S.screen === 'quiz'){ S.qi++; renderQuiz(); } }, REDUCE ? 0 : 420);
  }
}

function finishQuiz(){
  clearTimeout(S._t);
  const p = PROFESSIONS[S.prof];
  S.result = ENGINE.score(p, S.answers);
  TRACK.push('quickcheck_complete', {
    profession:S.prof, score:S.result.score, band:S.result.band.n,
    diag_version:p.diagVersion, scoring_version:p.scoringVersion
  });
  go('calc');
  setTimeout(() => { renderResult(); go('result'); }, REDUCE ? 60 : 1250);
}

/* ═══════════════════════════════════════════════════════════════
   6 · VÝSLEDEK
   ═══════════════════════════════════════════════════════════════ */
function renderResult(){
  const p = PROFESSIONS[S.prof];
  const r = S.result;

  const bandStrip = p.bands.map(b => {
    const w = b.max - b.min + 1;
    return '<div class="band-seg' + (b === r.band ? ' cur' : '') +
           '" style="flex:' + w + ';background:' + b.c + '"></div>';
  }).join('');

  const areaRows = r.areas.map(a =>
    '<div class="arow"><span class="arow-k">' + esc(a.key) + '</span>' +
    '<div><div class="arow-n">' + esc(a.name) + '</div>' +
    '<div class="arow-bar"><div class="arow-fill" data-w="' + a.pct +
      '" style="background:' + (a.pct < 50 ? '#8A6F38' : a.pct < 70 ? '#C79A45' : '#EBCE8A') + '"></div></div></div>' +
    '<span class="arow-v">' + a.pts.toFixed(1).replace('.0','') + '<span> / ' + a.max + ' b.</span></span></div>').join('');

  const weakBlock = r.recs.length
    ? r.recs.map(x =>
        '<div class="witem"><span class="wdot">' + esc(x.key) + '</span><div>' +
        '<div class="wname">' + esc(x.name) + '</div>' +
        '<div class="wtext">' + esc(x.text) + '</div></div></div>').join('')
    : '<div class="witem pos"><span class="wdot">✓</span><div><div class="wname">Žádná výrazně slabá oblast</div>' +
      '<div class="wtext">Všechny oblasti jsou nad 70 %. Další krok je udržet měření a porovnat SCORE za tři měsíce.</div></div></div>';

  const strongBlock = r.strong.length
    ? '<div class="panel"><div class="panel-h">Na čem můžete stavět</div><div class="wlist">' +
      r.strong.map(a =>
        '<div class="witem pos"><span class="wdot">' + esc(a.key) + '</span><div>' +
        '<div class="wname">' + esc(a.name) + '</div>' +
        '<div class="wtext">' + a.pct + ' % — patří k vašim nejsilnějším oblastem.</div></div></div>').join('') +
      '</div></div>'
    : '';

  $('scResult').innerHTML = '<div class="appw wide">' +
    '<div class="res-head">' +
      '<p class="eyebrow">' + esc(p.name) + ' · ' + esc(p.diagVersion) + '</p>' +
      '<h1 class="h2">Vaše SCORE je ' + r.score + ' ze 100.</h1>' +
      '<p class="lede">Výsledková úroveň <strong style="color:var(--ink)">' + esc(r.band.n) +
        '</strong>. Níže je rozpad na ' + r.areas.length + ' oblastí a doporučený další krok.</p>' +
    '</div>' +

    /* Řada 1 — měřidlo vedle toho, co s výsledkem dělat */
    '<div class="res-top">' +
      '<div class="report flat">' +
        '<div class="gauge big">' +
          '<svg viewBox="0 0 280 172" aria-hidden="true">' +
            '<g class="gTicks"></g>' +
            '<path d="M30 140 A110 110 0 0 1 250 140" fill="none" stroke="rgba(28,36,33,.10)" stroke-width="13" stroke-linecap="round"/>' +
            '<path class="gArc" d="M30 140 A110 110 0 0 1 250 140" fill="none" stroke="' + r.band.c + '" stroke-width="13" stroke-linecap="round" stroke-dasharray="345.6" stroke-dashoffset="345.6"/>' +
          '</svg>' +
          '<div class="gauge-read"><div class="gauge-val"><span class="gVal">0</span><sub>/100</sub></div>' +
          '<div class="gauge-lvl">' + esc(r.band.n) + '</div></div>' +
        '</div>' +
        '<div class="gauge-ends"><span>0</span><span>100</span></div>' +
        '<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--bd-hair)">' +
          '<div class="panel-h" style="margin-bottom:10px">Výsledkové úrovně</div>' +
          '<div class="band-strip">' + bandStrip + '</div>' +
          '<div class="band-lbl"><span>0</span><span>100</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="res-side">' +
        '<div class="panel"><div class="panel-h">' +
          (r.recs.length ? 'Slabá místa a další krok' : 'Další krok') +
        '</div><div class="wlist">' + weakBlock + '</div></div>' +
        strongBlock +
      '</div>' +
    '</div>' +

    /* Řada 2 — rozpad přes celou šířku, ať se názvy oblastí nelámou */
    '<div class="panel res-areas"><div class="panel-h">Rozpad podle oblastí</div>' +
      '<div class="arow-grid">' + areaRows + '</div></div>' +

    '<div class="res-cta">' +
      '<button class="btn btn-p btn-wide" data-act="toLead">Poslat výsledek na e-mail' +
        '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
    '</div>' +
    '<p class="disclaim">SCORE ' + r.score + '/100 · ' + esc(r.band.n) + ' · diagnostika ' +
      esc(r.diagVersion) + ', scoring ' + esc(r.scoringVersion) + ', engine ' + esc(r.engineVersion) +
      '. Výsledek zůstává svázaný s touto verzí — pozdější změna metodiky ho zpětně nemění.</p>' +
  '</div>';

  const root = $('scResult');
  animGauge(root, r.score, r.band.c);
  fillBars(root, '.arow-fill');
}

/* ═══════════════════════════════════════════════════════════════
   7 · LEAD CAPTURE
   ═══════════════════════════════════════════════════════════════ */
function renderLead(){
  const p = PROFESSIONS[S.prof];
  const r = S.result;

  $('scLead').innerHTML = '<div class="intro">' +
    '<p class="eyebrow">Zaslání výsledku</p>' +
    '<h1>Kam máme poslat váš výsledek?</h1>' +
    '<p class="lede">SCORE ' + r.score + '/100 (' + esc(r.band.n) + ') vám pošleme i s rozpadem oblastí a doporučeními.</p>' +
    '<form class="form" id="leadForm" novalidate style="margin-top:28px">' +
      '<div class="field"><label for="lfName">Jméno a firma <b>*</b></label>' +
        '<input id="lfName" name="name" type="text" autocomplete="name" required>' +
        '<span class="ferr" id="errName" hidden>Zadejte prosím jméno.</span></div>' +
      '<div class="field"><label for="lfMail">E-mail <b>*</b></label>' +
        '<input id="lfMail" name="email" type="email" autocomplete="email" inputmode="email" required>' +
        '<span class="ferr" id="errMail" hidden>Zadejte prosím platný e-mail.</span></div>' +
      '<div class="field"><label for="lfTel">Telefon</label>' +
        '<input id="lfTel" name="phone" type="tel" autocomplete="tel" inputmode="tel">' +
        '<span class="fnote">Nepovinné. Pomůže, pokud chcete výsledek probrat.</span></div>' +
      '<label class="consent"><input type="checkbox" id="lfConsent" required>' +
        '<span>Souhlasím se zpracováním uvedených údajů pro zaslání výsledku diagnostiky a navazující komunikaci. Souhlas verze ' + CONSENT_VERSION + '.</span></label>' +
      '<span class="ferr" id="errConsent" hidden>Bez souhlasu nemůžeme výsledek odeslat.</span>' +
      '<button class="btn btn-p btn-wide" type="submit">Poslat výsledek' +
        '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<p class="fnote">Spolu s kontaktem se ukládají vaše odpovědi, SCORE, profese, verze diagnostiky a marketingový zdroj návštěvy. Neukládáme údaje, které pro diagnostiku nejsou potřebné.</p>' +
    '</form>' +
  '</div>';

  $('leadForm').addEventListener('submit', submitLead);
}

function submitLead(e){
  e.preventDefault();
  const name = $('lfName'), mail = $('lfMail'), tel = $('lfTel'), con = $('lfConsent');
  let ok = true;

  const bad = (input, err, isBad) => {
    $(err).hidden = !isBad;
    if (input) input.setAttribute('aria-invalid', isBad ? 'true' : 'false');
    if (isBad) ok = false;
  };
  bad(name, 'errName', !name.value.trim());
  bad(mail, 'errMail', !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim()));
  bad(null, 'errConsent', !con.checked);

  if (!ok){
    const first = document.querySelector('#leadForm [aria-invalid="true"]') ||
                  (!con.checked ? con : null);
    if (first) first.focus();
    return;
  }

  S.contact = {
    name: name.value.trim(),
    email: mail.value.trim(),
    phone: tel.value.trim() || null
  };

  /* V produkci: POST na API → uložení leadu, odpovědí, SCORE, verze a attribution (kap. 7 + 9.1) */
  const payload = TRACK.leadPayload(S.contact, S.result);
  TRACK.push('lead_created', {
    profession:S.prof, score:S.result.score, band:S.result.band.n,
    has_phone: !!S.contact.phone, consent_version:CONSENT_VERSION
  });
  S.leadPayload = payload;

  renderThanks();
  go('thanks');
}

/* ═══════════════════════════════════════════════════════════════
   8 · POTVRZENÍ + CRM pipeline
   ═══════════════════════════════════════════════════════════════ */
const PIPELINE = ['QUICK CHECK','KONTAKTOVÁN','DIAGNOSTIKA','NABÍDKA','REALIZACE'];

function renderThanks(){
  const r = S.result;
  const steps = PIPELINE.map((n, i) =>
    '<div class="pipe-s' + (i === 0 ? ' done' : '') + '">' +
    '<span class="pipe-d">' + (i === 0 ? '✓' : (i + 1)) + '</span>' +
    '<span class="pipe-n">' + esc(n) + '</span></div>').join('');

  $('scThanks').innerHTML = '<div class="thanks">' +
    '<div class="tick"><svg viewBox="0 0 28 28" fill="none" aria-hidden="true">' +
      '<path d="M6 14.5l5 5L22 8.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
    '<h1>Výsledek je na cestě.</h1>' +
    '<p class="lede" style="margin-inline:auto">Poslali jsme SCORE ' + r.score + '/100 (' + esc(r.band.n) +
      ') na ' + esc(S.contact.email) + ' spolu s rozpadem oblastí a doporučeními.</p>' +
    '<div class="pipe">' + steps + '</div>' +
    '<button class="btn btn-p btn-wide" data-act="consult">Chci probrat výsledek s konzultantem</button>' +
    '<div style="margin-top:10px"><button class="btn btn-s light btn-wide" data-home="top">Zpět na PROFESE360</button></div>' +
    '<p class="disclaim" id="thanksNote">Váš lead je veden ve stavu QUICK CHECK. Další stavy pipeline posouvá obchodník v administraci.</p>' +
  '</div>';
}
