#!/bin/bash

echo "🛑 Arrêt de l'application Pokémon Battle..."

# Arrêter les processus Node.js locaux (backend et frontend)
echo "🔴 Arrêt des serveurs locaux..."
pkill -f "ts-node-dev.*src/index.ts" 2>/dev/null
pkill -f "next dev" 2>/dev/null

# Arrêter tous les conteneurs Docker
echo "🐳 Arrêt des conteneurs Docker..."
docker compose down

# Supprimer les node_modules
echo "🗑️  Suppression des node_modules..."
rm -rf backend/node_modules
rm -rf frontend/node_modules

echo "✅ Tous les services ont été arrêtés et node_modules supprimés"
