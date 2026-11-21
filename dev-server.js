import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from './api/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Load environment variables from .env.local and .env
for (const envFile of ['.env.local', '.env']) {
  const envPath = path.join(__dirname, envFile);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (match && !process.env[match[1]]) {
        const val = match[2].trim().replace(/^['"]|['"]$/g, '');
        process.env[match[1]] = val;
      }
    }
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  // 1. API Route: /api/chat
  if (pathname === '/api/chat' || pathname === '/api/chat/') {
    res.status = function (code) {
      res.statusCode = code;
      return this;
    };
    res.json = function (obj) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(obj));
      return this;
    };
    try {
      await handler(req, res);
    } catch (err) {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'internal_server_error', fallback: true }));
      }
    }
    return;
  }

  // 2. Static File Serving with clean routing
  if (pathname === '/') pathname = '/index.html';

  let filePath = path.join(__dirname, pathname);

  // If path doesn't have an extension, try appending .html
  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  // Prevent path traversal
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const notFoundPath = path.join(__dirname, '404.html');
      if (fs.existsSync(notFoundPath)) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return fs.createReadStream(notFoundPath).pipe(res);
      }
      res.statusCode = 404;
      return res.end('Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`  BizAssist AI Local Development Server`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  RAG Chatbot API: http://localhost:${PORT}/api/chat`);
  console.log(`  Gemini API Key: ${process.env.GEMINI_API_KEY ? 'Configured (Active)' : 'Missing (Offline Fallback Mode)'}`);
  console.log(`==================================================\n`);
});
