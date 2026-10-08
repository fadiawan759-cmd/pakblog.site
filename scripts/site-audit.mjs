const base = String(process.env.PAKBLOG_BASE_URL || 'https://pakblog.site').replace(/\/$/, '');
const timeoutMs = Number(process.env.PAKBLOG_TIMEOUT_MS || 15000);

const paths = [
  '/',
  '/latest',
  '/search?q=Pakistan',
  '/category/technology',
  '/about',
  '/privacy',
  '/terms',
  '/contact',
  '/robots.txt',
  '/sitemap.xml',
  '/news-sitemap.xml',
  '/rss.xml',
  '/api/health'
];

const failures = [];
const results = [];

async function check(pathname) {
  const url = `${base}${pathname}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'Pakblog-Site-Audit/1.0' }
    });
    const text = await response.text();
    const ms = Date.now() - started;
    const contentType = response.headers.get('content-type') || '';
    const ok = response.ok;
    results.push({ path: pathname, status: response.status, ms, contentType });
    if (!ok) failures.push(`${pathname}: HTTP ${response.status}`);
    if ((pathname === '/sitemap.xml' || pathname === '/news-sitemap.xml') && !/xml/i.test(contentType)) failures.push(`${pathname}: unexpected content-type ${contentType}`);
    if (pathname === '/rss.xml' && !/xml/i.test(contentType)) failures.push(`${pathname}: unexpected content-type ${contentType}`);
    if (pathname === '/robots.txt' && !/text/i.test(contentType)) failures.push(`${pathname}: unexpected content-type ${contentType}`);
    if (pathname === '/sitemap.xml' && !text.includes('/news/')) console.warn('Sitemap currently contains no article URL; verify Firebase credentials and published articles.');
    if (pathname === '/api/health' && !text.includes('"service":"pakblog"')) failures.push(`${pathname}: health payload missing service marker`);
    if (pathname === '/' && !/Pakblog/i.test(text)) failures.push(`${pathname}: page does not contain Pakblog`);
  } catch (error) {
    failures.push(`${pathname}: ${error.name === 'AbortError' ? `timeout after ${timeoutMs}ms` : error.message}`);
  } finally {
    clearTimeout(timer);
  }
}

await Promise.all(paths.map(check));

console.table(results);
if (failures.length) {
  console.error('\nPakblog live audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`Pakblog live audit passed for ${paths.length} endpoints at ${base}.`);
