# 🔒 Système de Hacks - Documentation

## Vue d'ensemble

Le système de hacks ajoute une dimension stratégique aux combats Pokémon. Lorsqu'une équipe attaque, il existe une probabilité de se faire hacker, augmentée par les Pokémon affectés négativement par la météo.

## 📊 Probabilité de Hack

- **Base** : 10%
- **Augmentation** : +5% par Pokémon affecté négativement par la météo (les deux équipes)
- **Exemple** : 3 Pokémon Feu sous la pluie = 10% + (3 × 5%) = 25%

## 🎯 Types de Hacks

### 1. Hexadécimal (Facile)
- **Code** : F3Z4D2
- **Solution** : FEED
- **Description** : Convertir le code hexadécimal en texte

### 2. Substitution César (Moyen)
- **Code** : GRX-7TH9
- **Solution** : PAUSE
- **Description** : Appliquer un décalage de 4 lettres

### 3. Alphanumérique (Moyen)
- **Code** : a1b2c3
- **Solution** : CATCH
- **Description** : Extraire uniquement les lettres

### 4. Chiffres simples (Difficile)
- **Code** : P@ss1234
- **Solution** : OPEN
- **Description** : Ignorer les symboles et chiffres

### 5. Base 64 (Très Difficile)
- **Code** : tEmP-100
- **Solution** : DEFEND
- **Description** : Déchiffrer le code Base 64

## 💻 Utilisation Frontend

### Pages disponibles

#### 1. `/hacks/pending` - Hacks en attente
Liste tous les hacks non résolus de l'utilisateur avec :
- Code crypté
- Type de hack
- Difficulté
- Probabilité
- Bouton pour résoudre

#### 2. `/hacks/[id]/solve` - Résoudre un hack
Interface de résolution avec :
- Affichage du code crypté
- Input pour la réponse
- Validation de la solution
- Affichage des pénalités en cas d'échec

#### 3. `/hacks/stats` - Statistiques
Vue d'ensemble des performances :
- Nombre total de hacks
- Hacks résolus/échoués
- Taux de réussite global
- Statistiques par difficulté

### Composant HackPopup

Pour intégrer le système de hacks dans une page de combat :

```tsx
import HackPopup from '@/components/HackPopup';

function BattlePage() {
  const [isHackPopupOpen, setIsHackPopupOpen] = useState(false);
  const [pendingHacksCount, setPendingHacksCount] = useState(0);

  // Récupérer le nombre de hacks en attente
  const fetchPendingHacksCount = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/hacks/pending', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setPendingHacksCount(data.data?.length || 0);
  };

  useEffect(() => {
    fetchPendingHacksCount();
  }, []);

  return (
    <>
      <button onClick={() => setIsHackPopupOpen(true)}>
        HACK {pendingHacksCount > 0 && `(${pendingHacksCount})`}
      </button>

      <HackPopup 
        isOpen={isHackPopupOpen}
        onClose={() => setIsHackPopupOpen(false)}
        onHackResolved={fetchPendingHacksCount}
      />
    </>
  );
}
```

## 🔌 API Endpoints

### GET `/hacks/pending`
Récupère tous les hacks non résolus de l'utilisateur.

**Headers** :
```
Authorization: Bearer <token>
```

**Response** :
```json
{
  "success": true,
  "data": [
    {
      "battle_hack_id": 1,
      "battle_id": 42,
      "hack": {
        "code": "F3Z4D2",
        "type": "Hexadécimal",
        "difficulty": "Facile",
        "description": "Convertir en texte"
      },
      "probability": 15,
      "created_at": "2025-11-20T10:00:00Z"
    }
  ]
}
```

### POST `/hacks/submit`
Soumet une réponse à un hack.

**Headers** :
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** :
```json
{
  "battle_hack_id": 1,
  "answer": "FEED"
}
```

**Response** :
```json
{
  "success": true,
  "message": "Hack résolu avec succès !",
  "data": {
    "is_correct": true
  }
}
```

**Response (échec)** :
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

### GET `/hacks/stats`
Récupère les statistiques de l'utilisateur.

**Response** :
```json
{
  "success": true,
  "data": {
    "total_hacks": 10,
    "solved_hacks": 7,
    "failed_hacks": 3,
    "success_rate": 70.0,
    "stats_by_difficulty": [
      {
        "difficulty": "Facile",
        "total": 3,
        "solved": 3,
        "failed": 0,
        "success_rate": 100.0
      }
    ]
  }
}
```

## ⚠️ Pénalités

Les pénalités varient selon la difficulté :

| Difficulté | Pénalité |
|------------|----------|
| Facile | -10% d'attaque |
| Moyenne | -20% d'attaque |
| Difficile | -30% d'attaque |
| Très Difficile | Perte de l'équipe |

## 🎨 Design

Le système utilise le design rétro Pokémon avec :
- **Couleurs** : Rouge/Violet pour les hacks
- **Typographie** : Police pixel art
- **Animations** : Transitions fluides
- **Style terminal** : Pour l'affichage des codes cryptés

## 📝 Notes d'implémentation

1. **Sécurité** : Les solutions ne sont jamais exposées côté client
2. **Validation** : Les réponses sont converties en majuscules
3. **UX** : Pop-up non-bloquante pour ne pas interrompre le combat
4. **Temps réel** : Compteur de hacks mis à jour dynamiquement
5. **Accessibilité** : Focus automatique sur l'input de réponse

## 🚀 Prochaines améliorations possibles

- [ ] Timer pour résoudre les hacks (bonus si rapide)
- [ ] Hints progressifs après plusieurs échecs
- [ ] Système de streak pour réussites consécutives
- [ ] Leaderboard des meilleurs "hackers"
- [ ] Nouveaux types de cryptage
- [ ] Mode entraînement pour pratiquer
- [ ] Animations de succès/échec plus élaborées
