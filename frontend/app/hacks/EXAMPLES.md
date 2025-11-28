# 🔧 Exemples d'intégration du système de Hacks

## Exemple 1 : Intégration dans une Navbar

Afficher le nombre de hacks en attente dans la navigation globale.

```tsx
// components/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [pendingHacksCount, setPendingHacksCount] = useState(0);

  useEffect(() => {
    const fetchHacks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:3000/hacks/pending', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setPendingHacksCount(data.data?.length || 0);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchHacks();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchHacks, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-red-600 p-4">
      <div className="flex gap-4 items-center">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/hacks/pending" className="relative">
          🔒 Hacks
          {pendingHacksCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {pendingHacksCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
```

## Exemple 2 : Hook personnalisé pour les hacks

Créer un hook réutilisable pour gérer les hacks.

```tsx
// hooks/useHacks.ts
import { useState, useEffect, useCallback } from 'react';

interface PendingHack {
  battle_hack_id: number;
  battle_id: number;
  hack: {
    code: string;
    type: string;
    difficulty: string;
    description: string;
  };
  probability: number;
  created_at: string;
}

export function useHacks() {
  const [pendingHacks, setPendingHacks] = useState<PendingHack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingHacks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const response = await fetch('http://localhost:3000/hacks/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération');

      const data = await response.json();
      setPendingHacks(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitSolution = useCallback(async (battleHackId: number, answer: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const response = await fetch('http://localhost:3000/hacks/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          battle_hack_id: battleHackId,
          answer: answer.trim().toUpperCase(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Rafraîchir la liste après soumission
      await fetchPendingHacks();

      return data.data;
    } catch (err) {
      throw err;
    }
  }, [fetchPendingHacks]);

  useEffect(() => {
    fetchPendingHacks();
  }, [fetchPendingHacks]);

  return {
    pendingHacks,
    pendingCount: pendingHacks.length,
    loading,
    error,
    refresh: fetchPendingHacks,
    submitSolution,
  };
}

// Utilisation dans un composant
function MyComponent() {
  const { pendingHacks, pendingCount, loading, submitSolution } = useHacks();

  return (
    <div>
      <p>Hacks en attente : {pendingCount}</p>
      {loading ? 'Chargement...' : null}
    </div>
  );
}
```

## Exemple 3 : Badge de notification

Composant réutilisable pour afficher le nombre de hacks.

```tsx
// components/HackBadge.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HackBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:3000/hacks/pending', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCount(data.data?.length || 0);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchCount();
  }, []);

  if (count === 0) return null;

  return (
    <Link href="/hacks/pending">
      <div className="fixed bottom-4 right-4 bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl animate-bounce cursor-pointer hover:scale-110 transition-transform">
        <div className="text-center">
          <div className="text-2xl">🔒</div>
          <div className="text-xs font-bold">{count}</div>
        </div>
      </div>
    </Link>
  );
}
```

## Exemple 4 : Notification toast

Afficher une notification quand un nouveau hack apparaît.

```tsx
// components/HackNotification.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

export default function HackNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const previousCountRef = useRef<number>(0);

  useEffect(() => {
    const checkForNewHacks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:3000/hacks/pending', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const currentCount = data.data?.length || 0;

          // Si le nombre a augmenté, afficher la notification
          if (currentCount > previousCountRef.current && previousCountRef.current > 0) {
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 5000);
          }

          previousCountRef.current = currentCount;
        }
      } catch (error) {
        console.error(error);
      }
    };

    // Vérifier toutes les 10 secondes pendant un combat
    const interval = setInterval(checkForNewHacks, 10000);
    checkForNewHacks(); // Vérification initiale

    return () => clearInterval(interval);
  }, []);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-slideIn z-50">
      <div className="flex items-center gap-3">
        <div className="text-3xl">⚠️</div>
        <div>
          <p className="font-bold">HACK DÉTECTÉ !</p>
          <p className="text-sm">Votre équipe a été hackée</p>
        </div>
      </div>
    </div>
  );
}
```

## Exemple 5 : Dashboard avec widget de hacks

Intégrer les hacks dans le dashboard principal.

```tsx
// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/hacks/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setStats(data.data);
    };
    fetchStats();
  }, []);

  if (!stats) return <div>Chargement...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget Hacks */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-80">Hacks</p>
              <p className="text-4xl font-bold">{stats.total_hacks}</p>
            </div>
            <div className="text-4xl">🔒</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <p className="text-xs">Résolus</p>
              <p className="text-lg font-bold">{stats.solved_hacks}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <p className="text-xs">Taux</p>
              <p className="text-lg font-bold">{stats.success_rate.toFixed(0)}%</p>
            </div>
          </div>

          <Link 
            href="/hacks/pending"
            className="block w-full bg-white text-purple-600 text-center py-2 rounded-lg font-bold hover:bg-purple-50 transition-colors"
          >
            Voir les Hacks
          </Link>
        </div>

        {/* Autres widgets... */}
      </div>
    </div>
  );
}
```

## Exemple 6 : Context Provider global

Gérer l'état des hacks à l'échelle de l'application.

```tsx
// contexts/HackContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HackContextType {
  pendingCount: number;
  refreshPendingCount: () => Promise<void>;
}

const HackContext = createContext<HackContextType | undefined>(undefined);

export function HackProvider({ children }: { children: ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/hacks/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingCount(data.data?.length || 0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <HackContext.Provider value={{ pendingCount, refreshPendingCount }}>
      {children}
    </HackContext.Provider>
  );
}

export function useHackContext() {
  const context = useContext(HackContext);
  if (!context) {
    throw new Error('useHackContext must be used within HackProvider');
  }
  return context;
}

// Utilisation dans layout.tsx
import { HackProvider } from '@/contexts/HackContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <HackProvider>
          {children}
        </HackProvider>
      </body>
    </html>
  );
}

// Utilisation dans un composant
import { useHackContext } from '@/contexts/HackContext';

function MyComponent() {
  const { pendingCount } = useHackContext();
  return <div>Hacks: {pendingCount}</div>;
}
```

## 🎯 Bonnes pratiques

1. **Polling intelligent** : Augmenter la fréquence pendant les combats
2. **Cache** : Éviter les appels API redondants
3. **Optimistic updates** : Mettre à jour l'UI avant la confirmation
4. **Error handling** : Gérer les erreurs réseau gracieusement
5. **Accessibilité** : Annoncer les nouveaux hacks aux lecteurs d'écran
6. **Performance** : Utiliser React.memo pour les composants de notification
