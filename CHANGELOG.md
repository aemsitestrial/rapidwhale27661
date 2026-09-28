# Changelog — rapidwhale27661

What was built, when, and what's still open. The rules themselves live in `DEVELOPMENT.md`;
this file is the history. Newest first.

---

## 2026-09-28 (later) — XE Navbar becomes the site header

- **The header block now renders the XE Navbar site-wide.** It loads the nav page (default
  **`/xe-navbar`**, or a page's `nav` metadata) and, when that page contains an XE Navbar block,
  shows it as the whole header on every page. Authors edit the header on the `xe-navbar` page.
- **The empty header is fixed.** The old default `/nav-v2` came from the keeneagle93325 site and
  doesn't exist here, so the header crashed on every page. A missing or incomplete nav page now
  leaves the header empty with a console warning instead of an error.
- Header tests added; drop-in stubs (`test/mocks/dropins.js`) so blocks importing `@dropins/*` can
  be tested.
- Still open: the footer's default `/footer-v2` doesn't exist here either, so the footer is empty.

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
