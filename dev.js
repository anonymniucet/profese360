'use strict';
/* ═══════════════════════════════════════════════════════════════
   PROFESE360 · dev.js
   Vývojářský panel — kontrola attribution a eventů.
   V produkci se odstraní i s blokem .devb/.devp v index.html.
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   VÝVOJÁŘSKÝ PANEL — kontrola attribution a eventů
   (v produkci se odstraní — jeden blok markupu + tento objekt)
   ═══════════════════════════════════════════════════════════════ */
const DEV = {
  open:false,
  toggle(){
    this.open = !this.open;
    $('devPanel').hidden = !this.open;
    $('devBtn').setAttribute('aria-expanded', this.open ? 'true' : 'false');
    if (this.open) this.render();
  },
  render(){
    const p = S.prof ? PROFESSIONS[S.prof] : null;
    const evs = TRACK.events.slice().reverse().map(e =>
      '<div class="ev"><i>' + e.ts.slice(11, 19) + '</i><span><b>' + esc(e.event) + '</b> ' +
      esc(JSON.stringify(e.payload)) + '</span></div>').join('');

    $('devPanel').innerHTML =
      '<h4>Stav</h4><pre>' + esc(JSON.stringify({
        screen:S.screen,
        profese:p ? p.id : null,
        diagnostika:p ? p.diagVersion : null,
        scoring:p ? p.scoringVersion : null,
        engine:ENGINE.version,
        odpovedi:Object.keys(S.answers).length,
        score:S.result ? S.result.score : null,
        uroven:S.result ? S.result.band.n : null
      }, null, 2)) + '</pre>' +
      '<h4>Attribution (A)</h4><pre>' + esc(JSON.stringify(TRACK.attr, null, 2)) + '</pre>' +
      '<h4>Eventy (B) — ' + TRACK.events.length + '</h4>' + evs +
      '<h4>Konverzní mapování</h4><pre>' + esc(JSON.stringify({
        google_ads: ADS.googleConversionId || '(konfigurační, není v kódu)',
        meta_pixel: ADS.metaPixelId || '(konfigurační, není v kódu)',
        konverze: ['lead_created','consultation_requested','crm_diagnostic','crm_offer','crm_realization'],
        serverove: 'crm_* eventy posouvá administrace, ne klient'
      }, null, 2)) + '</pre>' +
      (S.leadPayload ? '<h4>Payload leadu</h4><pre>' + esc(JSON.stringify(S.leadPayload, null, 2)) + '</pre>' : '') +
      '<p class="devnote">Kontrolní panel pro milníkovou revizi. Eventy jdou zároveň do <code>window.dataLayer</code>. ' +
      'Test zdroje: přidejte do URL <code>?utm_source=google&amp;utm_medium=cpc&amp;utm_campaign=truhlar&amp;gclid=TEST123</code> — ' +
      'first-touch se při další návštěvě nepřepíše.</p>';
  }
};
