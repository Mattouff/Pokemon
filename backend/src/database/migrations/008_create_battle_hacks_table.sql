-- Migration: Create battle_hacks table
-- Created at: 2025-11-06

CREATE TABLE IF NOT EXISTS battle_hacks (
  id SERIAL PRIMARY KEY,
  battle_id INTEGER NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  hack_id INTEGER NOT NULL REFERENCES hacks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_solved BOOLEAN DEFAULT FALSE,
  user_answer VARCHAR(50),
  hack_probability DECIMAL(5,2) NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE,
  solved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_battle_hacks_battle_id ON battle_hacks(battle_id);
CREATE INDEX idx_battle_hacks_user_id ON battle_hacks(user_id);
CREATE INDEX idx_battle_hacks_is_solved ON battle_hacks(is_solved);
