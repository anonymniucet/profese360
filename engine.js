'use strict';
/* ═══════════════════════════════════════════════════════════════
   PROFESE360 · engine.js
   Diagnostický engine — výpočet SCORE. Nezná konkrétní profesi,
   pracuje s jakoukoli konfigurací předanou jako argument.
   ═══════════════════════════════════════════════════════════════ */

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

/* Export pro testy v Node — v prohlížeči se přeskočí. */
if (typeof module !== 'undefined' && module.exports) module.exports = { ENGINE };
