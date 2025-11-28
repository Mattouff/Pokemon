-- Migration: Create teams table
-- Created at: 2025-11-06

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_teams_user_id ON teams(user_id);
CREATE INDEX idx_teams_is_active ON teams(is_active);

-- Contrainte : un seul équipe active par utilisateur
CREATE UNIQUE INDEX idx_teams_user_active ON teams(user_id) WHERE is_active = TRUE;

-- Trigger pour updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
