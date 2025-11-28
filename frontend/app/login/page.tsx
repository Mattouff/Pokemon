'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!pseudo.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        username: pseudo.trim(),
        password: password
      };

      console.log('Envoi de la requête:', payload);

      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Réponse du serveur:', data);
      console.log('Structure data.data:', data.data);

      if (!response.ok) {
        const errorMessage = data.error?.message || data.message || 'Erreur lors de la connexion';
        throw new Error(errorMessage);
      }

      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      
      if (data.data.user) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pokemon-bg flex items-center justify-center px-4">
      <div className="w-full max-w-5xl flex items-center justify-center gap-8">
        <div className="hidden lg:block pokeball-decoration-large"></div>

        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
          <h1 className="pokemon-title text-4xl mb-4">CONNEXION</h1>
            <p className="text-yellow-400 text-lg pixel-text" style={{ color: '#FFFFFF' }}>
              Accède à ton compte Dresseur
            </p>
          </div>

          <Card className="pokemon-card border-4 border-black !p-0">
          <CardHeader className="space-y-0 px-6 py-3 pb-2">
            <CardTitle className="text-lg text-yellow-400 text-center pixel-text" style={{ color: '#FACC15' }}>
              Bienvenue !
            </CardTitle>
            <CardDescription className="text-center text-gray-300 text-xs" style={{ color: '#FFFFFF' }}>
              Entre tes identifiants
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-3 pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div style={{ 
                  background: '#DC2626', 
                  border: '4px solid #000',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <p className="pixel-text text-xs text-white">{error}</p>
                </div>
              )}
              <div className="space-y-1 w-full">
                <Label htmlFor="username" className="text-white pixel-text text-xs">
                  PSEUDO
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="SachaLeDresseur"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  required
                  className="pokemon-input w-full"
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginTop: '8px' }}></div>
              <div className="space-y-1 w-full">
                <Label htmlFor="password" className="text-white pixel-text text-xs">
                  MOT DE PASSE
                </Label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    required
                    className="pokemon-input w-full"
                    style={{ width: '100%', paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      padding: '0.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="13" fill="#FBBF24" opacity="0.3"/>
                        <circle cx="12" cy="12" r="11" fill="#FBBF24" opacity="0.5"/>
                        <circle cx="12" cy="12" r="9" fill="#FBBF24" opacity="0.7"/>
                        <path d="M 2,14 A 10,10 0 0,0 22,14 L 16,14 A 4,4 0 0,1 8,14 Z" fill="#FFF" stroke="#000" strokeWidth="2"/>
                        <path d="M 2,10 A 10,10 0 0,1 22,10 L 16,10 A 4,4 0 0,0 8,10 Z" fill="#EF4444" stroke="#000" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" fill="#FFF" stroke="#000" strokeWidth="1.5"/>
                        <circle cx="12" cy="12" r="1.5" fill="#000"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#FFF" stroke="#000" strokeWidth="2"/>
                        <path d="M 2,12 A 10,10 0 0,1 22,12 L 16,12 A 4,4 0 0,0 8,12 Z" fill="#EF4444"/>
                        <circle cx="12" cy="12" r="4" fill="#FFF" stroke="#000" strokeWidth="1.5"/>
                        <circle cx="12" cy="12" r="2" fill="#000"/>
                        <line x1="2" y1="12" x2="22" y2="12" stroke="#000" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div style={{ marginTop: '24px' }}></div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full pokemon-button bg-red-600 hover:bg-red-700 text-white font-bold py-2"
                style={{ color: '#000' }}
              >
                <span className="pixel-text text-xs">
                  {isLoading ? 'CONNEXION...' : 'SE CONNECTER'}
                </span>
              </Button>
            </form>
          </CardContent>
          <div style={{ marginTop: '24px' }}></div>
          <CardFooter className="flex flex-col space-y-2 px-6 py-3 pt-0">
            <div className="text-center w-full">
              <a href="#" className="text-yellow-400 hover:text-yellow-300 text-xs pixel-text" style={{ color: '#FACC15' }}>
                Mot de passe oublié ?
              </a>
            </div>
            <div className="text-center w-full text-xs pixel-text">
              Pas encore de compte ?{' '}
              <a href="/register" className="text-yellow-400 hover:text-yellow-300 font-bold pixel-text" style={{ color: '#FACC15' }}>
                S'inscrire
              </a>
            </div>
          </CardFooter>
          </Card>
          <div style={{ marginTop: '20px' }}></div>

          <div className="text-center mt-6">
            <a
                href="/"
                className="pokemon-button bg-red-600 hover:bg-red-700 inline-block"
                style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
            >
                <span className="pixel-text text-xs">← RETOUR À L'ACCUEIL</span>
            </a>
          </div>
        </div>

        <div className="hidden lg:block pokeball-decoration-large"></div>
      </div>
    </div>
  );
}
