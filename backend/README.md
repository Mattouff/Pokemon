# Pokémon Battle - Backend API

Backend de l'application Pokémon Battle développé avec TypeScript, Express et PostgreSQL.

## 🚀 Fonctionnalités de la Partie 1

✅ **Système d'authentification complet** :
- Inscription avec validation des données
- Connexion sécurisée
- JWT (Access Token + Refresh Token)
- Gestion des sessions
- Déconnexion simple et multi-appareils

✅ **Sécurité** :
- Hashage des mots de passe avec bcrypt
- Protection CSRF avec Helmet
- Rate limiting
- Validation des données avec Zod
- Gestion centralisée des erreurs

✅ **Code DRY et modulaire** :
- Architecture MVC
- Services réutilisables
- Middlewares centralisés
- Utilitaires factoriés

## 📦 Technologies

- **Runtime** : Node.js
- **Language** : TypeScript
- **Framework** : Express
- **Base de données** : PostgreSQL
- **Authentification** : JWT (jsonwebtoken)
- **Sécurité** : bcrypt, helmet, express-rate-limit
- **Validation** : Zod
- **Tests** : Jest, Supertest

## 🛠 Installation

### Prérequis

- Node.js (v18 ou supérieur)
- Docker et Docker Compose
- npm ou yarn

### Méthode 1 : Démarrage rapide avec Docker (recommandé) 🐳

**Option la plus simple** - Lance tout automatiquement (PostgreSQL + API) :

1. **Lancer l'application complète** :
```bash
./START.sh
# Choisir option 1 : Docker (full stack)
```

L'API sera accessible sur `http://localhost:3001`

La base de données PostgreSQL sera automatiquement créée et les migrations exécutées !

### Méthode 2 : Développement local avec PostgreSQL Docker

Si tu préfères développer en local avec hot-reload :

1. **Installer les dépendances** :
```bash
cd backend
npm install
```

2. **Configurer les variables d'environnement** :
```bash
cp .env.example .env
```

Éditer le fichier `.env` :
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=pokemon_battle
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production

POKEAPI_BASE_URL=https://pokeapi.co/api/v2
WEATHER_API_KEY=your_openweather_api_key
FRONTEND_URL=http://localhost:3000

PORT=3001
NODE_ENV=development
```

3. **Lancer PostgreSQL via Docker et l'API en local** :
```bash
./START.sh
```

Cela va :
- ✅ Démarrer PostgreSQL dans Docker (port 5432)
- ✅ Installer les dépendances npm
- ✅ Copier `.env.example` vers `.env` si nécessaire
- ✅ Exécuter les migrations automatiquement
- ✅ Lancer l'API en mode dev avec hot-reload

### Méthode 3 : Tout manuel (pour les experts)

1. **Lancer PostgreSQL** :
```bash
docker-compose up -d postgres
```

2. **Exécuter les migrations** :
```bash
cd backend
npm run migrate:up
```

3. **Démarrer l'API** :
```bash
npm run dev
```

Le serveur démarrera sur `http://localhost:3001`

### Arrêter l'application

```bash
./STOP.sh
```

## 📚 Structure du projet

```
backend/
├── src/
│   ├── config/           # Configuration (DB, env)
│   │   ├── database.ts
│   │   └── index.ts
│   ├── controllers/      # Contrôleurs Express
│   │   └── auth.controller.ts
│   ├── database/         # Migrations et DB
│   │   ├── migrations/
│   │   │   ├── 001_create_users_table.sql
│   │   │   └── 002_create_refresh_tokens_table.sql
│   │   └── migrate.ts
│   ├── middlewares/      # Middlewares réutilisables
│   │   ├── auth.middleware.ts
│   │   ├── authorization.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models/           # Modèles de données
│   │   ├── user.model.ts
│   │   └── refreshToken.model.ts
│   ├── routes/           # Routes API
│   │   ├── auth.routes.ts
│   │   └── index.ts
│   ├── services/         # Logique métier
│   │   └── auth.service.ts
│   ├── types/            # Types TypeScript
│   │   ├── auth.types.ts
│   │   └── errors.types.ts
│   ├── utils/            # Utilitaires
│   │   ├── jwt.utils.ts
│   │   ├── password.utils.ts
│   │   └── validation.utils.ts
│   ├── app.ts           # Configuration Express
│   └── index.ts         # Point d'entrée
├── tests/               # Tests unitaires
│   └── auth.test.ts
├── .env.example
├── .gitignore
├── jest.config.js
├── package.json
└── tsconfig.json
```

## 🔌 API Endpoints

### Authentification

#### Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Rafraîchir le token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Déconnexion
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Déconnexion de tous les appareils
```http
POST /api/auth/logout-all
Authorization: Bearer <access_token>
```

#### Obtenir le profil utilisateur
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

### Santé de l'API
```http
GET /api/health
```

## 🧪 Tests

Exécuter les tests :
```bash
npm test
```

Avec couverture :
```bash
npm test -- --coverage
```

## 🗄️ Base de données

### Schéma des tables

**Table `users`** :
- `id` : Serial Primary Key
- `username` : Varchar(50) Unique
- `email` : Varchar(255) Unique
- `password_hash` : Varchar(255)
- `role` : Varchar(20) (user/admin)
- `is_active` : Boolean
- `created_at` : Timestamp
- `updated_at` : Timestamp

**Table `refresh_tokens`** :
- `id` : Serial Primary Key
- `user_id` : Integer (FK vers users)
- `token` : Varchar(500) Unique
- `expires_at` : Timestamp
- `is_revoked` : Boolean
- `created_at` : Timestamp
- `revoked_at` : Timestamp

### Commandes de migration

Créer une nouvelle migration :
```bash
npm run migrate:create <nom_de_la_migration>
```

Exécuter les migrations :
```bash
npm run migrate:up
```

Annuler la dernière migration :
```bash
npm run migrate:down
```

## 🔐 Sécurité

- **Mots de passe** : Hashés avec bcrypt (10 rounds)
- **JWT** : Access token (1h) + Refresh token (7j)
- **Rate Limiting** : 100 requêtes / 15 minutes
- **Helmet** : Protection contre les vulnérabilités web courantes
- **CORS** : Configuré pour le frontend
- **Validation** : Toutes les entrées utilisateur sont validées

### Exigences du mot de passe
- Minimum 8 caractères
- Au moins une majuscule
- Au moins une minuscule
- Au moins un chiffre
- Au moins un caractère spécial

## 📝 Scripts disponibles

- `npm run dev` : Démarre le serveur en mode développement
- `npm run build` : Compile le TypeScript
- `npm start` : Démarre le serveur en production
- `npm test` : Exécute les tests
- `npm run migrate:up` : Exécute les migrations
- `npm run migrate:down` : Annule la dernière migration
- `npm run migrate:create <name>` : Crée une nouvelle migration

## 🚧 Prochaines étapes

- [x] ✅ Partie 1 : Système d'authentification complet
- [x] ✅ Partie 2 : Gestion des équipes Pokémon (6 max, intégration PokéAPI)
- [x] ✅ Partie 3 : Système de friendlist & combats fantômes
- [x] ✅ Partie 4 : Intégration météo (OpenWeather API)
- [x] ✅ Partie 5 : Système de combat tour par tour avancé
- [x] ✅ Partie 6 : Système de hack avec décryptage
- [x] ✅ Dockerisation complète de l'application
- [ ] Partie 7 : Frontend Next.js (en attente)

## 🐳 Docker

L'application est entièrement containerisée avec Docker Compose :

- **PostgreSQL 14** : Base de données (port 5432)
- **API Node.js** : Backend Express (port 3001)
- **Network isolé** : pokemon-network
- **Volume persistant** : postgres_data
- **Healthcheck** : L'API attend que PostgreSQL soit prêt
- **Auto-migration** : Les migrations s'exécutent automatiquement au démarrage

### Commandes Docker utiles

```bash
# Voir les logs
docker-compose logs -f api
docker-compose logs -f postgres

# Accéder à PostgreSQL
docker-compose exec postgres psql -U postgres -d pokemon_battle

# Redémarrer un service
docker-compose restart api

# Rebuild complet
docker-compose up --build

# Nettoyer tout
docker-compose down -v
```

## 📖 Documentation

Consulte les fichiers suivants pour plus d'informations :

- **[API.md](./API.md)** : Documentation complète de l'API avec tous les endpoints
- **[EXAMPLES.md](./EXAMPLES.md)** : Exemples d'utilisation avec curl, JavaScript, scénarios complets
- **[ERRORS.md](./ERRORS.md)** : Guide de gestion des erreurs et codes HTTP
- **[pokemon-api.postman_collection.json](./pokemon-api.postman_collection.json)** : Collection Postman avec 30+ requêtes prêtes à l'emploi

## 📄 License

ISC
