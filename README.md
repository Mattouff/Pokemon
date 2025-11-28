# Pokémon Battle Application

Application de combat Pokémon avec backend API et frontend Next.js.

## 🎮 Prérequis

- **Node.js**: Version 20.9.0 ou supérieure (requis pour Next.js 16)
  - **Version actuelle détectée**: 19.3.0 ⚠️
  - **Action requise**: Mettre à jour Node.js vers la version 20 LTS
- **Docker Desktop**: Pour PostgreSQL
- **npm**: Gestionnaire de paquets

### 📥 Mettre à jour Node.js

Vous pouvez mettre à jour Node.js avec :
```bash
# Avec nvm 
nvm install 20
nvm use 20
```

## 🚀 Démarrage

### Mode développement local (Recommandé)

```bash
./START.sh
# Choisir l'option 2
```

**Ce que cela lance :**
- PostgreSQL (dans Docker sur le port 5432)
- Backend API (Node.js sur le port 3001)
- Frontend Next.js (sur le port 3000) - **Nécessite Node.js ≥20.9.0**

**URLs :**
- Backend API: http://localhost:3001
- Frontend: http://localhost:3000 

### Mode production (Docker)

```bash
./START.sh
# Choisir l'option 1
```

Lance tous les services dans des conteneurs Docker.

## 🛑 Arrêt

```bash
./STOP.sh
```

Arrête tous les services (Docker + processus locaux).

## 📁 Structure

```
.
├── backend/          # API Node.js + TypeScript + Express
├── frontend/         # Application Next.js 16
├── docker-compose.yml
├── START.sh
└── STOP.sh
```

## 🔧 Développement

### Backend uniquement
```bash
cd backend
npm install
npm run dev
```

### Frontend uniquement
```bash
cd frontend
npm install
npm run dev
```

## 📝 Notes

- Le frontend Next.js 16, nécessite absolument Node.js ≥20.9.0
- Le backend fonctionne avec Node.js 19.3.0 mais une mise à jour est recommandée
- PostgreSQL est toujours lancé via Docker pour éviter les conflits de configuration
