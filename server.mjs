import { createServer, request as httpRequest } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from './dist/server/server.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const clientDir = join(__dirname, 'dist', 'client');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT || '3000', 10);
const CONTROL_API_URL = process.env.CONTROL_API_URL || 'http://localhost:9090';

// Parse the Control API URL for proxying
const controlApiUrl = new URL(CONTROL_API_URL);

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Proxy /v1/* requests to Control API
  if (url.pathname.startsWith('/v1/')) {
    const proxyUrl = new URL(url.pathname + url.search, CONTROL_API_URL);

    const proxyHeaders = { ...req.headers };
    // Remove hop-by-hop headers
    delete proxyHeaders['host'];
    delete proxyHeaders['connection'];

    const proxyReq = httpRequest(
      {
        hostname: controlApiUrl.hostname,
        port: controlApiUrl.port || 80,
        path: proxyUrl.pathname + proxyUrl.search,
        method: req.method,
        headers: proxyHeaders,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      res.writeHead(502);
      res.end('Bad Gateway');
    });

    req.pipe(proxyReq);
    return;
  }

  // Try to serve static files from dist/client first
  if (url.pathname.startsWith('/assets/') || url.pathname === '/favicon.ico') {
    const filePath = join(clientDir, url.pathname);
    try {
      const fileStat = await stat(filePath);
      if (fileStat.isFile()) {
        const ext = extname(filePath);
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const content = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        return;
      }
    } catch {
      // File not found, fall through to SSR handler
    }
  }

  // Convert Node.js request to fetch Request
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
  }

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? await new Promise((resolve) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
      })
    : undefined;

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body,
  });

  try {
    const response = await handler.fetch(request);

    // Set status and headers
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Stream the response body
    if (response.body) {
      const reader = response.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          res.write(value);
        }
      };
      await pump();
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Server error:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
