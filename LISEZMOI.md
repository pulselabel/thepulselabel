# Pulse Label — site v2

## Arborescence

```
pulselabel/
├── index.html                  Accueil : présentation, Tiers, Top 14 World 2027
├── classement.html             Classement (Supabase, filtres, notes visiteurs)
├── methodologie.html           Méthode
├── contact.html                Formulaire de contact
├── mentions-legales.html
├── charte.html                 CGU, règles de vote, données, cookies
├── 404.html                    Page « introuvable » (servie automatiquement par Vercel)
├── favicon.ico  apple-touch-icon.png
├── assets/
│   ├── css/  base · home · classement · methode · contact · legal
│   ├── js/
│   │   ├── i18n.js             Langue de la page (prêt pour une future version anglaise)
│   │   ├── layout.js           En-tête, menu, fil d'Ariane, pied de page
│   │   ├── config.js           ► VOS identifiants Supabase et Web3Forms
│   │   ├── api.js              Lecture des attractions, envoi des notes
│   │   ├── demo-data.js        Données de démonstration (aperçu uniquement)
│   │   ├── classement.js       Classement
│   │   └── contact.js          Formulaire
│   └── img/  logo.svg · favicon-48.png · og-image.png · instagram.png
├── supabase/  schema.sql · attractions-modele.csv
└── vercel.json  robots.txt  sitemap.xml
```

Adresses en ligne (Vercel retire « .html ») : /, /classement, /methodologie, /contact,
/mentions-legales, /charte. Les anciennes adresses /pages/… redirigent automatiquement.

## Fluidité et navigation (v10)

- **En-tête sans clignotement** : `i18n.js` et `layout.js` sont chargés juste après
  `<header id="site-header">`, et une ligne en haut de chaque page
  (`document.documentElement.classList.add('js')`) masque la navigation de secours.
  **Nouvelle page : gardez ces trois éléments au même endroit.**
- **Fil d'Ariane** écrit directement dans chaque page (bloc `<nav class="pl-crumbs">`).
- **Classement sur mobile** : une seule ligne fixe (recherche + bouton Filtres) ;
  les filtres se déplient à la demande, avec un bouton « Voir les N résultats ».
- **Transitions** douces entre les pages et **préchargement** de la page visée au
  survol ou à l'appui du doigt (navigateurs récents ; désactivé si l'utilisateur
  a demandé à réduire les animations).
- **Bouton retour en haut** automatique sur les longues pages.
- **Cache** : réglage par défaut de Vercel (les visiteurs reçoivent toujours la
  dernière version des fichiers après une mise à jour).

## Données de démonstration

Elles ne s'affichent **qu'en aperçu** : fichier ouvert sur l'ordinateur, localhost, ou
adresse de prévisualisation Vercel en *.vercel.app. Sur thepulselabel.com, tant que
Supabase n'est pas branché, le classement affiche « Le classement arrive bientôt » :
aucune note fictive ne peut être publiée ni indexée par Google.

## Après la mise en ligne (Google)

1. Ouvrez Google Search Console, ajoutez la propriété thepulselabel.com.
2. Menu Sitemaps : déclarez `https://thepulselabel.com/sitemap.xml`.
3. Testez l'accueil avec l'outil « Inspection de l'URL » puis « Demander une indexation ».

## Brancher Supabase (10 minutes)

1. Créez un projet sur supabase.com en choisissant une **région Europe** (ex. Frankfurt) :
   les mentions légales indiquent des serveurs en Europe.
2. **SQL Editor** > New query > collez `supabase/schema.sql` > **Run**.
3. **Table Editor** > `attractions` > **Insert** > **Import data from CSV** >
   choisissez `supabase/attractions-modele.csv`. Remplacez ensuite les notes
   `official_score` par vos Pulse Score Attraction (ceux du modèle sont provisoires),
   et renseignez `evaluated_on` (date d'évaluation, format AAAA-MM-JJ).
4. **Photos** : Storage > bucket `attractions` > Upload. Clic droit sur la photo >
   *Get URL* > collez l'URL dans la colonne `photo_url` (et le crédit dans `photo_credit`).
5. **Project Settings > API** : copiez *Project URL* et la clé *anon public* dans
   `assets/js/config.js`. Ne copiez jamais la clé `service_role`.
6. Déployez. Le bandeau « Données de démonstration » disparaît.

### Valeurs autorisées

| Colonne  | Valeurs |
|----------|---------|
| `type`   | rollercoaster, darkride, simulateur, waterride, flatride, spectacle |
| `region` | europe, amerique-nord, amerique-latine, asie, moyen-orient, oceanie, afrique |
| `official_score` | Pulse Score Attraction, 0 à 20, une décimale |
| `evaluated_on` | date d'évaluation, ex. 2026-05-14 (affichée « Évaluée en mai 2026 ») |
| `disclosure` | à remplir si la visite a eu lieu sur invitation ou s'il existe un lien commercial (ex. « Visite à l'invitation du parc ») |
| `published` | true (visible) / false (masquée) |

Le **rang** est calculé automatiquement à partir de `official_score` (ex aequo = même rang).

### Notes des visiteurs

- Table `ratings`, une ligne par visiteur et par attraction (le revote remplace).
- La moyenne et le nombre d'avis sont calculés par la vue `attractions_public`.
- Les visiteurs ne peuvent écrire que via la fonction `submit_rating` (note 0 à 20 contrôlée).
- Écarter une note frauduleuse : supprimez la ligne dans `ratings`.
- **Retirer une attraction du classement** : supprimez sa ligne dans `attractions` ;
  ses notes visiteurs sont alors effacées automatiquement, comme l'annonce la charte.
  `published = false` ne fait que la masquer temporairement (notes conservées).
- Limite connue : un visiteur qui vide son navigateur peut revoter. Pour durcir
  plus tard : activer Cloudflare Turnstile ou exiger une connexion Supabase Auth.

## Brancher le formulaire de contact (5 minutes)

1. Allez sur web3forms.com, saisissez **contact@thepulselabel.com**, validez.
2. Vous recevez une « Access Key » par e-mail sur cette adresse.
3. Collez-la dans `assets/js/config.js` → `WEB3FORMS_ACCESS_KEY`.
4. Les messages arrivent dans votre boîte ; « Répondre » écrit directement au visiteur.

Sans clé, le bouton « Envoyer » ouvre la messagerie du visiteur avec l'e-mail pré-rempli.
Lien direct vers un sujet : `contact.html?sujet=attraction` (aussi : question, correction,
reponse, presse, donnees, autre).

## Pictogramme Instagram

Le lien vers @thepulsescore est déjà dans le pied de page. Pour afficher le pictogramme,
le pictogramme est en place (`assets/img/instagram.png`). Pour le changer, remplacez ce fichier ; à défaut, téléchargez le glyphe officiel sur le site des ressources de marque de Meta
(Instagram Brand Resources), et enregistrez-le sous `assets/img/instagram.png`.
Il apparaîtra automatiquement ; sans ce fichier, le lien reste affiché en texte.

## Modifier le site

- **Ajouter une page** : une ligne dans `PAGES` de `assets/js/layout.js` (`menu: true` pour l'afficher
  dans le menu déroulant ; le fil d'Ariane se met à jour seul)
  (+ une ligne `rewrites` dans `vercel.json` et une entrée dans `sitemap.xml`).
- **Top 14** : liste `<ol class="top-list">` dans `index.html`.
- **Couleurs / polices** : variables en tête de `assets/css/base.css`.
- **Méthode** : `methodologie.html` — gardez `<header id="site-header">`,
  `<footer id="site-footer">` et le script `layout.js` lors de la refonte.

## Cookies

Le site ne dépose aucun cookie : pas de bandeau nécessaire. Seul le stockage local du
navigateur est utilisé, et uniquement quand un visiteur note une attraction (service
expressément demandé, dispensé de consentement). Les polices viennent de Bunny Fonts (UE).

**Avant d'ajouter un outil tiers**, vérifiez s'il dépose des cookies : mesure d'audience,
vidéo YouTube intégrée, publication Instagram intégrée, publicité… Si oui, il faudra un
bandeau de consentement, sauf outil d'audience configuré en mode exempté par la CNIL
(ex. Matomo en configuration exemptée).

## Mettre à jour les textes juridiques

Changez la date « Dernière mise à jour » dans `mentions-legales.html` et `charte.html`
à chaque modification. Si une société est créée, l'anonymat de l'éditeur n'est plus
possible : il faudra indiquer la dénomination, le siège et le numéro d'immatriculation.

## Règles de vocabulaire (protection juridique)

La méthode et la charte présentent le Pulse Score Attraction comme une **opinion datée**.
Pour rester cohérent dans vos futurs textes (réseaux sociaux, presse, nouvelles pages) :

- dire « Pulse Score Attraction », « Tier », « avis », « selon Pulse Label » ; éviter « norme »,
  « officiel », « certifié », « référence internationale » ;
- ne pas écrire « Pulse Label™ » ni « marque » tant qu'aucune marque n'est déposée ;
- ne jamais associer un Tier bas à la sécurité (« dangereuse », « défaillante ») ;
- remplir `evaluated_on` pour chaque note et `disclosure` en cas d'invitation ;
- ne promettre que ce qui est fait pour toutes les attractions (nombre de passages, fréquence).
