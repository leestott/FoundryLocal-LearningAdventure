#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick health check for Foundry Local service
.DESCRIPTION
    Tests if Foundry Local is running and responsive
#>

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔍 FOUNDRY LOCAL HEALTH CHECK" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$baseUrl = $null

# Discover port dynamically via CLI
Write-Host "0. Discovering Foundry Local port..." -ForegroundColor Yellow
try {
    $cliOutput = foundry service status 2>&1 | Out-String
    if ($cliOutput -match 'https?://(?:127\.0\.0\.1|localhost):(\d+)') {
        $discoveredPort = $Matches[1]
        $baseUrl = "http://127.0.0.1:$discoveredPort"
        Write-Host "   ✅ Discovered port $discoveredPort via CLI" -ForegroundColor Green
    }
} catch {
    Write-Host "   ℹ️  Foundry CLI not available, scanning common ports..." -ForegroundColor Yellow
}

# Fall back to port scanning if CLI didn't work
if (-not $baseUrl) {
    $ports = @(61341, 5272, 51319, 5000, 8080)
    foreach ($port in $ports) {
        try {
            $response = Invoke-WebRequest -Uri "http://127.0.0.1:$port/v1/models" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $baseUrl = "http://127.0.0.1:$port"
                Write-Host "   ✅ Found Foundry Local on port $port" -ForegroundColor Green
                break
            }
        } catch {
            # Try next port
        }
    }
}

if (-not $baseUrl) {
    Write-Host "   ❌ Foundry Local is NOT running" -ForegroundColor Red
    Write-Host ""
    Write-Host "   To start Foundry Local:" -ForegroundColor Yellow
    Write-Host "   1. Install: winget install Microsoft.FoundryLocal" -ForegroundColor White
    Write-Host "   2. Run: foundry model run Phi-4" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Test 1: Service availability
Write-Host ""
Write-Host "1. Testing service availability at $baseUrl..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/v1/models" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Foundry Local is running!" -ForegroundColor Green
        $models = ($response.Content | ConvertFrom-Json).data
        if ($models) {
            Write-Host "   📦 Available models: $($models.id -join ', ')" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "   ❌ Service not responding" -ForegroundColor Red
    exit 1
}

# Test 2: Chat completion
$chatModel = $null
try {
    $modelsData = ($response.Content | ConvertFrom-Json).data
    $chatModel = ($modelsData | Where-Object { $_.id -match 'instruct|chat|phi' } | Select-Object -First 1).id
    if (-not $chatModel) { $chatModel = $modelsData[0].id }
} catch {
    $chatModel = "Phi-4"
}

Write-Host ""
Write-Host "2. Testing chat completion with model: $chatModel..." -ForegroundColor Yellow
try {
    $body = @{
        model = $chatModel
        messages = @(@{role = "user"; content = "Say 'OK' only."})
        max_tokens = 10
    } | ConvertTo-Json -Depth 3

    $response = Invoke-WebRequest -Uri "$baseUrl/v1/chat/completions" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body `
        -TimeoutSec 30

    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        $reply = $result.choices[0].message.content
        Write-Host "   ✅ Chat endpoint working!" -ForegroundColor Green
        Write-Host "   📝 Response: $reply" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  Chat endpoint test failed: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✨ Health check complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
