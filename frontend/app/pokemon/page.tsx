'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PokemonHeader from '@/components/PokemonHeader';

type Pokemon = {
  name: string;
  url: string;
};

type PokemonDetail = {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
};

export default function PokemonListPage() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    fetchPokemons();
  }, [offset]);

  useEffect(() => {
    filterPokemons();
  }, [searchQuery]);

  const fetchPokemons = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/pokemon?limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des Pokémon');
      }

      const data = await response.json();
      setAllPokemons(data.data.results);
      setPokemons(data.data.results);
      setTotalCount(data.data.count);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPokemons = () => {
    if (!searchQuery.trim()) {
      setPokemons(allPokemons);
      setNoResults(false);
      return;
    }

    const filtered = allPokemons.filter(pokemon => 
      pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setPokemons(filtered);
    setNoResults(filtered.length === 0);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/pokemon/search?name=${searchQuery.toLowerCase()}`);
        
        if (response.ok) {
          const data = await response.json();
          window.location.href = `/pokemon/${data.data.id}`;
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(offset - limit);
    }
  };

  const handleNextPage = () => {
    if (offset + limit < totalCount) {
      setOffset(offset + limit);
    }
  };

  const getPokemonId = (url: string): string => {
    // URL format: https://pokeapi.co/api/v2/pokemon/1/ ou https://pokeapi.co/api/v2/pokemon/1
    const parts = url.split('/').filter(part => part !== '');
    const lastPart = parts[parts.length - 1];
    
    // Si la dernière partie est "pokemon", l'ID est avant
    if (lastPart === 'pokemon') {
      return parts[parts.length - 2];
    }
    
    // Sinon, l'ID est la dernière partie
    return lastPart;
  };

  if (loading) {
    return (
      <div className="min-h-screen pokemon-bg flex items-center justify-center">
        <div className="pixel-text text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pokemon-bg">
      <PokemonHeader 
        title="POKÉDEX"
        buttons={[
          { label: 'DASHBOARD', href: '/dashboard' },
          { label: 'ACCUEIL', href: '/' }
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Recherche */}
        <Card className="pokemon-card mb-6">
          <CardHeader className="pokemon-header px-6">
            <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>RECHERCHER UN POKÉMON</CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                type="text"
                placeholder="Nom du Pokémon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pokemon-input flex-1"
                style={{ width: '100%' }}
              />
              <Button type="submit" className="pokemon-button bg-yellow-500 hover:bg-yellow-600" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                <span className="pixel-text text-xs" style={{ color: '#000' }}>CHERCHER</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Liste des Pokémon */}
        <Card style={{
            marginTop: '2rem',
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            boxSizing: 'border-box'
        }}>
          <CardHeader className="pokemon-header px-6">
            <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>
              POKÉMON {offset + 1} - {Math.min(offset + limit, totalCount)} / {totalCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-6">
            {noResults ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                marginLeft: '1rem',
                marginRight: '1rem'
              }}>
                <p className="pixel-text text-sm" style={{ color: '#EF4444', marginBottom: '0.5rem' }}>
                  AUCUN POKÉMON TROUVÉ
                </p>
                <p className="pixel-text text-xs" style={{ color: '#FFFFFF' }}>
                  Le Pokémon "{searchQuery}" n'existe pas dans cette liste.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                maxWidth: '100%',
                marginLeft: '1rem',
                marginRight: '1rem'
              }}>
                {pokemons.map((pokemon) => {
                const pokemonId = getPokemonId(pokemon.url);
                return (
                  <div
                    key={pokemon.name}
                    className="hover-lift cursor-pointer text-center"
                    onClick={() => window.location.href = `/pokemon/${pokemonId}`}
                    style={{ 
                      height: '200px', 
                      minHeight: '200px',
                      maxHeight: '200px',
                      width: '100%',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      padding: '1rem',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                      background: '#FFFFFF',
                      border: '4px solid #000',
                      borderRadius: '8px',
                      boxShadow: '0 4px 0 rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                      <div className="flex flex-col items-center gap-3" style={{ width: '100%', flex: 1 }}>
                        <div style={{ width: '96px', height: '96px', minHeight: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
                            alt={pokemon.name}
                            className="pixelated"
                            style={{ maxWidth: '96px', maxHeight: '96px', objectFit: 'contain' }}
                          />
                        </div>
                        <div style={{ width: '100%', maxWidth: '180px' }}>
                          <p className="pixel-text text-xs" style={{ color: '#000' }}>
                            #{pokemonId.padStart(3, '0')}
                          </p>
                          <p className="pixel-text text-xs mt-1" style={{ 
                            color: '#3B4CCA',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {pokemon.name.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="arrow-sparkle" style={{ 
                        position: 'absolute', 
                        bottom: '0.01rem', 
                        right: '0.01rem',
                        width: '0',
                        height: '0',
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: '12px solid #000'
                      }}>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            )}

            {/* Pagination */}
            {!searchQuery.trim() && (
              <div className="flex justify-center items-center gap-4 mt-8" style={{ margin: '2rem'}}>
                <Button
                  onClick={handlePrevPage}
                  disabled={offset === 0}
                  className="pokemon-button bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                >
                  <span className="pixel-text text-xs" style={{ color: '#000' }}>← PRÉCÉDENT</span>
                </Button>
                
                <span className="pixel-text text-xs text-white">
                  Page {Math.floor(offset / limit) + 1} / {Math.ceil(totalCount / limit)}
                </span>
                
                <Button
                  onClick={handleNextPage}
                  disabled={offset + limit >= totalCount}
                  className="pokemon-button bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                >
                  <span className="pixel-text text-xs" style={{ color: '#000' }}>SUIVANT →</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
