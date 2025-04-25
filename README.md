# Tennis Court Booking Bot

A Playwright bot for automating tennis court bookings on rec.us.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy the environment variables template:
```bash
cp .env.example .env
```

3. Edit `.env` with your rec.us credentials:
```
REC_US_EMAIL=your_email@example.com
REC_US_PASSWORD=your_password
```

4. Install Playwright browsers:
```bash
npx playwright install
```

## Usage

Run the bot:
```bash
npm start
```

The bot will:
1. Open a browser and navigate to rec.us/dolores
2. Sign in using your credentials
3. Pause for you to implement the court booking logic

## Development

The main bot logic is in `src/index.ts`. You can modify this file to implement the specific court booking logic you need.

## Notes

- The bot runs in non-headless mode by default for easier debugging
- Set `headless: true` in `index.ts` for production use
