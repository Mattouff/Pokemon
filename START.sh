#!/bin/bash

# Charger nvm si disponible
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "🚀 Démarrage de l'application Pokémon Battle..."

# Vérifier la version de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  AVERTISSEMENT: Node.js version $(node -v) détectée"
    echo "   Next.js 16 nécessite Node.js ≥20.9.0"
    echo "   Le backend fonctionnera, mais le frontend ne démarrera pas"
    echo "   Installez Node.js 20+ avec: nvm install 20 && nvm use 20"
    echo ""
fi

# Option 1: Démarrage avec Docker Compose (Production-like)
echo ""
echo "Choisissez le mode de démarrage:"
echo "1) Docker (Production - API + PostgreSQL dans des conteneurs)"
echo "2) Local (Développement - API en local, PostgreSQL dans Docker)"
read -p "Votre choix [1/2]: " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "🐳 Démarrage de l'application avec Docker Compose..."
    
    # Vérifier si .env existe, sinon créer depuis .env.example
    if [ ! -f backend/.env ]; then
        echo "📝 Création du fichier .env..."
        cp backend/.env.example backend/.env
    fi
    
    # Démarrer tous les services
    docker compose up --build
    
else
    echo ""
    echo "💻 Démarrage en mode développement local..."
    
    # Démarrer uniquement PostgreSQL avec Docker
    docker compose up -d postgres
    
    # Attendre que PostgreSQL soit prêt
    echo "⏳ En attente du démarrage de PostgreSQL..."
    sleep 5
    
    # Installer les dépendances backend
    echo "📦 Installation des dépendances backend..."
    cd backend
    npm install
    
    # Copier le fichier .env.example vers .env si nécessaire
    if [ ! -f .env ]; then
        echo "📝 Création du fichier .env..."
        cp .env.example .env
    fi
    
    # Exécuter les migrations
    echo "🗃️  Exécution des migrations..."
    npm run migrate:up
    
    # Retourner au dossier racine
    cd ..
    
    # Installer les dépendances frontend
    echo "📦 Installation des dépendances frontend..."
    cd frontend
    npm install
    
    # Retourner au dossier racine
    cd ..
    
    # Démarrer le backend en arrière-plan
    echo "🚀 Démarrage du serveur backend..."
    cd backend
    npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend démarré (PID: $BACKEND_PID)"
    cd ..
    
    # Attendre que le backend soit prêt
    echo "⏳ En attente du démarrage du backend..."
    sleep 3
    
    # Démarrer le frontend
    echo "🎨 Démarrage du serveur frontend..."
    cd frontend
    echo ""
    echo "╔════════════════════════════════════════════╗"
    echo "║   🎮 Pokémon Battle Application            ║"
    echo "║   🔙 Backend: http://localhost:3001        ║"
    echo "║   🎨 Frontend: http://localhost:3000       ║"
    echo "║   Pour arrêter: Ctrl+C puis ./STOP.sh      ║"
    echo "╚════════════════════════════════════════════╝"
    echo ""
    npm run dev
fi
