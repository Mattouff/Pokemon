'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PokemonHeader from '@/components/PokemonHeader';

type SearchResult = {
  id: number;
  username: string;
  teams_count: number;
  total_battles: number;
  is_friend: boolean;
  request_sent: boolean;
};

export default function FriendSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sendingRequestTo, setSendingRequestTo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:3001/api/friends/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'Erreur lors de la recherche');
        setResults([]);
        return;
      }

      setError(null);
      setResults(data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la recherche');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (userId: number) => {
    setSendingRequestTo(userId);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      const userToAdd = results.find(u => u.id === userId);
      
      const response = await fetch('http://localhost:3001/api/friends/requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          friend_username: userToAdd?.username
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur lors de l\'envoi');
      }

      setResults(results.map(user => 
        user.id === userId ? { ...user, request_sent: true } : user
      ));
    } catch (error) {
      console.error('Erreur:', error);
      alert(error instanceof Error ? error.message : 'Impossible d\'envoyer la demande');
    } finally {
      setSendingRequestTo(null);
    }
  };

  return (
    <div className="min-h-screen pokemon-bg">
      <PokemonHeader 
        title="RECHERCHER DES AMIS"
        buttons={[
          { label: '← MES AMIS', href: '/friends' },
          { label: 'DEMANDES', href: '/friends/requests' }
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Error Message */}
          {error && (
            <Card style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              border: '4px solid #000',
              borderRadius: '12px',
              boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
              width: '100%',
              marginBottom: '2rem'
            }}>
              <CardContent className="px-6 py-4">
                <p className="pixel-text text-sm text-white text-center">
                  {error}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Search Form */}
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
            width: '100%',
            marginBottom: '2rem'
          }}>
            <CardContent className="px-6 py-6">
              <form onSubmit={handleSearch}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem' }}>
                  <Input
                    type="text"
                    placeholder="Nom du dresseur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pokemon-input"
                    style={{ width: '100%' }}
                  />
                  <Button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="pokemon-button"
                    style={{ 
                      padding: '0.75rem 1.5rem',
                      opacity: isSearching || !searchQuery.trim() ? 0.5 : 1,
                      width: '100%'
                    }}
                  >
                    <span className="pixel-text text-xs" style={{ color: '#000' }}>
                      {isSearching ? 'RECHERCHE...' : 'CHERCHER'}
                    </span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Search Results */}
          {hasSearched && (
            <>
              {results.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {results.map((user) => (
                    <Card
                      key={user.id}
                      style={{
                        background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
                        border: '4px solid #000',
                        borderRadius: '12px',
                        boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
                        width: '100%'
                      }}
                    >
                      <CardHeader className="pokemon-header px-6">
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginLeft: '1rem',
                          marginRight: '1rem'
                        }}>
                          <CardTitle className="pixel-text text-sm text-white">
                            {user.username.toUpperCase()}
                          </CardTitle>
                          {user.is_friend && (
                            <div style={{
                              background: '#22C55E',
                              border: '2px solid #000',
                              borderRadius: '4px',
                              padding: '0.25rem 0.75rem',
                            }}>
                              <span className="pixel-text text-xs" style={{ color: '#000' }}>
                                AMI
                              </span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="px-6 py-6">
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          gap: '2rem',
                          marginLeft: '1rem',
                          marginRight: '1rem'
                        }}>
                          {/* User Stats */}
                          <div style={{ 
                            display: 'flex', 
                            gap: '3rem',
                            flex: 1
                          }}>
                            <div style={{ textAlign: 'center' }}>
                              <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>
                                ÉQUIPES
                              </p>
                              <p className="pixel-text text-lg text-white" style={{ marginTop: '0.5rem' }}>
                                {String(user.teams_count ?? 0)}
                              </p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>
                                COMBATS
                              </p>
                              <p className="pixel-text text-lg text-white" style={{ marginTop: '0.5rem' }}>
                                {String(user.total_battles ?? 0)}
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div>
                            {user.is_friend ? (
                              <Button
                                disabled
                                className="pokemon-button"
                                style={{ 
                                  padding: '0.75rem 1.5rem',
                                  boxSizing: 'border-box',
                                  opacity: 0.5
                                }}
                              >
                                <span className="pixel-text text-xs" style={{ color: '#000' }}>
                                  DÉJÀ AMI
                                </span>
                              </Button>
                            ) : user.request_sent ? (
                              <Button
                                disabled
                                className="pokemon-button"
                                style={{ 
                                  padding: '0.75rem 1.5rem',
                                  boxSizing: 'border-box',
                                  background: '#FACC15',
                                  opacity: 0.7
                                }}
                              >
                                <span className="pixel-text text-xs" style={{ color: '#000' }}>
                                  DEMANDE ENVOYÉE
                                </span>
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleSendRequest(user.id)}
                                disabled={sendingRequestTo === user.id}
                                className="pokemon-button"
                                style={{ 
                                  padding: '0.75rem 1.5rem',
                                  boxSizing: 'border-box',
                                  background: '#22C55E',
                                  opacity: sendingRequestTo === user.id ? 0.5 : 1
                                }}
                              >
                                <span className="pixel-text text-xs" style={{ color: '#000' }}>
                                  {sendingRequestTo === user.id ? 'ENVOI...' : 'AJOUTER'}
                                </span>
                              </Button>
                            )}
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
                      Aucun dresseur trouvé
                    </p>
                    <p className="pixel-text text-xs text-white mt-4" style={{ opacity: 0.7 }}>
                      Essayez avec un autre nom
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Initial State */}
          {!hasSearched && (
            <Card style={{
              background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
              border: '4px solid #000',
              borderRadius: '12px',
              boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
              width: '100%'
            }}>
              <CardContent className="px-6 py-12 text-center">
                <p className="pixel-text text-sm" style={{ color: '#FACC15' }}>
                  Recherchez des dresseurs par leur nom
                </p>
                <p className="pixel-text text-xs text-white mt-4" style={{ opacity: 0.7 }}>
                  Entrez un nom et cliquez sur CHERCHER
                </p>
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
