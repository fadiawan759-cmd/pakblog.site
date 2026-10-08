PAKBLOG 4.3 PUBLIC FIX

This build fixes the public homepage error where "Could not load stories" appeared.

Root cause fixed:
- The frontend requested /api/home and /api/search.
- The Netlify redirects did not map those routes to the Functions.
- Browser Firestore fallback can fail when public Firestore reads are restricted.

Fixes included:
- /api/home -> /.netlify/functions/home
- /api/search -> /.netlify/functions/search
- /api/share -> /.netlify/functions/share
- Explicit function paths for home/search
- Cache-busting version 43

IMPORTANT:
Netlify Functions require FIREBASE_SERVICE_ACCOUNT_JSON (or GOOGLE_SERVICE_ACCOUNT_JSON) in the site's environment variables.
