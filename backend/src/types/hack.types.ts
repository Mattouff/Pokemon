export interface Hack {
  id: number;
  code: string;
  type: string;
  difficulty: HackDifficulty;
  solution: string;
  description: string;
  created_at: Date;
}

export enum HackDifficulty {
  FACILE = 'Facile',
  MOYENNE = 'Moyenne',
  DIFFICILE = 'Difficile',
  TRES_DIFFICILE = 'Très Difficile',
}

export interface BattleHack {
  id: number;
  battle_id: number;
  hack_id: number;
  user_id: number;
  is_solved: boolean;
  user_answer: string | null;
  hack_probability: number;
  attempted_at: Date | null;
  solved_at: Date | null;
  created_at: Date;
}

export interface HackAttempt {
  hack: Hack;
  probability: number;
}

export interface SubmitHackSolutionDTO {
  battle_hack_id: number;
  answer: string;
}

export interface HackResult {
  is_correct: boolean;
  penalty?: {
    type: 'team_lost' | 'attack_debuff';
    value: number;
  };
}
