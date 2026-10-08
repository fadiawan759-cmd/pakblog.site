# Pakblog Next Public Automation

Adds a second GitHub Actions check for `https://pakblog.site`.

It crawls up to 120 same-origin pages and checks:
- broken/failed pages
- missing `<title>`
- missing canonical
- missing JSON-LD
- invalid JSON-LD

It is read-only: no Firebase, AI keys, publishing, or repository writes.

Upload these exact executable paths:
```text
.github/workflows/pakblog-links-schema.yml
scripts/link-schema-audit.mjs
```

The README and manifest are optional.

Schedule: every 12 hours (`43 */12 * * *`), plus push, pull request, and manual runs.
