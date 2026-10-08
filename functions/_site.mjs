import { escapeHtml, dateValue, slugify, safeArticleHtml } from './_firebase.mjs';
export { escapeHtml, slugify };

export const SITE_URL = 'https://pakblog.site';
export const SITE_NAME = 'Pakblog';
export const GA_ID = 'G-XZ3MC3S9KS';
export const CATEGORIES = ['Pakistan','World','Politics','Business','Technology','Science & Health','Sports','Lifestyle','Entertainment','Education','Opinion'];
export const FALLBACK_IMAGE = `${SITE_URL}/news-placeholder.svg`;

export function articleSlug(a){ return slugify(a?.slug || a?.title || a?.id || 'article'); }
export function articleUrl(a){ return `${SITE_URL}/news/${encodeURIComponent(articleSlug(a))}`; }
export function imageUrl(a){ return a?.imageURL || a?.imageUrl || a?.heroImage || a?.heroImageUrl || a?.featuredImage || a?.coverImage || a?.thumbnail || a?.image || a?.photoUrl || FALLBACK_IMAGE; }
export function publishedDate(a){
  for(const k of ['publishedAt','createdAt','updatedAt','date','publishedDate','timestamp','created_date','created']){
    if(a?.[k] != null) return dateValue(a[k]);
  }
  return new Date();
}
export function formatDate(a){ return publishedDate(a).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}); }
export function isPublished(a){ return !a?.status || a.status === 'published'; }
export function normalizeCategory(value='News'){
  const raw=String(value||'News').trim();
  const key=raw.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-');
  const aliases={'science-health':'Science & Health','science':'Science & Health','health':'Science & Health'};
  if(aliases[key]) return aliases[key];
  return CATEGORIES.find(c=>c.toLowerCase()===raw.toLowerCase()) || raw || 'News';
}
export function readingTime(a){
  const text=String(a?.content||a?.body||'').replace(/<[^>]+>/g,' ').trim();
  return Math.max(1,Math.round(text.split(/\s+/).filter(Boolean).length/220));
}
export function wordCount(a){
  const text=String(a?.content||a?.body||'').replace(/<[^>]+>/g,' ').trim();
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}
export function articleDescription(a){
  const fallback=`Read the latest ${normalizeCategory(a?.category||'news').toLowerCase()} story from Pakblog, an independent digital newsroom covering Pakistan and the world.`;
  return String(a?.excerpt||fallback).replace(/\s+/g,' ').trim().slice(0,160);
}

const icon=(name)=>({
  search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 16 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  moon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.2A8.4 8.4 0 0 1 8.8 4a8.6 8.6 0 1 0 11.2 11.2Z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  menu:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
}[name]||'');

export function analyticsScript(extra=''){
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true});${extra}</script>`;
}

const nav=CATEGORIES.map(c=>`<a class="category-link" href="/category/${slugify(c)}">${escapeHtml(c)}</a>`).join('');

export function pageShell({title='Pakblog — News, Analysis & Stories',description='Independent news, analysis and stories from Pakistan and around the world.',canonical=SITE_URL,body='',jsonLd=null,activeCategory='',ogImage=FALLBACK_IMAGE}={}){
  const ld=jsonLd?`<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g,'\\u003c')}</script>`:'';
  const today=new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description).slice(0,160)}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<link rel="canonical" href="${escapeHtml(canonical)}"><link rel="alternate" type="application/rss+xml" title="Pakblog RSS" href="${SITE_URL}/rss.xml">
<meta property="og:type" content="website"><meta property="og:site_name" content="${SITE_NAME}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${escapeHtml(ogImage)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${escapeHtml(ogImage)}">
<meta name="theme-color" content="#f4f0e8"><link rel="icon" href="/favicon.ico"><link rel="manifest" href="/site.webmanifest"><link rel="stylesheet" href="/style.css?v=90">${ld}</head><body>
<div class="reading-bar" id="readingBar"></div><div class="utility-bar"><div class="wrap utility-inner"><span class="utility-brand">PAKBLOG</span><span>INDEPENDENT DIGITAL NEWSROOM</span><span>${escapeHtml(today)}</span></div></div>
<header class="masthead" id="masthead"><div class="wrap mast-row"><a class="brand" href="/" aria-label="Pakblog home"><img class="logo-dark" src="/logo.svg" alt="Pakblog"><img class="logo-light" src="/logo-light.svg" alt="Pakblog"></a><div class="mast-note">NEWS · ANALYSIS · STORIES</div><div class="mast-actions"><a class="header-link" href="/search">${icon('search')}<span>Search</span></a><button class="theme-btn" id="themeBtn" aria-label="Toggle theme">${icon('moon')}</button><button class="menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false">${icon('menu')}</button></div></div></header>
<nav class="category-bar" aria-label="Primary sections"><div class="wrap category-scroll"><a class="category-link ${!activeCategory?'active':''}" href="/">Home</a><a class="category-link" href="/latest">Latest</a>${nav}</div></nav>
<div class="mobile-drawer" id="drawer" aria-hidden="true"><button class="drawer-close" id="drawerClose" aria-label="Close menu">×</button><div class="drawer-brand"><img class="logo-dark" src="/logo.svg" alt="Pakblog"><img class="logo-light" src="/logo-light.svg" alt="Pakblog"></div><p class="drawer-intro">Independent digital news, analysis and stories.</p><div class="drawer-grid drawer-grid-featured"><a class="drawer-link drawer-link-primary" href="/">Home</a><a class="drawer-link drawer-link-primary" href="/latest">Latest</a></div><div class="drawer-grid">${CATEGORIES.map(c=>`<a class="drawer-link" href="/category/${slugify(c)}">${escapeHtml(c)}</a>`).join('')}</div><div class="drawer-more"><a href="/search">Search</a><a href="/about">About</a><a href="/contact">Contact</a><a href="/rss.xml">RSS</a></div></div><div class="drawer-overlay" id="drawerOverlay"></div>
<main>${body}</main>
<footer class="footer"><div class="wrap footer-main"><div class="footer-brand"><a href="/" class="footer-brand-link"><img class="logo-dark" src="/logo.svg" alt="Pakblog"><img class="logo-light" src="/logo-light.svg" alt="Pakblog"></a><p>Independent digital news, analysis and stories from Pakistan and around the world.</p><div class="footer-social"><a href="/rss.xml">RSS</a><a href="/about">About</a><a href="/contact">Contact</a></div></div><div class="footer-col"><strong>Explore</strong><a href="/">Home</a><a href="/latest">Latest</a><a href="/search">Search</a><a href="/about">About</a></div><div class="footer-col"><strong>Sections</strong><a href="/category/pakistan">Pakistan</a><a href="/category/world">World</a><a href="/category/business">Business</a><a href="/category/technology">Technology</a><a href="/category/sports">Sports</a></div><div class="footer-col"><strong>More</strong><a href="/category/lifestyle">Lifestyle</a><a href="/category/entertainment">Entertainment</a><a href="/category/education">Education</a><a href="/category/opinion">Opinion</a></div><div class="footer-col"><strong>Legal</strong><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/disclaimer">Disclaimer</a><a href="/dmca">DMCA</a></div></div><div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} Pakblog</span><span>Independent digital newsroom</span><a href="/sitemap.xml">XML Sitemap</a></div></footer>
${analyticsScript()}<script src="/app.js?v=90" defer></script></body></html>`;
}

export function card(a,i=0){
  const url=articleUrl(a);
  return `<a class="story-card reveal" href="${escapeHtml(url)}" style="transition-delay:${i*35}ms"><div class="story-image"><img loading="lazy" decoding="async" src="${escapeHtml(imageUrl(a))}" alt="${escapeHtml(a.title||'Pakblog story')}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'"><span class="image-chip">${escapeHtml(normalizeCategory(a.category))}</span></div><div class="story-body"><div class="story-cat">${escapeHtml(normalizeCategory(a.category))}</div><h3 class="story-title">${escapeHtml(a.title||'Untitled story')}</h3><p class="story-excerpt">${escapeHtml(a.excerpt||articleDescription(a))}</p><div class="story-meta">${escapeHtml(a.author||'Pakblog Desk')} · ${escapeHtml(formatDate(a))} · ${readingTime(a)} min read</div></div></a>`;
}
export function pageMessage(title,text){return `<section class="wrap page-message"><div class="empty"><div class="section-kicker">PAKBLOG</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p><a class="hero-cta" href="/">Back to Pakblog</a></div></section>`}

export function organizationSchema(){
  return {'@context':'https://schema.org','@type':'NewsMediaOrganization','name':SITE_NAME,'url':SITE_URL,'logo':`${SITE_URL}/logo.svg`,'sameAs':[]};
}
export function websiteSchema(){
  return {'@context':'https://schema.org','@type':'WebSite','name':SITE_NAME,'url':SITE_URL,'potentialAction':{'@type':'SearchAction','target':`${SITE_URL}/search?q={search_term_string}`,'query-input':'required name=search_term_string'}};
}
