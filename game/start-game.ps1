#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Foundry Local Learning Game - Startup Script for Windows
.DESCRIPTION
    This script helps beginners set up and run the Foundry Local Learning Game.
    It checks prerequisites, installs dependencies, and starts the game.
.NOTES
    Run this script by right-clicking and selecting "Run with PowerShell"
    Or open PowerShell and run: .\start-game.ps1
#>

# Set strict mode for better error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    Clear-Host
    Write-Host ""
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host "      FOUNDRY LOCAL LEARNING ADVENTURE - SETUP                      " -ForegroundColor Cyan
    Write-Host "                                                                    " -ForegroundColor Cyan
    Write-Host "      This script will help you get started!                        " -ForegroundColor Cyan
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Test-NodeInstalled {
    Write-ColorOutput "[*] Checking for Node.js..." "Yellow"
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            $versionNum = [version]($nodeVersion -replace 'v', '')
            if ($versionNum.Major -ge 18) {
                Write-ColorOutput "[OK] Node.js $nodeVersion found (minimum v18 required)" "Green"
                return $true
            } else {
                Write-ColorOutput "[!] Node.js $nodeVersion found, but v18+ is recommended" "Yellow"
                return $true
            }
        }
    } catch {
        Write-ColorOutput "[X] Node.js not found!" "Red"
        Write-Host ""
        Write-Host "To install Node.js:"
        Write-Host "   1. Visit: https://nodejs.org/"
        Write-Host "   2. Download the LTS version (18.x or higher)"
        Write-Host "   3. Run the installer"
        Write-Host "   4. Restart this script"
        Write-Host ""
        return $false
    }
    return $false
}

function Test-FoundryLocalRunning {
    Write-ColorOutput "[*] Checking for Foundry Local service..." "Yellow"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5272/v1/models" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-ColorOutput "[OK] Foundry Local is running!" "Green"
            $models = ($response.Content | ConvertFrom-Json).data
            if ($models) {
                Write-ColorOutput "   Available models: $($models.id -join ', ')" "Cyan"
            }
            return $true
        }
    } catch {
        Write-ColorOutput "[!] Foundry Local not detected (game will run in demo mode)" "Yellow"
        Write-Host ""
        Write-Host "To enable full AI features:"
        Write-Host "   1. Install Foundry Local: winget install Microsoft.FoundryLocal"
        Write-Host "   2. Start a model: foundry model run Phi-4"
        Write-Host "   3. Then run this script again"
        Write-Host ""
        Write-Host "   The game works without Foundry Local, but responses will be simulated."
        Write-Host ""
        return $false
    }
    return $false
}

function Install-Dependencies {
    Write-ColorOutput "[*] Installing dependencies..." "Yellow"
    
    $packageJsonPath = Join-Path $PSScriptRoot "package.json"
    if (-not (Test-Path $packageJsonPath)) {
        Write-ColorOutput "[X] package.json not found! Make sure you're in the game folder." "Red"
        return $false
    }
    
    $nodeModulesPath = Join-Path $PSScriptRoot "node_modules"
    if (Test-Path $nodeModulesPath) {
        Write-ColorOutput "[OK] Dependencies already installed" "Green"
        return $true
    }
    
    try {
        Push-Location $PSScriptRoot
        $output = npm install 2>&1
        $exitCode = $LASTEXITCODE
        Pop-Location
        if ($exitCode -eq 0) {
            Write-ColorOutput "[OK] Dependencies installed successfully" "Green"
            return $true
        } else {
            Write-ColorOutput "[X] Failed to install dependencies" "Red"
            return $false
        }
    } catch {
        Pop-Location
        Write-ColorOutput "[X] Failed to install dependencies: $($_.Exception.Message)" "Red"
        return $false
    }
}

function Start-Game {
    Write-ColorOutput "`n>>> Starting the game..." "Green"
    Write-ColorOutput "-------------------------------------------------" "Gray"
    Write-ColorOutput ""
    
    Push-Location $PSScriptRoot
    try {
        node src/game.js
    } finally {
        Pop-Location
    }
}

# Main execution
Write-Header

# Step 1: Check Node.js
if (-not (Test-NodeInstalled)) {
    Write-ColorOutput "`nPress any key to exit..." "Gray"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Step 2: Check Foundry Local (optional)
Test-FoundryLocalRunning | Out-Null

# Step 3: Install dependencies
if (-not (Install-Dependencies)) {
    Write-ColorOutput "`nPress any key to exit..." "Gray"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Step 4: Start the game
Write-ColorOutput "`n[OK] Setup complete! Starting game in 3 seconds..." "Green"
Start-Sleep -Seconds 3

Start-Game
