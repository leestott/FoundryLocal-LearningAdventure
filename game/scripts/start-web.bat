@echo off
REM ===================================================================
REM  Foundry Local Learning Adventure - Web App Launcher (Windows)
REM  
REM  Double-click this file to start the web version!
REM ===================================================================

title Foundry Learning Adventure - Web App

echo.
echo ====================================================================
echo       FOUNDRY LOCAL LEARNING ADVENTURE - WEB APP
echo.
echo       Starting local web server...
echo ====================================================================
echo.

REM Change to web directory (parent of scripts folder, then into web)
cd /d "%~dp0..\web"

REM Check if npx is available
where npx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] npx not found, trying Python...
    goto :try_python
)

echo [*] Starting server with http-server...
echo.
echo [OK] Web app starting at: http://localhost:8080
echo.
echo     Press Ctrl+C to stop the server
echo.
start http://localhost:8080
npx http-server -p 8080 -c-1
goto :end

:try_python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] ERROR: Neither Node.js nor Python found!
    echo.
    echo Please install one of the following:
    echo   - Node.js from https://nodejs.org/
    echo   - Python from https://python.org/
    echo.
    pause
    exit /b 1
)

echo [*] Starting server with Python...
echo.
echo [OK] Web app starting at: http://localhost:8080
echo.
echo     Press Ctrl+C to stop the server
echo.
start http://localhost:8080
python -m http.server 8080

:end
