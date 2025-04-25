import { chromium } from 'playwright';
import dotenv from 'dotenv';
import { startServer, waitForCode } from './server';

// Load environment variables
dotenv.config();

const courtUrls = [
  "https://www.rec.us/locations/c41c7b8f-cb09-415a-b8ea-ad4b82d792b9",
]

async function main() {
  // Start the web server
  const server = await startServer();

  // Launch browser
  const browser = await chromium.launch({
    headless: false, // Set to true for production
  });

  try {
    // Create a new context and page
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the first court URL
    await page.goto(courtUrls[0]);

    // Click the login button
    await page.click('button:has-text("Log In")');
    
    // Wait for the login modal to appear
    await page.waitForSelector('input[name="email"]', { timeout: 5000 });

    // Fill in the login form
    await page.fill('input[name="email"]', process.env.REC_US_EMAIL || '');
    await page.fill('input[name="password"]', process.env.REC_US_PASSWORD || '');

    // TODO: Add submit button click
    // await page.click('button[type="submit"]');

    // Now visit each court URL with the same logged-in context
    for (const courtUrl of courtUrls) {
      await page.goto(courtUrl);
      
      // Wait for and click the datepicker
      await page.waitForSelector('.react-datepicker__input-container input');
      await page.click('.react-datepicker__input-container input');

      // Calculate the target date (2 days from now)
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 2);
      const targetDay = targetDate.getDate();
      const targetMonth = targetDate.getMonth() + 1; // Months are 0-based
      const targetYear = targetDate.getFullYear();

      // Format the date string to match the aria-label format
      const targetDateString = `Choose ${targetDate.toLocaleDateString('en-US', { weekday: 'long' })}, ${targetDate.toLocaleDateString('en-US', { month: 'long' })} ${targetDay}${getDaySuffix(targetDay)}, ${targetYear}`;

      // Click the target date in the datepicker
      await page.click(`[aria-label="${targetDateString}"]`);

      // Calculate the target time (nearest half hour)
      const now = new Date();
      const minutes = now.getMinutes();
      const roundedMinutes = Math.round(minutes / 30) * 30;
      const targetTime = new Date(now);
      targetTime.setMinutes(roundedMinutes);
      targetTime.setSeconds(0);
      targetTime.setMilliseconds(0);

      // Format the time to match the button text format
      const targetTimeString = targetTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      // Wait for and click the time slot closest to current time
      await page.waitForSelector(`button:has-text("${targetTimeString}")`);
      await page.click(`button:has-text("${targetTimeString}")`);

      // Click the participant dropdown
      await page.waitForSelector('[id^="headlessui-listbox-button-:r6s:"]');
      await page.click('[id^="headlessui-listbox-button-:r6s:"]');

      // Wait for and click the participant option
      await page.waitForSelector('[id^="headlessui-listbox-option-:r7d:"]');
      await page.click('[id^="headlessui-listbox-option-:r7d:"]');

      // Wait for and click the Book button
      await page.waitForSelector('button:has-text("Book")');
      await page.click('button:has-text("Book")');

      // Wait for and click the Send Code button
      await page.waitForSelector('button:has-text("Send Code")');
      await page.click('button:has-text("Send Code")');

      // Wait for the verification code input to appear
      await page.waitForSelector('input[type="number"]');

      // Wait for the verification code from the web server
      const code = await waitForCode();
      console.log('Received verification code:', code);

      // Fill in the verification code
      await page.fill('input[type="number"]', code);

      // Keep the browser open for debugging
      await page.pause();
    }

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // Close the browser and server
    await browser.close();
    server.close();
  }
}

// Helper function to get the day suffix (st, nd, rd, th)
function getDaySuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

main().catch(console.error); 