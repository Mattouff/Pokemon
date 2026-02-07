'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HackPopup from '@/components/HackPopup';

type Pokemon = {
  id: number;
  pokemon_id: number;
  name: string;
  level: number;
  current_hp: number;
  max_hp: number;
  sprite: string;
  sprite_back?: string;
  types: string[];
  status?: string;
  moves: Move[];
};

type Move = {
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
  current_pp: number;
};

type AttackEvent = {
  attacker_name: string;
  attacker_is_player: boolean;
  defender_name: string;
  defender_is_player: boolean;
  move_name?: string;
  damage: number;
  defender_hp_before: number;
  defender_hp_after: number;
  defender_max_hp: number;
  is_ko: boolean;
  next_pokemon_name?: string;
  logs: string[];
};

type TurnResult = {
  first_attack: AttackEvent | null;
  second_attack: AttackEvent | null;
  battle_ended: boolean;
  winner?: 'player' | 'opponent';
};

type BattleState = {
  id: number;
  your_pokemon: Pokemon;
  opponent_pokemon: Pokemon;
  your_team: Pokemon[];
  opponent_team?: Pokemon[];
  weather?: string;
  turn: number;
  is_your_turn: boolean;
  battle_logs: string[];
  is_finished?: boolean;
  winner?: 'player' | 'opponent' | 'draw' | 'flee';
  turn_result?: TurnResult;
};

type ActionMode = 'main' | 'attack' | 'pokemon';

const TYPE_COLORS: { [key: string]: string } = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
};

const WEATHER_EFFECTS: { [key: string]: { bonus: string; malus: string; name: string } } = {
  rainy: { bonus: 'Eau', malus: 'Feu', name: 'PLUIE' },
  rain: { bonus: 'Eau', malus: 'Feu', name: 'PLUIE' },
  sunny: { bonus: 'Feu', malus: 'Glace', name: 'ENSOLEILLÉ' },
  clear: { bonus: 'Feu', malus: 'Glace', name: 'ENSOLEILLÉ' },
  snowy: { bonus: 'Glace', malus: 'Plante', name: 'NEIGE' },
  snow: { bonus: 'Glace', malus: 'Plante', name: 'NEIGE' },
  cloudy: { bonus: 'Normal', malus: 'Aucun', name: 'NUAGEUX' }
};

export default function BattlePage({ params }: { params: Promise<{ id: string }> }) {
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMode, setActionMode] = useState<ActionMode>('main');
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHackPopupOpen, setIsHackPopupOpen] = useState(false);
  const [pendingHacksCount, setPendingHacksCount] = useState(0);
  const [showWeatherTooltip, setShowWeatherTooltip] = useState(false);
  const [battleId, setBattleId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingDefender, setAnimatingDefender] = useState<'player' | 'opponent' | null>(null);
  const [tempLogs, setTempLogs] = useState<string[]>([]);
  const [tempPlayerHp, setTempPlayerHp] = useState<number | null>(null);
  const [tempOpponentHp, setTempOpponentHp] = useState<number | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then(({ id }) => setBattleId(id));
  }, [params]);

  useEffect(() => {
    fetchPendingHacksCount();
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battle?.battle_logs]);

  useEffect(() => {
    if (battleId) {
      loadBattleState();
    }
  }, [battleId]);

  const loadBattleState = async () => {
    if (!battleId) return;
    
    try {
      console.log('🔍 Chargement du combat avec ID:', battleId);
      
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:3001/api/battles/interactive/${battleId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      console.log('📡 Response status:', response.status);

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        console.error('❌ Erreur lors du chargement du combat');
        setLoading(false);
        return;
      }

      const result = await response.json();
      console.log('✅ Combat chargé:', result.data?.battle_id);
      const battleData = result.data;

      const transformedBattle: BattleState = {
        id: 0,
        your_pokemon: {
          id: battleData.current_player_pokemon.id,
          pokemon_id: battleData.current_player_pokemon.pokemon_id,
          name: battleData.current_player_pokemon.name,
          level: 50,
          current_hp: battleData.current_player_pokemon.current_hp,
          max_hp: battleData.current_player_pokemon.max_hp,
          sprite: battleData.current_player_pokemon.sprite,
          sprite_back: battleData.current_player_pokemon.sprite_back,
          types: battleData.current_player_pokemon.types,
          status: battleData.current_player_pokemon.current_hp === 0 ? "K.O." : undefined,
          moves: battleData.current_player_pokemon.moves || []
        },
        opponent_pokemon: {
          id: battleData.current_opponent_pokemon.id,
          pokemon_id: battleData.current_opponent_pokemon.pokemon_id,
          name: battleData.current_opponent_pokemon.name,
          level: 50,
          current_hp: battleData.current_opponent_pokemon.current_hp,
          max_hp: battleData.current_opponent_pokemon.max_hp,
          sprite: battleData.current_opponent_pokemon.sprite,
          types: battleData.current_opponent_pokemon.types,
          status: battleData.current_opponent_pokemon.current_hp === 0 ? "K.O." : undefined,
          moves: battleData.current_opponent_pokemon.moves || []
        },
        your_team: battleData.player_team.map((p: any) => ({
          id: p.id,
          pokemon_id: p.pokemon_id,
          name: p.name,
          level: 50,
          current_hp: p.current_hp,
          max_hp: p.max_hp,
          sprite: p.sprite,
          types: p.types,
          status: p.current_hp === 0 ? "K.O." : undefined,
          moves: p.moves || []
        })),
        opponent_team: battleData.opponent_team?.map((p: any) => ({
          id: p.id,
          pokemon_id: p.pokemon_id,
          name: p.name,
          level: 50,
          current_hp: p.current_hp,
          max_hp: p.max_hp,
          sprite: p.sprite,
          types: p.types,
          status: p.current_hp === 0 ? "K.O." : undefined,
          moves: p.moves || []
        })),
        weather: battleData.weather,
        turn: battleData.turn,
        is_your_turn: !battleData.is_finished,
        battle_logs: battleData.battle_logs,
        is_finished: battleData.is_finished,
        winner: battleData.winner
      };

      setBattle(transformedBattle);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement du combat:', error);
      setLoading(false);
    }
  };

  const handleAttack = async (moveIndex: number) => {
    if (!battle || isProcessing) return;
    
    setIsProcessing(true);
    setIsAnimating(true);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:3001/api/battles/interactive/${battleId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          action: 'attack',
          move_index: moveIndex
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) throw new Error('Erreur lors de l\'attaque');

      const result = await response.json();
      const battleData = result.data;
      const turnResult: TurnResult | undefined = battleData.turn_result;

      if (turnResult && turnResult.first_attack) {
        setTempLogs(turnResult.first_attack.logs);
        setAnimatingDefender(turnResult.first_attack.defender_is_player ? 'player' : 'opponent');
        
        await new Promise(resolve => setTimeout(resolve, 150));
        setAnimatingDefender(null);
        await new Promise(resolve => setTimeout(resolve, 150));
        
        if (turnResult.first_attack.defender_is_player) {
          setTempPlayerHp(turnResult.first_attack.defender_hp_after);
        } else {
          setTempOpponentHp(turnResult.first_attack.defender_hp_after);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (turnResult.second_attack) {
          setTempLogs(turnResult.second_attack.logs);
          setAnimatingDefender(turnResult.second_attack.defender_is_player ? 'player' : 'opponent');
          
          await new Promise(resolve => setTimeout(resolve, 150));
          setAnimatingDefender(null);
          await new Promise(resolve => setTimeout(resolve, 150));
          
          if (turnResult.second_attack.defender_is_player) {
            setTempPlayerHp(turnResult.second_attack.defender_hp_after);
          } else {
            setTempOpponentHp(turnResult.second_attack.defender_hp_after);
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      setTempLogs([]);
      setTempPlayerHp(null);
      setTempOpponentHp(null);
      
      await loadBattleState();
      setActionMode('main');
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsProcessing(false);
      setIsAnimating(false);
    }
  };

  const handleSwitchPokemon = async (pokemonId: number) => {
    if (!battle || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        window.location.href = '/login';
        return;
      }

      const isForced = battle.your_pokemon.current_hp === 0;

      const response = await fetch(`http://localhost:3001/api/battles/interactive/${battleId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          action: 'switch',
          pokemon_id: pokemonId,
          is_forced: isForced
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) throw new Error('Erreur lors du changement de Pokémon');

      await loadBattleState();
      setActionMode('main');
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchPendingHacksCount = async () => {
    try {
      setTimeout(() => {
        setPendingHacksCount(1);
      }, 300);
    } catch (error) {
      console.error('Erreur lors de la récupération des hacks:', error);
    }
  };

  const handleFlee = async () => {
    if (!battleId || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:3001/api/battles/interactive/${battleId}/flee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return;
      }

      setBattle(prev => prev ? {
        ...prev,
        is_finished: true,
        winner: 'flee' as any
      } : null);
    } catch (error) {
      console.error('Erreur:', error);
      window.location.href = '/dashboard';
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHack = () => {
    setIsHackPopupOpen(true);
  };

  const handleHackPopupClose = () => {
    setIsHackPopupOpen(false);
    fetchPendingHacksCount();
  };

  const getHpPercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  const getHpColor = (percentage: number) => {
    if (percentage > 50) return '#22C55E';
    if (percentage > 20) return '#FACC15';
    return '#DC2626';
  };

  if (loading) {
    return (
      <div className="min-h-screen pokemon-bg flex items-center justify-center">
        <p className="pixel-text text-white text-xl">Chargement du combat...</p>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-screen pokemon-bg flex items-center justify-center">
        <p className="pixel-text text-white text-xl">Combat introuvable</p>
      </div>
    );
  }

  const displayPlayerHp = tempPlayerHp !== null ? tempPlayerHp : battle.your_pokemon.current_hp;
  const displayOpponentHp = tempOpponentHp !== null ? tempOpponentHp : battle.opponent_pokemon.current_hp;
  
  const hpPercentageYou = getHpPercentage(displayPlayerHp, battle.your_pokemon.max_hp);
  const hpPercentageOpp = getHpPercentage(displayOpponentHp, battle.opponent_pokemon.max_hp);
  
  const displayLogs = tempLogs.length > 0 ? tempLogs : battle.battle_logs;

  if (battle.is_finished) {
    const isVictory = battle.winner === 'player';
    const isFlee = battle.winner === 'flee';
    
    return (
      <div className="min-h-screen pokemon-bg flex items-center justify-center" style={{ padding: '1rem' }}>
        <Card style={{
          background: isVictory 
            ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
            : 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
          border: '6px solid #000',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '600px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}>
          <CardContent>
            <h1 className="pixel-text" style={{
              fontSize: '4rem',
              color: '#FFF',
              marginBottom: '2rem',
              textShadow: '4px 4px 0px rgba(0, 0, 0, 0.5)'
            }}>
              {isVictory ? 'VICTOIRE' : 'DÉFAITE'}
            </h1>
            
            <p className="pixel-text" style={{
              fontSize: '1.5rem',
              color: '#FFF',
              marginBottom: '2rem'
            }}>
              {isVictory 
                ? 'Tous les Pokémon adverses sont K.O. !'
                : isFlee
                ? 'Vous partez du combat'
                : 'Tous vos Pokémon sont K.O.'}
            </p>

            <Button
              onClick={() => window.location.href = '/battle/history'}
              style={{
                background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                color: '#FFF',
                border: '4px solid #000',
                borderRadius: '8px',
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                cursor: 'pointer',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              className="pixel-text"
            >
              HISTORIQUE
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pokemon-bg" style={{ padding: '1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Top Bar - Weather & Turn */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          {battle.weather && (
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setShowWeatherTooltip(true)}
              onMouseLeave={() => setShowWeatherTooltip(false)}
            >
              <Card style={{
                background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
                border: '4px solid #000',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer'
              }}>
                <p className="pixel-text text-xs text-white">
                  {WEATHER_EFFECTS[battle.weather.toLowerCase()]?.name || battle.weather.toUpperCase()}
                </p>
              </Card>
              
              {showWeatherTooltip && WEATHER_EFFECTS[battle.weather.toLowerCase()] && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  marginTop: '0.5rem',
                  background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                  border: '4px solid #000',
                  borderRadius: '8px',
                  padding: '1rem',
                  minWidth: '200px',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
                  zIndex: 1000
                }}>
                  <p className="pixel-text text-xs mb-2" style={{ color: '#FACC15' }}>
                    EFFETS DE LA MÉTÉO
                  </p>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <p className="pixel-text text-xs" style={{ color: '#22C55E' }}>
                      ↑ BONUS: {WEATHER_EFFECTS[battle.weather.toLowerCase()].bonus}
                    </p>
                  </div>
                  <div>
                    <p className="pixel-text text-xs" style={{ color: '#DC2626' }}>
                      ↓ MALUS: {WEATHER_EFFECTS[battle.weather.toLowerCase()].malus}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '8px',
            padding: '0.5rem 1rem'
          }}>
            <p className="pixel-text text-xs text-white">
              TOUR {battle.turn}
            </p>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          
          <div>
            
            <Card style={{
              background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
              border: '4px solid #000',
              borderRadius: '12px',
              boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
              marginBottom: '2rem'
            }}>
              <CardContent className="px-6 py-6">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <p className="pixel-text text-sm text-white" style={{ marginBottom: '0.5rem', marginLeft: '1rem' }}>
                      {battle.opponent_pokemon.name.toUpperCase()}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', marginLeft: '1rem', marginRight: '1rem' }}>
                      {battle.opponent_pokemon.types.map((type) => (
                        <div
                          key={type}
                          className="pixel-text text-xs"
                          style={{
                            backgroundColor: TYPE_COLORS[type] || '#777',
                            color: '#FFF',
                            border: '2px solid #000',
                            borderRadius: '4px',
                            padding: '0.125rem 0.5rem',
                            fontSize: '0.625rem'
                          }}
                        >
                          {type.toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <div style={{ marginBottom: '0.5rem', marginLeft: '1rem', marginRight: '1rem' }}>
                      <p className="pixel-text text-xs text-white" style={{ marginBottom: '0.25rem' }}>HP: {displayOpponentHp}/{battle.opponent_pokemon.max_hp}</p>
                      <div style={{
                        width: '100%',
                        height: '20px',
                        background: '#000',
                        border: '2px solid #FFF',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${hpPercentageOpp}%`,
                          height: '100%',
                          background: getHpColor(hpPercentageOpp),
                          transition: 'width 0.5s ease'
                        }}></div>
                      </div>
                    </div>
                    {battle.opponent_pokemon.status && (
                      <div style={{
                        background: '#DC2626',
                        border: '3px solid #000',
                        borderRadius: '6px',
                        padding: '0.15rem 0.75rem',
                        display: 'inline-block',
                        marginLeft: '1rem',
                        marginBottom: '0.5rem',
                        textAlign: 'center'
                      }}>
                        <span className="pixel-text" style={{ color: '#FFF', fontSize: '0.7rem' }}>
                          {battle.opponent_pokemon.status.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    width: '150px', 
                    height: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={battle.opponent_pokemon.sprite}
                      alt={battle.opponent_pokemon.name}
                      className="pixelated"
                      style={{ 
                        maxWidth: '150px', 
                        maxHeight: '150px',
                        opacity: animatingDefender === 'opponent' ? 0 : 1,
                        transition: 'opacity 0.15s ease'
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{
              background: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
              border: '4px solid #000',
              borderRadius: '12px',
              boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)',
              marginBottom: '1rem'
            }}>
              <CardContent className="px-6 py-6">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ 
                    width: '150px', 
                    height: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={battle.your_pokemon.sprite_back || battle.your_pokemon.sprite}
                      alt={battle.your_pokemon.name}
                      className="pixelated"
                      style={{ 
                        maxWidth: '150px', 
                        maxHeight: '150px',
                        opacity: animatingDefender === 'player' ? 0 : 1,
                        transition: 'opacity 0.15s ease'
                      }}
                    />
                  </div>
                  {/* Your Info */}
                  <div style={{ flex: 1, textAlign: 'right', paddingLeft: '1rem' }}>
                    <p className="pixel-text text-sm text-white" style={{ marginBottom: '0.5rem', marginRight: '1rem' }}>
                      {battle.your_pokemon.name.toUpperCase()}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', justifyContent: 'flex-end', marginLeft: '1rem', marginRight: '1rem' }}>
                      {battle.your_pokemon.types.map((type) => (
                        <div
                          key={type}
                          className="pixel-text text-xs"
                          style={{
                            backgroundColor: TYPE_COLORS[type] || '#777',
                            color: '#FFF',
                            border: '2px solid #000',
                            borderRadius: '4px',
                            padding: '0.125rem 0.5rem',
                            fontSize: '0.625rem'
                          }}
                        >
                          {type.toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <div style={{ marginBottom: '0.5rem', marginLeft: '1rem', marginRight: '1rem' }}>
                      <p className="pixel-text text-xs text-white" style={{ marginBottom: '0.25rem' }}>
                        HP: {displayPlayerHp}/{battle.your_pokemon.max_hp}
                      </p>
                      <div style={{
                        width: '100%',
                        height: '24px',
                        background: '#000',
                        border: '2px solid #FFF',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${hpPercentageYou}%`,
                          height: '100%',
                          background: getHpColor(hpPercentageYou),
                          transition: 'width 0.5s ease'
                        }}></div>
                      </div>
                    </div>
                    {battle.your_pokemon.status && (
                      <div style={{
                        background: '#DC2626',
                        border: '3px solid #000',
                        borderRadius: '6px',
                        padding: '0.15rem 0.75rem',
                        display: 'inline-block',
                        marginRight: '1rem',
                        marginBottom: '0.5rem',
                        textAlign: 'center'
                      }}>
                        <span className="pixel-text" style={{ color: '#FFF', fontSize: '0.7rem' }}>
                          {battle.your_pokemon.status.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{
              background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
              border: '4px solid #000',
              borderRadius: '12px',
              boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)'
            }}>
              <CardContent style={{ padding: '1.5rem' }}>
                {actionMode === 'main' && (
                  <>
                    {battle.your_pokemon.current_hp === 0 ? (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem'
                      }}>
                        <Button
                          onClick={() => setActionMode('pokemon')}
                          disabled={isProcessing}
                          className="pokemon-button"
                          style={{ 
                            padding: '0.75rem',
                            opacity: isProcessing ? 0.5 : 1
                          }}
                        >
                          <span className="pixel-text text-sm" style={{ color: '#000' }}>POKÉMON</span>
                        </Button>
                        <Button
                          onClick={handleFlee}
                          disabled={isProcessing}
                          className="pokemon-button"
                          style={{ 
                            padding: '0.75rem',
                            background: '#666',
                            opacity: isProcessing ? 0.5 : 1
                          }}
                        >
                          <span className="pixel-text text-sm" style={{ color: '#FFF' }}>FUIR</span>
                        </Button>
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem'
                      }}>
                        <Button
                          onClick={() => setActionMode('attack')}
                          disabled={!battle.is_your_turn || isProcessing}
                          className="pokemon-button"
                          style={{ 
                            padding: '0.75rem',
                            background: '#DC2626',
                            opacity: !battle.is_your_turn || isProcessing ? 0.5 : 1
                          }}
                        >
                          <span className="pixel-text text-sm" style={{ color: '#FFF' }}>ATTAQUER</span>
                        </Button>
                        <Button
                          onClick={() => setActionMode('pokemon')}
                          disabled={!battle.is_your_turn || isProcessing}
                          className="pokemon-button"
                          style={{ 
                            padding: '0.75rem',
                            opacity: !battle.is_your_turn || isProcessing ? 0.5 : 1
                          }}
                        >
                          <span className="pixel-text text-sm" style={{ color: '#000' }}>POKÉMON</span>
                        </Button>
                        <Button
                          onClick={handleHack}
                          disabled={isProcessing}
                          className="pokemon-button"
                          style={{ 
                            padding: '0.75rem',
                            background: '#A040A0',
                            opacity: isProcessing ? 0.5 : 1,
                            position: 'relative'
                          }}
                        >
                          <span className="pixel-text text-sm" style={{ color: '#FFF' }}>
                            HACK {pendingHacksCount > 0 && `(${pendingHacksCount})`}
                          </span>
                        </Button>
                        <Button
                          onClick={handleFlee}
                          disabled={isProcessing}
                          className="pokemon-button"
                          style={{ 
                            padding: '0.75rem',
                            background: '#666',
                            opacity: isProcessing ? 0.5 : 1
                          }}
                        >
                          <span className="pixel-text text-sm" style={{ color: '#FFF' }}>FUIR</span>
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {actionMode === 'attack' && (
                  <div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      {battle.your_pokemon.moves && battle.your_pokemon.moves.length > 0 ? (
                        battle.your_pokemon.moves.map((move, index) => {
                          const moveName = move.name.toUpperCase().replace(/-/g, ' ');
                          const fontSize = moveName.length > 15 ? '0.55rem' : moveName.length > 12 ? '0.65rem' : '0.75rem';
                          
                          return (
                            <Button
                              key={index}
                              onClick={() => handleAttack(index)}
                              disabled={isProcessing || move.current_pp === 0}
                              className="pokemon-button"
                              style={{ 
                                padding: '0.75rem',
                                background: move.current_pp === 0 ? '#666' : (TYPE_COLORS[move.type] || '#A8A878'),
                                opacity: isProcessing || move.current_pp === 0 ? 0.5 : 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.25rem',
                                minHeight: '80px',
                                cursor: move.current_pp === 0 ? 'not-allowed' : 'pointer',
                                filter: move.current_pp === 0 ? 'grayscale(100%)' : 'none'
                              }}
                            >
                              <span 
                                className="pixel-text" 
                                style={{ 
                                  color: move.current_pp === 0 ? '#999' : '#FFF',
                                  fontSize: fontSize,
                                  lineHeight: '1.2',
                                  textAlign: 'center',
                                  wordBreak: 'keep-all',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '100%'
                                }}
                              >
                                {moveName}
                              </span>
                              <span 
                                className="pixel-text" 
                                style={{ 
                                  fontSize: '0.6rem', 
                                  color: move.current_pp === 0 ? '#FF0000' : '#FFF', 
                                  opacity: 1,
                                  fontWeight: move.current_pp === 0 ? 900 : 'normal',
                                  textShadow: move.current_pp === 0 ? '2px 2px 0px rgba(0, 0, 0, 1)' : 'none',
                                  WebkitTextStroke: move.current_pp === 0 ? '1px #8B0000' : 'none'
                                }}
                              >
                                PP: {move.current_pp}/{move.pp}
                              </span>
                            </Button>
                          );
                        })
                      ) : (
                        <Button
                          onClick={() => handleAttack(0)}
                          disabled={isProcessing}
                          className="pokemon-button"
                          style={{ 
                            padding: '0.75rem',
                            background: '#DC2626',
                            opacity: isProcessing ? 0.5 : 1,
                            gridColumn: '1 / -1'
                          }}
                        >
                          <span className="pixel-text text-sm" style={{ color: '#FFF' }}>
                            ATTAQUE NORMALE
                          </span>
                        </Button>
                      )}
                    </div>
                    <Button
                      onClick={() => setActionMode('main')}
                      className="pokemon-button"
                      style={{ padding: '0.5rem', width: '100%' }}
                    >
                      <span className="pixel-text text-xs" style={{ color: '#000' }}>← RETOUR</span>
                    </Button>
                  </div>
                )}

                {actionMode === 'pokemon' && (
                  <div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      {battle.your_team.map((pokemon) => (
                        <div
                          key={pokemon.id}
                          onClick={() => {
                            if (pokemon.current_hp > 0 && pokemon.id !== battle.your_pokemon.id && !isProcessing) {
                              handleSwitchPokemon(pokemon.id);
                            }
                          }}
                          style={{
                            background: pokemon.current_hp === 0 ? '#666' : 
                                       pokemon.id === battle.your_pokemon.id ? '#FACC15' : '#FFFFFF',
                            border: '4px solid #000',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            textAlign: 'center',
                            cursor: pokemon.current_hp > 0 && pokemon.id !== battle.your_pokemon.id && !isProcessing ? 'pointer' : 'not-allowed',
                            opacity: pokemon.current_hp === 0 || pokemon.id === battle.your_pokemon.id || isProcessing ? 0.5 : 1
                          }}
                        >
                          <img
                            src={pokemon.sprite}
                            alt={pokemon.name}
                            className="pixelated"
                            style={{ width: '64px', height: '64px', margin: '0 auto' }}
                          />
                          <p className="pixel-text text-xs mt-2" style={{ color: pokemon.current_hp === 0 ? '#FFF' : '#000' }}>
                            {pokemon.name.toUpperCase()}
                          </p>
                          <p className="pixel-text text-xs mt-1" style={{ 
                            color: pokemon.current_hp === 0 ? '#DC2626' : '#000',
                            opacity: 0.7
                          }}>
                            {pokemon.current_hp === 0 ? 'K.O.' : `${pokemon.current_hp}/${pokemon.max_hp} HP`}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => setActionMode('main')}
                      className="pokemon-button"
                      style={{ padding: '0.5rem', width: '100%' }}
                    >
                      <span className="pixel-text text-xs" style={{ color: '#000' }}>← RETOUR</span>
                    </Button>
                  </div>
                )}

                {!battle.is_your_turn && (
                  <div className="text-center py-4">
                    <p className="pixel-text text-sm" style={{ color: '#FACC15' }}>
                      COMBAT TERMINÉ
                    </p>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.75rem',
                      marginTop: '1rem'
                    }}>
                      <Button
                        onClick={() => window.location.href = '/battle/new'}
                        className="pokemon-button"
                        style={{ padding: '0.75rem', background: '#22C55E' }}
                      >
                        <span className="pixel-text text-xs" style={{ color: '#FFF' }}>NOUVEAU COMBAT</span>
                      </Button>
                      <Button
                        onClick={() => window.location.href = '/dashboard'}
                        className="pokemon-button"
                        style={{ padding: '0.75rem', background: '#2C3E50' }}
                      >
                        <span className="pixel-text text-xs" style={{ color: '#FFF' }}>DASHBOARD</span>
                      </Button>
                    </div>
                  </div>
                )}


              </CardContent>
            </Card>
          </div>

          {/* Right Column - Battle Logs */}
          <Card style={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
            border: '4px solid #000',
            borderRadius: '12px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
              <p className="pixel-text text-xs mb-3" style={{ color: '#FACC15' }}>JOURNAL DE COMBAT</p>
            </div>
            <CardContent style={{ 
              padding: '0 1.5rem 1.5rem 1.5rem'
            }}>
              <div 
                ref={logContainerRef}
                style={{ 
                  maxHeight: '400px',
                  overflowY: 'auto',
                  paddingRight: '0.5rem'
                }}
              >
                {displayLogs.map((log, index) => (
                  <p 
                    key={index}
                    className="pixel-text text-xs text-white mb-2"
                    style={{ 
                      opacity: 0.9,
                      lineHeight: '1.5'
                    }}
                  >
                    &gt; {log}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hack Popup */}
      <HackPopup 
        isOpen={isHackPopupOpen}
        onClose={handleHackPopupClose}
        onHackResolved={() => {
          fetchPendingHacksCount();
          // Optionally refresh battle state here
        }}
      />
    </div>
  );
}
