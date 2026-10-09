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

### 2026-10-07 — Ignite integration architecture; `xe-icon` to the Ignite docs (Path A)

- **Ignite integration architecture documented** in `DEVELOPMENT.md` → "Ignite Design System
  Integration", from the team's Ignite integration strategy docs.
- **Three-tier model established:** Tier 1 page-level blocks (palette), Tier 2 container-child
  blocks (scoped to their parent via filter), Tier 3 internal components (no block definition,
  wired by the decorator to the `@ignite/web` API). Our components mapped to their tiers; alignment
  notes recorded (Tier 2 UE item ids `xe-feature-card` / `xe-navbar-link` vs Ignite's `xe-card` /
  `xe-nav-item`; `xe-banner-column` not yet a UE container-child; `xe-navbar-action` is
  project-specific).
- **Path B identified as the future direction** — install **`@ignite/web`** (Xcel GitLab, v0.42.0)
  as an npm dependency and replace our `xe-*.js` files with direct imports, starting with `xe-icon`
  — **pending npm access** (the user is checking with the team). Until then, **Path A**: our
  components are stand-ins built to the Ignite docs.
- Received the **Icon docs page** (Design System Primitives › **Media** › Icon) and the Jira
  acceptance criteria (CMS-040 / CMS-041 / CMS-019; testing at composition level via "Banner -
  Action"). Started `xe-icon` Path A: `registerIcons()`, five token-based sizes, Ignite's registered
  icon names + footer brand icons, `faExternalLink` alias, `label` removed. Font Awesome **Free** is a
  stand-in — the criteria require **Pro** (access pending). → #I-36, #I-37
- `xe-icon` rebuilt: site-level registration in `scripts/icons.js` (28 icons + `faExternalLink`
  alias); XE Banner / XE Feature Cards / XE Navbar import it. **Visible change:** sizes follow the
  new scale — banner icon 36 → 28px (lg), feature card icon 48 → 36px (xl), navbar menu button
  icon 24 → 20px (md). XE Banner gets an authorable **Icon Size** style option (default Large) and
  more icon choices. → #I-38
- Checked: lint, 114 unit tests, all 38 icon-using Storybook stories render (no empty icons),
  axe: no violations, every icon `aria-hidden`.
- PR #12 checks: build ✅ · PageSpeed desktop 100 (CLS 0.001), mobile 94 (CLS 0; slower TBT and
  Speed Index than #11 — one run, not yet known whether it is the icons file or run variance).

### 2026-10-08 — PR #12 merged

- The user reviewed and merged #12 on GitHub. Live site checked: new icon files are served from
  `main`, the navbar menu icons render (20px), header still reserves 137px.
- GitHub access for the assistant was rejected again ("Bad credentials") → #I-39

### 2026-10-08 — Standalone XE Icon block; `xe-icon` to the Ignite Storybook spec

- Team doc received: **primitive rendering pattern** (`buildPrimitive(props)` +
  `decorate(block, props)`, `decoratePrimitive` for compositions). Compared with our build: the
  web component fits it as a block-level layer; XE Banner / XE Feature Cards each duplicated the
  icon rendering.
- Decision (user): **standalone XE Icon block** (Idea A) — easier to transfer by copying block
  folders to xcel-pws-aem-site. No "Primitive section" container. A required Label field was
  considered and dropped — Ignite has no label prop. → #I-40
- Official **Ignite Storybook** for Icon: only `icon` and `size` props; color tokens
  `--xe-color-brand-primary` / `--xe-color-brand-accent`, gap `--xe-spacing-space-2xl`. Removed
  our extra `--xe-icon-size`. → #I-37 (partly resolved), #I-41
- Built `blocks/xe-icon/` (model, decorator, CSS, stories, tests); XE Banner and XE Feature Cards
  delegate to it. Checked: lint, 127 unit tests, 43 icon-using Storybook stories (no missing
  icons, axe 0 violations, link icons unchanged at 18 / 17.1px).

- PR #13 opened, checks: build ✅ · PageSpeed mobile **100** / desktop **100** (CLS 0) — the
  mobile 94 on #12 was run-to-run variation. Merged at the user's request; live site checked.
- User saw the Ignite Storybook **color** control ("Icon color (CSS color value)", example
  `#4e9e39`) and asked for a color field — dropdown or picker? Universal Editor has no built-in
  color picker (needs a custom extension), so: **Color dropdown of brand tokens** (Inherit /
  Brand Primary / Brand Accent). Built on `feature/xe-icon-color`. → #I-41
- Found while testing: an unknown authored value was read as the icon name and hid the icon. ✅
  Fixed — unrecognized values are ignored. → #I-42

- PR #14 (XE Icon Color dropdown) — checks: build ✅ · PageSpeed mobile 100 / desktop 100 (CLS 0).
  Merged at the user's request; live site checked.
- `AGENTS.md` now points to the Ignite three-tier rules and the primitive rendering pattern, so
  every agent starts from them.

### 2026-10-09 — `xe-icon-button` (Icon Button docs) + XE Icon Button block

- Received the **Icon Button** docs (props, treatments, sizes, states, as a link, slots,
  accessibility, usage). Analysed first; user decisions: sizes **option A** (icon button handles
  xxs / 2xl, `xe-icon` unchanged) · forward `aria-expanded` / `aria-haspopup` (navbar extension) ·
  **standalone block** with a required label.
- Built the component, the block, stories and tests; added `faGear` / `faPen`; XE Navbar ☰ / ✕
  now use `xe-icon-button`. Checked: lint, **157** unit tests, Storybook — 48×48 at every size,
  icon 12 → 40px across xxs → 2xl, treatments and disabled states match the docs' States story,
  navbar forwards `aria-expanded`, axe 0 violations. → #I-43, #I-44, #I-45
- PR #16 checks: build ✅ · PageSpeed mobile 94 / desktop 90 (desktop TBT 193ms, Speed Index 2.0s;
  CLS 0). Couldn't re-run Google PageSpeed (public API daily quota reached). Side-by-side loads of
  `main` vs the branch: header 137px on both, no long tasks on one branch load, ~30ms on another —
  most likely run variance (docs-only #15 also dipped to 92). → #I-47
- Pre-merge quality check (`eds-ue-quality-and-publishing`): lint clean (only local scratch files
  outside the repo's tracked code fail), local dev server serves the branch, `xe-icon-button.js`
  loads at ~790ms with the header — after first paint (548ms), lazy phase, no LCP impact; no core
  loading files changed. Authored markup couldn't be checked against real Universal Editor output:
  the XE Banner / XE Icon added in the editor aren't published to preview yet. → #I-48
- Docs commit re-ran the checks: desktop PageSpeed **100** (TBT 0, Speed Index 0.4s) — the first
  run's 90 was variance. Mobile didn't run: Google's PageSpeed API returned "Quota exceeded …
  per minute" (shared quota of the AEM PageSpeed check). → #I-47 ✅, #I-49
- User reviewed #16 and asked to update the docs before merging; merged 2026-10-09.
- **Post-merge check on the live site found a regression:** on phones the header measured 203.5px
  but only 199.5px was reserved — the 48px menu button (was 44px) makes the stacked bar 4px taller,
  and the bar now stacks up to 480px (switch measured exactly: stacked ≤ 480px, normal ≥ 481px).
  Fix on `fix/header-height-icon-button`: reserve 203.5px at ≤ 480px. → #I-50
  Verified on the local dev server: header = reserved height and CLS 0 at 360 / 412 / 480 / 481 /
  1350px. At 768px a separate, pre-existing 0.003 shift of a hero paragraph (~230ms, before the
  header loads; also on pre-#16 code) — not header-related.
- The user published the home page with 2 XE Banners and 3 XE Icons → checked the decorators
  against **real Universal Editor output**: every block renders as authored (banner icons 28px, white
  on Dark; XE Icon xl / lg / md = 36 / 28 / 20px in Brand Primary red, Brand Accent green and
  Inherit; all `aria-hidden`). → #I-48 ✅
- Finding: the XE Icon rows arrive in **model order** (icon, size, color), not alphabetical as
  DEVELOPMENT.md's "JCR Field Ordering" rule says — reading by content handled it. Rule updated.
  → #I-51
- Content note for the author: the second XE Banner's Button Link is "teterer" (not a page or
  URL), so its button goes to a broken address — fix in Universal Editor.
- PR #17 checks: build ✅ · PageSpeed mobile 100 / desktop 100. Merged at the user's request.

### 2026-10-09 — PR #18 review: shared `getBlockProps` utility

- PR #18 (`refactor/primitive-utility`, opened from the team-project alignment work) moved the
  XE Icon / XE Icon Button readers into `scripts/utils/primitive.js`. Review before merging: the
  build check failed — **3 tests failed and 5 lint errors**. Its `getBlockProps` read every field
  except links and icons **by position**, so a skipped field or reordered rows put values in the
  wrong field (brand color → size; target ↔ treatment). → #I-52
- Fixed on the same branch (user picked option A): optional third argument `options` — select
  fields are matched by their allowed values, only free text is positional; lint fixed (default
  import kept so block code matches the team project); 9 unit tests for the utility
  (`scripts/utils/primitive.test.js`, now included in Vitest). 166 tests pass.
- Housekeeping: I-39 closed (GitHub access has worked since; PRs #15–#17 pushed).

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
| I-39 | 10-08 | GitHub API **401 Bad credentials** and `git fetch` failed again | Same as I-33 — the GitHub credential in Settings was rejected | ✅ Access worked again later on 10-09 (PRs #15–#17 pushed and merged); nothing to change on our side |
| I-46 | 10-09 | First commit attempt failed: "error when closing loose object file: Input/output error"; the push then sent only the unchanged main commit under the new branch name | Temporary storage (network file system) glitch — disk had space, `git fsck` clean | ✅ Retried the commit, checked it contained all files, then pushed. Rule: check `git log` after every commit before pushing |

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
| I-36 | 10-07 | Icon acceptance criterion 1 needs Font Awesome **Pro** icons | Ignite imports `@fortawesome/pro-solid-svg-icons`; we have no Pro (or `@ignite/web`) npm access | ⏳ Partial — Font Awesome **Free** 7.3.1 stand-in in the same package shape; some shapes differ (Ignite's faBolt is an outline). Swap when access is confirmed (Path B) |
| I-37 | 10-07 | Icon docs give no px values or token names for xs–xl; the DS Storybook shows a color control that isn't in the props table; the docs list both faXTwitter and faSquareXTwitter | Design tokens docs not received yet; Storybook-only control | ⏳ Sizes estimated (14 / 16 / 20 / 28 / 36px) behind placeholder tokens `--xe-sizing-icon-*`; color is CSS-only (inherits) — ✅ confirmed 10-08: Ignite has only `icon` and `size`; both X icons registered until the Footer docs confirm one |
| I-38 | 10-07 | Link component tests lost their icons after the change | Icons now come from the site-level registration, not built into `xe-icon` | ✅ Tests import `scripts/icons.js`, like a page does |
| I-40 | 10-08 | Standalone XE Icon block goes against Ignite's Tier 3 rule ("no block definition") | Team decision: production code is moved by copying block folders; a self-contained block is easier to transfer | ℹ️ Documented exception in `DEVELOPMENT.md`. Decorative only (no label). The block still needs `scripts/icons.js`, `scripts/components/xe-icon.js` and `scripts/components/icons/` copied with it |
| I-41 | 10-08 | Ignite docs show the color/spacing token names but not their values | Design tokens docs not received yet | ⏳ Fallbacks estimated: brand-primary `#c8102e`, brand-accent `#00664f`, space-2xl `24px`. The Ignite Storybook color control shows `#4e9e39` (a green) — to confirm with the team whether that is the brand accent |
| I-42 | 10-08 | XE Icon: an authored value the block didn't recognize (e.g. an unknown color) hid the icon | The reader treated any unrecognized value as the icon name | ✅ Only `fa…` names count as icons; unknown values are ignored (unit test) |
| I-43 | 10-09 | Icon Button documents 7 sizes (xxs–2xl); the Icon docs only 5 (xs–xl) | The two Ignite pages disagree (the real `xe-icon` may support xxs / 2xl) | ℹ️ User decision: `xe-icon` stays at xs–xl; Icon Button sets the icon's width/height for xxs / 2xl (estimates 12 / 40px). Ask the team whether `xe-icon` supports them |
| I-44 | 10-09 | Swapping the navbar ☰ for `xe-icon-button` would lose `aria-expanded` (WCAG 4.1.2) | Ignite's Icon Button only forwards `aria-label` | ✅ Navbar extension, not in Ignite spec: `aria-expanded` / `aria-haspopup` forwarded. `aria-controls` dropped (can't cross the shadow DOM) |
| I-45 | 10-09 | Icon Button colors / shape not fully specified: text says "circular", examples are rounded squares; no color tokens except brand primary | Docs page | ⏳ Followed the examples (8px radius); colors estimated — Ignite's filled red looks darker than `#c8102e` |
| I-47 | 10-09 | PR #16 PageSpeed lower than usual (mobile 94, desktop 90 — desktop TBT 193ms) | Unclear: one Lighthouse run; the new code is ~7 KB loaded with the header after first paint | ✅ Re-run: desktop 100, TBT 0 — run-to-run variance, not the new code |
| I-48 | 10-09 | Can't verify XE Icon / XE Icon Button decorators against real authored markup | The blocks added in Universal Editor aren't published to preview yet | ✅ Checked 10-09 after the user published the home page — all XE Banner / XE Icon blocks decorate as authored |
| I-49 | 10-09 | AEM PageSpeed check "failure" with mobile score n/a | Google PageSpeed API quota exceeded (per minute / per day) — not a code issue | ℹ️ Re-run later or push the next commit; don't treat a quota failure as a regression |
| I-50 | 10-09 | After #16, phone header 203.5px but 199.5px reserved (4px shift); 480px stacked but reserved 137px | Menu toggle grew 44 → 48px (Ignite touch target); the stacked bar has no fixed height, and the wider bar stacks up to 480px | ✅ `--xe-header-height: 203.5px` at `width <= 480px` (fix PR). Lesson: re-measure the header at 360–500px whenever the bar's buttons change |
| I-51 | 10-09 | Real XE Icon rows arrived as icon, size, color (model order) — not alphabetical as our JCR rule said | The "JCR saves alphabetically" assumption doesn't hold for this block's delivered markup | ✅ Content-based reading handled it; DEVELOPMENT.md rule now says: read by content, keep model order = alphabetical for position-based blocks |
| I-52 | 10-09 | PR #18 failed its build: 3 tests, 5 lint errors | Shared `getBlockProps` read select fields by position; default import of a function also exported by name | ✅ Select fields matched by allowed values (`options` argument); lint fixed; utility tests added |

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
