# Publication Checklist

Use this as the final pre-submission audit. It should stay short enough to run under pressure.

## Verified Publication Requirements

- The folder owner has approved the product name, landing page, and live demo.
- Premium/VIP eligibility is documented as confirmed.
- A clean public repository exists.
- The public repository is not the Week 3 submission repo.
- The Kyanite VPS landing route is live at `https://unstuck.kyanitelabs.tech/`.
- The repository About homepage points to the landing page URL.
- `robots.txt`, `sitemap.xml`, and `llms.txt` are present in the public payload.
- The final public GitHub URL is inserted in `docs/judging/SUBMISSION.md`.
- The final public GitHub URL is rejected if it points at the old Week 3 repository.
- The final public GitHub URL is visible through unauthenticated GitHub API access.

## Final Checks

Run these from the public repository checkout:

```bash
node scripts/verify-public-bundle.mjs
node scripts/verify-publication-ready.mjs
node scripts/verify-github-public-url.mjs
node scripts/verify-final-privacy-scan.mjs
node scripts/final-review-smoke.mjs --expect-ready --skip-build
```

Expected green state:

- `verify-public-bundle.mjs` reports 84 required files, including the SEO/AEO/GEO discovery files.
- `verify-publication-ready.mjs` reports `status: "ready"`.
- `verify-github-public-url.mjs` proves the submitted repo is public.
- `verify-final-privacy-scan.mjs` reports zero private/local provenance leaks.
- `final-review-smoke.mjs --expect-ready --skip-build` reports `status: "pass"`.

## Operator Path

Validate the user-facing path in this order:

1. Open the GitHub repo.
2. Use the repo About homepage to reach the Kyanite landing page.
3. Open the live demo from the landing page.
4. Send a stuck prompt with the GLM chat.
5. Use Enter-to-send.
6. Use a starter chip.
7. Use speech-to-text, then send the inserted text.
8. Open the GitHub source only if more detail is needed.

The live demo should show `Z.AI GLM-5.1 (medium reasoning)`, return a real coach response, and keep the browser console free of errors.

## Staging Rule

Keep the reviewed source folder as the canonical build copy. Do not maintain two different `docs/judging/SUBMISSION.md` files.

If the source changes, stage the public repository with:

```bash
node scripts/stage-public-repo.mjs --target ../unstuck-coach --write --force --require-ready
```

The `--require-ready` flag is for final publication staging. It refuses to stage if the reviewed source folder still has the placeholder URL or fails `verify-publication-ready.mjs`.

After staging, run the final checks again inside the public repository.

## Skool Posting Shape

Post the final public GitHub link plus the 2-3 sentence draft from `docs/judging/SUBMISSION.md`.

Do not include local research notes, local browser artifacts, unpublished review-pack files, generated output folders, or unpublished repo history.
