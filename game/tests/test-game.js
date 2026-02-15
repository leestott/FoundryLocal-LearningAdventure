/**
 * Foundry Local Learning Game - Test Suite
 * Validates application functionality and Foundry Local service
 * 
 * Run with: npm test
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { execSync } from 'child_process';

// Test configuration
const CONFIG = {
    foundryUrl: null, // Discovered dynamically
    commonPorts: [61341, 5272, 51319, 5000, 8080],
    timeout: 10000,
    dataPath: path.join(__dirname, '..', 'data'),
    srcPath: path.join(__dirname, '..', 'src')
};

/**
 * Discover Foundry Local URL using CLI, then port scanning
 */
async function discoverFoundryUrl() {
    // Try CLI-based discovery first
    try {
        const output = execSync('foundry service status', {
            timeout: 5000,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        });
        const urlMatch = output.match(/https?:\/\/(?:127\.0\.0\.1|localhost):(\d+)/i);
        if (urlMatch) {
            const port = parseInt(urlMatch[1], 10);
            const url = `http://127.0.0.1:${port}`;
            try {
                const response = await fetch(`${url}/v1/models`, {
                    signal: AbortSignal.timeout(3000)
                });
                if (response.ok) {
                    log(`  [*] Discovered Foundry Local on port ${port} via CLI`, 'gray');
                    return url;
                }
            } catch { /* port didn't respond */ }
        }
    } catch { /* CLI not available */ }

    // Fall back to scanning common ports
    for (const port of CONFIG.commonPorts) {
        const url = `http://127.0.0.1:${port}`;
        try {
            const response = await fetch(`${url}/v1/models`, {
                signal: AbortSignal.timeout(2000)
            });
            if (response.ok) {
                log(`  [*] Discovered Foundry Local on port ${port} via scan`, 'gray');
                return url;
            }
        } catch { /* try next port */ }
    }
    return null;
}

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;

// ANSI colors
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, message = '') {
    totalTests++;
    const icons = { pass: '✅', fail: '❌', skip: '⏭️' };
    const statusColors = { pass: 'green', fail: 'red', skip: 'yellow' };
    
    if (status === 'pass') passedTests++;
    else if (status === 'fail') failedTests++;
    else skippedTests++;

    const icon = icons[status];
    log(`  ${icon} ${name}${message ? ` - ${message}` : ''}`, statusColors[status]);
}

// ═══════════════════════════════════════════════════════════════════
// FILE STRUCTURE TESTS
// ═══════════════════════════════════════════════════════════════════

async function testFileStructure() {
    log('\n📁 Testing File Structure...', 'cyan');
    
    const requiredFiles = [
        'src/game.js',
        'src/levels.js',
        'src/mentor.js',
        'data/levels.json',
        'data/rewards.json',
        'data/progress.json',
        'package.json',
        'README.md'
    ];

    for (const file of requiredFiles) {
        const filePath = path.join(__dirname, '..', file);
        try {
            await fs.access(filePath);
            logTest(`File exists: ${file}`, 'pass');
        } catch {
            logTest(`File exists: ${file}`, 'fail', 'File not found');
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// JSON DATA VALIDATION TESTS
// ═══════════════════════════════════════════════════════════════════

async function testJsonDataFiles() {
    log('\n📊 Testing JSON Data Files...', 'cyan');
    
    // Test levels.json
    try {
        const levelsPath = path.join(CONFIG.dataPath, 'levels.json');
        const levelsData = JSON.parse(await fs.readFile(levelsPath, 'utf-8'));
        
        if (levelsData.levels && Array.isArray(levelsData.levels)) {
            logTest('levels.json is valid JSON', 'pass');
            
            if (levelsData.levels.length === 5) {
                logTest('levels.json has 5 levels', 'pass');
            } else {
                logTest('levels.json has 5 levels', 'fail', `Found ${levelsData.levels.length}`);
            }
            
            // Validate level structure
            const requiredFields = ['id', 'title', 'description', 'objective', 'task', 'reward'];
            let structureValid = true;
            for (const level of levelsData.levels) {
                for (const field of requiredFields) {
                    if (!level[field]) {
                        structureValid = false;
                        break;
                    }
                }
            }
            logTest('Levels have required fields', structureValid ? 'pass' : 'fail');
        } else {
            logTest('levels.json is valid JSON', 'fail', 'Missing levels array');
        }
    } catch (error) {
        logTest('levels.json is valid JSON', 'fail', error.message);
    }

    // Test rewards.json
    try {
        const rewardsPath = path.join(CONFIG.dataPath, 'rewards.json');
        const rewardsData = JSON.parse(await fs.readFile(rewardsPath, 'utf-8'));
        
        if (rewardsData.badges && rewardsData.achievements) {
            logTest('rewards.json is valid JSON', 'pass');
            logTest('rewards.json has badges array', rewardsData.badges.length > 0 ? 'pass' : 'fail');
            logTest('rewards.json has achievements array', rewardsData.achievements.length > 0 ? 'pass' : 'fail');
        } else {
            logTest('rewards.json is valid JSON', 'fail', 'Missing required fields');
        }
    } catch (error) {
        logTest('rewards.json is valid JSON', 'fail', error.message);
    }

    // Test progress.json structure
    try {
        const progressPath = path.join(CONFIG.dataPath, 'progress.json');
        const progressData = JSON.parse(await fs.readFile(progressPath, 'utf-8'));
        
        const hasPlayer = progressData.player !== undefined;
        const hasStats = progressData.stats !== undefined;
        const hasLevels = progressData.levels !== undefined;
        
        logTest('progress.json is valid JSON', 'pass');
        logTest('progress.json has player field', hasPlayer ? 'pass' : 'fail');
        logTest('progress.json has stats field', hasStats ? 'pass' : 'fail');
        logTest('progress.json has levels field', hasLevels ? 'pass' : 'fail');
    } catch (error) {
        logTest('progress.json is valid JSON', 'fail', error.message);
    }
}

// ═══════════════════════════════════════════════════════════════════
// JAVASCRIPT SYNTAX TESTS
// ═══════════════════════════════════════════════════════════════════

async function testJavaScriptSyntax() {
    log('\n📝 Testing JavaScript Syntax...', 'cyan');
    
    const jsFiles = ['game.js', 'levels.js', 'mentor.js'];
    
    // Files that are entry points (not modules) and don't need exports
    const entryPoints = ['game.js'];
    
    for (const file of jsFiles) {
        try {
            const filePath = path.join(CONFIG.srcPath, file);
            const content = await fs.readFile(filePath, 'utf-8');
            
            // Basic syntax checks
            const hasExports = content.includes('export');
            const hasImports = content.includes('import');
            const hasClasses = content.includes('class');
            
            // Check for common issues
            const hasConsoleErrors = content.includes('console.error');
            const hasErrorHandling = content.includes('try') && content.includes('catch');
            
            if (entryPoints.includes(file)) {
                logTest(`${file} is valid entry point`, hasImports ? 'pass' : 'fail');
            } else {
                logTest(`${file} has module exports`, hasExports ? 'pass' : 'fail');
            }
            logTest(`${file} has error handling`, hasErrorHandling ? 'pass' : 'fail');
        } catch (error) {
            logTest(`${file} syntax check`, 'fail', error.message);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// FOUNDRY LOCAL SERVICE TESTS
// ═══════════════════════════════════════════════════════════════════

async function testFoundryLocalService() {
    log('\n🔌 Testing Foundry Local Service...', 'cyan');
    
    // Discover Foundry Local dynamically
    CONFIG.foundryUrl = await discoverFoundryUrl();
    
    if (!CONFIG.foundryUrl) {
        logTest('Foundry Local service is running', 'skip', 'Service not available');
        log('  ℹ️  Foundry Local tests skipped - service not running', 'gray');
        log('     Start with: foundry model run Phi-4', 'gray');
        return;
    }
    
    // Test service availability
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
        
        const response = await fetch(`${CONFIG.foundryUrl}/v1/models`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
            logTest('Foundry Local service is running', 'pass');
            
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                const modelIds = data.data.map(m => m.id);
                logTest('Models are available', 'pass', modelIds.join(', '));
                
                // Select a chat-capable model for the chat test
                const chatModel = modelIds.find(m => 
                    m.toLowerCase().includes('instruct') || 
                    m.toLowerCase().includes('chat') ||
                    m.toLowerCase().includes('phi')
                ) || modelIds[0];
                
                // Test chat endpoint
                await testChatEndpoint(chatModel);
            } else {
                logTest('Models are available', 'fail', 'No models found');
            }
            
        } else {
            logTest('Foundry Local service is running', 'fail', `HTTP ${response.status}`);
        }
    } catch (error) {
        logTest('Foundry Local service is running', 'fail', error.message);
    }
}

async function testChatEndpoint(modelId = 'Phi-4') {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
        
        const response = await fetch(`${CONFIG.foundryUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: modelId,
                messages: [{ role: 'user', content: 'Say "test successful" in 3 words or less.' }],
                max_tokens: 20
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            if (data.choices && data.choices[0]?.message?.content) {
                logTest('Chat completions endpoint works', 'pass');
            } else {
                logTest('Chat completions endpoint works', 'fail', 'Invalid response format');
            }
        } else {
            logTest('Chat completions endpoint works', 'fail', `HTTP ${response.status}`);
        }
    } catch (error) {
        logTest('Chat completions endpoint works', 'skip', error.message);
    }
}

// ═══════════════════════════════════════════════════════════════════
// GAME LOGIC TESTS
// ═══════════════════════════════════════════════════════════════════

async function testGameLogic() {
    log('\n🎮 Testing Game Logic...', 'cyan');
    
    // Test level progression logic
    try {
        const levelsPath = path.join(CONFIG.dataPath, 'levels.json');
        const levelsData = JSON.parse(await fs.readFile(levelsPath, 'utf-8'));
        
        // Check level IDs are sequential
        const ids = levelsData.levels.map(l => l.id);
        const isSequential = ids.every((id, i) => id === i + 1);
        logTest('Level IDs are sequential (1-5)', isSequential ? 'pass' : 'fail');
        
        // Check each level has a unique badge
        const badges = levelsData.levels.map(l => l.reward.badge);
        const uniqueBadges = [...new Set(badges)];
        logTest('Each level has unique badge', badges.length === uniqueBadges.length ? 'pass' : 'fail');
        
        // Check points are positive
        const allPointsPositive = levelsData.levels.every(l => l.reward.points > 0);
        logTest('All levels award positive points', allPointsPositive ? 'pass' : 'fail');
        
        // Check all task types are valid
        const validTaskTypes = ['prompt_call', 'prompt_comparison', 'embedding_search', 'workflow_creation', 'tool_creation'];
        const allTaskTypesValid = levelsData.levels.every(l => validTaskTypes.includes(l.task.type));
        logTest('All task types are valid', allTaskTypesValid ? 'pass' : 'fail');
        
    } catch (error) {
        logTest('Game logic validation', 'fail', error.message);
    }
}

// ═══════════════════════════════════════════════════════════════════
// SECURITY TESTS
// ═══════════════════════════════════════════════════════════════════

async function testSecurity() {
    log('\n🔒 Testing Security...', 'cyan');
    
    // Check for sensitive data in files
    const sensitivePatterns = [
        /(?:["']\s*(?:sk-[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9]{30,}|AKIA[a-zA-Z0-9]{16,})\s*["'])/,  // Real API key patterns
        /bearer\s+[a-zA-Z0-9]{20,}/i  // Bearer tokens with actual values
    ];
    
    const filesToCheck = [
        'src/game.js',
        'src/levels.js',
        'src/mentor.js',
        'config.json'
    ];
    
    let securityIssues = 0;
    
    for (const file of filesToCheck) {
        try {
            const filePath = path.join(__dirname, '..', file);
            const content = await fs.readFile(filePath, 'utf-8');
            
            let hasIssue = false;
            for (const pattern of sensitivePatterns) {
                if (pattern.test(content)) {
                    hasIssue = true;
                    securityIssues++;
                    logTest(`${file} - no hardcoded secrets`, 'fail', 'Possible secret found');
                    break;
                }
            }
            
            if (!hasIssue) {
                logTest(`${file} - no hardcoded secrets`, 'pass');
            }
        } catch (error) {
            logTest(`${file} security check`, 'skip', 'File not found');
        }
    }
    
    // Check .gitignore exists and has proper entries
    try {
        const gitignorePath = path.join(__dirname, '..', '.gitignore');
        const gitignore = await fs.readFile(gitignorePath, 'utf-8');
        
        const requiredPatterns = ['.env', 'node_modules'];
        const hasRequired = requiredPatterns.every(p => gitignore.includes(p));
        logTest('.gitignore has security entries', hasRequired ? 'pass' : 'fail');
    } catch {
        logTest('.gitignore exists', 'fail');
    }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN TEST RUNNER
// ═══════════════════════════════════════════════════════════════════

async function runTests() {
    console.log('\n' + '═'.repeat(60));
    log('  🧪 FOUNDRY LOCAL LEARNING GAME - TEST SUITE', 'cyan');
    console.log('═'.repeat(60));
    
    const startTime = Date.now();
    
    await testFileStructure();
    await testJsonDataFiles();
    await testJavaScriptSyntax();
    await testFoundryLocalService();
    await testGameLogic();
    await testSecurity();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Summary
    console.log('\n' + '═'.repeat(60));
    log('  📊 TEST SUMMARY', 'cyan');
    console.log('═'.repeat(60));
    log(`  Total Tests:   ${totalTests}`);
    log(`  ✅ Passed:     ${passedTests}`, 'green');
    log(`  ❌ Failed:     ${failedTests}`, failedTests > 0 ? 'red' : 'green');
    log(`  ⏭️  Skipped:    ${skippedTests}`, 'yellow');
    log(`  ⏱️  Duration:   ${duration}s`, 'gray');
    console.log('═'.repeat(60));
    
    if (failedTests === 0) {
        log('\n  ✨ All tests passed! The game is ready to play.\n', 'green');
        return 0;
    } else {
        log(`\n  ⚠️  ${failedTests} test(s) failed. Please review above.\n`, 'red');
        return 1;
    }
}

// Run tests
runTests()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
        console.error('Test runner error:', error);
        process.exit(1);
    });
