import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const base = String(process.env.PAKBLOG_BASE_URL || 'https://pakblog.site').replace(/\/$/, '');
const reportDir = path.join(root, 'reports');
fs.mkdirSync(reportDir, { recursive: true });

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.github', 'reports', 'backup'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(root);
const html = files.filter(f => f.endsWith('.html'));
const js = files.filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
const css = files.filter(f => f.endsWith('.css'));
const images = files.filter(f => /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(f));

const urls = [...new Set(
  html.map(f => {
    const rel = path.relative(root, f).split(path.sep).join('/');
    return rel === 'index.html' ? `${base}/` : `${base}/${rel}`;
  })
)].sort();

fs.writeFileSync(
  path.join(reportDir, 'site-statistics.json'),
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    baseUrl: base,
    counts: { totalFiles: files.length, html: html.length, javascript: js.length, css: css.length, images: images.length },
    pages: urls
  }, null, 2)
);

fs.writeFileSync(
  path.join(reportDir, 'google-search-console-urls.txt'),
  urls.join('\n') + '\n'
);

console.log(`Generated report for ${files.length} files and ${urls.length} public page URLs.`);
console.log('The URL list can be used with Google Search Console. GitHub cannot directly request indexing of arbitrary pages without the appropriate Google API access.');
