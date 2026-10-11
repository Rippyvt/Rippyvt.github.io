# Rippy_VT GitHub Pages Site — V2

A static, no-build website for Rippy_VT. It uses plain HTML, CSS and JavaScript and is designed for `https://rippyvt.github.io/`.

## What V2 adds

- Twitch player using Twitch's official interactive embed
- Online/offline status updates while the Watch page is open
- Stream schedule page with visitor-local time conversion
- Downloadable `.ics` recurring calendar schedule
- Filterable art gallery: commissions, model, emotes and archive
- Rippy mood/expression selector
- Character reference viewer
- Richer sponsorship / media-kit section
- Downloadable `Rippy_VT_Media_Kit.pdf`
- Audience country breakdown
- Business inquiry form that prepares an email without exposing API keys
- SEO / social sharing meta tags
- `robots.txt`, `sitemap.xml`, web manifest and custom 404 page
- Tiny Rippy easter egg + rotating INT-stat joke

## Update the live GitHub Pages site

1. Open the `Rippyvt/Rippyvt.github.io` repository.
2. Upload the contents of this folder to the repository root.
3. Replace the existing files when GitHub asks.
4. Commit directly to `main`.
5. GitHub Pages should redeploy automatically.
6. Hard refresh `https://rippyvt.github.io/` with `Ctrl + Shift + R` after the deployment turns green.

## Files that must stay at repository root

- `index.html`
- `styles.css`
- `script.js`
- `404.html`
- `Rippy_VT_Media_Kit.pdf`
- `rippy_schedule.ics`
- `site.webmanifest`
- `robots.txt`
- `sitemap.xml`
- `assets/`

## Easy things to update later

### Stream schedule
The visible schedule is in `index.html` and the local-time helper is in `script.js`.
The current configuration is Monday / Wednesday / Friday at 7:45 PM America/Los_Angeles.
If the schedule changes, also update `rippy_schedule.ics`.

### Sponsor statistics
Search `index.html` for:
- `3.2K+`
- `16`
- `398`
- `70%`

Also regenerate/update `Rippy_VT_Media_Kit.pdf` when those metrics materially change.

### Artist credits
Gallery entries live in the `gallery` array in `script.js`. Replace `Artist credit to add` with the artist name and, if desired, add an artist URL to the data structure before launch/portfolio use.

### Social links
Search `index.html` for the Socials section. Current links are Twitch, YouTube, TikTok, Instagram, X and `rippyvt@gmail.com`.

## Privacy / VTuber separation

Keep this repository on the separate Rippy GitHub account. Do not add your personal GitHub username, personal email, real name, employer/school info, or IRL photos to this repository. Keep GitHub's private/noreply commit email enabled on this account.

## Twitch embed note

The Watch page uses Twitch's official JavaScript player and automatically supplies the current hostname as Twitch's required `parent` value. The live/offline badge is driven by `Twitch.Player.ONLINE` and `Twitch.Player.OFFLINE` events after the Watch page loads.

## Business form note

Because GitHub Pages is static, the inquiry form creates a pre-filled email in the visitor's mail client instead of sending data through a backend. This keeps the site simple and avoids publishing API keys. A service such as Formspree can be added later if you want true form submission without opening an email app.
