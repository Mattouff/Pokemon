'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

interface PendingHack {
  battle_hack_id: number;
  battle_id: number;
  hack: {
    code: string;
    type: string;
    difficulty: string;
    description: string;
  };
  probability: number;
  created_at: string;
}

interface HackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onHackResolved?: () => void;
}

export default function HackPopup({ isOpen, onClose, onHackResolved }: HackPopupProps) {
  const router = useRouter();
  const [pendingHacks, setPendingHacks] = useState<PendingHack[]>([]);
  const [selectedHack, setSelectedHack] = useState<PendingHack | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ is_correct: boolean; penalty?: any } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPendingHacks();
    }
  }, [isOpen]);

  const fetchPendingHacks = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock data - à remplacer par l'API GET /hacks/pending
      setTimeout(() => {
        // Un seul hack à la fois pour ce combat (à implémenter plusieurs hacks par combat)
        const mockHack: PendingHack = {
          battle_hack_id: 1,
          battle_id: 42,
          hack: {
            code: 'F3Z4D2',
            type: 'Hexadécimal',
            difficulty: 'Facile',
            description: 'Convertir le code hexadécimal en texte lisible',
          },
          probability: 15,
          created_at: new Date().toISOString(),
        };
        setPendingHacks([mockHack]);
        setSelectedHack(mockHack);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHack || !answer.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      // Mock data - à remplacer par l'API POST /hacks/submit
      setTimeout(() => {
        const correctAnswers: { [key: string]: string } = {
          'F3Z4D2': 'FEED',
          'GRX-7TH9': 'PAUSE',
          'a1b2c3': 'CATCH',
          'P@ss1234': 'OPEN',
          'tEmP-100': 'DEFEND',
        };

        const hackCode = selectedHack.hack.code;
        const correctAnswer = correctAnswers[hackCode];
        const isCorrect = answer.trim().toUpperCase() === correctAnswer;

        const mockResult = {
          is_correct: isCorrect,
          penalty: isCorrect ? undefined : {
            type: selectedHack.hack.difficulty === 'Très Difficile' ? 'team_lost' as const : 'attack_debuff' as const,
            value: selectedHack.hack.difficulty === 'Facile' ? 10 : 
                   selectedHack.hack.difficulty === 'Moyenne' ? 20 : 
                   selectedHack.hack.difficulty === 'Difficile' ? 30 : 0,
          },
        };

        setResult(mockResult);
        setSubmitting(false);
        
        // Fermer après 2 secondes (succès ou échec)
        setTimeout(() => {
          if (onHackResolved) onHackResolved();
          handleClose();
        }, 2000);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedHack(null);
    setAnswer('');
    setError(null);
    setResult(null);
    setShowCancelWarning(false);
    onClose();
  };

  const handleCancelAttempt = () => {
    if (result) {
      // Si déjà un résultat (succès/échec), fermer directement
      handleClose();
    } else {
      // Sinon, afficher l'avertissement de pénalité
      setShowCancelWarning(true);
    }
  };

  const handleConfirmCancel = () => {
    // Appliquer la pénalité d'abandon
    const penaltyResult = {
      is_correct: false,
      penalty: {
        type: 'attack_debuff' as const,
        value: selectedHack?.hack.difficulty === 'Facile' ? 10 : 
               selectedHack?.hack.difficulty === 'Moyenne' ? 20 : 
               selectedHack?.hack.difficulty === 'Difficile' ? 30 : 50,
      },
    };
    setResult(penaltyResult);
    setShowCancelWarning(false);
    
    // Fermer après 2 secondes
    setTimeout(() => {
      if (onHackResolved) onHackResolved();
      handleClose();
    }, 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile': return 'bg-green-500';
      case 'Moyenne': return 'bg-yellow-500';
      case 'Difficile': return 'bg-orange-500';
      case 'Très Difficile': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isOpen) return null;
  if (!mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 animate-fadeIn"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 9999,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp relative">
        {loading ? (
          <div className="p-12 text-center">
            <div className="pixel-text text-6xl mb-4 text-yellow-500 animate-pulse">...</div>
            <p className="pixel-text text-gray-700 text-lg">CHARGEMENT</p>
          </div>
        ) : showCancelWarning ? (
          <div className="p-12 text-center" style={{ background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)' }}>
            <div className="bg-black border-4 border-yellow-500 p-8 rounded-lg mb-6">
              <p className="pixel-text text-2xl text-yellow-400 mb-4">ATTENTION !</p>
              <p className="pixel-text text-white text-lg mb-6">
                ABANDONNER CE HACK<br />ENTRAINERA UNE PENALITE
              </p>
              <div className="bg-red-900 border-2 border-red-500 p-4 rounded">
                <p className="pixel-text text-red-300 text-xl font-bold">
                  PENALITE : -{selectedHack?.hack.difficulty === 'Facile' ? 10 : 
                     selectedHack?.hack.difficulty === 'Moyenne' ? 20 : 
                     selectedHack?.hack.difficulty === 'Difficile' ? 30 : 50}% ATTAQUE
                </p>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="pokemon-button pixel-text px-8 py-4 border-4 border-black shadow-lg"
                style={{ 
                  boxShadow: '0 4px 0 #000',
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF'
                }}
              >
                CONTINUER
              </button>
              <button
                onClick={handleConfirmCancel}
                className="pokemon-button pixel-text px-8 py-4 border-4 border-black shadow-lg"
                style={{ 
                  boxShadow: '0 4px 0 #000',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF'
                }}
              >
                ABANDONNER
              </button>
            </div>
          </div>
        ) : result ? (
          <div className="p-12 text-center" style={{ 
            background: result.is_correct 
              ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' 
              : 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
          }}>
            <div className="bg-black border-4 border-white p-8 rounded-lg">
              {result.is_correct ? (
                <>
                  <p className="pixel-text text-5xl text-green-400 mb-6">SUCCES !</p>
                  <p className="pixel-text text-white text-xl mb-4">
                    HACK RESOLU
                  </p>
                  <p className="pixel-text text-green-300 text-lg">
                    CODE DECHIFFRE<br />AVEC SUCCES
                  </p>
                </>
              ) : (
                <>
                  <p className="pixel-text text-5xl text-red-400 mb-6">ECHEC !</p>
                  <p className="pixel-text text-white text-xl mb-4">
                    REPONSE INCORRECTE
                  </p>
                  {result.penalty && (
                    <div className="bg-red-900 border-2 border-red-500 p-4 rounded mt-4">
                      <p className="pixel-text text-red-300 font-bold text-lg">
                        {result.penalty.type === 'team_lost'
                          ? 'EQUIPE PERDUE !'
                          : `MALUS : -${result.penalty.value}% ATTAQUE`}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : pendingHacks.length === 0 ? (
          <div className="p-12 text-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)' }}>
            <div className="bg-black border-4 border-white p-8 rounded-lg">
              <p className="pixel-text text-4xl text-blue-400 mb-4">AUCUN HACK</p>
              <p className="pixel-text text-white text-lg mb-6">EN ATTENTE</p>
              <button
                onClick={handleClose}
                className="pokemon-button pixel-text bg-red-600 hover:bg-red-700 text-white px-8 py-4 border-4 border-black"
                style={{ boxShadow: '0 4px 0 #000' }}
              >
                FERMER
              </button>
            </div>
          </div>
        ) : selectedHack && (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-700 p-6 rounded-t-2xl border-b-4 border-black">
              <div className="flex justify-between items-center">
                <h2 className="pixel-text text-3xl text-white">HACK DETECTE !</h2>
                <button
                  onClick={handleCancelAttempt}
                  className="pixel-text text-white hover:bg-white/20 rounded-lg px-3 py-1 transition-colors border-2 border-white"
                >
                  X
                </button>
              </div>
              <p className="pixel-text text-white/90 mt-2 text-sm">COMBAT #{selectedHack.battle_id}</p>
            </div>

            {/* Body */}
            <div className="p-8" style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)' }}>
              {/* Badge difficulté */}
              <div className="flex justify-between items-center mb-6">
                <span
                  className={`pixel-text px-6 py-3 rounded-lg text-white text-lg border-4 border-black ${getDifficultyColor(
                    selectedHack.hack.difficulty
                  )}`}
                  style={{ boxShadow: '0 4px 0 #000' }}
                >
                  {selectedHack.hack.difficulty.toUpperCase()}
                </span>
                <span className="pixel-text text-yellow-400 text-sm">
                  PROBA: {selectedHack.probability}%
                </span>
              </div>

              {/* Code crypté */}
              <div className="bg-black text-green-400 p-8 rounded-lg mb-6 text-center border-4 border-green-600">
                <p className="pixel-text text-sm mb-2 text-green-600">CODE CRYPTE</p>
                <p className="pixel-text text-4xl font-bold tracking-wider">{selectedHack.hack.code}</p>
              </div>

              {/* Type et Description */}
              <div className="bg-blue-900 border-4 border-blue-500 rounded-lg p-6 mb-6">
                <p className="pixel-text text-blue-200 mb-2">
                  TYPE: {selectedHack.hack.type.toUpperCase()}
                </p>
                <p className="pixel-text text-white">
                  INDICE: {selectedHack.hack.description}
                </p>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="pixel-text block text-yellow-400 mb-3 text-lg">
                    VOTRE REPONSE:
                  </label>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="ENTREZ LA SOLUTION..."
                    className="pixel-text w-full px-6 py-4 border-4 border-white rounded-lg text-lg uppercase focus:outline-none focus:border-yellow-400 transition-colors bg-gray-800 text-white"
                    style={{ boxShadow: '0 4px 0 #000' }}
                    disabled={submitting}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-900 border-4 border-red-500 text-red-300 px-6 py-4 rounded-lg mb-6">
                    <p className="pixel-text">{error}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting || !answer.trim()}
                    className="pokemon-button pixel-text flex-1 px-8 py-4 rounded-lg border-4 border-black shadow-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      boxShadow: '0 4px 0 #000',
                      backgroundColor: '#16A34A',
                      color: '#FFFFFF'
                    }}
                  >
                    {submitting ? 'VERIFICATION...' : 'SOUMETTRE'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAttempt}
                    className="pokemon-button pixel-text px-8 py-4 rounded-lg border-4 border-black shadow-lg"
                    style={{ 
                      boxShadow: '0 4px 0 #000',
                      backgroundColor: '#4B5563',
                      color: '#FFFFFF'
                    }}
                  >
                    ANNULER
                  </button>
                </div>
              </form>

              {/* Warning */}
              <p className="pixel-text mt-6 text-center text-sm text-red-400">
                ATTENTION: MAUVAISE REPONSE = PENALITE !
              </p>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
