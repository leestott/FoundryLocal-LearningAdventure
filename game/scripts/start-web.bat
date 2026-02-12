@echo off
setlocal enabledelayedexpansion
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

REM Discover Foundry Local port for the web app
echo [*] Discovering Foundry Local port...
where foundry >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "usebackq tokens=*" %%i in (`foundry service status 2^>nul`) do (
        echo %%i | findstr /R "http://127.0.0.1:[0-9]* http://localhost:[0-9]*" >nul 2>nul
        if !ERRORLEVEL! EQU 0 (
            for /f "tokens=3 delims=:/" %%p in ("%%i") do (
                set "FOUNDRY_PORT=%%p"
            )
        )
    )
)
if defined FOUNDRY_PORT (
    echo [OK] Foundry Local detected on port !FOUNDRY_PORT!
    echo {"port": !FOUNDRY_PORT!} > foundry-port.json
) else (
    echo [!] Foundry Local not detected - web app will run in demo mode
    if exist foundry-port.json del foundry-port.json
)

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
