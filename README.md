# VELUME — version test (hébergement Vercel)

Application web de gestion pour un café et ses studios (caisse, cuisine, facturation, planning, employés, droits d'accès).
C'est une application statique : un seul fichier `index.html`, aucun serveur à installer.

## Mettre en ligne sur Vercel (méthode GitHub, recommandée)

1. Créez un dépôt GitHub (privé) et envoyez-y le contenu de ce dossier (`index.html`, `vercel.json`, `sw.js`, `manifest.webmanifest`, `icons/`).
2. Sur vercel.com : **Add New → Project**, choisissez le dépôt.
3. *Framework Preset* : **Other**. Laissez *Build Command* et *Output Directory* vides. Cliquez **Deploy**.
4. Vous obtenez une adresse `https://votre-projet.vercel.app`. Chaque envoi sur GitHub redéploie automatiquement.

## Méthode ligne de commande

```bash
npm i -g vercel
cd velume-vercel
vercel          # première mise en ligne (aperçu)
vercel --prod   # mise en ligne définitive
```

## Installer sur tablette / téléphone / ordinateur

Ouvrez l'adresse dans Chrome ou Safari, puis **Ajouter à l'écran d'accueil** (ou **Installer l'application** dans Chrome). VELUME s'ouvre alors en plein écran, et l'interface fonctionne même sans Internet.

## Ce que fait cette version test

- Toutes les données sont enregistrées **dans le navigateur de chaque appareil** (pas encore de base partagée).
- Les comptes et les rôles existent, mais ne sont **pas sécurisés** : à utiliser pour tester, pas pour des données réelles.
- Connexion Google / Outlook / Apple : l'adresse n'est pas vérifiée (voir phase serveur).
- Exports CSV et sauvegarde JSON : téléchargement réel hors de Claude.
- Pour effacer et recommencer : Paramètres › Données › Réinitialiser.

## Phase suivante (serveur)

1. Supabase : base de données, comptes, connexions Google / Microsoft / Apple, règles d'accès par rôle.
2. Synchronisation en direct entre caisse, cuisine, tablettes et bureau.
3. Mode hors connexion de la caisse avec rattrapage au retour du réseau.
4. Sauvegardes automatiques et journal des actions.

## Mettre à jour

Remplacez `index.html` par la nouvelle version et envoyez sur GitHub : Vercel redéploie. Changez `V='velume-shell-v1'` dans `sw.js` pour forcer le rafraîchissement du cache hors connexion.
