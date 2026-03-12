# AGENTS.md: Coding Patterns and Conventions

This file documents the coding patterns, architecture decisions, and conventions used in the **Foundry Local Learning Adventure** project. AI coding agents and contributors should follow these guidelines.

## Project Overview

An interactive educational game teaching Microsoft Foundry Local AI tools. The game has two modes:

- **CLI Mode** (`game/src/game.js`): Node.js terminal-based game using the `foundry-local-sdk` npm package for direct model interaction via native FFI.
- **Web Mode** (`game/web/`): Browser-based version using HTTP/fetch against the Foundry Local REST API (the SDK cannot run in a browser).

## Architecture

```
game/
├── src/
│   ├── game.js      # Main engine: FoundryLocalClient, ProgressManager, FoundryLearningGame
│   ├── levels.js    # LevelManager, TaskHandler: level definitions and task execution
│   └── mentor.js    # Mentor (Sage): AI mentor with system-prompted conversations
├── web/
│   ├── index.html   # Browser UI
│   ├── game-web.js  # Browser game engine (HTTP-based, no SDK); model selector UI
│   ├── game-data.js # Shared game data for web mode
│   └── styles.css   # Styling
├── data/            # JSON data: levels, progress, rewards, sample prompts
├── tests/           # Test suite and Playwright specs
├── scripts/         # Startup scripts (ps1, sh, bat)
├── config.json      # Runtime configuration
└── package.json     # Dependencies (foundry-local-sdk, playwright)
```

## Key Conventions

### Foundry Local SDK Usage (Node.js only)

- Use `FoundryLocalManager.create({ appName, logLevel })` to create the SDK manager.
- Discover models via `manager.catalog.getModels()` / `catalog.getModel(alias)`.
- Load models with `model.download()` then `model.load()`.
- Create a `ChatClient` via `model.createChatClient()` for inference.
- Call `chatClient.completeChat([{role, content}, ...])` for chat completions.
- Configure settings on `chatClient.settings` (maxTokens, temperature, etc.).
- Start the embedded web service with `manager.startWebService()` for the embeddings HTTP endpoint.
- The SDK uses native FFI (`koffi`): it **cannot** run in a browser environment.

### Browser / Web Mode

- Web mode communicates exclusively via HTTP `fetch()` against the OpenAI-compatible REST API.
- Port discovery in the browser uses sequential scanning of known ports.
- Do **not** import `foundry-local-sdk` in any browser-facing code.

### Connection Modes

The `FoundryLocalClient` supports three modes:
1. **`local`**: Foundry Local SDK (preferred for CLI).
2. **`azure`**: Azure OpenAI Service via HTTP.
3. **`demo`**: Simulated responses when no AI backend is available.

Always fall back gracefully to demo mode if the SDK and Azure are both unavailable.

### Module System

- The project uses **ESM** (`"type": "module"` in package.json).
- Use `import`/`export` exclusively; no `require()`.
- Derive `__dirname` from `import.meta.url` when needed.

### Error Handling

- Wrap all SDK and network calls in `try/catch`.
- Never let a failed AI call crash the game: fall back to demo responses.
- Log errors to console but keep the user-facing experience smooth.

### Configuration

- `config.json` holds runtime settings (model preferences, Azure config, game settings).
- CLI-specific fields (`baseUrl`, `commonPorts`, `useCliDiscovery`) have been removed in favour of SDK-based discovery.
- SDK configuration: `sdkAppName`, `sdkLogLevel`, `defaultModel`.

### Testing

- Unit/integration tests in `game/tests/test-game.js`: run with `npm test`.
- Tests use the SDK for Foundry service discovery (not CLI or port scanning).
- Playwright tests for screenshots and video demos.
- Tests should skip gracefully when Foundry Local is not installed.

### Code Style

- No TypeScript: plain JavaScript (ESM).
- Classes for major components (`FoundryLocalClient`, `LevelManager`, `Mentor`, etc.).
- Async/await throughout; no raw callbacks.
- Console output uses emoji prefixes for status indicators (✅, ❌, 🎮, etc.).

### Security

- No hardcoded API keys or secrets in source files.
- Azure API keys belong in `config.json` (the committed version ships with placeholder values only).
- Validate/sanitise user inputs at system boundaries.
- The `config.json` template ships with placeholder values (`YOUR-API-KEY`).
