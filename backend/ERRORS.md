# ⚠️ Gestion des erreurs - API Pokémon Battle

Ce document détaille tous les types d'erreurs retournées par l'API, leur format, et comment les gérer.

---

## 📋 Format des erreurs

Toutes les erreurs suivent le même format standardisé :

```json
{
  "success": false,
  "error": {
    "message": "Description de l'erreur",
    "code": "ERROR_CODE",
    "details": {} // Optionnel, détails supplémentaires
  }
}
```

---

## 🔴 Codes HTTP et erreurs

### 400 - Bad Request (Requête invalide)

#### Validation des données

**Erreur :**
```json
{
  "success": false,
  "error": {
    "message": "Erreur de validation",
    "code": "VALIDATION_ERROR",
    "details": {
      "issues": [
        {
          "field": "email",
          "message": "Format d'email invalide"
        },
        {
          "field": "password",
          "message": "Le mot de passe doit contenir au moins 8 caractères"
        }
      ]
    }
  }
}
```

**Cause :** Les données envoyées ne respectent pas les règles de validation.

**Solutions :**
- Vérifier le format des champs (email, password, etc.)
- Respecter les contraintes (longueur min/max, format, etc.)
- Consulter la documentation de l'endpoint

**Exemple :**
```javascript
// ❌ Mauvais
{
  "email": "not-an-email",
  "password": "123" // Trop court
}

// ✅ Bon
{
  "email": "ash@pokemon.com",
  "password": "Pikachu123!"
}
```

---

### 401 - Unauthorized (Non authentifié)

#### Token manquant

**Erreur :**
```json
{
  "success": false,
  "error": {
    "message": "Token d'authentification manquant",
    "code": "UNAUTHORIZED"
  }
}
```

**Cause :** Aucun token JWT fourni dans les headers.

**Solution :**
```javascript
// Ajouter le header Authorization
headers: {
  'Authorization': 'Bearer <access_token>'
}
```

#### Token invalide ou expiré

**Erreur :**
```json
{
  "success": false,
  "error": {
    "message": "Token invalide ou expiré",
    "code": "INVALID_TOKEN"
  }
}
```

**Cause :** Le token JWT est malformé, invalide ou expiré.

**Solutions :**
1. Rafraîchir le token avec le refresh token
2. Reconnecter l'utilisateur

**Exemple :**
```javascript
// Rafraîchir le token
const refreshResponse = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refreshToken: localStorage.getItem('refreshToken')
  })
});

const { accessToken } = await refreshResponse.json();
localStorage.setItem('accessToken', accessToken);
```

#### Identifiants incorrects

**Erreur :**
```json
{
  "success": false,
  "error": {
    "message": "Nom d'utilisateur ou mot de passe incorrect",
    "code": "INVALID_CREDENTIALS"
  }
}
```

**Cause :** Username/password erronés lors du login.

---

### 403 - Forbidden (Accès interdit)

#### Compte inactif

**Erreur :**
```json
{
  "success": false,
  "error": {
    "message": "Votre compte est inactif",
    "code": "ACCOUNT_INACTIVE"
  }
}
```

**Cause :** Le compte utilisateur a été désactivé.

#### Permissions insuffisantes

**Erreur :**
```json
{
  "success": false,
  "error": {
    "message": "Permissions insuffisantes",
    "code": "FORBIDDEN"
  }
}
```

**Cause :** L'utilisateur n'a pas les droits pour cette action.

---

### 404 - Not Found (Ressource introuvable)

#### Ressource non trouvée

**Erreur :**
```json
{
  "success": false,
  "error": {
    "message": "Équipe introuvable",
    "code": "NOT_FOUND"
  }
}
```

**Causes possibles :**
- ID invalide
- Ressource supprimée
- Tentative d'accès à une ressource d'un autre utilisateur

**Exemples spécifiques :**

```json
// Pokémon introuvable dans PokéAPI
{
  "success": false,
  "error": {
    "message": "Pokémon avec l'ID 99999 introuvable",
    "code": "NOT_FOUND"
  }
}

// Ami introuvable
{
  "success": false,
  "error": {
    "message": "Utilisateur introuvable",
    "code": "NOT_FOUND"
  }
}

// Hack introuvable
{
  "success": false,
  "error": {
    "message": "Hack introuvable",
    "code": "NOT_FOUND"
  }
}
```

---

### 409 - Conflict (Conflit)

#### Utilisateur déjà existant

**Erreur :**
```json
{
  "success": false,
  "error": {
    "message": "Cet email est déjà utilisé",
    "code": "CONFLICT"
  }
}
```

**Ou :**
```json
{
  "success": false,
  "error": {
    "message": "Ce nom d'utilisateur est déjà pris",
    "code": "CONFLICT"
  }
}
```

#### Équipe pleine

**Erreur :**
```json
{
  "success": false,
  "error": {
    "message": "L'équipe est complète (6 Pokémon maximum)",
    "code": "CONFLICT"
  }
}
```

#### Pokémon déjà dans l'équipe

**Erreur :**
```json
{
  "success": false,
  "error": {
    "message": "Ce Pokémon est déjà dans l'équipe",
    "code": "CONFLICT"
  }
}
```

#### Position occupée

**Erreur :**
```json
{
  "success": false,
  "error": {
    "message": "La position 3 est déjà occupée",
    "code": "CONFLICT"
  }
}
```

#### Demande d'ami déjà existante

**Erreur :**
```json
{
  "success": false,
  "error": {
    "message": "Une demande d'ami est déjà en attente",
    "code": "CONFLICT"
  }
}
```

**Ou :**
```json
{
  "success": false,
  "error": {
    "message": "Vous êtes déjà amis",
    "code": "CONFLICT"
  }
}
```

---

### 429 - Too Many Requests (Trop de requêtes)

**Erreur :**
```json
{
  "success": false,
  "error": {
    "message": "Trop de requêtes. Veuillez réessayer dans 15 minutes.",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

**Cause :** Dépassement du rate limit (100 requêtes / 15 min).

**Solution :** Attendre avant de refaire des requêtes.

**Headers utiles :**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1699264800
```

---

### 500 - Internal Server Error (Erreur serveur)

**Erreur :**
```json
{
  "success": false,
  "error": {
    "message": "Une erreur interne est survenue",
    "code": "INTERNAL_ERROR"
  }
}
```

**Cause :** Erreur inattendue côté serveur.

**Solution :** Vérifier les logs serveur ou contacter l'administrateur.

---

## 🎯 Erreurs métier spécifiques

### Équipes

#### Équipe vide lors du combat
```json
{
  "success": false,
  "error": {
    "message": "Votre équipe est vide",
    "code": "VALIDATION_ERROR"
  }
}
```

#### Pas d'équipe active
```json
{
  "success": false,
  "error": {
    "message": "Vous devez avoir une équipe active pour combattre",
    "code": "VALIDATION_ERROR"
  }
}
```

### Amis

#### Auto-friend interdit
```json
{
  "success": false,
  "error": {
    "message": "Vous ne pouvez pas vous ajouter vous-même comme ami",
    "code": "VALIDATION_ERROR"
  }
}
```

#### Utilisateur bloqué
```json
{
  "success": false,
  "error": {
    "message": "Impossible d'ajouter cet utilisateur",
    "code": "CONFLICT"
  }
}
```

### Combats

#### Pas amis
```json
{
  "success": false,
  "error": {
    "message": "Vous devez être ami avec cet utilisateur pour le défier",
    "code": "VALIDATION_ERROR"
  }
}
```

#### Adversaire sans équipe
```json
{
  "success": false,
  "error": {
    "message": "Votre adversaire n'a pas d'équipe active",
    "code": "VALIDATION_ERROR"
  }
}
```

### Hacks

#### Hack déjà résolu
```json
{
  "success": false,
  "error": {
    "message": "Ce hack a déjà été résolu",
    "code": "NOT_FOUND"
  }
}
```

#### Réponse incorrecte (avec pénalité)
```json
{
  "success": true,
  "message": "Réponse incorrecte",
  "data": {
    "is_correct": false,
    "penalty": {
      "type": "attack_debuff",
      "value": 20
    }
  }
}
```

---

## 🛠️ Gestion des erreurs côté client

### TypeScript - Type des erreurs

```typescript
interface APIError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: {
      issues?: Array<{
        field: string;
        message: string;
      }>;
    };
  };
}

interface APISuccess<T> {
  success: true;
  data: T;
  message?: string;
}

type APIResponse<T> = APISuccess<T> | APIError;
```

### JavaScript - Gestion complète

```javascript
class APIClient {
  async request(url, options) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      // Gérer les erreurs HTTP
      if (!response.ok) {
        return this.handleError(response.status, data);
      }

      return data;
    } catch (error) {
      // Erreur réseau
      console.error('Erreur réseau:', error);
      throw new Error('Impossible de contacter le serveur');
    }
  }

  handleError(status, data) {
    const errorMessage = data.error?.message || 'Erreur inconnue';

    switch (status) {
      case 400:
        // Validation errors
        if (data.error?.details?.issues) {
          const issues = data.error.details.issues
            .map(i => `${i.field}: ${i.message}`)
            .join(', ');
          throw new Error(`Validation: ${issues}`);
        }
        throw new Error(errorMessage);

      case 401:
        // Token invalide - rafraîchir ou reconnecter
        this.handleUnauthorized();
        throw new Error('Session expirée');

      case 403:
        throw new Error('Accès interdit');

      case 404:
        throw new Error(errorMessage);

      case 409:
        throw new Error(errorMessage);

      case 429:
        throw new Error('Trop de requêtes. Réessayez plus tard.');

      case 500:
        throw new Error('Erreur serveur. Réessayez plus tard.');

      default:
        throw new Error(errorMessage);
    }
  }

  async handleUnauthorized() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      // Rediriger vers login
      window.location.href = '/login';
      return;
    }

    try {
      // Tenter de rafraîchir le token
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      localStorage.setItem('accessToken', data.data.accessToken);
    } catch (error) {
      // Refresh failed - logout
      localStorage.clear();
      window.location.href = '/login';
    }
  }
}
```

### React - Hook personnalisé

```javascript
import { useState } from 'react';

function useAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callAPI = async (url, options) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erreur API');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { callAPI, loading, error };
}

// Utilisation
function MyComponent() {
  const { callAPI, loading, error } = useAPI();

  const handleCreateTeam = async () => {
    try {
      const result = await callAPI('/api/teams', {
        method: 'POST',
        body: JSON.stringify({ name: 'Ma Team' }),
      });
      console.log('Succès:', result);
    } catch (err) {
      console.error('Erreur:', err.message);
    }
  };

  return (
    <div>
      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleCreateTeam}>Créer équipe</button>
    </div>
  );
}
```

---

## 📊 Résumé des codes d'erreur

| Code HTTP | Code Erreur           | Description                          |
|-----------|-----------------------|--------------------------------------|
| 400       | VALIDATION_ERROR      | Données invalides                    |
| 401       | UNAUTHORIZED          | Token manquant                       |
| 401       | INVALID_TOKEN         | Token invalide/expiré                |
| 401       | INVALID_CREDENTIALS   | Login/password incorrects            |
| 403       | FORBIDDEN             | Accès interdit                       |
| 403       | ACCOUNT_INACTIVE      | Compte désactivé                     |
| 404       | NOT_FOUND             | Ressource introuvable                |
| 409       | CONFLICT              | Conflit (doublon, contrainte, etc.)  |
| 429       | RATE_LIMIT_EXCEEDED   | Trop de requêtes                     |
| 500       | INTERNAL_ERROR        | Erreur serveur                       |

---

## ✅ Bonnes pratiques

1. **Toujours vérifier `response.ok`** avant de traiter les données
2. **Gérer les erreurs de validation** en affichant les messages par champ
3. **Rafraîchir automatiquement** les tokens expirés
4. **Logger les erreurs** pour le debugging
5. **Afficher des messages clairs** à l'utilisateur
6. **Retry avec backoff** pour les erreurs 500/503
7. **Respecter le rate limit** (vérifier les headers X-RateLimit-*)
