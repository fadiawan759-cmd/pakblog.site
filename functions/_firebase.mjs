import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export function getFirebaseApp() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!raw) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON Netlify environment variable');
    const credentials = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || credentials.storage_bucket || `${credentials.project_id}.appspot.com`;
    initializeApp({ credential: cert(credentials), storageBucket });
  }
  return getApps()[0];
}

export function getDb() { getFirebaseApp(); return getFirestore(); }
export function getBucket() { getFirebaseApp(); return getStorage().bucket(); }

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function safeArticleHtml(value = '') {
  let html = String(value);
  // If an uploaded file is a complete HTML document, use only its body.
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) html = bodyMatch[1];
  // Remove document-level and executable elements.
  html = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<base[^>]*>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/\s(?:on[a-z]+|srcdoc)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(?:href|src|action)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, '')
    .replace(/(?:href|src|action)\s*=\s*(["'])\s*data:text\/html[\s\S]*?\1/gi, '')
    .replace(/<html[^>]*>|<\/html>|<head[^>]*>|<\/head>|<body[^>]*>|<\/body>/gi, '')
    .trim();
  return html;
}

export function slugify(value = 'article') {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120) || 'article';
}

export function dateValue(v) {
  if (!v) return new Date();
  if (v.toDate) return v.toDate();
  if (v._seconds) return new Date(v._seconds * 1000);
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}
