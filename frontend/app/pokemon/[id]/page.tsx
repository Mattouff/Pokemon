'use client';

import { use, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PokemonHeader from '@/components/PokemonHeader';

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
  height: number;
  weight: number;
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
  fairy: '#EE99AC',
};

export default function PokemonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPokemonDetail();
  }, [id]);

  const fetchPokemonDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/pokemon/${id}`);
      
      if (!response.ok) {
        throw new Error('Pokémon non trouvé');
      }

      const data = await response.json();
      setPokemon(data.data);
    } catch (error) {
      console.error('Erreur:', error);
      setPokemon(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pokemon-bg flex items-center justify-center">
        <div className="pixel-text text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="min-h-screen pokemon-bg flex items-center justify-center">
        <div className="pixel-text text-white text-xl">Pokémon introuvable</div>
      </div>
    );
  }

  const maxStat = 255;

  return (
    <div className="min-h-screen pokemon-bg">
      <PokemonHeader 
        title={pokemon.name.toUpperCase()}
        buttons={[
          { label: '← POKÉDEX', href: '/pokemon' },
          { label: 'DASHBOARD', href: '/dashboard' }
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ maxWidth: '100%', margin: '1rem', gap: '2rem' }}>
          
          {/* Informations générales */}
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <CardHeader className="pokemon-header px-6" style={{ borderRadius: '8px 8px 0 0' }}>
              <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>
                INFORMATIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div style={{ marginTop: '1.5rem' }}></div>
              <div className="flex flex-col items-center gap-6">
                {/* Sprite */}
                <div style={{ 
                  width: '200px', 
                  height: '200px', 
                  background: '#FFFFFF',
                  border: '4px solid #000',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    className="pixelated"
                    style={{ width: '180px', height: '180px', objectFit: 'contain' }}
                  />
                </div>

                {/* Numéro */}
                <div className="text-center">
                  <p className="pixel-text text-xl" style={{ color: '#FACC15' }}>
                    #{pokemon.id.toString().padStart(3, '0')}
                  </p>
                </div>

                {/* Types */}
                <div className="flex gap-3">
                  {pokemon.types.map((type) => (
                    <div
                      key={type}
                      className="pixel-text text-xs px-4 py-2"
                      style={{
                        backgroundColor: TYPE_COLORS[type] || '#777',
                        color: '#FFF',
                        border: '3px solid #000',
                        borderRadius: '6px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {type}
                    </div>
                  ))}
                </div>

                {/* Taille et Poids */}
                <div className="grid grid-cols-2 gap-6 w-full">
                  <div className="text-center">
                    <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>Taille</p>
                    <p className="pixel-text text-xs text-white mt-2">{pokemon.height / 10}m</p>
                  </div>
                  <div className="text-center">
                    <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>Poids</p>
                    <p className="pixel-text text-xs text-white mt-2">{pokemon.weight / 10}kg</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <CardHeader className="pokemon-header px-6" style={{ borderRadius: '8px 8px 0 0' }}>
              <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>
                STATISTIQUES
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div style={{ marginTop: '1.5rem' }}></div>
              <div style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                {/* HP */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="pixel-text text-xs" style={{ color: '#FACC15' }}>HP</span>
                    <span className="pixel-text text-xs" style={{ color: '#FFFFFF' }}>{pokemon.stats.hp}</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '24px', 
                    background: '#1a1a1a',
                    border: '3px solid #000',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${(pokemon.stats.hp / maxStat) * 100}%`,
                      height: '100%',
                      background: '#FF0000',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>

                {/* Attack */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div className="flex justify-between mb-2">
                    <span className="pixel-text text-xs" style={{ color: '#FACC15' }}>Attaque</span>
                    <span className="pixel-text text-xs" style={{ color: '#FFFFFF' }}>{pokemon.stats.attack}</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '24px', 
                    background: '#1a1a1a',
                    border: '3px solid #000',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${(pokemon.stats.attack / maxStat) * 100}%`,
                      height: '100%',
                      background: '#F08030',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>

                {/* Defense */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div className="flex justify-between mb-2">
                    <span className="pixel-text text-xs" style={{ color: '#FACC15' }}>Défense</span>
                    <span className="pixel-text text-xs" style={{ color: '#FFFFFF' }}>{pokemon.stats.defense}</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '24px', 
                    background: '#1a1a1a',
                    border: '3px solid #000',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${(pokemon.stats.defense / maxStat) * 100}%`,
                      height: '100%',
                      background: '#F8D030',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>

                {/* Special Attack */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div className="flex justify-between mb-2">
                    <span className="pixel-text text-xs" style={{ color: '#FACC15' }}>Att. Spé.</span>
                    <span className="pixel-text text-xs" style={{ color: '#FFFFFF' }}>{pokemon.stats.specialAttack}</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '24px', 
                    background: '#1a1a1a',
                    border: '3px solid #000',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${(pokemon.stats.specialAttack / maxStat) * 100}%`,
                      height: '100%',
                      background: '#6890F0',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>

                {/* Special Defense */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div className="flex justify-between mb-2">
                    <span className="pixel-text text-xs" style={{ color: '#FACC15' }}>Déf. Spé.</span>
                    <span className="pixel-text text-xs" style={{ color: '#FFFFFF' }}>{pokemon.stats.specialDefense}</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '24px', 
                    background: '#1a1a1a',
                    border: '3px solid #000',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${(pokemon.stats.specialDefense / maxStat) * 100}%`,
                      height: '100%',
                      background: '#78C850',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>

                {/* Speed */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div className="flex justify-between mb-2">
                    <span className="pixel-text text-xs" style={{ color: '#FACC15' }}>Vitesse</span>
                    <span className="pixel-text text-xs" style={{ color: '#FFFFFF' }}>{pokemon.stats.speed}</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '24px', 
                    background: '#1a1a1a',
                    border: '3px solid #000',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${(pokemon.stats.speed / maxStat) * 100}%`,
                      height: '100%',
                      background: '#F85888',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>

                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div style={{ height: '2rem' }}></div>
    </div>
  );
}
