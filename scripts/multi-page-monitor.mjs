const base = String(process.env.PAKBLOG_BASE_URL || 'https://pakblog.site').replace(/\/$/, '');
const timeoutMs = 15000;

const pages = [
  '/', '/article.html', '/search.html', '/category.legacy.html',
  '/robots.txt', '/sitemap.xml', '/manifest.json', '/site.webmanifest',
  '/rss.xml', '/api/health'
];

const results = [];
let failed = false;

for (const pathname of pages) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const response = await fetch(base + pathname, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'Pakblog-Multi-Page-Monitor/1.0' }
    });
    results.push({
      path: pathname,
      status: response.status,
      ok: response.ok,
      ms: Date.now() - started
    });
    if (!response.ok) failed = true;
  } catch (error) {
    results.push({
      path: pathname,
      status: 0,
      ok: false,
      error: error.name === 'AbortError' ? 'timeout' : error.message
    });
    failed = true;
  } finally {
    clearTimeout(timer);
  }
}

const fs = await import('node:fs');
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/page-monitor.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  baseUrl: base,
  results,
  status: failed ? 'failed' : 'pass'
}, null, 2));

console.table(results);
if (failed) process.exit(1);
