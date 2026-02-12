#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Foundry Local Learning Adventure - Web App Launcher
.DESCRIPTION
    This script starts a local web server to run the web version of the game.
.NOTES
    Run with: powershell -ExecutionPolicy Bypass -File scripts\start-web.ps1
#>

$ErrorActionPreference = "Continue"

# Get the game root directory (parent of scripts folder)
$GameRoot = Split-Path -Parent $PSScriptRoot
$WebRoot = Join-Path $GameRoot "web"

# Colors for output
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    Clear-Host
    Write-Host ""
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host "      FOUNDRY LOCAL LEARNING ADVENTURE - WEB APP                    " -ForegroundColor Cyan
    Write-Host "                                                                    " -ForegroundColor Cyan
    Write-Host "      Play in your browser!                                         " -ForegroundColor Cyan
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Discover-FoundryPort {
    Write-ColorOutput "[*] Discovering Foundry Local port..." "Yellow"
    $portFile = Join-Path $WebRoot "foundry-port.json"

    # Try CLI-based discovery first (handles dynamic ports)
    try {
        $cliOutput = foundry service status 2>&1 | Out-String
        if ($cliOutput -match 'https?://(?:127\.0\.0\.1|localhost):(\d+)') {
            $discoveredPort = [int]$Matches[1]
            try {
                $response = Invoke-WebRequest -Uri "http://127.0.0.1:$discoveredPort/v1/models" -TimeoutSec 3 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    Write-ColorOutput "[OK] Foundry Local detected on port $discoveredPort (via CLI)" "Green"
                    @{ port = $discoveredPort; discoveredAt = (Get-Date -Format o) } | ConvertTo-Json | Set-Content $portFile -Encoding UTF8
                    return $discoveredPort
                }
            } catch {
                # Discovered port not responding
            }
        }
    } catch {
        # Foundry CLI not available
    }

    # Fall back to scanning common ports
    $ports = @(61341, 5272, 51319, 5000, 8080)
    foreach ($port in $ports) {
        try {
            $response = Invoke-WebRequest -Uri "http://127.0.0.1:$port/v1/models" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-ColorOutput "[OK] Foundry Local detected on port $port" "Green"
                @{ port = $port; discoveredAt = (Get-Date -Format o) } | ConvertTo-Json | Set-Content $portFile -Encoding UTF8
                return $port
            }
        } catch {
            # Try next port
        }
    }

    Write-ColorOutput "[!] Foundry Local not detected - web app will run in demo mode" "Yellow"
    # Remove stale config if it exists
    if (Test-Path $portFile) { Remove-Item $portFile -Force }
    return $null
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Start-WebServer {
    $port = 8080
    $url = "http://localhost:$port"
    
    Write-ColorOutput "[*] Starting local web server..." "Yellow"
    Write-Host ""
    
    # Change to web directory
    Push-Location $WebRoot
    
    try {
        # Try npx http-server first
        if (Test-Command "npx") {
            Write-ColorOutput "[OK] Using http-server via npx" "Green"
            Write-Host ""
            Write-ColorOutput "Web app available at: $url" "Cyan"
            Write-ColorOutput "Press Ctrl+C to stop the server" "Gray"
            Write-Host ""
            
            # Open browser
            Start-Process $url
            
            # Start server
            npx http-server -p $port -c-1
            return
        }
        
        # Try Python
        if (Test-Command "python") {
            Write-ColorOutput "[OK] Using Python http.server" "Green"
            Write-Host ""
            Write-ColorOutput "Web app available at: $url" "Cyan"
            Write-ColorOutput "Press Ctrl+C to stop the server" "Gray"
            Write-Host ""
            
            # Open browser
            Start-Process $url
            
            # Start server
            python -m http.server $port
            return
        }
        
        if (Test-Command "python3") {
            Write-ColorOutput "[OK] Using Python3 http.server" "Green"
            Write-Host ""
            Write-ColorOutput "Web app available at: $url" "Cyan"
            Write-ColorOutput "Press Ctrl+C to stop the server" "Gray"
            Write-Host ""
            
            # Open browser
            Start-Process $url
            
            # Start server
            python3 -m http.server $port
            return
        }
        
        # No server available
        Write-ColorOutput "[X] No web server available!" "Red"
        Write-Host ""
        Write-Host "Please install one of the following:"
        Write-Host "  - Node.js from https://nodejs.org/"
        Write-Host "  - Python from https://python.org/"
        Write-Host ""
        
    } finally {
        Pop-Location
    }
}

# Main execution
Write-Header
Discover-FoundryPort | Out-Null
Start-WebServer
