import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const errors = [];
const warnings = [];

const required = [
  'article.html', 'search.html', 'category.legacy.html',
  'style.css', 'app.js', 'netlify.toml', 'firebase.json',
  'firestore.rules', 'storage.rules', 'robots.txt', 'sitemap.xml',
  'functions/_site.mjs', 'functions/_firebase.mjs'
];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing required file: ${file}`);
}

function checkJson(file) {
  try { JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')); }
  catch (e) { errors.push(`Invalid JSON: ${file} — ${e.message}`); }
}
for (const file of ['package.json', 'firebase.json', 'manifest.json', 'site.webmanifest', 'PAKBLOG-AUTOMATION-MANIFEST.json']) {
  if (fs.existsSync(path.join(root, file))) checkJson(file);
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.netlify'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const functionFiles = fs.existsSync(path.join(root, 'functions'))
  ? walk(path.join(root, 'functions')).filter(f => f.endsWith('.mjs') || f.endsWith('.js'))
  : [];

for (const file of functionFiles) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (e) {
    errors.push(`JavaScript syntax error: ${path.relative(root, file)}\n${e.stdout?.toString() || ''}${e.stderr?.toString() || ''}`);
  }
}

const htmlFiles = walk(root).filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (!/<html\b/i.test(html)) warnings.push(`HTML document has no <html> element: ${path.relative(root, file)}`);
  if (!/<meta[^>]+charset=/i.test(html)) warnings.push(`HTML document has no explicit charset: ${path.relative(root, file)}`);
}

if (fs.existsSync(path.join(root, 'netlify.toml'))) {
  const netlify = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8');
  if (!/publish\s*=\s*"\."/i.test(netlify)) warnings.push('netlify.toml does not publish the repository root.');
  if (!/functions\s*=\s*"functions"/i.test(netlify)) warnings.push('netlify.toml does not point functions to ./functions.');
}

console.log(`Checked ${required.length} required files, ${functionFiles.length} server JS files, and ${htmlFiles.length} HTML files.`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
console.log('Pakblog project validation passed.');
