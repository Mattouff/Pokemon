-- Migration: Create battles table
-- Created at: 2025-11-06

CREATE TABLE IF NOT EXISTS battles (
  id SERIAL PRIMARY KEY,
  attacker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  defender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attacker_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  defender_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  winner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  battle_log JSONB NOT NULL,
  is_ghost_battle BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_battles_attacker_id ON battles(attacker_id);
CREATE INDEX idx_battles_defender_id ON battles(defender_id);
CREATE INDEX idx_battles_winner_id ON battles(winner_id);
CREATE INDEX idx_battles_created_at ON battles(created_at DESC);
CREATE INDEX idx_battles_is_ghost ON battles(is_ghost_battle);
