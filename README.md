# VELUME — version test (hébergement Vercel)

Application web de gestion pour un café et ses studios (caisse, cuisine, facturation, planning, employés, droits d'accès).
C'est une application statique : un seul fichier `index.html`, aucun serveur à installer.

## Contenu du dossier

- `index.html` : toute l'application (c'est le seul fichier qui change à chaque mise à jour).
- `manifest.webmanifest`, `sw.js`, `icon-*.png`, `apple-touch-icon.png` : installation sur l'écran d'accueil et mode hors connexion.
- `vercel.json` : réglages d'hébergement.
- `apps2.js`, `settings3.js`, `pro4.js` à `pro7.js` : copies lisibles des derniers modules (déjà inclus dans `index.html`, non chargés par le site).

## Mettre en ligne sur Vercel (méthode GitHub, recommandée)

1. Créez un dépôt GitHub (privé) et envoyez-y le contenu de ce dossier.
2. Sur vercel.com : **Add New → Project**, choisissez le dépôt.
3. *Framework Preset* : **Other**. Laissez *Build Command* et *Output Directory* vides. Cliquez **Deploy**.
4. Vous obtenez une adresse `https://votre-projet.vercel.app`. Chaque envoi sur GitHub redéploie automatiquement.

## Installer sur tablette / téléphone / ordinateur

Ouvrez l'adresse dans Chrome ou Safari, puis **Ajouter à l'écran d'accueil** (ou **Installer l'application** dans Chrome). VELUME s'ouvre alors en plein écran.

## Ce que fait cette version test

- Toutes les données sont enregistrées **dans le navigateur de chaque appareil** (pas encore de base partagée).
- Les comptes et les rôles existent, mais ne sont **pas sécurisés** : à utiliser pour tester, pas pour des données réelles.
- Bouton Google : l'adresse n'est pas vérifiée (la connexion en un clic demande la phase serveur).
- Exports CSV et sauvegarde JSON : téléchargement réel hors de Claude.
- Pour effacer et recommencer : Paramètres › Données › Réinitialiser.

## Phase suivante (serveur)

1. Supabase : base de données, comptes, connexion Google, règles d'accès par rôle.
2. Synchronisation en direct entre caisse, cuisine, tablettes et bureau.
3. Mode hors connexion de la caisse avec rattrapage au retour du réseau.
4. Sauvegardes automatiques et journal des actions.

## Mettre à jour

Remplacez `index.html` par la nouvelle version et envoyez sur GitHub : Vercel redéploie. Changez la version `V` dans `sw.js` pour forcer le rafraîchissement du cache hors connexion.
