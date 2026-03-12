# 🎮 Foundry Local Learning Adventure

> **Learn AI development by playing a game!** A fun, interactive JavaScript adventure that teaches you how to use Microsoft Foundry Local and AI tools, one level at a time.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Foundry Local](https://img.shields.io/badge/Foundry-Local-purple)](https://learn.microsoft.com/azure/ai-studio/foundry-local)
[![GitHub Pages](https://img.shields.io/badge/Play-Online-orange)](https://leestott.github.io/FoundryLocal-LearningAdventure/)

---

## 🌐 Play Online Now!

**No installation required!** Play the web version directly in your browser:

👉 **[Play Foundry Learning Adventure](https://leestott.github.io/FoundryLocal-LearningAdventure/)** 👈

The web version includes all 5 levels and works completely in your browser with simulated AI responses.

For the full AI experience, install Foundry Local. **No port configuration needed.** The CLI game uses the `foundry-local-sdk` npm package to discover, download, and load models automatically. The web game scans for the Foundry Local service on known ports.

```bash
# Install Foundry Local
winget install Microsoft.FoundryLocal

# CLI game: the SDK downloads and loads the model for you
cd game && npm install && npm start
```
---

## 📋 Table of Contents

- [What is This Game?](#-what-is-this-game)
- [What You'll Learn](#-what-youll-learn)
- [Play Online (GitHub Pages)](#-play-online-github-pages)
- [Quick Start](#-quick-start-5-minutes)
- [Installation Guide](#-detailed-installation-guide)
- [How to Play](#-how-to-play)
- [Level Guide](#-level-guide)
- [Game Screenshots](#-game-screenshots)
- [Commands Reference](#-commands-reference)
- [Rewards & Badges](#-rewards--badges)
- [Deploy to GitHub Pages](#-deploy-to-github-pages)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-frequently-asked-questions)
- [Project Structure](#-project-structure)
- [Running Tests](#-running-tests)
- [Contributing](#-contributing)

---

## 🎯 What is This Game?

The **Foundry Local Learning Adventure** is an educational game designed for **complete beginners** who want to learn about:

- 🤖 **AI/ML Basics** - How AI models work and respond
- 💬 **Prompt Engineering** - Writing effective prompts
- 🔍 **Embeddings** - How AI understands meaning
- ⚡ **AI Workflows** - Chaining operations together
- 🔧 **Tool Building** - Extending AI capabilities

You do not need any prior AI experience! Just follow along, complete challenges, and earn badges as you learn.

### Who is this for?

- 👨‍🎓 **Students** learning about AI
- 👩‍💻 **Developers** new to AI tools
- 🎨 **Anyone** curious about how AI works
- 📚 **Educators** teaching AI concepts

---

## 📚 What You'll Learn

| Level | Topic | What You Will Master |
|-------|-------|-------------------|
| 1 | **Meet the Model** | Making your first AI API call |
| 2 | **Prompt Mastery** | Writing effective prompts |
| 3 | **Embeddings Explorer** | Semantic search & similarity |
| 4 | **Workflow Wizard** | Building AI pipelines |
| 5 | **Build Your Own Tool** | Creating custom AI tools |

---

## 🎮 Play Online (GitHub Pages)

The web version runs entirely in your browser with **no installation required**:

- All 5 levels with interactive challenges
- Progress saved automatically (localStorage)
- Works on desktop, tablet, and mobile
- Starts in Demo Mode; connects to **real Foundry Local** automatically if installed
- Model selector dropdown lets you switch between available models
- Real-time connection status shows scanning, loading, and download progress

> **Tip for educators**: Fork the repo, enable [GitHub Pages](#-deploy-to-github-pages), and share the link with your class. Students can start learning immediately with zero setup.

When you are ready for real AI interactions, try the [CLI version](#option-2-cli-terminal---full-experience) with Foundry Local.

---

## 🚀 Quick Start (5 Minutes)

Choose how you want to play:

| Option | Best For | How to Start |
|--------|----------|-------------|
| **🌐 [Play Online](https://leestott.github.io/FoundryLocal-LearningAdventure/)** | Classrooms, quick demos, mobile | Click the link (no install needed) |
| **🌐 Run Web Locally** | Offline use, local development | `cd game` then run `scripts/start-web.ps1` |
| **💻 CLI (Terminal)** | Power users, traceable prompts | `cd game && npm start` |

> All three options start in **Demo Mode** (simulated AI). Install [Foundry Local](#step-4-for-the-interactive-ai-install-foundry-local) for real AI responses. The game discovers models automatically.

---

### Option 1: Web App (Browser) - Easiest!

**No installation required** - play directly in your browser:

#### Online (GitHub Pages)
👉 **[Play Now](https://leestott.github.io/FoundryLocal-LearningAdventure/)** 👈

#### Run Locally

**Using startup scripts (easiest):**

**Windows (Batch):**
```cmd
cd game
scripts\start-web.bat
```

**Windows (PowerShell):**
```powershell
cd game
powershell -ExecutionPolicy Bypass -File scripts\start-web.ps1
```

**Mac/Linux:**
```bash
cd game
chmod +x scripts/start-web.sh
./scripts/start-web.sh
```

**Or manually start a server:**
```bash
# Navigate to web folder
cd game/web

# Start a local server (choose one):
npx http-server -p 8080 -c-1
# OR
python -m http.server 8080
# OR
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser.

---

### Option 2: CLI (Terminal) - Full Experience

For real AI responses with Foundry Local:

#### Windows Users

1. **Download** or clone this repository
2. **Navigate** to the `game` folder
3. **Run one of these options:**

   **Option A - Batch File (double-click):**
   ```cmd
   scripts\start-game.bat
   ```

   **Option B - PowerShell (recommended):**
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\start-game.ps1
   ```

4. **Follow** the on-screen prompts
5. **Start playing!**

#### Mac/Linux Users

```bash
# Clone the repository
git clone <repository-url>
cd game

# Make the script executable
chmod +x scripts/start-game.sh

# Run the game
./scripts/start-game.sh
```

#### Using npm Directly

```bash
cd game
npm install
npm start
```

---

## 📖 Detailed Installation Guide

### Step 1: Install Node.js

Node.js is required to run this game. It is free and easy to install.

#### Windows
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the **LTS** version (green button)
3. Run the installer
4. Click "Next" through all options
5. **Restart your terminal** after installing
6. Done! ✅

#### macOS
```bash
# Using Homebrew (recommended)
brew install node

# Or download from nodejs.org
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install nodejs npm
```

#### Verify Installation
Open a terminal/command prompt and type:
```bash
node --version
```
You should see something like `v18.x.x` or higher.

---

### Step 2: Download the Game

#### Option A: Download ZIP
1. Click the green "Code" button on the repository page
2. Select "Download ZIP"
3. Extract to a folder you can easily find (e.g., Desktop)

#### Option B: Clone with Git
```bash
git clone https://github.com/leestott/FoundryLocal-LearningAdventure.git
cd FoundryLocal-LearningAdventure
```

---

### Step 3: Install Dependencies

Open a terminal in the `game` folder:

```bash
cd game
npm install
```

This downloads all required packages. You only need to do this once.

---

### Step 4: For the Interactive AI Install Foundry Local

The game works **without** Foundry Local (in demo mode), but for the full AI experience:

#### Windows
```bash
winget install Microsoft.FoundryLocal
```

#### Start the Game

The CLI game uses the `foundry-local-sdk` to discover, download, and load models automatically. You do not need to start a model manually:

```bash
cd game
npm install
npm start
```

The SDK will find available models, download any that are missing, and load the best one for you.

---

### Step 5: Run the Game!

#### Option A: Use the Startup Script (Recommended)

**Windows (Batch):**
```cmd
cd game
scripts\start-game.bat
```

**Windows (PowerShell):**
```powershell
cd game
powershell -ExecutionPolicy Bypass -File scripts\start-game.ps1
```

**Mac/Linux:**
```bash
cd game
chmod +x scripts/start-game.sh
./scripts/start-game.sh
```

#### Option B: Use npm
```bash
npm start
```

---

## 🎮 How to Play

When you start the game, you will see a welcome screen:

```
╔══════════════════════════════════════════════════════════════════╗
║     🎮 FOUNDRY LOCAL LEARNING ADVENTURE 🎮                       ║
║                                                                  ║
║     Master Microsoft Foundry AI - One Level at a Time!           ║
╚══════════════════════════════════════════════════════════════════╝
```

### Basic Gameplay

1. **Start a level**: Type `play 1` to start Level 1
2. **Follow instructions**: Each level explains what to do
3. **Complete the task**: Try the challenge
4. **Get help if stuck**: Type `hint` for tips
5. **Earn rewards**: Complete levels to unlock badges!

### Your Mentor: Sage 🧙

Throughout the game, **Sage** will guide you:
- 📖 Introduces each level
- 💡 Provides helpful hints
- ❓ Answers your questions
- 🎉 Celebrates your wins!

Type `ask [your question]` anytime to chat with Sage.

---

## 📚 Level Guide

### Level 1: Meet the Model 🎯

**What you will do**: Send your first message to an AI and get a response.

**What you will learn**:
- How AI models communicate
- The request/response pattern
- What happens when you call an AI

**Example**:
```
Your prompt: Hello! Please introduce yourself.
```

**Tips**:
- Just type a friendly greeting
- Watch how the AI responds
- There is no wrong answer here!

**Badge Earned**: 🎯 Prompt Apprentice (100 points)

---

### Level 2: Prompt Mastery ✍️

**What you will do**: Improve a poorly written prompt and compare results.

**What you will learn**:
- Why prompt quality matters
- How to be specific and clear
- The difference good prompts make

**The Challenge**:
```
Bad prompt:  "tell me stuff about coding"
Your task:   Write a better version!
```

**Tips**:
- Be specific (what topic? what language?)
- Add context (your skill level, format wanted)
- Ask for examples

**Badge Earned**: ✍️ Prompt Engineer (150 points)

---

### Level 3: Embeddings Explorer 🔍

**What you will do**: Search a knowledge base using semantic similarity.

**What you will learn**:
- How AI understands meaning (not just keywords)
- What embeddings are and how they work
- How semantic search finds related content

**Example**:
```
Your query: "How do I run AI offline?"
Result: Finds content about Foundry Local's offline capabilities
```

**Tips**:
- Think about meaning, not exact words
- Try different ways of asking the same thing
- See how similar concepts connect

**Badge Earned**: 🔍 Embedding Explorer (200 points)

---

### Level 4: Workflow Wizard ⚡

**What you will do**: Build a 3-step AI pipeline that processes text.

**What you will learn**:
- How to chain AI operations together
- Passing output from one step to the next
- Automating complex multi-step tasks

**The Pipeline**:
```
Step 1: Summarize text
    ↓
Step 2: Extract keywords
    ↓
Step 3: Generate questions
```

**Tips**:
- Watch how each step uses the previous output
- Think about other workflows you could build
- This is how real AI applications work!

**Badge Earned**: ⚡ Workflow Wizard (250 points)

---

### Level 5: Build Your Own Tool 🔧

**What you will do**: Create a JavaScript function and let AI use it.

**What you will learn**:
- What AI tools/functions are
- How agents call external code
- Extending what AI can do

**Example Tool**:
```javascript
// A simple calculator tool
function add_numbers(a, b) {
    return a + b;
}
```

**Tips**:
- Keep your function simple
- Add clear descriptions
- The AI will learn to call your tool!

**Badge Earned**: 🏆 Foundry Champion (300 points)

---

## 📸 Game Screenshots

### Welcome Screen
When you first open the game, you will see a friendly welcome screen:

![Welcome Screen](game/screenshots/01-welcome-screen.png)

### Main Menu - Level Selection
After entering your name, choose from 5 progressive levels:

![Main Menu](game/screenshots/03-main-menu.png)

### Level 1 - Meet the Model
Your first interaction with an AI model:

![Level 1](game/screenshots/04-level1-meet-model.png)

### AI Response
Watch the AI respond to your prompts in real-time:

![AI Response](game/screenshots/05-level1-response.png)

### Sage - Your AI Mentor
Get help anytime from Sage, your friendly mentor:

![Mentor Chat](game/screenshots/06-mentor-chat.png)

### Hint System
Stuck? Use hints to guide your learning:

![Hint System](game/screenshots/07-hint-system.png)

### Progress Tracking
Track your points, badges, and completion status:

![Progress Modal](game/screenshots/08-progress-modal.png)

### Badge Collection
Earn badges as you master each concept:

![Badges](game/screenshots/09-badges-collection.png)

> **Note**: Screenshots are captured automatically using Playwright. The terminal version has similar functionality with a text-based interface.

### 🎬 Demo Videos

See the game in action with our walkthrough videos:

- **[Desktop Walkthrough](game/screenshots/demo-video/game-walkthrough.mp4)**: Full game experience (1280×720)
- **[Mobile Walkthrough](game/screenshots/demo-video/mobile-walkthrough.mp4)**: Mobile-responsive view (375×812)

---

## 💻 Commands Reference

| Command | What It Does | Example |
|---------|--------------|---------|
| `play [n]` | Start level n | `play 1` |
| `levels` | Show all levels | `levels` |
| `progress` | View your stats | `progress` |
| `badges` | See earned badges | `badges` |
| `hint` | Get a hint | `hint` |
| `ask [text]` | Ask the mentor | `ask what are embeddings?` |
| `explain [x]` | Explain a concept | `explain prompt engineering` |
| `help` | Show commands | `help` |
| `reset` | Reset progress | `reset` |
| `quit` | Save & exit | `quit` |

---

## 🏆 Rewards & Badges

### Badges You Can Earn

| Badge | Level | Points | For |
|-------|-------|--------|-----|
| 🎯 Prompt Apprentice | 1 | 100 | First AI call |
| ✍️ Prompt Engineer | 2 | 150 | Better prompts |
| 🔍 Embedding Explorer | 3 | 200 | Semantic search |
| ⚡ Workflow Wizard | 4 | 250 | AI pipelines |
| 🏆 Foundry Champion | 5 | 300 | All complete! |

### Point Milestones

| Points | Title | Description |
|--------|-------|-----------|
| 100 | Beginner | Just getting started! |
| 250 | Learner | Making progress! |
| 500 | Practitioner | Getting skilled! |
| 750 | Expert | Almost a master! |
| 1000 | Master | You have done it all! |

### Achievements

- 👣 **First Steps** - Complete your first level
- 🌟 **Halfway Hero** - Complete 50% of levels
- ⚡ **Speed Learner** - Complete a level in under 5 minutes
- 🧠 **Hint-Free Hero** - Complete without using hints
- ❓ **Curious Mind** - Ask 10 questions
- 🎓 **Master Graduate** - Complete everything!

---

## 🌍 Deploy to GitHub Pages

Deploy your own copy of the game to GitHub Pages for free hosting!

### Option 1: Automatic (GitHub Actions) - Recommended

1. **Fork this repository** to your GitHub account

2. **Enable GitHub Pages**:
   - Go to your repo's **Settings** → **Pages**
   - Source: Select **GitHub Actions**

3. **Push to main branch** - deployment happens automatically!

4. **Access your game** at: `https://YOUR-USERNAME.github.io/FoundryLocal-LearningAdventure/`

### Option 2: Manual Deployment

1. **Fork this repository**

2. **Enable GitHub Pages**:
   - Go to **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: `main`
   - Folder: `/game/web`

3. **Wait 2-3 minutes** for deployment

4. **Visit** `https://YOUR-USERNAME.github.io/FoundryLocal-LearningAdventure/`

> **Local testing**: See the [Quick Start](#-quick-start-5-minutes) section for running the web version on your machine.

---

## ❓ Troubleshooting

### "Node.js not found" or "node is not recognised"

**What happened**: Node.js is not installed or is not in your PATH.

**Fix**:
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Choose the **LTS** version
3. Run the installer (accept defaults)
4. **Close and reopen your terminal**
5. Try again

---

### "Foundry Local not detected"

**What happened**: The game cannot connect to Foundry Local.

**This is fine!** The game will work in "demo mode" with simulated responses.

**To enable full AI**:
1. Install Foundry Local: `winget install Microsoft.FoundryLocal`
2. Run `npm start` in the `game` folder
3. The SDK will discover, download, and load a model automatically

> **Note**: The CLI game uses the `foundry-local-sdk` npm package, which manages the Foundry Local service lifecycle (starting, model loading) internally. You do **not** need to start a model or configure a port manually. The web version scans common ports (61341, 5272, 51319, 5000, 8080) to find the running service.

---

### "Cannot find module" or "MODULE_NOT_FOUND"

**What happened**: Dependencies are not installed.

**Fix**:
```bash
cd game
npm install
npm start
```

---

### "Progress not saving"

**What happened**: The game cannot write to the progress file.

**Fix**:
- Use `quit` command to exit (not Ctrl+C)
- Check that `data/progress.json` exists
- Make sure you have write permission
- Try: `npm run reset` to create a fresh progress file

---

### "Game is frozen" or "Taking too long"

**What happened**: The AI call is taking a while.

**Fix**:
- Wait 10 to 15 seconds (AI can be slow)
- If using Foundry Local, check it is still running
- Press Ctrl+C to cancel and try again
- The game will use demo mode if AI is unavailable

---

## 🤔 Frequently Asked Questions

### Do I need to know programming?

**No!** The game teaches concepts through interaction. You will learn as you go.

### Do I need internet access?

**No!** Everything runs on your computer. That is what "Local" means.

### Do I need Foundry Local installed?

**No!** The game has a demo mode. But you will get better responses with it.

### Can I skip levels?

**No**, levels unlock in order. Each one builds on previous concepts.

### How long does it take to complete?

Most people finish in **1 to 2 hours**. Take your time and enjoy!

### What if I make a mistake?

**No problem!** That is how you learn. Use `hint` or `ask` for help.

### Can I replay completed levels?

**Yes!** Type `play [number]` to replay any completed level.

### How do I reset my progress?

Type `reset` in the game, or run `npm run reset`.

---

## 📁 Project Structure

```
FoundryLocal-LearningAdventure/
├── README.md               # This file!
├── AGENTS.md               # AI agent conventions
├── changelog.md            # Version history
├── LICENSE                 # MIT Licence
├── CONTRIBUTING.md         # Contribution guidelines
├── SECURITY.md             # Security policy
├── .gitignore              # Git ignore rules
├── .github/                # GitHub configuration
│   └── workflows/          # CI/CD workflows
│       ├── deploy.yml      # GitHub Pages deployment
│       └── test.yml        # Automated testing
└── game/                   # Game source code
    ├── src/                # Source code (Node.js version)
    │   ├── game.js         # Main game engine (uses foundry-local-sdk)
    │   ├── levels.js       # Level management and tasks
    │   └── mentor.js       # AI mentor (Sage)
    ├── web/                # Web version (GitHub Pages)
    │   ├── index.html      # Main HTML page
    │   ├── styles.css      # Game styling
    │   ├── game-web.js     # Web game engine
    │   └── game-data.js    # Levels, rewards, mentor data
    ├── data/               # Game data (JSON)
    │   ├── levels.json     # Level definitions
    │   ├── rewards.json    # Badges and achievements
    │   └── progress.json   # Your saved progress
    ├── screenshots/        # Game screenshots
    ├── tests/              # Test files
    ├── scripts/            # All startup scripts
    │   ├── start-game.bat  # Windows CLI launcher
    │   ├── start-game.ps1  # PowerShell CLI launcher
    │   ├── start-game.sh   # Mac/Linux CLI launcher
    │   ├── start-web.bat   # Windows Web launcher
    │   ├── start-web.ps1   # PowerShell Web launcher
    │   └── start-web.sh    # Mac/Linux Web launcher
    ├── config.json         # Settings
    └── package.json        # Node.js configuration (includes foundry-local-sdk)
```

---

## 🧪 Running Tests

Make sure everything is working:

```bash
# Run all tests
npm test

# Check Foundry Local status (Windows)
npm run test:foundry

# Reset your progress
npm run reset
```

### Running Web Screenshot Tests

Capture screenshots automatically using Playwright:

```bash
# Navigate to game folder
cd game

# Install Playwright (first time only)
npm run test:install

# Capture all screenshots
npm run test:screenshots
```

Screenshots are saved to `game/screenshots/`.

Test output shows:
- ✅ Passed tests (green)
- ❌ Failed tests (red)  
- ⏭️ Skipped tests (yellow - usually means Foundry Local not running)

---

## ⚙️ Configuration

Edit `config.json` to customise:

```json
{
  "foundryLocal": {
    "defaultModel": "Phi-3.5-mini-instruct-generic-cpu:1",
    "sdkAppName": "FoundryLearningAdventure",
    "sdkLogLevel": "warn"
  },
  "azureFoundry": {
    "enabled": false,
    "endpoint": "https://YOUR-RESOURCE.openai.azure.com",
    "apiKey": "YOUR-API-KEY",
    "apiVersion": "2024-02-01",
    "deploymentName": "gpt-4o-mini"
  },
  "game": {
    "maxHintsPerLevel": 3,
    "demoModeEnabled": true
  }
}
```

### Connection Modes

The game automatically detects available AI services:

| Priority | Mode | Description |
|----------|------|-------------|
| 1 | **Foundry Local** | Uses local AI model via the `foundry-local-sdk` (CLI) or HTTP port scanning (web) |
| 2 | **Azure OpenAI** | Uses Azure cloud if configured |
| 3 | **Demo Mode** | Simulated responses (fallback) |

### Using Azure OpenAI (Cloud)

To use Azure OpenAI instead of local models:

1. **Create an Azure OpenAI resource** at [Azure Portal](https://portal.azure.com)
2. **Deploy a model** (e.g., gpt-4o-mini)
3. **Update config.json**:
   ```json
   {
     "azureFoundry": {
       "enabled": true,
       "endpoint": "https://your-resource.openai.azure.com",
       "apiKey": "your-api-key",
       "deploymentName": "gpt-4o-mini"
     }
   }
   ```
4. Run the game - it will connect to Azure!

### Common Changes

- **Different model**: Change `defaultModel` to your preferred model alias
- **More hints**: Increase `maxHintsPerLevel`
- **SDK logging**: Set `sdkLogLevel` to `"info"` or `"debug"` for more detailed output

---

## 🤝 Contributing

We welcome contributions! Here is how:

1. **Fork** the repository
2. **Create** a branch: `git checkout -b my-feature`
3. **Make** your changes
4. **Test**: `npm test`
5. **Commit**: `git commit -m "Add my feature"`
6. **Push**: `git push origin my-feature`
7. **Open** a Pull Request

### Ideas for Contributions

- 🆕 New levels teaching more concepts
- 🌍 Translations to other languages
- 🎨 Visual/UX improvements
- 🐛 Bug fixes
- 📖 Documentation improvements
- 🧪 More tests

---

## 📚 Learn More

- [Foundry Local Documentation](https://learn.microsoft.com/azure/ai-studio/foundry-local)
- [Prompt Engineering Guide](https://learn.microsoft.com/azure/ai-services/openai/concepts/prompt-engineering)
- [Understanding Embeddings](https://learn.microsoft.com/azure/ai-services/openai/concepts/understand-embeddings)
- [AI Fundamentals Learning Path](https://learn.microsoft.com/training/paths/get-started-with-artificial-intelligence-on-azure/)

---

## 📄 Licence

MIT Licence - Feel free to use, modify, and share!

See [LICENSE](LICENSE) for details.

---

## 💬 Get Help

- 🐛 **Bug?** Open an issue
- 💡 **Idea?** Start a discussion
- ❓ **Question?** Check FAQ or open an issue

---

<div align="center">

**🎮 Happy Learning! ✨**

*Built with ❤️ for the Foundry Local community*

[⬆ Back to Top](#-foundry-local-learning-adventure)

</div>
