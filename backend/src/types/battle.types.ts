export interface Battle {
  id: number;
  attacker_id: number;
  defender_id: number;
  attacker_team_id: number;
  defender_team_id: number;
  winner_id: number | null;
  battle_log: BattleLog;
  is_ghost_battle: boolean;
  created_at: Date;
}

export interface BattleLog {
  turns: BattleTurn[];
  summary: BattleSummary;
}

export interface BattleTurn {
  turn: number;
  attacker: TurnAction;
  defender: TurnAction;
  weather?: string;
  attacker_pokemon_remaining?: number;
  defender_pokemon_remaining?: number;
}

export interface TurnAction {
  pokemon: {
    id: number;
    name: string;
    types: string[];
  };
  hp: number;
  damage: number;
  isFainted: boolean;
}

export interface BattleSummary {
  total_turns: number;
  attacker_pokemons_fainted: number;
  defender_pokemons_fainted: number;
  winner: 'attacker' | 'defender' | 'draw';
}

export interface BattleResult {
  battle_id: number;
  winner: 'you' | 'opponent' | 'draw';
  your_team: TeamBattleStats;
  opponent_team: TeamBattleStats;
  turns: BattleTurn[];
}

export interface TeamBattleStats {
  team_name: string;
  pokemons_alive: number;
  pokemons_fainted: number;
}

export interface CreateBattleDTO {
  opponent_id: number;
}

export interface AttackEvent {
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
}

export interface TurnResult {
  first_attack: AttackEvent | null;
  second_attack: AttackEvent | null;
  battle_ended: boolean;
  winner?: 'player' | 'opponent';
}
