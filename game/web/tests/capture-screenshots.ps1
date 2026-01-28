# ═══════════════════════════════════════════════════════════════════
# Screenshot Capture Script for Foundry Local Learning Game
# Uses Edge/Chrome DevTools Protocol
# ═══════════════════════════════════════════════════════════════════

param(
    [string]$OutputDir = "..\screenshots",
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

# Check if server is running
try {
    $null = Invoke-WebRequest -Uri "http://localhost:$Port" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Web server is running on port $Port" -ForegroundColor Green
} catch {
    Write-Host "❌ Web server not running. Start it first with: npx http-server -p $Port" -ForegroundColor Red
    exit 1
}

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Write-Host ""
Write-Host "📸 Screenshot Capture Instructions" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════"
Write-Host ""
Write-Host "Since automated capture requires browser installation, please capture manually:"
Write-Host ""
Write-Host "1. Open http://localhost:$Port in your browser"
Write-Host "2. Use these methods to capture screenshots:"
Write-Host ""
Write-Host "   Browser DevTools (Recommended):" -ForegroundColor Yellow
Write-Host "   • Press F12 to open DevTools"
Write-Host "   • Click the device toolbar icon (Ctrl+Shift+M)"
Write-Host "   • Set viewport to 1280x800"
Write-Host "   • Press Ctrl+Shift+P → type 'screenshot' → 'Capture full size screenshot'"
Write-Host ""
Write-Host "   Windows Snipping Tool:" -ForegroundColor Yellow
Write-Host "   • Press Win+Shift+S"
Write-Host "   • Select the game window area"
Write-Host ""
Write-Host "3. Save screenshots to: $((Resolve-Path $OutputDir).Path)"
Write-Host ""
Write-Host "Screenshots to capture:" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────────────────"

$screenshots = @(
    @{Name="01-welcome-screen.png"; Action="Initial welcome page"},
    @{Name="02-enter-name.png"; Action="Type a name in the input field"},
    @{Name="03-main-menu.png"; Action="Click 'Start Adventure'"},
    @{Name="04-level1-meet-model.png"; Action="Click Level 1"},
    @{Name="05-level1-response.png"; Action="Send a prompt and wait for response"},
    @{Name="06-mentor-chat.png"; Action="Ask Sage a question"},
    @{Name="07-hint-system.png"; Action="Click 'Get Hint' button"},
    @{Name="08-progress-modal.png"; Action="Return to menu, click 'Progress'"},
    @{Name="09-badges-collection.png"; Action="Click 'Badges' button"},
    @{Name="10-help-screen.png"; Action="Click 'Help' button"}
)

foreach ($shot in $screenshots) {
    Write-Host ("  {0,-30} → {1}" -f $shot.Name, $shot.Action)
}

Write-Host ""
Write-Host "───────────────────────────────────────────────────────────────────"
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:$Port"

Write-Host ""
Write-Host "Press any key after capturing screenshots..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# List captured screenshots
Write-Host ""
Write-Host "📁 Screenshots in $OutputDir`:" -ForegroundColor Cyan
Get-ChildItem -Path $OutputDir -Filter "*.png" | ForEach-Object {
    Write-Host "  ✅ $($_.Name)" -ForegroundColor Green
}
