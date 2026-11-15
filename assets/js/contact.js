/* ==========================================================================
   Pulse Label — contact.js
   Vérifie le formulaire puis envoie le message à contact@thepulselabel.com :
     - via Web3Forms si WEB3FORMS_ACCESS_KEY est renseignée dans config.js ;
     - sinon, en ouvrant la messagerie du visiteur avec un e-mail pré-rempli.
   Le sujet peut être pré-choisi par l'URL : contact.html?sujet=attraction
   ========================================================================== */
(function () {
  const cfg = window.PULSE_CONFIG || {};
  const TO = cfg.CONTACT_EMAIL || 'contact@thepulselabel.com';
  const $ = id => document.getElementById(id);
  const form = $('contact-form');
  const f = { name: $('c-name'), email: $('c-email'), subject: $('c-subject'), message: $('c-message'), consent: $('c-consent') };

  const T = (window.PL_T || (d => d.fr))({
    fr: {
      hints: {
        attraction: 'Indiquez le nom de l’attraction et du parc. Une suggestion ne garantit ni sa publication, ni une note.',
        correction: 'Précisez l’attraction concernée, l’information erronée et, si possible, une source.',
        reponse: 'Précisez les passages contestés et la réponse que vous souhaitez voir publiée.',
        donnees: 'Pour supprimer vos notes, joignez votre identifiant visiteur si vous le connaissez.',
      },
      eName: 'Indiquez votre nom.', eEmail: 'Indiquez une adresse e-mail valide, par exemple nom@exemple.fr.',
      eMsg: 'Votre message doit faire au moins 10 caractères.', eConsent: 'Cochez cette case pour que nous puissions vous répondre.',
      mailto: 'Votre messagerie s’ouvre avec le message pré-rempli : il ne reste qu’à l’envoyer.',
      sending: 'Envoi en cours…', send: 'Envoyer le message',
      fail: to => `Le message n’a pas pu être envoyé. Réessayez dans un instant, ou écrivez directement à <a href="mailto:${to}">${to}</a>.`,
      langTag: '',
    },
    en: {
      hints: {
        attraction: 'Give the name of the attraction and the park. A suggestion guarantees neither publication nor a score.',
        correction: 'Tell us which attraction, which information is wrong and, if possible, a source.',
        reponse: 'Specify the passages you dispute and the reply you would like published.',
        donnees: 'To delete your scores, include your visitor ID if you know it.',
      },
      eName: 'Please enter your name.', eEmail: 'Please enter a valid email address, for example name@example.com.',
      eMsg: 'Your message must be at least 10 characters long.', eConsent: 'Please tick this box so that we can reply to you.',
      mailto: 'Your email app is opening with the message ready: you just need to send it.',
      sending: 'Sending…', send: 'Send message',
      fail: to => `Your message could not be sent. Please try again in a moment, or write directly to <a href="mailto:${to}">${to}</a>.`,
      langTag: ' (EN)',
    },
  });
  const HINTS = T.hints;

  // Sujet pré-choisi par l'URL
  const pre = new URLSearchParams(location.search).get('sujet');
  if (pre && [...f.subject.options].some(o => o.value === pre)) f.subject.value = pre;
  const showHint = () => { $('h-subject').textContent = HINTS[f.subject.value] || ''; };
  f.subject.addEventListener('change', showHint); showHint();

  f.message.addEventListener('input', () => { $('c-count').textContent = `${f.message.value.length} / 4000`; });

  function setError(key, msg) {
    const el = $('e-' + key); if (el) el.textContent = msg || '';
    if (f[key]) f[key].setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (f[key] && msg) f[key].setAttribute('aria-describedby', 'e-' + key);
  }
  function validate() {
    const errors = {
      name: f.name.value.trim().length < 2 ? T.eName : '',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()) ? '' : T.eEmail,
      message: f.message.value.trim().length < 10 ? T.eMsg : '',
      consent: f.consent.checked ? '' : T.eConsent,
    };
    Object.entries(errors).forEach(([k, v]) => setError(k, v));
    const first = Object.keys(errors).find(k => errors[k]);
    if (first) f[first].focus();
    return !first;
  }
  // Une erreur disparaît dès que le champ est corrigé
  Object.keys(f).forEach(k => f[k].addEventListener(k === 'consent' ? 'change' : 'input', () => setError(k, '')));

  const subjectLabel = () => f.subject.options[f.subject.selectedIndex].text + T.langTag;

  function openMailClient() {
    const body = `${f.message.value.trim()}\n\n— ${f.name.value.trim()} (${f.email.value.trim()})`;
    location.href = `mailto:${TO}?subject=${encodeURIComponent('[Pulse Label] ' + subjectLabel())}&body=${encodeURIComponent(body)}`;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const status = $('c-status'); status.className = 'status'; status.textContent = '';
    if (!validate()) return;
    if (form.botcheck.checked) return; // robot

    if (!cfg.WEB3FORMS_ACCESS_KEY) {
      openMailClient();
      status.textContent = T.mailto;
      return;
    }

    const btn = $('c-send'); btn.disabled = true; btn.textContent = T.sending;
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: cfg.WEB3FORMS_ACCESS_KEY,
          subject: '[Pulse Label] ' + subjectLabel(),
          from_name: 'Site Pulse Label',
          name: f.name.value.trim(),
          email: f.email.value.trim(),
          replyto: f.email.value.trim(),
          sujet: subjectLabel(),
          message: f.message.value.trim(),
          page: location.href,
          botcheck: false,
        }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.success) throw new Error(out.message || 'envoi refusé');
      form.hidden = true;
      const done = $('c-done'); done.hidden = false; done.focus();
    } catch (err) {
      status.className = 'status bad';
      status.innerHTML = T.fail(TO);
    } finally {
      btn.disabled = false; btn.textContent = T.send;
    }
  });
})();
