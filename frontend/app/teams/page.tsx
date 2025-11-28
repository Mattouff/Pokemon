'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PokemonHeader from '@/components/PokemonHeader';

type Team = {
  id: number;
  name: string;
  user_id: number;
  is_active: boolean;
  created_at: string;
  pokemon_count: number;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:3001/api/teams', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération');
      }

      const data = await response.json();
      
      // Trier: équipe active en premier, puis par date décroissante
      const sortedTeams = data.data.sort((a: Team, b: Team) => {
        if (a.is_active && !b.is_active) return -1;
        if (!a.is_active && b.is_active) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setTeams(sortedTeams);
    } catch (error) {
      console.error('Erreur:', error);
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

  return (
    <div className="min-h-screen pokemon-bg">
      <PokemonHeader 
        title="MES ÉQUIPES"
        buttons={[
          { label: 'DASHBOARD', href: '/dashboard' },
          { label: '+ NOUVELLE ÉQUIPE', href: '/teams/new' }
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto py-8" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginLeft: '1rem',
          marginRight: '2rem'
        }}>
          {teams.map((team) => (
            <Card 
              key={team.id}
              style={{
                background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
                border: '4px solid #000',
                borderRadius: '12px',
                boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                position: 'relative'
              }}
              className="hover-lift cursor-pointer"
              onClick={() => window.location.href = `/teams/${team.id}`}
            >
              <CardHeader className="pokemon-header px-4" style={{ position: 'relative', padding: '0.75rem 1rem', borderRadius: '8px 8px 0 0' }}>
                <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '0.5rem' }}>
                  {team.name.toUpperCase()}
                </CardTitle>
                {team.is_active && (
                  <div 
                    className="pixel-text text-xs" 
                    style={{ 
                      position: 'absolute',
                      top: '50%',
                      right: '1rem',
                      transform: 'translateY(-50%)',
                      backgroundColor: '#22C55E',
                      color: '#000',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      border: '2px solid #000'
                    }}
                  >
                    ACTIVE
                  </div>
                )}
              </CardHeader>
              <CardContent className="px-4 py-4">
                <div className="space-y-3">
                  <div>
                    <p className="pixel-text text-xs" style={{ color: '#FACC15', marginLeft: '0.5rem' }}>Pokémon</p>
                    <p className="pixel-text text-xs mt-2" style={{ color: '#000', marginLeft: '1rem' }}>{team.pokemon_count || 0} / 6</p>
                  </div>
                  <div>
                    <p className="pixel-text text-xs" style={{ color: '#FACC15', marginLeft: '0.5rem' }}>Créée le</p>
                    <p className="pixel-text text-xs mt-2" style={{ color: '#000', marginLeft: '1rem' }}>
                      {new Date(team.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      className="pokemon-button bg-blue-600 hover:bg-blue-700 flex-1"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.75rem', margin: '1rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/teams/${team.id}`;
                      }}
                    >
                      <span className="pixel-text text-xs" style={{ color: '#000' }}>VOIR</span>
                    </Button>
                    <Button 
                      className="pokemon-button bg-yellow-500 hover:bg-yellow-600 flex-1"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.75rem', margin: '1rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/teams/${team.id}/edit`;
                      }}
                    >
                      <span className="pixel-text text-xs" style={{ color: '#000' }}>MODIFIER</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {teams.length === 0 && (
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <CardContent className="px-6 py-12 text-center">
              <p className="pixel-text text-xl text-white mb-6">Aucune équipe</p>
              <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>
                Crée ta première équipe pour commencer !
              </p>
              <a href="/teams/new" className="inline-block mt-6">
                <Button className="pokemon-button bg-green-600 hover:bg-green-700">
                  <span className="pixel-text text-xs" style={{ color: '#000' }}>+ CRÉER UNE ÉQUIPE</span>
                </Button>
              </a>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer spacer */}
      <div style={{ height: '4rem' }}></div>
    </div>
  );
}
