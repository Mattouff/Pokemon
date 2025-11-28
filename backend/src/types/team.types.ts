export interface Team {
  id: number;
  user_id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TeamPokemon {
  id: number;
  team_id: number;
  pokemon_id: number;
  position: number;
  nickname: string | null;
  created_at: Date;
}

export interface CreateTeamDTO {
  name: string;
}

export interface UpdateTeamDTO {
  name?: string;
}

export interface AddPokemonDTO {
  pokemon_id: number;
  position: number;
  nickname?: string;
}

export interface TeamWithPokemons extends Team {
  pokemons: TeamPokemon[];
}
