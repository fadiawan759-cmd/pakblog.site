# Pakblog 5.0 — Real News/CMS Architecture

## What changed
Pakblog 5.0 uses a server-rendered article/newsroom architecture instead of depending on browser-side Firestore reads for the public homepage and categories.

Publishing flow:

**Admin → Firebase → Netlify server functions → Homepage / Category / Article / Search / Sitemap / RSS**

## Required Netlify environment variable

Add this on the **public Pakblog Netlify site**:

`FIREBASE_SERVICE_ACCOUNT_JSON`

Value: the complete Firebase Admin service-account JSON for the same Firebase project used by Pakblog.

`GOOGLE_SERVICE_ACCOUNT_JSON` is accepted as an alternative name.

Do not put this JSON in `config.js`, `app.js`, HTML, or any public file.

## Deploy

1. Upload/deploy the contents of this package as the **public Pakblog site**.
2. Set `FIREBASE_SERVICE_ACCOUNT_JSON` in Netlify site environment variables.
3. Trigger a fresh production deploy.
4. Open:
   - `/api/health` — should return `{"ok":true,...}`
   - `/` — should show published Firebase articles server-side
   - `/sitemap.xml` — should include published article URLs
   - `/rss.xml` — should contain recent published stories
   - `/news/<slug>` — should render an article directly from Firebase
5. Keep the existing admin deployment. It can continue publishing to the same `articles` collection.

## Public Firestore rules

The public site no longer needs public Firestore reads for homepage/category/search. Keep Firestore locked down appropriately; the Netlify server uses the Admin SDK service account.

## Existing data

This package does not delete or migrate your existing Firebase articles. It reads the existing `articles` collection and supports the current fields used by Pakblog, including `slug`, `title`, `content`, `excerpt`, `category`, `author`, `imageURL`, `publishedAt`, `createdAt`, `status`, and `htmlFilePath`.

## Automatic article behavior

After an admin publishes an article:

- it appears on the server-rendered homepage
- it appears in its category
- `/news/<slug>` renders it
- sitemap includes it
- RSS includes it
- search API can find it

The public site does not require creating an HTML page for each article.
