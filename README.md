# Rippy_VT GitHub Pages Site

A static, no-build website for Rippy_VT. It uses plain HTML, CSS and JavaScript, so it can be hosted directly on GitHub Pages.

## Publish on GitHub Pages

1. Create a new GitHub repository (for example `rippy-vt-site`).
2. Upload **all files and folders in this package** to the repository root.
3. Commit the files to the `main` branch.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select `main` and `/ (root)`, then Save.
7. After GitHub publishes the site, open the Pages URL.

The Twitch player builds its required `parent=` parameter from the live hostname automatically, so it works on the GitHub Pages domain and will continue working if you later use a custom domain.

## Twitch feed behavior

The `WATCH` tab embeds the live `rippy_vt` Twitch channel using Twitch's official player. No API token is needed for the live player.

An automatically updating grid of recent VOD thumbnails is **not** included because Twitch's Videos API requires API credentials. The site links directly to the Twitch Videos page instead. A future version can add an auto-updating VOD/clip grid using a small serverless backend or Twitch API integration.

## Easy edits

- Social URLs: edit the links in `index.html`.
- Partnership stats: edit the four cards in the `PARTNERS` section of `index.html`.
- Gallery items: put new images in `assets/gallery/`, then add their paths to the `gallery` array in `script.js`.
- Main colors: edit the variables at the top of `styles.css`.
- Bio/text: edit directly in `index.html`.

## Before public launch

Add artist names and portfolio/social links for commissioned artwork where applicable.
