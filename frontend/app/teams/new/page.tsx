'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PokemonHeader from '@/components/PokemonHeader';

export default function NewTeamPage() {
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Remplacer par l'API POST /teams
    console.log('Créer équipe:', { name: teamName });
    
    setTimeout(() => {
      setIsLoading(false);
      // Rediriger vers la liste des équipes
      window.location.href = '/teams';
    }, 1000);
  };

  return (
    <div className="min-h-screen pokemon-bg">
      <PokemonHeader 
        title="NOUVELLE ÉQUIPE"
        buttons={[
          { label: '← MES ÉQUIPES', href: '/teams' },
          { label: 'DASHBOARD', href: '/dashboard' }
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <CardHeader className="pokemon-header px-6">
              <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>
                CRÉER UNE ÉQUIPE
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="teamName" className="pixel-text text-xs" style={{ color: '#FACC15' }}>
                    NOM DE L'ÉQUIPE
                  </Label>
                  <Input
                    id="teamName"
                    type="text"
                    placeholder="Ex: Team Électrique"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    maxLength={50}
                    className="pokemon-input"
                    style={{ width: '100%' }}
                  />
                  <p className="pixel-text text-xs text-white" style={{ color: '#FFFFFF', opacity: 0.7, marginTop: '0.5rem' }}>
                    {teamName.length} / 50 caractères
                  </p>
                </div>

                <div style={{
                  background: 'rgba(250, 204, 21, 0.1)',
                  border: '2px solid #FACC15',
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15', marginBottom: '0.5rem' }}>
                    ℹ️ INFORMATIONS
                  </p>
                  <p className="pixel-text text-xs text-white" style={{ lineHeight: '1.5' }}>
                    • Vous pourrez ajouter des Pokémon après la création<br/>
                    • Maximum 6 Pokémon par équipe<br/>
                    • Une seule équipe peut être active à la fois
                  </p>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button
                    type="button"
                    onClick={() => window.location.href = '/teams'}
                    className="pokemon-button flex-1"
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    <span className="pixel-text text-xs" style={{ color: '#000' }}>ANNULER</span>
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !teamName.trim()}
                    className="pokemon-button flex-1"
                    style={{ 
                      padding: '0.75rem 1.5rem',
                      opacity: isLoading || !teamName.trim() ? 0.5 : 1
                    }}
                  >
                    <span className="pixel-text text-xs" style={{ color: '#000' }}>
                      {isLoading ? 'CRÉATION...' : 'CRÉER'}
                    </span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer spacer */}
      <div style={{ height: '4rem' }}></div>
    </div>
  );
}
