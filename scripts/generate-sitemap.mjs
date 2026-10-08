import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const base = String(process.env.PAKBLOG_BASE_URL || 'https://pakblog.site').replace(/\/$/, '');
const excluded = new Set([
  '404.html', '500.html', 'offline.html', 'maintenance.html',
  'admin.html', 'login.html'
]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.github', 'reports', 'backup', 'functions'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const urls = new Set(['/']);
for (const file of walk(root).filter(f => f.endsWith('.html'))) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  const name = path.basename(rel);
  if (excluded.has(name)) continue;

  let urlPath;
  if (name === 'index.html') {
    const dir = path.dirname(rel);
    urlPath = dir === '.' ? '/' : `/${dir}/`;
  } else {
    urlPath = `/${rel}`;
  }
  urls.add(urlPath);
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...[...urls].sort().map(p => `  <url><loc>${base}${p.replaceAll('&','&amp;')}</loc></url>`),
  '</urlset>',
  ''
].join('\n');

fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);
console.log(`Generated sitemap.xml with ${urls.size} URLs.`);
