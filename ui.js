'use strict';
/* ═══════════════════════════════════════════════════════════════
   PROFESE360 · ui.js
   Stav aplikace, router mezi obrazovkami, měřidlo SCORE
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   STAV + ROUTER
   ═══════════════════════════════════════════════════════════════ */
const S = {
  screen:'home', prof:null, qi:0, answers:{}, result:null, contact:null
};
const SCREENS = {
  home:'scHome', prof:'scProf', intro:'scIntro', quiz:'scQuiz',
  calc:'scCalc', result:'scResult', lead:'scLead', thanks:'scThanks'
};
const REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function go(screen, opts){
  opts = opts || {};
  S.screen = screen;
  Object.keys(SCREENS).forEach(k => { $(SCREENS[k]).hidden = (k !== screen); });

  const marketing = (screen === 'home' || screen === 'prof');
  $('navMkt').hidden = !marketing;
  $('navApp').hidden = marketing;

  if (!marketing) syncAppNav();
  if (!opts.keepScroll) window.scrollTo(0, 0);

  const el = $(SCREENS[screen]);
  if (!REDUCE && screen !== 'home'){
    el.classList.remove('fade'); void el.offsetWidth; el.classList.add('fade');
  }
  if (DEV.open) DEV.render();
}

function syncAppNav(){
  const p = S.prof ? PROFESSIONS[S.prof] : null;
  const titles = {
    intro:'Úvod', quiz:'Quick Check', calc:'Výpočet',
    result:'Výsledek', lead:'Kontakt', thanks:'Hotovo'
  };
  $('appTitle').textContent = p ? p.name : 'PROFESE360';

  let sub = titles[S.screen] || '';
  let pct = 0;
  if (S.screen === 'quiz' && p){
    const qs = ENGINE.visible(p, S.answers);
    sub = 'Otázka ' + (S.qi + 1) + ' z ' + qs.length;
    pct = (S.qi / qs.length) * 100;
  } else if (S.screen === 'intro'){ pct = 2; }
  else if (S.screen === 'calc'){ pct = 100; }
  else if (S.screen === 'result'){ sub = 'Výsledek diagnostiky'; pct = 100; }
  else if (S.screen === 'lead'){ sub = 'Zaslání výsledku'; pct = 100; }
  else if (S.screen === 'thanks'){ sub = 'Odesláno'; pct = 100; }

  $('appSub').textContent = sub;
  $('progF').style.width = pct + '%';
}

function back(){
  if (S.screen === 'quiz' && S.qi > 0){ S.qi--; renderQuiz(); return; }
  if (S.screen === 'quiz'){ go('intro'); return; }
  if (S.screen === 'intro'){ renderProf(S.prof); go('prof'); return; }
  if (S.screen === 'result'){ go('intro'); return; }
  if (S.screen === 'lead'){ renderResult(); go('result'); return; }
  goHomeTo('profese');
}

function goHomeTo(anchor){
  go('home', { keepScroll:true });
  requestAnimationFrame(() => {
    const t = anchor ? document.getElementById(anchor) : null;
    if (t) t.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block:'start' });
    else window.scrollTo(0, 0);
  });
}

/* ═══════════════════════════════════════════════════════════════
   MĚŘIDLO
   ═══════════════════════════════════════════════════════════════ */
function gaugeTicks(g){
  if (!g) return;
  let out = '';
  for (let v = 0; v <= 100; v += 5){
    const major = (v % 20 === 0);
    const th = (180 - 1.8 * v) * Math.PI / 180;
    const r1 = 118, r2 = major ? 128 : 124;
    const x1 = 140 + r1 * Math.cos(th), y1 = 140 - r1 * Math.sin(th);
    const x2 = 140 + r2 * Math.cos(th), y2 = 140 - r2 * Math.sin(th);
    out += '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+
           '" stroke="rgba(28,36,33,'+(major?'.30':'.16')+')" stroke-width="'+(major?1.6:1)+'" stroke-linecap="round"/>';
  }
  g.innerHTML = out;
}

function animGauge(root, target, colour){
  const LEN = 345.6;
  const arc = root.querySelector('.gArc');
  const val = root.querySelector('.gVal');
  gaugeTicks(root.querySelector('.gTicks'));
  if (arc && colour) arc.setAttribute('stroke', colour);

  const settle = () => {
    if (arc) arc.style.strokeDashoffset = LEN * (1 - target / 100);
    if (val) val.textContent = target;
  };
  if (REDUCE){ settle(); return; }

  let t0 = null;
  const DUR = 1150;
  const frame = ts => {
    if (t0 === null) t0 = ts;
    const p = Math.min((ts - t0) / DUR, 1);
    const e = 1 - Math.pow(1 - p, 3);
    if (arc) arc.style.strokeDashoffset = LEN * (1 - (target * e) / 100);
    if (val) val.textContent = Math.round(target * e);
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function fillBars(root, sel){
  const bars = root.querySelectorAll(sel || '.area-f');
  const run = () => bars.forEach(b => { b.style.width = b.dataset.w + '%'; });
  REDUCE ? run() : setTimeout(run, 240);
}
