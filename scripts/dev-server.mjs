#!/usr/bin/env node
/**
 * Local dev server — open http://localhost:3456/dashboard/
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { getRoot } from './lib/apps.mjs';

const ROOT = getRoot();
const PORT = 3456;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  let path = req.url?.split('?')[0] || '/';
  if (path === '/') path = '/dashboard/index.html';

  const filePath = join(ROOT, path.replace(/^\//, ''));

  try {
    const info = await stat(filePath);
    if (info.isDirectory()) {
      const index = join(filePath, 'index.html');
      const data = await readFile(index);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
      return;
    }
    const data = await readFile(filePath);
    const type = MIME[extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`\nApp Launcher dashboard\n`);
  console.log(`  → http://localhost:${PORT}/dashboard/\n`);
  console.log('Press Ctrl+C to stop.\n');
});
