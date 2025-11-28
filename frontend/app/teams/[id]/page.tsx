'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PokemonHeader from '@/components/PokemonHeader';

type TeamPokemon = {
  id: number;
  pokemon_id: number;
  name: string;
  sprite: string;
  types: string[];
};

type TeamDetail = {
  id: number;
  name: string;
  user_id: number;
  is_active: boolean;
  created_at: string;
  pokemons: TeamPokemon[];
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

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMessage, setActiveMessage] = useState('');

  useEffect(() => {
    fetchTeam();
  }, [resolvedParams.id]);

  const fetchTeam = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:3001/api/teams/${resolvedParams.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération');
      }

      const data = await response.json();
      setTeam(data.data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Équipe introuvable');
      window.location.href = '/teams';
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async () => {
    if (!team || team.pokemons.length === 0) {
      setActiveMessage('Une équipe doit avoir au moins 1 Pokémon pour être active');
      setTimeout(() => setActiveMessage(''), 3000);
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/teams/${team?.id}/active`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'activation');
      }

      if (team) {
        setTeam({ ...team, is_active: true });
        setActiveMessage('Équipe définie comme active !');
        setTimeout(() => setActiveMessage(''), 3000);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      setActiveMessage(error.message || 'Impossible de définir l\'équipe comme active');
      setTimeout(() => setActiveMessage(''), 3000);
    }
  };

  const handleDelete = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/teams/${team?.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      window.location.href = '/teams';
    } catch (error) {
      console.error('Erreur:', error);
      setActiveMessage('Impossible de supprimer l\'équipe');
      setTimeout(() => setActiveMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pokemon-bg flex items-center justify-center">
        <p className="pixel-text text-white text-xl">Chargement...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen pokemon-bg flex items-center justify-center">
        <p className="pixel-text text-white text-xl">Équipe non trouvée</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pokemon-bg">
      <PokemonHeader 
        title={team.name.toUpperCase()}
        buttons={[
          { label: '← MES ÉQUIPES', href: '/teams' },
          { label: 'MODIFIER', href: `/teams/${team.id}/edit` }
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Informations de l'équipe */}
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
            width: '100%',
            marginBottom: '2rem'
          }}>
            <CardHeader className="pokemon-header px-6" style={{ borderRadius: '8px 8px 0 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>
                  INFORMATIONS
                </CardTitle>
                {team.is_active && (
                  <div 
                    className="pixel-text text-xs" 
                    style={{ 
                      backgroundColor: '#22C55E',
                      color: '#000',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      border: '2px solid #000',
                      marginRight: '1rem'
                    }}
                  >
                    ACTIVE
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15', marginLeft: '0.5rem' }}>Nom</p>
                  <p className="pixel-text text-xs text-white mt-2" style={{ color: '#000', marginLeft: '1rem' }}>
                    {team.name}
                  </p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15', marginLeft: '0.5rem' }}>Pokémon</p>
                  <p className="pixel-text text-xs text-white mt-2" style={{ color: '#000', marginLeft: '1rem' }}>
                    {team.pokemons.length} / 6
                  </p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15', marginLeft: '0.5rem' }}>Créée le</p>
                  <p className="pixel-text text-xs text-white mt-2" style={{ color: '#000', marginLeft: '1rem' }}>
                    {new Date(team.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div style={{ margin: '1.5rem' }}>
                {activeMessage && (
                  <div style={{ 
                    padding: '0.75rem',
                    margin: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: activeMessage.includes('active !') ? '#22C55E' : '#EF4444',
                    border: '2px solid #000',
                    borderRadius: '8px'
                  }}>
                    <p className="pixel-text text-xs" style={{ color: '#000' }}>
                      {activeMessage}
                    </p>
                  </div>
                )}
                {!team.is_active && (
                  <Button
                    onClick={handleSetActive}
                    className="pokemon-button"
                    style={{ padding: '0.75rem 1.5rem', width: '100%', boxSizing: 'border-box', marginBottom: '0.75rem' }}
                  >
                    <span className="pixel-text text-xs" style={{ color: '#000'}}>
                      DÉFINIR COMME ÉQUIPE ACTIVE
                    </span>
                  </Button>
                )}
                <Button
                  onClick={handleDelete}
                  className="pokemon-button"
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    width: '100%', 
                    boxSizing: 'border-box',
                    backgroundColor: '#EF4444',
                    borderColor: '#000'
                  }}
                >
                  <span className="pixel-text text-xs" style={{ color: '#000'}}>
                    SUPPRIMER L'ÉQUIPE
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des Pokémon */}
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
            width: '100%'
          }}>
            <CardHeader className="pokemon-header px-6" style={{ borderRadius: '8px 8px 0 0' }}>
              <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>
                POKÉMON ({team.pokemons.length}/6)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              {team.pokemons.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1.5rem',
                  margin: '1rem'
                }}>
                  {team.pokemons.map((pokemon) => (
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
                        {pokemon.name.toUpperCase()}
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
                    Aucun Pokémon dans cette équipe
                  </p>
                  <p className="pixel-text text-xs text-white mt-2" style={{ opacity: 0.7 }}>
                    Modifie l'équipe pour ajouter des Pokémon
                  </p>
                  <Button
                    onClick={() => window.location.href = `/teams/${team.id}/edit`}
                    className="pokemon-button"
                    style={{ 
                      padding: '0.75rem 1.5rem',
                      margin: '1rem'
                    }}
                  >
                    <span className="pixel-text text-xs" style={{ color: '#000' }}>
                      AJOUTER UN POKÉMON À L'ÉQUIPE
                    </span>
                  </Button>
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
