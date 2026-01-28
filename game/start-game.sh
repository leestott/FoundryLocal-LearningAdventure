#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  Foundry Local Learning Game - Startup Script for macOS/Linux
#  
#  Run with: ./start-game.sh
#  Or: bash start-game.sh
# ═══════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_header() {
    clear
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║     🎮 FOUNDRY LOCAL LEARNING ADVENTURE - SETUP                  ║"
    echo "║                                                                  ║"
    echo "║     This script will help you get started!                       ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
}

check_node() {
    echo -e "${YELLOW}🔍 Checking for Node.js...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js not found!${NC}"
        echo ""
        echo "📥 To install Node.js:"
        echo "   macOS:  brew install node"
        echo "   Ubuntu: sudo apt install nodejs npm"
        echo "   Or visit: https://nodejs.org/"
        echo ""
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | tr -d 'v')
    
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        echo -e "${GREEN}✅ Node.js $NODE_VERSION found${NC}"
    else
        echo -e "${YELLOW}⚠️  Node.js $NODE_VERSION found (v18+ recommended)${NC}"
    fi
}

check_foundry() {
    echo -e "${YELLOW}🔍 Checking for Foundry Local service...${NC}"
    
    if curl -s --max-time 5 http://localhost:5272/v1/models > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Foundry Local is running!${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Foundry Local not detected (game will run in demo mode)${NC}"
        echo ""
        echo "💡 To enable full AI features:"
        echo "   1. Install Foundry Local"
        echo "   2. Start a model: foundry model run Phi-4"
        echo "   3. Run this script again"
        echo ""
        return 1
    fi
}

install_deps() {
    echo -e "${YELLOW}📦 Checking dependencies...${NC}"
    
    cd "$SCRIPT_DIR"
    
    if [ ! -d "node_modules" ]; then
        echo "   Installing dependencies (first-time setup)..."
        npm install
    fi
    
    echo -e "${GREEN}✅ Dependencies ready${NC}"
}

start_game() {
    echo ""
    echo -e "${GREEN}🚀 Starting the game...${NC}"
    echo "─────────────────────────────────────────────────"
    echo ""
    
    cd "$SCRIPT_DIR"
    node src/game.js
}

# Main execution
print_header
check_node
check_foundry || true  # Don't exit if Foundry not found
install_deps

echo ""
echo -e "${GREEN}✨ Setup complete! Starting game in 3 seconds...${NC}"
sleep 3

start_game
