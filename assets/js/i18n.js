/* ==========================================================================
   Pulse Label — i18n.js
   Détecte la langue de la page (attribut lang de <html>) et fournit :
     PL_LANG   : 'fr' ou 'en'
     PL_LOCALE : format des nombres et des dates ('fr-FR' ou 'en-US')
     PL_T(d)   : renvoie d[PL_LANG] (repli sur le français)
   Chargé en premier sur chaque page.
   ========================================================================== */
window.PL_LANG = (document.documentElement.lang || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr';
window.PL_LOCALE = window.PL_LANG === 'en' ? 'en-US' : 'fr-FR';
window.PL_T = function (dict) { return dict[window.PL_LANG] || dict.fr; };
