# Changelog

All notable changes to the Foundry Local Learning Adventure project.

## [2.1.0]: Model Selector UI & Cleanup

### Added

- **`game/web/index.html`**: Added `<select id="modelSelector">` dropdown in the header for model selection. Added `connectionDetail` status area with progress bar below the connection status pill.
- **`game/web/game-web.js`**: Added `showStatusDetail()` helper to display granular progress messages (port scanning, waiting, model loading, reconnection). Added `changeModel()` function that shows loading state, verifies the model, and reports status. `updateConnectionStatus()` now populates the model selector dropdown from `foundryConnection.availableModels`. `checkFoundryConnection()` and `waitForFoundry()` now show real-time progress with port-scanning percentages and countdown timers. Health check shows reconnection status on connection loss.
- **`game/web/styles.css`**: Added `.model-selector` styles matching the existing header pill design. Added `.connection-group`, `.connection-detail`, `.detail-message`, `.progress-bar`, `.progress-fill` styles for the status/progress indicator.

### Removed

- **`game/.env.example`**: Deleted. The SDK handles model and service discovery; environment variable overrides for `FOUNDRY_LOCAL_URL` and `FOUNDRY_MODEL` are no longer needed.

### Changed

- **`game/web/game-web.js`**: `updateConnectionStatus()` no longer shows the model name inline in the connection status pill; the model is now shown in the separate dropdown.

## [2.0.0]: SDK Migration

### Summary

Migrated the game engine from CLI-based Foundry Local interaction (`execSync` + HTTP port scanning) to the official **`foundry-local-sdk`** npm package (v0.9.0). The SDK uses native FFI for direct model communication, eliminating the need for manual port discovery and service management.

### Changed

#### `game/src/game.js`: Main Game Engine
- **Replaced `execSync` import** with `FoundryLocalManager` from `foundry-local-sdk`.
- **Rewrote `FoundryLocalClient` constructor**: removed `baseUrl`, `autoDiscoverPort`, `commonPorts` fields; added `manager`, `chatClient`, `sdkModel`, `preferredModel` for SDK integration.
- **Rewrote `initialize()` method**: uses `tryFoundryLocalSDK()` with retry loop instead of CLI-based `tryFoundryLocal()`.
- **Added `tryFoundryLocalSDK()` method**: creates `FoundryLocalManager`, discovers models via `catalog.getModels()`, downloads/loads the best model, creates a `ChatClient`, and starts the embedded web service.
- **Rewrote `reconnectIfNeeded()`**: checks `sdkModel.isLoaded()` instead of HTTP health checks; reloads model and recreates ChatClient if needed.
- **Removed `discoverPortViaCLI()` method**: no longer needed; SDK handles service discovery internally.
- **Removed `tryFoundryLocal()` method**: replaced by `tryFoundryLocalSDK()`.
- **Removed `tryFoundryUrl()` method**: SDK handles connectivity; no port scanning needed.
- **Rewrote `chat()` method**: uses `chatClient.completeChat()` for local models instead of raw `fetch()`.
- **Rewrote `chatWithSystem()` method**: uses `chatClient.completeChat()` with system+user messages for local models.
- **Updated `getEmbedding()` method**: uses SDK web service URL for local embeddings endpoint.
- **Updated `displayConnectionStatus()`**: shows "SDK" in output, displays web service URL, updated demo mode instructions.
- **Simplified `FoundryLearningGame.initialize()`**: constructor call passes only `model` and `azureConfig` (removed `baseUrl`, `autoDiscoverPort`, `commonPorts`).

#### `game/config.json`: Configuration
- Removed CLI-specific fields: `baseUrl`, `autoDiscoverPort`, `useCliDiscovery`, `commonPorts`, `chatEndpoint`, `embeddingsEndpoint`, `modelsEndpoint`.
- Added SDK-specific fields: `sdkAppName`, `sdkLogLevel`.

#### `game/package.json`: Dependencies
- Added `foundry-local-sdk: ^0.9.0` to `dependencies`.

#### `game/tests/test-game.js`: Test Suite
- Replaced `execSync` CLI discovery with SDK-based `FoundryLocalManager.create()` + `startWebService()`.
- Removed `commonPorts` config and port scanning logic.
- Updated help text to reference SDK/download instead of `foundry model run`.

#### `game/scripts/start-game.ps1`: PowerShell Startup Script
- Simplified `Test-FoundryLocalRunning`: checks for `foundry` CLI presence instead of port scanning.
- Removed HTTP port scanning (`Invoke-WebRequest` calls).
- Updated user-facing instructions to reflect SDK-based workflow.

#### `game/scripts/start-game.sh`: Bash Startup Script
- Simplified `check_foundry()`: checks for `foundry` CLI presence instead of port scanning.
- Removed `curl`-based port scanning.
- Updated user-facing instructions.

#### `game/scripts/start-game.bat`: Windows Batch Startup Script
- Simplified Foundry detection: checks for `foundry` CLI presence.
- Removed `curl`-based port scanning and temp file usage.
- Updated user-facing instructions.

### Added

- **`AGENTS.md`**: Coding patterns and conventions document for AI agents and contributors.
- **`changelog.md`**: This file.

### Unchanged

- **`game/web/game-web.js`**: Browser-based game engine. Kept HTTP/fetch approach because the SDK uses native FFI (`koffi`) and cannot run in a browser. Model selection UI was added in v2.1.0.
- **`game/src/levels.js`**: Uses the `foundryClient.chat()` / `getEmbedding()` abstractions; no direct SDK calls needed.
- **`game/src/mentor.js`**: Uses the `foundryClient.chatWithSystem()` abstraction; no direct SDK calls needed.
- All game data files (`levels.json`, `rewards.json`, `progress.json`, `sample_prompts.json`).

### Technical Notes

- The `foundry-local-sdk` uses native FFI via `koffi`: it requires Node.js and **cannot** run in browser environments.
- The SDK manages the Foundry Local service lifecycle (starting, model loading) internally.
- The embedded web service (`manager.startWebService()`) provides an OpenAI-compatible HTTP endpoint for features like embeddings that lack a direct SDK method.
- Azure fallback and demo mode remain fully functional and unchanged.
