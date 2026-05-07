# GahkiWeb

Static marketing site for **Gahki** — the pocket POS for India's small shops.

## What's inside

| File | Purpose |
|------|---------|
| [index.html](index.html) | Single-page landing site |
| [assets/styles.css](assets/styles.css) | Design system, layout, animations |
| [assets/app.js](assets/app.js) | Reveal-on-scroll, counters, slug typer, interactive bill demo, waitlist form, parallax |
| [assets/favicon.svg](assets/favicon.svg) | Brand mark |

No build step, no dependencies — just open `index.html` in a browser.

## Design highlights

- Dark UI with electric-blue → mint gradients matching the app palette (`#1565c0` → `#7cf5c8`)
- Animated hero with a phone mockup, scanning barcode, printing receipt and floating order/stock cards
- Bento-grid feature section with a typewriter `shop.gahki.in/your-shop` slug
- Dual-app showcase (POS ↔ Store) with a live "shared stock" pulse bridge
- Interactive bill demo — click any product, watch the tax-inclusive bill build
- Three-tier pricing, comparison strip, FAQ accordion, waitlist CTA
- Fully responsive (mobile, tablet, desktop), respects `prefers-reduced-motion`

## Run locally

Any static file server works. From this folder:

```powershell
# Option 1 — Node
npx serve .

# Option 2 — Python
python -m http.server 5200

# Option 3 — VS Code "Live Server" extension
```

Then visit `http://localhost:<port>`.

## Deploy

Drop the contents of `GahkiWeb/` onto any static host:

- **GitHub Pages** — point Pages at this folder (or a `gh-pages` branch built from it)
- **Azure Static Web Apps** — `app_location: GahkiWeb`, no `output_location` needed
- **Cloudflare Pages / Netlify / Vercel** — set the publish directory to `GahkiWeb`

## Customization quick-reference

All colors live as CSS custom properties at the top of [assets/styles.css](assets/styles.css#L8-L31):

```css
--primary: #4ea0ff;
--primary-2: #7cf5c8;
--accent: #ffb547;
--grad-cool: linear-gradient(135deg, #7cf5c8 0%, #4ea0ff 60%, #8b5cf6 100%);
```

Demo product list is defined inline in [index.html](index.html) inside `.demo__products` — just add another `<button class="demo__product" data-name="..." data-price="...">`.
