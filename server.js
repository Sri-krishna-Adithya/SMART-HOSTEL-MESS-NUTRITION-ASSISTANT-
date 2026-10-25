// Small local server: serves the static files and routes /api/ask to the same
// handler that runs as a serverless function when deployed.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from './api/ask.js';

try {
  process.loadEnvFile();
} catch {
  // no .env file, fall back to real environment variables
}

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const port = process.env.PORT || 3000;

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 20000) req.destroy();
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function isPublic(path) {
  return path === '/index.html' || path === '/styles.css' || path.startsWith('/src/') || path.startsWith('/data/');
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (pathname === '/api/ask') {
    try {
      req.body = JSON.parse((await readBody(req)) || '{}');
    } catch {
      req.body = undefined;
    }
    return handler(req, res);
  }

  const path = pathname === '/' ? '/index.html' : pathname;
  if (!isPublic(path)) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  try {
    const file = await readFile(normalize(join(root, path)));
    res.setHeader('Content-Type', types[extname(path)] || 'text/plain');
    res.end(file);
  } catch {
    res.statusCode = 404;
    res.end('Not found');
  }
}).listen(port, () => console.log(`Running at http://localhost:${port}`));
