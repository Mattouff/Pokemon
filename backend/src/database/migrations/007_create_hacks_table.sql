-- Migration: Create hacks table
-- Created at: 2025-11-06

CREATE TABLE IF NOT EXISTS hacks (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Facile', 'Moyenne', 'Difficile', 'Très Difficile')),
  solution VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des hacks de départ
INSERT INTO hacks (code, type, difficulty, solution, description) VALUES
  ('F3Z4D2', 'Hexadécimal', 'Facile', 'FEED', 'Traduire le code hexadécimal en texte lisible'),
  ('GRX-7TH9', 'Substitution', 'Moyenne', 'PAUSE', 'Appliquer un décalage de 4 lettres (chiffre César)'),
  ('a1b2c3', 'Alphanumérique', 'Moyenne', 'CATCH', 'Extraire uniquement les lettres et ignorer les chiffres'),
  ('P@ss1234', 'Chiffres', 'Difficile', 'OPEN', 'Convertir en ignorant les caractères spéciaux et chiffres'),
  ('tEmP-100', 'Base 64', 'Très Difficile', 'DEFEND', 'Déchiffrer le code Base 64');

-- Index pour améliorer les performances
CREATE INDEX idx_hacks_difficulty ON hacks(difficulty);
CREATE INDEX idx_hacks_type ON hacks(type);
