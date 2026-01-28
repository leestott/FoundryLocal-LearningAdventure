/**
 * Foundry Local Learning Game - Main Game Engine
 * A progressive adventure game to learn Microsoft Foundry Local
 */

import { createInterface } from 'readline';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { LevelManager, TaskHandler } from './levels.js';
import { Mentor } from './mentor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Foundry Local Client - Handles communication with the local model
 */
class FoundryLocalClient {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || 'http://localhost:5272';
        this.model = options.model || 'Phi-4';
        this.initialized = false;
    }

    /**
     * Initialize the client and verify connection
     */
    async initialize() {
        console.log('\n🔌 Connecting to Foundry Local...');
        try {
            // Check if Foundry Local is running
            const response = await fetch(`${this.baseUrl}/v1/models`);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Connected! Available models: ${data.data?.map(m => m.id).join(', ') || this.model}`);
                this.initialized = true;
                return true;
            }
        } catch (error) {
            console.log('⚠️  Foundry Local not detected. Running in demo mode.');
            console.log('💡 To use the full experience, start Foundry Local with: foundry model run');
            this.initialized = false;
        }
        return false;
    }

    /**
     * Send a chat message to the model
     */
    async chat(message) {
        if (!this.initialized) {
            return this.getDemoResponse(message);
        }

        try {
            const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: 'user', content: message }],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });

            const data = await response.json();
            return data.choices?.[0]?.message?.content || 'No response received.';
        } catch (error) {
            console.error('Error calling model:', error.message);
            return this.getDemoResponse(message);
        }
    }

    /**
     * Send a chat with system prompt
     */
    async chatWithSystem(systemPrompt, userMessage) {
        if (!this.initialized) {
            return this.getDemoResponse(userMessage);
        }

        try {
            const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage }
                    ],
                    max_tokens: 300,
                    temperature: 0.7
                })
            });

            const data = await response.json();
            return data.choices?.[0]?.message?.content || 'No response received.';
        } catch (error) {
            return this.getDemoResponse(userMessage);
        }
    }

    /**
     * Generate embeddings for text
     */
    async getEmbedding(text) {
        if (!this.initialized) {
            // Return a simple hash-based pseudo-embedding for demo
            return this.getPseudoEmbedding(text);
        }

        try {
            const response = await fetch(`${this.baseUrl}/v1/embeddings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'text-embedding-3-small',
                    input: text
                })
            });

            const data = await response.json();
            return data.data?.[0]?.embedding || this.getPseudoEmbedding(text);
        } catch (error) {
            return this.getPseudoEmbedding(text);
        }
    }

    /**
     * Generate pseudo-embedding for demo mode
     */
    getPseudoEmbedding(text) {
        const words = text.toLowerCase().split(/\s+/);
        const embedding = new Array(128).fill(0);
        words.forEach((word, i) => {
            const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            embedding[hash % 128] += 1 / (i + 1);
        });
        // Normalize
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => val / (magnitude || 1));
    }

    /**
     * Get demo responses when Foundry Local is not available
     */
    getDemoResponse(message) {
        const responses = {
            greeting: "Hello! I'm a demo AI assistant. In the full version with Foundry Local, you'd get intelligent, contextual responses. For now, I'm simulating the experience so you can learn the game flow!",
            prompt: "This is a simulated response. When Foundry Local is running, you'll see actual AI-generated content here. The concepts you're learning apply directly to how real AI models work!",
            summary: "AI is transforming technology through machine learning and neural networks, enabling applications from virtual assistants to medical diagnosis.",
            keywords: "AI, machine learning, deep learning, neural networks, NLP",
            questions: "1. What is the difference between AI and machine learning?\n2. How do neural networks process information?\n3. What are some real-world applications of NLP?"
        };

        if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('introduce')) {
            return responses.greeting;
        } else if (message.toLowerCase().includes('summary') || message.toLowerCase().includes('summarize')) {
            return responses.summary;
        } else if (message.toLowerCase().includes('keyword')) {
            return responses.keywords;
        } else if (message.toLowerCase().includes('question')) {
            return responses.questions;
        }
        return responses.prompt;
    }
}

/**
 * Progress Manager - Handles saving and loading player progress
 */
class ProgressManager {
    constructor() {
        this.progressPath = path.join(__dirname, '..', 'data', 'progress.json');
        this.progress = null;
    }

    /**
     * Load progress from file
     */
    async loadProgress() {
        try {
            const data = await fs.readFile(this.progressPath, 'utf-8');
            this.progress = JSON.parse(data);
            return this.progress;
        } catch (error) {
            // Create default progress
            this.progress = this.getDefaultProgress();
            await this.saveProgress();
            return this.progress;
        }
    }

    /**
     * Get default progress structure
     */
    getDefaultProgress() {
        return {
            player: {
                name: '',
                createdAt: new Date().toISOString(),
                lastPlayed: new Date().toISOString()
            },
            stats: {
                totalPoints: 0,
                currentLevel: 1,
                levelsCompleted: 0,
                hintsUsed: 0,
                mentorQuestions: 0,
                totalPlayTime: 0,
                fastestLevel: null,
                totalPromptsSent: 0
            },
            levels: {
                '1': { completed: false, startedAt: null, completedAt: null, attempts: 0, hintsUsed: 0, timeSpent: 0 },
                '2': { completed: false, startedAt: null, completedAt: null, attempts: 0, hintsUsed: 0, timeSpent: 0 },
                '3': { completed: false, startedAt: null, completedAt: null, attempts: 0, hintsUsed: 0, timeSpent: 0 },
                '4': { completed: false, startedAt: null, completedAt: null, attempts: 0, hintsUsed: 0, timeSpent: 0 },
                '5': { completed: false, startedAt: null, completedAt: null, attempts: 0, hintsUsed: 0, timeSpent: 0 }
            },
            badges: [],
            achievements: []
        };
    }

    /**
     * Save progress to file
     */
    async saveProgress() {
        try {
            await fs.writeFile(this.progressPath, JSON.stringify(this.progress, null, 2));
        } catch (error) {
            console.error('Error saving progress:', error.message);
        }
    }

    /**
     * Update player name
     */
    async setPlayerName(name) {
        this.progress.player.name = name;
        this.progress.player.lastPlayed = new Date().toISOString();
        await this.saveProgress();
    }

    /**
     * Mark a level as started
     */
    async startLevel(levelId) {
        if (!this.progress.levels[levelId].startedAt) {
            this.progress.levels[levelId].startedAt = new Date().toISOString();
        }
        this.progress.levels[levelId].attempts++;
        await this.saveProgress();
    }

    /**
     * Mark a level as completed
     */
    async completeLevel(levelId, points, badge) {
        const levelProgress = this.progress.levels[levelId];
        levelProgress.completed = true;
        levelProgress.completedAt = new Date().toISOString();
        
        // Calculate time spent
        const startTime = new Date(levelProgress.startedAt);
        const endTime = new Date();
        levelProgress.timeSpent = Math.round((endTime - startTime) / 1000);

        // Update stats
        this.progress.stats.totalPoints += points;
        this.progress.stats.levelsCompleted++;
        this.progress.stats.currentLevel = Math.min(levelId + 1, 5);

        // Track fastest level
        if (!this.progress.stats.fastestLevel || levelProgress.timeSpent < this.progress.stats.fastestLevel) {
            this.progress.stats.fastestLevel = levelProgress.timeSpent;
        }

        // Add badge
        if (badge && !this.progress.badges.includes(badge)) {
            this.progress.badges.push(badge);
        }

        await this.saveProgress();
        return levelProgress;
    }

    /**
     * Record hint usage
     */
    async useHint(levelId) {
        this.progress.levels[levelId].hintsUsed++;
        this.progress.stats.hintsUsed++;
        await this.saveProgress();
    }

    /**
     * Record mentor question
     */
    async askMentor() {
        this.progress.stats.mentorQuestions++;
        await this.saveProgress();
    }

    /**
     * Record prompt sent
     */
    async recordPrompt() {
        this.progress.stats.totalPromptsSent++;
        await this.saveProgress();
    }

    /**
     * Get player stats
     */
    getStats() {
        return this.progress.stats;
    }

    /**
     * Get completed levels count
     */
    getCompletedCount() {
        return Object.values(this.progress.levels).filter(l => l.completed).length;
    }
}

/**
 * Main Game Class
 */
class FoundryLearningGame {
    constructor() {
        this.foundryClient = new FoundryLocalClient();
        this.levelManager = new LevelManager();
        this.progressManager = new ProgressManager();
        this.taskHandler = null;
        this.mentor = null;
        this.rl = null;
        this.currentLevel = null;
        this.currentHintIndex = 0;
        this.sessionStartTime = Date.now();
    }

    /**
     * Initialize the game
     */
    async initialize() {
        // Setup readline interface
        this.rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // Initialize components
        await this.foundryClient.initialize();
        await this.levelManager.loadLevels();
        await this.progressManager.loadProgress();
        
        this.taskHandler = new TaskHandler(this.foundryClient);
        this.mentor = new Mentor(this.foundryClient);
    }

    /**
     * Display the game banner
     */
    displayBanner() {
        console.clear();
        console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║     🎮 FOUNDRY LOCAL LEARNING ADVENTURE 🎮                       ║
║                                                                  ║
║     Master Microsoft Foundry AI - One Level at a Time!           ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  Commands:                                                       ║
║    • play [level]  - Start or continue a level                   ║
║    • levels        - View all levels                             ║
║    • progress      - Check your progress                         ║
║    • hint          - Get a hint (during a level)                 ║
║    • ask [question]- Ask the mentor a question                   ║
║    • help          - Show available commands                     ║
║    • quit          - Save and exit                               ║
╚══════════════════════════════════════════════════════════════════╝
`);
    }

    /**
     * Display help information
     */
    displayHelp() {
        console.log(`
📖 AVAILABLE COMMANDS
─────────────────────────────────────
  play [n]     Start level n (e.g., 'play 1')
  levels       Show all levels and your progress
  progress     Display your stats and achievements
  badges       View your earned badges
  hint         Get a hint for the current level
  ask [text]   Ask the mentor any question
  explain [x]  Get an explanation of concept x
  reset        Reset your progress (careful!)
  quit         Save your progress and exit
─────────────────────────────────────
`);
    }

    /**
     * Get player name
     */
    async getPlayerName() {
        if (this.progressManager.progress.player.name) {
            return this.progressManager.progress.player.name;
        }

        return new Promise((resolve) => {
            this.rl.question('\n🎮 Welcome, adventurer! What should I call you? ', async (name) => {
                const playerName = name.trim() || 'Champion';
                await this.progressManager.setPlayerName(playerName);
                resolve(playerName);
            });
        });
    }

    /**
     * Prompt for user input
     */
    async prompt(message = '\n🎮 > ') {
        return new Promise((resolve) => {
            this.rl.question(message, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    /**
     * Main game loop
     */
    async run() {
        await this.initialize();
        this.displayBanner();

        const playerName = await this.getPlayerName();
        await this.mentor.welcome(playerName);

        // Main command loop
        while (true) {
            const input = await this.prompt();
            const [command, ...args] = input.toLowerCase().split(' ');

            switch (command) {
                case 'play':
                case 'start':
                    await this.playLevel(parseInt(args[0]) || this.progressManager.progress.stats.currentLevel);
                    break;

                case 'levels':
                case 'menu':
                    this.levelManager.displayLevelMenu(this.progressManager.progress);
                    break;

                case 'progress':
                case 'stats':
                    await this.showProgress();
                    break;

                case 'badges':
                    this.showBadges();
                    break;

                case 'hint':
                    await this.getHint();
                    break;

                case 'ask':
                    await this.askMentor(args.join(' '));
                    break;

                case 'explain':
                    await this.explainConcept(args.join(' '));
                    break;

                case 'help':
                case '?':
                    this.displayHelp();
                    break;

                case 'reset':
                    await this.resetProgress();
                    break;

                case 'quit':
                case 'exit':
                case 'q':
                    await this.quit();
                    return;

                case '':
                    // Empty input, show prompt again
                    break;

                default:
                    console.log(`❓ Unknown command: "${command}". Type 'help' for available commands.`);
            }
        }
    }

    /**
     * Play a specific level
     */
    async playLevel(levelId) {
        // Check if level exists
        const level = this.levelManager.getLevel(levelId);
        if (!level) {
            console.log(`❌ Level ${levelId} doesn't exist. We have levels 1-5.`);
            return;
        }

        // Check if level is unlocked
        if (!this.levelManager.isLevelUnlocked(levelId, this.progressManager.progress)) {
            console.log(`🔒 Level ${levelId} is locked! Complete the previous level first.`);
            return;
        }

        // Check if already completed
        if (this.progressManager.progress.levels[levelId].completed) {
            const replay = await this.prompt(`✅ You've already completed this level. Replay? (y/n) `);
            if (replay.toLowerCase() !== 'y') {
                return;
            }
        }

        // Set current level
        this.currentLevel = level;
        this.currentHintIndex = 0;
        await this.progressManager.startLevel(levelId);

        // Display level info and mentor introduction
        this.levelManager.displayLevelInfo(level);
        await this.mentor.introduceLevel(level);

        // Execute the level task
        let success = false;
        switch (level.task.type) {
            case 'prompt_call':
                success = await this.executeLevel1();
                break;
            case 'prompt_comparison':
                success = await this.executeLevel2();
                break;
            case 'embedding_search':
                success = await this.executeLevel3();
                break;
            case 'workflow_creation':
                success = await this.executeLevel4();
                break;
            case 'tool_creation':
                success = await this.executeLevel5();
                break;
        }

        // Handle completion
        if (success) {
            const stats = await this.progressManager.completeLevel(
                levelId, 
                level.reward.points, 
                level.reward.badge
            );
            this.levelManager.displayLevelComplete(level);
            await this.mentor.celebrateLevelComplete(level, stats);
            this.currentLevel = null;
        }
    }

    /**
     * Level 1: Meet the Model
     */
    async executeLevel1() {
        console.log('\n📝 Task: Send a greeting to the AI model and see its response.\n');
        console.log('Type your message, or press Enter to use the default prompt.');
        
        const input = await this.prompt('Your prompt: ');
        const prompt = input || this.currentLevel.task.prompt;

        console.log(`\n📤 Sending: "${prompt}"`);
        await this.progressManager.recordPrompt();

        const result = await this.taskHandler.handlePromptCall(this.currentLevel.task, prompt);
        
        if (result.success) {
            console.log('\n✅ Great job! You successfully communicated with the AI model!');
            return true;
        } else {
            await this.mentor.encourageRetry(this.currentLevel, result.error);
            return false;
        }
    }

    /**
     * Level 2: Prompt Mastery
     */
    async executeLevel2() {
        const task = this.currentLevel.task;
        
        console.log('\n📝 Current "bad" prompt:', task.badPrompt);
        console.log('\n💡 Tips for improvement:');
        task.improvementTips.forEach((tip, i) => console.log(`   ${i + 1}. ${tip}`));
        
        console.log('\n✍️ Write an improved version of this prompt:');
        const improvedPrompt = await this.prompt('Your improved prompt: ');

        if (!improvedPrompt) {
            console.log('❌ Please enter an improved prompt.');
            return false;
        }

        await this.progressManager.recordPrompt();
        const result = await this.taskHandler.handlePromptComparison(task, improvedPrompt);
        
        console.log('\n' + (result.success ? '✅' : '⚠️'), result.message);
        return result.success;
    }

    /**
     * Level 3: Embeddings Explorer
     */
    async executeLevel3() {
        const task = this.currentLevel.task;
        
        console.log('\n📚 Knowledge Base Topics:');
        task.knowledgeBase.forEach((entry, i) => {
            console.log(`   ${i + 1}. ${entry.topic}`);
        });

        console.log('\n📝 Example queries you could try:');
        task.sampleQueries.forEach(q => console.log(`   • "${q}"`));

        console.log('\n🔍 Enter your search query:');
        const query = await this.prompt('Search: ');

        if (!query) {
            console.log('❌ Please enter a search query.');
            return false;
        }

        await this.progressManager.recordPrompt();
        const result = await this.taskHandler.handleEmbeddingSearch(task, query);
        
        if (result.success && result.bestMatch) {
            console.log(`\n✅ Best match found: "${result.bestMatch.topic}"`);
            return true;
        }
        return false;
    }

    /**
     * Level 4: Workflow Wizard
     */
    async executeLevel4() {
        console.log('\n⚡ You will create a 3-step workflow:');
        console.log('   1. Summarize → 2. Extract Keywords → 3. Generate Questions');
        
        const confirm = await this.prompt('\nReady to run the workflow? (y/n) ');
        if (confirm.toLowerCase() !== 'y') {
            console.log('Take your time! Come back when you\'re ready.');
            return false;
        }

        await this.progressManager.recordPrompt();
        const result = await this.taskHandler.handleWorkflowCreation(this.currentLevel.task);
        return result.success;
    }

    /**
     * Level 5: Build Your Own Tool
     */
    async executeLevel5() {
        const task = this.currentLevel.task;
        
        console.log('\n🔧 Example tools you could create:');
        task.toolExamples.forEach(tool => {
            console.log(`\n   📦 ${tool.name}`);
            console.log(`      ${tool.description}`);
            console.log(`      Parameters: ${tool.parameters.join(', ')}`);
        });

        console.log('\n✍️ Let\'s create a simple calculator tool!');
        console.log('   This tool will add two numbers together.\n');

        const confirm = await this.prompt('Ready to create and test the tool? (y/n) ');
        if (confirm.toLowerCase() !== 'y') {
            return false;
        }

        // Create a simple demo tool
        const toolDefinition = {
            name: 'add_numbers',
            description: 'Adds two numbers together and returns the result',
            parameters: ['a', 'b'],
            func: (a, b) => a + b,
            testArgs: [5, 3]
        };

        await this.progressManager.recordPrompt();
        const result = await this.taskHandler.handleToolCreation(task, toolDefinition);
        return result.success;
    }

    /**
     * Get a hint for the current level
     */
    async getHint() {
        if (!this.currentLevel) {
            console.log('💡 Start a level first to get hints!');
            return;
        }

        await this.progressManager.useHint(this.currentLevel.id);
        const result = await this.mentor.provideHint(this.currentLevel, this.currentHintIndex);
        this.currentHintIndex++;
        
        if (result.hintsRemaining > 0) {
            console.log(`   (${result.hintsRemaining} hints remaining)`);
        }
    }

    /**
     * Ask the mentor a question
     */
    async askMentor(question) {
        if (!question) {
            question = await this.prompt('❓ What would you like to ask? ');
        }

        if (!question) {
            console.log('Please enter a question.');
            return;
        }

        await this.progressManager.askMentor();
        await this.mentor.answerQuestion(question, this.currentLevel);
    }

    /**
     * Explain a concept
     */
    async explainConcept(concept) {
        if (!concept) {
            concept = await this.prompt('📚 What concept would you like explained? ');
        }

        if (!concept) {
            console.log('Please enter a concept to explain.');
            return;
        }

        await this.mentor.explainConcept(concept);
    }

    /**
     * Show player progress
     */
    async showProgress() {
        const stats = this.progressManager.getStats();
        const completed = this.progressManager.getCompletedCount();

        console.log('\n' + '═'.repeat(50));
        console.log('       📊 YOUR PROGRESS');
        console.log('═'.repeat(50));
        console.log(`  Player: ${this.progressManager.progress.player.name}`);
        console.log(`  Points: ${stats.totalPoints}`);
        console.log(`  Levels: ${completed}/5 completed`);
        console.log(`  Badges: ${this.progressManager.progress.badges.length}/5`);
        console.log(`  Hints Used: ${stats.hintsUsed}`);
        console.log(`  Prompts Sent: ${stats.totalPromptsSent}`);
        console.log('═'.repeat(50) + '\n');

        await this.mentor.showProgress(stats, completed);
    }

    /**
     * Show earned badges
     */
    showBadges() {
        const badges = this.progressManager.progress.badges;
        
        console.log('\n' + '═'.repeat(40));
        console.log('       🏆 YOUR BADGES');
        console.log('═'.repeat(40));
        
        if (badges.length === 0) {
            console.log('  No badges yet. Complete levels to earn them!');
        } else {
            badges.forEach(badge => {
                console.log(`  ⭐ ${badge}`);
            });
        }
        console.log('═'.repeat(40) + '\n');
    }

    /**
     * Reset player progress
     */
    async resetProgress() {
        const confirm = await this.prompt('⚠️ This will erase all progress. Are you sure? (type "yes" to confirm) ');
        
        if (confirm.toLowerCase() === 'yes') {
            this.progressManager.progress = this.progressManager.getDefaultProgress();
            await this.progressManager.saveProgress();
            console.log('✅ Progress has been reset. Starting fresh!');
        } else {
            console.log('Reset cancelled. Your progress is safe!');
        }
    }

    /**
     * Save and quit the game
     */
    async quit() {
        // Update play time
        const sessionTime = Math.round((Date.now() - this.sessionStartTime) / 1000);
        this.progressManager.progress.stats.totalPlayTime += sessionTime;
        this.progressManager.progress.player.lastPlayed = new Date().toISOString();
        await this.progressManager.saveProgress();

        await this.mentor.goodbye(this.progressManager.getStats());
        
        console.log('\n💾 Progress saved! See you next time!\n');
        this.rl.close();
    }
}

// Run the game
const game = new FoundryLearningGame();
game.run().catch(console.error);
