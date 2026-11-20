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

## Images

All images live in `images/`. Figures come from Figure 1 of each paper (Figure 2 for the ICPS paper). The hero photos come from the papers' hardware figures.

| File | Where it appears |
|---|---|
| `profile.webp` | Headshot |
| `hero-cotransport.webp`, `hero-go2.webp`, `hero-tray.webp` | Photo grid at the top |
| `fig-mutual.webp` | IROS 2026 project |
| `fig-darc.webp` | DARC (Electronics 2025) project |
| `fig-da-mpc.webp` | IROS 2025 project |
| `fig-hua-mpc.webp` | ICPS 2024 project |
| `fig-ctcs.webp` | Contact as a Decision Variable (ICRA 2027, under review) |
| `fig-llm.webp` | Geometry-Aligned LLM Fine-Tuning (ICRA 2027, under review) |

To swap a picture, upload a new file with the same name. Visitors can click any project figure to see it full size.

## Interactive demos

The three demos in the Research section and the other page interactions live in `assets/site.js` (plain JavaScript, no libraries). Each demo only animates while it's on screen, and visitors with "reduce motion" turned on get static frames.

- **Co-transportation** (`demoMutual`): the robot leads until its stubbornness estimate passes the threshold, then follows. Visitors drag to steer the person.
- **Support contact** (`demoContact`): a toy tipping model. The force limits are illustrative (`LIMIT` near the top of that function).
- **Narrow openings** (`NARROW`): waypoint plans for the bar. Every plan is checked against the walls, so a new plan's outcome is computed, not scripted.

## Common edits (all in `index.html`)

- **Add your email:** search for `Add your email` and uncomment the line under it.
- **Add a news item:** copy a `<li>` in the News list. Add `class="older"` to items you want hidden behind "Show older news".
- **Add a project:** copy one `<article class="project">...</article>` block and change the text, links, and image name. The highlighted line (`class="result"`) is for the headline result.
- **Change colors:** edit the variables at the top of the `<style>` block (`--teal`, `--amber`, and so on).

## Optional: custom domain

If you later buy a domain (for example `jabermahmud.com`), add it under **Settings → Pages → Custom domain** and follow GitHub's DNS instructions.
