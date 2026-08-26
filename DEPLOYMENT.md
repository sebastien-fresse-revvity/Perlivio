# Déploiement

Le site est statique et autonome.

## Prévisualisation locale

```bash
python -m http.server 8080
```

## Hébergement

Publier le contenu de ce dossier à la racine du domaine. Les URLs utilisent des chemins propres sous forme de dossiers (`/bracelets/`, `/composer/`, etc.).

## Passage en production commerciale

Avant d'activer un checkout :
- renseigner les informations vendeur et CGV définitives ;
- fixer les tarifs ;
- valider les matériaux et le fermoir ;
- créer les produits/variantes Shopify ;
- connecter chaque combinaison gamme/taille à son variant ;
- tester panier, taxes, livraison, paiement, e-mails et retours.
