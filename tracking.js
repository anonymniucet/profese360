'use strict';
/* ═══════════════════════════════════════════════════════════════
   PROFESE360 · tracking.js
   Marketing Attribution & Data — A + B (kap. 9)
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   MARKETING ATTRIBUTION & DATA — A + B (spec kap. 9)
   A: sběr utm_*, GCLID/FBCLID, landing page, referrer,
      first-touch vs last-touch s časy, vazba na lead/profesi/verzi.
   B: konverzní eventy pro Google Ads / Meta jdou do dataLayer;
      ID reklamních účtů jsou konfigurační, nikoli v kódu.
   ═══════════════════════════════════════════════════════════════ */
const ADS = { googleConversionId:null, metaPixelId:null };   // konfigurace, ne hardcode
const CONSENT_VERSION = '1.0';

const TRACK = {
  KEY:'p360_attr',
  attr:null,
  events:[],

  init(){
    const p = new URLSearchParams(location.search);
    const now = new Date().toISOString();
    const touch = {
      utm_source:   p.get('utm_source'),
      utm_medium:   p.get('utm_medium'),
      utm_campaign: p.get('utm_campaign'),
      utm_content:  p.get('utm_content'),
      utm_term:     p.get('utm_term'),
      gclid:        p.get('gclid'),
      fbclid:       p.get('fbclid'),
      landing_page: location.origin + location.pathname,
      referrer:     document.referrer || null,
      at:           now
    };

    let stored = null;
    try { const s = localStorage.getItem(this.KEY); if (s) stored = JSON.parse(s); } catch(e){}

    /* first-touch se při návratu uživatele NEPŘEPISUJE (kap. 9.1) */
    this.attr = {
      first_touch: (stored && stored.first_touch) ? stored.first_touch : touch,
      last_touch:  touch,
      first_seen_at: (stored && stored.first_seen_at) ? stored.first_seen_at : now,
      last_seen_at:  now,
      visits: (stored && stored.visits ? stored.visits : 0) + 1
    };
    try { localStorage.setItem(this.KEY, JSON.stringify(this.attr)); } catch(e){}

    this.push('landing_view', { landing_page: touch.landing_page });
  },

  push(name, payload){
    const ev = { event:name, ts:new Date().toISOString(), payload:payload || {} };
    this.events.push(ev);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({}, ev, {
      profese360_engine: ENGINE.version,
      attribution: this.attr
    }));
    if (DEV.open) DEV.render();
  },

  /* Payload, který se v produkci ukládá k leadu (kap. 8.1 + 9.1) */
  leadPayload(contact, result){
    return {
      contact, result,
      attribution: this.attr,
      consent: { version:CONSENT_VERSION, granted:true, at:new Date().toISOString() },
      crm_state: 'QUICK CHECK',
      ads_config: ADS
    };
  }
};
