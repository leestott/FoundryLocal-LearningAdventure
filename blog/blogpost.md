# Leveling Up AI Learning: Behind the Foundry Local Learning Adventure

*Published January 28, 2026*

What if learning AI felt like playing a game? The **Foundry Local Learning Adventure** is an open-source project that turns abstract concepts — prompt engineering, embeddings, workflows, and tool building — into a playful 5-level quest that runs entirely on your machine. Whether you're a **student** exploring AI for the first time, an **educator** looking for a ready-made classroom activity, or a **developer** building your own AI learning tools, this post unpacks the design choices you can learn from and reuse.

## A Game That Teaches While You Play

- **Mentored progression:** Five narrative levels, guided by Sage the in-game mentor, cover first prompts through tool-building. Each level layers a single new AI concept so players never feel lost.
- **Every environment:** The same content powers a terminal-first experience for model tinkerers and a browser-friendly version for instant demos—perfect for hackathons or classrooms.
- **Offline-first mindset:** By default the game connects to Microsoft Foundry Local; if that is unavailable it gracefully falls back to Microsoft Foundry and Azure OpenAI or a fully simulated demo mode, keeping the learning loop unbroken.
- **Classroom-ready:** Educators can fork the repo, enable GitHub Pages, and share a link — students start playing instantly with no local setup.
- **Dynamic port discovery:** Foundry Local assigns a different port each time the service starts. Rather than asking learners to hunt for port numbers, the game automatically discovers the active endpoint using a 3-tier strategy: CLI-based discovery via `foundry service status`, the configured URL, and common port scanning.

## Scenes From Inside the Adventure

![Welcome screen](../game/screenshots/01-welcome-screen.png)

![Level progression menu](../game/screenshots/03-main-menu.png)

![Mentor guidance](../game/screenshots/06-mentor-chat.png)

These PNG screenshots are captured automatically using Playwright tests, making it easy to keep documentation in sync with the latest UI changes.

### Demo Videos

Want to see the game in action? Check out the walkthrough videos:

- **[Desktop Walkthrough](../game/screenshots/demo-video/game-walkthrough.mp4)** — Full game experience at 1280×720
- **[Mobile Walkthrough](../game/screenshots/demo-video/mobile-walkthrough.mp4)** — Mobile-responsive view at 375×812

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


## Remix Ideas

### For Educators
1. **Swap the syllabus:** Edit `game/data/levels.json` to teach your curriculum — responsible AI, data literacy, or domain-specific copilot workflows. No code changes needed.
2. **Run a classroom challenge:** Fork the repo, enable GitHub Pages, and share the link. Students race to earn all five badges while learning at their own pace.
3. **Add assessment hooks:** Extend the progress system to export completion data, giving you visibility into which concepts students find easy or hard.

### For Developers
4. **Inject real tools:** Follow Level 5's pattern to register functions — vector searchers, DevOps runbooks, database queries — that AI characters can call.
5. **Add observability:** Hook tracing into `FoundryLocalClient.chat()` so users can watch tokens flow in real time.
6. **Borrow the port discovery:** Drop `discoverPortViaCLI()` into your own Foundry Local projects so users never have to configure a port manually.

### For Students
7. **Extend a level:** Pick any level and add a new challenge or hint — a great first open-source contribution.
8. **Build your own tool:** After completing Level 5, create a tool that solves a real problem you care about and submit a PR.

## Call to Adventure

The entire project is open source under MIT. Whether you're a student earning your first badge, an educator sharing it with a class, or a developer remixing it into something new — jump in:

👉 **[Explore the repo and start playing](https://github.com/leestott/FoundryLocal-LearningAdventure)**

Tag your creations with **#FoundryLocal** so the community can celebrate every new learning quest you design.
