#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  Foundry Local Learning Game - Startup Script for macOS/Linux
#  
#  Run with: ./scripts/start-game.sh
#  Or: bash scripts/start-game.sh
# ═══════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get game root directory (parent of scripts folder)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GAME_ROOT="$(dirname "$SCRIPT_DIR")"

print_header() {
    clear
    echo -e "${CYAN}"
    echo "===================================================================="
    echo "      FOUNDRY LOCAL LEARNING ADVENTURE - SETUP"
    echo ""
    echo "      This script will help you get started!"
    echo "===================================================================="
    echo -e "${NC}"
    echo ""
}

check_node() {
    echo -e "${YELLOW}[*] Checking for Node.js...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}[X] Node.js not found!${NC}"
        echo ""
        echo "To install Node.js:"
        echo "   macOS:  brew install node"
        echo "   Ubuntu: sudo apt install nodejs npm"
        echo "   Or visit: https://nodejs.org/"
        echo ""
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | tr -d 'v')
    
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        echo -e "${GREEN}[OK] Node.js $NODE_VERSION found${NC}"
    else
        echo -e "${YELLOW}[!] Node.js $NODE_VERSION found (v18+ recommended)${NC}"
    fi
}

check_foundry() {
    echo -e "${YELLOW}[*] Checking for Foundry Local service...${NC}"
    
    # Try multiple common ports
    for port in 61341 5272 5000 8080; do
        if curl -s --max-time 2 http://localhost:$port/v1/models > /dev/null 2>&1; then
            echo -e "${GREEN}[OK] Foundry Local is running on port $port!${NC}"
            return 0
        fi
    done
    
    echo -e "${YELLOW}[!] Foundry Local not detected (game will run in demo mode)${NC}"
    echo ""
    echo "To enable full AI features:"
    echo "   1. Install Foundry Local"
    echo "   2. Start a model: foundry model run Phi-4"
    echo "   3. Run this script again"
    echo ""
    return 1
}

install_deps() {
    echo -e "${YELLOW}[*] Checking dependencies...${NC}"
    
    cd "$GAME_ROOT"
    
    if [ ! -d "node_modules" ]; then
        echo "   Installing dependencies (first-time setup)..."
        npm install
    fi
    
    echo -e "${GREEN}[OK] Dependencies ready${NC}"
}

start_game() {
    echo ""
    echo -e "${GREEN}>>> Starting the game...${NC}"
    echo "─────────────────────────────────────────────────"
    echo ""
    
    cd "$GAME_ROOT"
    node src/game.js
}

# Main execution
print_header
check_node
check_foundry || true  # Don't exit if Foundry not found
install_deps

echo ""
echo -e "${GREEN}[OK] Setup complete! Starting game in 3 seconds...${NC}"
sleep 3

start_game
