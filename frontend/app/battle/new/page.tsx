'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PokemonHeader from '@/components/PokemonHeader';

type Team = {
  id: number;
  name: string;
  is_active: boolean;
  pokemon_count: number;
};

type Friend = {
  id: number;
  username: string;
  teams_count: number;
  total_battles: number;
  has_active_team?: boolean;
};

export default function NewBattlePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<number | null>(null);
  const [opponentType, setOpponentType] = useState<'friend' | 'ai'>('friend');
  const [searchQuery, setSearchQuery] = useState('');
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          window.location.href = '/login';
          return;
        }

        // Fetch teams
        const teamsResponse = await fetch('http://localhost:3001/api/teams', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!teamsResponse.ok) throw new Error('Erreur lors du chargement des équipes');
        const teamsData = await teamsResponse.json();

        // Fetch friends
        const friendsResponse = await fetch('http://localhost:3001/api/friends', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!friendsResponse.ok) throw new Error('Erreur lors du chargement des amis');
        const friendsData = await friendsResponse.json();

        // Extract data from response
        const teamsArray = teamsData.data || [];
        const friendsArray = friendsData.data || [];

        setTeams(teamsArray);
        setFriends(friendsArray);

        // Auto-select active team
        const activeTeam = teamsArray.find((t: Team) => t.is_active);
        if (activeTeam) setSelectedTeam(activeTeam.id);

        setLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateBattle = async () => {
    if (!selectedTeam || selectedOpponent === null) return;

    setIsCreating(true);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:3001/api/battles/interactive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          opponent_id: selectedOpponent
        })
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur backend:', errorText);
        throw new Error('Erreur lors de la création du combat');
      }

      const result = await response.json();
      console.log('📦 Réponse complète:', result);
      console.log('✅ Combat créé, ID reçu:', result.data?.battle_id);
      
      // Rediriger vers la page de combat interactif
      window.location.href = `/battle/${result.data.battle_id}`;
    } catch (error) {
      console.error('Erreur:', error);
      setIsCreating(false);
    }
  };

  // Filter teams based on search, or show top 3 most used
  const displayedTeams = teamSearchQuery.trim() 
    ? teams.filter(team => team.name.toLowerCase().includes(teamSearchQuery.toLowerCase()))
    : teams.slice(0, 3); // Top 3 most used teams

  // Filter friends based on search
  const filteredFriends = searchQuery.trim()
    ? friends.filter(friend => friend.username.toLowerCase().includes(searchQuery.toLowerCase()))
    : friends;

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
        title="NOUVEAU COMBAT"
        buttons={[
          { label: '← DASHBOARD', href: '/dashboard' },
          { label: 'HISTORIQUE', href: '/battle/history' }
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Select Team */}
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
                1. CHOISIR VOTRE ÉQUIPE
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div style={{ margin: '1rem' }}>
                <Input
                  type="text"
                  placeholder="Rechercher une équipe..."
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                  className="pokemon-input"
                  style={{ width: '100%', marginBottom: '1rem' }}
                />
                {!teamSearchQuery.trim() && displayedTeams.length > 0 && (
                  <p className="pixel-text text-xs mb-3" style={{ color: '#FACC15', opacity: 0.8 }}>
                    Vos 3 équipes les plus utilisées
                  </p>
                )}
                {displayedTeams.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                  }}>
                    {displayedTeams.map((team) => {
                      const isDisabled = team.pokemon_count === 0;
                      return (
                        <div
                          key={team.id}
                          onClick={() => !isDisabled && setSelectedTeam(team.id)}
                          style={{
                            background: isDisabled ? '#CCCCCC' : (selectedTeam === team.id ? '#FACC15' : '#FFFFFF'),
                            border: `4px solid ${isDisabled ? '#999' : (selectedTeam === team.id ? '#000' : '#666')}`,
                            borderRadius: '8px',
                            padding: '1rem',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: isDisabled ? 0.6 : 1
                          }}
                          className={isDisabled ? '' : 'hover-lift'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p className="pixel-text text-xs" style={{ color: '#000', fontWeight: 'bold' }}>
                              {team.name.toUpperCase()}
                            </p>
                            {team.is_active && (
                              <div style={{
                                background: '#22C55E',
                                border: '2px solid #000',
                                borderRadius: '4px',
                                padding: '0.125rem 0.5rem'
                              }}>
                                <span className="pixel-text" style={{ color: '#000', fontSize: '0.625rem' }}>
                                  ACTIVE
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="pixel-text text-xs mt-2" style={{ color: '#666' }}>
                            {team.pokemon_count} Pokémon
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>
                      Aucune équipe trouvée
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Select Opponent Type */}
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
                2. TYPE D'ADVERSAIRE
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                margin: '1rem'
              }}>
                <div
                  onClick={() => {
                    setOpponentType('friend');
                    setSelectedOpponent(null);
                  }}
                  style={{
                    background: opponentType === 'friend' ? '#FACC15' : '#FFFFFF',
                    border: `4px solid ${opponentType === 'friend' ? '#000' : '#666'}`,
                    borderRadius: '8px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                  className="hover-lift"
                >
                  <p className="pixel-text text-sm" style={{ color: '#000', fontWeight: 'bold' }}>
                    AMI
                  </p>
                  <p className="pixel-text text-xs mt-2" style={{ color: '#666' }}>
                    Défier un ami
                  </p>
                </div>
                <div
                  onClick={() => {
                    setOpponentType('ai');
                    setSelectedOpponent(0); // 0 = AI
                  }}
                  style={{
                    background: opponentType === 'ai' ? '#FACC15' : '#FFFFFF',
                    border: `4px solid ${opponentType === 'ai' ? '#000' : '#666'}`,
                    borderRadius: '8px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                  className="hover-lift"
                >
                  <p className="pixel-text text-sm" style={{ color: '#000', fontWeight: 'bold' }}>
                    IA
                  </p>
                  <p className="pixel-text text-xs mt-2" style={{ color: '#666' }}>
                    Combattre l'IA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Select Opponent (Friend) */}
          {opponentType === 'friend' && (
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
                  3. CHOISIR UN AMI
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-6">
                <div style={{ margin: '1rem' }}>
                  <Input
                    type="text"
                    placeholder="Rechercher un ami..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pokemon-input"
                    style={{ width: '100%', marginBottom: '1rem' }}
                  />
                  {filteredFriends.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '1rem'
                    }}>
                      {filteredFriends.map((friend) => {
                        // Désactiver si l'ami n'a pas d'équipe active (has_active_team === false)
                        // ou si cette info n'est pas disponible, désactiver s'il n'a aucune équipe
                        const isDisabled = friend.has_active_team === false || (friend.has_active_team === undefined && friend.teams_count === 0);
                        return (
                        <div
                          key={friend.id}
                          onClick={() => !isDisabled && setSelectedOpponent(friend.id)}
                          style={{
                            background: isDisabled ? '#CCCCCC' : (selectedOpponent === friend.id ? '#FACC15' : '#FFFFFF'),
                            border: `4px solid ${isDisabled ? '#999' : (selectedOpponent === friend.id ? '#000' : '#666')}`,
                            borderRadius: '8px',
                            padding: '1rem',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: isDisabled ? 0.6 : 1
                          }}
                          className={isDisabled ? '' : 'hover-lift'}
                        >
                          <p className="pixel-text text-xs" style={{ color: '#000', fontWeight: 'bold' }}>
                            {friend.username.toUpperCase()}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                            <p className="pixel-text text-xs" style={{ color: '#666' }}>
                              {friend.teams_count} équipes
                            </p>
                            <p className="pixel-text text-xs" style={{ color: '#666' }}>
                              {friend.total_battles} combats
                            </p>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>
                        Aucun ami trouvé
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start Battle Button */}
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
            width: '100%'
          }}>
            <CardContent className="px-6 py-6 text-center">
              <Button
                onClick={handleCreateBattle}
                disabled={!selectedTeam || selectedOpponent === null || isCreating}
                className="pokemon-button"
                style={{ 
                  padding: '1rem 3rem',
                  background: '#DC2626',
                  opacity: !selectedTeam || selectedOpponent === null || isCreating ? 0.5 : 1
                }}
              >
                <span className="pixel-text text-sm" style={{ color: '#FFF' }}>
                  {isCreating ? 'LANCEMENT...' : 'LANCER LE COMBAT !'}
                </span>
              </Button>
              {(!selectedTeam || selectedOpponent === null) && (
                <p className="pixel-text text-xs mt-4" style={{ color: '#FACC15', opacity: 0.7 }}>
                  Veuillez sélectionner une équipe et un adversaire
                </p>
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
