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
Start-WebServer
