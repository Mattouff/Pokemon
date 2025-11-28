'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    setIsLoggedIn(!!accessToken);
  }, []);

  return (
    <div className="min-h-screen pokemon-bg">
      {/* Header */}
      <header className="pokemon-header">
        <div className="container mx-auto px-4 py-6">
          <h1 className="pokemon-title text-center">
            POKEMON BATTLE ARENA
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="pokemon-card mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-yellow-400 pixel-text">
            Bienvenue Dresseur !
          </h2>
          <p className="text-xl mb-6 text-white">
            Prépare-toi à devenir le meilleur dresseur Pokémon !
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Feature 1 */}
          <div className="pokemon-card hover-lift">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2 text-yellow-400">Combats Épiques</h3>
              <p className="text-white text-sm">
                Affronte d'autres dresseurs dans des combats stratégiques au tour par tour
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="pokemon-card hover-lift">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2 text-yellow-400">Équipes Personnalisées</h3>
              <p className="text-white text-sm">
                Crée et gère ton équipe de 6 Pokémons parmi les 151 Pokémons
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="pokemon-card hover-lift">
            <div className="text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-xl font-bold mb-2 text-yellow-400">Système d'Amitié</h3>
              <p className="text-white text-sm">
                Ajoute des amis et défie-les dans des combats amicaux
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="pokemon-card hover-lift">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2 text-yellow-400">Hacks de Combat</h3>
              <p className="text-white text-sm">
                Utilise des hacks stratégiques pour modifier le cours du combat
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="pokemon-card hover-lift">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2 text-yellow-400">Météo Dynamique</h3>
              <p className="text-white text-sm">
                La météo influence les combats et les statistiques des Pokémons
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="pokemon-card hover-lift">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2 text-yellow-400">Statistiques Détaillées</h3>
              <p className="text-white text-sm">
                Consulte tes statistiques et l'historique de tes combats
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="pokemon-card text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-yellow-400 pixel-text">
            {isLoggedIn ? 'Prêt pour l\'aventure !' : 'Commence ton aventure maintenant !'}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <>
                <a
                  href="/dashboard"
                  className="pokemon-button"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <span className="pixel-text" style={{ color: '#000' }}>DASHBOARD</span>
                </a>
                <a
                  href="/friends"
                  className="pokemon-button"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <span className="pixel-text" style={{ color: '#000' }}>FRIENDS</span>
                </a>
                <a
                  href="/teams"
                  className="pokemon-button"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <span className="pixel-text" style={{ color: '#000' }}>ÉQUIPES</span>
                </a>
                <a
                  href="/battle/new"
                  className="pokemon-button"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <span className="pixel-text" style={{ color: '#000' }}>COMBATTRE</span>
                </a>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="pokemon-button"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <span className="pixel-text" style={{ color: '#000' }}>SE CONNECTER</span>
                </a>
                <a
                  href="/register"
                  className="pokemon-button"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <span className="pixel-text" style={{ color: '#000' }}>S'INSCRIRE</span>
                </a>
              </>
            )}
          </div>
          <p className="text-white text-sm mt-4"  style={{ color: '#FACC15' }}>
            {isLoggedIn ? 'Que l\'aventure continue !' : 'Rejoins des milliers de dresseurs dans l\'arène !'}
          </p>
        </div>
      </main>
      <div style={{ height: '2rem' }}></div>

      {/* Footer */}
      <footer className="pokemon-footer mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm" style={{ color: 'white', paddingBottom: '1rem' }}>
            © 2025 Pokémon Battle Arena - Test Technique Project
          </p>
        </div>
      </footer>
    </div>
  );
}
