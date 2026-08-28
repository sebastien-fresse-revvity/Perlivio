# Perlivio — site vitrine et configurateur

Site statique multipage de présentation et de configuration des bracelets Perlivio.

## Fonctionnalités

- cinq collections : Essentiel, Métal, Inox, Argent et Signature ;
- catalogue de 18 pierres avec une fiche par pierre ;
- configurateur en sept étapes : collection, taille, Socle, Origine, parcours, Chemin et récapitulatif ;
- bracelet complet dès le premier jour, limité à 18 perles rondes de 8 mm maximum ;
- mode Socle uniforme ou alterné ;
- ajout, retrait et réorganisation des Perles de Chemin ;
- calcul de la Réserve à partir des Socles remplacées ;
- panier local persistant pour enregistrer plusieurs compositions ;
- navigation responsive, métadonnées SEO et assets 100 % locaux ;
- visuels cohérents avec le prototype physique : un bracelet par image et mécanisme argenté visible sur les vues produit non portées.

## Lancer le site localement

```bash
python -m http.server 8080
```

Puis ouvrir `http://localhost:8080/`. Aucun build n’est nécessaire.

## Valider avant publication

```bash
node --check assets/js/data.js
node --check assets/js/app.js
node scripts/validate-site.mjs
bash -n scripts/build-packshots.sh
```

Les cinq packshots peuvent être reconstruits de façon déterministe avec
`./scripts/build-packshots.sh` lorsque les assets de perles ou de fermoir changent.

## Avant l’ouverture commerciale

Le paiement reste volontairement désactivé tant que les informations suivantes ne sont pas validées :

1. prix TTC et options de chaque collection ;
2. identifiants produits et variantes de la plateforme e-commerce ;
3. entité juridique, coordonnées, CGV, confidentialité et médiateur ;
4. délais réels de fabrication et de livraison ;
5. matière, tolérances et essais du fermoir représenté d’après le prototype fourni ;
6. justificatifs matière pour toute revendication telle que « inox 316L » ou « argent 925 » ;
7. photographies de production si elles diffèrent des visuels de présentation.

Les références de commerce pourront être renseignées dans `assets/js/data.js` une fois validées.
