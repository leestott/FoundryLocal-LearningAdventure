@echo off
REM ═══════════════════════════════════════════════════════════════════
REM  Foundry Local Learning Game - Windows Batch Startup Script
REM  
REM  Double-click this file to start the game!
REM ═══════════════════════════════════════════════════════════════════

title Foundry Local Learning Adventure

echo.
echo ====================================================================
echo      FOUNDRY LOCAL LEARNING ADVENTURE
echo.
echo      Starting up... please wait!
echo ====================================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version ^(18.x or higher^)
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found
node --version

REM Change to game root directory (parent of scripts folder)
cd /d "%~dp0.."

REM Check if node_modules exists
if not exist "node_modules\" (
    echo.
    echo [*] Installing dependencies for first-time setup...
    echo    This may take a minute...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [X] Failed to install dependencies
        pause
        exit /b 1
    )
)

echo [OK] Dependencies ready
echo.

REM Check if Foundry Local is running (try multiple ports)
echo [*] Checking for Foundry Local service...
curl -s -o nul -w "%%{http_code}" http://localhost:61341/v1/models >temp_status.txt 2>nul
set /p STATUS=<temp_status.txt
del temp_status.txt 2>nul

if "%STATUS%"=="200" (
    echo [OK] Foundry Local is running - full AI features enabled!
    goto :start_game
)

curl -s -o nul -w "%%{http_code}" http://localhost:5272/v1/models >temp_status.txt 2>nul
set /p STATUS=<temp_status.txt
del temp_status.txt 2>nul

if "%STATUS%"=="200" (
    echo [OK] Foundry Local is running - full AI features enabled!
) else (
    echo [!] Foundry Local not detected - running in demo mode
    echo    ^(The game still works, responses will be simulated^)
)

:start_game
echo.
echo ====================================================================
echo  LAUNCHING GAME...
echo ====================================================================
echo.

REM Start the game
node src/game.js

REM Keep window open if game exits
echo.
echo Game ended. Press any key to close...
pause >nul
