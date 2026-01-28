/**
 * Foundry Local Learning Game - Level Manager
 * Handles level loading, progression, and task execution
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LevelManager {
    constructor() {
        this.levels = [];
        this.currentLevel = null;
        this.dataPath = path.join(__dirname, '..', 'data');
    }

    /**
     * Load all levels from the JSON file
     */
    async loadLevels() {
        try {
            const levelsPath = path.join(this.dataPath, 'levels.json');
            const data = await fs.readFile(levelsPath, 'utf-8');
            const levelsData = JSON.parse(data);
            this.levels = levelsData.levels;
            console.log(`✅ Loaded ${this.levels.length} levels`);
            return this.levels;
        } catch (error) {
            console.error('❌ Error loading levels:', error.message);
            throw error;
        }
    }

    /**
     * Get a specific level by ID
     */
    getLevel(levelId) {
        return this.levels.find(level => level.id === levelId);
    }

    /**
     * Get all available (unlocked) levels
     */
    getAvailableLevels(progress) {
        return this.levels.filter((level, index) => {
            if (index === 0) return true; // First level always available
            const prevLevel = this.levels[index - 1];
            return progress.levels[prevLevel.id]?.completed;
        });
    }

    /**
     * Check if a level is unlocked
     */
    isLevelUnlocked(levelId, progress) {
        if (levelId === 1) return true;
        const prevLevelProgress = progress.levels[levelId - 1];
        return prevLevelProgress?.completed === true;
    }

    /**
     * Set the current active level
     */
    setCurrentLevel(levelId) {
        this.currentLevel = this.getLevel(levelId);
        return this.currentLevel;
    }

    /**
     * Display level information
     */
    displayLevelInfo(level) {
        console.log('\n' + '═'.repeat(60));
        console.log(`📚 LEVEL ${level.id}: ${level.title.toUpperCase()}`);
        console.log('═'.repeat(60));
        console.log(`\n📖 ${level.description}\n`);
        console.log('🎯 Objective:', level.objective);
        console.log('\n📋 Instructions:');
        level.instructions.forEach((instruction, i) => {
            console.log(`   ${i + 1}. ${instruction}`);
        });
        console.log('\n🏆 Reward:', level.reward.badge, `(${level.reward.points} points)`);
        console.log('═'.repeat(60) + '\n');
    }

    /**
     * Display a hint for the current level
     */
    displayHint(level, hintIndex) {
        const hints = level.hints;
        if (hintIndex < hints.length) {
            console.log('\n💡 Hint:', hints[hintIndex]);
            return hintIndex + 1;
        } else {
            console.log('\n💡 No more hints available for this level.');
            return hintIndex;
        }
    }

    /**
     * Get task configuration for a level
     */
    getTaskConfig(level) {
        return level.task;
    }

    /**
     * Display level completion message
     */
    displayLevelComplete(level) {
        console.log('\n' + '🎉'.repeat(20));
        console.log('\n✨ LEVEL COMPLETE! ✨\n');
        console.log(`🏆 You earned the "${level.reward.badge}" badge!`);
        console.log(`⭐ +${level.reward.points} points`);
        console.log(`\n📝 ${level.reward.description}`);
        console.log('\n' + '🎉'.repeat(20) + '\n');
    }

    /**
     * Get all level titles for menu display
     */
    getLevelMenu(progress) {
        return this.levels.map(level => {
            const isUnlocked = this.isLevelUnlocked(level.id, progress);
            const isCompleted = progress.levels[level.id]?.completed;
            let status = '🔒';
            if (isCompleted) status = '✅';
            else if (isUnlocked) status = '🔓';
            
            return {
                id: level.id,
                title: level.title,
                status: status,
                unlocked: isUnlocked,
                completed: isCompleted
            };
        });
    }

    /**
     * Display the level selection menu
     */
    displayLevelMenu(progress) {
        const menu = this.getLevelMenu(progress);
        console.log('\n' + '═'.repeat(40));
        console.log('       📚 SELECT A LEVEL');
        console.log('═'.repeat(40));
        menu.forEach(item => {
            const line = `  ${item.status} Level ${item.id}: ${item.title}`;
            console.log(line);
        });
        console.log('═'.repeat(40) + '\n');
        return menu;
    }
}

/**
 * Task Handlers for different level types
 */
class TaskHandler {
    constructor(foundryClient) {
        this.foundryClient = foundryClient;
    }

    /**
     * Handle Level 1: Simple prompt call
     */
    async handlePromptCall(task, userInput) {
        console.log('\n🤖 Sending your prompt to the model...\n');
        
        try {
            const response = await this.foundryClient.chat(task.prompt);
            console.log('📨 Response from the model:\n');
            console.log('─'.repeat(40));
            console.log(response);
            console.log('─'.repeat(40) + '\n');
            return { success: true, response };
        } catch (error) {
            console.error('❌ Error calling model:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle Level 2: Prompt comparison
     */
    async handlePromptComparison(task, improvedPrompt) {
        console.log('\n📊 Comparing prompts...\n');
        
        try {
            // Call with the bad prompt
            console.log('🔴 Bad Prompt:', task.badPrompt);
            const badResponse = await this.foundryClient.chat(task.badPrompt);
            console.log('\n📨 Response to bad prompt:');
            console.log('─'.repeat(40));
            console.log(badResponse.substring(0, 300) + '...');
            console.log('─'.repeat(40));

            // Call with the improved prompt
            console.log('\n🟢 Your Improved Prompt:', improvedPrompt);
            const goodResponse = await this.foundryClient.chat(improvedPrompt);
            console.log('\n📨 Response to improved prompt:');
            console.log('─'.repeat(40));
            console.log(goodResponse.substring(0, 500) + '...');
            console.log('─'.repeat(40));

            // Simple check - improved prompt should be longer and more specific
            const isImproved = improvedPrompt.length > task.badPrompt.length + 10;
            
            return { 
                success: isImproved, 
                badResponse, 
                goodResponse,
                message: isImproved 
                    ? 'Great job! Your improved prompt got a more detailed response!'
                    : 'Try making your prompt more specific and detailed.'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle Level 3: Embedding search
     */
    async handleEmbeddingSearch(task, query) {
        console.log('\n🔍 Searching knowledge base with embeddings...\n');
        console.log(`📝 Your query: "${query}"\n`);
        
        try {
            // Get embedding for the query
            const queryEmbedding = await this.foundryClient.getEmbedding(query);
            
            // Get embeddings for all knowledge base entries
            const results = [];
            for (const entry of task.knowledgeBase) {
                const entryEmbedding = await this.foundryClient.getEmbedding(entry.text);
                const similarity = this.cosineSimilarity(queryEmbedding, entryEmbedding);
                results.push({
                    ...entry,
                    similarity
                });
            }

            // Sort by similarity
            results.sort((a, b) => b.similarity - a.similarity);

            console.log('📊 Search Results (ranked by relevance):\n');
            results.forEach((result, i) => {
                const bar = '█'.repeat(Math.round(result.similarity * 20));
                console.log(`${i + 1}. [${(result.similarity * 100).toFixed(1)}%] ${bar}`);
                console.log(`   ${result.text.substring(0, 80)}...`);
                console.log();
            });

            return { 
                success: true, 
                results,
                bestMatch: results[0]
            };
        } catch (error) {
            // Fallback to simple keyword matching if embeddings aren't available
            console.log('📝 Using keyword-based search (embeddings not available)...\n');
            
            const queryLower = query.toLowerCase();
            const results = task.knowledgeBase.map(entry => {
                const words = queryLower.split(' ');
                const matches = words.filter(word => 
                    entry.text.toLowerCase().includes(word)
                ).length;
                return {
                    ...entry,
                    similarity: matches / words.length
                };
            });

            results.sort((a, b) => b.similarity - a.similarity);

            console.log('📊 Search Results:\n');
            results.forEach((result, i) => {
                console.log(`${i + 1}. [Match: ${(result.similarity * 100).toFixed(0)}%]`);
                console.log(`   ${result.text}`);
                console.log();
            });

            return { success: true, results, bestMatch: results[0] };
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(a, b) {
        if (!a || !b || a.length !== b.length) return 0;
        
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Handle Level 4: Workflow creation
     */
    async handleWorkflowCreation(task) {
        console.log('\n⚡ Running workflow pipeline...\n');
        console.log('📥 Input text:', task.sampleInput.substring(0, 100) + '...\n');

        const results = {};
        let currentInput = task.sampleInput;

        for (const step of task.workflowSteps) {
            console.log(`\n🔄 Step ${step.step}: ${step.name}`);
            console.log(`   ${step.description}`);
            
            try {
                let prompt;
                switch (step.name) {
                    case 'Summarize':
                        prompt = `Please provide a brief 2-3 sentence summary of the following text:\n\n${currentInput}`;
                        break;
                    case 'Extract Keywords':
                        prompt = `Extract 5 main keywords from the following text. List them separated by commas:\n\n${currentInput}`;
                        break;
                    case 'Generate Questions':
                        prompt = `Based on these keywords: ${currentInput}\n\nGenerate 3 study questions that would help someone learn these concepts.`;
                        break;
                    default:
                        prompt = currentInput;
                }

                const response = await this.foundryClient.chat(prompt);
                results[step.name] = response;
                currentInput = response;

                console.log(`   ✅ Output: ${response.substring(0, 150)}...`);
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
                return { success: false, step: step.name, error: error.message };
            }
        }

        console.log('\n' + '═'.repeat(50));
        console.log('📤 WORKFLOW COMPLETE - Final Output:');
        console.log('═'.repeat(50));
        console.log(results['Generate Questions']);
        console.log('═'.repeat(50) + '\n');

        return { success: true, results };
    }

    /**
     * Handle Level 5: Tool creation
     */
    async handleToolCreation(task, toolDefinition) {
        console.log('\n🔧 Creating and testing your custom tool...\n');
        
        // Validate tool definition
        if (!toolDefinition.name || !toolDefinition.description || !toolDefinition.func) {
            return { 
                success: false, 
                error: 'Tool must have name, description, and func properties' 
            };
        }

        console.log(`📦 Tool Name: ${toolDefinition.name}`);
        console.log(`📝 Description: ${toolDefinition.description}`);
        console.log(`📥 Parameters: ${toolDefinition.parameters?.join(', ') || 'none'}`);

        // Test the tool
        try {
            console.log('\n🧪 Testing tool...');
            const testResult = toolDefinition.func(...(toolDefinition.testArgs || []));
            console.log(`✅ Tool returned: ${testResult}`);

            // Register with the agent (simulated)
            console.log('\n📋 Registering tool with Foundry agent...');
            console.log('✅ Tool successfully registered!');

            // Demonstrate AI using the tool
            console.log('\n🤖 Testing AI tool call...');
            const aiPrompt = `You have access to a tool called "${toolDefinition.name}" that ${toolDefinition.description}. 
Please acknowledge that you can now use this tool and explain when you would use it.`;
            
            const response = await this.foundryClient.chat(aiPrompt);
            console.log('\n📨 AI Response:');
            console.log('─'.repeat(40));
            console.log(response);
            console.log('─'.repeat(40));

            return { success: true, testResult, aiResponse: response };
        } catch (error) {
            console.error('❌ Tool test failed:', error.message);
            return { success: false, error: error.message };
        }
    }
}

export { LevelManager, TaskHandler };
