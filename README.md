# RingCentral tradeshow demo (iPad kiosk)

A static, installable web app: questionnaire → recommended products carousel → product detail.
Built from the Figma file "RC Demos" (node 6002-4963). No build step, no dependencies.

## Files
- `content.js` – all copy, products, plans, and the recommendation scoring. Most content edits happen here.
- `styles.css` – layout and design tokens (colors and fonts at the top). Authored in Figma pixels on a 1440px stage.
- `app.js` – screens, carousel, layered scroll on the detail page, idle reset, offline/update logic.
- `sw.js` – offline cache. Its `VERSION` is stamped with the commit SHA on every deploy.
- `assets/` – images, icons, and fonts exported from Figma.

## How updates reach the iPad
Push to `main` → GitHub Actions deploys to Pages and stamps a new version into `sw.js`.
The installed app checks for a new version every 5 minutes (and whenever it's opened). It downloads
in the background and switches over the next time the kiosk resets to the start screen, so a visitor
never gets interrupted mid-demo.

## iPad setup
1. Open the Pages URL in Safari, tap Share → **Add to Home Screen**. Launch it from the home screen icon (full screen, no browser bars).
2. Settings → Display & Brightness → Auto-Lock → **Never**.
3. Settings → Accessibility → **Guided Access** → on. Open the app, triple-click the top (or home) button, start Guided Access. This locks the iPad to the app.
4. Let it run online once so everything is cached. After that it works without Wi-Fi.

## Kiosk behavior
- After 90 seconds without a touch, a 15-second "Still exploring?" countdown appears, then the app resets to the questionnaire.
- Refresh: tap the RingCentral logo on the start screen. It grabs any new version and reloads (works offline too).
- Staff menu: press and hold the logo for 3 seconds. Shows the version, checks for updates, or force-reloads.
- Status bar: iPadOS always shows the clock and battery over home-screen web apps. To hide it, run the URL in a kiosk browser app such as Kiosk Pro, or mask the top edge with the booth cutout.

## Local preview
`python3 -m http.server 8000` then open http://localhost:8000.

## Swapping in the RingCentral brand fonts
The design uses RingCentral Sans / RingCentral Display. DM Sans is the stand-in. To use the real fonts,
add the `.woff2` files to `assets/fonts/`, add `@font-face` rules named "RingCentral Sans" and
"RingCentral Display" at the top of `styles.css`, and add the files to the list in `sw.js`.
