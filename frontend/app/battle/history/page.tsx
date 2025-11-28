'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PokemonHeader from '@/components/PokemonHeader';

type Battle = {
  id: number;
  date: string;
  opponent_username: string;
  opponent_type: 'friend' | 'ai';
  your_team_name: string;
  result: 'win' | 'loss' | 'draw';
  duration_seconds: number;
  your_pokemon_remaining: number;
  opponent_pokemon_remaining: number;
};

export default function BattleHistoryPage() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'draw'>('all');

  useEffect(() => {
    fetchBattles();
  }, []);

  const fetchBattles = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:3001/api/battles/history', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique');
      }

      const data = await response.json();
      console.log('📊 Historique des combats reçu:', data.data);
      setBattles(data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setBattles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBattles = filter === 'all' 
    ? battles 
    : battles.filter(b => b.result === filter);

  const stats = {
    total: battles.length,
    wins: battles.filter(b => b.result === 'win').length,
    losses: battles.filter(b => b.result === 'loss').length
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return '#22C55E';
      case 'loss': return '#DC2626';
      case 'draw': return '#FACC15';
      default: return '#FFF';
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'win': return 'VICTOIRE';
      case 'loss': return 'DÉFAITE';
      case 'draw': return 'ÉGALITÉ';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pokemon-bg flex items-center justify-center">
        <p className="pixel-text text-white text-xl">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pokemon-bg">
      <PokemonHeader 
        title="HISTORIQUE DES COMBATS"
        buttons={[
          { label: '← DASHBOARD', href: '/dashboard' },
          { label: 'NOUVEAU COMBAT', href: '/battle/new' },
          { label: 'STATISTIQUES', href: '/battle/stats' }
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Stats Summary */}
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
            width: '100%',
            marginBottom: '2rem'
          }}>
            <CardContent className="px-6 py-6">
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '2rem',
                textAlign: 'center'
              }}>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>TOTAL</p>
                  <p className="pixel-text text-2xl text-white mt-2">{stats.total}</p>
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
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
            width: '100%',
            marginBottom: '2rem'
          }}>
            <CardContent className="px-6 py-6">
              <div style={{ 
                display: 'flex', 
                gap: '1rem',
                marginLeft: '1rem',
                marginRight: '1rem',
                marginBottom: '1rem',
                flexWrap: 'wrap'
              }}>
                <Button
                  onClick={() => setFilter('all')}
                  className="pokemon-button"
                  style={{ 
                    padding: '0.5rem 1rem',
                    background: filter === 'all' ? '#FACC15' : '#FFFFFF',
                    border: `4px solid ${filter === 'all' ? '#000' : '#666'}`
                  }}
                >
                  <span className="pixel-text text-xs" style={{ color: '#000' }}>TOUS</span>
                </Button>
                <Button
                  onClick={() => setFilter('win')}
                  className="pokemon-button"
                  style={{ 
                    padding: '0.5rem 1rem',
                    background: filter === 'win' ? '#22C55E' : '#FFFFFF',
                    border: `4px solid ${filter === 'win' ? '#000' : '#666'}`
                  }}
                >
                  <span className="pixel-text text-xs" style={{ color: '#000' }}>VICTOIRES</span>
                </Button>
                <Button
                  onClick={() => setFilter('loss')}
                  className="pokemon-button"
                  style={{ 
                    padding: '0.5rem 1rem',
                    background: filter === 'loss' ? '#DC2626' : '#FFFFFF',
                    border: `4px solid ${filter === 'loss' ? '#000' : '#666'}`
                  }}
                >
                  <span className="pixel-text text-xs" style={{ color: filter === 'loss' ? '#FFF' : '#000' }}>
                    DÉFAITES
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Battles List */}
          {filteredBattles.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredBattles.map((battle) => (
                <Card
                  key={battle.id}
                  style={{
                    background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
                    border: '4px solid #000',
                    borderRadius: '12px',
                    boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
                    width: '100%'
                  }}
                >
                  <CardHeader className="pokemon-header px-6" style={{ borderRadius: '8px 8px 0 0' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginLeft: '1rem',
                      marginRight: '1rem'
                    }}>
                      <CardTitle className="pixel-text text-sm text-white">
                        VS {battle.opponent_username ? battle.opponent_username.toUpperCase() : 'ADVERSAIRE'}
                        {battle.opponent_type === 'ai' && (
                          <span style={{ opacity: 0.7 }}> (IA)</span>
                        )}
                      </CardTitle>
                      <div style={{
                        background: getResultColor(battle.result),
                        border: '2px solid #000',
                        borderRadius: '4px',
                        padding: '0.25rem 0.75rem'
                      }}>
                        <span className="pixel-text text-xs" style={{ 
                          color: battle.result === 'loss' ? '#FFF' : '#000' 
                        }}>
                          {getResultText(battle.result)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 py-6">
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '2rem',
                      marginLeft: '1rem',
                      marginRight: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>DATE</p>
                        <p className="pixel-text text-xs text-white" style={{ marginTop: '0.5rem' }}>
                          {formatDate(battle.date)}
                        </p>
                      </div>
                      <div>
                        <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>ÉQUIPE</p>
                        <p className="pixel-text text-xs text-white" style={{ marginTop: '0.5rem' }}>
                          {battle.your_team_name}
                        </p>
                      </div>
                      <div>
                        <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>DURÉE</p>
                        <p className="pixel-text text-xs text-white" style={{ marginTop: '0.5rem' }}>
                          {formatDuration(battle.duration_seconds)}
                        </p>
                      </div>
                      <div>
                        <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>POKÉMON RESTANTS</p>
                        <p className="pixel-text text-xs text-white" style={{ marginTop: '0.5rem' }}>
                          {battle.your_pokemon_remaining} vs {battle.opponent_pokemon_remaining}
                        </p>
                      </div>
                    </div>
                    <div style={{ marginLeft: '1rem', marginRight: '1rem', marginBottom: '1rem' }}>
                      <Button
                        onClick={() => window.location.href = `/battle/${battle.id}`}
                        className="pokemon-button"
                        style={{ 
                          padding: '0.5rem 1rem',
                          width: '100%'
                        }}
                      >
                        <span className="pixel-text text-xs" style={{ color: '#000' }}>
                          VOIR LE DÉTAIL
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card style={{
              background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
              border: '4px solid #000',
              borderRadius: '12px',
              boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
              width: '100%'
            }}>
              <CardContent className="px-6 py-12 text-center">
                <p className="pixel-text text-sm" style={{ color: '#FACC15' }}>
                  Aucun combat trouvé
                </p>
                <p className="pixel-text text-xs text-white mt-4" style={{ opacity: 0.7 }}>
                  Lancez votre premier combat !
                </p>
                <Button
                  onClick={() => window.location.href = '/battle/new'}
                  className="pokemon-button mt-6"
                  style={{ padding: '0.75rem 1.5rem', margin: '1rem' }}
                >
                  <span className="pixel-text text-xs" style={{ color: '#000' }}>
                    NOUVEAU COMBAT
                  </span>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer spacer */}
      <div style={{ height: '4rem' }}></div>
    </div>
  );
}
