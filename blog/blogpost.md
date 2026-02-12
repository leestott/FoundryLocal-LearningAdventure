# Leveling Up AI Learning: Behind the Foundry Local Learning Adventure

*Published January 28, 2026*

Building delightful AI learning experiences does not have to be a mystery. The Foundry Local Learning Adventure shows how a handful of thoughtful design decisions can turn abstract concepts like prompt engineering and embeddings into a playful journey that runs entirely on your machine. This post highlights the ingredients you can reuse to craft your own inspiring AI education experiences.

## A Game That Teaches While You Play

- **Mentored progression:** Five narrative levels, guided by Sage the in-game mentor, cover first prompts through tool-building. Each level layers a single new AI concept so players never feel lost.
- **Every environment:** The same content powers a terminal-first experience for model tinkerers and a browser-friendly version for instant demos—perfect for hackathons or classrooms.
- **Offline-first mindset:** By default the game connects to Microsoft Foundry Local; if that is unavailable it gracefully falls back to Microsoft Foundry and Azure OpenAI or a fully simulated demo mode, keeping the learning loop unbroken.
- **Dynamic port discovery:** Foundry Local assigns a different port each time the service starts. Rather than asking learners to hunt for port numbers, the game automatically discovers the active endpoint using a 3-tier strategy: CLI-based discovery via `foundry service status`, the configured URL, and common port scanning.

## Scenes From Inside the Adventure

![Welcome screen](../game/screenshots/01-welcome-screen.svg)

![Level progression menu](../game/screenshots/03-main-menu.svg)

![Mentor guidance](../game/screenshots/06-mentor-chat.svg)

These SVG screenshots (captured directly from the web client) make it easy to reuse the visual language in presentations or developer docs.

## Architecture in 90 Seconds

1. **Content layer:** JSON files in `game/data/` define levels, hints, rewards, and sample prompts so writers and engineers can collaborate without stepping on each other.
2. **Game engine:** `game/src/` houses the Node.js engine that orchestrates progress, mentor dialogue, and AI requests. The same logic feeds both CLI and web builds, ensuring parity.
3. **Connectors:** Startup scripts in `game/scripts/` wire everything together for Windows, macOS, and Linux, and web boot scripts serve the SPA version from `game/web/`. For the web version, start scripts discover Foundry Local's dynamic port and write a `foundry-port.json` file so the browser can connect without manual configuration.

Because the engine persists progress to disk and mirrors it in `localStorage` on the web, learners can pause anywhere and pick back up without losing badges.

## Code Spotlight: Dynamic Port Discovery

One of the trickiest parts of working with Foundry Local is that it binds to a **different port every time it starts**. Asking beginners to find and configure port numbers kills the learning momentum. The game solves this with automatic discovery:

```javascript
class FoundryLocalClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://127.0.0.1:5272';
    this.model = options.model || 'Phi-3.5-mini-instruct-generic-cpu:1';
    this.connectionMode = 'demo';
    this.autoDiscoverPort = options.autoDiscoverPort !== false;
    this.commonPorts = options.commonPorts || [61341, 5272, 51319, 5000, 8080];
  }

  // 1️⃣ First try: ask the CLI for the active endpoint
  discoverPortViaCLI() {
    const output = execSync('foundry service status', { encoding: 'utf-8' });
    const match = output.match(/https?:\/\/(?:127\.0\.0\.1|localhost):(\d+)/i);
    return match ? `http://127.0.0.1:${match[1]}` : null;
  }

  // 2️⃣ Then: try the configured URL
  // 3️⃣ Finally: scan common ports as a fallback
  async tryFoundryLocal() {
    if (this.autoDiscoverPort) {
      const cliUrl = this.discoverPortViaCLI();
      if (cliUrl && await this.tryFoundryUrl(cliUrl)) return true;
    }
    if (await this.tryFoundryUrl(this.baseUrl)) return true;
    for (const port of this.commonPorts) { /* scan... */ }
    return false;
  }
}
```

For the **web version**, the browser obviously cannot run CLI commands. Instead, the start scripts discover the port at launch time and write a tiny `foundry-port.json` file into the web directory:

```json
{ "port": 47183, "discoveredAt": "2026-02-12T10:30:00Z" }
```

The browser reads this file first, then falls back to port scanning. The result: learners just run `foundry model run Phi-4` and everything connects automatically.

Feel free to copy this pattern into your own agents. The triage between local, cloud, and simulated responses keeps workshops moving even when someone forgets to start their model.

## Try the Adventure in Minutes

| Experience | Best For | Command
| --- | --- | --- |
| **Play instantly in the browser** | Demos, classrooms, sharing links | [GitHub Pages build](https://leestott.github.io/FoundryLocal-LearningAdventure/)
| **Run the CLI with real local models** | Deep dives, traceable prompts | `cd game && npm install && npm start`
| **Automate setup** | New contributors, scripted labs | `scripts/start-game.ps1` (Windows) or `scripts/start-game.sh` (macOS/Linux)


## Remix Ideas for Your Own Build

1. **Swap the syllabus:** Edit `game/data/levels.json` to teach your domain—security copilot workflows, custom GPT operations, or agent evaluation basics.
2. **Inject real tools:** Follow Level 5’s pattern to register functions (think vector searchers or DevOps runbooks) that characters can call.
3. **Add observability:** Hook tracing into `FoundryLocalClient.chat()` so learners can open a dashboard and watch tokens flow in real time.
4. **Borrow the port discovery:** The dynamic port discovery pattern works for any tool that wraps Foundry Local. Drop `discoverPortViaCLI()` into your own projects so users never have to configure a port manually.
5. **Ship it everywhere:** Use the included GitHub Actions workflow to deploy your variant to Pages—then let learners fork-and-go.

## Call to Adventure

The entire project is open source under MIT. Fork it, remix it, and share what you build:

👉 **[Explore the repo and start playing](https://github.com/leestott/FoundryLocal-LearningAdventure)**

Tag your creations with #FoundryLocal so the community can celebrate every new learning quest you design.
