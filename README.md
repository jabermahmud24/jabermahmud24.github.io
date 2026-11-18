# jabermahmud24.github.io

Personal academic website of Al Jaber Mahmud. Plain HTML: no build step, no frameworks, free on GitHub Pages.

## Put it online (about 5 minutes)

1. Sign in to GitHub as **jabermahmud24**.
2. Create a new **public** repository named exactly `jabermahmud24.github.io`.
3. On the new repo's page, click **uploading an existing file**. Drag in `index.html`, `README.md`, `.nojekyll`, and the `images` folder. Click **Commit changes**.
   - `.nojekyll` is a hidden file. If you can't see it, you can skip it; the site still works.
4. Go to **Settings → Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, Branch **main**, folder **/ (root)**, then **Save**.
5. Wait 1–2 minutes, then open **https://jabermahmud24.github.io**.

Every later edit you commit (even from the GitHub web editor) goes live within a minute or two.

## Add your photos

Drop these files into the `images/` folder. Any you leave out show a line drawing instead.

| File | Where it appears |
|---|---|
| `profile.jpg` | Headshot (square works best) |
| `mutual-adaptation.jpg` | IROS 2026 project |
| `darc.jpg` | DARC (Electronics 2025) project |
| `da-mpc.jpg` | IROS 2025 project |
| `hua-mpc.jpg` | ICPS 2024 project |
| `ctcs.jpg` | Go2 + NERO support-contact project |
| `narrow-openings.jpg` | LLM narrow-opening planning project |

Landscape images around 16:10 (for example 800×500) fit the project cards best. A screenshot of the paper's first figure or a frame from a demo video works well.

## Common edits (all in `index.html`)

- **Add your email:** search for `Add your email` and uncomment the line under it.
- **Add a news item:** copy a `<li>` in the News list. Add `class="older"` to items you want hidden behind "Show older news".
- **Add a project:** copy one `<article class="paper">...</article>` block and change the text, links, and image name. Add a `Video` or `Code` link with `<a href="...">Video</a>` inside the `plinks` row.
- **Rename the demo videos:** search for `Demo 1`, `Demo 2`, `Demo 3` and give each a real caption (or move the link into its project card).
- **Change colors:** edit the variables at the top of the `<style>` block (`--teal`, `--amber`, and so on).

## Optional: custom domain

If you later buy a domain (for example `jabermahmud.com`), add it under **Settings → Pages → Custom domain** and follow GitHub's DNS instructions.
