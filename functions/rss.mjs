function toResponse(result) {
  if (result === undefined || result instanceof Response) return result;
  return new Response(result?.body ?? '', {
    status: result?.statusCode ?? 200,
    headers: result?.headers ?? {}
  });
}

import { getDb } from './_firebase.mjs';
import { SITE_URL, articleUrl, isPublished, publishedDate, escapeHtml } from './_site.mjs';

function buildRss(list) {
  const items = list.slice(0, 50).map((a) =>
    `<item><title>${escapeHtml(a.title || 'Untitled')}</title><link>${escapeHtml(articleUrl(a))}</link><guid isPermaLink="true">${escapeHtml(articleUrl(a))}</guid><description>${escapeHtml(a.excerpt || '')}</description><pubDate>${publishedDate(a).toUTCString()}</pubDate><category>${escapeHtml(a.category || 'News')}</category></item>`
  ).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Pakblog</title><link>${SITE_URL}</link><description>Latest news and stories from Pakblog.</description>${items}</channel></rss>`;
}

async function _handler() {
  const headers = {
    'content-type': 'application/rss+xml; charset=utf-8',
    'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'x-content-type-options': 'nosniff'
  };
  try {
    const snap = await getDb().collection('articles').get();
    const list = [];
    snap.forEach((d) => {
      const a = { id: d.id, ...d.data() };
      if (isPublished(a)) list.push(a);
    });
    list.sort((a, b) => publishedDate(b) - publishedDate(a));
    return { statusCode: 200, headers, body: buildRss(list) };
  } catch (e) {
    console.error('rss fallback:', e?.message || e);
    return { statusCode: 200, headers, body: buildRss([]) };
  }
}

export const config = { path: '/rss.xml' };
export default async (event, context) => toResponse(await _handler(event, context));
