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

// Endpoint to get the verification code
app.get('/api/code', (req, res) => {
  if (verificationCode) {
    res.json({ code: verificationCode });
    verificationCode = null;
  } else {
    res.status(404).json({ error: 'No code available' });
  }
});

// Endpoint to set the verification code
app.post('/api/code', (req, res) => {
  const { code } = req.body;
  if (code) {
    verificationCode = code;
    if (codeResolve) {
      codeResolve(code);
      codeResolve = null;
    }
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Code is required' });
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