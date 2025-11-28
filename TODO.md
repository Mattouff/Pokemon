# 🎮 Pokémon Battle Arena - TODO Frontend

## ✅ Pages Complétées

- [x] **Page d'accueil** (`/`)  
  *Présentation du site avec design rétro Pokémon*

- [x] **Page 404** (`/not-found`)  
  *Page d'erreur avec pokéball animée*

- [x] **Page de connexion** (`/login`)  
  *Authentification avec pseudo/mot de passe*

- [x] **Page d'inscription** (`/register`)  
  *Création de compte avec username/email/password*

---

## 📋 Pages à Développer

### 🔐 **Authentification** (1 page)

- [ ] **Dashboard/Profil** → `/dashboard` ou `/profile`
  - Afficher les infos de l'utilisateur connecté
  - API: `GET /auth/me`
  - Boutons de déconnexion (`POST /auth/logout`, `/auth/logout-all`)

---

### 🎮 **Pokémon** (2 pages)

- [ ] **Liste des Pokémon** → `/pokemon`
  - Liste paginée avec recherche
  - API: `GET /pokemon?limit=20&offset=0`
  - Recherche: `GET /pokemon/search?name=pikachu`

- [ ] **Détail d'un Pokémon** → `/pokemon/[id]`
  - Stats, types, sprite, height, weight
  - API: `GET /pokemon/:id`

---

### 👥 **Équipes** (4 pages)

- [ ] **Mes équipes** → `/teams`
  - Liste de toutes mes équipes
  - API: `GET /teams`
  - Bouton pour créer une nouvelle équipe

- [ ] **Créer une équipe** → `/teams/new`
  - Formulaire de création d'équipe
  - API: `POST /teams` (body: `{ "name": "Team Électrique" }`)

- [ ] **Détail d'une équipe** → `/teams/[id]`
  - Voir les 6 Pokémon de l'équipe
  - Définir comme équipe active
  - API: `GET /teams/:id`, `PUT /teams/:id/active`

- [ ] **Modifier une équipe** → `/teams/[id]/edit`
  - Ajouter/retirer des Pokémon (max 6)
  - Changer le nom de l'équipe
  - API: `POST /teams/:id/pokemons`, `DELETE /teams/:id/pokemons/:pokemonId`, `PUT /teams/:id`

---

### 👫 **Amis** (3 pages)

- [ ] **Liste des amis** → `/friends`
  - Mes amis acceptés
  - API: `GET /friends`
  - Bouton pour supprimer un ami (`DELETE /friends/:id`)

- [ ] **Demandes d'ami** → `/friends/requests`
  - Demandes reçues en attente
  - API: `GET /friends/requests/pending`
  - Accepter: `PUT /friends/requests/:id/accept`
  - Refuser: `PUT /friends/requests/:id/reject`

- [ ] **Rechercher des amis** → `/friends/search`
  - Trouver d'autres utilisateurs
  - API: `GET /friends/search?q=ash`
  - Envoyer une demande: `POST /friends/requests` (body: `{ "friend_username": "gary_oak" }`)

---

### ⚔️ **Combats** (4 pages)

- [ ] **Lancer un combat** → `/battle/new`
  - Choisir un ami adversaire
  - Sélectionner une ville pour la météo
  - API: `POST /battles/ghost` (body: `{ "opponent_id": 2, "city": "Paris" }`)

- [ ] **Historique des combats** → `/battle/history`
  - Liste des combats passés
  - API: `GET /battles/history?limit=20`

- [ ] **Statistiques de combat** → `/battle/stats`
  - Victoires / Défaites / Matchs nuls
  - API: `GET /battles/stats`

- [ ] **Détail d'un combat** → `/battle/[id]`
  - Voir le déroulement tour par tour
  - Afficher les équipes et les Pokémon K.O.
  - Afficher le hack déclenché (si applicable)

---

### 🔒 **Hacks** (3 pages)

- [x] **Hacks en attente** → `/hacks/pending`
  - Mes hacks à résoudre
  - API: `GET /hacks/pending`

- [x] **Résoudre un hack** → `/hacks/[id]/solve`
  - Interface pour soumettre la réponse
  - Afficher le code, type, difficulté, description
  - API: `POST /hacks/submit` (body: `{ "battle_hack_id": 1, "answer": "FEED" }`)
  - Pénalités si échec selon difficulté

- [x] **Statistiques de hacks** → `/hacks/stats`
  - Mes stats de résolution
  - API: `GET /hacks/stats`

---

### 🌦️ **Météo** (optionnel)

- [ ] **Widget Météo**
  - Peut être intégré dans les pages de combat
  - Afficher les effets sur les types Pokémon
  - API: `GET /weather/current?city=Paris`
  - API: `GET /weather/effects?city=Paris`

---

## 📊 Résumé

- ✅ **Complétées:** 7 pages (+ 1 composant pop-up)
- 📋 **À faire:** 15 pages principales
- 🎯 **Total:** 22 pages

---

## 🔧 À prévoir également

- **Gestion d'état globale** pour l'authentification (Context API ou Zustand)
- **Composants réutilisables** (Navbar, Card Pokémon, etc.)
- **Protection des routes** (redirect si non authentifié)
- **Gestion des erreurs** et messages de validation
- **Système de notifications/toasts** avec style Pokémon