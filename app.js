'use strict';
/* ═══════════════════════════════════════════════════════════════
   PROFESE360 · app.js
   Navázání událostí a start aplikace
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   UDÁLOSTI
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-go],[data-prof],[data-start],[data-act],[data-home],[data-q]');
  if (!t) return;

  /* Odpověď na otázku */
  if (t.dataset.q !== undefined){ answer(t.dataset.q, Number(t.dataset.p)); return; }

  /* Skok na sekci homepage */
  if (t.dataset.go){
    if (t.dataset.go === 'home') goHomeTo('top'); else goHomeTo(t.dataset.go);
    return;
  }
  if (t.dataset.home){ goHomeTo(t.dataset.home); return; }

  /* Výběr profese → profesní landing page */
  if (t.dataset.prof){
    renderProf(t.dataset.prof);
    go('prof');
    TRACK.push('landing_view', { profession:t.dataset.prof, page:PROFESSIONS[t.dataset.prof].slug });
    return;
  }

  /* Start Quick Checku → úvod */
  if (t.dataset.start){
    S.prof = t.dataset.start; S.qi = 0; S.answers = {}; S.result = null;
    renderIntro(); go('intro');
    return;
  }

  switch (t.dataset.act){
    case 'beginQuiz':
      S.qi = 0;
      TRACK.push('quickcheck_start', {
        profession:S.prof,
        total:ENGINE.visible(PROFESSIONS[S.prof], S.answers).length,
        diag_version:PROFESSIONS[S.prof].diagVersion
      });
      renderQuiz(); go('quiz');
      break;
    case 'nextQ': {
      clearTimeout(S._t);
      const qs = ENGINE.visible(PROFESSIONS[S.prof], S.answers);
      if (S.qi < qs.length - 1){ S.qi++; renderQuiz(); } else finishQuiz();
      break;
    }
    case 'prevQ':
      clearTimeout(S._t);
      if (S.qi > 0){ S.qi--; renderQuiz(); }
      break;
    case 'toLead':
      renderLead(); go('lead');
      break;
    case 'consult': {
      TRACK.push('consultation_requested', {
        profession:S.prof, score:S.result.score, band:S.result.band.n
      });
      t.disabled = true;
      t.textContent = 'Žádost odeslána ✓';
      const n = $('thanksNote');
      if (n) n.textContent = 'Žádost o konzultaci jsme zaznamenali. Lead je ve stavu QUICK CHECK a obchodník ho posune na KONTAKTOVÁN.';
      break;
    }
  }
});

$('appBack').addEventListener('click', back);
$('devBtn').addEventListener('click', () => DEV.toggle());

/* ═══════════════════════════════════════════════════════════════
   START
   ═══════════════════════════════════════════════════════════════ */
(function init(){
  TRACK.init();
  renderProfGrid();

  /* Ukázkové měřidlo v hero */
  const hero = $('scHome');
  animGauge(hero, 72);
  fillBars(hero, '.area-f');

  /* Scroll reveal — s pojistkou, aby obsah nikdy nezůstal skrytý */
  const rv = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  const showAll = () => rv.forEach(el => el.classList.add('in'));
  if (REDUCE || !('IntersectionObserver' in window)){
    showAll();
  } else {
    const io = new IntersectionObserver(es => {
      es.forEach(en => { if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });
    rv.forEach(el => io.observe(el));
    setTimeout(showAll, 3000);
  }
})();
