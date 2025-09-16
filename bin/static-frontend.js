#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = process.env.FRONTEND_DIST;
const port = Number(process.env.PORT || 5173);

if (!root || !fs.existsSync(root)) {
  console.error('[frontend] Dist folder not found:', root);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  try {
    const requestPath = decodeURI((req.url || '/').split('?')[0]);
    let filePath = path.join(root, requestPath);

    if (requestPath.startsWith('/v1/api') || requestPath.startsWith('/docs')) {
      res.statusCode = 404;
      res.end('Use backend for /v1/api and /docs');
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      filePath = path.join(root, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Internal error');
        return;
      }
      // naive content type
      if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'text/javascript');
      else if (filePath.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
      else if (filePath.endsWith('.html')) res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200;
      res.end(data);
    });
  } catch (e) {
    res.statusCode = 500;
    res.end('Internal error');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`[frontend] listening on http://127.0.0.1:${port}`);
});


