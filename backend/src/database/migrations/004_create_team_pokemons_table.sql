-- Migration: Create team_pokemons table
-- Created at: 2025-11-06

CREATE TABLE IF NOT EXISTS team_pokemons (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  pokemon_id INTEGER NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 6),
  nickname VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, position),
  UNIQUE(team_id, pokemon_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_team_pokemons_team_id ON team_pokemons(team_id);
CREATE INDEX idx_team_pokemons_pokemon_id ON team_pokemons(pokemon_id);
