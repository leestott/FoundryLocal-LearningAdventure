#!/bin/bash
# ===================================================================
#  Foundry Local Learning Adventure - Web App Launcher (Mac/Linux)
#  
#  Run with: ./scripts/start-web.sh
# ===================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get web directory (parent of scripts folder, then into web)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GAME_ROOT="$(dirname "$SCRIPT_DIR")"
WEB_ROOT="$GAME_ROOT/web"

print_header() {
    clear
    echo -e "${CYAN}"
    echo "===================================================================="
    echo "      FOUNDRY LOCAL LEARNING ADVENTURE - WEB APP"
    echo ""
    echo "      Play in your browser!"
    echo "===================================================================="
    echo -e "${NC}"
    echo ""
}

start_server() {
    local port=8080
    local url="http://localhost:$port"
    
    cd "$WEB_ROOT"
    
    echo -e "${YELLOW}[*] Starting local web server...${NC}"
    echo ""
    
    # Try npx http-server first
    if command -v npx &> /dev/null; then
        echo -e "${GREEN}[OK] Using http-server via npx${NC}"
        echo ""
        echo -e "${CYAN}Web app available at: $url${NC}"
        echo "Press Ctrl+C to stop the server"
        echo ""
        
        # Open browser (platform-specific)
        if command -v xdg-open &> /dev/null; then
            xdg-open "$url" &
        elif command -v open &> /dev/null; then
            open "$url" &
        fi
        
        npx http-server -p $port -c-1
        return
    fi
    
    # Try Python
    if command -v python3 &> /dev/null; then
        echo -e "${GREEN}[OK] Using Python3 http.server${NC}"
        echo ""
        echo -e "${CYAN}Web app available at: $url${NC}"
        echo "Press Ctrl+C to stop the server"
        echo ""
        
        # Open browser
        if command -v xdg-open &> /dev/null; then
            xdg-open "$url" &
        elif command -v open &> /dev/null; then
            open "$url" &
        fi
        
        python3 -m http.server $port
        return
    fi
    
    if command -v python &> /dev/null; then
        echo -e "${GREEN}[OK] Using Python http.server${NC}"
        echo ""
        echo -e "${CYAN}Web app available at: $url${NC}"
        echo "Press Ctrl+C to stop the server"
        echo ""
        
        # Open browser
        if command -v xdg-open &> /dev/null; then
            xdg-open "$url" &
        elif command -v open &> /dev/null; then
            open "$url" &
        fi
        
        python -m http.server $port
        return
    fi
    
    # No server available
    echo -e "${RED}[X] No web server available!${NC}"
    echo ""
    echo "Please install one of the following:"
    echo "  - Node.js from https://nodejs.org/"
    echo "  - Python from https://python.org/"
    echo ""
    exit 1
}

# Main execution
print_header
start_server
