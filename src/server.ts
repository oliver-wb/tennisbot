import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Server } from 'http';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

let verificationCode: string | null = null;
let codeResolve: ((code: string) => void) | null = null;

// Explicitly handle favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204));

// Handle verification code in URL path
app.get('/:code', (req, res) => {
  const code = req.params.code;
  
  // Ignore browser-specific requests
  if (['favicon.ico', 'apple-touch-icon.png', 'robots.txt'].includes(code)) {
    res.status(204).end();
    return;
  }

  console.log('CODE RECEIVED:', code);
  if (code) {
    // Extract only numbers from the code
    const matches = code.match(/\d+/g);
    const cleanCode = matches ? matches.join('') : '';
    
    if (cleanCode) {
      verificationCode = cleanCode;
      if (codeResolve) {
        codeResolve(cleanCode);
        codeResolve = null;
      }
      res.send('Code received: ' + cleanCode);
    } else {
      res.status(400).send('Invalid code format');
    }
  } else {
    res.status(400).send('No code provided');
  }
});

// Function to wait for the verification code
export function waitForCode(): Promise<string> {
  return new Promise((resolve) => {
    if (verificationCode) {
      const code = verificationCode;
      verificationCode = null;
      resolve(code);
    } else {
      codeResolve = resolve;
    }
  });
}

// Start the server
export function startServer(port: number = 3000): Promise<Server> {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      resolve(server);
    });
  });
} 