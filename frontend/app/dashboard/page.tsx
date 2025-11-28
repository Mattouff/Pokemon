'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Types temporaires (à remplacer par les vrais appels API plus tard)
type User = {
  id: number;
  username: string;
  email: string;
};

type Friend = {
  id: number;
  username: string;
  status: string;
  is_online: boolean;
};

type Team = {
  id: number;
  name: string;
  is_active: boolean;
  pokemon_count: number;
  created_at: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        window.location.href = '/login';
        return;
      }

      // Récupérer les infos de l'utilisateur
      const userResponse = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Erreur lors de la récupération du profil');
      }

      const userData = await userResponse.json();
      setUser(userData);

      const teamsResponse = await fetch('http://localhost:3001/api/teams', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        const sortedTeams = teamsData.data.sort((a: Team, b: Team) => {
          if (a.is_active && !b.is_active) return -1;
          if (!a.is_active && b.is_active) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setTeams(sortedTeams);
      }

      const friendsResponse = await fetch('http://localhost:3001/api/friends', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        const sortedFriends = friendsData.data.sort((a: Friend, b: Friend) => {
          if (a.is_online && !b.is_online) return -1;
          if (!a.is_online && b.is_online) return 1;
          return a.username.localeCompare(b.username);
        });
        setFriends(sortedFriends);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.clear();
      window.location.href = '/login';
    }
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
      {/* Header */}
      <header className="pokemon-header">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="pokemon-title text-2xl" style={{ marginLeft: '1rem' }}>MON PROFIL</h1>
            <div className="flex gap-4">
              <a href="/">
                <Button className="pokemon-button bg-blue-600 hover:bg-blue-700" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                  <span className="pixel-text text-xs" style={{ color: '#000' }}>ACCUEIL</span>
                </Button>
              </a>
              <Button 
                onClick={handleLogout}
                className="pokemon-button bg-red-600 hover:bg-red-700" 
                style={{ width: 'auto', padding: '0.75rem 1.5rem', marginRight: '1rem' }}
              >
                <span className="pixel-text text-xs" style={{ color: '#000' }}>DÉCONNEXION</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-1">
            <Card className="pokemon-card h-full">
              <CardHeader className="pokemon-header px-6">
                <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>INFORMATIONS</CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-6 space-y-4">
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>Pseudo</p>
                  <p className="pixel-text text-xs text-white mt-2">{user?.username}</p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>Email</p>
                  <p className="pixel-text text-xs text-white mt-2">{user?.email}</p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>ID Dresseur</p>
                  <p className="pixel-text text-xs text-white mt-2">#{user?.id.toString().padStart(6, '0')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="pokemon-card h-full">
              <CardHeader className="pokemon-header px-6 flex flex-row items-center justify-between">
                <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>MES ÉQUIPES</CardTitle>
                <a href="/teams/new">
                  <Button className="pokemon-button bg-green-600 hover:bg-green-700" style={{ width: 'auto', padding: '0.5rem 1rem', marginRight: '1rem' }}>
                    <span className="pixel-text text-xs" style={{ color: '#000' }}>+ CRÉER</span>
                  </Button>
                </a>
              </CardHeader>
              <CardContent className="px-6 py-6">
                {teams.length === 0 ? (
                  <p className="pixel-text text-xs text-white text-center py-8">
                    Aucune équipe créée
                  </p>
                ) : (
                  <div className="space-y-4">
                    {teams.map((team) => (
                      <div 
                        key={team.id}
                        className="pokemon-dialogue-box p-4 hover-lift cursor-pointer"
                        onClick={() => window.location.href = `/teams/${team.id}`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="pixel-text text-xs" style={{ color: '#000' }}>
                              {team.name}
                            </p>
                            <p className="pixel-text text-xs mt-2" style={{ color: '#666' }}>
                              {team.pokemon_count}/6 Pokémon
                            </p>
                          </div>
                          {team.is_active && (
                            <span className="pixel-text text-xs" style={{ color: '#22C55E' }}>
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6">
          <Card className="pokemon-card">
            <CardHeader className="pokemon-header px-6 flex flex-row items-center justify-between">
              <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>MES AMIS</CardTitle>
              <a href="/friends/search">
                <Button className="pokemon-button bg-green-600 hover:bg-green-700" style={{ width: 'auto', padding: '0.5rem 1rem', marginRight: '1rem' }}>
                  <span className="pixel-text text-xs" style={{ color: '#000' }}>+ AJOUTER</span>
                </Button>
              </a>
            </CardHeader>
            <CardContent className="px-6 py-6">
              {friends.length === 0 ? (
                <p className="pixel-text text-xs text-white text-center py-8">
                  Aucun ami ajouté
                </p>
              ) : (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <div 
                      key={friend.id}
                      className="pokemon-dialogue-box p-4 hover-lift cursor-pointer"
                      onClick={() => window.location.href = `/friends/${friend.id}/detail`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="pixel-text text-xs" style={{ color: '#000' }}>
                            {friend.username}
                          </p>
                          <p className="pixel-text text-xs mt-2" style={{ color: friend.is_online ? '#22C55E' : '#666' }}>
                            {friend.is_online ? 'En ligne' : 'Hors ligne'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="mt-6">
          <Card className="pokemon-card">
            <CardHeader className="pokemon-header px-6">
              <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>ACTIONS RAPIDES</CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <a href="/battle/new">
                  <Button className="pokemon-button bg-red-600 hover:bg-red-700 w-full">
                    <span className="pixel-text text-xs" style={{ color: '#000' }}>COMBATTRE</span>
                  </Button>
                </a>
                <a href="/pokemon">
                  <Button className="pokemon-button bg-yellow-500 hover:bg-yellow-600 w-full">
                    <span className="pixel-text text-xs" style={{ color: '#000' }}>POKÉDEX</span>
                  </Button>
                </a>
                <a href="/battle/history">
                  <Button className="pokemon-button bg-purple-600 hover:bg-purple-700 w-full">
                    <span className="pixel-text text-xs" style={{ color: '#000' }}>HISTORIQUE</span>
                  </Button>
                </a>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div style={{ height: '2rem' }}></div>
    </div>
  );
}
