# Build log & issue tracker — rapidwhale27661

A working log of how the site was built and every bug or issue we ran into: what we saw, why it
happened, how it was fixed, and what's still open. `CHANGELOG.md` is the short "what shipped"
summary; this file keeps the details so the next person doesn't rediscover them.

**Adding to this file:** add a dated entry to the build log, and give every new problem an issue
number (`#I-nn`) in the tracker — even small ones. Update the status when it's fixed.

---

## Build log

### 2026-09-25 — Project setup and the first web component

- **Repository access** set up for the assistant (git permission in Settings → LLM Permissions).
- **Old code moved in:** `main` was replaced with the code from `keeneagle93325` (full history).
  The 3 original starter commits were kept locally as `backup/original-starter` (deleted on
  2026-09-28 at the user's request).
- **Content source fixed** — `fstab.yaml`, `paths.json`, `robots.txt`, `sitemap-index.xml` and doc
  titles still pointed at keeneagle93325; pointed at rapidwhale27661 (commit `bd04bce`, on `main`).
  → #I-02
- **XE Banner** built from a design screenshot as the first block on web components:
  `xe-banner`, `xe-banner-column`, `xe-button`, `xe-icon` — PR #1 (merged). → #I-04 … #I-07

### 2026-09-28 — Design system web components

- **Rules written down (PR #2):** web components required for new blocks; primitives → composite
  components → blocks with a reuse-first checklist; the Xcel design system (docs only, no code) is the
  source of truth; it wins over the old "Site Design Spec" for `xe-*` blocks; spec sizes converted
  from rem to px; `AGENTS.md`; tests in CI.
- **Test tooling (PR #2):** Storybook 8 + a11y addon, Vitest 4 + happy-dom, shared mocks,
  `xe-banner` stories and tests. → #I-08 … #I-11
- **XE Navbar (PR #3):** `xe-navbar` + `xe-nav-item` from the DS docs; built-in drawer and the four
  action-forwarding rules; `xe-navbar` block. → #I-13 … #I-15
- **Action Link (PR #4):** `xe-action-link` primitive from the DS docs.
- **Feature Cards (PR #5):** `xe-feature-cards` + `xe-card` from the DS docs; `xe-feature-cards`
  block. → #I-16 … #I-19
- **Docs (PR #6):** `CHANGELOG.md` and `docs/ue-authoring-guide.md`.
- PRs #2 → #6 merged in order; all merged feature branches and the 4 old keeneagle branches deleted
  (everything confirmed on `main` first).
- **First real page:** the user built an XE Navbar in Universal Editor on the page `/xe-navbar`
  and published it — rendered correctly on desktop and mobile. → #I-21
- **XE Navbar becomes the site header (PR #7, merged by the user):** the header renders the XE Navbar
  from `/xe-navbar` on every page; fixes the header that crashed on every page. → #I-22
- PageSpeed check on PR #7 flagged a layout shift from the new header. → #I-24 (open)
- The navbar is now visible on the home page (confirmed by the user).

### 2026-10-01 — Focus on primitives

- Received the **full Action Link docs page** (Usage, CSS custom properties, Accessibility) — more
  than the page `xe-action-link` was built from. Compared it with the built component: 7 gaps
  recorded as pending fix **PF-01** in `DEVELOPMENT.md`. → #I-32
- **Agreed way of working for primitives** written into `DEVELOPMENT.md` → "Building primitives":
  full docs page first, design tokens first, build order, a shared pattern for all primitives,
  spec-based tests, Storybook mirroring the DS Storybook, and a Docs status per component.
- **Pending fixes** list (PF-01 … PF-07) added to `DEVELOPMENT.md` for components already built.
- When the user shares DS docs: read and compare first; change code only when asked.

### 2026-10-02 — First primitive built the new way: Hyperlink

- Received the **Hyperlink docs page**; built **`<xe-hyperlink>`** to it — the first primitive that
  follows "Building primitives" end to end: full docs first, shared helper (`xe-link-helpers.js`),
  properties + attributes, a `DOCS_SPEC` contract test, stories mirroring the DS Storybook.
- Checked in the browser: matches the DS Link List / Variant On Dark previews; Tab shows the focus
  ring, a mouse click doesn't; long links wrap inside a sentence and use the paragraph's font;
  `aria-label` names the inner link. 96/96 tests, 35 stories with 0 accessibility violations.
  → #I-34, #I-35
- GitHub access worked again (I-33); the 2026-10-01 docs commit was added to PR #8.
- **PR #9** opened for Hyperlink (stacked on #8). CI green. The first PageSpeed run failed (mobile
  99, desktop 84); the run on #9's final commit passed (98 / 100), as did #8 (98 / 100). The header
  layout shift is in every run; the failure was that plus one slow desktop run. → #I-24
- Docs and this log updated first, then **#8 → #9 merged into `main`** at the user's request.
  `xe-hyperlink` is in the live code; no page uses it yet.
- Correction: the merged docs said the check "fails on every PR" — not true (it's intermittent);
  fixed in PR #10 (merged 2026-10-05).

### 2026-10-05 — Header layout shift fixed (PF-06)

- **Measured first** (live site, published `/xe-navbar` page): the page reserved 70px for the
  header; the XE Navbar is 135.5px at 480px and wider and 186px below that (always-visible buttons
  wrap onto a second row). Layout shift at 412px: **CLS 0.27**.
- **Reserving the right height alone wasn't enough** — CLS stayed 0.26. The navbar first rendered
  at its wide layout (137px) and only then measured itself and wrapped (200px), moving the page
  twice in two frames. → #I-24
- **Fix:** fixed navbar row heights (toolbar 64px, bar 72px → 137px); reserve `--xe-header-height`
  in `styles/styles.css` (137px, 199.5px below 480px); keep the header at that height with the
  navbar invisible for two frames while it settles, then let the header follow the navbar. Logo
  now requested at 300px wide instead of up to 2000px. → #I-28
- **Result:** CLS **0** at every width tested (360, 412, 470, 490, 600, 900, 1000, 1350, 1440,
  1920px), collapsed and expanded. 99/99 tests, 35 stories with 0 accessibility violations.
- **PR #11:** CI green; AEM PageSpeed **mobile 100 (CLS 0.000), desktop 100 (CLS 0.001)** — was
  mobile 91 (CLS 0.073) on #7. Docs updated first, then **merged into `main`** at the user's
  request; the fix is live on every page.
- ⚠️ The reserved heights match the navbar's current content. Changing toolbar items, button styles
  or "On mobile" settings on `/xe-navbar` means re-measuring and updating `--xe-header-height`.

---

## Issue tracker

Status: ✅ fixed · ⏳ open · ℹ️ known behavior / note

### Setup & repository

| # | Date | What we saw | Cause | Fix / status |
|---|---|---|---|---|
| I-01 | 09-25 | `git pull` failed: "could not read Username" | Git permission for the assistant was off | ✅ User enabled it in Settings → LLM Permissions (took effect on the next message) |
| I-02 | 09-25 | After the code move, the site would have shown keeneagle93325's content | `fstab.yaml`, `paths.json`, `robots.txt`, `sitemap-index.xml` still pointed at the old site | ✅ Pointed at rapidwhale27661 (`bd04bce`) |
| I-03 | 09-25 | Commit refused: "Author identity unknown" | No git author configured in this environment | ✅ Set a repo-local author (user's choice) |
| I-12 | 09-28 | Work pushed after PR #1 never reached `main` | PR #1 was merged minutes after opening; later commits went to the merged branch | ✅ Opened PR #2 for them. Rule: check a PR is still open before adding commits |
| I-20 | 09-28 | Couldn't read the site's publish log (`admin.hlx.page/log` → 403) | Adobe credentials for the assistant are off (separate from the git permission) | ℹ️ Optional: enable "Adobe credentials" in Settings → LLM Permissions |
| I-33 | 10-01 | `git fetch` failed ("could not read Username"); GitHub API returned **401 Bad credentials** | The GitHub credential in Settings was rejected — likely expired or changed between sessions | ✅ Worked again on 10-02 (no change needed on our side); docs commit pushed to PR #8 |

### Styling & components

| # | Date | What we saw | Cause | Fix / status |
|---|---|---|---|---|
| I-04 | 09-25 | Every component ~40% too small | `styles/styles.css` sets `html { font-size: 62.5% }`, so `1rem` = 10px | ✅ Components use px (rule in `DEVELOPMENT.md`) |
| I-05 | 09-25 | Banner message rendered in Roboto, not Arial | Global `p { font: … Roboto }` beats inherited styles on slotted light-DOM content | ✅ Block CSS resets `font: inherit` on slotted content |
| I-06 | 09-25 | Banner heading disappeared when the heading level wasn't H2 | Changing the level swaps the heading element; the "hide empty slot" listener still pointed at the old one | ✅ Listener looks the wrapper up each time |
| I-07 | 09-25 | ESLint: max-classes-per-file, prefer-default-export | Two custom elements in one file | ✅ One component per file, `export default class` (rule in `DEVELOPMENT.md`) |
| I-13 | 09-28 | Navbar: an empty 40px cream strip on mobile | Toolbar row stayed visible after its only item moved into the drawer | ✅ Toolbar hides when nothing in it is visible |
| I-14 | 09-28 | Navbar: page scrolled sideways on phones | Logo + always-visible actions + ☰ didn't fit in 390px | ✅ `stacked` layout moves actions to their own row (extra beyond the DS docs) |
| I-15 | 09-28 | Navbar could flip between collapsed/expanded while resizing | Collapsing hides some actions, which frees space and triggers an expand | ✅ Expands only once wider than where it collapsed |
| I-16 | 09-28 | Card titles overflowed ("HOME IMPROVEMENT") | Fallback Arial is wider than Arial Narrow, which isn't installed everywhere | ✅ Title size scales with the card width (container units) |
| I-17 | 09-28 | Card title/body lost the design system look | Site-wide `h1`–`h6` / `p` rules beat a component's `::slotted()` styles | ✅ Slotted typography marked `!important` (rule in `DEVELOPMENT.md`) |
| I-18 | 09-28 | Mobile carousel: cards had different heights | `xe-card`'s `height: 100%` blocked the flex row's stretch | ✅ `height: auto` in carousel mode |
| I-19 | 09-28 | Carousel only triggered by window width, not a narrow section | Media query instead of a container query | ✅ Container query on the component's own width |
| I-32 | 10-01 | `xe-action-link` doesn't match the full docs: no `target` attribute, `external` auto-opens a new tab, no `aria-label` passthrough, missing `--xe-action-link-color` / `-underline-height` (animated underline) / `-icon-nudge` | Built on 09-28 from the first half of the docs page only | ⏳ Pending fix **PF-01** (`DEVELOPMENT.md`). Rule added: get the full docs page before building |

### Tests & tooling

| # | Date | What we saw | Cause | Fix / status |
|---|---|---|---|---|
| I-08 | 09-28 | Storybook's mocks for `scripts/aem.js` / `scripts.js` never applied | Vite matches aliases on the import string, not the resolved path | ✅ Shared regex aliases in `test/mocks/aliases.js` |
| I-09 | 09-28 | UE-instrumentation test failed only in tests | happy-dom returns an empty `Attr.nodeName` | ✅ Test mock uses `attr.name` (real code unchanged) |
| I-10 | 09-28 | New dev dependencies added critical/high security advisories | Older Storybook/Vitest/happy-dom/Vite versions | ✅ Upgraded to patched versions. ℹ️ 1 moderate advisory left (Storybook 8 addon, dev-only, no fix) |
| I-11 | 09-28 | Lint scanned the Storybook build output; `.eslintignore` line got merged | `storybook-static/` not ignored; file had no final newline | ✅ Ignored `storybook-static/` and `coverage/`; fixed the file |
| I-23 | 09-28 | Header tests couldn't load `header.js` | It imports Commerce `@dropins/*` (import map) and needs a `<header>` when the module loads | ✅ `test/mocks/dropins.js` + import after creating a `<header>` |
| I-34 | 10-02 | A focus test failed only in unit tests | happy-dom doesn't implement `delegatesFocus` | ✅ Unit test checks the link is focusable; real Tab / `:focus-visible` behavior checked in the browser |
| I-35 | 10-02 | DS Hyperlink examples use `href="javascript:void(0)"` | Storybook placeholder in the DS docs | ℹ️ Our component refuses `javascript:` URLs (security); our stories use `#` |

### Content, Universal Editor & publishing

| # | Date | What we saw | Cause | Fix / status |
|---|---|---|---|---|
| I-21 | 09-28 | "Published, but the navbar isn't on the home page"; Publish button greyed with "0 items" | The navbar was built on a new page `/xe-navbar`, not `index`; "0 items" meant nothing new to publish | ℹ️ Page was live since 08:20. Check the page path in the UE address bar |
| I-22 | 09-28 | Site header empty on every page; console "failed to load module for header" | Header defaulted to `/nav-v2`, which only existed on keeneagle93325 (404), and the code crashed on it | ✅ PR #7: header renders the XE Navbar from `/xe-navbar`; a missing nav page no longer crashes |
| I-25 | 09-28 | Footer empty on every page; "failed to load module for footer" | Footer defaults to `/footer-v2`, which doesn't exist here | ⏳ Open — separate fix |
| I-26 | 09-28 | Container item fields: are empty fields skipped or rendered empty? | The existing `xcel-quick-links` notes say UE skips them; the published `/xe-navbar` page renders them as empty cells | ℹ️ Blocks detect fields by content, so both work. XE Banner reads by position — test it with an empty field |
| I-27 | 09-28 | `placeholders.json` 404 on every page | No placeholders sheet published for this site | ℹ️ Harmless |

### Performance

| # | Date | What we saw | Cause | Fix / status |
|---|---|---|---|---|
| I-24 | 09-28 | PageSpeed check failed on PR #7: mobile performance 91 (was 99–100), CLS 0.073 (was 0), Speed Index 4.3 s | The page reserves 70px for the header; the XE Navbar loads later at 136px (desktop) / 186px (mobile with current settings) and pushes the page down ~66px | ⏳ Open (postponed). Plan: reserve the header height up front, fixed navbar row heights, smaller logo rendition. Author side: set Pay Bill + Sign In to "Navbar on desktop, menu on mobile" and Contact Us to "Menu only". **10-02:** the shift shows in **every** PageSpeed run (CLS ~0.073 mobile / ~0.046 desktop). Pass/fail varies: #8 and #9's final run passed (98 / 100); #9's first run failed (desktop 84, with a one-off slow TBT of 229ms). Fixing it (PF-06) removes the main reason the check can fail. ✅ **Fixed 10-05 (PR #11):** reserved `--xe-header-height` (137px / 199.5px below 480px) + fixed navbar row heights + navbar kept invisible for two frames while it measures itself — the in-between frame at its wide layout was a second cause. CLS 0 at 360–1920px. Keep the reservation in sync with the navbar's content |
| I-28 | 09-28 | Logo image much larger than shown | Logo uploaded at 1360×480 and served at up to 2000px wide for a 113×40 display | ✅ Fixed 10-05 (PR #11): authored AEM logos are requested at 300px wide (shown at ~113×40) |

### Docs & housekeeping

| # | Date | What we saw | Cause | Fix / status |
|---|---|---|---|---|
| I-29 | 09-28 | `DEVELOPMENT.md` said the header loads `/nav` | Docs never updated after the keeneagle defaults (`/nav-v2`) | ✅ Corrected in PR #7 |
| I-30 | 09-28 | `README.md` / `CONTRIBUTING.md` describe the old boilerplate project | Never updated after the code move | ⏳ Open |
| I-31 | 09-28 | Project-setup skill expects `xwalk.json`; agent referenced a missing `AGENTS.md` | Files never created | ✅ `AGENTS.md` added (PR #2). ⏳ `xwalk.json` — confirm whether it's needed |

---

## Still waiting on design system docs

Priority order from `DEVELOPMENT.md` → "Building primitives" (full page each time: props, slots,
usage, CSS custom properties, accessibility, stories):

- **Design tokens** (colors, radius, spacing, typography, breakpoints) — current values are estimates
- **Button** — to verify `xe-button` (PF-02)
- **Hyperlink** follow-ups — hover/active/visited states, CSS custom properties (if any), the link
  color token, and whether links inside paragraphs are underlined by default
- **Card** page — variant names (`accent`…), other treatments, the cut-off `--xe-card-decorative-…`
  property (PF-03)
- **Dropdown / menu** for nav items with sub-links
- **Search Bar**, **Segmented Button**, **Icon Button**, **Menu Button**
- **`xe-svg`** and the brand illustrations
- The other 6 design system categories (only Action and part of Navigation are listed so far)
