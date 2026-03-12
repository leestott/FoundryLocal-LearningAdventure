# Leveling Up AI Learning: Behind the Foundry Local Learning Adventure

*Published January 28, 2026*

What if learning AI felt like playing a game? The **Foundry Local Learning Adventure** is an open-source project that turns abstract concepts (prompt engineering, embeddings, workflows, and tool building) into a playful 5-level quest that runs entirely on your machine. Whether you are a **student** exploring AI for the first time, an **educator** looking for a ready-made classroom activity, or a **developer** building your own AI learning tools, this post unpacks the design choices you can learn from and reuse.

## A Game That Teaches While You Play

- **Mentored progression:** Five narrative levels, guided by Sage the in-game mentor, cover first prompts through tool-building. Each level layers a single new AI concept so players never feel lost.
- **Every environment:** The same content powers a terminal-first experience for model tinkerers and a browser-friendly version for instant demos, perfect for hackathons or classrooms.
- **Offline-first mindset:** By default the game connects to Microsoft Foundry Local; if that is unavailable it gracefully falls back to Microsoft Foundry and Azure OpenAI or a fully simulated demo mode, keeping the learning loop unbroken.
- **Classroom-ready:** Educators can fork the repo, enable GitHub Pages, and share a link. Students start playing instantly with no local setup.
- **Model selection and status:** The web version includes a model selector dropdown and real-time connection status with download progress, so learners always know what the game is doing.
- **SDK-powered discovery:** The CLI game uses the `foundry-local-sdk` npm package to discover, download, and load models automatically. No manual port configuration is needed.

## Scenes From Inside the Adventure

![Welcome screen](../game/screenshots/01-welcome-screen.png)

![Level progression menu](../game/screenshots/03-main-menu.png)

![Mentor guidance](../game/screenshots/06-mentor-chat.png)

These PNG screenshots are captured automatically using Playwright tests, making it easy to keep documentation in sync with the latest UI changes.

### Demo Videos

Want to see the game in action? Check out the walkthrough videos:

- **[Desktop Walkthrough](../game/screenshots/demo-video/game-walkthrough.mp4)**: Full game experience at 1280×720
- **[Mobile Walkthrough](../game/screenshots/demo-video/mobile-walkthrough.mp4)**: Mobile-responsive view at 375×812

## Architecture in 90 Seconds

1. **Content layer:** JSON files in `game/data/` define levels, hints, rewards, and sample prompts so writers and engineers can collaborate without stepping on each other.
2. **Game engine:** `game/src/` houses the Node.js engine that orchestrates progress, mentor dialogue, and AI requests. The CLI version uses the `foundry-local-sdk` npm package for native model interaction via FFI.
3. **Web version:** The browser-based game in `game/web/` communicates via HTTP `fetch()` against the OpenAI-compatible REST API. It includes a model selector dropdown and real-time connection status with progress indicators. Startup scripts in `game/scripts/` wire everything together for Windows, macOS, and Linux.

Because the engine persists progress to disk and mirrors it in `localStorage` on the web, learners can pause anywhere and pick back up without losing badges.

## Code Spotlight: SDK-Powered Model Discovery

One of the trickiest parts of working with Foundry Local used to be that it bound to a **different port every time it started**. Asking beginners to find and configure port numbers killed the learning momentum. The game now solves this with the `foundry-local-sdk` npm package, which handles discovery, download, and loading automatically:

```javascript
import { FoundryLocalManager } from 'foundry-local-sdk';

class FoundryLocalClient {
  async initializeSDK() {
    // Create the SDK manager
    this.manager = await FoundryLocalManager.create({
      appName: 'FoundryLearningAdventure',
      logLevel: 'warn'
    });

    // Discover available models from the local catalogue
    const models = await this.manager.catalog.getModels();

    // Download the model if needed, then load it
    const model = models[0];
    await model.download();
    await model.load();

    // Create a chat client for inference
    this.chatClient = model.createChatClient();
    this.chatClient.settings.maxTokens = 500;
    this.chatClient.settings.temperature = 0.7;
  }

  async chat(messages) {
    const response = await this.chatClient.completeChat(messages);
    return response.choices[0].message.content;
  }
}
```

For the **web version**, the browser cannot use the SDK (it relies on native FFI). Instead, the web game scans known ports and communicates via the OpenAI-compatible REST API. The web UI also features a model selector dropdown and real-time status indicators showing scanning, download, and loading progress.

Feel free to adopt this pattern in your own projects. The triage between local SDK, cloud, and simulated responses keeps workshops moving even when someone forgets to install Foundry Local.

## Try the Adventure in Minutes

| Experience | Best For | Command
| --- | --- | --- |
| **Play instantly in the browser** | Demos, classrooms, sharing links | [GitHub Pages build](https://leestott.github.io/FoundryLocal-LearningAdventure/)
| **Run the CLI with real local models** | Deep dives, traceable prompts | `cd game && npm install && npm start`
| **Automate setup** | New contributors, scripted labs | `scripts/start-game.ps1` (Windows) or `scripts/start-game.sh` (macOS/Linux)


## Remix Ideas

### For Educators
1. **Swap the syllabus:** Edit `game/data/levels.json` to teach your curriculum (responsible AI, data literacy, or domain-specific copilot workflows). No code changes needed.
2. **Run a classroom challenge:** Fork the repo, enable GitHub Pages, and share the link. Students race to earn all five badges while learning at their own pace.
3. **Add assessment hooks:** Extend the progress system to export completion data, giving you visibility into which concepts students find easy or hard.

### For Developers
4. **Inject real tools:** Follow Level 5's pattern to register functions (vector searchers, DevOps runbooks, database queries) that AI characters can call.
5. **Add observability:** Hook tracing into `FoundryLocalClient.chat()` so users can watch tokens flow in real time.
6. **Use the SDK pattern:** Drop the `foundry-local-sdk` initialisation pattern into your own Foundry Local projects for automatic model discovery and loading.

### For Students
7. **Extend a level:** Pick any level and add a new challenge or hint. This is a great first open-source contribution.
8. **Build your own tool:** After completing Level 5, create a tool that solves a real problem you care about and submit a PR.

## Call to Adventure

The entire project is open source under MIT. Whether you are a student earning your first badge, an educator sharing it with a class, or a developer remixing it into something new, jump in:

👉 **[Explore the repo and start playing](https://github.com/leestott/FoundryLocal-LearningAdventure)**

Tag your creations with **#FoundryLocal** so the community can celebrate every new learning quest you design.
