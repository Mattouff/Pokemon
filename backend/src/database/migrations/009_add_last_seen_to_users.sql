-- Migration: Add last_seen column to users table
-- Created at: 2025-11-20

ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);

-- Initialiser last_seen avec created_at pour les utilisateurs existants
UPDATE users SET last_seen = created_at WHERE last_seen IS NULL;
