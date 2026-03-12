# 🎮 Foundry Local Learning Adventure: Game

> **Learn AI development by playing a game!** A fun, interactive JavaScript adventure that teaches you how to use Microsoft Foundry Local and AI tools, one level at a time.

📖 **For full documentation, see the [main README](../README.md).**

---

## 🚀 Quick Start

Choose how you want to play:

### Option 1: Web App (Browser) - No Install Required!

```bash
# Navigate to web folder
cd web

# Start a local server (choose one):
npx http-server -p 8080 -c-1
# OR
python -m http.server 8080
```

Then open http://localhost:8080 in your browser.

---

### Option 2: CLI (Terminal) - Full Experience

```bash
# Install dependencies
npm install

# Start the game
npm start
```

Or use the startup scripts:

**Windows (Batch):**
```cmd
scripts\start-game.bat
```

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-game.ps1
```

**Mac/Linux:**
```bash
chmod +x scripts/start-game.sh
./scripts/start-game.sh
```

---

## 🌐 Web Version

Play in your browser - works on desktop and mobile!

**Online:** [Play on GitHub Pages](https://leestott.github.io/FoundryLocal-LearningAdventure/)

**Local (using startup scripts):**

**Windows (Batch):**
```cmd
scripts\start-web.bat
```

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-web.ps1
```

**Mac/Linux:**
```bash
chmod +x scripts/start-web.sh
./scripts/start-web.sh
```

**Or manually:**
```bash
cd web
npx http-server -p 8080 -c-1
```
Open http://localhost:8080

| Feature | Web App | CLI |
|---------|---------|-----|
| No installation | ✅ | ❌ |
| Mobile support | ✅ | ❌ |
| Real AI (Foundry Local) | ✅ (port scanning) | ✅ (SDK) |
| Offline play | ✅ | ✅ |

---

## 📁 Structure

```
game/
├── scripts/       # All startup scripts (CLI & Web)
├── src/           # Node.js game engine
├── web/           # Browser version (GitHub Pages)
├── data/          # Game data (levels, progress, rewards)
├── screenshots/   # Documentation images
└── tests/         # Test suite
```

---

## 🧪 Testing

```bash
npm test
```

---

## 📄 Licence

MIT Licence: See [LICENSE](../LICENSE) in root directory.
