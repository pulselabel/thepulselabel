/* ==========================================================================
   Pulse Label — classement.js
   Filtres (type, zone, parc, recherche), tri, affichage des cartes,
   notation des visiteurs. Les filtres sont reflétés dans l'URL
   (ex. classement.html?type=darkride&zone=europe) pour pouvoir partager une vue.
   ========================================================================== */
(function () {
  const cfg = window.PULSE_CONFIG || {};
  const PAGE = cfg.PAGE_SIZE || 24;

  // Valeurs autorisées dans les colonnes "type" et "region" de Supabase.
  const LANG = window.PL_LANG || 'fr';
  const LOCALE = window.PL_LOCALE || 'fr-FR';
  const L = window.PL_T || (d => d.fr);

  const TYPES = L({
    fr: { rollercoaster: 'Roller coaster', darkride: 'Dark ride', simulateur: 'Simulateur',
          waterride: 'Water ride', flatride: 'Manège', spectacle: 'Spectacle' },
    en: { rollercoaster: 'Roller coaster', darkride: 'Dark ride', simulateur: 'Simulator',
          waterride: 'Water ride', flatride: 'Flat ride', spectacle: 'Show' },
  });
  const ZONES = L({
    fr: { 'europe': 'Europe', 'amerique-nord': 'Amérique du Nord', 'amerique-latine': 'Amérique latine',
          'asie': 'Asie', 'moyen-orient': 'Moyen-Orient', 'oceanie': 'Océanie', 'afrique': 'Afrique' },
    en: { 'europe': 'Europe', 'amerique-nord': 'North America', 'amerique-latine': 'Latin America',
          'asie': 'Asia', 'moyen-orient': 'Middle East', 'oceanie': 'Oceania', 'afrique': 'Africa' },
  });
  // Pays : saisis en français dans Supabase, traduits ici pour la version anglaise.
  const COUNTRIES_EN = {
    'États-Unis': 'United States', 'Arabie saoudite': 'Saudi Arabia', 'Espagne': 'Spain', 'France': 'France',
    'Allemagne': 'Germany', 'Pologne': 'Poland', 'Royaume-Uni': 'United Kingdom', 'Belgique': 'Belgium',
    'Pays-Bas': 'Netherlands', 'Italie': 'Italy', 'Suisse': 'Switzerland', 'Autriche': 'Austria',
    'Suède': 'Sweden', 'Danemark': 'Denmark', 'Norvège': 'Norway', 'Finlande': 'Finland', 'Portugal': 'Portugal',
    'Japon': 'Japan', 'Chine': 'China', 'Corée du Sud': 'South Korea', 'Singapour': 'Singapore',
    'Émirats arabes unis': 'United Arab Emirates', 'Qatar': 'Qatar', 'Canada': 'Canada', 'Mexique': 'Mexico',
    'Brésil': 'Brazil', 'Australie': 'Australia', 'Afrique du Sud': 'South Africa', 'Turquie': 'Turkey',
  };
  const country = c => (LANG === 'en' ? (COUNTRIES_EN[c] || c) : c);
  const model = a => (LANG === 'en' && a.model_en) || a.model;
  const disclosure = a => (LANG === 'en' && a.disclosure_en) || a.disclosure;

  const T = L({
    fr: { photo: 'photo à venir', rank: 'rang', rankAria: 'Rang', type: 'Type', model: 'Modèle', year: 'Année', maker: 'Constructeur',
          pulse: 'Pulse Score Attraction', visitors: 'Note visiteurs', evaluated: 'Évaluée en',
          reviews: n => `${n} avis`, noReviews: 'Aucun avis', rate: 'Noter cette attraction',
          mine: n => `Votre note : ${n}/20, modifier`, allTypes: 'Tous les types', allZones: 'Toutes les zones', allParks: 'Tous les parcs',
          count: (n, f) => `${n} attraction${n > 1 ? 's' : ''}${f ? ' pour ces filtres' : ''}`,
          noneTitle: 'Aucune attraction ne correspond', noneText: 'Élargissez la recherche ou retirez un filtre pour retrouver des résultats.',
          clear: 'Retirer les filtres', more: n => `Afficher plus (${n} restantes)`,
          stats: (a, p, c, v) => `<span><b>${a}</b> attractions classées</span><span><b>${p}</b> parcs</span><span><b>${c}</b> pays</span><span><b>${v}</b> notes de visiteurs</span>`,
          results: n => n ? `Voir ${n === 1 ? 'le résultat' : `les ${n} résultats`}` : 'Aucun résultat', filtersOn: n => `${n} filtre${n > 1 ? 's' : ''} actif${n > 1 ? 's' : ''}`,
          pick: 'Choisissez une note de 0 à 20.', edit: 'Modifier', save: 'Enregistrer', saving: 'Enregistrement…',
          saved: 'Note enregistrée. Merci !', saveErr: 'La note n’a pas été enregistrée. Réessayez dans un instant.',
          pendingTitle: 'Le classement arrive bientôt', pendingText: 'Les premières attractions notées seront publiées ici très prochainement.',
          loadTitle: 'Le classement n’a pas pu être chargé', loadText: 'Vérifiez votre connexion, puis réessayez.', retry: 'Réessayer' },
    en: { photo: 'photo coming soon', rank: 'rank', rankAria: 'Rank', type: 'Type', model: 'Model', year: 'Year', maker: 'Manufacturer',
          pulse: 'Pulse Score Attraction', visitors: 'Visitor score', evaluated: 'Evaluated in',
          reviews: n => `${n} review${n > 1 ? 's' : ''}`, noReviews: 'No reviews yet', rate: 'Rate this attraction',
          mine: n => `Your score: ${n}/20, edit`, allTypes: 'All types', allZones: 'All regions', allParks: 'All parks',
          count: (n, f) => `${n} attraction${n > 1 ? 's' : ''}${f ? ' match these filters' : ''}`,
          noneTitle: 'No attraction matches', noneText: 'Broaden your search or remove a filter to see results again.',
          clear: 'Clear filters', more: n => `Show more (${n} remaining)`,
          stats: (a, p, c, v) => `<span><b>${a}</b> ranked attractions</span><span><b>${p}</b> parks</span><span><b>${c}</b> countries</span><span><b>${v}</b> visitor scores</span>`,
          results: n => n ? `Show ${n} result${n > 1 ? 's' : ''}` : 'No results', filtersOn: n => `${n} active filter${n > 1 ? 's' : ''}`,
          pick: 'Choose a score from 0 to 20.', edit: 'Update', save: 'Save', saving: 'Saving…',
          saved: 'Score saved. Thank you!', saveErr: 'Your score was not saved. Please try again in a moment.',
          pendingTitle: 'The ranking is coming soon', pendingText: 'The first rated attractions will be published here very soon.',
          loadTitle: 'The ranking could not be loaded', loadText: 'Check your connection, then try again.', retry: 'Try again' },
  });
  const LEVELS = [
    { min: 18.4, name: 'Legendary', v: '--lv-legendary' },
    { min: 16,   name: 'Ultimate',  v: '--lv-ultimate' },
    { min: 13,   name: 'Signature', v: '--lv-signature' },
    { min: 10,   name: 'Spark',     v: '--lv-spark' },
    { min: 6,    name: 'Rise',      v: '--lv-rise' },
    { min: 0,   name: 'Dead Zone', v: '--lv-dead' },
  ];
  const level = s => LEVELS.find(l => s >= l.min) || LEVELS[LEVELS.length - 1];

  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => (n == null || isNaN(n)) ? '–' : Number(n).toLocaleString(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const monthYear = d => { const t = new Date(d); return isNaN(t) ? d : t.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' }); };
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let ALL = [];
  const params = new URLSearchParams(location.search);
  const state = {
    q: params.get('q') || '',
    type: params.get('type') || 'all',
    zone: params.get('zone') || 'all',
    park: params.get('parc') || 'all',
    sort: params.get('tri') || 'rank',
    limit: PAGE,
  };

  /* ── Image de remplacement quand il n'y a pas encore de photo ── */
  function placeholder(a) {
    const label = TYPES[a.type] || 'Attraction';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A1F3D"/><stop offset="1" stop-color="#5B2E96"/></linearGradient></defs>
      <rect width="300" height="180" fill="url(#g)"/>
      <path d="M70 118 C84 118 94 108 106 90 C116 74 122 56 132 40 C140 28 148 22 158 21 C168 20 176 28 184 42 C194 58 198 82 204 104 C207 113 212 118 230 118" stroke="#C9A2FF" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".85"/>
      <line x1="70" y1="128" x2="230" y2="128" stroke="#C9A2FF" stroke-width="1.5" opacity=".3"/>
      <text x="150" y="152" font-family="Arial, sans-serif" font-size="12" fill="#E9DDFF" text-anchor="middle" opacity=".8">${esc(label)}, ${T.photo}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ── Filtrage / tri ── */
  function matches(a, ignore) {
    if (state.q) {
      const q = norm(state.q);
      const hay = norm([a.name, a.park, a.city, a.country, country(a.country), a.manufacturer, a.model, a.model_en].join(' '));
      if (!hay.includes(q)) return false;
    }
    if (ignore !== 'type' && state.type !== 'all' && a.type !== state.type) return false;
    if (ignore !== 'zone' && state.zone !== 'all' && a.region !== state.zone) return false;
    if (ignore !== 'park' && state.park !== 'all' && a.park !== state.park) return false;
    return true;
  }
  function sorted(list) {
    const l = [...list];
    const by = {
      rank: (a, b) => a.rank - b.rank,
      visitor: (a, b) => (b.visitor_avg ?? -1) - (a.visitor_avg ?? -1) || b.visitor_count - a.visitor_count,
      year: (a, b) => (b.year || 0) - (a.year || 0) || a.rank - b.rank,
      name: (a, b) => a.name.localeCompare(b.name, 'fr'),
    };
    return l.sort(by[state.sort] || by.rank);
  }

  /* ── Contrôles ── */
  function renderControls() {
    const focusedType = document.activeElement && document.activeElement.closest('#types') ? document.activeElement.dataset.type : null;
    // Types : boutons, avec le nombre de résultats pour chaque type
    const base = ALL.filter(a => matches(a, 'type'));
    const present = Object.keys(TYPES).filter(t => ALL.some(a => a.type === t));
    $('#types').innerHTML = [['all', T.allTypes, base.length]]
      .concat(present.map(t => [t, TYPES[t], base.filter(a => a.type === t).length]))
      .map(([v, t, n]) => `<button type="button" class="chip" data-type="${v}" aria-pressed="${state.type === v}">${esc(t)} <span class="n">${n}</span></button>`)
      .join('');
    if (focusedType) { const c = document.querySelector(`#types [data-type="${focusedType}"]`); if (c) c.focus({ preventScroll: true }); }

    // Zones présentes dans les données
    const zones = Object.keys(ZONES).filter(z => ALL.some(a => a.region === z));
    $('#zone').innerHTML = `<option value="all">${T.allZones}</option>` +
      zones.map(z => `<option value="${z}"${state.zone === z ? ' selected' : ''}>${ZONES[z]}</option>`).join('');

    // Parcs : limités à la zone choisie
    const parks = [...new Set(ALL.filter(a => state.zone === 'all' || a.region === state.zone).map(a => a.park))]
      .sort((a, b) => a.localeCompare(b, 'fr'));
    if (state.park !== 'all' && !parks.includes(state.park)) state.park = 'all';
    $('#park').innerHTML = `<option value="all">${T.allParks}</option>` +
      parks.map(p => `<option value="${esc(p)}"${state.park === p ? ' selected' : ''}>${esc(p)}</option>`).join('');

    $('#sort').value = state.sort;
    if ($('#q').value !== state.q) $('#q').value = state.q;
  }

  function syncURL() {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.type !== 'all') p.set('type', state.type);
    if (state.zone !== 'all') p.set('zone', state.zone);
    if (state.park !== 'all') p.set('parc', state.park);
    if (state.sort !== 'rank') p.set('tri', state.sort);
    const qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
  }

  /* ── Carte attraction ── */
  function card(a) {
    const lv = level(a.official_score);
    const mine = PulseAPI.myRating(a.id);
    const img = a.photo_url || placeholder(a);
    const where = [a.park, a.city && a.city !== a.park ? a.city : '', country(a.country)].filter(Boolean).join(', ');
    const spec = (k, v) => `<div><dt>${k}</dt><dd>${v ? esc(v) : '–'}</dd></div>`;
    return `
      <li class="card${a.rank <= 3 ? ' podium' : ''}" id="a-${esc(a.id)}">
        <div class="rank" aria-label="${T.rankAria} ${a.rank}"><b>${a.rank}</b><span>${T.rank}</span></div>
        <div class="photo">
          <img src="${esc(img)}" alt="${esc(a.name)}" loading="lazy" decoding="async" data-fallback="${esc(placeholder(a))}">
          ${a.photo_credit ? `<small>© ${esc(a.photo_credit)}</small>` : ''}
        </div>
        <div class="info">
          <h2>${esc(a.name)}</h2>
          <p class="where">${esc(where)}</p>
          <dl class="specs">
            ${spec(T.type, TYPES[a.type] || a.type)}
            ${spec(T.model, model(a))}
            ${spec(T.year, a.year)}
            ${spec(T.maker, a.manufacturer)}
          </dl>
          ${disclosure(a) ? `<p class="disclosure">${esc(disclosure(a))}</p>` : ''}
        </div>
        <div class="scores">
          <div class="score official" style="--lv:var(${lv.v})">
            <div class="lbl">${T.pulse}</div>
            <div class="val">${fmt(a.official_score)}<small> /20</small></div>
            <div class="sub"><i aria-hidden="true"></i>Tier ${lv.name}</div>
            ${a.evaluated_on ? `<div class="date">${T.evaluated} ${esc(monthYear(a.evaluated_on))}</div>` : ''}
          </div>
          <div class="score visitor">
            <div class="lbl">${T.visitors}</div>
            <div class="val" data-avg>${a.visitor_count ? fmt(a.visitor_avg) + '<small> /20</small>' : '–'}</div>
            <div class="sub" data-count>${a.visitor_count ? T.reviews(a.visitor_count) : T.noReviews}</div>
          </div>
          <button type="button" class="rate-btn${mine !== null ? ' done' : ''}" data-rate="${esc(a.id)}">
            ${mine !== null ? T.mine(mine) : T.rate}
          </button>
        </div>
      </li>`;
  }

  function render() {
    renderControls();
    syncURL();
    const list = sorted(ALL.filter(a => matches(a)));
    const shown = list.slice(0, state.limit);
    const active = state.q || state.type !== 'all' || state.zone !== 'all' || state.park !== 'all';

    $('#summary-count').textContent = list.length
      ? T.count(list.length, active)
      : '';
    $('#reset').hidden = !active;
    const nActive = [state.q, state.type !== 'all', state.zone !== 'all', state.park !== 'all', state.sort !== 'rank'].filter(Boolean).length;
    $('#filters-count').textContent = nActive || '';
    $('#filters-toggle').setAttribute('aria-label', 'Filtres' + (nActive ? ', ' + T.filtersOn(nActive) : ''));
    $('#filters-apply').textContent = T.results(list.length);

    if (!list.length) {
      $('#list').innerHTML = `<li class="state"><h2>${T.noneTitle}</h2>
        <p>${T.noneText}</p>
        <button type="button" class="btn btn-outline" data-reset>${T.clear}</button></li>`;
      $('#more').hidden = true;
      return;
    }
    $('#list').innerHTML = shown.map(card).join('');
    $('#list').querySelectorAll('img[data-fallback]').forEach(img => {
      img.addEventListener('error', () => { if (img.src !== img.dataset.fallback) img.src = img.dataset.fallback; }, { once: true });
    });
    $('#more').hidden = list.length <= state.limit;
    $('#more-btn').textContent = T.more(list.length - shown.length);
  }

  function renderStats() {
    const parks = new Set(ALL.map(a => a.park)).size;
    const countries = new Set(ALL.map(a => a.country)).size;
    const votes = ALL.reduce((s, a) => s + a.visitor_count, 0);
    $('#stats').innerHTML = T.stats(ALL.length, parks, countries, votes.toLocaleString(LOCALE));
  }

  /* ── Événements ── */
  let t;
  $('#q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value.trim(); state.limit = PAGE; render(); }, 160); });
  $('#types').addEventListener('click', e => {
    const b = e.target.closest('[data-type]'); if (!b) return;
    state.type = b.dataset.type; state.limit = PAGE; render();
  });
  $('#zone').addEventListener('change', e => { state.zone = e.target.value; state.limit = PAGE; render(); });
  $('#park').addEventListener('change', e => { state.park = e.target.value; state.limit = PAGE; render(); });
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
  $('#more-btn').addEventListener('click', () => { state.limit += PAGE; render(); });

  /* ── Mobile : panneau de filtres repliable ── */
  const panel = $('#filters-panel'), toggle = $('#filters-toggle');
  function setPanel(open) {
    panel.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.addEventListener('click', () => setPanel(!panel.classList.contains('open')));
  $('#filters-apply').addEventListener('click', () => {
    setPanel(false); toggle.focus({ preventScroll: true });
    // remonter au début des résultats si on était descendu plus bas
    const top = $('#list').getBoundingClientRect().top;
    if (top < 0 || top > innerHeight) {
      const offset = document.querySelector('.pl-header').offsetHeight + document.querySelector('.rk-tools').offsetHeight + 12;
      scrollTo({ top: scrollY + top - offset, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) { setPanel(false); toggle.focus(); } });
  function reset() { Object.assign(state, { q: '', type: 'all', zone: 'all', park: 'all', limit: PAGE }); render(); }
  $('#reset').addEventListener('click', reset);
  document.addEventListener('click', e => { if (e.target.closest('[data-reset]')) reset(); });

  /* ── Notation ── */
  const dlg = $('#rate-dialog');
  let current = null;
  $('#notes').innerHTML = Array.from({ length: 21 }, (_, i) => i)
    .map(n => `<input type="radio" name="note" id="n${n}" value="${n}"><label for="n${n}">${n}</label>`).join('');

  $('#list').addEventListener('click', e => {
    const b = e.target.closest('[data-rate]'); if (!b) return;
    current = ALL.find(a => a.id === b.dataset.rate); if (!current) return;
    $('#rate-name').textContent = current.name;
    $('#rate-park').textContent = [current.park, country(current.country)].filter(Boolean).join(', ');
    $('#rate-err').textContent = '';
    const mine = PulseAPI.myRating(current.id);
    dlg.querySelectorAll('input[name="note"]').forEach(i => { i.checked = mine !== null && Number(i.value) === mine; });
    $('#rate-save').textContent = mine !== null ? T.edit : T.save;
    dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', '');
  });
  const closeDlg = () => (dlg.close ? dlg.close() : dlg.removeAttribute('open'));
  $('#rate-close').addEventListener('click', closeDlg);
  $('#rate-cancel').addEventListener('click', closeDlg);
  dlg.addEventListener('click', e => { if (e.target === dlg) closeDlg(); });

  dlg.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault();
    const picked = dlg.querySelector('input[name="note"]:checked');
    if (!picked) { $('#rate-err').textContent = T.pick; return; }
    const btn = $('#rate-save'); btn.disabled = true; btn.textContent = T.saving;
    try {
      const r = await PulseAPI.submitRating(current, picked.value);
      current.visitor_avg = r.avg; current.visitor_count = r.count;
      closeDlg(); render(); renderStats();
      toast(T.saved);
    } catch (err) {
      $('#rate-err').textContent = T.saveErr;
    } finally { btn.disabled = false; btn.textContent = T.save; }
  });

  function toast(msg) {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2400);
  }

  /* ── Chargement ── */
  async function load() {
    $('#list').innerHTML = '<li class="skeleton"></li>'.repeat(4);
    try {
      const { items, demo, pending } = await PulseAPI.getAttractions();
      if (pending) {
        $('#stats').innerHTML = '';
        $('#list').innerHTML = `<li class="state"><h2>${T.pendingTitle}</h2><p>${T.pendingText}</p></li>`;
        document.querySelector('.rk-tools').hidden = true;
        return;
      }
      ALL = items;
      $('#demo-note').hidden = !demo;
      renderStats();
      render();
    } catch (err) {
      $('#list').innerHTML = `<li class="state"><h2>${T.loadTitle}</h2>
        <p>${T.loadText}</p>
        <button type="button" class="btn btn-primary" id="retry">${T.retry}</button></li>`;
      $('#retry').addEventListener('click', load);
    }
  }
  load();
})();
