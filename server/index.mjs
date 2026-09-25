import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const dataDir = process.env.DATA_DIR || path.join(rootDir, 'data');
const PORT = Number(process.env.PORT || (process.env.NODE_ENV === 'production' ? 80 : 3004));

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const cmsFilePath = path.join(dataDir, 'cms.json');
const pimFilePath = path.join(dataDir, 'pim.json');

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

// Security headers (same as nginx.conf)
const setSecurityHeaders = (res) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
};

import { defaultTickers, defaultBanners, defaultHeroSlides, defaultProducts } from './seed-data.mjs';

// Default seed data
const getDefaultCms = () => ({
  tickers: [...defaultTickers],
  banners: [...defaultBanners],
  heroSlides: [...defaultHeroSlides],
});

const getDefaultPim = () => ({
  products: [...defaultProducts],
});

// Read / Write helpers
const readJsonFile = async (filePath, defaultFn) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = await fsp.readFile(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`[API] Error reading ${filePath}, falling back to defaults:`, err.message);
  }
  const fallback = await defaultFn();
  await writeJsonFile(filePath, fallback);
  return fallback;
};

const writeJsonFile = async (filePath, data) => {
  const tmpPath = `${filePath}.tmp.${Date.now()}`;
  await fsp.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  await fsp.rename(tmpPath, filePath);
};

// Parse JSON body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 5 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
};

// Server instance
const server = http.createServer(async (req, res) => {
  setSecurityHeaders(res);
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // CORS headers for local dev convenience
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // API ROUTE: /api/cms
  if (pathname === '/api/cms') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method === 'GET') {
      try {
        const data = await readJsonFile(cmsFilePath, getDefaultCms);
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, data }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      try {
        const body = await parseBody(req);
        const current = await readJsonFile(cmsFilePath, getDefaultCms);
        const updated = {
          tickers: Array.isArray(body.tickers) ? body.tickers : current.tickers,
          banners: Array.isArray(body.banners) ? body.banners : current.banners,
          heroSlides: Array.isArray(body.heroSlides) ? body.heroSlides : current.heroSlides,
          updatedAt: new Date().toISOString(),
        };
        await writeJsonFile(cmsFilePath, updated);
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, data: updated }));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
    return;
  }

  // API ROUTE: /api/pim
  if (pathname === '/api/pim') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method === 'GET') {
      try {
        const data = await readJsonFile(pimFilePath, getDefaultPim);
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, data }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      try {
        const body = await parseBody(req);
        if (!Array.isArray(body.products)) {
          throw new Error('products must be an array');
        }
        const updated = {
          products: body.products,
          updatedAt: new Date().toISOString(),
        };
        await writeJsonFile(pimFilePath, updated);
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, data: updated }));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
    return;
  }

  // Static File Serving from dist/
  if (req.method === 'GET' || req.method === 'HEAD') {
    let filePath = path.join(distDir, pathname);
    let stat;

    try {
      stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        stat = fs.statSync(filePath);
      }
    } catch {
      // Try adding .html
      if (fs.existsSync(`${filePath}.html`)) {
        filePath = `${filePath}.html`;
        stat = fs.statSync(filePath);
      } else {
        // Fallback to 404.html or index.html
        filePath = path.join(distDir, 'index.html');
        if (fs.existsSync(filePath)) {
          stat = fs.statSync(filePath);
        } else {
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // Cache control
    if (ext === '.html') {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else if (/\.(css|js|woff2?|webp|png|jpe?g|ico|svg)$/.test(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }

    if (req.method === 'HEAD') {
      res.statusCode = 200;
      res.end();
      return;
    }

    // Stream with gzip if accepted
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (acceptEncoding.includes('gzip') && stat.size > 1024 && !ext.match(/\.(png|jpe?g|webp|woff2?)$/)) {
      res.setHeader('Content-Encoding', 'gzip');
      res.statusCode = 200;
      const raw = fs.createReadStream(filePath);
      const gzip = zlib.createGzip();
      raw.pipe(gzip).pipe(res);
    } else {
      res.setHeader('Content-Length', stat.size);
      res.statusCode = 200;
      fs.createReadStream(filePath).pipe(res);
    }
    return;
  }

  res.statusCode = 405;
  res.end('Method Not Allowed');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[FIVE Server] Running on http://0.0.0.0:${PORT} (Data directory: ${dataDir})`);
});
