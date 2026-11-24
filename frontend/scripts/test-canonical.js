import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

const server = http.createServer((req, res) => {
  const host = req.headers.host || '';
  const url = req.url.split('?')[0];

  // 1. Force WWW to non-WWW HTTPS 301
  if (host.startsWith('www.')) {
    res.writeHead(301, {
      Location: `https://smven.com${req.url}`,
      'Content-Type': 'text/html',
    });
    res.end(`Redirecting to https://smven.com${req.url}`);
    return;
  }

  // 2. Direct static files
  if (url === '/sitemap.xml') {
    res.writeHead(200, { 'Content-Type': 'application/xml' });
    res.end(fs.readFileSync(path.join(distDir, 'sitemap.xml')));
    return;
  }
  if (url === '/robots.txt') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(fs.readFileSync(path.join(distDir, 'robots.txt')));
    return;
  }

  // 3. /services 301
  if (url === '/services' || url === '/services/') {
    res.writeHead(301, { Location: '/', 'Content-Type': 'text/html' });
    res.end('Redirecting to /');
    return;
  }

  // 4. Route-specific HTML for public course routes
  const courseMatch = url.match(/^\/(cloud-computing|devops-engineering|virtualization-engineering|server-engineering|storage-engineering|backup-engineering)\/?$/);
  if (courseMatch) {
    const file = path.join(distDir, `${courseMatch[1]}.html`);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(file));
    return;
  }

  // 5. Fallback for private transactional routes
  const privateMatch = url.match(/^\/(payment-success|payment-failed|claim-certificate)\/?$/);
  if (privateMatch) {
    const file = path.join(distDir, 'fallback.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(file));
    return;
  }

  // 6. Homepage / SPA fallback
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(distDir, 'index.html')));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(path.join(distDir, 'fallback.html')));
});

async function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    }).on('error', reject);
  });
}

async function runTests() {
  const PORT = 5188;
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}\n`);

  const publicRoutes = [
    { path: '/', expectedCanonical: 'https://smven.com/' },
    { path: '/cloud-computing', expectedCanonical: 'https://smven.com/cloud-computing' },
    { path: '/devops-engineering', expectedCanonical: 'https://smven.com/devops-engineering' },
    { path: '/virtualization-engineering', expectedCanonical: 'https://smven.com/virtualization-engineering' },
    { path: '/server-engineering', expectedCanonical: 'https://smven.com/server-engineering' },
    { path: '/storage-engineering', expectedCanonical: 'https://smven.com/storage-engineering' },
    { path: '/backup-engineering', expectedCanonical: 'https://smven.com/backup-engineering' },
  ];

  console.log('=== TEST 1: RAW HTML RESPONSES FOR SEVEN PUBLIC ROUTES ===');
  let allPassed = true;

  for (const r of publicRoutes) {
    const res = await fetchUrl(`http://localhost:${PORT}${r.path}`);
    const html = res.body;

    const canonicalMatches = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi) || [];
    const count = canonicalMatches.length;

    let href = null;
    if (count > 0) {
      const match = canonicalMatches[0].match(/href=["']([^"']+)["']/i);
      href = match ? match[1] : null;
    }

    const pass = count === 1 && href === r.expectedCanonical && res.statusCode === 200;
    if (!pass) allPassed = false;

    console.log(
      `${pass ? '✓ PASS' : '✗ FAIL'} ${r.path.padEnd(30)} -> HTTP ${res.statusCode} | Canonical: ${href} (count: ${count})`
    );
  }

  console.log('\n=== TEST 2: RAW HTML FOR PRIVATE TRANSACTIONAL ROUTES ===');
  const privateRoutes = ['/payment-success', '/payment-failed', '/claim-certificate'];
  for (const pr of privateRoutes) {
    const res = await fetchUrl(`http://localhost:${PORT}${pr}`);
    const html = res.body;

    const canonicalMatches = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi) || [];
    const hasNoIndex = html.includes('name="robots" content="noindex, nofollow"');
    const pass = canonicalMatches.length === 0 && hasNoIndex && res.statusCode === 200;
    if (!pass) allPassed = false;

    console.log(
      `${pass ? '✓ PASS' : '✗ FAIL'} ${pr.padEnd(30)} -> HTTP ${res.statusCode} | Canonicals: ${canonicalMatches.length} | NoIndex: ${hasNoIndex}`
    );
  }

  console.log('\n=== TEST 3: WWW TO NON-WWW 301 REDIRECTS ===');
  const wwwRoutes = [
    { path: '/', expectedLocation: 'https://smven.com/' },
    { path: '/virtualization-engineering', expectedLocation: 'https://smven.com/virtualization-engineering' },
    { path: '/cloud-computing', expectedLocation: 'https://smven.com/cloud-computing' },
  ];

  for (const wr of wwwRoutes) {
    const res = await fetchUrl(`http://localhost:${PORT}${wr.path}`, { Host: 'www.smven.com' });
    const location = res.headers.location;
    const pass = res.statusCode === 301 && location === wr.expectedLocation;
    if (!pass) allPassed = false;

    console.log(
      `${pass ? '✓ PASS' : '✗ FAIL'} www.smven.com${wr.path.padEnd(25)} -> HTTP ${res.statusCode} | Location: ${location}`
    );
  }

  console.log('\n=== TEST 4: OBSOLETE /SERVICES 301 REDIRECT ===');
  const servicesRes = await fetchUrl(`http://localhost:${PORT}/services`);
  const servicesPass = servicesRes.statusCode === 301 && servicesRes.headers.location === '/';
  if (!servicesPass) allPassed = false;
  console.log(
    `${servicesPass ? '✓ PASS' : '✗ FAIL'} /services                      -> HTTP ${servicesRes.statusCode} | Location: ${servicesRes.headers.location}`
  );

  server.close();

  if (!allPassed) {
    console.error('\nTests failed!');
    process.exit(1);
  } else {
    console.log('\n=====================================================');
    console.log('✓ ALL TESTS PASSED: Raw HTML responses verified 100%!');
    console.log('=====================================================\n');
  }
}

runTests().catch((err) => {
  console.error(err);
  server.close();
  process.exit(1);
});
