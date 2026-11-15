/* ==========================================================================
   Pulse Label — config.js
   ► SEUL fichier à modifier pour brancher votre base Supabase.
   Supabase > Project Settings > API :
     - Project URL        → SUPABASE_URL
     - anon / public key  → SUPABASE_ANON_KEY   (clé publique, prévue pour le navigateur)
   Ne mettez JAMAIS la clé "service_role" ici.
   Tant que ces deux champs sont vides, le classement affiche des données de démonstration.
   ========================================================================== */
window.PULSE_CONFIG = {
  SUPABASE_URL: '',        // ex. 'https://abcdefgh.supabase.co'
  SUPABASE_ANON_KEY: '',   // ex. 'eyJhbGciOiJIUzI1NiIsInR5cCI6...'

  VIEW: 'attractions_public',   // vue SQL lue par le classement (voir supabase/schema.sql)
  RATING_RPC: 'submit_rating',  // fonction SQL qui enregistre une note visiteur
  PAGE_SIZE: 24,                // nombre d'attractions affichées avant "Afficher plus"

  /* ── Formulaire de contact ─────────────────────────────────────────────
     Les messages sont envoyés par Web3Forms (web3forms.com, offre gratuite) :
     1. sur web3forms.com, saisissez contact@thepulselabel.com ;
     2. collez ici la clé "Access Key" reçue par e-mail (clé publique).
     Tant que la clé est vide, le bouton ouvre la messagerie du visiteur
     avec un e-mail pré-rempli adressé à CONTACT_EMAIL. */
  CONTACT_EMAIL: 'contact@thepulselabel.com',
  WEB3FORMS_ACCESS_KEY: '',
};
