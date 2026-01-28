# 🧪 Tests

This folder contains all tests for the Foundry Local Learning Adventure game.

## Test Types

### Unit Tests (`test-game.js`)

Validates game functionality, data files, and optional Foundry Local connectivity.

```bash
npm test
```

**What it tests:**
- ✅ File structure (required files exist)
- ✅ JSON data validation (levels, rewards, progress)
- ✅ JavaScript syntax and module exports
- ✅ Game logic (level progression, badges, points)
- ✅ Security (no hardcoded secrets)
- ✅ Foundry Local service (if running)

### Screenshot Tests (`screenshot.spec.js`)

Captures screenshots of the web version using Playwright for documentation.

```bash
# Install Playwright (first time only)
npm run test:install

# Run screenshot tests
npm run test:screenshots
```

**Screenshots captured:**
| File | Description |
|------|-------------|
| `01-welcome-screen.png` | Initial welcome page |
| `02-enter-name.png` | Name input field |
| `03-main-menu.png` | Level selection menu |
| `04-level1-meet-model.png` | Level 1 introduction |
| `05-level1-response.png` | AI response display |
| `06-mentor-chat.png` | Sage mentor interaction |
| `07-hint-system.png` | Hint functionality |
| `08-progress-modal.png` | Progress tracking |
| `09-badges-collection.png` | Badge collection |
| `10-help-screen.png` | Help modal |
| `mobile-*.png` | Mobile viewport versions |

Screenshots are saved to `../screenshots/`.

### Foundry Local Health Check

Checks if Foundry Local is running and models are available.

```bash
# Windows (PowerShell)
npm run test:foundry

# Mac/Linux
./check-foundry.sh
```

## Running All Tests

```bash
# Run unit tests
npm test

# Run screenshot tests (requires Playwright)
npm run test:screenshots
```

## CI/CD

Tests run automatically on pull requests via GitHub Actions. Screenshot tests are skipped in CI unless a web server is available.

## Test Configuration

- **Playwright config**: `playwright.config.js`
- **Web server**: Serves `../web/` on port 8080 during screenshot tests
- **Timeout**: 30 seconds for web server startup

## Adding New Tests

1. **Unit tests**: Add to `test-game.js` following existing patterns
2. **Screenshot tests**: Add to `screenshot.spec.js` with a descriptive test name
3. **New test files**: Update `package.json` scripts accordingly
