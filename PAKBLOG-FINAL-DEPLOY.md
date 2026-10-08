# Pakblog Final 5.1 — Production Deployment

This is the consolidated public Pakblog newsroom build.

## Required Netlify environment variable

`FIREBASE_SERVICE_ACCOUNT_JSON`

Set it on the public Pakblog Netlify site for **Functions/Runtime**. The value must be the complete Firebase Admin service-account JSON for the same `news-950` Firebase project used by the admin.

Do not put this JSON in `config.js`, `app.js`, HTML, Git, or any public asset.

## Deploy

1. Deploy the contents of this package to the **public Pakblog Netlify site**.
2. Keep the existing Firebase `articles` collection and existing admin deployment.
3. Trigger a fresh production deploy.
4. Test these URLs:
   - `/api/health`
   - `/`
   - `/category/technology`
   - `/news/<published-slug>`
   - `/search?q=pakistan`
   - `/sitemap.xml`
   - `/rss.xml`

`/api/health` should report `ok: true` and `firebase: true`.

## What this build fixes

- Clean newsroom homepage; no giant background Pakblog template.
- Working animated hamburger drawer on server-rendered pages.
- Category pages no longer depend on browser Firestore reads or fragile URL parsing.
- Homepage/category/article use the same Firebase Admin data source.
- Public API and server-rendered pages use `no-store` while publishing/editing, preventing stale deleted stories from lingering.
- Article lookup supports exact slug, document ID, and normalized slug/title fallback.
- Draft/unpublished stories are not exposed publicly.
- Uploaded HTML articles remain supported and sanitized server-side.
- Service worker does not cache homepage, category, article, API, sitemap, or RSS responses.
- Search API URL parsing is defensive.
- Article pages have the same responsive header, drawer, theme and motion system.
- Cache-busting is bumped to v52.

## Important

This package does not delete, migrate, or overwrite your existing Firebase articles. It only changes the public presentation and server-side retrieval layer.
