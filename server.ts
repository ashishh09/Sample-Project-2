import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const host = '0.0.0.0';

app.use(express.json());

// Health check endpoint for Cloud Run and monitoring
app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic API ping route
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', app: 'Restaurant Management System' });
});

const distPath = path.resolve(__dirname, 'dist');

// Serve static assets from Vite build
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback for React Router / client routes
  app.get('*', (_req: Request, res: Response) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Application bundle not found. Please run npm run build.');
    }
  });
} else {
  // If dist is not yet built, instruct user/system
  app.get('*', (_req: Request, res: Response) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>RMS Server</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Restaurant Management System</h2>
          <p>Application is initializing. If dist is missing, build the client using <code>npm run build</code>.</p>
        </body>
      </html>
    `);
  });
}

const server = app.listen(port, host, () => {
  console.log(`[RMS Server] Production server running at http://${host}:${port}`);
});

// Graceful shutdown for Cloud Run
const handleShutdown = (signal: string) => {
  console.log(`[RMS Server] Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    console.log('[RMS Server] Closed out remaining connections.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[RMS Server] Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default app;
