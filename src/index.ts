import { chromium } from 'playwright';
import dotenv from 'dotenv';
import { startServer, waitForCode } from './server';

// Load environment variables
dotenv.config();

const courtUrls = [
  // "https://www.rec.us/locations/81cd2b08-8ea6-40ee-8c89-aeba92506576",
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
    await page.waitForSelector('input[name="password"]', { timeout: 5000 });
    await page.fill('input[name="password"]', process.env.REC_US_PASSWORD || '');

    // Click login and wait for navigation
    await Promise.all([
      page.waitForSelector('p.text-\\[0\\.875rem\\].font-medium:has-text("Oliver")'),
      page.click('button.uppercase[type="submit"]:has-text("log in & continue")')
    ]);

    console.log('Logged in');

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

      // Try to find and click the preferred time slot, if not available, click any time slot
      try {
        await page.waitForSelector(`button:has-text("${targetTimeString}")`, { timeout: 2000 });
        await page.click(`button:has-text("${targetTimeString}")`);
      } catch (error) {
        // If preferred time not found, click the first available time slot
        console.log('Preferred time not found, selecting first available slot');
        const timeSlots = await page.$$('button p.text-\\[0\\.875rem\\]:has-text("AM"), button p.text-\\[0\\.875rem\\]:has-text("PM")');
        if (timeSlots.length > 0) {
          await timeSlots[0].click();
        } else {
          throw new Error('No time slots available');
        }
      }

      // Click the participant dropdown
      await page.waitForSelector('[id^="headlessui-listbox-button-"]');
      await page.click('[id^="headlessui-listbox-button-"]');

      // Wait for and click the participant option
      await page.waitForSelector('[id^="headlessui-listbox-option-"]');
      await page.click('[id^="headlessui-listbox-option-"]');

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
      // Click the confirm button
      // await page.click('button:has-text("Confirm")');

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