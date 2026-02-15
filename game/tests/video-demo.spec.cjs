// ═══════════════════════════════════════════════════════════════════
// Playwright Video Demo - Foundry Local Learning Adventure
// Records a full walkthrough video of the game for documentation.
//
// Usage:
//   npx playwright test --config=tests/playwright.config.cjs tests/video-demo.spec.cjs
//
// Output:
//   game/screenshots/demo-video/  (contains .webm video files)
// ═══════════════════════════════════════════════════════════════════

const { test, expect } = require('@playwright/test');
const path = require('path');

const VIDEO_DIR = path.join(__dirname, '..', 'screenshots', 'demo-video');

// Force video recording for this entire file
test.use({
  video: {
    mode: 'on',
    size: { width: 1280, height: 720 }
  },
  viewport: { width: 1280, height: 720 },
  launchOptions: { slowMo: 150 },      // slow down actions so the recording is easy to follow
});

test.describe('Full Game Video Demo', () => {

  test('Complete Game Walkthrough', async ({ page, context }) => {
    test.setTimeout(180_000); // 3 min budget

    // ── Welcome Screen ──────────────────────────────────────────
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.welcome-banner')).toBeVisible();
    await page.waitForTimeout(2000);

    // ── Enter name and start ────────────────────────────────────
    await page.locator('#playerName').click();
    await page.locator('#playerName').pressSequentially('AI Explorer', { delay: 100 });
    await page.waitForTimeout(800);
    await page.click('button:has-text("Start Adventure")');
    await page.waitForSelector('.level-list');
    await page.waitForTimeout(1500);

    // ── Show Badges modal ───────────────────────────────────────
    await page.click('button:has-text("Badges")');
    await page.waitForSelector('#badgesModal.active');
    await page.waitForTimeout(1500);
    await page.click('#badgesModal .modal-close');
    await page.waitForTimeout(500);

    // ── Show Help modal ─────────────────────────────────────────
    await page.click('button:has-text("Help")');
    await page.waitForSelector('#helpModal.active');
    await page.waitForTimeout(1500);
    await page.click('#helpModal .modal-close');
    await page.waitForTimeout(500);

    // ── Level 1: Meet the Model ─────────────────────────────────
    await page.click('.level-card:first-child');
    await page.waitForSelector('#promptInput');
    await page.waitForTimeout(1000);

    // First prompt
    await page.locator('#promptInput').click();
    await page.locator('#promptInput').pressSequentially('Hello! What is Foundry Local?', { delay: 60 });
    await page.waitForTimeout(500);
    await page.click('button:has-text("Send to Model")');
    await page.waitForSelector('#promptOutput:visible');
    await page.waitForTimeout(3000);

    // Second prompt to complete level
    await page.locator('#promptInput').click();
    await page.locator('#promptInput').pressSequentially('Can you explain what a prompt is?', { delay: 60 });
    await page.waitForTimeout(500);
    await page.click('button:has-text("Send to Model")');
    await page.waitForTimeout(3000);

    // Show hint before completion modal appears
    // The level should auto-complete — wait for celebration
    await page.waitForTimeout(2000);

    // Close completion modal if visible
    const completionModal = page.locator('.completion-modal.active');
    if (await completionModal.isVisible().catch(() => false)) {
      await page.waitForTimeout(2000);
      await page.click('.completion-modal .btn-secondary'); // Back to Menu
      await page.waitForTimeout(1000);
    }

    // ── Open Mentor Chat ────────────────────────────────────────
    // Navigate back to menu if not there
    const menuScreen = page.locator('#menuScreen.active');
    if (await menuScreen.isVisible().catch(() => false)) {
      await page.waitForTimeout(500);
    }

    await page.click('.mentor-fab');
    await page.waitForSelector('.mentor-modal.active');
    await page.waitForTimeout(1000);

    await page.locator('#mentorModalInput').click();
    await page.locator('#mentorModalInput').pressSequentially('What will I learn in Level 2?', { delay: 80 });
    await page.click('.mentor-modal-send');
    await page.waitForTimeout(2000);

    await page.click('.mentor-modal-close');
    await page.waitForTimeout(1000);

    // ── Show Progress modal ─────────────────────────────────────
    await page.click('button:has-text("Progress")');
    await page.waitForSelector('#progressModal.active');
    await page.waitForTimeout(2000);
    await page.click('#progressModal .modal-close');
    await page.waitForTimeout(1000);

    // ── End with a final shot ───────────────────────────────────
    await page.waitForTimeout(2000);

    // Save the video — Playwright auto-saves when context closes.
    // Copy the video to our desired output path.
    const video = page.video();
    if (video) {
      await context.close();  // finalize video
      const videoPath = await video.path();
      const fs = require('fs');
      if (!fs.existsSync(VIDEO_DIR)) {
        fs.mkdirSync(VIDEO_DIR, { recursive: true });
      }
      const destPath = path.join(VIDEO_DIR, 'game-walkthrough.webm');
      fs.copyFileSync(videoPath, destPath);
      console.log(`\n✅ Video demo saved to: ${destPath}\n`);
    }
  });

});

test.describe('Mobile Video Demo', () => {

  test('Mobile Walkthrough', async ({ browser }) => {
    test.setTimeout(120_000);

    // Create mobile context with video recording
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      recordVideo: {
        dir: VIDEO_DIR,
        size: { width: 375, height: 812 }
      }
    });
    const page = await context.newPage();

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Enter name
    await page.locator('#playerName').click();
    await page.locator('#playerName').pressSequentially('Mobile User', { delay: 100 });
    await page.waitForTimeout(500);
    await page.click('button:has-text("Start Adventure")');
    await page.waitForSelector('.level-list');
    await page.waitForTimeout(1500);

    // Open Level 1
    await page.click('.level-card:first-child');
    await page.waitForSelector('#promptInput');
    await page.waitForTimeout(1000);

    // Send a prompt
    await page.locator('#promptInput').click();
    await page.locator('#promptInput').pressSequentially('Hello AI!', { delay: 80 });
    await page.click('button:has-text("Send to Model")');
    await page.waitForTimeout(3000);

    // Open mentor
    await page.click('.mentor-fab');
    await page.waitForSelector('.mentor-modal.active');
    await page.waitForTimeout(2000);
    await page.click('.mentor-modal-close');
    await page.waitForTimeout(1000);

    // Save video
    const video = page.video();
    if (video) {
      await context.close();  // finalize video
      const videoPath = await video.path();
      const fs = require('fs');
      if (!fs.existsSync(VIDEO_DIR)) {
        fs.mkdirSync(VIDEO_DIR, { recursive: true });
      }
      const destPath = path.join(VIDEO_DIR, 'mobile-walkthrough.webm');
      fs.copyFileSync(videoPath, destPath);
      console.log(`\n✅ Mobile video saved to: ${destPath}\n`);
    }
  });

});
