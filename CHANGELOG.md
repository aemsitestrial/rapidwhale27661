# Changelog — rapidwhale27661

What was built, when, and what's still open. The rules themselves live in `DEVELOPMENT.md`;
this file is the history. Newest first. Bugs and issues we ran into — with cause, fix and status —
are tracked in **`docs/build-log.md`**.

---

## 2026-10-09 — Header height on phones re-measured after #16

[#17](https://github.com/aemsitestrial/rapidwhale27661/pull/17), merged into `main` on 2026-10-09 at
the user's request. Checks: build ✅ · AEM PageSpeed mobile **100** / desktop **100** (CLS 0). On the
branch preview: header = reserved height and CLS 0 at 360 / 390 / 412 / 480 / 481 / 1350px, with
the user's newly published XE Banners and XE Icons on the home page.

- Found right after merging #16: the 48px menu button made the stacked phone header 4px taller
  (199.5 → **203.5px**) and stacked up to **480px** — but the reserved height was still 199.5px
  below 480px, so content could shift a few pixels on load.
- `styles/styles.css`: `--xe-header-height` is now **203.5px at ≤ 480px** (137px above, unchanged).
  Build-log #I-50.

## 2026-10-09 — `xe-icon-button` primitive + XE Icon Button block

[#16](https://github.com/aemsitestrial/rapidwhale27661/pull/16), reviewed by the user and merged into
`main` on 2026-10-09. Checks: build ✅ · AEM PageSpeed first run mobile **94** / desktop **90**; re-run
desktop **100** (TBT 0) — the dip was run variance. CLS 0 throughout.
Pre-merge quality check: icon-button code loads in the lazy phase with the header, after first
paint (no LCP impact); `scripts.js` / `delayed.js` unchanged.

- **`xe-icon-button`** built to the Ignite Icon Button docs (status Ready): `treatment`
  (default / filled / outlined), `size` (xxs–2xl), `href` → `<a>`, `target`, `disabled`,
  required `aria-label` forwarded to the inner control; always a 48×48px touch target.
- **Documented extensions:** `aria-expanded` / `aria-haspopup` forwarding (navbar extension, not in
  Ignite spec); xxs / 2xl handled by the icon button so `xe-icon` stays at its documented xs–xl;
  disabled links use `aria-disabled`.
- **New XE Icon Button block** (`blocks/xe-icon-button/`, any section) — Accessible Label
  (required), Icon, Icon Size, Treatment, Link, Open In (only with a Link). Primitive API ready for
  the footer's social links.
- **XE Navbar:** ☰ / ✕ are now `xe-icon-button`s. ⚠️ Visible change: touch target 44 → **48px**
  (fits the fixed 72px bar — header height unchanged) and the icon color is Ignite's warm grey
  (`#5c534e`) instead of near-black.
- Icons `faGear` and `faPen` added (Icon Button docs examples) — also in the XE Icon dropdown.

## 2026-10-08 — XE Icon: Color dropdown

[#14](https://github.com/aemsitestrial/rapidwhale27661/pull/14), reviewed and merged into `main` on
2026-10-08 — live (checked: new block code and Color options served). AEM PageSpeed on #14: mobile
**100**, desktop **100** (CLS 0).

- **XE Icon block** gets a **Color** dropdown: **Inherit** (default — follows the section's text
  color, as before) · **Brand Primary** (`--xe-color-brand-primary`) · **Brand Accent**
  (`--xe-color-brand-accent`). From the Ignite Storybook "color" control; applied with
  `style="color: …"` like the docs. Brand tokens only — no free color picker (not built into
  Universal Editor, and off-brand colors break the design system).
- Fix: the block now ignores authored values it doesn't recognize, so an unknown value can't
  hide the icon.
- Existing XE Icon blocks keep their look (no color saved = Inherit). XE Banner / XE Feature Cards
  are unchanged.

## 2026-10-08 — Standalone XE Icon block · `xe-icon` matches the Ignite Storybook

[#13](https://github.com/aemsitestrial/rapidwhale27661/pull/13), merged into `main` on 2026-10-08
at the user's request — live (checked: block files served, XE Icon in the section filter, navbar
icons render, header 137px). AEM PageSpeed on #13: mobile **100**, desktop **100** (CLS 0).

- **New XE Icon block** (`blocks/xe-icon/`) — authors can place it in any section. Two dropdowns
  only: **Icon** (every registered icon, by name) and **Size** (Extra Small → Extra Large, default
  Medium). Decorative only — no label (Ignite has none; the parent carries the meaning).
- **Primitive rendering pattern** (team doc): the block exports `buildPrimitive()` and
  `decorate()` / `decoratePrimitive()`. XE Banner and XE Feature Cards now reuse it instead of
  each building `<xe-icon>` themselves — no visible change to either block.
- **`xe-icon` = the Ignite spec:** only `icon` and `size`; the extra `--xe-icon-size` property is
  removed (link components size their icon directly — no visible change). Stories use Ignite's
  tokens `--xe-color-brand-primary`, `--xe-color-brand-accent`, `--xe-spacing-space-2xl`.
- Documented exception to the Ignite Tier 3 rule (standalone block, for block-folder transfer to
  the production project). Build-log #I-40, #I-41.
- Also records #12's merge (2026-10-08) — that docs commit couldn't be pushed on its own (#I-39).

## 2026-10-07 — `xe-icon` to the Ignite docs (Path A) · Ignite integration architecture

[#12](https://github.com/aemsitestrial/rapidwhale27661/pull/12), reviewed and merged into `main` by the user on 2026-10-08 —
live on every page (checked: new icon files served, navbar icons render, header still 137px).

- **Docs:** `DEVELOPMENT.md` → "Ignite Design System Integration" — three-tier model (Tier 1
  page blocks · Tier 2 container-children · Tier 3 internal components), our components by tier,
  integration rules, and **Path B** (`@ignite/web` direct import, starting with `xe-icon`) as the
  future direction pending npm access.
- **`xe-icon`** rebuilt to the Icon docs: `registerIcons()` with site-level registration in
  `scripts/icons.js` · sizes `xs`–`xl` from design tokens (px fallbacks 14 / 16 / 20 / 28 / 36 —
  estimates) · color inherited · always decorative (`label` attribute removed) · Ignite's
  registered icon names, the `faExternalLink` alias and footer brand icons (Facebook, X,
  Instagram, LinkedIn, YouTube).
- ⚠️ Font Awesome **Free** stands in for Pro (acceptance criterion 1 — partial). Build-log #I-36.
- **XE Banner:** new **Icon Size** style option (default Large) and 6 more icon choices.
- Visible change: icons are a little smaller on the new scale (banner 36 → 28px, feature cards
  48 → 36px, navbar menu 24 → 20px) until the design tokens confirm the sizes. Build-log #I-37.
- New: `xe-icon` stories (Design System Primitives › Media › Icon) and unit tests.

## 2026-10-05 — Header no longer makes the page jump (PF-06)

[#11](https://github.com/aemsitestrial/rapidwhale27661/pull/11), merged into `main` on
2026-10-05 — live on every page.

- **Layout shift from the XE Navbar header fixed:** CLS **0** at every width tested (360–1920px),
  down from 0.27 at 412px. Build-log #I-24, #I-28.
- **AEM PageSpeed on #11:** mobile **100** (CLS 0.000), desktop **100** (CLS 0.001) — was mobile
  91 (CLS 0.073) on #7.
- `styles/styles.css` reserves the header's height up front (`--xe-header-height`: 137px, 199.5px
  below 480px); `xe-navbar` uses fixed row heights (toolbar 64px, bar 72px); the header keeps its
  reserved height with the navbar invisible for two frames while the navbar measures itself.
- The logo is requested at 300px wide instead of up to 2000px.
- ⚠️ Changing the navbar's toolbar items, button styles or "On mobile" settings needs the
  reserved height re-measured (documented in `DEVELOPMENT.md` and the UE authoring guide).
- Also: #10 (PageSpeed note correction) merged.

## 2026-10-02 — `xe-hyperlink` primitive

[#9](https://github.com/aemsitestrial/rapidwhale27661/pull/9), merged into `main` after #8 (merge
order #8 → #9). The component is on the live site's code but not used by any page yet.

- **`<xe-hyperlink>`** built to the Hyperlink docs page: `href`, `variant` (`default` / `variant`
  for dark surfaces), `trailing-icon`, `link-type` (external ↗ default, internal →, download ↓),
  `target`; `rel` for `target="_blank"`, `aria-label`, focus ring on `:focus-visible` only. Works
  standalone, in link lists and inside body copy (wraps with the sentence).
- **`xe-link-helpers.js`** — the first shared helper from "Building primitives" step 4 (link
  behavior, safe URLs, shared stylesheets); `xe-action-link` moves to it with PF-01.
- 5 stories (the 4 DS stories + In Body Text) and 16 unit tests, including a contract test that
  checks the component against the docs page.
- Component only — no block uses it yet. Good next candidates: the empty footer's legal links
  (build-log #I-25) and links in XE Banner / XE Feature Card text.
- **PageSpeed:** the first run on #9 failed (mobile 99, desktop 84); the run on its final commit
  passed (98 / 100), as did #8 (98 / 100). Hyperlink isn't the cause — no page loads it. The header
  layout shift from #7 shows up in **every** run (CLS ~0.073 mobile / ~0.046 desktop, build-log
  #I-24) and, combined with a slow run, can push the score under the pass line. Fix: **PF-06**.

## 2026-10-01 — How we build primitives (docs only)

[#8](https://github.com/aemsitestrial/rapidwhale27661/pull/8), merged 2026-10-02 together with the
build log and issue tracker (`docs/build-log.md`, written 2026-09-28).

- **"Building primitives"** added to `DEVELOPMENT.md`: full DS docs page before building, design
  tokens first, build order (Button → Action Link fixes → Icon Button → Menu Button → Segmented
  Button → Hyperlink → Button Group → Split Button / FAB), one shared pattern for all primitives,
  spec-based tests, Storybook mirroring the DS Storybook, and a **Docs status** per component.
- **Pending fixes** for components already built (PF-01 … PF-07) — starting with `xe-action-link`,
  which was built from half its docs page (build-log #I-32).
- No code changes; the components are fixed when they're next worked on.

## 2026-09-28 (later) — XE Navbar becomes the site header

[#7](https://github.com/aemsitestrial/rapidwhale27661/pull/7), merged — the navbar is live on the
home page and every other page.

- **The header block now renders the XE Navbar site-wide.** It loads the nav page (default
  **`/xe-navbar`**, or a page's `nav` metadata) and, when that page contains an XE Navbar block,
  shows it as the whole header on every page. Authors edit the header on the `xe-navbar` page.
- **The empty header is fixed.** The old default `/nav-v2` came from the keeneagle93325 site and
  doesn't exist here, so the header crashed on every page. A missing or incomplete nav page now
  leaves the header empty with a console warning instead of an error.
- Header tests added; drop-in stubs (`test/mocks/dropins.js`) so blocks importing `@dropins/*` can
  be tested.
- **Still open:**
  - The page jumps ~66px when the header loads (PageSpeed on #7: mobile 91, CLS 0.073) —
    build-log #I-24, fix postponed.
  - The footer's default `/footer-v2` doesn't exist here either, so the footer is empty — #I-25.

## 2026-09-28 — Xcel design system web components

All merged into `main` in order: #2 → #3 → #4 → #5 → #6.

### Components & blocks

| PR | Web components | Authorable block (Universal Editor) |
|---|---|---|
| [#3](https://github.com/aemsitestrial/rapidwhale27661/pull/3) | `xe-navbar` (composite), `xe-nav-item` (primitive) | **XE Navbar** — logo + **XE Navbar Link** / **XE Navbar Action** items |
| [#4](https://github.com/aemsitestrial/rapidwhale27661/pull/4) | `xe-action-link` (primitive) | — (used inside cards) |
| [#5](https://github.com/aemsitestrial/rapidwhale27661/pull/5) | `xe-feature-cards` (composite), `xe-card` (composite) | **XE Feature Cards** — band heading + 2–3 **XE Feature Card** items |

- **`xe-nav-item`** — per DS docs: `active`, `href`, `target`, `leading-icon` slot, 8% hover /
  12% active overlay, `aria-current="page"`.
- **`xe-navbar`** — per DS docs: slots `logo`, `nav-items`, `search`, `actions`,
  `toolbar-selector`, `toolbar-actions`; collapses to a hamburger when the nav items no longer
  fit; built-in drawer with the four action-forwarding rules. Our extra: `stacked` layout so
  actions never cause sideways scrolling on phones.
- **`xe-action-link`** — per DS docs: `link-type` internal / external / download (arrow right /
  up-right / down), color from `--card-text-color`. Our extras: external opens a new tab safely
  and is announced to screen readers; download sets the `download` attribute.
- **`xe-feature-cards`** — per DS docs: full-width band of 2–3 equal-height cards, optional `<h2>`
  heading + body copy, carousel on mobile (switches on the component's own width).
- **`xe-card`** — from its usage in the Feature Cards docs: `surface` / `primary-variant`,
  `filled`, `interactive` (whole card clickable), `inline` actions; sets `--card-text-color`.
- **`xe-icon`** — new icons: `faBars`, `faXmark`, `faMagnifyingGlass`, `faFileInvoiceDollar`,
  `faArrowDown`, `faArrowUpRightFromSquare`, `faSolarPanel`, `faWrench`.

### Rules, docs & tooling ([#2](https://github.com/aemsitestrial/rapidwhale27661/pull/2))

- **Web components are required for every new block** (`DEVELOPMENT.md` → "Web Components").
- **Primitives → composite components → blocks**, with a reuse-first checklist.
- **The Xcel design system is the source of truth.** We have its docs, not its code, so each
  `xe-*` component is built to match the docs exactly (tag, attributes, slots, custom properties).
  For `xe-*` blocks the design system wins over the older "Xcel Site Design Spec"; that spec now
  applies to the `xcel-*` blocks only, and its sizes were converted from rem to px.
- **`AGENTS.md`** added as the entry point for AI agents.
- **Tests**: Storybook 8 (+ a11y addon) and Vitest 4 set up; `npm test` now runs in CI.
  Stories/tests live next to each block (`blocks/<name>/`) and component (`scripts/components/`).
- **`xe-banner`** got its story and unit tests.

### Quality at end of day

- `npm run lint` ✅ · `npm test` **74/74** ✅ · CI ✅ on every PR
- Storybook: **30 stories**, axe-core accessibility scan **0 violations**
- Checked in the local preview at desktop and phone widths

### Things we learned (worth knowing for the next block)

- **Universal Editor skips empty fields in child items**, so item cells shift position. Container
  blocks detect fields by content (link, image, prefixed select values like `icon-…`), not position.
- **`1rem` is 10px on this site** (`html { font-size: 62.5% }`) — component CSS uses px.
- **Global `h1`–`h6` / `p` styles beat a component's `::slotted()` styles**; components mark the
  typography of slotted titles/body `!important` to keep the design system look.
- **Check a PR is still open before adding commits** — PR #1 was merged minutes after opening, and
  follow-up commits went to the merged branch until they were moved into #2.

### Still open

- **Test every new block in Universal Editor** (fields save and render): XE Navbar, XE Feature
  Cards, and XE Banner with an empty field (it reads fields by position — switch it to content
  detection if a field shifts).
- **Design system docs still needed**: design tokens (colors, radius, spacing — current values are
  estimates); the **Card** page (other variants/treatments, the `--xe-card-decorative-…` property);
  a dropdown/menu component; **Search Bar**, **Segmented Button**, **Icon Button**, **Menu
  Button**; **`xe-svg`** and the brand illustrations.
- `README.md` / `CONTRIBUTING.md` still describe the old boilerplate project.

---

## 2026-09-25 — Project setup & first web component

- Old code from `keeneagle93325` moved into this repository; content source (`fstab.yaml`,
  `paths.json`), `robots.txt` and `sitemap-index.xml` pointed to `rapidwhale27661`.
- **`xe-banner`** block built on the first web components — `xe-banner`, `xe-banner-column`,
  `xe-button`, `xe-icon` — merged in [#1](https://github.com/aemsitestrial/rapidwhale27661/pull/1).
