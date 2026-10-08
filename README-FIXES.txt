PAKBLOG 4.2 — FIREBASE ARTICLE VISIBILITY + NEW LOGO

This build fixes a key data-compatibility problem: older Firebase article documents may not have createdAt. The old admin/public code used orderBy(createdAt), which silently excluded those documents. 4.2 reads the full articles collection for the newsroom/admin and normalizes createdAt/publishedAt/date/timestamp/updatedAt for sorting. Public home/search/category functions use the same compatibility strategy.

It also replaces the old white PakBlog image logo with logo.svg, updates the service worker cache to v5, and bumps frontend asset versions to v42 to prevent stale mobile caches.

Deploy the website folder contents to the Pakblog Netlify site. Keep FIREBASE_SERVICE_ACCOUNT_JSON in Netlify environment variables for server-side functions.

Admin 2.1 uses the same Firebase project and collection and reads all article documents, including legacy documents missing createdAt.
