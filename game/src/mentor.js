/**
 * Foundry Local Learning Game - AI Mentor
 * Provides guidance, hints, and encouragement throughout the game
 */

class Mentor {
    constructor(foundryClient) {
        this.foundryClient = foundryClient;
        this.personality = {
            name: 'Sage',
            role: 'Your friendly Foundry Local guide',
            traits: ['encouraging', 'patient', 'knowledgeable', 'fun']
        };
        this.conversationHistory = [];
    }

    /**
     * Build the system prompt for the mentor
     */
    getSystemPrompt() {
        return `You are ${this.personality.name}, ${this.personality.role}. 
You are helping a student learn about Microsoft Foundry Local and AI development.

Your personality traits: ${this.personality.traits.join(', ')}.

Guidelines:
- Be encouraging and celebrate small wins
- Explain concepts in simple, beginner-friendly terms
- Use analogies and real-world examples
- Keep responses concise but helpful
- If asked about code, provide simple examples
- If the student seems stuck, offer gentle hints
- Maintain a fun, adventure-like atmosphere

You are currently guiding the student through a learning game with 5 levels:
1. Meet the Model - Making first API calls
2. Prompt Mastery - Writing better prompts
3. Embeddings Explorer - Semantic search
4. Workflow Wizard - Building pipelines
5. Build Your Own Tool - Creating custom tools

Remember: Your goal is to help them succeed and enjoy learning!`;
    }

    /**
     * Welcome the player to the game
     */
    async welcome(playerName) {
        const prompt = `A new player named "${playerName || 'friend'}" has just started the Foundry Local Learning Game. 
Give them a warm, exciting welcome in 2-3 sentences. Mention that you'll be their guide on this adventure.`;

        try {
            const response = await this.foundryClient.chatWithSystem(
                this.getSystemPrompt(),
                prompt
            );
            this.displayMentorMessage(response);
            return response;
        } catch (error) {
            const fallbackWelcome = `🧙 Welcome, ${playerName || 'adventurer'}! I'm Sage, your guide through the world of Foundry Local. Together, we'll master the art of AI development - one level at a time. Let's begin your journey!`;
            this.displayMentorMessage(fallbackWelcome);
            return fallbackWelcome;
        }
    }

    /**
     * Introduce a new level
     */
    async introduceLevel(level) {
        const prompt = `The player is about to start Level ${level.id}: "${level.title}".
The objective is: ${level.objective}
Give a brief, exciting introduction (2-3 sentences) that motivates them for this challenge.`;

        try {
            const response = await this.foundryClient.chatWithSystem(
                this.getSystemPrompt(),
                prompt
            );
            this.displayMentorMessage(response);
            return response;
        } catch (error) {
            const fallback = `🧙 Alright, it's time for ${level.title}! This is where things get exciting. ${level.description} Let's do this!`;
            this.displayMentorMessage(fallback);
            return fallback;
        }
    }

    /**
     * Provide a hint for the current task
     */
    async provideHint(level, hintIndex) {
        const hints = level.hints;
        if (hintIndex < hints.length) {
            const hint = hints[hintIndex];
            const prompt = `The player needs a hint for Level ${level.id}. 
The hint is: "${hint}"
Deliver this hint in an encouraging way, in 1-2 sentences.`;

            try {
                const response = await this.foundryClient.chatWithSystem(
                    this.getSystemPrompt(),
                    prompt
                );
                this.displayMentorMessage(response, 'hint');
                return { message: response, hintsRemaining: hints.length - hintIndex - 1 };
            } catch (error) {
                this.displayMentorMessage(`💡 Here's a hint: ${hint}`, 'hint');
                return { message: hint, hintsRemaining: hints.length - hintIndex - 1 };
            }
        } else {
            const noMoreHints = "You've used all the hints for this level! But don't worry, I believe in you. Try experimenting a bit more!";
            this.displayMentorMessage(noMoreHints, 'hint');
            return { message: noMoreHints, hintsRemaining: 0 };
        }
    }

    /**
     * Answer a question from the player
     */
    async answerQuestion(question, currentLevel) {
        const context = currentLevel 
            ? `The player is currently on Level ${currentLevel.id}: ${currentLevel.title}. Objective: ${currentLevel.objective}`
            : 'The player is in the main menu.';

        const prompt = `${context}

The player asks: "${question}"

Provide a helpful, beginner-friendly answer. Keep it concise (2-4 sentences) unless they need more detail.`;

        try {
            const response = await this.foundryClient.chatWithSystem(
                this.getSystemPrompt(),
                prompt
            );
            this.displayMentorMessage(response);
            this.conversationHistory.push({ role: 'user', content: question });
            this.conversationHistory.push({ role: 'assistant', content: response });
            return response;
        } catch (error) {
            const fallback = "I'm having trouble connecting right now, but let me think... That's a great question! Try checking the Foundry Local documentation or use the 'hint' command for level-specific help.";
            this.displayMentorMessage(fallback);
            return fallback;
        }
    }

    /**
     * Celebrate level completion
     */
    async celebrateLevelComplete(level, stats) {
        const prompt = `The player just completed Level ${level.id}: "${level.title}"!
They earned the "${level.reward.badge}" badge and ${level.reward.points} points.
${stats ? `Time taken: ${stats.timeSpent} seconds. Hints used: ${stats.hintsUsed}.` : ''}
Give them an enthusiastic celebration message (2-3 sentences). Mention their achievement!`;

        try {
            const response = await this.foundryClient.chatWithSystem(
                this.getSystemPrompt(),
                prompt
            );
            this.displayMentorMessage(response, 'celebration');
            return response;
        } catch (error) {
            const fallback = `🎉 AMAZING! You've conquered ${level.title} and earned the ${level.reward.badge} badge! That's ${level.reward.points} points added to your score. You're becoming a true Foundry master!`;
            this.displayMentorMessage(fallback, 'celebration');
            return fallback;
        }
    }

    /**
     * Encourage player after a failed attempt
     */
    async encourageRetry(level, errorMessage) {
        const prompt = `The player had trouble with Level ${level.id}: "${level.title}".
Error or issue: ${errorMessage || 'The task was not completed correctly.'}
Give them encouragement (1-2 sentences) and suggest they try again or ask for a hint.`;

        try {
            const response = await this.foundryClient.chatWithSystem(
                this.getSystemPrompt(),
                prompt
            );
            this.displayMentorMessage(response, 'encouragement');
            return response;
        } catch (error) {
            const fallback = "Don't worry, even the best developers debug their code! Take another look, or type 'hint' if you'd like some guidance. You've got this!";
            this.displayMentorMessage(fallback, 'encouragement');
            return fallback;
        }
    }

    /**
     * Explain a concept requested by the player
     */
    async explainConcept(concept) {
        const prompt = `The player wants to understand: "${concept}"

Explain this concept in simple, beginner-friendly terms. Use:
- A brief definition (1 sentence)
- A simple analogy or real-world example
- Why it's useful in AI development

Keep the total response under 5 sentences.`;

        try {
            const response = await this.foundryClient.chatWithSystem(
                this.getSystemPrompt(),
                prompt
            );
            this.displayMentorMessage(response, 'explanation');
            return response;
        } catch (error) {
            const fallback = `That's a great concept to learn about! ${concept} is an important part of working with AI. Try searching for it in the Foundry documentation, or ask me specific questions about it.`;
            this.displayMentorMessage(fallback, 'explanation');
            return fallback;
        }
    }

    /**
     * Display progress summary
     */
    async showProgress(stats, completedLevels) {
        const prompt = `The player's current progress:
- Total points: ${stats.totalPoints}
- Levels completed: ${completedLevels} out of 5
- Prompts sent: ${stats.totalPromptsSent}
- Play time: ${Math.round(stats.totalPlayTime / 60)} minutes

Give them a brief progress update (2-3 sentences) with encouragement. If they're doing well, celebrate! If they're just starting, motivate them!`;

        try {
            const response = await this.foundryClient.chatWithSystem(
                this.getSystemPrompt(),
                prompt
            );
            this.displayMentorMessage(response);
            return response;
        } catch (error) {
            const percentage = (completedLevels / 5) * 100;
            const fallback = `📊 You've completed ${completedLevels}/5 levels (${percentage}%) with ${stats.totalPoints} points! ${completedLevels === 0 ? "Let's get started!" : completedLevels === 5 ? "You're a Foundry Champion! 🏆" : "Keep up the great work!"}`;
            this.displayMentorMessage(fallback);
            return fallback;
        }
    }

    /**
     * Say goodbye when the player exits
     */
    async goodbye(stats) {
        const prompt = `The player is leaving the game. They have ${stats.totalPoints} points and completed ${stats.levelsCompleted} levels.
Give them a friendly goodbye (1-2 sentences) and encourage them to come back!`;

        try {
            const response = await this.foundryClient.chatWithSystem(
                this.getSystemPrompt(),
                prompt
            );
            this.displayMentorMessage(response, 'goodbye');
            return response;
        } catch (error) {
            const fallback = "Thanks for playing! Your progress is saved, so come back anytime to continue your Foundry adventure. See you soon, champion! 👋";
            this.displayMentorMessage(fallback, 'goodbye');
            return fallback;
        }
    }

    /**
     * Display mentor message with formatting
     */
    displayMentorMessage(message, type = 'default') {
        const icons = {
            default: '🧙',
            hint: '💡',
            celebration: '🎉',
            encouragement: '💪',
            explanation: '📚',
            goodbye: '👋'
        };

        const icon = icons[type] || icons.default;
        console.log('\n┌─' + '─'.repeat(58) + '─┐');
        console.log(`│ ${icon} Sage says:`.padEnd(60) + ' │');
        console.log('├─' + '─'.repeat(58) + '─┤');
        
        // Word wrap the message
        const words = message.split(' ');
        let line = '│ ';
        words.forEach(word => {
            if ((line + word).length > 58) {
                console.log(line.padEnd(60) + ' │');
                line = '│ ' + word + ' ';
            } else {
                line += word + ' ';
            }
        });
        if (line.length > 2) {
            console.log(line.padEnd(60) + ' │');
        }
        
        console.log('└─' + '─'.repeat(58) + '─┘\n');
    }
}

export { Mentor };
