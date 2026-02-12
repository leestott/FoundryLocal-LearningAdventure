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

discover_foundry_port() {
    echo -e "${YELLOW}[*] Discovering Foundry Local port...${NC}"
    local port_file="$WEB_ROOT/foundry-port.json"

    # Try CLI-based discovery first (handles dynamic ports)
    if command -v foundry &> /dev/null; then
        local cli_output
        cli_output=$(foundry service status 2>&1)
        local discovered_port
        discovered_port=$(echo "$cli_output" | grep -oP 'https?://(?:127\.0\.0\.1|localhost):\K\d+' | head -1)
        if [ -n "$discovered_port" ]; then
            if curl -s --max-time 3 "http://127.0.0.1:$discovered_port/v1/models" > /dev/null 2>&1; then
                echo -e "${GREEN}[OK] Foundry Local detected on port $discovered_port (via CLI)${NC}"
                echo "{\"port\": $discovered_port, \"discoveredAt\": \"$(date -Iseconds)\"}" > "$port_file"
                return 0
            fi
        fi
    fi

    # Fall back to scanning common ports
    for port in 61341 5272 51319 5000 8080; do
        if curl -s --max-time 2 "http://127.0.0.1:$port/v1/models" > /dev/null 2>&1; then
            echo -e "${GREEN}[OK] Foundry Local detected on port $port${NC}"
            echo "{\"port\": $port, \"discoveredAt\": \"$(date -Iseconds)\"}" > "$port_file"
            return 0
        fi
    done

    echo -e "${YELLOW}[!] Foundry Local not detected - web app will run in demo mode${NC}"
    # Remove stale config if it exists
    rm -f "$port_file"
    return 1
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
discover_foundry_port || true
start_server
