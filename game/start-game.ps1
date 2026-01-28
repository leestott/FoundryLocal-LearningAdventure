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
    Write-ColorOutput @"

╔══════════════════════════════════════════════════════════════════╗
║     🎮 FOUNDRY LOCAL LEARNING ADVENTURE - SETUP                  ║
║                                                                  ║
║     This script will help you get started!                       ║
╚══════════════════════════════════════════════════════════════════╝

"@ "Cyan"
}

function Test-NodeInstalled {
    Write-ColorOutput "🔍 Checking for Node.js..." "Yellow"
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            $versionNum = [version]($nodeVersion -replace 'v', '')
            if ($versionNum.Major -ge 18) {
                Write-ColorOutput "✅ Node.js $nodeVersion found (minimum v18 required)" "Green"
                return $true
            } else {
                Write-ColorOutput "⚠️  Node.js $nodeVersion found, but v18+ is recommended" "Yellow"
                return $true
            }
        }
    } catch {
        Write-ColorOutput "❌ Node.js not found!" "Red"
        Write-ColorOutput @"

📥 To install Node.js:
   1. Visit: https://nodejs.org/
   2. Download the LTS version (18.x or higher)
   3. Run the installer
   4. Restart this script

"@ "White"
        return $false
    }
    return $false
}

function Test-FoundryLocalRunning {
    Write-ColorOutput "🔍 Checking for Foundry Local service..." "Yellow"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5272/v1/models" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-ColorOutput "✅ Foundry Local is running!" "Green"
            $models = ($response.Content | ConvertFrom-Json).data
            if ($models) {
                Write-ColorOutput "   Available models: $($models.id -join ', ')" "Cyan"
            }
            return $true
        }
    } catch {
        Write-ColorOutput "⚠️  Foundry Local not detected (game will run in demo mode)" "Yellow"
        Write-ColorOutput @"

💡 To enable full AI features:
   1. Install Foundry Local: winget install Microsoft.FoundryLocal
   2. Start a model: foundry model run Phi-4
   3. Then run this script again

   The game works without Foundry Local, but responses will be simulated.

"@ "White"
        return $false
    }
    return $false
}

function Install-Dependencies {
    Write-ColorOutput "📦 Installing dependencies..." "Yellow"
    
    $packageJsonPath = Join-Path $PSScriptRoot "package.json"
    if (-not (Test-Path $packageJsonPath)) {
        Write-ColorOutput "❌ package.json not found! Make sure you're in the game folder." "Red"
        return $false
    }
    
    $nodeModulesPath = Join-Path $PSScriptRoot "node_modules"
    if (Test-Path $nodeModulesPath) {
        Write-ColorOutput "✅ Dependencies already installed" "Green"
        return $true
    }
    
    try {
        Push-Location $PSScriptRoot
        npm install 2>&1 | Out-Null
        Pop-Location
        Write-ColorOutput "✅ Dependencies installed successfully" "Green"
        return $true
    } catch {
        Write-ColorOutput "❌ Failed to install dependencies: $_" "Red"
        return $false
    }
}

function Start-Game {
    Write-ColorOutput "`n🚀 Starting the game..." "Green"
    Write-ColorOutput "─────────────────────────────────────────────────" "Gray"
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
Write-ColorOutput "`n✨ Setup complete! Starting game in 3 seconds..." "Green"
Start-Sleep -Seconds 3

Start-Game
