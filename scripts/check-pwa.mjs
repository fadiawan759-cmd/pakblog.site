import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports');
fs.mkdirSync(reportDir, { recursive: true });

const candidates = [
  'manifest.json',
  'site.webmanifest',
  'service-worker.js',
  'sw.js',
  'service-worker/sw.js',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

const results = candidates.map(file => ({
  file,
  exists: fs.existsSync(path.join(root, file))
}));

const manifest = results.find(x => x.file === 'manifest.json')?.exists ||
                results.find(x => x.file === 'site.webmanifest')?.exists;
const worker = results.some(x => x.file === 'service-worker.js' || x.file === 'sw.js' || x.file === 'service-worker/sw.js');

const report = {
  generatedAt: new Date().toISOString(),
  manifestFound: Boolean(manifest),
  serviceWorkerFound: Boolean(worker),
  files: results,
  status: manifest && worker ? 'pass' : 'warning'
};

fs.writeFileSync(path.join(reportDir, 'pwa-report.json'), JSON.stringify(report, null, 2));

console.log(JSON.stringify(report, null, 2));
if (!manifest || !worker) {
  console.warn('PWA files are incomplete. Review the report.');
}
