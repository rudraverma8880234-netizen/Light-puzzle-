# LUMEN // PARADOX — Canvas 2D PWA

## Run
Because ES modules and the Service Worker require HTTP, do not open index.html with file://.

### GitHub Pages
1. Create a repository.
2. Upload all files.
3. Settings → Pages → Deploy from branch → main / root.
4. Open the GitHub Pages URL on Android.
5. Browser menu → Install app / Add to Home screen.

## Architecture
- `src/engine.js` — raycasting, reflections, interaction and rendering
- `src/levels.js` — 100 data-driven level definitions
- `src/main.js` — UI, progress and PWA bootstrap
- `src/style.css` — mobile-first UI
- `service-worker.js` — offline cache

## Important
The 100 levels are deterministic data definitions and the engine is ready for hand-authored production puzzle tuning. The current generated layouts are a development baseline; achieving an exact real-world retention target or proving an “IQ 160” requirement requires playtesting and analytics rather than a code setting.
