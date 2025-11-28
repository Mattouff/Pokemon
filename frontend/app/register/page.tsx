'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(formData.password)) {
      setError('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*(),.?":{}|<>)');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };

      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Réponse du serveur:', data);

      if (!response.ok) {
        const errorMessage = data.error?.message || data.message || 'Erreur lors de l\'inscription';
        throw new Error(errorMessage);
      }

      if (!data.data?.accessToken || !data.data?.refreshToken) {
        console.error('Structure de réponse invalide:', data);
        throw new Error('Réponse du serveur invalide');
      }

      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      const user = {
        username: formData.username,
        email: formData.email
      };
      localStorage.setItem('user', JSON.stringify(user));

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pokemon-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <Card className="pokemon-card">
          <CardHeader className="text-center pokemon-header px-6">
            <CardTitle className="pokemon-title">INSCRIPTION</CardTitle>
            <CardDescription className="pixel-text text-xs text-white mt-2">
              Rejoins l'arène !
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div style={{ 
                  background: '#DC2626', 
                  border: '4px solid #000',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginTop: '1rem'
                }}>
                  <p className="pixel-text text-xs text-white">{error}</p>
                </div>
              )}
              <div style={{ marginTop: '1.5rem' }}>
                <Label htmlFor="username" className="pixel-text text-xs">Pseudo</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="pokemon-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <Label htmlFor="email" className="pixel-text text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="pokemon-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <Label htmlFor="password" className="pixel-text text-xs">Mot de passe</Label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    required
                    className="pokemon-input"
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
              <div style={{ marginTop: '1.5rem' }}>
                <Label htmlFor="confirmPassword" className="pixel-text text-xs">Confirmer mot de passe</Label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    required
                    className="pokemon-input"
                    style={{ width: '100%', paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {showConfirmPassword ? (
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
              <div style={{ marginTop: '2rem' }}>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="pokemon-button bg-blue-600 hover:bg-blue-700" 
                  style={{ color: '#000', opacity: loading ? 0.5 : 1 }}
                >
                  <span className="pixel-text text-xs">
                    {loading ? 'CHARGEMENT...' : 'S\'INSCRIRE'}
                  </span>
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 px-6 pb-6">
            <div className="text-center w-full">
              <p className="pixel-text text-xs text-white">
                Déjà un compte ?{' '}
                <a href="/login" className="pixel-text text-xs hover:underline" style={{ color: '#FACC15' }}>
                  Se connecter
                </a>
              </p>
            </div>
            <div className="w-full text-center">
              <a href="/" className="pokemon-button bg-red-600 hover:bg-red-700 inline-block"
                 style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                <span className="pixel-text text-xs">← RETOUR À L'ACCUEIL</span>
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
