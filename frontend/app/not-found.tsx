'use client';

export default function NotFound() {
  return (
    <div className="min-h-screen pokemon-bg flex items-center justify-center px-4">
      <div className="pokemon-card max-w-2xl w-full text-center">
        {/* Error Code */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="pixel-404">4</span>
            <div className="pokeball-404"></div>
            <span className="pixel-404" style={{paddingLeft:'1%'}}>4</span>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 pixel-error">
            ERREUR !
          </h1>
          <div className="pokemon-dialogue-box">
            <p className="text-white text-sm">
              Le Professeur Chen dit : <br />
              <span className="text-yellow-300">
                "Cette route n'existe pas, Dresseur ! <br />
                Retourne au Centre Pokémon !"
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/"
            className="pokemon-button bg-red-600 hover:bg-red-700"
          >
            <span className="pixel-text">← RETOUR À L'ACCUEIL</span>
          </a>
          <button
            onClick={() => window.history.back()}
            className="pokemon-button bg-red-600 hover:bg-red-700"
          >
            <span className="pixel-text" style={{ color: '#000' }}>↶ PAGE PRÉCÉDENTE</span>
          </button>
        </div>

        {/* Easter Egg */}
        <div className="mt-8 text-xs">
          <p style={{ color: '#FACC15' }}>Astuce : Utilise ton Pokédex pour retrouver ton chemin !</p>
        </div>
      </div>
    </div>
  );
}
