# CLAUDE.md - paluwagan-website

Context for Claude Code working in this repo. Read before editing.

## What this is
The PUBLIC marketing site for **paluwagan.kabuhayan.app** - the landing/marketing pages for
Paluwagan (a rotating savings-circle / ROSCA app). This is a SEPARATE codebase from the Paluwagan
APP (`kabuhayan-paluwagan-local`, the Next.js product members log into). Locked decision: the website
is built and deployed INDEPENDENTLY with its own repo/stack/deploy. Do not merge app concerns here.

## Stack (important)
- Plain static HTML + CSS + JS. NO framework, NO build step, NO bundler, NO npm install.
- Each `.html` page is SELF-CONTAINED: the design-system CSS and the site JS are inlined into every
  page, so a page renders correctly opened on its own AND when deployed. `assets/ds.css`,
  `assets/site.css`, `assets/site.js` are reference/edit copies; the pages do not link them.
- If you change shared CSS/JS, update it in BOTH the inline copy in the pages and the `assets/` file
  (or regenerate). Do not reintroduce external `<link>`/`<script src>` to those assets - it breaks
  standalone rendering (this was a real bug).

## Pages
- `index.html` (Landing), `transparency.html`, `faq.html`, `contact.html` -> indexable
- `terms.html`, `privacy.html`, `responsible-use.html` -> shipped with `<meta robots="noindex">`
  (they self-label "draft, pending legal review"; remove that line only when counsel clears them)

## Repo layout
The site lives at the repo ROOT (flattened; Vercel Root Directory is `.`). All pages, `assets/`,
`favicon.svg`, and `.gitattributes` sit at root.

## Deploy
GitHub `main` -> Vercel auto-deploys. Framework preset "Other", no build command, output = root.
Domain `paluwagan.kabuhayan.app` is attached in Vercel; DNS (CNAME) lives in Cloudflare.
Workflow: edit in VS Code -> commit -> push `main` -> Vercel redeploys. No GitHub web uploads.

## Supabase integration
- Project (STAGING): `smealzfktgtyrxdhjued`. (No separate website prod project yet - decision pending.)
- Forms POST via PostgREST to two insert-only tables:
  - `paluwagan_web_waitlist` (email, source in landing_hero|landing_bottom)
  - `paluwagan_web_contact` (name, email, message)
- RLS: anon/authenticated can INSERT only; NO read access (the email list stays private). Email format
  checked by a DB CHECK constraint; waitlist email is unique (dedupe). Client uses `Prefer: return=minimal`.
- The **publishable/anon** key is embedded in each page's inline `<script>` (config object `PALUWAGAN`).
  It is public-safe by design; RLS enforces security. NEVER put the `service_role` key in these files.
- New signups/contact messages email `paluwagan@kabuhayan.app` automatically via a Postgres trigger
  (`notify_web_signup`) that calls Resend (`net.http_post`). The Resend key lives ONLY in that DB
  function server-side; never place it in client files. "From" address is `notify@kabuhayan.app`
  (Resend send-only; there is no such mailbox and none is needed).

## Conventions (carry from the Kabuhayan family)
- Authored files: ASCII-clean, LF endings, no BOM, ZERO em-dash/en-dash. Non-ASCII glyphs via
  `String.fromCharCode` / `String.fromCodePoint`, never `\uXXXX` literals.
- Mobile-first. Samsung A35 (~412px) is the primary test device. Every layout declares mobile behavior.
- Accessibility + SEO are first-class here (public page): semantic HTML, alt text, contrast, per-page
  title/description/canonical, OG + Twitter tags, JSON-LD, sitemap.xml, robots.txt. Keep them intact.
- Probe before edit against the literal source, not memory.

## Claim-safety governance (HIGH scrutiny - this is a pre-launch, counsel-gated financial product)
- All user-facing copy is operator/counsel-vetted, DO-NOT-INVENT. Do not add or soften claims.
- Firewall (must hold in all copy): savings circle, NOT an investment; zero return shown plainly;
  the app records/verifies, never holds or moves money; invite-only; 3-15 member cap; KYC + Data
  Privacy Act discipline; launch gated on counsel sign-off.
- If a change would imply returns/yield/profit/investment/lender status, STOP and flag it.

## Open go-live items (operator decisions, not build blockers)
- Testimonials consent (named quotes on the Landing).
- Whether the draft legal pages come off `noindex`.
- Staging vs production Supabase target before a hard launch.
- Self-host DM Sans woff2 (currently Google Fonts @import) for DPA/privacy, optional.
- Swap placeholder `favicon.svg` and the inline SVG logo lockup for the official brand-folder
  assets once they are added to the repo.

## Recent maintenance (2026-07)
Full mobile / SEO / a11y audit worked off. Current-state facts for the next session:
- Header "Join the waitlist" CTA removed (it was a redundant same-page anchor). Mobile nav is a
  hamburger icon with Esc-close, click-outside-close, and close-on-link (injected by site.js).
- `favicon.svg` added at root (placeholder brand mark; official swap pending, see open items).
- `privacy.html` now discloses waitlist/contact collection (DPA); stray `privacy (1).html` removed.
- FAQ group-size copy reconciled to the 3-15 member cap (accordion + JSON-LD).
- Line endings pinned to LF via `.gitattributes` (blobs were already LF).
- Discipline reminder: run ONE Window A lane; serialize any briefs that share a file (two
  concurrent same-file A-lane edits caused avoidable races this session).
