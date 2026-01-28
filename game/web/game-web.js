/* ═══════════════════════════════════════════════════════════════════
   Foundry Local Learning Adventure - Web Game Engine
   ═══════════════════════════════════════════════════════════════════ */

// Foundry Local Connection State
let foundryConnection = {
    connected: false,
    baseUrl: null,
    model: null,
    availableModels: [],
    commonPorts: [61341, 5272, 5000, 8080]
};

// Game State
let gameState = {
    player: {
        name: '',
        currentLevel: 1,
        totalPoints: 0,
        badges: [],
        achievements: []
    },
    levels: {},
    currentLevelData: null,
    hintsUsed: 0,
    maxHints: 3,
    taskProgress: {}
};

// ═══════════════════════════════════════════════════════════════════
// FOUNDRY LOCAL CONNECTION
// ═══════════════════════════════════════════════════════════════════

async function checkFoundryConnection() {
    console.log('[Foundry] Checking for Foundry Local...');
    
    for (const port of foundryConnection.commonPorts) {
        const url = `http://127.0.0.1:${port}`;
        try {
            const response = await fetch(`${url}/v1/models`, {
                signal: AbortSignal.timeout(2000)
            });
            if (response.ok) {
                const data = await response.json();
                foundryConnection.connected = true;
                foundryConnection.baseUrl = url;
                foundryConnection.availableModels = data.data?.map(m => m.id) || [];
                
                // Select a chat-capable model
                const chatModel = foundryConnection.availableModels.find(m => 
                    m.toLowerCase().includes('instruct') || 
                    m.toLowerCase().includes('chat') ||
                    m.toLowerCase().includes('phi')
                );
                foundryConnection.model = chatModel || foundryConnection.availableModels[0];
                
                console.log(`[Foundry] Connected to ${url}`);
                console.log(`[Foundry] Available models: ${foundryConnection.availableModels.join(', ')}`);
                console.log(`[Foundry] Using model: ${foundryConnection.model}`);
                updateConnectionStatus();
                return true;
            }
        } catch (error) {
            // Try next port
        }
    }
    
    console.log('[Foundry] Not detected - running in demo mode');
    foundryConnection.connected = false;
    updateConnectionStatus();
    return false;
}

function updateConnectionStatus() {
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) {
        if (foundryConnection.connected) {
            statusEl.innerHTML = `<span class="status-connected">🟢 Foundry Local (${foundryConnection.model?.split(':')[0] || 'Connected'})</span>`;
            statusEl.title = `Connected to ${foundryConnection.baseUrl}`;
        } else {
            statusEl.innerHTML = `<span class="status-demo">🟡 Demo Mode</span>`;
            statusEl.title = 'Foundry Local not detected - using simulated responses';
        }
    }
}

async function callFoundryAPI(prompt, systemPrompt = null) {
    if (!foundryConnection.connected) {
        return null; // Fall back to demo responses
    }
    
    try {
        const messages = systemPrompt 
            ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
            : [{ role: 'user', content: prompt }];
        
        const response = await fetch(`${foundryConnection.baseUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: foundryConnection.model,
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.choices?.[0]?.message?.content || null;
        }
    } catch (error) {
        console.error('[Foundry] API call failed:', error);
    }
    return null;
}

// ═══════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
    await checkFoundryConnection();
    loadProgress();
    initMentor();
});

function loadProgress() {
    const saved = localStorage.getItem('foundryGameProgress');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            gameState.player = data.player || gameState.player;
            gameState.levels = data.levels || {};
            updateStats();
        } catch (e) {
            console.log('Starting fresh game');
        }
    }
}

function saveProgress() {
    localStorage.setItem('foundryGameProgress', JSON.stringify({
        player: gameState.player,
        levels: gameState.levels
    }));
}

function updateStats() {
    document.getElementById('totalPoints').textContent = gameState.player.totalPoints;
    document.getElementById('badgeCount').textContent = gameState.player.badges.length;
}

// ═══════════════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════════════

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function startGame() {
    const nameInput = document.getElementById('playerName');
    const name = nameInput.value.trim() || 'Explorer';
    gameState.player.name = name;
    saveProgress();
    showMenu();
}

function showMenu() {
    showScreen('menuScreen');
    
    // Update greeting
    const greeting = document.getElementById('playerGreeting');
    const hour = new Date().getHours();
    let timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    greeting.innerHTML = `
        <h2>${timeGreeting}, ${gameState.player.name}! 👋</h2>
        <p>Ready to continue your Foundry adventure?</p>
    `;
    
    // Build level list
    const levelList = document.getElementById('levelList');
    levelList.innerHTML = '';
    
    GAME_DATA.levels.forEach((level, index) => {
        const isUnlocked = index === 0 || gameState.levels[index]?.completed;
        const isCompleted = gameState.levels[level.id]?.completed;
        const prevCompleted = index === 0 || gameState.levels[GAME_DATA.levels[index - 1].id]?.completed;
        const canPlay = index === 0 || prevCompleted;
        
        const card = document.createElement('div');
        card.className = `level-card ${isCompleted ? 'completed' : ''} ${!canPlay ? 'locked' : ''}`;
        card.innerHTML = `
            <div class="level-number">${isCompleted ? '✓' : level.id}</div>
            <div class="level-info">
                <h4>${level.title}</h4>
                <p>${level.objective}</p>
            </div>
            <div class="level-status">${isCompleted ? '🏆' : canPlay ? '▶️' : '🔒'}</div>
        `;
        
        if (canPlay) {
            card.onclick = () => startLevel(level.id);
        }
        
        levelList.appendChild(card);
    });
    
    updateStats();
}

function returnToMenu() {
    showMenu();
}

// ═══════════════════════════════════════════════════════════════════
// LEVEL MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function startLevel(levelId) {
    const level = GAME_DATA.levels.find(l => l.id === levelId);
    if (!level) return;
    
    gameState.currentLevelData = level;
    gameState.hintsUsed = 0;
    gameState.taskProgress = {};
    
    showScreen('levelScreen');
    
    // Populate level info
    document.getElementById('levelTitle').textContent = `Level ${level.id}: ${level.title}`;
    document.getElementById('levelReward').textContent = `${level.rewardIcon} ${level.reward}`;
    document.getElementById('levelDescription').textContent = level.description;
    document.getElementById('levelObjective').textContent = level.objective;
    document.getElementById('hintsRemaining').textContent = gameState.maxHints - gameState.hintsUsed;
    
    // Build instructions
    const instructionsList = document.getElementById('levelInstructions');
    instructionsList.innerHTML = '';
    level.instructions.forEach(inst => {
        const li = document.createElement('li');
        li.textContent = inst;
        instructionsList.appendChild(li);
    });
    
    // Clear hint display
    document.getElementById('hintDisplay').classList.remove('visible');
    document.getElementById('hintDisplay').innerHTML = '';
    
    // Build task-specific UI
    buildTaskUI(level);
    
    // Mentor greeting
    addMentorMessage(`Welcome to Level ${level.id}! ${level.description.split('.')[0]}. Let me know if you need any help!`, 'sage');
}

function buildTaskUI(level) {
    const taskArea = document.getElementById('taskArea');
    
    switch(level.taskType) {
        case 'simple_prompt':
            buildSimplePromptUI(taskArea, level);
            break;
        case 'prompt_improvement':
            buildPromptImprovementUI(taskArea, level);
            break;
        case 'embedding_search':
            buildEmbeddingSearchUI(taskArea, level);
            break;
        case 'workflow_builder':
            buildWorkflowUI(taskArea, level);
            break;
        case 'tool_builder':
            buildToolBuilderUI(taskArea, level);
            break;
    }
}

// ═══════════════════════════════════════════════════════════════════
// TASK: SIMPLE PROMPT (Level 1)
// ═══════════════════════════════════════════════════════════════════

function buildSimplePromptUI(container, level) {
    gameState.taskProgress.promptCount = 0;
    
    container.innerHTML = `
        <h4>💬 Chat with the AI Model</h4>
        <p class="task-instruction">Type your message below and send it to the AI model.</p>
        <textarea class="task-input" id="promptInput" placeholder="Type your message here... Try 'Hello!' or 'What is Foundry Local?'"></textarea>
        <div class="task-buttons">
            <button class="btn btn-primary" onclick="sendSimplePrompt()">
                <span class="btn-icon">📤</span> Send to Model
            </button>
        </div>
        <div class="task-output" id="promptOutput" style="display:none;">
            <h5>🤖 AI Response:</h5>
            <pre id="promptResponse"></pre>
        </div>
        <div class="progress-indicator" style="margin-top: 1rem;">
            <span>Prompts sent: <strong id="promptCount">0</strong> / ${level.completionCriteria.minPrompts}</span>
        </div>
    `;
}

async function sendSimplePrompt() {
    const input = document.getElementById('promptInput');
    const output = document.getElementById('promptOutput');
    const response = document.getElementById('promptResponse');
    const countDisplay = document.getElementById('promptCount');
    
    const prompt = input.value.trim();
    if (!prompt) {
        addMentorMessage("Please type a message first! Try asking a question or giving a greeting.", 'sage');
        return;
    }
    
    // Show loading
    output.style.display = 'block';
    response.innerHTML = '<span class="loading"></span> Thinking...';
    
    let aiResponse;
    
    // Try Foundry Local first, fall back to demo
    if (foundryConnection.connected) {
        aiResponse = await callFoundryAPI(prompt);
    }
    
    if (!aiResponse) {
        // Simulate delay for demo mode
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        const responses = DEMO_RESPONSES.simple;
        aiResponse = responses[gameState.taskProgress.promptCount % responses.length];
    }
    
    response.textContent = aiResponse;
    gameState.taskProgress.promptCount++;
    countDisplay.textContent = gameState.taskProgress.promptCount;
    
    // Clear input for next prompt
    input.value = '';
    input.placeholder = 'Try another prompt...';
    
    // Check completion
    const level = gameState.currentLevelData;
    if (gameState.taskProgress.promptCount >= level.completionCriteria.minPrompts) {
        addMentorMessage("Excellent! You've completed the required prompts. Great job communicating with the AI!", 'sage');
        setTimeout(() => completeLevel(), 1500);
    } else {
        addMentorMessage(`Great! That's ${gameState.taskProgress.promptCount} prompt(s). Try ${level.completionCriteria.minPrompts - gameState.taskProgress.promptCount} more to complete this level.`, 'sage');
    }
}

// ═══════════════════════════════════════════════════════════════════
// TASK: PROMPT IMPROVEMENT (Level 2)
// ═══════════════════════════════════════════════════════════════════

function buildPromptImprovementUI(container, level) {
    gameState.taskProgress.improved = false;
    
    container.innerHTML = `
        <h4>✨ Prompt Engineering Challenge</h4>
        
        <div class="comparison-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div class="bad-prompt-box" style="background: var(--bg-card); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--danger);">
                <h5 style="color: var(--danger);">❌ Bad Prompt</h5>
                <p style="font-family: monospace; margin-top: 0.5rem;">"${level.badPrompt}"</p>
                <button class="btn btn-secondary" style="margin-top: 0.5rem;" onclick="testBadPrompt()">Test This</button>
            </div>
            <div class="good-prompt-box" style="background: var(--bg-card); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--secondary);">
                <h5 style="color: var(--secondary);">✅ Your Improved Version</h5>
                <textarea class="task-input" id="improvedPrompt" placeholder="Rewrite the bad prompt to be specific, clear, and detailed..." style="min-height: 80px; margin-top: 0.5rem;"></textarea>
                <button class="btn btn-success" style="margin-top: 0.5rem;" onclick="testImprovedPrompt()">Test Improved</button>
            </div>
        </div>
        
        <div class="results-comparison" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="task-output" id="badPromptOutput" style="display:none;">
                <h5>❌ Bad Prompt Response:</h5>
                <pre id="badResponse"></pre>
            </div>
            <div class="task-output" id="goodPromptOutput" style="display:none; border-left-color: var(--secondary);">
                <h5>✅ Improved Response:</h5>
                <pre id="goodResponse"></pre>
            </div>
        </div>
        
        <div class="tips-box" style="margin-top: 1rem; padding: 1rem; background: rgba(99, 102, 241, 0.1); border-radius: 8px;">
            <h5>💡 Tips for Better Prompts:</h5>
            <ul style="margin-top: 0.5rem; padding-left: 1.5rem; color: var(--text-secondary);">
                <li>Be specific: What exactly do you want?</li>
                <li>Add context: Who is the audience?</li>
                <li>Set format: How should the answer be structured?</li>
                <li>Include constraints: Length, tone, complexity level</li>
            </ul>
        </div>
    `;
}

async function testBadPrompt() {
    const output = document.getElementById('badPromptOutput');
    const response = document.getElementById('badResponse');
    const level = GAME_DATA.levels.find(l => l.id === gameState.currentLevel);
    
    output.style.display = 'block';
    response.innerHTML = '<span class="loading"></span> Generating...';
    
    // Try Foundry Local for real AI response
    if (foundryConnection.connected) {
        try {
            const aiResponse = await callFoundryAPI(level.badPrompt);
            response.textContent = aiResponse;
            return;
        } catch (error) {
            console.log('Bad prompt Foundry error, using demo:', error.message);
        }
    }
    
    await new Promise(resolve => setTimeout(resolve, 800));
    response.textContent = DEMO_RESPONSES.improved.bad;
}

async function testImprovedPrompt() {
    const input = document.getElementById('improvedPrompt');
    const output = document.getElementById('goodPromptOutput');
    const response = document.getElementById('goodResponse');
    
    const improved = input.value.trim();
    if (!improved) {
        addMentorMessage("Write your improved prompt first! Make it more specific and detailed.", 'sage');
        return;
    }
    
    if (improved.length < 50) {
        addMentorMessage("Your prompt is a bit short. Try adding more details - who is the audience? what format? how detailed?", 'sage');
        return;
    }
    
    output.style.display = 'block';
    response.innerHTML = '<span class="loading"></span> Generating...';
    
    // Try Foundry Local for real AI response
    if (foundryConnection.connected) {
        try {
            const aiResponse = await callFoundryAPI(improved);
            response.textContent = aiResponse;
            gameState.taskProgress.improved = true;
            addMentorMessage("Wow! See the difference? Your specific prompt got a much better, more useful response. That's prompt engineering!", 'sage');
            setTimeout(() => completeLevel(), 2000);
            return;
        } catch (error) {
            console.log('Improved prompt Foundry error, using demo:', error.message);
        }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    response.textContent = DEMO_RESPONSES.improved.good;
    
    gameState.taskProgress.improved = true;
    addMentorMessage("Wow! See the difference? Your specific prompt got a much better, more useful response. That's prompt engineering!", 'sage');
    
    setTimeout(() => completeLevel(), 2000);
}

// ═══════════════════════════════════════════════════════════════════
// TASK: EMBEDDING SEARCH (Level 3)
// ═══════════════════════════════════════════════════════════════════

function buildEmbeddingSearchUI(container, level) {
    gameState.taskProgress.searchCount = 0;
    
    let kbHtml = level.knowledgeBase.map(item => `
        <div class="kb-item" data-id="${item.id}">
            <strong>${item.topic.toUpperCase()}</strong>: ${item.text}
            <div class="similarity-bar"><div class="similarity-fill" style="width: 0%"></div></div>
        </div>
    `).join('');
    
    container.innerHTML = `
        <h4>🔍 Semantic Search with Embeddings</h4>
        <p class="task-instruction">Search the knowledge base below using natural language. Embeddings will find semantically similar content!</p>
        
        <div class="search-box" style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
            <input type="text" class="task-input" id="searchQuery" placeholder="Try: 'How do users sign in?' or 'fix errors' or 'make it faster'" style="min-height: auto; flex: 1;">
            <button class="btn btn-primary" onclick="performSearch()">
                <span class="btn-icon">🔍</span> Search
            </button>
        </div>
        
        <div class="knowledge-base" id="knowledgeBase">
            ${kbHtml}
        </div>
        
        <div class="progress-indicator" style="margin-top: 1rem;">
            <span>Searches completed: <strong id="searchCount">0</strong> / ${level.completionCriteria.minSearches}</span>
        </div>
    `;
}

async function performSearch() {
    const query = document.getElementById('searchQuery').value.trim();
    const countDisplay = document.getElementById('searchCount');
    
    if (!query) {
        addMentorMessage("Enter a search query! Try asking about authentication, databases, or performance.", 'sage');
        return;
    }
    
    const level = gameState.currentLevelData;
    const results = simulateEmbeddingSearch(query, level.knowledgeBase);
    
    // Update UI with results
    results.forEach(result => {
        const el = document.querySelector(`.kb-item[data-id="${result.id}"]`);
        if (el) {
            el.classList.toggle('highlight', result.similarity > 0.7);
            el.querySelector('.similarity-fill').style.width = `${result.similarity * 100}%`;
        }
    });
    
    gameState.taskProgress.searchCount++;
    countDisplay.textContent = gameState.taskProgress.searchCount;
    
    // Find best match
    const best = results[0];
    if (best.similarity > 0.7) {
        addMentorMessage(`Great search! Found relevant content about "${best.topic}" with ${Math.round(best.similarity * 100)}% similarity. Embeddings understand meaning, not just keywords!`, 'sage');
    } else {
        addMentorMessage(`Searched! The closest match was about "${best.topic}". Try different wording to find more relevant results.`, 'sage');
    }
    
    // Check completion
    if (gameState.taskProgress.searchCount >= level.completionCriteria.minSearches) {
        addMentorMessage("Excellent! You've mastered semantic search. Embeddings are powerful for building intelligent search systems!", 'sage');
        setTimeout(() => completeLevel(), 1500);
    }
    
    // Clear for next search
    document.getElementById('searchQuery').value = '';
}

// ═══════════════════════════════════════════════════════════════════
// TASK: WORKFLOW BUILDER (Level 4)
// ═══════════════════════════════════════════════════════════════════

function buildWorkflowUI(container, level) {
    gameState.taskProgress.currentStep = 0;
    gameState.taskProgress.outputs = [];
    
    let stepsHtml = level.workflowSteps.map((step, i) => `
        <div class="workflow-step ${i === 0 ? 'active' : ''}" data-step="${step.id}">
            <div class="step-number">${step.id}</div>
            <div class="step-content">
                <h5>${step.name}</h5>
                <p>${step.description}</p>
                <div class="step-output" id="stepOutput${step.id}" style="display: none;"></div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = `
        <h4>⚡ Build a Multi-Step AI Workflow</h4>
        <p class="task-instruction">Enter a topic, then watch as the AI processes it through multiple steps, each building on the last!</p>
        
        <div class="workflow-input" style="margin-bottom: 1rem;">
            <label>Start with a topic to learn about:</label>
            <input type="text" class="task-input" id="workflowTopic" placeholder="e.g., 'Machine Learning', 'Web Development', 'Cloud Computing'" style="min-height: auto; margin-top: 0.5rem;">
            <button class="btn btn-primary" onclick="runWorkflow()" style="margin-top: 0.5rem;">
                <span class="btn-icon">▶️</span> Run Workflow
            </button>
        </div>
        
        <div class="workflow-steps" id="workflowSteps">
            ${stepsHtml}
        </div>
    `;
}

async function runWorkflow() {
    const topicInput = document.getElementById('workflowTopic');
    const topic = topicInput.value.trim();
    
    if (!topic) {
        addMentorMessage("Enter a topic first! What would you like to learn about?", 'sage');
        return;
    }
    
    const level = gameState.currentLevelData;
    let currentInput = topic;
    
    // Disable input during workflow
    topicInput.disabled = true;
    
    // Process each step
    for (let i = 0; i < level.workflowSteps.length; i++) {
        const step = level.workflowSteps[i];
        const stepEl = document.querySelector(`.workflow-step[data-step="${step.id}"]`);
        const outputEl = document.getElementById(`stepOutput${step.id}`);
        
        // Activate step
        document.querySelectorAll('.workflow-step').forEach(el => el.classList.remove('active'));
        stepEl.classList.add('active');
        
        outputEl.style.display = 'block';
        outputEl.innerHTML = '<span class="loading"></span> Processing...';
        
        let response;
        
        // Try Foundry Local for real AI response
        if (foundryConnection.connected) {
            try {
                // Build step-specific prompt
                const stepPrompt = `Step: ${step.name}
Task: ${step.description}
Input: ${currentInput}

Please complete this step of the workflow. Be concise and produce output that can be used in the next step.`;
                
                response = await callFoundryAPI(stepPrompt);
            } catch (error) {
                console.log(`Workflow step ${i + 1} Foundry error, using demo:`, error.message);
                await new Promise(resolve => setTimeout(resolve, 1500));
                response = DEMO_RESPONSES.workflow[i];
            }
        } else {
            await new Promise(resolve => setTimeout(resolve, 1500));
            response = DEMO_RESPONSES.workflow[i];
        }
        
        outputEl.textContent = response;
        
        // Mark complete
        stepEl.classList.remove('active');
        stepEl.classList.add('complete');
        
        // Output becomes next input
        currentInput = response;
        gameState.taskProgress.outputs.push(response);
    }
    
    gameState.taskProgress.completed = true;
    addMentorMessage("Amazing! You've built your first AI workflow! Each step built upon the previous one - that's how real AI pipelines work!", 'sage');
    
    setTimeout(() => completeLevel(), 2000);
}

// ═══════════════════════════════════════════════════════════════════
// TASK: TOOL BUILDER (Level 5)
// ═══════════════════════════════════════════════════════════════════

function buildToolBuilderUI(container, level) {
    gameState.taskProgress.toolCreated = false;
    gameState.taskProgress.toolTested = false;
    
    let templatesHtml = level.toolTemplates.map(t => `
        <option value="${t.id}">${t.name} - ${t.description}</option>
    `).join('');
    
    container.innerHTML = `
        <h4>🛠️ Create Your Own AI Tool</h4>
        <p class="task-instruction">Design a custom AI tool! Choose a template or create your own from scratch.</p>
        
        <div class="tool-builder" style="display: grid; gap: 1rem;">
            <div class="form-group">
                <label>Choose a Template:</label>
                <select class="task-input" id="toolTemplate" style="min-height: auto;" onchange="selectTemplate()">
                    <option value="">-- Select a template --</option>
                    ${templatesHtml}
                </select>
            </div>
            
            <div class="form-group">
                <label>Tool Name:</label>
                <input type="text" class="task-input" id="toolName" placeholder="My Awesome Tool" style="min-height: auto;">
            </div>
            
            <div class="form-group">
                <label>Tool Description:</label>
                <input type="text" class="task-input" id="toolDescription" placeholder="What does your tool do?" style="min-height: auto;">
            </div>
            
            <div class="form-group">
                <label>System Prompt (Instructions for the AI):</label>
                <textarea class="task-input" id="toolSystemPrompt" placeholder="You are a helpful assistant that..." style="min-height: 100px;"></textarea>
            </div>
            
            <button class="btn btn-primary" onclick="createTool()">
                <span class="btn-icon">🔧</span> Create Tool
            </button>
        </div>
        
        <div class="tool-test" id="toolTest" style="display: none; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--bg-card-hover);">
            <h4>🧪 Test Your Tool</h4>
            <div id="toolPreview" style="background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;"></div>
            <textarea class="task-input" id="toolTestInput" placeholder="Enter test input for your tool..."></textarea>
            <button class="btn btn-success" onclick="testTool()" style="margin-top: 0.5rem;">
                <span class="btn-icon">▶️</span> Test Tool
            </button>
            <div class="task-output" id="toolTestOutput" style="display: none; margin-top: 1rem;">
                <h5>🤖 Tool Output:</h5>
                <pre id="toolResponse"></pre>
            </div>
        </div>
    `;
}

function selectTemplate() {
    const templateId = document.getElementById('toolTemplate').value;
    const level = gameState.currentLevelData;
    const template = level.toolTemplates.find(t => t.id === templateId);
    
    if (template && template.id !== 'custom') {
        document.getElementById('toolName').value = template.name;
        document.getElementById('toolDescription').value = template.description;
        document.getElementById('toolSystemPrompt').value = template.systemPrompt;
    } else {
        document.getElementById('toolName').value = '';
        document.getElementById('toolDescription').value = '';
        document.getElementById('toolSystemPrompt').value = '';
    }
}

function createTool() {
    const name = document.getElementById('toolName').value.trim();
    const description = document.getElementById('toolDescription').value.trim();
    const systemPrompt = document.getElementById('toolSystemPrompt').value.trim();
    
    if (!name || !description || !systemPrompt) {
        addMentorMessage("Please fill in all fields! Your tool needs a name, description, and system prompt.", 'sage');
        return;
    }
    
    gameState.taskProgress.toolCreated = true;
    gameState.taskProgress.tool = { name, description, systemPrompt };
    
    // Show test section
    const testSection = document.getElementById('toolTest');
    const preview = document.getElementById('toolPreview');
    
    testSection.style.display = 'block';
    preview.innerHTML = `
        <h5>🛠️ ${name}</h5>
        <p style="color: var(--text-secondary); margin: 0.5rem 0;">${description}</p>
        <code style="display: block; margin-top: 0.5rem; font-size: 0.85rem;">System: "${systemPrompt.substring(0, 100)}..."</code>
    `;
    
    addMentorMessage(`Great! You've created "${name}"! Now test it to see how it works.`, 'sage');
}

async function testTool() {
    const input = document.getElementById('toolTestInput').value.trim();
    const output = document.getElementById('toolTestOutput');
    const response = document.getElementById('toolResponse');
    
    if (!input) {
        addMentorMessage("Enter some test input for your tool!", 'sage');
        return;
    }
    
    output.style.display = 'block';
    response.innerHTML = '<span class="loading"></span> Running your tool...';
    
    const tool = gameState.taskProgress.tool;
    let demoResponse;
    
    // Try Foundry Local for real AI response
    if (foundryConnection.connected) {
        try {
            const toolResponse = await fetch(`${foundryConnection.baseUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: foundryConnection.model,
                    messages: [
                        { role: 'system', content: tool.systemPrompt },
                        { role: 'user', content: input }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });
            
            if (toolResponse.ok) {
                const data = await toolResponse.json();
                demoResponse = `Using your "${tool.name}" tool:\n\n${data.choices[0].message.content}`;
            } else {
                throw new Error('Non-OK response');
            }
        } catch (error) {
            console.log('Tool test Foundry error, using demo:', error.message);
            demoResponse = generateDemoToolResponse(tool, input);
        }
    } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        demoResponse = generateDemoToolResponse(tool, input);
    }
    
    response.textContent = demoResponse;
    gameState.taskProgress.toolTested = true;
    
    addMentorMessage("Congratulations! You've built and tested your very own AI tool. You've completed all 5 levels and earned the Foundry Champion badge! 🏆", 'sage');
    
    setTimeout(() => completeLevel(), 2000);
}

function generateDemoToolResponse(tool, input) {
    let demoResponse = `Using your "${tool.name}" tool on the input:\n\n`;
    
    if (tool.systemPrompt.toLowerCase().includes('summar')) {
        demoResponse += "📝 **Summary:**\nThe text discusses key concepts related to the topic at hand. Main points include the importance of proper implementation, best practices for efficiency, and considerations for future development.";
    } else if (tool.systemPrompt.toLowerCase().includes('code') || tool.systemPrompt.toLowerCase().includes('debug')) {
        demoResponse += "💻 **Code Analysis:**\nThe code structure looks reasonable. Consider:\n- Adding error handling\n- Using more descriptive variable names\n- Adding comments for complex logic";
    } else {
        demoResponse += `Based on my instructions as "${tool.name}", I've analyzed your input and provided a helpful response! This demonstrates how custom AI tools can be specialized for specific tasks.`;
    }
    
    return demoResponse;
}

// ═══════════════════════════════════════════════════════════════════
// LEVEL COMPLETION
// ═══════════════════════════════════════════════════════════════════

function completeLevel() {
    const level = gameState.currentLevelData;
    
    // Update game state
    if (!gameState.levels[level.id]) {
        gameState.levels[level.id] = {};
    }
    gameState.levels[level.id].completed = true;
    gameState.levels[level.id].completedAt = new Date().toISOString();
    
    // Award points
    gameState.player.totalPoints += level.points;
    
    // Award badge
    const badge = GAME_DATA.rewards.badges.find(b => b.levelId === level.id);
    if (badge && !gameState.player.badges.includes(badge.id)) {
        gameState.player.badges.push(badge.id);
    }
    
    saveProgress();
    updateStats();
    
    // Show completion modal
    const modal = document.getElementById('completeModal');
    const content = document.getElementById('completeContent');
    
    content.innerHTML = `
        <div class="celebration-content">
            <div class="celebration-badge">${level.rewardIcon}</div>
            <h3>You earned: ${level.reward}!</h3>
            <p class="celebration-message">${level.title} complete!</p>
            <p class="celebration-points">+${level.points} points</p>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Check if all levels complete
    if (gameState.player.badges.length >= 5) {
        addMentorMessage("🎉 CONGRATULATIONS! You've completed all levels and become a true Foundry Champion! You now have the skills to build amazing AI applications!", 'sage');
    }
}

function closeCompleteModal() {
    document.getElementById('completeModal').classList.remove('active');
    showMenu();
}

// ═══════════════════════════════════════════════════════════════════
// HINTS
// ═══════════════════════════════════════════════════════════════════

function showHint() {
    if (gameState.hintsUsed >= gameState.maxHints) {
        addMentorMessage("You've used all your hints for this level! Try your best or ask me for general guidance.", 'sage');
        return;
    }
    
    const level = gameState.currentLevelData;
    const hint = level.hints[gameState.hintsUsed];
    
    if (hint) {
        gameState.hintsUsed++;
        document.getElementById('hintsRemaining').textContent = gameState.maxHints - gameState.hintsUsed;
        
        const hintDisplay = document.getElementById('hintDisplay');
        hintDisplay.innerHTML = `<strong>💡 Hint ${gameState.hintsUsed}:</strong> ${hint}`;
        hintDisplay.classList.add('visible');
        
        addMentorMessage(`Here's a hint: ${hint}`, 'sage');
    }
}

// ═══════════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════════

function showProgress() {
    const modal = document.getElementById('progressModal');
    const content = document.getElementById('progressContent');
    
    const completed = Object.values(gameState.levels).filter(l => l.completed).length;
    
    content.innerHTML = `
        <div class="progress-stat"><span>Player Name</span><span>${gameState.player.name}</span></div>
        <div class="progress-stat"><span>Total Points</span><span>${gameState.player.totalPoints}</span></div>
        <div class="progress-stat"><span>Levels Completed</span><span>${completed} / 5</span></div>
        <div class="progress-stat"><span>Badges Earned</span><span>${gameState.player.badges.length} / 5</span></div>
        <div class="progress-stat"><span>Completion</span><span>${Math.round((completed / 5) * 100)}%</span></div>
    `;
    
    modal.classList.add('active');
}

function showBadges() {
    const modal = document.getElementById('badgesModal');
    const content = document.getElementById('badgesContent');
    
    let badgesHtml = GAME_DATA.rewards.badges.map(badge => {
        const earned = gameState.player.badges.includes(badge.id);
        return `
            <div class="badge-item ${!earned ? 'locked' : ''}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-info">
                    <h5>${badge.name}</h5>
                    <p>${badge.description}</p>
                </div>
                <div class="badge-status">${earned ? '✓' : '🔒'}</div>
            </div>
        `;
    }).join('');
    
    content.innerHTML = `<div class="badge-list">${badgesHtml}</div>`;
    modal.classList.add('active');
}

function showHelp() {
    document.getElementById('helpModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modals on background click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// ═══════════════════════════════════════════════════════════════════
// MENTOR
// ═══════════════════════════════════════════════════════════════════

function initMentor() {
    const greeting = GAME_DATA.mentor.greetings[Math.floor(Math.random() * GAME_DATA.mentor.greetings.length)];
    addMentorMessage(greeting, 'sage');
}

function toggleMentor() {
    document.getElementById('mentorContainer').classList.toggle('collapsed');
}

function addMentorMessage(text, type) {
    const messages = document.getElementById('mentorMessages');
    const msg = document.createElement('div');
    msg.className = `mentor-message ${type}`;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

function handleMentorKeypress(event) {
    if (event.key === 'Enter') {
        askMentor();
    }
}

async function askMentor() {
    const input = document.getElementById('mentorQuestion');
    const question = input.value.trim();
    
    if (!question) return;
    
    addMentorMessage(input.value, 'user');
    input.value = '';
    
    // Try Foundry Local for intelligent response
    if (foundryConnection.connected) {
        try {
            addMentorMessage("Let me think about that...", 'sage');
            
            const systemPrompt = `You are a helpful AI mentor named Sage, guiding a learner through the Foundry Local Learning Adventure game. 
The game teaches AI/ML concepts through 5 levels:
- Level 1: First Contact (basic prompts)
- Level 2: The Art of Asking (prompt engineering)
- Level 3: Understanding Context (embeddings)
- Level 4: Building Workflows (AI pipelines)
- Level 5: The Final Challenge (combining skills)

Be encouraging, concise, and helpful. If asked about game topics, explain AI concepts simply.`;
            
            const response = await fetch(`${foundryConnection.baseUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: foundryConnection.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: question }
                    ],
                    max_tokens: 300,
                    temperature: 0.7
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                const aiResponse = data.choices[0].message.content;
                // Remove the "thinking" message and add real response
                const messages = document.getElementById('mentorMessages');
                messages.removeChild(messages.lastChild);
                addMentorMessage(aiResponse, 'sage');
                return;
            }
        } catch (error) {
            console.log('Mentor Foundry error, using fallback:', error.message);
            // Remove "thinking" message if it was added
            const messages = document.getElementById('mentorMessages');
            if (messages.lastChild?.textContent === "Let me think about that...") {
                messages.removeChild(messages.lastChild);
            }
        }
    }
    
    // Fallback to static responses
    const questionLower = question.toLowerCase();
    let response = GAME_DATA.mentor.responses.default;
    
    for (const [key, value] of Object.entries(GAME_DATA.mentor.responses)) {
        if (questionLower.includes(key)) {
            response = value;
            break;
        }
    }
    
    // Check for level-specific help
    const levelMatch = questionLower.match(/level\s*(\d)/);
    if (levelMatch) {
        const levelNum = parseInt(levelMatch[1]);
        if (GAME_DATA.mentor.levelHelp[levelNum]) {
            response = GAME_DATA.mentor.levelHelp[levelNum];
        }
    }
    
    setTimeout(() => addMentorMessage(response, 'sage'), 500);
}

// ═══════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('keydown', (e) => {
    // ESC to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
    }
});
