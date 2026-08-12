import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.env.PORT) || 3000;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon' };

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    const requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const target = normalize(join(root, requested));
    if (!target.startsWith(root)) { response.writeHead(403); response.end('Forbidden'); return; }
    const info = await stat(target);
    if (!info.isFile()) throw new Error('Not a file');
    const extension = extname(target).toLowerCase();
    response.writeHead(200, { 'Content-Type': types[extension] || 'application/octet-stream', 'Cache-Control': 'no-cache, no-store, must-revalidate' });
    response.end(await readFile(target));
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, () => console.log(`Portfolio running at http://localhost:${port}`));
