# 📘 Exemples d'utilisation - API Pokémon Battle

Ce document contient des exemples pratiques d'utilisation de l'API avec `curl`, JavaScript (Fetch), et des scénarios complets.

---

## 🔐 Authentification

### Inscription d'un nouvel utilisateur

#### cURL
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ash_ketchum",
    "email": "ash@pokemon.com",
    "password": "Pikachu123!"
  }'
```

#### JavaScript (Fetch)
```javascript
const response = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'ash_ketchum',
    email: 'ash@pokemon.com',
    password: 'Pikachu123!',
  }),
});

const data = await response.json();
const { accessToken, refreshToken } = data.data.tokens;

// Sauvegarder les tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

### Connexion

#### cURL
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ash_ketchum",
    "password": "Pikachu123!"
  }'
```

### Rafraîchir le token

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Obtenir mon profil

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

---

## Gestion des Pokémon

### Rechercher Pikachu

```bash
curl -X GET "http://localhost:3001/api/pokemon/search?name=pikachu"
```

### Obtenir les détails de Charizard (ID 6)

```bash
curl -X GET http://localhost:3001/api/pokemon/6
```

### Liste paginée (20 premiers Pokémon)

```bash
curl -X GET "http://localhost:3001/api/pokemon?limit=20&offset=0"
```

---

## Création d'équipe complète

### 1. Créer une équipe

```bash
curl -X POST http://localhost:3001/api/teams \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Team Électrique"
  }'
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Team Électrique",
    "pokemons": []
  }
}
```

### 2. Ajouter Pikachu (ID 25)

```bash
curl -X POST http://localhost:3001/api/teams/1/pokemons \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "pokemon_id": 25,
    "position": 1,
    "nickname": "Pika"
  }'
```

### 3. Ajouter 5 autres Pokémon

```bash
# Raichu (ID 26)
curl -X POST http://localhost:3001/api/teams/1/pokemons \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"pokemon_id": 26, "position": 2}'

# Magneton (ID 82)
curl -X POST http://localhost:3001/api/teams/1/pokemons \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"pokemon_id": 82, "position": 3}'

# Electabuzz (ID 125)
curl -X POST http://localhost:3001/api/teams/1/pokemons \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"pokemon_id": 125, "position": 4}'

# Jolteon (ID 135)
curl -X POST http://localhost:3001/api/teams/1/pokemons \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"pokemon_id": 135, "position": 5}'

# Zapdos (ID 145)
curl -X POST http://localhost:3001/api/teams/1/pokemons \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"pokemon_id": 145, "position": 6}'
```

### 4. Définir l'équipe comme active

```bash
curl -X PUT http://localhost:3001/api/teams/1/active \
  -H "Authorization: Bearer <access_token>"
```

### 5. Voir mon équipe

```bash
curl -X GET http://localhost:3001/api/teams/1 \
  -H "Authorization: Bearer <access_token>"
```

---

## Système d'amis

### 1. Rechercher un utilisateur

```bash
curl -X GET "http://localhost:3001/api/friends/search?q=gary" \
  -H "Authorization: Bearer <access_token>"
```

### 2. Envoyer une demande d'ami

```bash
curl -X POST http://localhost:3001/api/friends/requests \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "friend_username": "gary_oak"
  }'
```

### 3. Voir les demandes reçues

```bash
curl -X GET http://localhost:3001/api/friends/requests/pending \
  -H "Authorization: Bearer <access_token>"
```

### 4. Accepter une demande (ID 5)

```bash
curl -X PUT http://localhost:3001/api/friends/requests/5/accept \
  -H "Authorization: Bearer <access_token>"
```

### 5. Voir ma liste d'amis

```bash
curl -X GET http://localhost:3001/api/friends \
  -H "Authorization: Bearer <access_token>"
```

---

## Combat complet

### 1. Vérifier la météo à Paris

```bash
curl -X GET "http://localhost:3001/api/weather/current?city=Paris"
```

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

### 2. Voir les effets de la météo

```bash
curl -X GET "http://localhost:3001/api/weather/effects?city=Paris"
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "weather": {...},
    "effects": {
      "buffed_types": ["water"],
      "nerfed_types": ["fire"],
      "multiplier": 1.2
    }
  }
}
```

### 3. Lancer le combat

```bash
curl -X POST http://localhost:3001/api/battles/ghost \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "opponent_id": 2,
    "city": "Paris"
  }'
```

**Réponse avec hack déclenché :**
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
    "turns": [
      {
        "turn": 1,
        "attacker": {
          "pokemon": {
            "id": 25,
            "name": "pikachu",
            "types": ["electric"]
          },
          "hp": 35,
          "damage": 42,
          "isFainted": false
        },
        "defender": {
          "pokemon": {
            "id": 6,
            "name": "charizard",
            "types": ["fire", "flying"]
          },
          "hp": 36,
          "damage": 35,
          "isFainted": false
        },
        "weather": "🌧️ Pluie"
      }
    ],
    "hack": {
      "hack": {
        "code": "F3Z4D2",
        "type": "Hexadécimal",
        "difficulty": "Facile",
        "description": "Traduire le code hexadécimal en texte lisible"
      },
      "probability": 15
    }
  }
}
```

### 4. Résoudre le hack

```bash
curl -X POST http://localhost:3001/api/hacks/submit \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "battle_hack_id": 1,
    "answer": "FEED"
  }'
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

### 5. Voir mon historique de combats

```bash
curl -X GET http://localhost:3001/api/battles/history \
  -H "Authorization: Bearer <access_token>"
```

### 6. Voir mes statistiques

```bash
curl -X GET http://localhost:3001/api/battles/stats \
  -H "Authorization: Bearer <access_token>"
```

---

## Exemples de résolution de hacks

### Hack 1 : Hexadécimal (F3Z4D2 → FEED)
```
F = 15 (F en hexa)
3 = 3
Z = invalide (garder tel quel)
4 = 4
D = 13
2 = 2

Résultat : FEED
```

### Hack 2 : César +4 (GRX-7TH9 → PAUSE)
```
G - 4 = C (décalage de 4 lettres en arrière)
R - 4 = N
X - 4 = T
7 = 7 (garder)
T - 4 = P
H - 4 = D
9 = 9 (garder)

Solution simplifiée : PAUSE
```

### Hack 3 : Alphanumérique (a1b2c3 → CATCH)
```
Extraire uniquement les lettres :
a, b, c → abc

Convertir en majuscules et compléter :
CATCH
```

### Hack 4 : Chiffres (P@ss1234 → OPEN)
```
Retirer chiffres et symboles :
P, s, s → Pss

Solution : OPEN
```

### Hack 5 : Base64 (tEmP-100 → DEFEND)
```
Décoder Base64 :
tEmP-100 (encodé) → DEFEND (décodé)
```

---

## Scénario complet avec JavaScript

```javascript
class PokemonBattleClient {
  constructor(baseURL = 'http://localhost:3001/api') {
    this.baseURL = baseURL;
    this.accessToken = null;
  }

  async register(username, email, password) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    this.accessToken = data.data.tokens.accessToken;
    return data;
  }

  async createTeam(name) {
    const response = await fetch(`${this.baseURL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({ name }),
    });
    return response.json();
  }

  async addPokemon(teamId, pokemonId, position, nickname) {
    const response = await fetch(`${this.baseURL}/teams/${teamId}/pokemons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({ pokemon_id: pokemonId, position, nickname }),
    });
    return response.json();
  }

  async battle(opponentId, city = 'Paris') {
    const response = await fetch(`${this.baseURL}/battles/ghost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({ opponent_id: opponentId, city }),
    });
    return response.json();
  }

  async solveHack(battleHackId, answer) {
    const response = await fetch(`${this.baseURL}/hacks/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({ battle_hack_id: battleHackId, answer }),
    });
    return response.json();
  }
}

// Utilisation
const client = new PokemonBattleClient();

// S'inscrire
await client.register('ash', 'ash@pokemon.com', 'Pikachu123!');

// Créer une équipe
const team = await client.createTeam('Team Électrique');

// Ajouter Pikachu
await client.addPokemon(team.data.id, 25, 1, 'Pika');

// Combattre
const battle = await client.battle(2, 'Tokyo');

// Si un hack est déclenché
if (battle.data.hack) {
  const hackId = battle.data.hack.id;
  const solution = 'FEED'; // Résoudre le hack
  await client.solveHack(hackId, solution);
}
```

---

## Gestion des erreurs dans le client

```javascript
async function safeFetch(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      // Gérer les erreurs HTTP
      throw new Error(data.error?.message || 'Erreur inconnue');
    }

    return data;
  } catch (error) {
    console.error('Erreur API:', error.message);
    throw error;
  }
}

// Utilisation
try {
  const result = await safeFetch('http://localhost:3001/api/teams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ name: 'Ma Team' }),
  });
  console.log('Succès:', result);
} catch (error) {
  console.error('Échec:', error.message);
}
```
