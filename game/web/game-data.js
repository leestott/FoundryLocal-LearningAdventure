/* ═══════════════════════════════════════════════════════════════════
   Foundry Local Learning Adventure - Game Data
   All levels, rewards, and configuration for the web version
   ═══════════════════════════════════════════════════════════════════ */

const GAME_DATA = {
    levels: [
        {
            id: 1,
            title: "Meet the Model",
            description: "Welcome to your first adventure! In this level, you'll learn how to communicate with an AI model using Microsoft Foundry Local. Think of it like learning to talk to a very smart assistant that runs right on your computer!",
            objective: "Send your first message to an AI model and see how it responds.",
            reward: "Prompt Apprentice",
            rewardIcon: "🎯",
            points: 100,
            unlocked: true,
            instructions: [
                "Type a simple question or greeting in the text box below",
                "Click 'Send to Model' to communicate with the AI",
                "Read and understand the AI's response",
                "Try at least 2 different prompts to complete this level"
            ],
            hints: [
                "Try starting with a simple greeting like 'Hello! Can you help me learn about AI?'",
                "Ask a basic question like 'What is Foundry Local?'",
                "You can ask the AI to explain something simple, like 'Explain what a prompt is'"
            ],
            taskType: "simple_prompt",
            completionCriteria: {
                minPrompts: 2,
                minResponseLength: 50
            }
        },
        {
            id: 2,
            title: "Prompt Mastery",
            description: "Now that you can talk to the AI, let's learn how to talk to it BETTER! Great prompts get great responses. In this level, you'll learn prompt engineering - the art of crafting effective instructions for AI models.",
            objective: "Transform a bad prompt into a great one and compare the results.",
            reward: "Prompt Engineer",
            rewardIcon: "✨",
            points: 150,
            unlocked: false,
            instructions: [
                "Look at the 'bad prompt' example provided",
                "Identify what makes it unclear or vague",
                "Rewrite it to be specific, clear, and detailed",
                "Compare the responses from both prompts"
            ],
            hints: [
                "Good prompts are specific about what you want",
                "Include context: who is the audience? what format do you want?",
                "Add constraints like 'in 3 sentences' or 'for a beginner'"
            ],
            taskType: "prompt_improvement",
            badPrompt: "Tell me about computers",
            completionCriteria: {
                improvedPromptMinLength: 50,
                mustIncludeSpecificity: true
            }
        },
        {
            id: 3,
            title: "Embeddings Explorer",
            description: "Embeddings are like giving the AI a super-powered understanding of meaning! Instead of just matching words, embeddings help AI understand that 'happy' and 'joyful' mean similar things. Let's explore semantic search!",
            objective: "Use embeddings to find the most relevant answer from a knowledge base.",
            reward: "Embedding Explorer",
            rewardIcon: "🔍",
            points: 200,
            unlocked: false,
            instructions: [
                "Review the knowledge base items below",
                "Type a search query in the search box",
                "Watch as the AI finds semantically similar content",
                "Find answers to at least 3 different questions"
            ],
            hints: [
                "Try searching for concepts, not exact words",
                "Ask 'What handles user login?' - it will find authentication info",
                "Embeddings understand meaning, so 'fix bugs' matches 'debugging'"
            ],
            taskType: "embedding_search",
            knowledgeBase: [
                { id: 1, text: "Authentication: Users can log in with email and password. OAuth support is available for Google and Microsoft accounts.", topic: "auth" },
                { id: 2, text: "Database: We use PostgreSQL for data storage. All queries are optimized with proper indexing.", topic: "database" },
                { id: 3, text: "API Endpoints: RESTful API with JSON responses. Rate limiting is set to 100 requests per minute.", topic: "api" },
                { id: 4, text: "Error Handling: All errors are logged to console and reported to monitoring. Use try-catch blocks.", topic: "errors" },
                { id: 5, text: "Deployment: Use Docker containers for deployment. CI/CD pipeline runs tests before deploying.", topic: "deployment" },
                { id: 6, text: "Performance: Response times should be under 200ms. Use caching for frequently accessed data.", topic: "performance" }
            ],
            completionCriteria: {
                minSearches: 3,
                mustFindRelevant: true
            }
        },
        {
            id: 4,
            title: "Workflow Wizard",
            description: "Real AI applications often need multiple steps working together - like a recipe with many ingredients! In this level, you'll build a workflow that chains multiple AI operations together.",
            objective: "Build and run a multi-step AI pipeline that processes data through several stages.",
            reward: "Workflow Wizard",
            rewardIcon: "⚡",
            points: 250,
            unlocked: false,
            instructions: [
                "Review the workflow steps below",
                "Configure each step with your input",
                "Run the complete pipeline",
                "Observe how data flows from one step to the next"
            ],
            hints: [
                "Each step's output becomes the next step's input",
                "Start with a topic you want to learn about",
                "Watch how the AI builds upon previous responses"
            ],
            taskType: "workflow_builder",
            workflowSteps: [
                { id: 1, name: "Generate Topic", description: "AI generates 3 subtopics about your subject", prompt: "List 3 important subtopics about: {input}" },
                { id: 2, name: "Expand First", description: "Expand on the first subtopic", prompt: "Explain this topic in 2 sentences: {input}" },
                { id: 3, name: "Summarize", description: "Create a final summary", prompt: "Summarize this into one key takeaway: {input}" }
            ],
            completionCriteria: {
                allStepsComplete: true
            }
        },
        {
            id: 5,
            title: "Build Your Own Tool",
            description: "The ultimate AI skill - creating your own tools! In this final level, you'll design a custom AI tool that solves a specific problem. This is how real AI developers extend Foundry's capabilities!",
            objective: "Design and test a custom AI tool with a specific purpose.",
            reward: "Foundry Champion",
            rewardIcon: "🏆",
            points: 300,
            unlocked: false,
            instructions: [
                "Choose a tool type from the options",
                "Define your tool's name and description",
                "Create the system prompt that powers your tool",
                "Test your tool with sample inputs"
            ],
            hints: [
                "Think about a task you do often that AI could help with",
                "Be specific in your system prompt about the tool's behavior",
                "Test edge cases - what happens with unusual inputs?"
            ],
            taskType: "tool_builder",
            toolTemplates: [
                { id: "summarizer", name: "Text Summarizer", description: "Condenses long text into key points", systemPrompt: "You are a summarization expert. Take any text and provide a clear, concise summary highlighting the main points." },
                { id: "translator", name: "Code Translator", description: "Converts code between languages", systemPrompt: "You are a code translator. Convert code from one programming language to another while maintaining functionality and best practices." },
                { id: "reviewer", name: "Code Reviewer", description: "Reviews code for issues and improvements", systemPrompt: "You are a code reviewer. Analyze code for bugs, security issues, and suggest improvements. Be constructive and educational." },
                { id: "custom", name: "Custom Tool", description: "Create your own unique tool!", systemPrompt: "" }
            ],
            completionCriteria: {
                toolCreated: true,
                toolTested: true
            }
        }
    ],
    
    rewards: {
        badges: [
            { id: "prompt_apprentice", name: "Prompt Apprentice", icon: "🎯", description: "Made your first AI call", levelId: 1 },
            { id: "prompt_engineer", name: "Prompt Engineer", icon: "✨", description: "Mastered prompt crafting", levelId: 2 },
            { id: "embedding_explorer", name: "Embedding Explorer", icon: "🔍", description: "Discovered semantic search", levelId: 3 },
            { id: "workflow_wizard", name: "Workflow Wizard", icon: "⚡", description: "Built AI pipelines", levelId: 4 },
            { id: "foundry_champion", name: "Foundry Champion", icon: "🏆", description: "Mastered Foundry Local", levelId: 5 }
        ],
        achievements: [
            { id: "first_prompt", name: "First Words", icon: "💬", description: "Sent your first prompt", points: 10 },
            { id: "hint_free", name: "No Help Needed", icon: "🧠", description: "Complete a level without hints", points: 25 },
            { id: "speed_demon", name: "Speed Demon", icon: "⚡", description: "Complete a level in under 2 minutes", points: 25 },
            { id: "perfectionist", name: "Perfectionist", icon: "💯", description: "Get optimal results on first try", points: 50 },
            { id: "completionist", name: "Completionist", icon: "🌟", description: "Finish all 5 levels", points: 100 }
        ]
    },
    
    mentor: {
        name: "Sage",
        icon: "🧙",
        greetings: [
            "Hello, young developer! I'm Sage, your AI mentor. Ready to learn about Foundry?",
            "Welcome back! What would you like to explore today?",
            "Greetings! I'm here to help you master AI development. Ask me anything!"
        ],
        encouragements: [
            "Excellent work! You're making great progress!",
            "That's the spirit! Keep experimenting!",
            "You're getting better at this! Soon you'll be an AI expert!",
            "Great job! Every expert was once a beginner."
        ],
        levelHelp: {
            1: "For Level 1, just try having a conversation with the AI. Ask it questions, give it tasks, and see how it responds!",
            2: "In Level 2, remember: specific prompts get specific answers. Try adding context, format requirements, or constraints.",
            3: "Embeddings are powerful! Try searching for concepts rather than exact words. 'How to deploy' will match 'deployment' content.",
            4: "Workflows chain operations together. Each step builds on the last. Start simple and watch the magic happen!",
            5: "Creating tools is about defining clear purposes. What task would YOU want an AI assistant to do?"
        },
        responses: {
            "what is foundry": "Microsoft Foundry Local lets you run AI models directly on your computer! No internet needed, full privacy, and complete control. It's perfect for learning and building AI applications.",
            "what is a prompt": "A prompt is your message to an AI model - the instruction or question you give it. Good prompts are clear, specific, and include context. Think of it as giving directions to a very smart assistant.",
            "what are embeddings": "Embeddings convert text into numbers that capture meaning. Similar concepts get similar numbers, so 'happy' and 'joyful' would be close together. This enables semantic search - finding by meaning, not just keywords!",
            "what is a workflow": "A workflow chains multiple AI operations together. Like a recipe, each step processes data and passes it to the next. This lets you build complex applications from simple building blocks!",
            "help": "I can help with any level! Just ask about specific concepts, or say 'explain level X' and I'll guide you through it.",
            "default": "That's a great question! While I'm a simulated mentor in this demo, in a real Foundry Local setup, I'd be powered by an actual AI model. For now, try asking about prompts, embeddings, workflows, or specific level help!"
        }
    }
};

// Sample AI responses for demo mode (when Foundry Local isn't running)
const DEMO_RESPONSES = {
    simple: [
        "Hello! I'm an AI assistant running locally on your machine through Foundry Local. I can help you learn, answer questions, and assist with various tasks. What would you like to explore today?",
        "Great question! Foundry Local is Microsoft's solution for running AI models directly on your computer. This means faster responses, complete privacy, and the ability to work offline. It's perfect for development and learning!",
        "I understand! Here's what I can help with: answering questions, explaining concepts, generating ideas, reviewing code, and much more. The key is in how you phrase your prompts - more specific questions get better answers!"
    ],
    improved: {
        bad: "Computers are electronic devices that process data. They have CPUs, memory, and storage. Computers are used everywhere.",
        good: "Great prompt! Here's a beginner-friendly explanation of computers:\n\n**What is a computer?**\nA computer is like a very fast calculator that can also remember things and follow instructions.\n\n**Main Parts:**\n1. **CPU (Brain)** - Does all the thinking and calculations\n2. **RAM (Short-term memory)** - Remembers what you're working on right now\n3. **Storage (Long-term memory)** - Keeps your files safe even when turned off\n\n**Fun Fact:** Your smartphone is actually a powerful computer that fits in your pocket!\n\nWould you like to learn more about any specific part?"
    },
    workflow: [
        "Based on your topic, here are 3 important subtopics:\n1. Fundamental concepts and terminology\n2. Practical applications and use cases\n3. Best practices and common patterns",
        "This subtopic involves understanding the core building blocks. It's essential to grasp these basics before moving to advanced topics. Key elements include proper setup, configuration, and initial implementation steps.",
        "**Key Takeaway:** Master the fundamentals first, then apply them through hands-on practice. Building real projects is the fastest way to learn!"
    ]
};

// Simulate embedding search
function simulateEmbeddingSearch(query, knowledgeBase) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    // Keyword to topic mapping for simulation
    const topicMapping = {
        'login': 'auth', 'password': 'auth', 'user': 'auth', 'authentication': 'auth', 'oauth': 'auth',
        'database': 'database', 'sql': 'database', 'query': 'database', 'data': 'database', 'storage': 'database',
        'api': 'api', 'endpoint': 'api', 'rest': 'api', 'request': 'api', 'json': 'api',
        'error': 'errors', 'bug': 'errors', 'debug': 'errors', 'fix': 'errors', 'catch': 'errors', 'logging': 'errors',
        'deploy': 'deployment', 'docker': 'deployment', 'container': 'deployment', 'ci': 'deployment', 'cd': 'deployment',
        'performance': 'performance', 'speed': 'performance', 'fast': 'performance', 'cache': 'performance', 'optimize': 'performance'
    };
    
    // Find matching topic
    let matchedTopic = null;
    for (const [keyword, topic] of Object.entries(topicMapping)) {
        if (queryLower.includes(keyword)) {
            matchedTopic = topic;
            break;
        }
    }
    
    // Calculate similarity scores
    knowledgeBase.forEach(item => {
        let similarity = 0;
        
        // Exact topic match
        if (matchedTopic && item.topic === matchedTopic) {
            similarity = 0.85 + Math.random() * 0.1;
        } 
        // Partial word matches
        else {
            const words = queryLower.split(' ');
            words.forEach(word => {
                if (item.text.toLowerCase().includes(word)) {
                    similarity += 0.2;
                }
            });
            similarity = Math.min(similarity, 0.6);
        }
        
        results.push({
            ...item,
            similarity: similarity
        });
    });
    
    // Sort by similarity
    results.sort((a, b) => b.similarity - a.similarity);
    return results;
}
