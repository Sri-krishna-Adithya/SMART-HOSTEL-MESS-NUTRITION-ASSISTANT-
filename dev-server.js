// Small local server: serves the files in public/ and routes /api/ask to the same
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

const publicDir = fileURLToPath(new URL('./public/', import.meta.url));
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

  const file = normalize(join(publicDir, pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(publicDir)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }
  try {
    res.setHeader('Content-Type', types[extname(file)] || 'text/plain');
    res.end(await readFile(file));
  } catch {
    res.statusCode = 404;
    res.end('Not found');
  }
}).listen(port, () => console.log(`Running at http://localhost:${port}`));
