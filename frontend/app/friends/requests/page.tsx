'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PokemonHeader from '@/components/PokemonHeader';

type FriendRequest = {
  id: number;
  friendship_id: number;
  sender_id: number;
  sender_username?: string;
  receiver_username?: string;
  username?: string;
  sent_at: string;
  teams_count: number;
  total_battles: number;
};

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();
    fetchSentRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:3001/api/friends/requests/pending', {
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
        throw new Error('Erreur lors de la récupération des demandes');
      }

      const data = await response.json();
      setRequests(data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await fetch('http://localhost:3001/api/friends/requests/sent', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSentRequests(data.data || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleAccept = async (friendshipId: number) => {
    setProcessingId(friendshipId);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/friends/requests/${friendshipId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'acceptation');
      }

      setRequests(requests.filter(r => r.friendship_id !== friendshipId));
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible d\'accepter cette demande');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (friendshipId: number) => {
    setProcessingId(friendshipId);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/friends/requests/${friendshipId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du refus');
      }

      setRequests(requests.filter(r => r.friendship_id !== friendshipId));
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible de refuser cette demande');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
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
        title="DEMANDES D'AMI"
        buttons={[
          { label: '← MES AMIS', href: '/friends' },
          { label: 'RECHERCHER', href: '/friends/search' }
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Requests Count */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <Card style={{
              background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
              border: '4px solid #000',
              borderRadius: '12px',
              boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
              width: '100%'
            }}>
              <CardContent className="px-6 py-6 text-center">
                <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>
                  REÇUES
                </p>
                <p className="pixel-text text-3xl text-white mt-2">
                  {requests.length}
                </p>
              </CardContent>
            </Card>
            <Card style={{
              background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
              border: '4px solid #000',
              borderRadius: '12px',
              boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
              width: '100%'
            }}>
              <CardContent className="px-6 py-6 text-center">
                <p className="pixel-text text-xs" style={{ color: '#FACC15' }}>
                  ENVOYÉES
                </p>
                <p className="pixel-text text-3xl text-white mt-2">
                  {sentRequests.length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Received Requests Section */}
          {requests.length > 0 ? (
            <Card style={{
              background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
              border: '4px solid #000',
              borderRadius: '12px',
              boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
              width: '100%'
            }}>
              <CardHeader className="pokemon-header px-6">
                <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>
                  DEMANDES REÇUES
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-6">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p className="pixel-text text-sm text-white">
                          {(request.username || request.sender_username || 'Utilisateur').toUpperCase()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <p className="pixel-text text-xs" style={{ color: '#FACC15', fontSize: '0.625rem' }}>
                            ÉQUIPES
                          </p>
                          <p className="pixel-text text-sm text-white" style={{ marginTop: '0.25rem' }}>
                            {request.teams_count}
                          </p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p className="pixel-text text-xs" style={{ color: '#FACC15', fontSize: '0.625rem' }}>
                            COMBATS
                          </p>
                          <p className="pixel-text text-sm text-white" style={{ marginTop: '0.25rem' }}>
                            {request.total_battles}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Button
                            onClick={() => handleAccept(request.friendship_id)}
                            disabled={processingId === request.friendship_id}
                            className="pokemon-button"
                            style={{ 
                              padding: '0.5rem 1rem',
                              boxSizing: 'border-box',
                              background: '#22C55E',
                              opacity: processingId === request.id ? 0.5 : 1
                            }}
                          >
                            <span className="pixel-text text-xs" style={{ color: '#000', fontSize: '0.625rem' }}>
                              ACCEPTER
                            </span>
                          </Button>
                          <Button
                            onClick={() => handleReject(request.friendship_id)}
                            disabled={processingId === request.friendship_id}
                            className="pokemon-button"
                            style={{ 
                              padding: '0.5rem 1rem',
                              boxSizing: 'border-box',
                              background: '#DC2626',
                              opacity: processingId === request.id ? 0.5 : 1
                            }}
                          >
                            <span className="pixel-text text-xs" style={{ color: '#FFF', fontSize: '0.625rem' }}>
                              REFUSER
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                  Aucune demande d'ami en attente
                </p>
                <p className="pixel-text text-xs text-white mt-4" style={{ opacity: 0.7 }}>
                  Les nouvelles demandes apparaîtront ici
                </p>
              </CardContent>
            </Card>
          )}

          {/* Sent Requests Section */}
          {sentRequests.length > 0 && (
            <Card style={{
              background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
              border: '4px solid #000',
              borderRadius: '12px',
              boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
              width: '100%',
              marginTop: '2rem'
            }}>
              <CardHeader className="pokemon-header px-6">
                <CardTitle className="pixel-text text-sm text-white" style={{ marginLeft: '1rem' }}>
                  DEMANDES ENVOYÉES
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-6">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {sentRequests.map((request) => (
                    <div
                      key={request.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p className="pixel-text text-sm text-white">
                          {(request.username || request.receiver_username || request.sender_username || 'Utilisateur').toUpperCase()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <p className="pixel-text text-xs" style={{ color: '#FACC15', fontSize: '0.625rem' }}>
                            ÉQUIPES
                          </p>
                          <p className="pixel-text text-sm text-white" style={{ marginTop: '0.25rem' }}>
                            {String(request.teams_count ?? 0)}
                          </p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p className="pixel-text text-xs" style={{ color: '#FACC15', fontSize: '0.625rem' }}>
                            COMBATS
                          </p>
                          <p className="pixel-text text-sm text-white" style={{ marginTop: '0.25rem' }}>
                            {String(request.total_battles ?? 0)}
                          </p>
                        </div>
                        <div style={{
                          background: '#FACC15',
                          border: '2px solid #000',
                          borderRadius: '4px',
                          padding: '0.25rem 0.75rem',
                        }}>
                          <span className="pixel-text text-xs" style={{ color: '#000', fontSize: '0.625rem' }}>
                            EN ATTENTE
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
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
