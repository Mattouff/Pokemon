'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

interface SubmitResult {
  is_correct: boolean;
  penalty?: {
    type: 'team_lost' | 'attack_debuff';
    value: number;
  };
}

export default function SolveHackPage() {
  const params = useParams();
  const hackId = params.id as string;
  const router = useRouter();

  const [hack, setHack] = useState<PendingHack | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    fetchHackDetails();
  }, [hackId]);

  const fetchHackDetails = async () => {
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
            created_at: new Date().toISOString(),
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
            created_at: new Date().toISOString(),
          },
        ];

        const foundHack = mockHacks.find(
          (h) => h.battle_hack_id === parseInt(hackId)
        );

        if (!foundHack) {
          setError('Hack non trouvé');
        } else {
          setHack(foundHack);
        }
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!answer.trim()) {
      setError('Veuillez entrer une réponse');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Mock data - à remplacer par l'API POST /hacks/submit
      setTimeout(() => {
        const correctAnswers: { [key: string]: string } = {
          'F3Z4D2': 'FEED',
          'GRX-7TH9': 'PAUSE',
          'a1b2c3': 'CATCH',
          'P@ss1234': 'OPEN',
          'tEmP-100': 'DEFEND',
        };

        const hackCode = hack?.hack.code || '';
        const correctAnswer = correctAnswers[hackCode];
        const isCorrect = answer.trim().toUpperCase() === correctAnswer;

        const mockResult: SubmitResult = {
          is_correct: isCorrect,
          penalty: isCorrect ? undefined : {
            type: hack?.hack.difficulty === 'Très Difficile' ? 'team_lost' : 'attack_debuff',
            value: hack?.hack.difficulty === 'Facile' ? 10 : 
                   hack?.hack.difficulty === 'Moyenne' ? 20 : 
                   hack?.hack.difficulty === 'Difficile' ? 30 : 0,
          },
        };

        setResult(mockResult);
        setSubmitting(false);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setSubmitting(false);
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

  if (error && !hack) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-2xl text-center">
          <p className="text-red-600 text-xl mb-4">❌ {error}</p>
          <Link
            href="/hacks/pending"
            className="inline-block bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retour aux Hacks
          </Link>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-2xl">
          {result.is_correct ? (
            <>
              <div className="text-8xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold text-green-600 mb-4">
                Hack Résolu !
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Bravo ! Vous avez déchiffré le code avec succès.
                <br />
                Votre équipe est maintenant sécurisée !
              </p>
            </>
          ) : (
            <>
              <div className="text-8xl mb-6">😔</div>
              <h2 className="text-4xl font-bold text-red-600 mb-4">
                Réponse Incorrecte
              </h2>
              <p className="text-xl text-gray-700 mb-4">
                Malheureusement, votre réponse n'est pas correcte.
              </p>
              {result.penalty && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-8">
                  <h3 className="text-2xl font-bold text-red-700 mb-2">
                    ⚠️ Pénalité Appliquée
                  </h3>
                  <p className="text-gray-700">
                    {result.penalty.type === 'team_lost'
                      ? `Vous avez perdu votre équipe !`
                      : `Malus d'attaque : -${result.penalty.value}%`}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex gap-4 justify-center">
            <Link
              href="/hacks/pending"
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold transition-colors"
            >
              📋 Voir les Hacks
            </Link>
            <Link
              href="/battle/history"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold transition-colors"
            >
              ⚔️ Historique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🔓 Résoudre le Hack
          </h1>
          <p className="text-white/90 text-lg">
            Déchiffrez le code pour récupérer votre équipe !
          </p>
        </div>

        {/* Hack Details */}
        {hack && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Combat #{hack.battle_id}
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <strong>Type :</strong> {hack.hack.type}
                  </p>
                  <p className="text-gray-600">
                    <strong>Probabilité :</strong> {hack.probability}%
                  </p>
                </div>
              </div>
              <span
                className={`px-6 py-3 rounded-lg text-white font-bold text-lg ${getDifficultyColor(
                  hack.hack.difficulty
                )}`}
              >
                {hack.hack.difficulty}
              </span>
            </div>

            {/* Code à déchiffrer */}
            <div className="bg-gray-900 text-green-400 p-8 rounded-lg mb-6 font-mono text-center border-4 border-gray-700">
              <p className="text-sm mb-2 text-gray-400">CODE CRYPTÉ</p>
              <p className="text-4xl font-bold tracking-wider">{hack.hack.code}</p>
            </div>

            {/* Description */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                💡 Indice
              </h3>
              <p className="text-gray-700">{hack.hack.description}</p>
            </div>

            {/* Formulaire de soumission */}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2 text-lg">
                  Votre Réponse :
                </label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Entrez votre solution..."
                  className="w-full px-6 py-4 border-4 border-gray-300 rounded-lg text-lg font-mono uppercase focus:outline-none focus:border-red-500 transition-colors"
                  disabled={submitting}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-lg mb-6">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting || !answer.trim()}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '⏳ Vérification...' : '✅ Soumettre'}
                </button>
                <Link
                  href="/hacks/pending"
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-colors text-center"
                >
                  ❌ Annuler
                </Link>
              </div>
            </form>

            {/* Warning */}
            <div className="mt-6 text-center text-sm text-gray-500">
              ⚠️ Attention : Une mauvaise réponse peut entraîner des pénalités !
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
