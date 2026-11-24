import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { programsContent } from '../src/data/content.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const distDir = path.resolve(frontendDir, 'dist');

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildPageHtml(templateHtml, { canonicalUrl, title, description, noindex }) {
  let html = templateHtml;

  // 1. Title replacement
  if (title) {
    if (html.includes('<title>')) {
      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    } else {
      html = html.replace('</head>', `  <title>${escapeHtml(title)}</title>\n</head>`);
    }
  }

  // 2. Meta description replacement / injection
  if (description) {
    const metaDescTag = `  <meta name="description" content="${escapeHtml(description)}" />`;
    if (html.includes('<meta name="description"')) {
      html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, metaDescTag);
    } else {
      html = html.replace('</head>', `${metaDescTag}\n</head>`);
    }
  }

  // 3. Canonical tag replacement / removal
  html = html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/gi, '');
  if (canonicalUrl) {
    const canonicalTag = `  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />\n`;
    html = html.replace('</head>', `${canonicalTag}</head>`);
  }

  // 4. Robots meta tag
  html = html.replace(/<meta\s+[^>]*name=["']robots["'][^>]*>\s*/gi, '');
  if (noindex) {
    const robotsTag = `  <meta name="robots" content="noindex, nofollow" />\n`;
    html = html.replace('</head>', `${robotsTag}</head>`);
  }

  // 5. OpenGraph metadata tags
  if (title && canonicalUrl && !noindex) {
    html = html.replace(/<meta\s+property=["']og:(title|description|url|type|site_name)["'][^>]*>\s*/gi, '');
    const ogTags = [
      `  <meta property="og:type" content="website" />`,
      `  <meta property="og:site_name" content="SMVEN" />`,
      `  <meta property="og:title" content="${escapeHtml(title)}" />`,
      description ? `  <meta property="og:description" content="${escapeHtml(description)}" />` : '',
      `  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    ].filter(Boolean).join('\n') + '\n';
    html = html.replace('</head>', `${ogTags}</head>`);
  }

  return html;
}

export function generateRoutes() {
  const indexHtmlPath = path.resolve(distDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error(`[generate-routes] Cannot find ${indexHtmlPath}. Make sure 'vite build' ran first.`);
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  // Define all public course routes and their metadata
  const routes = [
    {
      slug: '', // Root /
      canonicalUrl: 'https://smven.com/',
      key: 'infrastructure',
      filename: 'index.html',
    },
    {
      slug: 'cloud-computing',
      canonicalUrl: 'https://smven.com/cloud-computing',
      key: 'cloud-computing',
      filename: 'cloud-computing.html',
    },
    {
      slug: 'devops-engineering',
      canonicalUrl: 'https://smven.com/devops-engineering',
      key: 'devops-engineering',
      filename: 'devops-engineering.html',
    },
    {
      slug: 'virtualization-engineering',
      canonicalUrl: 'https://smven.com/virtualization-engineering',
      key: 'virtualization-engineering',
      filename: 'virtualization-engineering.html',
    },
    {
      slug: 'server-engineering',
      canonicalUrl: 'https://smven.com/server-engineering',
      key: 'server-engineering',
      filename: 'server-engineering.html',
    },
    {
      slug: 'storage-engineering',
      canonicalUrl: 'https://smven.com/storage-engineering',
      key: 'storage-engineering',
      filename: 'storage-engineering.html',
    },
    {
      slug: 'backup-engineering',
      canonicalUrl: 'https://smven.com/backup-engineering',
      key: 'backup-engineering',
      filename: 'backup-engineering.html',
    },
  ];

  console.log('[generate-routes] Generating route-specific HTML files for SEO canonicals...');

  for (const route of routes) {
    const data = programsContent[route.key] || {};
    const title = data.meta?.title || `${data.shortTitle || 'IT Engineering'} Training | SMVEN`;
    const description = data.meta?.description || `Master ${data.shortTitle || 'IT engineering'} with SMVEN.`;

    const pageHtml = buildPageHtml(baseHtml, {
      canonicalUrl: route.canonicalUrl,
      title,
      description,
      noindex: false,
    });

    const targetPath = path.resolve(distDir, route.filename);
    fs.writeFileSync(targetPath, pageHtml, 'utf8');
    console.log(`[generate-routes] Wrote ${route.filename} (canonical: ${route.canonicalUrl})`);
  }

  // Generate fallback.html for private transactional routes and general SPA fallback
  const fallbackHtml = buildPageHtml(baseHtml, {
    canonicalUrl: null,
    title: 'SMVEN',
    description: null,
    noindex: true,
  });

  const fallbackPath = path.resolve(distDir, 'fallback.html');
  fs.writeFileSync(fallbackPath, fallbackHtml, 'utf8');
  console.log(`[generate-routes] Wrote fallback.html (noindex, no canonical)`);

  console.log('[generate-routes] Done generating all route files.');
}

// Vite plugin wrapper
export function generateRouteHtmlPlugin() {
  return {
    name: 'vite-plugin-generate-route-html',
    apply: 'build',
    closeBundle() {
      generateRoutes();
    },
  };
}

// If executed directly via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    generateRoutes();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
