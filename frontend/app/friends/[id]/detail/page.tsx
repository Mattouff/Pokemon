'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PokemonHeader from '@/components/PokemonHeader';

type TeamPokemon = {
  id: number;
  pokemon_id: number;
  name: string;
  sprite: string;
  types: string[];
  position: number;
  nickname?: string;
};

type ActiveTeam = {
  id: number;
  name: string;
  pokemons: TeamPokemon[];
};

type FriendStats = {
  total_battles: number;
  wins: number;
  losses: number;
  draws: number;
};

type FriendDetail = {
  id: number;
  username: string;
  is_online: boolean;
  teams_count: number;
  active_team?: ActiveTeam;
  stats: FriendStats;
};

const TYPE_COLORS: { [key: string]: string } = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
};

export default function FriendDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [friend, setFriend] = useState<FriendDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriendDetail();
  }, [resolvedParams.id]);

  const fetchFriendDetail = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:3001/api/friends/${resolvedParams.id}/detail`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération');
      }

      const data = await response.json();
      setFriend(data.data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Ami introuvable');
      window.location.href = '/dashboard';
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pokemon-bg flex items-center justify-center">
        <p className="pixel-text text-white text-xl">Chargement...</p>
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="min-h-screen pokemon-bg flex items-center justify-center">
        <p className="pixel-text text-white text-xl">Ami non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pokemon-bg">
      <PokemonHeader 
        title={friend.username.toUpperCase()}
        buttons={[
          { label: '← DASHBOARD', href: '/dashboard' },
          { label: 'MES AMIS', href: '/friends' }
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Informations de l'ami */}
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
                INFORMATIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15', marginLeft: '0.5rem' }}>Statut</p>
                  <p className="pixel-text text-xs mt-2" style={{ color: friend.is_online ? '#22C55E' : '#EF4444', marginLeft: '1rem' }}>
                    {friend.is_online ? 'En ligne' : 'Hors ligne'}
                  </p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15', marginLeft: '0.5rem' }}>Nombre d'équipes</p>
                  <p className="pixel-text text-xs mt-2" style={{ color: '#000', marginLeft: '1rem' }}>
                    {friend.teams_count}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques de combat */}
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
                STATISTIQUES DE COMBAT
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15', marginLeft: '0.5rem' }}>Total</p>
                  <p className="pixel-text text-xs mt-2" style={{ color: '#000', marginLeft: '1rem' }}>
                    {friend.stats.total_battles}
                  </p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15', marginLeft: '0.5rem' }}>Victoires</p>
                  <p className="pixel-text text-xs mt-2" style={{ color: '#22C55E', marginLeft: '1rem' }}>
                    {friend.stats.wins}
                  </p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15', marginLeft: '0.5rem' }}>Défaites</p>
                  <p className="pixel-text text-xs mt-2" style={{ color: '#EF4444', marginLeft: '1rem' }}>
                    {friend.stats.losses}
                  </p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15', marginLeft: '0.5rem' }}>Égalités</p>
                  <p className="pixel-text text-xs mt-2" style={{ color: '#FACC15', marginLeft: '1rem' }}>
                    {friend.stats.draws}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Équipe active */}
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
            width: '100%'
          }}>
            <CardHeader className="pokemon-header px-6" style={{ borderRadius: '8px 8px 0 0' }}>
              <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>
                {friend.active_team ? `ÉQUIPE ACTIVE: ${friend.active_team.name.toUpperCase()}` : 'ÉQUIPE ACTIVE'}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              {friend.active_team && friend.active_team.pokemons.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1.5rem',
                  margin: '1rem'
                }}>
                  {friend.active_team.pokemons.map((pokemon) => (
                    <div
                      key={pokemon.id}
                      className="hover-lift cursor-pointer"
                      onClick={() => window.location.href = `/pokemon/${pokemon.pokemon_id}`}
                      style={{
                        background: '#FFFFFF',
                        border: '4px solid #000',
                        borderRadius: '8px',
                        padding: '1rem',
                        textAlign: 'center',
                        boxShadow: '0 4px 0 rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <div style={{ 
                        width: '96px', 
                        height: '96px', 
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img
                          src={pokemon.sprite}
                          alt={pokemon.name}
                          className="pixelated"
                          style={{ maxWidth: '96px', maxHeight: '96px' }}
                        />
                      </div>
                      <p className="pixel-text text-xs mt-3" style={{ color: '#000' }}>
                        #{pokemon.pokemon_id.toString().padStart(3, '0')}
                      </p>
                      <p className="pixel-text text-xs mt-1" style={{ color: '#000', fontWeight: 'bold' }}>
                        {pokemon.nickname || pokemon.name.toUpperCase()}
                      </p>
                      <div className="flex gap-1 justify-center mt-2" style={{ flexWrap: 'wrap' }}>
                        {pokemon.types.map((type) => (
                          <div
                            key={type}
                            className="pixel-text text-xs"
                            style={{
                              backgroundColor: TYPE_COLORS[type] || '#777',
                              color: '#FFF',
                              border: '2px solid #000',
                              borderRadius: '4px',
                              padding: '0.125rem 0.5rem',
                              fontSize: '0.625rem'
                            }}
                          >
                            {type.toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>
                    Aucune équipe active
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer spacer */}
      <div style={{ height: '4rem' }}></div>
    </div>
  );
}
