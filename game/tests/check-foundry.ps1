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

$baseUrl = "http://localhost:5272"

# Test 1: Service availability
Write-Host "1. Testing service availability..." -ForegroundColor Yellow
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
    Write-Host "   ❌ Foundry Local is NOT running" -ForegroundColor Red
    Write-Host ""
    Write-Host "   To start Foundry Local:" -ForegroundColor Yellow
    Write-Host "   1. Install: winget install Microsoft.FoundryLocal" -ForegroundColor White
    Write-Host "   2. Run: foundry model run Phi-4" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Test 2: Chat completion
Write-Host ""
Write-Host "2. Testing chat completion..." -ForegroundColor Yellow
try {
    $body = @{
        model = "Phi-4"
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
