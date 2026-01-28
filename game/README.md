# 🎮 Foundry Local Learning Adventure - Game

> **Learn AI development by playing a game!** A fun, interactive JavaScript adventure that teaches you how to use Microsoft Foundry Local and AI tools - one level at a time.

📖 **For full documentation, see the [main README](../README.md).**

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the game
npm start
```

Or use the startup scripts:

**Windows (Batch):**
```cmd
cd game
start-game.bat
```

**Windows (PowerShell):**
```powershell
cd game
powershell -ExecutionPolicy Bypass -File .\start-game.ps1
```

**Mac/Linux:**
```bash
cd game
chmod +x start-game.sh
./start-game.sh
```

---

## 🌐 Web Version

Play in your browser without installation:

```bash
cd web
npx http-server -p 8080 -c-1
```

Then open http://localhost:8080

---

## 📁 Structure

```
game/
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

## 📄 License

MIT License - See [LICENSE](../LICENSE) in root directory.
