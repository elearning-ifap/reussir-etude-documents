# Site IFAP — Réussir l’étude de documents

Site statique autonome, sans dépendance externe.

## Mise en ligne

Publier le contenu de ce dossier à la racine d’un hébergement statique (GitHub Pages, Netlify, serveur web institutionnel, etc.).
Le point d’entrée est `index.html`.

## Fichiers principaux

- `index.html` : module complet
- `assets/style.css` : design et responsive
- `assets/app.js` : interactions et mémorisation locale de la progression
- `ressources/methode_etude_documents.pdf` : fiche méthode téléchargeable
- `favicon.svg` : icône du site
- `site.webmanifest` : métadonnées d’installation

## Données

La progression et les réponses au mini-sujet sont enregistrées uniquement dans le stockage local du navigateur (`localStorage`). Aucune donnée n’est envoyée vers un serveur.