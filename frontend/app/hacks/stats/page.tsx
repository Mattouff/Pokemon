'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HackStats {
  total_hacks: number;
  solved_hacks: number;
  failed_hacks: number;
  success_rate: number;
  stats_by_difficulty: {
    difficulty: string;
    total: number;
    solved: number;
    failed: number;
    success_rate: number;
  }[];
}

export default function HackStatsPage() {
  const [stats, setStats] = useState<HackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Mock data - à remplacer par l'API GET /hacks/stats
      setTimeout(() => {
        const mockStats: HackStats = {
          total_hacks: 15,
          solved_hacks: 11,
          failed_hacks: 4,
          success_rate: 73.3,
          stats_by_difficulty: [
            {
              difficulty: 'Facile',
              total: 5,
              solved: 5,
              failed: 0,
              success_rate: 100.0,
            },
            {
              difficulty: 'Moyenne',
              total: 6,
              solved: 4,
              failed: 2,
              success_rate: 66.7,
            },
            {
              difficulty: 'Difficile',
              total: 3,
              solved: 2,
              failed: 1,
              success_rate: 66.7,
            },
            {
              difficulty: 'Très Difficile',
              total: 1,
              solved: 0,
              failed: 1,
              success_rate: 0.0,
            },
          ],
        };
        setStats(mockStats);
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

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 75) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    if (rate >= 25) return 'text-orange-600';
    return 'text-red-600';
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
            📊 Statistiques de Hacks
          </h1>
          <p className="text-white/90 text-lg">
            Suivez vos performances de déchiffrage de codes
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8 justify-center">
          <Link
            href="/hacks/pending"
            className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-colors"
          >
            📋 En Attente
          </Link>
          <Link
            href="/hacks/stats"
            className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold shadow-lg"
          >
            📊 Statistiques
          </Link>
        </div>

        {stats && (
          <>
            {/* Statistiques Globales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-2xl p-6 text-center border-4 border-blue-400">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-gray-600 mb-2">Total</p>
                <p className="text-4xl font-bold text-blue-600">{stats.total_hacks}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl p-6 text-center border-4 border-green-400">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-gray-600 mb-2">Résolus</p>
                <p className="text-4xl font-bold text-green-600">{stats.solved_hacks}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl p-6 text-center border-4 border-red-400">
                <div className="text-4xl mb-2">❌</div>
                <p className="text-gray-600 mb-2">Échoués</p>
                <p className="text-4xl font-bold text-red-600">{stats.failed_hacks}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl p-6 text-center border-4 border-yellow-400">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-gray-600 mb-2">Taux de Réussite</p>
                <p className={`text-4xl font-bold ${getSuccessRateColor(stats.success_rate)}`}>
                  {stats.success_rate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Progression visuelle */}
            {stats.total_hacks > 0 && (
              <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  📊 Progression Globale
                </h2>
                <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                    style={{ width: `${(stats.solved_hacks / stats.total_hacks) * 100}%` }}
                  ></div>
                  <div
                    className="absolute top-0 bg-gradient-to-r from-red-400 to-red-600 h-full transition-all duration-500"
                    style={{
                      left: `${(stats.solved_hacks / stats.total_hacks) * 100}%`,
                      width: `${(stats.failed_hacks / stats.total_hacks) * 100}%`,
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg drop-shadow-lg">
                      {stats.solved_hacks} / {stats.total_hacks} Hacks Résolus
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Statistiques par Difficulté */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                🎯 Statistiques par Difficulté
              </h2>

              {stats.stats_by_difficulty.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-xl">Aucune statistique disponible pour le moment</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {stats.stats_by_difficulty.map((difficultyStat) => (
                    <div
                      key={difficultyStat.difficulty}
                      className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <span
                            className={`px-4 py-2 rounded-lg text-white font-bold ${getDifficultyColor(
                              difficultyStat.difficulty
                            )}`}
                          >
                            {difficultyStat.difficulty}
                          </span>
                          <div className="text-gray-600">
                            <span className="font-bold text-2xl text-gray-800">
                              {difficultyStat.total}
                            </span>{' '}
                            hack(s)
                          </div>
                        </div>
                        <div className={`text-3xl font-bold ${getSuccessRateColor(difficultyStat.success_rate)}`}>
                          {difficultyStat.success_rate.toFixed(1)}%
                        </div>
                      </div>

                      {/* Barre de progression par difficulté */}
                      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-600"
                          style={{
                            width: `${(difficultyStat.solved / difficultyStat.total) * 100}%`,
                          }}
                        ></div>
                        <div
                          className="absolute top-0 bg-gradient-to-r from-red-400 to-red-600 h-full"
                          style={{
                            left: `${(difficultyStat.solved / difficultyStat.total) * 100}%`,
                            width: `${(difficultyStat.failed / difficultyStat.total) * 100}%`,
                          }}
                        ></div>
                      </div>

                      {/* Détails */}
                      <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-green-600 text-sm font-semibold">Résolus</p>
                          <p className="text-2xl font-bold text-green-700">
                            {difficultyStat.solved}
                          </p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-red-600 text-sm font-semibold">Échoués</p>
                          <p className="text-2xl font-bold text-red-700">
                            {difficultyStat.failed}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 text-center">
              <Link
                href="/hacks/pending"
                className="inline-block bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-colors"
              >
                🔓 Résoudre des Hacks
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
