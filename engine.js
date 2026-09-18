/* Vygenerováno z profese360.html pomocí tests/sync-engine.js — needitovat ručně.
   Zdroj pravdy je profese360.html. */
const SCALE5 = [
  { p:0, n:'Nemá / neví',   d:'Neexistuje, vůbec neřeší nebo neví.' },
  { p:1, n:'Nahodile',      d:'Řeší intuitivně / občas, bez pravidla.' },
  { p:2, n:'Částečně',      d:'Něco eviduje nebo používá, ale neúplně / nepravidelně.' },
  { p:3, n:'Systematicky',  d:'Má jasný postup a používá ho pravidelně.' },
  { p:4, n:'Řídí a měří',   d:'Systematicky + má data, kontrolu a podle výsledků něco mění.' }
];

/* ── Výsledkové úrovně (spec kap. 5.3, závazná tabulka) ── */
const BANDS_TRUHLAR = [
  { min:0,  max:39,  n:'START',          c:'#55605B' },
  { min:40, max:59,  n:'STABILIZACE',    c:'#8A6F38' },
  { min:60, max:79,  n:'FUNKČNÍ DÍLNA',  c:'#C79A45' },
  { min:80, max:100, n:'PROFI SYSTÉM',   c:'#EBCE8A' }
];
/* PLYNOSERVIS: struktura pásem stejná, názvy 3. pásma upravené pro servis.
   POZOR — finální názvy dodá objednatel (kap. 6, „NEVYMÝŠLET OBSAH"). */
const BANDS_PLYNO = [
  { min:0,  max:39,  n:'START',          c:'#55605B' },
  { min:40, max:59,  n:'STABILIZACE',    c:'#8A6F38' },
  { min:60, max:79,  n:'FUNKČNÍ SERVIS', c:'#C79A45' },
  { min:80, max:100, n:'PROFI SYSTÉM',   c:'#EBCE8A' }
];

const ICON_TRUHLAR = '<path d="M3 19.5L19.5 3l3.5 3.5L6.5 23H3v-3.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M16.5 6L20 9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M3 13h6M3 9h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>';
const ICON_PLYNO  = '<circle cx="13" cy="13" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M13 3v3M13 20v3M3 13h3M20 13h3M6 6l2.1 2.1M17.9 17.9L20 20M20 6l-2.1 2.1M8.1 17.9L6 20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>';
const ICON_MORE   = '<rect x="3" y="3" width="8.5" height="8.5" rx="2" stroke="currentColor" stroke-width="1.6"/><rect x="14.5" y="3" width="8.5" height="8.5" rx="2" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="14.5" width="8.5" height="8.5" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M18.75 15.5v6.5M15.5 18.75h6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>';

/* ── Pomocník: otázka na standardní škále ── */
const q5 = (id, area, text, hint) => ({ id, area, text, hint, type:'scale5', options:SCALE5 });

const PROFESSIONS = {
  /* ═════════ TRUHLÁŘ 360° ═════════ */
  truhlar: {
    id:'truhlar', slug:'truhlar-360',
    name:'TRUHLÁŘ 360°',
    diagVersion:'INDEX V1.1',
    scoringVersion:'1.1',
    status:'live',
    icon:ICON_TRUHLAR,
    short:'Diagnostika pro truhláře a výrobce nábytku. 12 otázek, osm oblastí, SCORE 0–100.',
    hero:{
      eyebrow:'TRUHLÁŘ 360°',
      h1:'Vyrábíte kvalitu. Ale <em>vyděláváte na každé zakázce?</em>',
      sub:'Zjistěte během několika minut, jak máte nastavené poptávky, kalkulace, marži, zakázky, kapacitu a růst.',
      cta:'Zjistit TRUHLÁŘ 360° SCORE'
    },
    bands:BANDS_TRUHLAR,
    /* Oblasti a max. body — závazná tabulka, součet 100 */
    areas:[
      { key:'A', name:'Poptávky & obchod',     max:16 },
      { key:'B', name:'Nabídky & kalkulace',   max:16 },
      { key:'C', name:'Ekonomika & marže',     max:20 },
      { key:'D', name:'Řízení zakázek',        max:12 },
      { key:'E', name:'Kapacita & čas',        max:12 },
      { key:'F', name:'Zákazník & reference',  max:8  },
      { key:'G', name:'Prezentace & digital',  max:8  },
      { key:'H', name:'Systém & růst',         max:8  }
    ],
    /* 12 otázek — doslovné znění ze spec kap. 5.2.
       Přiřazení otázka→oblast a bodování kvantitativních otázek
       je k ověření proti interní metodice INDEX V1.1. */
    questions:[
      { id:'q1', area:'A', type:'choice', text:'Kolik nových poptávek měsíčně průměrně dostáváte?', options:[
        {p:0,n:'Méně než 3'},{p:1,n:'3–5'},{p:2,n:'6–10'},{p:3,n:'11–20'},{p:4,n:'Více než 20'}]},
      q5('q2','C','Víte přesně, kolik vyděláváte na jednotlivých zakázkách?'),
      { id:'q3', area:'A', type:'choice', text:'Jak rychle obvykle reagujete na novou poptávku?', options:[
        {p:0,n:'Nemám pravidlo',d:'Někdy i několik dní.'},{p:1,n:'Do dvou až tří dnů'},
        {p:2,n:'Do 24 hodin'},{p:3,n:'Do několika hodin'},{p:4,n:'Do hodiny',d:'Mám na to nastavený postup.'}]},
      { id:'q4', area:'A', type:'choice', text:'Kolik poptávek přibližně proměníte v zakázku?', options:[
        {p:0,n:'Nevím / nesleduji'},{p:1,n:'Do 20 %'},{p:2,n:'20–40 %'},{p:3,n:'40–60 %'},
        {p:4,n:'Více než 60 %',d:'A pravidelně to sleduji.'}]},
      q5('q5','B','Máte jednotný systém kalkulace ceny zakázky?'),
      q5('q6','C','Sledujete skutečnou marži po dokončení zakázky?'),
      q5('q7','E','Máte přehled o vytížení dílny a lidí dopředu?'),
      q5('q8','D','Máte systém pro sledování zakázek a termínů?'),
      { id:'q9', area:'F', type:'choice', text:'Kolik nových zakázek přichází z doporučení a referencí?', options:[
        {p:0,n:'Nevím / nesleduji'},{p:1,n:'Do 10 %'},{p:2,n:'10–30 %'},{p:3,n:'30–50 %'},{p:4,n:'Více než 50 %'}]},
      q5('q10','G','Je vaše portfolio realizací aktuální a dobře prezentované online?'),
      q5('q11','G','Máte funkční web a profil firmy ve vyhledávači Google?'),
      q5('q12','H','Máte jasno v tom, co chcete jako firma zlepšit během 12 měsíců?')
    ],
    /* Doporučení podle slabé oblasti — finální texty dodá objednatel (kap. 7) */
    recs:{
      A:'Nastavte pravidlo pro reakci na poptávku a začněte měřit, kolik z nich skončí zakázkou.',
      B:'Zaveďte jednotnou kalkulační šablonu, aby každá nabídka vznikala stejným postupem.',
      C:'Po dokončení zakázky doplňte skutečné náklady a porovnejte je s kalkulací.',
      D:'Veďte zakázky a termíny na jednom místě, kam vidí celý tým.',
      E:'Plánujte vytížení dílny alespoň tři týdny dopředu.',
      F:'Ptejte se dokončených zákazníků na referenci a evidujte, odkud zakázky přišly.',
      G:'Doplňte aktuální realizace do portfolia a dotáhněte firemní profil ve vyhledávači.',
      H:'Pojmenujte dva až tři cíle na 12 měsíců a přiřaďte k nim měřitelný ukazatel.'
    }
  },

  /* ═════════ PLYNOSERVIS 360° ═════════
     Stejný engine, jiná konfigurace — nevzniká druhá aplikace (kap. 6).
     Oblasti a váhy = závazná tabulka. Znění otázek a výsledkové texty
     dodá objednatel; níže je provizorní scaffold na schválených oblastech. */
  plynoservis: {
    id:'plynoservis', slug:'plynoservis-360',
    name:'PLYNOSERVIS 360°',
    diagVersion:'INDEX V1.0',
    scoringVersion:'1.0',
    status:'live',
    icon:ICON_PLYNO,
    short:'Diagnostika pro plynové servisy a technické firmy. Stejný engine, vlastní oblasti a váhy.',
    hero:{
      eyebrow:'PLYNOSERVIS 360°',
      h1:'Techniky máte. Ale <em>víte, kolik vydělává jeden z nich?</em>',
      sub:'Zjistěte během několika minut, jak máte nastavenou zákaznickou základnu, opakovaný servis, ekonomiku techniků, kapacitu a obchod.',
      cta:'Zjistit PLYNOSERVIS 360° SCORE'
    },
    bands:BANDS_PLYNO,
    areas:[
      { key:'A', name:'Zákaznická základna', max:15 },
      { key:'B', name:'Opakovaný servis',    max:15 },
      { key:'C', name:'Ekonomika technika',  max:20 },
      { key:'D', name:'Vytížení kapacity',   max:10 },
      { key:'E', name:'Servisní proces',     max:10 },
      { key:'F', name:'CRM & digitalizace',  max:10 },
      { key:'G', name:'SVJ & B2B obchod',    max:10 },
      { key:'H', name:'Řízení & růst',       max:10 }
    ],
    questions:[
      q5('p1','A','Máte přehled o své zákaznické základně a její struktuře?'),
      q5('p2','B','Máte systém pro opakované servisy a jejich plánování?'),
      q5('p3','C','Víte, kolik vám vydělává jeden technik?'),
      q5('p4','D','Máte přehled o vytížení techniků dopředu?'),
      q5('p5','E','Máte jednotný servisní proces od zakázky po fakturaci?'),
      q5('p6','F','Máte zakázky a kontakty vedené v jednom systému?'),
      q5('p7','G','Máte aktivní obchod směrem k SVJ a firemním klientům?'),
      q5('p8','H','Máte jasno v tom, co chcete jako firma zlepšit během 12 měsíců?')
    ],
    recs:{
      A:'Rozdělte zákazníky podle typu a hodnoty, ať víte, o kterou část se opřít.',
      B:'Nastavte kalendář pravidelných servisů a připomínání zákazníkům dopředu.',
      C:'Spočítejte výnos a náklady na jednoho technika za měsíc a sledujte to pravidelně.',
      D:'Plánujte vytížení techniků alespoň dva týdny dopředu.',
      E:'Popište servisní proces jako postup od zakázky po fakturaci a držte se ho.',
      F:'Přesuňte zakázky a kontakty z papíru a tabulek do jednoho systému.',
      G:'Připravte nabídku pro SVJ a firemní klienty a obchod veďte aktivně.',
      H:'Pojmenujte dva až tři cíle na 12 měsíců a přiřaďte k nim měřitelný ukazatel.'
    }
  }
};

/* Připravované obory — architektonická poznámka objednatele */
const PLANNED = ['FINANCE 360°','GASTRO 360°','ELEKTRO 360°','INSTALATÉR 360°','STAVBA 360°'];

/* ═══════════════════════════════════════════════════════════════
   ENGINE — výpočet SCORE
   Podporuje: typy otázek (scale5 / choice / number), podmíněné
   větvení (showIf), různé váhy oblastí, dílčí SCORE oblastí,
   celkové SCORE 0–100 a doporučení vyvolaná slabou oblastí.
   ═══════════════════════════════════════════════════════════════ */
const ENGINE = {
  version:'1.0',

  /* Podmíněné větvení — otázka se zobrazí jen když projde showIf(answers) */
  visible(prof, answers){
    return prof.questions.filter(q => typeof q.showIf !== 'function' || q.showIf(answers));
  },

  /* Body za odpověď. Číselné vstupy se mapují přes q.scoreFrom (budoucí moduly). */
  points(q, val){
    if (val === undefined || val === null) return 0;
    if (q.type === 'number'){
      const b = (q.scoreFrom || []).find(r => val >= r.from && val <= r.to);
      return b ? b.p : 0;
    }
    return Number(val) || 0;
  },
  maxPoints(q){
    if (q.type === 'number') return Math.max.apply(null,(q.scoreFrom||[{p:0}]).map(r=>r.p));
    return Math.max.apply(null, q.options.map(o => o.p));
  },

  score(prof, answers){
    const qs = this.visible(prof, answers);
    const acc = {};
    prof.areas.forEach(a => acc[a.key] = { raw:0, maxRaw:0, n:0 });

    qs.forEach(q => {
      const a = acc[q.area];
      if (!a) return;
      a.maxRaw += this.maxPoints(q);
      a.raw    += this.points(q, answers[q.id]);
      a.n++;
    });

    let total = 0;
    const areas = prof.areas.map(def => {
      const a = acc[def.key];
      const ratio = a.maxRaw ? a.raw / a.maxRaw : 0;
      const pts = ratio * def.max;
      total += pts;
      return {
        key:def.key, name:def.name, max:def.max, questions:a.n,
        pts:Math.round(pts * 10) / 10, pct:Math.round(ratio * 100)
      };
    });

    const score = Math.max(0, Math.min(100, Math.round(total)));
    const band  = prof.bands.find(b => score >= b.min && score <= b.max) || prof.bands[0];
    const rank  = areas.slice().sort((x,y) => x.pct - y.pct);
    const weak   = rank.filter(a => a.pct < 70).slice(0, 3);
    const strong = rank.slice().reverse().filter(a => a.pct >= 70).slice(0, 2);
    const recs   = weak.map(w => ({ key:w.key, name:w.name, text:prof.recs[w.key] })).filter(r => r.text);

    return {
      score, band, areas, weak, strong, recs,
      profession:prof.id,
      diagVersion:prof.diagVersion,
      scoringVersion:prof.scoringVersion,
      engineVersion:this.version,
      answeredAt:new Date().toISOString()
    };
  }
};

/* ═══════════════════════════════════════════════════════════════
   MARKETING ATTRIBUTION & DATA — A + B (spec kap. 9)
   A: sběr utm_*, GCLID/FBCLID, landing page, referrer,
      first-touch vs last-touch s časy, vazba na lead/profesi/verzi.
   B: konverzní eventy pro Google Ads / Meta jdou do dataLayer;
      ID reklamních účtů jsou konfigurační, nikoli v kódu.
   ═══════════════════════════════════════════════════════════════ */

module.exports = { PROFESSIONS, ENGINE, SCALE5, BANDS_TRUHLAR, BANDS_PLYNO };
