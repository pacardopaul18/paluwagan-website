# paluwagan-web

Public marketing site for paluwagan.kabuhayan.app. Pure static HTML/CSS/JS, no build step.
Each .html is SELF-CONTAINED (design-system CSS + JS inlined) so it renders AND its forms/FAQ work
whether opened on its own or deployed. assets/ds.css, site.css, site.js are kept for editing only.

## Pages
- index.html (Landing), transparency.html, faq.html, contact.html  -> indexable
- terms.html, privacy.html, responsible-use.html  -> <meta robots="noindex"> (self-labelled draft; delete that line to publish)

## Forms are wired to Supabase (Paluwagan staging: smealzfktgtyrxdhjued)
Two insert-only capture tables (public, outside the tenant model, reads locked so the list stays private):
  - paluwagan_web_waitlist (email, source in landing_hero|landing_bottom)
  - paluwagan_web_contact  (name, email, message)
Verified on staging: anon can INSERT, anon CANNOT read, malformed email rejected by CHECK constraint.

### Anon key: ALREADY SET
The publishable/anon key for smealzfktgtyrxdhjued is baked into every page's inline <script>.
Forms POST live to Supabase now. To rotate the key later, find-and-replace the current key across *.html.
Anti-abuse in place: honeypot field + DB email-format check + dedupe on waitlist email. Add Cloudflare
Turnstile later for stronger bot protection if volume warrants.

Rollback (removes both tables):
  drop table if exists public.paluwagan_web_waitlist;
  drop table if exists public.paluwagan_web_contact;

NOTE: this is the STAGING project. Decide a production Supabase target before pointing the live domain.

## Deploy
Any static host. Vercel: preset "Other", no build command, output dir ".". Point the
paluwagan.kabuhayan.app CNAME at it. No server runtime -> Next 14->16 advisories don't apply.

## Still yours (claim map) - all tie to going PUBLIC, not to the build
Testimonials consent, FAQ "larger barangay group" vs 3-15 cap, publishing draft legal pages,
regulatory identifiers, paluwagan@ vs support@ email, and the DPA notice that must cover the
waitlist/contact collection before the forms go live to the public.

## Fonts
DM Sans via Google Fonts @import; self-host woff2 later for DPA/privacy (system-ui fallback set).
