# 📖 Documentation API - Pokémon Battle

## 🎯 Vue d'ensemble

L'API Pokémon Battle est une API RESTful qui permet de créer des combats Pokémon avec des fonctionnalités avancées :
- **Authentification JWT** avec refresh tokens
- **Système d'amis** avec demandes et statuts
- **Combats fantômes** tour par tour
- **Météo dynamique** influençant les combats
- **Système de hack** avec codes de décryptage
- **Intégration PokéAPI** pour les données Pokémon

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Frontend)                    │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/JSON
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   API REST (Express)                     │
│  ┌──────────┬──────────┬──────────┬──────────────────┐ │
│  │  Auth    │  Teams   │ Friends  │  Battles & Hacks │ │
│  └──────────┴──────────┴──────────┴──────────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   PostgreSQL      PokéAPI        OpenWeather
```

---

## Authentification

### Base URL
```
http://localhost:3001/api
```

### Endpoints d'authentification

#### **POST** `/auth/register`
Créer un nouveau compte utilisateur.

**Body :**
```json
{
  "username": "pikachu_trainer",
  "email": "pika@pokemon.com",
  "password": "P@ssw0rd123"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": 1,
      "username": "pikachu_trainer",
      "email": "pika@pokemon.com"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### **POST** `/auth/login`
Se connecter avec un compte existant.

**Body :**
```json
{
  "username": "pikachu_trainer",
  "password": "P@ssw0rd123"
}
```

#### **POST** `/auth/refresh`
Rafraîchir l'access token.

**Body :**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **GET** `/auth/me`
Obtenir les informations de l'utilisateur connecté.

**Headers :**
```
Authorization: Bearer <access_token>
```

#### **POST** `/auth/logout`
Se déconnecter (révoque le refresh token).

#### **POST** `/auth/logout-all`
Se déconnecter de tous les appareils.

---

## Pokémon

### **GET** `/pokemon`
Liste paginée des Pokémon disponibles.

**Query params :**
- `limit` : Nombre de résultats (défaut: 20)
- `offset` : Position de départ (défaut: 0)

**Exemple :**
```
GET /pokemon?limit=10&offset=0
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "count": 1302,
    "results": [
      { "name": "bulbasaur", "url": "https://pokeapi.co/api/v2/pokemon/1/" },
      { "name": "ivysaur", "url": "https://pokeapi.co/api/v2/pokemon/2/" }
    ]
  }
}
```

### **GET** `/pokemon/:id`
Obtenir les détails d'un Pokémon par son ID.

**Exemple :**
```
GET /pokemon/25
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "name": "pikachu",
    "types": ["electric"],
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    "stats": {
      "hp": 35,
      "attack": 55,
      "defense": 40,
      "specialAttack": 50,
      "specialDefense": 50,
      "speed": 90
    },
    "height": 4,
    "weight": 60
  }
}
```

### **GET** `/pokemon/search?name=pikachu`
Rechercher un Pokémon par nom.

---

## Équipes

### **POST** `/teams`
Créer une nouvelle équipe.

**Headers :**
```
Authorization: Bearer <access_token>
```

**Body :**
```json
{
  "name": "Team Électrique"
}
```

### **GET** `/teams`
Obtenir toutes mes équipes.

### **GET** `/teams/:id`
Obtenir les détails d'une équipe.

### **PUT** `/teams/:id`
Modifier le nom d'une équipe.

### **DELETE** `/teams/:id`
Supprimer une équipe.

### **POST** `/teams/:id/pokemons`
Ajouter un Pokémon à l'équipe.

**Body :**
```json
{
  "pokemon_id": 25,
  "position": 1,
  "nickname": "Pika"
}
```

**Contraintes :**
- Maximum 6 Pokémon par équipe
- Pas de doublons
- Position entre 1 et 6
- Le Pokémon doit exister dans PokéAPI

### **DELETE** `/teams/:id/pokemons/:pokemonId`
Retirer un Pokémon de l'équipe.

### **PUT** `/teams/:id/active`
Définir l'équipe comme active.

---

## Amis

### **POST** `/friends/requests`
Envoyer une demande d'ami.

**Body :**
```json
{
  "friend_username": "gary_oak"
}
```

### **GET** `/friends`
Obtenir la liste de mes amis acceptés.

### **GET** `/friends/requests/pending`
Obtenir les demandes d'ami reçues en attente.

### **PUT** `/friends/requests/:id/accept`
Accepter une demande d'ami.

### **PUT** `/friends/requests/:id/reject`
Refuser une demande d'ami.

### **DELETE** `/friends/:id`
Supprimer un ami.

### **GET** `/friends/search?q=ash`
Rechercher des utilisateurs.

---

## Combats

### **POST** `/battles/ghost`
Lancer un combat fantôme contre un ami.

**Body :**
```json
{
  "opponent_id": 2,
  "city": "Paris"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Combat terminé",
  "data": {
    "battle_id": 1,
    "winner": "you",
    "your_team": {
      "team_name": "Team Électrique",
      "pokemons_alive": 4,
      "pokemons_fainted": 2
    },
    "opponent_team": {
      "team_name": "Team Feu",
      "pokemons_alive": 2,
      "pokemons_fainted": 4
    },
    "turns": [...],
    "hack": {
      "hack": {
        "code": "F3Z4D2",
        "type": "Hexadécimal",
        "difficulty": "Facile",
        "description": "Traduire le code hexadécimal en texte lisible"
      },
      "probability": 25
    }
  }
}
```

**Système de hack :**
- Probabilité de base : 10%
- +5% par Pokémon affecté négativement par la météo
- Si déclenché, un code de décryptage doit être résolu

### **GET** `/battles/history?limit=20`
Obtenir l'historique des combats.

### **GET** `/battles/stats`
Obtenir les statistiques de combat.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "wins": 15,
    "losses": 8,
    "draws": 2
  }
}
```

---

## Hacks

### **GET** `/hacks`
Obtenir la liste de tous les hacks disponibles (sans solutions).

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "F3Z4D2",
      "type": "Hexadécimal",
      "difficulty": "Facile",
      "description": "Traduire le code hexadécimal en texte lisible"
    }
  ]
}
```

### **GET** `/hacks/pending`
Obtenir mes hacks en attente de résolution.

### **POST** `/hacks/submit`
Soumettre la solution d'un hack.

**Body :**
```json
{
  "battle_hack_id": 1,
  "answer": "FEED"
}
```

**Réponse (correcte) :**
```json
{
  "success": true,
  "message": "Hack résolu avec succès !",
  "data": {
    "is_correct": true
  }
}
```

**Réponse (incorrecte) :**
```json
{
  "success": true,
  "message": "Réponse incorrecte",
  "data": {
    "is_correct": false,
    "penalty": {
      "type": "attack_debuff",
      "value": 10
    }
  }
}
```

**Pénalités :**
- Facile : -10% attaque
- Moyenne : -20% attaque
- Difficile : -30% attaque
- Très Difficile : Perte de l'équipe

### **GET** `/hacks/stats`
Obtenir mes statistiques de résolution de hacks.

---

## Météo

### **GET** `/weather/current?city=Paris`
Obtenir la météo actuelle.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "condition": "rain",
    "temperature": 15,
    "description": "pluie modérée",
    "location": "Paris"
  }
}
```

### **GET** `/weather/effects?city=Paris`
Obtenir les effets de la météo sur les types Pokémon.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "weather": {
      "condition": "rain",
      "description": "pluie modérée",
      "temperature": 15,
      "location": "Paris"
    },
    "effects": {
      "buffed_types": ["water"],
      "nerfed_types": ["fire"],
      "multiplier": 1.2
    }
  }
}
```

**Effets météo :**
- **Pluie** : +20% Eau, -20% Feu
- **Soleil** : +20% Feu, -20% Glace
- **Neige** : +20% Glace, -20% Plante/Sol
- **Nuageux** : Aucun effet

---

## Health Check

### **GET** `/health`
Vérifier que l'API fonctionne.

**Réponse :**
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T10:30:00.000Z"
}
```

---

## Sécurité

### Headers requis pour les routes protégées

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Rate Limiting

- **100 requêtes par 15 minutes** par IP
- Header `X-RateLimit-Limit`: Limite totale
- Header `X-RateLimit-Remaining`: Requêtes restantes
- Header `X-RateLimit-Reset`: Timestamp de réinitialisation

---

## Flux de travail typique

1. **Inscription/Connexion**
   ```
   POST /auth/register → Obtenir tokens
   ```

2. **Créer une équipe**
   ```
   POST /teams → Créer équipe
   POST /teams/:id/pokemons → Ajouter 6 Pokémon
   PUT /teams/:id/active → Définir comme active
   ```

3. **Ajouter des amis**
   ```
   GET /friends/search?q=gary → Rechercher
   POST /friends/requests → Envoyer demande
   ```

4. **Combattre**
   ```
   POST /battles/ghost → Lancer combat
   Si hack → POST /hacks/submit → Résoudre
   ```

5. **Consulter stats**
   ```
   GET /battles/stats → Voir victoires/défaites
   GET /hacks/stats → Voir résolutions
   ```

---

## Technologies utilisées

- **Framework** : Express.js
- **Base de données** : PostgreSQL
- **ORM** : Raw SQL avec `pg`
- **Authentification** : JWT (jsonwebtoken)
- **Validation** : Zod
- **Sécurité** : Helmet, CORS, bcrypt, rate-limit
- **APIs externes** : PokéAPI, OpenWeather
- **Cache** : In-memory (1h TTL pour PokéAPI)

---

## Démarrage rapide

```bash
# Cloner le projet
git clone <repo>

# Lancer avec Docker
./START.sh
# Choisir option 1

# Ou en mode développement
./START.sh
# Choisir option 2
```

L'API sera accessible sur `http://localhost:3001/api`
