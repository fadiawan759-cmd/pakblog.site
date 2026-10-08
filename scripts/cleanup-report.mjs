import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
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
const hashes = new Map();
const duplicates = [];

for (const file of files) {
  const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if (hashes.has(hash)) duplicates.push([hashes.get(hash), path.relative(root, file)]);
  else hashes.set(hash, path.relative(root, file));
}

const report = {
  generatedAt: new Date().toISOString(),
  duplicateFiles: duplicates,
  note: 'This is a report only. No files are deleted automatically.'
};

fs.writeFileSync(path.join(reportDir, 'cleanup-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
