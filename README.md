# Mia

Bilingual static site for a Hong Kong credit-card comparison and information project. Traditional Chinese is the default. Simplified Chinese is the second language. The site is meant to be reviewed by affiliate partners before any live card terms exist.

Production URL, once GitHub Pages is enabled and `main` has deployed:

https://16ivanlam16-ai.github.io/mia/

## Turn on GitHub Pages

This repository cannot switch the Pages setting on by itself. After this project is on `main`:

1. Open **Settings → Pages → Build and deployment**.
2. Set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. If GitHub Actions is missing from the list, merge the workflow first, then refresh the settings page.
4. Pushing to `main` runs `.github/workflows/pages.yml`. The first successful run publishes the site.
5. The workflow uses the `github-pages` environment. The job summary shows the Pages URL.

Pull requests run `.github/workflows/ci.yml` (typecheck, content checks, and production build) and do not deploy.

A custom domain later means setting `SITE_URL` to that origin and `BASE_PATH` to `/`, then rebuilding. Do not add a `CNAME` file until the domain is real.

## Placeholder versus ready

| Area | State |
| --- | --- |
| Bilingual pages, navigation, hreflang, sitemap, Open Graph | Ready |
| Comparison table, filters, and card pages | Ready as a structure. Every fee, rate, income figure, welcome offer, and apply URL is blank |
| Guide outlines | Ready as outlines. Body copy is marked 文案佔位 / 文案占位 for marketing to replace |
| About voice | Marked as placeholder copy |
| Claim tracker | Ready. Five fake `MIA-SAMPLE-` records, amounts blank |
| `/go/` click redirect | Ready. Records the click in the browser. No outbound URL until the matrix has one |
| Privacy, terms, affiliate disclosure, not-financial-advice | Drafts for partner review. Not lawyer-approved. Legal entity name is unset |
| Contact email | Unset (`src/data/site.json`) |
| Google Analytics and Search Console | Hooks only. No IDs are invented |

`待補` / `待补` means the cell is empty. It does not mean zero, and it is not a current promotion.

## Develop

Node 22.

```bash
npm install
npm run dev
```

Open http://localhost:4321/mia/zh-hant/ . The base path matches GitHub project Pages. `npm run check` typechecks and validates the data files. `npm run build` writes `dist/` and checks internal links.

## Card matrix

`src/data/cards.csv` is the matrix. Replace that file with a CSV export that keeps the same header row, then update `src/data/matrix-meta.json` (`version`, `updatedAt`, `sourceLabel`).

- `status=placeholder` must leave commercial columns blank. The build fails if a placeholder row contains a fee, rate, income, welcome text, apply URL, date, or a digit in its blurb.
- `status=published` needs `updated_at` (`YYYY-MM-DD`), source notes in both languages, and at least one term or an `https` apply URL.
- `audiences` and `highlights_*` use `|`.
- Amount columns are whole HKD with no currency symbol. Blank is not zero.
- Do not rename columns. A new column needs a small update in `src/lib/cards.ts` so a typo cannot drop a field silently.
- Known tags (`audiences`, `reward_type`, `network`) are listed in `src/lib/taxonomy.ts` and labelled in `src/i18n/`.

The table order is the file order. It is not a ranking and it is not sorted by commission.

## Claims

`src/data/claims.csv` uses the same columns a Google Sheet export should use. The public site embeds those rows because GitHub Pages has no database. Do not add name, phone, email, or ID columns. `applicant_alias` is a display label. Anyone who knows a reference can read that row.

Sample rows use `MIA-SAMPLE-` and `is_sample=true`, and they must leave `reward_amount_hkd` blank. `status_history` is `status@YYYY-MM-DD` joined by `|`. The last entry must match `status`.

## Clicks

Apply buttons go to `/go/{card-id}/?channel=site&post=compare&lang=zh-hant` (or `ig`, `xhs`, `partner`, plus a `post` token).

GitHub Pages cannot append a server log. The redirect page:

- appends to `localStorage` key `mia.outboundClicks` (latest 200)
- queues a GA4 event named `affiliate_outbound`
- `sendBeacon`s the same JSON as `text/plain` only when `PUBLIC_CLICK_WEBHOOK_URL` is an https URL at build time

The destination is the card’s `apply_url`. It is never taken from the query string. An empty URL stays on Mia and says the link is not enabled.

## Analytics and Search Console

Copy `.env.example`. In GitHub, add repository **Variables** (they are public once rendered), not secrets:

- `PUBLIC_GA_MEASUREMENT_ID` — GA4 id, shaped like `G-AB12CD34EF`
- `PUBLIC_GSC_VERIFICATION` — the Search Console meta tag `content` value only
- `PUBLIC_CLICK_WEBHOOK_URL` — optional https collector

Blank values ship nothing. Values that do not match the expected shape are ignored at build time. Do not commit a guessed ID.

## Content rules

Marketing copy replaces text marked 文案佔位 / 文案占位, plus the guide sections and card `summary_*` / `highlights_*` columns. Do not invent bank fees, earn rates, welcome offers, salary requirements, or interest rates. Do not put real customer data in this public repository.
