'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

type AvailablePokemon = {
  id: number;
  name: string;
  sprite: string;
  types: string[];
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

export default function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [teamName, setTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availablePokemons, setAvailablePokemons] = useState<AvailablePokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

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
      setTeamName(data.data.name);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Équipe introuvable');
      window.location.href = '/teams';
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!team || !teamName.trim()) return;
    
    setIsUpdating(true);
    setUpdateMessage('');
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/teams/${team.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ name: teamName })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      setTeam({ ...team, name: teamName });
      setUpdateMessage('Nom mis à jour avec succès !');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      console.error('Erreur:', error);
      setUpdateMessage('Erreur lors de la mise à jour');
      setTimeout(() => setUpdateMessage(''), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddPokemon = async (pokemonId: number) => {
    if (!team || team.pokemons.length >= 6) {
      alert('L\'équipe est complète (6 Pokémon maximum)');
      return;
    }
    
    if (team.pokemons.some(p => p.pokemon_id === pokemonId)) {
      alert('Ce Pokémon est déjà dans l\'équipe');
      return;
    }
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      const position = team.pokemons.length + 1;

      const response = await fetch(`http://localhost:3001/api/teams/${team.id}/pokemons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ pokemon_id: pokemonId, position })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout');
      }

      await fetchTeam();
      setSearchQuery('');
      setAvailablePokemons([]);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible d\'ajouter le Pokémon');
    }
  };

  const handleRemovePokemon = async (pokemonId: number) => {
    if (!team) return;
    
    try {
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch(`http://localhost:3001/api/teams/${team.id}/pokemons/${pokemonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await fetchTeam();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible de retirer le Pokémon');
    }
  };

  const handleSearch = async (query: string) => {
    if (query.length < 1) {
      setAvailablePokemons([]);
      return;
    }

    setSearching(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/pokemon/search?query=${query}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }

      const data = await response.json();
      setAvailablePokemons(data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setAvailablePokemons([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const filteredPokemons = availablePokemons.filter(pokemon =>
    !team?.pokemons.some(p => p.pokemon_id === pokemon.id)
  );

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
        title="MODIFIER L'ÉQUIPE"
        buttons={[
          { label: '← VOIR L\'ÉQUIPE', href: `/teams/${team.id}` },
          { label: 'MES ÉQUIPES', href: '/teams' }
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Modifier le nom */}
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
                NOM DE L'ÉQUIPE
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div className="space-y-4">
                <div style={{ margin: '1rem' }}>
                  <Label htmlFor="teamName" className="pixel-text text-xs" style={{ color: '#FACC15' }}>
                    Nom
                  </Label>
                  <Input
                    id="teamName"
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    maxLength={50}
                    className="pokemon-input mt-2"
                    style={{ width: '100%' }}
                  />
                  <p className="pixel-text text-xs text-white mt-2" style={{ opacity: 0.7, marginLeft: '0.5rem' }}>
                    {teamName.length} / 50 caractères
                  </p>
                </div>
                {updateMessage && (
                  <div style={{ 
                    padding: '0.75rem',
                    margin: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: updateMessage.includes('succès') ? '#22C55E' : '#EF4444',
                    border: '2px solid #000',
                    borderRadius: '8px'
                  }}>
                    <p className="pixel-text text-xs" style={{ color: '#000' }}>
                      {updateMessage}
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleUpdateName}
                  disabled={isUpdating || !teamName.trim() || teamName === team.name}
                  className="pokemon-button"
                  style={{ 
                    padding: '0.75rem 1.5rem',
                    opacity: isUpdating || !teamName.trim() || teamName === team.name ? 0.5 : 1,
                    margin: '1rem'
                  }}
                >
                  <span className="pixel-text text-xs" style={{ color: '#000' }}>
                    {isUpdating ? 'MISE À JOUR...' : 'METTRE À JOUR LE NOM'}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pokémon actuels */}
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
                POKÉMON ACTUELS ({team.pokemons.length}/6)
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
                  {[...team.pokemons].sort((a, b) => a.id - b.id).map((pokemon) => (
                    <div
                      key={pokemon.id}
                      style={{
                        background: '#FFFFFF',
                        border: '4px solid #000',
                        borderRadius: '8px',
                        padding: '1rem',
                        textAlign: 'center',
                        position: 'relative'
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
                      <div className="flex gap-1 justify-center mt-2" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
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
                      <Button
                        onClick={() => handleRemovePokemon(pokemon.pokemon_id)}
                        className="pokemon-button"
                        style={{ 
                          padding: '0.5rem',
                          width: '100%',
                          boxSizing: 'border-box',
                          background: '#DC2626'
                        }}
                      >
                        <span className="pixel-text text-xs" style={{ color: '#FFF' }}>RETIRER</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>
                    Aucun Pokémon dans cette équipe
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ajouter des Pokémon */}
          {team.pokemons.length < 6 && (
            <Card style={{
              background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
              border: '4px solid #000',
              borderRadius: '12px',
              boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
              width: '100%'
            }}>
              <CardHeader className="pokemon-header px-6" style={{ borderRadius: '8px 8px 0 0' }}>
                <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>
                  AJOUTER DES POKÉMON À MON ÉQUIPE
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-6">
                <div className="mb-4" style={{ margin: '1rem' }}>
                  <Input
                    type="text"
                    placeholder="Rechercher par nom ou numéro..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pokemon-input"
                    style={{ width: '100%', marginBottom: '0.75rem' }}
                  />
                  <p className="pixel-text text-xs" style={{ color: '#FACC15', opacity: 0.8 , marginLeft: '0.5rem' }}>
                    {searching ? 'Recherche en cours...' : searchQuery.length >= 1 ? `${filteredPokemons.length} résultat(s)` : 'Commencez à taper pour rechercher'}
                  </p>
                </div>
                {filteredPokemons.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1.5rem',
                    margin: '1rem'
                  }}>
                    {filteredPokemons.map((pokemon) => (
                    <div
                      key={pokemon.id}
                      className="hover-lift cursor-pointer"
                      onClick={() => handleAddPokemon(pokemon.id)}
                      style={{
                        background: '#FFFFFF',
                        border: '4px solid #000',
                        borderRadius: '8px',
                        padding: '1rem',
                        textAlign: 'center'
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
                        #{pokemon.id.toString().padStart(3, '0')}
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
                      <p className="pixel-text text-xs mt-3" style={{ color: '#22C55E' }}>
                        + AJOUTER
                      </p>
                    </div>
                  ))}
                  </div>
                )}
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
