/* ═══════════════════════════════════════════════════════════════════
   Foundry Local Learning Adventure - Web Game Engine
   ═══════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════════
// SECURITY: HTML Sanitization Helper
// ═══════════════════════════════════════════════════════════════════

/**
 * Sanitize a string for safe insertion into HTML.
 * Prevents XSS by escaping HTML special characters.
 */
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Foundry Local Connection State - supports dynamic port discovery
let foundryConnection = {
    connected: false,
    baseUrl: null,
    model: null,
    availableModels: [],
    commonPorts: [61341, 5272, 51319, 5000, 8080]
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
    
    // First, try to read the port discovered by the start script
    const discoveredPort = await readDiscoveredPort();
    if (discoveredPort) {
        const url = `http://127.0.0.1:${discoveredPort}`;
        console.log(`[Foundry] Trying CLI-discovered port ${discoveredPort}...`);
        try {
            const response = await fetch(`${url}/v1/models`, {
                signal: AbortSignal.timeout(2000)
            });
            if (response.ok) {
                const data = await response.json();
                foundryConnection.connected = true;
                foundryConnection.baseUrl = url;
                foundryConnection.availableModels = data.data?.map(m => m.id) || [];
                
                const chatModel = foundryConnection.availableModels.find(m => 
                    m.toLowerCase().includes('instruct') || 
                    m.toLowerCase().includes('chat') ||
                    m.toLowerCase().includes('phi')
                );
                foundryConnection.model = chatModel || foundryConnection.availableModels[0];
                
                console.log(`[Foundry] Connected to ${url} (discovered via CLI)`);
                console.log(`[Foundry] Using model: ${foundryConnection.model}`);
                updateConnectionStatus();
                return true;
            }
        } catch (error) {
            // Discovered port didn't work, continue scanning
        }
    }

    // Fall back to scanning common ports
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

/**
 * Retry connecting to Foundry Local with polling.
 * Useful when the service is still starting up.
 */
async function waitForFoundry(maxWaitMs = 15000, intervalMs = 3000) {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
        if (await checkFoundryConnection()) return true;
        console.log(`[Foundry] Not ready yet — retrying (${Math.ceil((maxWaitMs - (Date.now() - start)) / 1000)}s remaining)...`);
        await new Promise(r => setTimeout(r, intervalMs));
    }
    return foundryConnection.connected;
}

/**
 * Periodic health check — re-discovers Foundry Local if the connection drops
 * (e.g. the user restarted the service and the port changed).
 */
let _healthCheckInterval = null;
function startHealthCheck(intervalMs = 30000) {
    if (_healthCheckInterval) return; // already running
    _healthCheckInterval = setInterval(async () => {
        if (!foundryConnection.connected) return; // nothing to check in demo mode
        try {
            const resp = await fetch(`${foundryConnection.baseUrl}/v1/models`, {
                signal: AbortSignal.timeout(2000)
            });
            if (resp.ok) return; // still healthy
        } catch { /* connection lost */ }
        console.log('[Foundry] Connection lost — re-discovering...');
        foundryConnection.connected = false;
        const recovered = await checkFoundryConnection();
        if (!recovered) {
            console.log('[Foundry] Could not reconnect — running in demo mode');
        }
    }, intervalMs);
}

/**
 * Try to read the Foundry Local port discovered by the start script.
 * The start-web scripts run 'foundry service status' and write the port
 * to foundry-port.json so the browser can find it.
 */
async function readDiscoveredPort() {
    try {
        const response = await fetch('foundry-port.json', {
            signal: AbortSignal.timeout(1000),
            cache: 'no-store'
        });
        if (response.ok) {
            const data = await response.json();
            if (data.port && Number.isInteger(data.port) && data.port > 0 && data.port <= 65535) {
                console.log(`[Foundry] Found discovered port config: ${data.port}`);
                return data.port;
            }
        }
    } catch (error) {
        // Config file not available - that's fine, we'll scan ports
    }
    return null;
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
    // Initialize game UI immediately so the page is interactive right away
    loadProgress();
    initMentor();

    // On remote hosts (e.g. GitHub Pages) Foundry Local is never available,
    // so skip the retry polling and health checks to avoid blocking the page.
    const isRemote = location.protocol === 'https:' && !location.hostname.match(/^(localhost|127\.)/);

    if (isRemote) {
        console.log('[Foundry] Running on a remote host — skipping local connection check');
        foundryConnection.connected = false;
        updateConnectionStatus();
        return;
    }

    // Try immediate connection; if Foundry is still starting, retry with polling
    const connected = await checkFoundryConnection();
    if (!connected) {
        console.log('[Foundry] Initial check failed — waiting for Foundry to start...');
        await waitForFoundry();
    }
    // Start periodic health check so we reconnect if the port changes mid-session
    startHealthCheck();
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
    try {
        localStorage.setItem('foundryGameProgress', JSON.stringify({
            player: gameState.player,
            levels: gameState.levels
        }));
    } catch (e) {
        console.warn('[Game] Failed to save progress to localStorage:', e.message);
    }
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
        <h2>${sanitizeHTML(timeGreeting)}, ${sanitizeHTML(gameState.player.name)}! 👋</h2>
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
        card.setAttribute('role', 'listitem');
        
        if (canPlay) {
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Level ${level.id}: ${level.title}. ${isCompleted ? 'Completed' : 'Available'}. ${level.objective}`);
        } else {
            card.setAttribute('aria-label', `Level ${level.id}: ${level.title}. Locked. Complete previous level to unlock.`);
            card.setAttribute('aria-disabled', 'true');
        }
        
        card.innerHTML = `
            <div class="level-number" aria-hidden="true">${isCompleted ? '✓' : level.id}</div>
            <div class="level-info">
                <h4>${level.title}</h4>
                <p>${level.objective}</p>
            </div>
            <div class="level-status" aria-hidden="true">${isCompleted ? '🏆' : canPlay ? '▶️' : '🔒'}</div>
        `;
        
        if (canPlay) {
            card.onclick = () => startLevel(level.id);
            card.onkeypress = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    startLevel(level.id);
                }
            };
        }
        
        levelList.appendChild(card);
    });
    
    updateStats();
    
    // Focus first available level
    setTimeout(() => {
        const firstAvailable = levelList.querySelector('.level-card:not(.locked)');
        if (firstAvailable) firstAvailable.focus();
    }, 100);
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
    
    // Add breadcrumb navigation
    const levelHeader = document.querySelector('.level-header');
    const existingBreadcrumb = document.querySelector('.breadcrumb');
    if (existingBreadcrumb) existingBreadcrumb.remove();
    
    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'breadcrumb';
    breadcrumb.innerHTML = `
        <button type="button" class="breadcrumb-item breadcrumb-link" id="breadcrumbHomeButton">Home</button>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">Level ${level.id}: ${level.title}</span>
    `;
    levelHeader.parentElement.insertBefore(breadcrumb, levelHeader);
    
    const breadcrumbHomeButton = breadcrumb.querySelector('#breadcrumbHomeButton');
    if (breadcrumbHomeButton) {
        breadcrumbHomeButton.addEventListener('click', () => {
            if (typeof returnToMenu === 'function') {
                returnToMenu();
            }
        });
    }
    
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
    
    // Add level navigation footer
    addLevelNavigation(level);
    
    // Mentor greeting
    addMentorMessage(`Welcome to Level ${level.id}! ${level.description.split('.')[0]}. Let me know if you need any help!`, 'sage');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <textarea class="task-input" id="promptInput" placeholder="Type your message here... Try 'Hello!' or 'What is Foundry Local?'" aria-label="Enter your prompt"></textarea>
        <div class="task-buttons">
            <button class="btn btn-primary" onclick="sendSimplePrompt(event)" aria-label="Send prompt to AI model">
                <span class="btn-icon" aria-hidden="true">📤</span> Send to Model
            </button>
        </div>
        <div class="task-output" id="promptOutput" style="display:none;" role="region" aria-live="polite">
            <h5>🤖 AI Response:</h5>
            <pre id="promptResponse"></pre>
        </div>
        <div class="progress-indicator" style="margin-top: 1rem;" role="status" aria-live="polite">
            <span>Prompts sent: <strong id="promptCount">0</strong> / ${level.completionCriteria.minPrompts}</span>
        </div>
    `;
}

async function sendSimplePrompt(event) {
    const input = document.getElementById('promptInput');
    const output = document.getElementById('promptOutput');
    const response = document.getElementById('promptResponse');
    const countDisplay = document.getElementById('promptCount');
    const sendBtn = event?.target || document.querySelector('.task-buttons .btn-primary');
    
    const prompt = input.value.trim();
    if (!prompt) {
        addMentorMessage("Please type a message first! Try asking a question or giving a greeting.", 'sage');
        input.focus();
        return;
    }
    
    // Disable button during processing
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<span class="loading"></span> Sending...';
    }
    
    // Show loading
    output.style.display = 'block';
    response.innerHTML = '<span class="loading"></span> Thinking...';
    response.setAttribute('aria-busy', 'true');
    
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
    response.removeAttribute('aria-busy');
    gameState.taskProgress.promptCount++;
    countDisplay.textContent = gameState.taskProgress.promptCount;
    
    // Re-enable button
    if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<span class="btn-icon" aria-hidden="true">📤</span> Send to Model';
    }
    
    // Clear input for next prompt
    input.value = '';
    input.placeholder = 'Try another prompt...';
    input.focus();
    
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
                <button class="btn btn-secondary" style="margin-top: 0.5rem;" onclick="testBadPrompt()" aria-label="Test the bad prompt example">Test This</button>
            </div>
            <div class="good-prompt-box" style="background: var(--bg-card); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--secondary);">
                <h5 style="color: var(--secondary);">✅ Your Improved Version</h5>
                <textarea class="task-input" id="improvedPrompt" placeholder="Rewrite the bad prompt to be specific, clear, and detailed..." style="min-height: 80px; margin-top: 0.5rem;" aria-label="Enter your improved prompt"></textarea>
                <button class="btn btn-success" style="margin-top: 0.5rem;" onclick="testImprovedPrompt()" aria-label="Test your improved prompt">Test Improved</button>
            </div>
        </div>
        
        <div class="results-comparison" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="task-output" id="badPromptOutput" style="display:none;" role="region" aria-live="polite">
                <h5>❌ Bad Prompt Response:</h5>
                <pre id="badResponse"></pre>
            </div>
            <div class="task-output" id="goodPromptOutput" style="display:none; border-left-color: var(--secondary);" role="region" aria-live="polite">
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
    const level = gameState.currentLevelData;
    
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
        <h5>🛠️ ${sanitizeHTML(name)}</h5>
        <p style="color: var(--text-secondary); margin: 0.5rem 0;">${sanitizeHTML(description)}</p>
        <code style="display: block; margin-top: 0.5rem; font-size: 0.85rem;">System: "${sanitizeHTML(systemPrompt.substring(0, 100))}..."</code>
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

function addLevelNavigation(level) {
    const existingNav = document.querySelector('.level-navigation');
    if (existingNav) existingNav.remove();
    
    const levelBody = document.querySelector('.level-body');
    const nav = document.createElement('div');
    nav.className = 'level-navigation';
    
    const prevLevel = level.id > 1 ? GAME_DATA.levels[level.id - 2] : null;
    const nextLevel = level.id < 5 ? GAME_DATA.levels[level.id] : null;
    const nextUnlocked = !nextLevel || gameState.levels[level.id]?.completed;
    
    nav.innerHTML = `
        <div class="level-nav-info">
            <span>Level ${level.id} of 5</span>
        </div>
        <div class="level-nav-actions">
            ${prevLevel ? `<button class="btn btn-secondary" onclick="startLevel(${prevLevel.id})" aria-label="Go to previous level">← Previous</button>` : ''}
            <button class="btn btn-secondary" onclick="returnToMenu()" aria-label="Return to menu">Menu</button>
            ${nextLevel ? `<button class="btn btn-primary" onclick="startLevel(${nextLevel.id})" ${!nextUnlocked ? 'disabled' : ''} aria-label="Go to next level">Next →</button>` : ''}
        </div>
    `;
    
    levelBody.appendChild(nav);
}

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
    
    // Show centered completion modal
    showCompletionModal(level, badge);
    
    // Update navigation
    addLevelNavigation(level);
    
    // Check if all levels complete
    if (gameState.player.badges.length >= 5) {
        addMentorMessage("🎉 CONGRATULATIONS! You've completed all levels and become a true Foundry Champion!", 'sage');
    }
}

function showCompletionModal(level, badge) {
    const modal = document.createElement('div');
    modal.className = 'completion-modal active';
    modal.id = 'completionModalNew';
    
    const nextLevel = level.id < 5 ? GAME_DATA.levels[level.id] : null;
    const allComplete = gameState.player.badges.length >= 5;
    const safeBadge = badge || { icon: '🏆', name: 'Achievement Unlocked' };
    
    modal.innerHTML = `
        <div class="completion-content" role="dialog" aria-labelledby="completionTitle" aria-modal="true">
            <div class="completion-icon">${level.rewardIcon}</div>
            <h2 class="completion-title" id="completionTitle">Level Complete!</h2>
            <p class="completion-message">Congratulations! You've successfully completed ${sanitizeHTML(level.title)}.</p>
            
            <div class="completion-badge">
                <span>${safeBadge.icon}</span>
                <span>${safeBadge.name}</span>
            </div>
            
            <div class="completion-points">+${level.points} Points</div>
            
            <div class="completion-divider"></div>
            
            <div class="completion-stats">
                <div class="completion-stat">
                    <span class="completion-stat-value">${gameState.player.totalPoints}</span>
                    <span class="completion-stat-label">Total Points</span>
                </div>
                <div class="completion-stat">
                    <span class="completion-stat-value">${gameState.player.badges.length}/5</span>
                    <span class="completion-stat-label">Badges</span>
                </div>
                <div class="completion-stat">
                    <span class="completion-stat-value">${Math.round((gameState.player.badges.length / 5) * 100)}%</span>
                    <span class="completion-stat-label">Complete</span>
                </div>
            </div>
            
            <div class="completion-actions">
                ${nextLevel && !allComplete ? `
                    <button class="btn btn-primary" onclick="closeCompletionModal(); startLevel(${nextLevel.id});" aria-label="Continue to next level">
                        Next Level →
                    </button>
                ` : ''}
                ${allComplete ? `
                    <button class="btn btn-primary" onclick="closeCompletionModal(); returnToMenu();" aria-label="Return to menu">
                        View All Badges
                    </button>
                ` : ''}
                <button class="btn btn-secondary" onclick="closeCompletionModal(); returnToMenu();" aria-label="Return to menu">
                    Back to Menu
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus trap
    setTimeout(() => {
        const firstButton = modal.querySelector('.btn');
        if (firstButton) firstButton.focus();
    }, 100);
}

function closeCompletionModal() {
    const modal = document.getElementById('completionModalNew');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
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
        <div class="progress-stat"><span>Player Name</span><span>${sanitizeHTML(gameState.player.name)}</span></div>
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
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    
    // Return focus to trigger element
    const triggerMap = {
        'progressModal': 'showProgress',
        'badgesModal': 'showBadges',
        'helpModal': 'showHelp'
    };
    
    // Focus management for accessibility
    setTimeout(() => {
        const lastFocused = document.activeElement;
        if (lastFocused && lastFocused.tagName === 'BODY') {
            const firstFocusable = document.querySelector('.btn:not([disabled])');
            if (firstFocusable) firstFocusable.focus();
        }
    }, 100);
}

// Close modals on background click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Trap focus in modal and handle ESC for all modal types
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close any active modal (completion, mentor, or standard)
        document.querySelectorAll('.completion-modal.active, .mentor-modal.active').forEach(m => m.classList.remove('active'));
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal.id);
        }
        return;
    }
    
    const activeModal = document.querySelector('.modal.active');
    if (!activeModal) return;
    
    if (e.key === 'Tab') {
        const focusableElements = activeModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    }
});

// ═══════════════════════════════════════════════════════════════════
// MENTOR
// ═══════════════════════════════════════════════════════════════════

function initMentor() {
    const greeting = GAME_DATA.mentor.greetings[Math.floor(Math.random() * GAME_DATA.mentor.greetings.length)];
    addMentorModalMessage(greeting, 'sage');
}

function openMentorModal() {
    const modal = document.getElementById('mentorModal');
    modal.classList.add('active');
    hideMessagePopup();
    clearNotificationBadge();
    setTimeout(() => {
        const input = document.getElementById('mentorModalInput');
        if (input) input.focus();
    }, 100);
}

function closeMentorModal() {
    const modal = document.getElementById('mentorModal');
    modal.classList.remove('active');
}

function addMentorModalMessage(text, type) {
    const messages = document.getElementById('mentorModalMessages');
    const msg = document.createElement('div');
    msg.className = `mentor-modal-message ${type}`;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    
    if (type === 'sage') {
        const modal = document.getElementById('mentorModal');
        if (!modal.classList.contains('active')) {
            showMessagePopup(text);
            showNotificationBadge();
        }
    }
}

function showMessagePopup(message) {
    const popup = document.getElementById('mentorMessagePopup');
    const messageText = document.getElementById('popupMessageText');
    
    messageText.textContent = message.length > 80 ? message.substring(0, 80) + '...' : message;
    popup.style.display = 'block';
    
    popup.onclick = () => {
        openMentorModal();
    };
    
    setTimeout(() => {
        hideMessagePopup();
    }, 8000);
}

function hideMessagePopup() {
    const popup = document.getElementById('mentorMessagePopup');
    popup.style.display = 'none';
}

function showNotificationBadge() {
    const badge = document.getElementById('mentorNotificationBadge');
    if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + 1;
        badge.style.display = 'flex';
    }
}

function clearNotificationBadge() {
    const badge = document.getElementById('mentorNotificationBadge');
    if (badge) {
        badge.textContent = '1';
        badge.style.display = 'none';
    }
}

function addMentorMessage(text, type) {
    addMentorModalMessage(text, type);
}

function handleMentorModalKeypress(event) {
    if (event.key === 'Enter') {
        askMentorModal();
    }
}

async function askMentorModal() {
    const input = document.getElementById('mentorModalInput');
    const question = input.value.trim();
    
    if (!question) return;
    
    addMentorModalMessage(input.value, 'user');
    input.value = '';
    
    // Try Foundry Local for intelligent response
    if (foundryConnection.connected) {
        try {
            addMentorModalMessage("Let me think about that...", 'sage');
            
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
                const messages = document.getElementById('mentorModalMessages');
                messages.removeChild(messages.lastChild);
                addMentorModalMessage(aiResponse, 'sage');
                return;
            }
        } catch (error) {
            console.log('Mentor Foundry error, using fallback:', error.message);
            const messages = document.getElementById('mentorModalMessages');
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
    
    const levelMatch = questionLower.match(/level\s*(\d)/);
    if (levelMatch) {
        const levelNum = parseInt(levelMatch[1]);
        if (GAME_DATA.mentor.levelHelp[levelNum]) {
            response = GAME_DATA.mentor.levelHelp[levelNum];
        }
    }
    
    setTimeout(() => addMentorModalMessage(response, 'sage'), 500);
}

// Close modal on background click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('mentorModal');
    if (e.target === modal) {
        closeMentorModal();
    }
});

// ═══════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS (handled in focus trap listener above)
// ═══════════════════════════════════════════════════════════════════
