# 📸 Game Screenshots

This folder contains screenshots of the Foundry Local Learning Adventure game.

## Capturing New Screenshots

### Option 1: Using Playwright (Automated)

```bash
cd ..
npm run test:install
npm run test:screenshots
```

### Option 2: Manual Screenshots

1. Start the web server:
   ```bash
   cd web
   npx http-server -p 8080 -c-1
   ```

2. Open http://localhost:8080 in your browser

3. Use your browser's screenshot tool (F12 → Device Toolbar) or a screenshot tool

### Recommended Screenshots to Capture

| Screenshot | Description |
|------------|-------------|
| 01-welcome-screen.png | Initial welcome page with game logo |
| 02-enter-name.png | Player entering their name |
| 03-main-menu.png | Level selection menu |
| 04-level1-meet-model.png | Level 1 introduction |
| 05-level1-response.png | AI response in Level 1 |
| 06-mentor-chat.png | Sage mentor interaction |
| 07-hint-system.png | Hint displayed for player |
| 08-progress-modal.png | Progress tracking screen |
| 09-badges-collection.png | Badge collection view |
| 10-help-screen.png | Help/instructions modal |

## Usage in README

Reference screenshots in markdown:
```markdown
![Welcome Screen](screenshots/01-welcome-screen.png)
```
