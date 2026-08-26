# Perlivio — version merge finale professionnelle

Cette version est une vitrine autonome, sans dépendance aux anciens chemins `/manus-storage/`, construite à partir du dernier état du projet, de l’audit comparatif et de la fiche produit Perlivio.

## Ce qui est intégré

- Homepage longue premium centrée sur le vrai USP Perlivio.
- 5 gammes : Essentiel, Métal, Inox, Argent, Signature.
- Comparateur de gammes.
- 18 pierres et 18 fiches individuelles.
- Configurateur 7 étapes : gamme, taille, Socles, Origine, histoire, Chemin, récapitulatif.
- Bracelet complet avec estimation 20 / 23 / 26 / 29 pierres selon la tranche de poignet.
- Mode Socles simple ou deux pierres alternées.
- Perles de Chemin et Réserve visibles dans la logique de composition.
- Visuels locaux basés sur la photo réelle du bracelet fournie ; sélecteurs de pierres photographiques et fermoir réel détouré.
- Mega-menu desktop et navigation mobile.
- Pages distinctes : fonctionnement, Réserve, taille, qualité, fabrication, traçabilité, entretien, livraison/retours, histoire, FAQ, contact, carte cadeau.
- Panier local persistant pour sauvegarder plusieurs compositions.
- SEO de base par page : title, description et OpenGraph.
- Assets 100 % locaux ; aucune dépendance Manus ou CDN externe.
- Aucune mention résiduelle « Atelier Origine ».
- Aucune allégation médicale pour les pierres.

## Important avant ouverture commerciale

Cette version n'invente pas les informations qui n'ont pas encore été validées. Le paiement reste volontairement non activé tant que les éléments suivants ne sont pas confirmés :

1. Prix TTC définitifs par gamme et options.
2. Identifiants Shopify / variantes par gamme et taille.
3. Entité juridique, coordonnées, CGV, confidentialité et médiateur.
4. Délais réels de fabrication et de livraison.
5. Référence finale du fermoir et procédure de manipulation.
6. Justificatifs matière pour toute revendication telle que inox 316L ou argent 925.
7. Photos de production finales des cinq gammes si elles diffèrent du prototype physique fourni.

## Voir le site localement

Depuis le dossier décompressé :

```bash
python -m http.server 8080
```

Puis ouvrir `http://localhost:8080/`.

Le site est multi-page et ne nécessite aucun build.

## Publication

Le dossier décompressé peut être déposé tel quel sur un hébergement statique (Netlify, Cloudflare Pages, S3/CloudFront, hébergement web classique, etc.).

Pour passer en e-commerce réel, remplacer le panier local par l'adaptateur Shopify une fois les produits, prix et variantes validés. Le fichier `assets/js/data.js` contient déjà une section `commerce` prévue pour recevoir ces références.


## Mise à jour configurateur — liberté guidée
- Trois parcours UX : Commencer simplement, Mon histoire a déjà commencé, Composer librement.
- Aucun plafond commercial artificiel sur les Perles de Chemin.
- Une même pierre peut être ajoutée plusieurs fois avec boutons − / +.
- La limite est uniquement physique : nombre de places du bracelet moins la Perle Origine.
- Le nombre de Socles remplacées alimente la Réserve et est expliqué dans le configurateur.
- Le vocabulaire privilégie « votre bracelet » / « votre composition » plutôt que « votre Perlivio ».
- Le simulateur utilise un fermoir cylindrique discret, de taille proche d’une perle et placé hors du premier plan.

## Configurateur UX v4

Le configurateur a été repris mobile-first après audit sur appareil réel : l'aperçu est désormais compact et sticky, une seule tâche est mise en avant par étape, les collections utilisent le moteur de rendu corrigé, et le bracelet n'affiche plus de marqueurs graphiques sur les pierres. Le fermoir cylindrique occupe une vraie ouverture du cercle, à environ 1 h 30, de façon secondaire par rapport aux pierres. Les intercalaires restent décoratifs et volontairement rares.

Les Perles de Chemin sont libres : une même pierre peut être répétée autant de fois que souhaité, dans la limite physique du bracelet. Les parcours « Commencer simplement », « Mon histoire a déjà commencé » et « Composer librement » guident l'expérience sans créer de plafond commercial artificiel.


## Correctif UX v5
- Régénération des 18 visuels de pierres depuis une nouvelle grille cohérente.
- Fermoir du configurateur simplifié en pastille métallique discrète placée en bas du bracelet.
- Choix de perles Socles / Origine re-rendu en vraie grille responsive.
- Composition libre : réordonnancement des Perles de Chemin via flèches gauche / droite.
- Cartes de gamme du configurateur remplacées par de vrais packshots fixes.


## Correctif configurateur UX v6
- Estimation de perles réalignée sur des pierres de 8 mm (18 / 20 / 22 / 24).
- Fermoir rendu comme un rond de métal lisible, placé en bas du bracelet.
- Vignettes de perles recentrées et repaddées.
- Grille de choix des perles corrigée en mobile (1 colonne pour éviter la casse responsive).


## UX v7 & fidélisation
- Assets de perles recadrés à partir des sphères photoréalistes sans transparence parasite.
- 20 perles de 8 mm pour 16–17 cm, anneau rendu plus jointif.
- Fermoir rond métallique placé en bas + légende discrète « Fermoir ouvrable ».
- Composition libre : drag & drop desktop + flèches de réordonnancement mobile.
- Nouvelles pages : Faire évoluer, Perles de Chemin, Offrir.
- Aucun prix, taux de conversion ou projection financière non validé n’est publié.


## Correctif UX v8
- 16–17 cm réaligné sur 16 perles maximum.
- Fermoir intégré en bas du bracelet, sans légende.
- Suppression du mode d’agrandissement instable sur mobile.
- Carte récapitulative compacte et responsive.
- Grilles de choix des pierres corrigées pour mobile.
