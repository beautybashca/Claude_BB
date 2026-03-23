# Beauty Bash Website

Luxury mobile hair & makeup · Vancouver, BC · [beautybash.ca](https://beautybash.ca)

## Stack

- **Hosting:** Netlify (auto-deploys on every commit)
- **CMS:** Decap CMS — accessible at `/admin`
- **Instagram feed:** Behold.so embed
- **Forms:** Netlify Forms

## Quick reference

| Task | How |
|------|-----|
| Edit content | Go to beautybash.ca/admin |
| Add gallery photos | Upload to `images/gallery/` or via /admin |
| Update pricing | Edit `pricing.html` directly or via /admin |
| Check form submissions | netlify.com → Forms tab |
| Roll back the site | netlify.com → Deploys → select older deploy |

## Setup

See the full handoff document for step-by-step setup instructions covering GitHub, Netlify, the CMS, Instagram, and domain connection.

## File structure

```
index.html          ← Home
services.html       ← Services
gallery.html        ← Gallery
pricing.html        ← Pricing
about.html          ← About
contact.html        ← Contact + form
css/style.css       ← All styles (edit colours here)
js/main.js          ← Navigation, lightbox, form
admin/              ← Decap CMS
images/             ← All photos go here
_data/              ← CMS-managed content
```

## Updating social links

Search all HTML files for `hello@beautybash.ca`, `facebook.com/beautybash`, and `instagram.com/beautybash` and replace with the correct URLs.
