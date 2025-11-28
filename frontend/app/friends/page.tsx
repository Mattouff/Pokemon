'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PokemonHeader from '@/components/PokemonHeader';

type Friend = {
  id: number;
  username: string;
  friendship_since: string;
  teams_count: number;
  total_battles: number;
  wins_against_you: number;
  losses_against_you: number;
  is_online: boolean;
};

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:3001/api/friends', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
          return;
        }
        throw new Error('Erreur lors de la récupération des amis');
      }

      const data = await response.json();
      setFriends(data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cet ami ?')) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/friends/${friendId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      setFriends(friends.filter(f => f.id !== friendId));
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible de retirer cet ami');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
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
        title="MES AMIS"
        buttons={[
          { label: '← DASHBOARD', href: '/dashboard' },
          { label: 'DEMANDES', href: '/friends/requests' },
          { label: 'RECHERCHER', href: '/friends/search' }
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '2rem',
                textAlign: 'center'
              }}>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>TOTAL AMIS</p>
                  <p className="pixel-text text-2xl text-white mt-2">{friends.length}</p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>COMBATS TOTAUX</p>
                  <p className="pixel-text text-2xl text-white mt-2">
                    {friends.reduce((sum, f) => sum + f.total_battles, 0)}
                  </p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>VICTOIRES</p>
                  <p className="pixel-text text-2xl mt-2" style={{ color: '#22C55E' }}>
                    {friends.reduce((sum, f) => sum + (f.losses_against_you || 0), 0)}
                  </p>
                </div>
                <div>
                  <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>DÉFAITES</p>
                  <p className="pixel-text text-2xl mt-2" style={{ color: '#DC2626' }}>
                    {friends.reduce((sum, f) => sum + (f.wins_against_you || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Friends List */}
          {friends.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              marginLeft: '1rem',
              marginRight: '2rem'
            }}>
              {friends.map((friend) => (
                <Card
                  key={friend.id}
                  style={{
                    background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
                    border: '4px solid #000',
                    borderRadius: '12px',
                    boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
                    height: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <CardHeader 
                    className="pokemon-header px-6 hover-lift cursor-pointer" 
                    style={{ borderRadius: '8px 8px 0 0' }}
                    onClick={() => window.location.href = `/friends/${friend.id}/detail`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '1rem', marginRight: '1rem' }}>
                      <CardTitle className="pixel-text text-sm text-white">
                        {friend.username.toUpperCase()}
                      </CardTitle>
                      <div style={{
                        background: friend.is_online ? '#22C55E' : '#6B7280',
                        border: '2px solid #000',
                        borderRadius: '4px',
                        padding: '0.25rem 0.5rem'
                      }}>
                        <span className="pixel-text" style={{ color: '#000', fontSize: '0.625rem' }}>
                          {friend.is_online ? 'EN LIGNE' : 'HORS LIGNE'}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 py-6">
                    <div className="space-y-3">
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>ÉQUIPES</p>
                          <p className="pixel-text text-xs text-white">
                            {String(friend.teams_count ?? 0)}
                          </p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>COMBATS</p>
                          <p className="pixel-text text-xs text-white">
                            {String(friend.total_battles ?? 0)}
                          </p>
                        </div>
                      </div>

                      <div style={{ 
                        borderTop: '2px solid rgba(255, 255, 255, 0.2)',
                        paddingTop: '1rem',
                        marginTop: '1rem'
                      }}>
                        <p className="pixel-text text-xs mb-2" style={{ color: '#FACC15', marginLeft: '0.5rem' }}>
                          HISTORIQUE DE COMBAT
                        </p>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: '0.5rem',
                          textAlign: 'center'
                        }}>
                          <div>
                            <p className="pixel-text text-xs" style={{ color: '#FACC15', fontSize: '0.625rem' }}>
                              TOTAL
                            </p>
                            <p className="pixel-text text-sm text-white mt-1">
                              {String(friend.total_battles ?? 0)}
                            </p>
                          </div>
                          <div>
                            <p className="pixel-text text-xs" style={{ color: '#22C55E', fontSize: '0.625rem' }}>
                              VICTOIRES
                            </p>
                            <p className="pixel-text text-sm mt-1" style={{ color: '#22C55E' }}>
                              {String(friend.losses_against_you ?? 0)}
                            </p>
                          </div>
                          <div>
                            <p className="pixel-text text-xs" style={{ color: '#DC2626', fontSize: '0.625rem' }}>
                              DÉFAITES
                            </p>
                            <p className="pixel-text text-sm mt-1" style={{ color: '#DC2626' }}>
                              {String(friend.wins_against_you ?? 0)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        gap: '0.5rem',
                        marginTop: '1.5rem'
                      }}>
                        <Button
                          onClick={() => window.location.href = `/battle/new?opponent=${friend.id}`}
                          className="pokemon-button"
                          style={{ 
                            flex: 1,
                            margin: '0.5rem',
                            boxSizing: 'border-box',
                            background: '#22C55E'
                          }}
                        >
                          <span className="pixel-text text-xs" style={{ color: '#000' }}>DÉFIER</span>
                        </Button>
                        <Button
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="pokemon-button"
                          style={{ 
                            flex: 1,
                            margin: '0.5rem',
                            boxSizing: 'border-box',
                            background: '#DC2626'
                          }}
                        >
                          <span className="pixel-text text-xs" style={{ color: '#FFF' }}>RETIRER</span>
                        </Button>
                      </div>
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
                  Vous n'avez pas encore d'amis
                </p>
                <p className="pixel-text text-xs text-white mt-4" style={{ opacity: 0.7 }}>
                  Utilisez la recherche pour trouver des dresseurs !
                </p>
                <div style={{ margin: '1rem' }}>
                  <Button
                    onClick={() => window.location.href = '/friends/search'}
                    className="pokemon-button mt-6"
                    style={{ padding: '0.75rem 1.5rem', width: '100%' }}
                  >
                    <span className="pixel-text text-xs" style={{ color: '#000' }}>
                      RECHERCHER DES AMIS
                    </span>
                  </Button>
                </div>
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
