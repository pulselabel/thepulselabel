/* ==========================================================================
   Pulse Label — layout.js
   Injecte sur chaque page : l'en-tête (logo, nom, menu, choix de langue),
   le fil d'Ariane et le pied de page, en français ou en anglais.
   Chaque page déclare :  <html lang="fr|en">  et  <body data-root="./" data-page="accueil">
   (data-root = racine du site : "./" en français, "../" dans /en/)
   ========================================================================== */
(function () {
  const root = document.body.dataset.root || './';
  const current = document.body.dataset.page || '';
  const lang = window.PL_LANG || 'fr';
  const other = lang === 'fr' ? 'en' : 'fr';

  // ► Registre des pages. menu: true = affichée dans le menu déroulant.
  const PAGES = [
    { id: 'accueil', menu: true,
      fr: { href: 'index.html',            t: 'Accueil',          d: 'Le label et le Top 14 World 2027' },
      en: { href: 'en/index.html',         t: 'Home',             d: 'The label and the Top 14 World 2027' } },
    { id: 'classement', menu: true,
      fr: { href: 'classement.html',       t: 'Classement',       d: 'Toutes les attractions, à trier et à noter' },
      en: { href: 'en/ranking.html',       t: 'Ranking',          d: 'Every attraction, to sort and to rate' } },
    { id: 'methodologie', menu: true,
      fr: { href: 'methodologie.html',     t: 'Méthode',          d: 'Comment nous notons les attractions' },
      en: { href: 'en/method.html',        t: 'Method',           d: 'How we score attractions' } },
    { id: 'contact', menu: true,
      fr: { href: 'contact.html',          t: 'Contact',          d: 'Une question, une suggestion, une correction' },
      en: { href: 'en/contact.html',       t: 'Contact',          d: 'A question, a suggestion, a correction' } },
    { id: 'mentions',
      fr: { href: 'mentions-legales.html', t: 'Mentions légales' },
      en: { href: 'en/legal-notice.html',  t: 'Legal notice' } },
    { id: 'charte',
      fr: { href: 'charte.html',           t: 'Charte juridique' },
      en: { href: 'en/terms.html',         t: 'Terms and privacy' } },
  ];
  const INSTAGRAM = { url: 'https://www.instagram.com/thepulsescore/', handle: '@thepulsescore' };

  const T = window.PL_T({
    fr: { skip: 'Aller au contenu', home: 'Pulse Label, retour à l’accueil', quick: 'Accès rapide', menu: 'Menu',
          crumbs: 'Fil d’Ariane', switchTxt: 'EN', switchLabel: 'English version',
          about: 'Notes et avis indépendants sur les attractions des parcs à thème du monde entier.',
          insta: 'Pulse Label sur Instagram', newTab: 'nouvel onglet', explore: 'Explorer', info: 'Informations',
          cookies: 'Cookies', rights: 'Tous droits réservés.', top: 'Revenir en haut de la page',
          disclaimer: 'Les notes publiées sont des avis : elles ne constituent ni une certification ni une garantie de sécurité.' },
    en: { skip: 'Skip to content', home: 'Pulse Label, back to home', quick: 'Quick links', menu: 'Menu',
          crumbs: 'Breadcrumb', switchTxt: 'FR', switchLabel: 'Version française',
          about: 'Independent scores and reviews of theme park attractions around the world.',
          insta: 'Pulse Label on Instagram', newTab: 'new tab', explore: 'Explore', info: 'Information',
          cookies: 'Cookies', rights: 'All rights reserved.', top: 'Back to top',
          disclaimer: 'Published scores are opinions: they are neither a certification nor a safety guarantee.' },
  });

  const page = id => PAGES.find(p => p.id === id);
  const url = (id, l = lang) => root + page(id)[l].href;
  const title = id => page(id)[lang].t;
  const cur = id => (id === current ? ' aria-current="page"' : '');

  const LOGO = `<svg viewBox="0 0 216 160" aria-hidden="true" fill="none">
    <path d="M20 128 C30 128 38 118 50 100 C60 84 68 64 80 44 C90 28 100 18 114 14 C128 10 140 18 152 34 C164 50 170 76 176 104 C180 118 184 128 196 128" stroke="#A855F7" stroke-width="10" stroke-linecap="round"/>
    <line x1="20" y1="148" x2="196" y2="148" stroke="currentColor" stroke-width="7" stroke-linecap="round" opacity=".28"/>
    <circle cx="114" cy="14" r="12" fill="#A855F7"/></svg>`;

  /* ── En-tête ── */
  const header = document.getElementById('site-header');
  if (header) {
    header.className = 'pl-header';
    header.innerHTML = `
      <a class="skip-link" href="#contenu">${T.skip}</a>
      <div class="pl-wrap pl-header-inner">
        <a class="pl-brand" href="${url('accueil')}" aria-label="${T.home}">
          ${LOGO}<span class="pl-brand-name">Pulse Label</span>
        </a>
        <nav class="pl-quick" aria-label="${T.quick}">
          <a href="${url('classement')}"${cur('classement')}>${title('classement')}</a>
          <a href="${url('methodologie')}"${cur('methodologie')}>${title('methodologie')}</a>
          <a href="${url('contact')}"${cur('contact')}>${title('contact')}</a>
        </nav>
        <div class="pl-menu">
          <button class="pl-menu-btn" type="button" aria-expanded="false" aria-controls="pl-menu-panel">
            <span class="bars" aria-hidden="true"><i></i><i></i><i></i></span> ${T.menu}
          </button>
          <ul class="pl-menu-panel" id="pl-menu-panel">
            ${PAGES.filter(p => p.menu).map(p => `<li><a href="${root + p[lang].href}"${cur(p.id)}><span class="t">${p[lang].t}</span><span class="d">${p[lang].d}</span></a></li>`).join('')}
          </ul>
        </div>
      </div>`;

    const btn = header.querySelector('.pl-menu-btn');
    const panel = header.querySelector('.pl-menu-panel');
    const setOpen = open => { btn.setAttribute('aria-expanded', String(open)); panel.classList.toggle('open', open); };
    btn.addEventListener('click', e => { e.stopPropagation(); setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('click', e => { if (!e.target.closest('.pl-menu')) setOpen(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panel.classList.contains('open')) { setOpen(false); btn.focus(); }
    });
    // Retour arrière (page restaurée depuis le cache du navigateur) : menu refermé
    addEventListener('pagehide', () => setOpen(false));
  }

  /* ── Le reste (fil d'Ariane, pied de page, liens) attend que la page soit lue :
        layout.js est chargé juste après l'en-tête pour que celui-ci s'affiche
        dès la première image, sans clignotement. ── */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', afterDom);
  else afterDom();

  function afterDom() {
  /* ── Fil d'Ariane : écrit en dur dans chaque page (référencement, aucun décalage) ;
        ajouté ici seulement s'il manque ── */
  const main = document.getElementById('contenu');
  if (main && page(current) && current !== 'accueil' && !document.querySelector('.pl-crumbs')) {
    const crumbs = document.createElement('nav');
    crumbs.className = 'pl-crumbs pl-wrap';
    crumbs.setAttribute('aria-label', T.crumbs);
    crumbs.innerHTML = `<ol>
        <li><a href="${url('accueil')}">${title('accueil')}</a></li>
        <li><span aria-current="page">${title(current)}</span></li>
      </ol>`;
    main.parentNode.insertBefore(crumbs, main);
  }

  /* ── Liens propres : en ligne, « classement.html » devient « classement »
        (Vercel sert les deux, mais Google préfère des liens sans redirection) ── */
  function cleanLinks() {
    if (location.protocol === 'file:') return; // aperçu local : on garde les .html
    document.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (/^(https?:|mailto:|tel:|#|data:)/.test(h)) return;
      const clean = h.replace(/(^|\/)index\.html(?=$|[?#])/, '$1').replace(/\.html(?=$|[?#])/, '');
      if (clean !== h) a.setAttribute('href', clean === '' ? './' : clean);
    });
  }

  /* ── Pied de page ── */
  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'pl-footer';
    footer.innerHTML = `
      <div class="pl-wrap pl-footer-inner">
        <div>
          <h2>Pulse Label</h2>
          <p>${T.about}</p>
          <a class="pl-social" href="${INSTAGRAM.url}" target="_blank" rel="noopener" aria-label="${T.insta}, ${INSTAGRAM.handle} (${T.newTab})">
            <img src="${root}assets/img/instagram.png" alt="" width="20" height="20" onerror="this.remove()">
            <span>Instagram <b>${INSTAGRAM.handle}</b></span>
          </a>
        </div>
        <div>
          <h2>${T.explore}</h2>
          <ul>
            ${['accueil', 'classement', 'methodologie', 'contact'].map(id => `<li><a href="${url(id)}">${title(id)}</a></li>`).join('')}
          </ul>
        </div>
        <div>
          <h2>${T.info}</h2>
          <ul>
            <li><a href="${url('mentions')}">${title('mentions')}</a></li>
            <li><a href="${url('charte')}">${title('charte')}</a></li>
            <li><a href="${url('charte')}#cookies">${T.cookies}</a></li>
          </ul>
        </div>
      </div>
      <div class="pl-wrap pl-footer-legal">
        <span>© ${new Date().getFullYear()} Pulse Label. ${T.rights}</span>
        <span>${T.disclaimer}</span>
      </div>`;
  }
  cleanLinks();
  backToTop();
  prefetch();
  }

  /* ── Bouton « retour en haut », visible après deux écrans de défilement ── */
  function backToTop() {
    if (document.documentElement.scrollHeight < innerHeight * 3) return; // page courte : inutile
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pl-top'; b.setAttribute('aria-label', T.top);
    b.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 14V4M4.5 8.5L9 4l4.5 4.5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.body.appendChild(b);
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { b.classList.toggle('show', scrollY > innerHeight * 2); ticking = false; });
    }, { passive: true });
    b.addEventListener('click', () => {
      scrollTo({ top: 0 });
      document.querySelector('.pl-brand')?.focus({ preventScroll: true });
    });
  }

  /* ── Préchargement : la page visée se prépare dès le survol ou l'appui du doigt
        (navigateurs Chromium ; sans effet ailleurs) ── */
  function prefetch() {
    if (location.protocol === 'file:' || !HTMLScriptElement.supports || !HTMLScriptElement.supports('speculationrules')) return;
    const s = document.createElement('script');
    s.type = 'speculationrules';
    s.textContent = JSON.stringify({ prerender: [{ where: { and: [{ href_matches: '/*' }, { not: { selector_matches: '[target=_blank]' } }] }, eagerness: 'moderate' }] });
    document.head.appendChild(s);
  }
})();
