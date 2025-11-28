'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function PendingHacksPage() {
  const [hacks, setHacks] = useState<PendingHack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPendingHacks();
  }, []);

  const fetchPendingHacks = async () => {
    try {
      // Mock data - à remplacer par l'API GET /hacks/pending
      setTimeout(() => {
        const mockHacks: PendingHack[] = [
          {
            battle_hack_id: 1,
            battle_id: 42,
            hack: {
              code: 'F3Z4D2',
              type: 'Hexadécimal',
              difficulty: 'Facile',
              description: 'Convertir le code hexadécimal en texte lisible',
            },
            probability: 15,
            created_at: new Date().toISOString(),
          },
          {
            battle_hack_id: 2,
            battle_id: 45,
            hack: {
              code: 'GRX-7TH9',
              type: 'Substitution César',
              difficulty: 'Moyenne',
              description: 'Appliquer un décalage de 4 lettres',
            },
            probability: 20,
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            battle_hack_id: 3,
            battle_id: 48,
            hack: {
              code: 'tEmP-100',
              type: 'Base 64',
              difficulty: 'Très Difficile',
              description: 'Déchiffrer le code Base 64',
            },
            probability: 25,
            created_at: new Date(Date.now() - 7200000).toISOString(),
          },
        ];
        setHacks(mockHacks);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile':
        return 'bg-green-500';
      case 'Moyenne':
        return 'bg-yellow-500';
      case 'Difficile':
        return 'bg-orange-500';
      case 'Très Difficile':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">⚡ Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-2xl text-center">
          <p className="text-red-600 text-xl mb-4">❌ {error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🔓 Hacks en Attente
          </h1>
          <p className="text-white/90 text-lg">
            Résolvez les codes de décryptage pour récupérer vos équipes !
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8 justify-center">
          <Link
            href="/hacks/pending"
            className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold shadow-lg"
          >
            📋 En Attente
          </Link>
          <Link
            href="/hacks/stats"
            className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-colors"
          >
            📊 Statistiques
          </Link>
        </div>

        {/* Liste des hacks */}
        {hacks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Aucun hack en attente !
            </h2>
            <p className="text-gray-600 mb-6">
              Vous avez résolu tous vos hacks ou vous n'avez pas encore été hacké.
            </p>
            <Link
              href="/battle/new"
              className="inline-block bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold transition-colors"
            >
              ⚔️ Lancer un Combat
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {hacks.map((hack) => (
              <div
                key={hack.battle_hack_id}
                className="bg-white rounded-2xl shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 border-4 border-red-400"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      🔐 Code : {hack.hack.code}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      <strong>Type :</strong> {hack.hack.type}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <strong>Description :</strong> {hack.hack.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-4 py-2 rounded-lg text-white font-bold ${getDifficultyColor(
                        hack.hack.difficulty
                      )}`}
                    >
                      {hack.hack.difficulty}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      Probabilité : {hack.probability}%
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <p>Combat #{hack.battle_id}</p>
                      <p>Créé le {new Date(hack.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <Link
                      href={`/hacks/${hack.battle_hack_id}/solve`}
                      className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-colors"
                    >
                      🔓 Résoudre
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
