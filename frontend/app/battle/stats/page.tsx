'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PokemonHeader from '@/components/PokemonHeader';

type BattleStats = {
  total_battles: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  total_duration_seconds: number;
  average_duration_seconds: number;
  longest_battle_seconds: number;
  shortest_battle_seconds: number;
  most_used_team: {
    name: string;
    uses: number;
  };
  best_opponent: {
    username: string;
    wins_against: number;
  };
  worst_opponent: {
    username: string;
    losses_against: number;
  };
  pokemon_ko_stats: {
    pokemon_name: string;
    kos: number;
  }[];
  monthly_stats: {
    month: string;
    wins: number;
    losses: number;
    draws: number;
  }[];
};

export default function BattleStatsPage() {
  const [stats, setStats] = useState<BattleStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:3001/api/battles/stats', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Erreur:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds || isNaN(seconds)) {
      return '0m 0s';
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pokemon-bg flex items-center justify-center">
        <p className="pixel-text text-white text-xl">Chargement...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen pokemon-bg flex items-center justify-center">
        <p className="pixel-text text-white text-xl">Erreur de chargement</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pokemon-bg">
      <PokemonHeader 
        title="STATISTIQUES DE COMBAT"
        buttons={[
          { label: '← DASHBOARD', href: '/dashboard' },
          { label: 'HISTORIQUE', href: '/battle/history' },
          { label: 'NOUVEAU COMBAT', href: '/battle/new' }
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Global Stats */}
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
            width: '100%',
            marginBottom: '2rem'
          }}>
            <CardHeader className="pokemon-header px-6" style={{ borderRadius: '8px 8px 0 0' }}>
              <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>
                STATISTIQUES GÉNÉRALES
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '2rem',
                textAlign: 'center',
                marginLeft: '1rem',
                marginRight: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>COMBATS TOTAUX</p>
                  <p className="pixel-text text-2xl text-white mt-2">{stats.total_battles || 0}</p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#22C55E' }}>VICTOIRES</p>
                  <p className="pixel-text text-2xl mt-2" style={{ color: '#22C55E' }}>
                    {stats.wins}
                  </p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#DC2626' }}>DÉFAITES</p>
                  <p className="pixel-text text-2xl mt-2" style={{ color: '#DC2626' }}>
                    {stats.losses}
                  </p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>ÉGALITÉS</p>
                  <p className="pixel-text text-2xl text-white mt-2">{stats.draws}</p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>TAUX DE VICTOIRE</p>
                  <p className="pixel-text text-2xl text-white mt-2">{stats.win_rate ? stats.win_rate.toFixed(1) : '0.0'}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duration Stats */}
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
            width: '100%',
            marginBottom: '2rem'
          }}>
            <CardHeader className="pokemon-header px-6" style={{ borderRadius: '8px 8px 0 0' }}>
              <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>
                DURÉE DES COMBATS
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '2rem',
                textAlign: 'center',
                marginLeft: '1rem',
                marginRight: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>DURÉE TOTALE</p>
                  <p className="pixel-text text-lg text-white mt-2">
                    {formatDuration(stats.total_duration_seconds)}
                  </p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>DURÉE MOYENNE</p>
                  <p className="pixel-text text-lg text-white mt-2">
                    {formatDuration(stats.average_duration_seconds)}
                  </p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>PLUS LONG</p>
                  <p className="pixel-text text-lg text-white mt-2">
                    {formatDuration(stats.longest_battle_seconds)}
                  </p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>PLUS COURT</p>
                  <p className="pixel-text text-lg text-white mt-2">
                    {formatDuration(stats.shortest_battle_seconds)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            
            {/* Team & Opponent Stats */}
            <Card style={{
              background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
              border: '4px solid #000',
              borderRadius: '12px',
              boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
              height: '100%'
            }}>
              <CardHeader className="pokemon-header px-6" style={{ borderRadius: '8px 8px 0 0' }}>
                <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>
                  ÉQUIPE & ADVERSAIRES
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-6">
                <div style={{ 
                  marginLeft: '1rem', 
                  marginRight: '1rem',
                  marginBottom: '1rem'
                }}>
                  {!stats.most_used_team && !stats.best_opponent && !stats.worst_opponent ? (
                    <p className="pixel-text text-xs text-white text-center" style={{ opacity: 0.7 }}>
                      Aucune donnée disponible
                    </p>
                  ) : (
                    <>
                      {stats.most_used_team && (
                        <div style={{ marginBottom: '2rem' }}>
                          <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>
                            ÉQUIPE LA PLUS UTILISÉE
                          </p>
                          <p className="pixel-text text-sm text-white mt-2">
                            {stats.most_used_team.name}
                          </p>
                          <p className="pixel-text text-xs text-white mt-1" style={{ opacity: 0.7 }}>
                            {stats.most_used_team.uses} combats
                          </p>
                        </div>
                      )}

                      {stats.best_opponent && (
                        <div style={{ marginBottom: '2rem' }}>
                          <p className="pixel-text text-xs" style={{ color: '#22C55E' }}>
                            MEILLEUR ADVERSAIRE
                          </p>
                          <p className="pixel-text text-sm text-white mt-2">
                            {stats.best_opponent.username}
                          </p>
                          <p className="pixel-text text-xs mt-1" style={{ color: '#22C55E' }}>
                            {stats.best_opponent.wins_against} victoires
                          </p>
                        </div>
                      )}

                      {stats.worst_opponent && (
                        <div>
                          <p className="pixel-text text-xs" style={{ color: '#DC2626' }}>
                            PIRE ADVERSAIRE
                          </p>
                          <p className="pixel-text text-sm text-white mt-2">
                            {stats.worst_opponent.username}
                          </p>
                          <p className="pixel-text text-xs mt-1" style={{ color: '#DC2626' }}>
                            {stats.worst_opponent.losses_against} défaites
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top KO Pokemon */}
            <Card style={{
              background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
              border: '4px solid #000',
              borderRadius: '12px',
              boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
              height: '100%'
            }}>
              <CardHeader className="pokemon-header px-6" style={{ borderRadius: '8px 8px 0 0' }}>
                <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>
                  TOP 5 KO
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-6">
                <div style={{ 
                  marginLeft: '1rem', 
                  marginRight: '1rem',
                  marginBottom: '1rem'
                }}>
                  {stats.pokemon_ko_stats && stats.pokemon_ko_stats.length > 0 ? stats.pokemon_ko_stats.map((pokemon, index) => (
                    <div 
                      key={index}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: index < stats.pokemon_ko_stats.length - 1 ? '1.5rem' : '0',
                        paddingBottom: index < stats.pokemon_ko_stats.length - 1 ? '1rem' : '0',
                        borderBottom: index < stats.pokemon_ko_stats.length - 1 ? '2px solid rgba(255, 255, 255, 0.2)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          background: '#FACC15',
                          border: '2px solid #000',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span className="pixel-text text-xs" style={{ color: '#000' }}>
                            {index + 1}
                          </span>
                        </div>
                        <p className="pixel-text text-xs text-white">
                          {pokemon.pokemon_name.toUpperCase()}
                        </p>
                      </div>
                      <p className="pixel-text text-sm" style={{ color: '#22C55E' }}>
                        {pokemon.kos} KO
                      </p>
                    </div>
                  )) : (
                    <p className="pixel-text text-xs text-white text-center" style={{ opacity: 0.7 }}>
                      Aucune donnée disponible
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Stats */}
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
            width: '100%'
          }}>
            <CardHeader className="pokemon-header px-6" style={{ borderRadius: '8px 8px 0 0' }}>
              <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>
                STATISTIQUES MENSUELLES
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div style={{ 
                marginLeft: '1rem', 
                marginRight: '1rem',
                marginBottom: '1rem'
              }}>
                {stats.monthly_stats && stats.monthly_stats.length > 0 ? stats.monthly_stats.map((month, index) => (
                  <div 
                    key={index}
                    style={{ 
                      marginBottom: index < stats.monthly_stats.length - 1 ? '2rem' : '0',
                      paddingBottom: index < stats.monthly_stats.length - 1 ? '1.5rem' : '0',
                      borderBottom: index < stats.monthly_stats.length - 1 ? '2px solid rgba(255, 255, 255, 0.2)' : 'none'
                    }}
                  >
                    <p className="pixel-text text-xs mb-3" style={{ color: '#FACC15' }}>
                      {month.month.toUpperCase()}
                    </p>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '2rem',
                      textAlign: 'center'
                    }}>
                      <div>
                        <p className="pixel-text text-xs" style={{ color: '#22C55E' }}>VICTOIRES</p>
                        <p className="pixel-text text-xl mt-2" style={{ color: '#22C55E' }}>
                          {month.wins}
                        </p>
                      </div>
                      <div>
                        <p className="pixel-text text-xs" style={{ color: '#DC2626' }}>DÉFAITES</p>
                        <p className="pixel-text text-xl mt-2" style={{ color: '#DC2626' }}>
                          {month.losses}
                        </p>
                      </div>
                      <div>
                        <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>ÉGALITÉS</p>
                        <p className="pixel-text text-xl text-white mt-2">
                          {month.draws}
                        </p>
                      </div>
                      <div>
                        <p className="pixel-text text-xs text-white">TOTAL</p>
                        <p className="pixel-text text-xl text-white mt-2">
                          {month.wins + month.losses + month.draws}
                        </p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="pixel-text text-xs text-white text-center" style={{ opacity: 0.7 }}>
                    Aucune donnée disponible
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer spacer */}
      <div style={{ height: '4rem' }}></div>
    </div>
  );
}
