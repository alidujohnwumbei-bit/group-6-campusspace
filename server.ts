import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port: number = (process.env.PORT && process.env.PORT !== '8080') ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Serve static production build files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint for Cloud Run / deployment health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Fallback to index.html for all SPA routes (/login, /signup, etc.)
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const startServer = (targetPort: number) => {
  const server = app.listen(targetPort, '0.0.0.0', () => {
    console.log(`CampusSpace server running on http://0.0.0.0:${targetPort}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE' && targetPort !== 3000) {
      console.warn(`Port ${targetPort} in use, attempting port 3000...`);
      startServer(3000);
    } else {
      console.error('Server startup error:', err);
    }
  });
};

startServer(port);
