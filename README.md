# BILOKO NA BISO — Le savoir-faire congolais, à portée du monde

**Biloko Na Biso** est une plateforme numérique professionnelle de promotion et de valorisation des produits locaux de la République Démocratique du Congo (RDC).

> **« Biloko Na Biso est un produit de Little Giants. »**  
> Site officiel : [https://littlegiantrdc.netlify.app/](https://littlegiantrdc.netlify.app/)  
> E-mail officiel : [littlegiantrdc@gmail.com](mailto:littlegiantrdc@gmail.com)  
> WhatsApp : [+243 858 960 478](https://wa.me/243858960478)

---

## 1. Fonctionnalités Réalisées

1. **Catalogue complet et filtrage multi-critères** :
   - Filtre par catégorie (13 filières officielles : agriculture, café/cacao, agroalimentaire, cosmétiques, artisanat Kuba, etc.).
   - Filtre par province d'origine (les 26 provinces de la RDC).
   - Filtre par disponibilité (en stock, sur commande, saisonnier).
   - Filtre vente en gros (B2B) vs détail.
   - Tri par nouveauté, popularité (vues réelles), notes et prix.
   - Gestion stricte des prix : si non renseigné, affichage de *« Contacter le producteur pour le prix »*, jamais 0.

2. **Fiches Produits et Profils Producteurs Détaillés** :
   - Fiche produit avec galerie photo, provenance précise (ville/territoire, province), matières premières, processus de transformation, certifications.
   - Profil public de l'entreprise avec histoire, valeurs, méthodes artisanales, coordonnées et géolocalisation.
   - Boutons d'action directe : *« Contacter le producteur / Demander un devis »* (formulaire sécurisé) et *« Contacter sur WhatsApp »* avec lien international pré-rempli.

3. **Authentification & Gestion des Rôles** :
   - Inscription et connexion Visiteur / Membre.
   - Inscription Producteur avec informations d'entreprise et engagement sur l'honneur.
   - Hachage cryptographique sécurisé (Scrypt natif NIST avec sel aléatoire).
   - Sessions persistantes avec jetons cryptographiques.
   - Réinitialisation de mot de passe sécurisée.

4. **Espace Privé du Producteur** :
   - Tableau de bord avec métriques réelles (vues des produits, demandes reçues, favoris).
   - Gestionnaire de catalogue (ajouter, modifier, supprimer, statut brouillon ou publié).
   - Boîte de réception des demandes de contact avec statuts (nouveau, lu, en cours, clôturé).
   - Procédure de demande de badge « Producteur Vérifié » avec soumission de justificatifs légaux.

5. **Panneau d'Administration & Modération** :
   - Tableau de bord de gouvernance avec statistiques réelles issues de la base SQLite.
   - Attribution/retrait documenté du badge de vérification avec motif d'audit.
   - Modération des produits (validation, mise à la une, rejet motivé).
   - Modération des avis signalés et gestion des utilisateurs.
   - Journal d'audit complet de toutes les actions administratives sensibles.

6. **Magazine « Histoires & Savoir-Faire »** :
   - Reportages éditoriaux sur les terroirs du Kivu, les chocolatiers de Kisangani et les maîtres tisserands de raphia Kuba du Kasaï.

---

## 2. Architecture Technique

- **Frontend** : React 19 + TypeScript + Vite + Tailwind CSS.
- **Backend** : Node.js + Express avec serveur full-stack intégré sur le port 3000.
- **Base de données** : SQLite persistant (`node:sqlite`) situé dans `./data/biloko.db` avec transactions ACID et clés étrangères.
- **Sécurité** : Hachage `scrypt`, contrôle d'accès RBAC côté serveur, validation stricte des formulaires.

---

## 3. Lancement Local

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement full-stack
npm run dev

# Exécution des tests unitaires
npx --yes tsx --test src/utils/rules.test.ts

# Compilation de production
npm run build
```

---

## 4. Comptes de Démonstration (pour évaluation immédiate)

- **Administrateur** : `admin@bilokonabiso.cd` / `BilokoRDC2026!`
- **Producteur (Kivu Café)** : `contact@coopackivu.cd` / `Producer2026!`
- **Producteur (Chocolat Lowa)** : `info@chocolatlowa.cd` / `Producer2026!`
