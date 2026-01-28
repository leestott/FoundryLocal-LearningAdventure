// ═══════════════════════════════════════════════════════════════════
// Playwright Screenshot Tests for Foundry Local Learning Game
// ═══════════════════════════════════════════════════════════════════

const { test, expect } = require('@playwright/test');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');

test.describe('Game Screenshots', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('01 - Welcome Screen', async ({ page }) => {
    // Capture the welcome screen
    await expect(page.locator('.welcome-banner')).toBeVisible();
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '01-welcome-screen.png'),
      fullPage: true 
    });
  });

  test('02 - Enter Player Name', async ({ page }) => {
    // Fill in player name
    await page.fill('#playerName', 'Explorer');
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '02-enter-name.png'),
      fullPage: true 
    });
  });

  test('03 - Main Menu', async ({ page }) => {
    // Start game and capture menu
    await page.fill('#playerName', 'Demo Player');
    await page.click('button:has-text("Start Adventure")');
    await page.waitForSelector('.level-list');
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '03-main-menu.png'),
      fullPage: true 
    });
  });

  test('04 - Level 1 Meet the Model', async ({ page }) => {
    // Navigate to Level 1
    await page.fill('#playerName', 'Demo Player');
    await page.click('button:has-text("Start Adventure")');
    await page.waitForSelector('.level-list');
    await page.click('.level-card:first-child');
    await page.waitForSelector('.task-area');
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '04-level1-meet-model.png'),
      fullPage: true 
    });
  });

  test('05 - Level 1 Send Prompt', async ({ page }) => {
    // Send a prompt in Level 1
    await page.fill('#playerName', 'Demo Player');
    await page.click('button:has-text("Start Adventure")');
    await page.click('.level-card:first-child');
    await page.waitForSelector('#promptInput');
    await page.fill('#promptInput', 'Hello! What is Foundry Local?');
    await page.click('button:has-text("Send to Model")');
    await page.waitForSelector('#promptOutput:visible');
    await page.waitForTimeout(2000); // Wait for response
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '05-level1-response.png'),
      fullPage: true 
    });
  });

  test('06 - Mentor Chat', async ({ page }) => {
    // Show mentor interaction
    await page.fill('#playerName', 'Demo Player');
    await page.click('button:has-text("Start Adventure")');
    await page.click('.level-card:first-child');
    await page.waitForSelector('.mentor-container');
    await page.fill('#mentorQuestion', 'What are embeddings?');
    await page.click('.btn-mentor');
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '06-mentor-chat.png'),
      fullPage: true 
    });
  });

  test('07 - Hint System', async ({ page }) => {
    // Show hint functionality
    await page.fill('#playerName', 'Demo Player');
    await page.click('button:has-text("Start Adventure")');
    await page.click('.level-card:first-child');
    await page.waitForSelector('.hint-section');
    await page.click('.btn-hint');
    await page.waitForSelector('.hint-display.visible');
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '07-hint-system.png'),
      fullPage: true 
    });
  });

  test('08 - Progress Modal', async ({ page }) => {
    // Show progress tracking
    await page.fill('#playerName', 'Demo Player');
    await page.click('button:has-text("Start Adventure")');
    await page.waitForSelector('.menu-actions');
    await page.click('button:has-text("Progress")');
    await page.waitForSelector('#progressModal.active');
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '08-progress-modal.png'),
      fullPage: true 
    });
  });

  test('09 - Badges Collection', async ({ page }) => {
    // Show badges screen
    await page.fill('#playerName', 'Demo Player');
    await page.click('button:has-text("Start Adventure")');
    await page.waitForSelector('.menu-actions');
    await page.click('button:has-text("Badges")');
    await page.waitForSelector('#badgesModal.active');
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '09-badges-collection.png'),
      fullPage: true 
    });
  });

  test('10 - Help Screen', async ({ page }) => {
    // Show help modal
    await page.fill('#playerName', 'Demo Player');
    await page.click('button:has-text("Start Adventure")');
    await page.waitForSelector('.menu-actions');
    await page.click('button:has-text("Help")');
    await page.waitForSelector('#helpModal.active');
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '10-help-screen.png'),
      fullPage: true 
    });
  });

});

test.describe('Mobile Screenshots', () => {
  
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X

  test('Mobile - Welcome Screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, 'mobile-welcome.png'),
      fullPage: true 
    });
  });

  test('Mobile - Main Menu', async ({ page }) => {
    await page.goto('/');
    await page.fill('#playerName', 'Mobile Player');
    await page.click('button:has-text("Start Adventure")');
    await page.waitForSelector('.level-list');
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, 'mobile-menu.png'),
      fullPage: true 
    });
  });

});
