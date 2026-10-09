# Development Conventions — rapidwhale27661

> **Before starting any task — read both files:**
> 1. **This file** (`DEVELOPMENT.md`) — all coding rules, CSS/ESLint/JCR/design spec
> 2. **`SKILLS-GUIDE.md`** — what skills and agents are available and when to use them
>
> AI agents: `AGENTS.md` summarizes the non-negotiables and points back here.
> History of what's been built: `CHANGELOG.md` · Bugs/issues with cause, fix and status:
> `docs/build-log.md` · Authoring the XE blocks in Universal Editor: `docs/ue-authoring-guide.md`.

---

## Project Context

- **Type:** AEM Edge Delivery Services (EDS) — Universal Editor (crosswalk/xwalk) project
- **Brand:** Xcel Energy
- **Working branch:** feature branch → PR → `main`

### Xcel Energy Brand Colors
| Token | Hex | Usage |
|---|---|---|
| Brand red | `#C8102E` | Buttons, highlights |
| Teal | `#005F87` | Accent |
| Dark crimson | `#8B1A2C` | Announcement bar, dark sections |
| Cream | `#F5EDE8` | Nav background |
| Text | `#333` | Body text |

### Font
All blocks must use `Arial, sans-serif` — never Roboto, Inter, or other Google Fonts.

---

## Header/Footer Configuration

The header and footer are not hardcoded blocks of content — they're fragments loaded at runtime from
dedicated pages, and every page on the site loads the same fragment unless told otherwise.

- **Default paths (site-wide fallback):** hardcoded in [blocks/header/header.js](blocks/header/header.js#L175)
  (`'/xe-navbar'`) and [blocks/footer/footer.js](blocks/footer/footer.js#L17) (`'/footer-v2'`). Changing
  these two lines is how you switch the source page for the **entire site**.
  ⚠️ `/footer-v2` doesn't exist on this site yet (it came from the old keeneagle93325 site), so the
  footer is currently empty on every page.
- **Per-page override:** add a `nav` and/or `footer` row to a page's **Metadata** block
  (e.g. `nav` → `/nav-landing`) to point just that page at a different header/footer page, without
  touching code.
- **Fetch mechanism:** both blocks call `loadFragment(path)` in
  [blocks/fragment/fragment.js](blocks/fragment/fragment.js#L17), which fetches `{rootPath}{path}.plain.html`.
  The target page must be **Previewed + Published** or this 404s.
- **XE Navbar header (current setup):** if the nav page contains an **XE Navbar** block, the header
  renders that block as the whole header (everything else on the page is ignored) and the `<header>`
  gets the `header-xe-navbar` class so its height follows the navbar. Authors edit the site header by
  editing the XE Navbar on the `xe-navbar` page in Universal Editor and publishing it.
- **If the nav page is missing** (or a legacy nav page has fewer than 4 sections), the header stays
  empty and logs a console warning instead of crashing the page.
- **No layout shift (fixed 2026-10-05, build-log I-24):** the header loads after the page appears,
  so its space is reserved up front in `styles/styles.css` as **`--xe-header-height`** — `137px`
  (toolbar 64px + bar 72px + 1px border; fixed row heights in `xe-navbar.js`) and `203.5px` at
  480px and below, where the current always-visible buttons wrap onto a second row ("stacked").
  (Was `199.5px` below 480px until the menu toggle became a 48px `xe-icon-button` in #16 —
  build-log I-50: anything that changes the bar's buttons changes these values.) While the navbar lays
  itself out (two frames), the header keeps that height and the navbar stays invisible; then
  `header.js` adds `.header-xe-navbar` and the header follows the navbar's real height.
  ⚠️ **These values depend on the navbar's content on the `/xe-navbar` page.** If authors add or
  remove toolbar items, change button styles, or change an action's "On mobile" setting,
  re-measure the header (e.g. at 412px and 1350px — the PageSpeed widths) and update
  `--xe-header-height`, or the page will jump again. Example: with the recommended mobile settings
  (Pay Bill + Sign In "Navbar on desktop, menu on mobile", Contact Us "Menu only") the collapsed
  header has no toolbar row and is 73px.
- **Legacy nav page structure** (only used when the nav page has no XE Navbar — read by
  [header.js](blocks/header/header.js#L203) as 5 sections, in this exact order — each section is a
  section break in the doc):
  1. **Announcements** — top promo/announcement bar content
  2. **Brand** — logo image + home link
  3. **Sections** — main menu; a nested `<ul>` under a menu item makes it an expandable dropdown
  4. **Tools** — usually left empty; cart/search icons are injected here by JS
  5. **Utility** — rendered as the top utility bar (e.g. Pay Bill, Sign In); authored as a simple link list
- **Required content structure for a footer page:** no fixed section count — all top-level content is
  copied as-is into the footer block.

---

## CSS Rules (stylelint enforced — all fail CI if violated)

### Rule 1 — Modern color syntax
```css
/* WRONG */
rgba(255, 255, 255, 0.75)

/* RIGHT */
rgb(255 255 255 / 75%)
```
- No commas inside `rgb()`
- Alpha as `%` not decimal
- Use `rgb()` not `rgba()`

### Rule 2 — Range media queries
```css
/* WRONG */
@media (max-width: 767px)
@media (min-width: 900px)

/* RIGHT */
@media (width <= 767px)
@media (width >= 900px)
```

### Rule 3 — No descending specificity
If you add `a`, `li`, or `a:hover` selectors at the end of a CSS file that conflict with earlier higher-specificity selectors, wrap them:
```css
/* stylelint-disable no-descending-specificity */
.my-block a { ... }
.my-block a:hover { ... }
/* stylelint-enable no-descending-specificity */
```
The disable comment must have a blank line before it and be ≤100 chars.

### Rule 4 — Commerce boilerplate link color override

This is a **boilerplate-commerce** project. The Commerce Dropin CSS has a global `a:any-link` rule (specificity 0,1,1) that sets links to a dark color. A plain `.my-block a { color: #fff; }` has the same specificity and loses to Commerce CSS when it loads later.

**Always use the block's own class as a parent when coloring links:**
```css
/* WRONG — loses to Commerce boilerplate */
.my-block-links a { color: #fff; }

/* RIGHT — specificity 0,3,1, always wins */
/* stylelint-disable no-descending-specificity */
.my-block .my-block-links a,
.my-block .my-block-links a:any-link {
  color: #fff;
}
/* stylelint-enable no-descending-specificity */
```

This applies to **any block that sets a custom link color**, especially on dark backgrounds.

---

## JCR Field Ordering (critical for Universal Editor blocks)

JCR (AEM storage) saves block fields **alphabetically by field name**, not in model definition order.
The JS decorator reads rows by position (rows[0], rows[1], ...) which means it gets fields in alphabetical name order.

**Rule:** Name fields so their alphabetical sort equals the order the JS reads them.

```
Example: heading (h) < links (l) → rows[0]=heading, rows[1]=links ✓
Example: linkText (T) < linkUrl (U) → rows[0]=linkText, rows[1]=linkUrl ✓
```

Alternative: use content-type detection in JS (detect a link by `/` or `http` prefix) instead of relying on position — more resilient but more complex.

> ⚠️ **Observed 2026-10-09 on real published content (build-log I-51):** the XE Icon block's rows
> arrived in **model order** (`icon`, `size`, `color`), **not** alphabetical (`color` would come
> first). So don't rely on either order: new blocks **read authored values by content** (the
> primitive rendering pattern does), and blocks that read by position (e.g. XE Banner) keep model
> order = alphabetical order so both cases give the same result.

> **Element grouping (aem.live "Content modeling"):** fields named `<group>_<field>` (e.g.
> `ic_icon`, `ic_size`) are rendered together as **one cell** with one element (`<p>`, heading,
> link…) per field, in model order. A decorator that expects one value per row must read the
> grouped cell's children. Renaming fields into a group changes the saved property names: blocks
> authored with the old names keep their old markup until republished, then show **empty** —
> re-select their values in Universal Editor before publishing (build-log I-53).

---

## Block Model Rules

1. Define `_block.json` (definitions + models + filters) **before** writing JS
2. Register the block in `models/_component-definition.json` (glob entry)
3. Register the block ID in the section filter in `models/_section.json`
4. Run `npm run build:json` after any model changes to rebuild the generated JSON files
5. Insert the block in UE and inspect the **Content Tree** — verify fields appear inside the correct parent before writing the JS decorator

---

## Ignite Design System Integration (from the Ignite integration strategy, 2026-10-07)

**Ignite** is Xcel's design system. Its components are the `xe-*` web components, published as the
**`@ignite/web`** package (Xcel internal GitLab:
`gitlab.com/xcel-master/experience-design/ignite-design-system`, currently **v0.42.0**). Its Storybook
is organised as **Design System Primitives**, **Design System Compositions** and **Platform
Experiences** (Adobe Experience Manager, Kubernetes).

### Three-tier architecture — how AEM/EDS blocks relate to Ignite components

| Tier | What it is | Block definition in UE? | Palette-exposed? |
|---|---|---|---|
| **Tier 1** | Page-level block (a composition placed in a page section) | Yes | Yes |
| **Tier 2** | Container-child block (editable unit within a Tier 1 composition) | Yes | No — scoped to its parent via filter |
| **Tier 3** | Internal component (wired by the block decorator to the `@ignite/web` API) | No | No |

**Tier 1 blocks** (authors place these from the palette): `xe-banner`, `xe-feature-cards`,
`xe-footer`, `xe-hero`, `xe-highlight`, `xe-multi-card-gallery`, `xe-nav-drawer`, `xe-navbar`,
`xe-quick-actions`, `xe-tile-group`, `xe-utility-actions`

**Tier 2 blocks** (container-children, scoped to their parent):

| Tier 2 block | Parent(s) |
|---|---|
| `xe-banner-column` | `xe-banner` |
| `xe-card` | `xe-feature-cards`, `xe-multi-card-gallery`, `xe-quick-actions`, `xe-utility-actions` |
| `xe-footer-column` | `xe-footer` |
| `xe-nav-drawer-item` | `xe-nav-drawer` |
| `xe-nav-item` | `xe-navbar` |
| `xe-tile` | `xe-tile-group` |

**Tier 3 internal components** (no block definition is ever needed — wired by the decorator):

| Component | How it gets its content |
|---|---|
| `xe-action-link` | Derived from card title/link fields |
| `xe-button` | CTA label + URL on the parent block |
| `xe-hyperlink` | Link text + URL on the parent block or container-child |
| `xe-icon` | Fixed by the composition, or derived from a select field |
| `xe-icon-button` | Fixed by the composition (search, close, social) |
| `xe-search-menu` | Internal to `xe-navbar`, opened by the search trigger |

### Where our work sits today

| Tier | Built in this project | Not built yet |
|---|---|---|
| **Tier 1** | **XE Banner** (`xe-banner` block), **XE Feature Cards** (`xe-feature-cards`), **XE Navbar** (`xe-navbar`, also the site header) | `xe-footer`, `xe-hero`, `xe-highlight`, `xe-multi-card-gallery`, `xe-nav-drawer`, `xe-quick-actions`, `xe-tile-group`, `xe-utility-actions` |
| **Tier 2** | `xe-card` (UE item **XE Feature Card**, parent XE Feature Cards) · `xe-nav-item` (UE item **XE Navbar Link**, parent XE Navbar) · `xe-banner-column` (component only — see notes) | `xe-footer-column`, `xe-nav-drawer-item`, `xe-tile` |
| **Tier 3** | `xe-icon`, `xe-icon-button` (**both also standalone blocks** — see exception below), `xe-button`, `xe-action-link`, `xe-hyperlink` | `xe-search-menu` |

> ⚠️ **Exception — XE Icon is a standalone block (team decision, 2026-10-08).** Ignite's rule is
> that Tier 3 components get no block definition. We still ship `blocks/xe-icon/` as a
> standalone, author-placeable block (any section, no palette restriction) because production code
> (xcel-pws-aem-site) is transferred by copying block folders, and a self-contained block is easier
> to move. The compositions (XE Banner, XE Feature Cards) reuse the block's primitive API instead
> of building `<xe-icon>` themselves. The icon stays **decorative only** — Ignite has no label
> prop; the parent carries the meaning. No "Primitive section" container (decided against).
> **XE Icon Button** (`blocks/xe-icon-button/`, 2026-10-09) follows the same exception and pattern;
> unlike XE Icon it has a **required Accessible Label** field, because Ignite makes `aria-label`
> required on every icon button.

Alignment notes (review before changing — renaming UE ids affects content already authored):
- Our Tier 2 UE item ids differ from the Ignite names: **`xe-feature-card`** (renders `xe-card`) and
  **`xe-navbar-link`** (renders `xe-nav-item`).
- **`xe-banner-column`** exists as a component but **not** as a UE container-child yet: the XE Banner
  block builds one column from its own fields.
- **XE Navbar Action** (`xe-navbar-action`, renders `xe-button`) is a project-specific child item;
  in Ignite's model `xe-button` is Tier 3 (CTA label + URL on the parent).

### Integration rules

- A **design token change** in Ignite flows to AEM automatically via the package version.
- A **component API change** is absorbed by updating the **decorator** — not AEM block artifacts.
- **AEM/EDS controls content authoring and page assembly only.**
- The **Ignite repo is platform-agnostic** — no AEM-specific code belongs there.
- **Tier 3 components follow the `@ignite/web` component API** — slot names, prop names and valid
  attribute values are defined by Ignite, not AEM.

> 🔜 **Path B (future, pending team confirmation of npm access):** install **`@ignite/web`** from the
> Xcel internal GitLab as an npm dependency and **replace our custom `scripts/components/xe-*.js`
> files with direct imports from the package**, one component at a time, **starting with
> `xe-icon`**. Until then (**Path A**), our implementations are **temporary stand-ins** built to the
> Ignite docs. When a component is replaced, delete our file first (two definitions of the same tag
> can't coexist) and keep the block decorators unchanged — they already produce Ignite markup.

## Web Components — required for all new blocks

**Rule (from 2026-09):** every **new** block renders its UI with web components (custom elements).
The block decorator is a thin adapter: it reads the authored rows and builds the custom elements;
all markup, styling and behavior live in the components. Existing `xcel-*` blocks stay as they are
until they are refactored. Reference implementation: `blocks/xe-banner/` + `scripts/components/`.

### Where things live
| What | Where |
|---|---|
| Web components (shared, reusable) | `scripts/components/xe-<name>.js` — one component per file |
| Block adapter | `blocks/<block>/<block>.js` — imports the components it needs |
| Block CSS | `blocks/<block>/<block>.css` — only wrapper layout + slotted light-DOM content |
| Component stories & tests | `scripts/components/xe-<name>.stories.js` / `.test.js` — Storybook title `Design System Primitives/<Category>/<Name>`, matching the DS Storybook |

### Primitives, composite components and blocks — reuse first

Components are layered. Each layer is built from the one below it and never re-implements it.

| Layer | What it is | Rule |
|---|---|---|
| **Primitives** | Small, generic UI pieces with no page-specific content or layout (icon, button, …) | Write once, reuse everywhere. Every block that needs an icon or button uses these — never its own |
| **Composite components** | Larger layout pieces built *from* primitives (banner, card, …) | Reusable across blocks that share the same layout |
| **Blocks** | What authors insert in Universal Editor; maps authored rows to components | One per content pattern; contains no UI of its own |

Because every block shares the same primitives, a brand change (button color, radius, hover…)
is made once in the primitive and applies site-wide.

**Docs status** (see "Building primitives" below): **Verified** = matches a full DS docs page ·
**Partial** = built from an incomplete page or from usage examples, fixes may be pending ·
**Not from DS docs** = built from a design screenshot, DS page not received yet.

**Available primitives:**
| Component | Purpose | Docs status |
|---|---|---|
| `<xe-icon icon="faBolt" size="xs\|sm\|md\|lg\|xl">` | Font Awesome icon, sized from the token scale, color inherited; always decorative. Icons registered at site level (`scripts/icons.js`). Also the standalone **XE Icon** block (`blocks/xe-icon/`) | Verified props (Ignite Storybook, 2026-10-08) · Partial assets: Font Awesome **Free** stand-in for Pro; size px values estimated |
| `<xe-button variant treatment size href>` | Button/link; slots: default, `leading-icon`, `trailing-icon` | Partial (from the banner example only) |
| `<xe-nav-item active href target>` | Navbar link/button; slots: default, `leading-icon` | Verified (tokens still estimated) |
| `<xe-action-link link-type href>` | Labeled link with a trailing direction icon (internal / external / download); color from `--card-text-color` | Partial — **fixes pending** (full docs received 2026-10-01) |
| `<xe-hyperlink href variant trailing-icon link-type target>` | Native link for standalone links, link lists and body copy; optional trailing icon; `variant="variant"` = white for dark surfaces | Verified (2026-10-02; hover/visited states and colors not in the docs — estimates) |
| `<xe-icon-button treatment size href target disabled aria-label>` | Single-icon `<button>` (or `<a>` with `href`), always a 48×48 touch target; slot: an `xe-icon`. Also the standalone **XE Icon Button** block (`blocks/xe-icon-button/`) | Verified (2026-10-09; colors estimated; two documented extensions) |

> These are **Tier 3 internal components** — no block definition is ever needed for them. Authors
> configure them indirectly via Tier 1/2 authoring fields or composition defaults.
> (Exceptions: `xe-nav-item` is **Tier 2** in Ignite's model — a container-child of XE Navbar;
> `xe-icon` is also a standalone block by team decision — see "Where our work sits today".)

**Available composite components:**
| Component | Built from | Purpose | Docs status |
|---|---|---|---|
| `<xe-banner variant size background>` | — | Banner container | Not from DS docs |
| `<xe-banner-column expand align heading-level>` | `xe-icon`, `xe-button` (slotted) | Banner column; slots: `icon`, `heading`, `message`, `action` | Not from DS docs |
| `<xe-navbar label>` | `xe-icon`; `xe-nav-item`, `xe-button` (slotted) | Navigation bar with built-in mobile drawer; slots: `logo`, `nav-items`, `search`, `actions`, `toolbar-selector`, `toolbar-actions` | Verified (search/toolbar contents pending) |
| `<xe-card variant treatment interactive actions-placement>` | `xe-icon`, `xe-action-link` (slotted) | Card surface; sets `--card-text-color`; slots: `icon`, `title`, default (body), `actions`, `decorative` | Partial (from Feature Cards usage) |
| `<xe-feature-cards columns mobile-layout heading subheading header-align background>` | `xe-card` (slotted) | Full-width band of 2–3 equal-height cards; carousel on mobile | Verified |

### Xcel design system — the source of truth for components

Xcel has an `xe-*` design system, documented in its own Storybook under **Design System
Primitives**. Every component in it is a web component: the tag in the docs (e.g.
`<xe-action-link>`) is the custom element name, and its props are the element's attributes.

**We only have the docs, not the code.** So this project builds its own implementation of each
design system component it needs, in `scripts/components/`, and it must match the docs exactly:

- **Same tag name** as the docs (never invent a different name for a component the DS already has).
- **Same attributes, values and defaults** (props shown in camelCase in the docs, e.g. `linkType`,
  are kebab-case attributes in HTML: `link-type`).
- **Same slots** and the **same CSS custom properties** the docs mention (e.g. `--card-text-color`).
- Anything we add beyond the docs is an extra, never a change to documented behavior.
- **The design system wins** over the "Xcel Site Design Spec" below (ALL CAPS arrow CTAs, red
  dots, heading sizes…) for `xe-*` blocks. That spec applies to the existing `xcel-*` blocks.

This keeps blocks visually and structurally consistent with the design system, and means the
official library can replace our implementations later without changing any block.
⚠️ If the official library is ever loaded on the site, remove our file for that component first —
two definitions of the same tag name can't coexist on one page.

**Design system catalog** (from the DS Storybook; ✅ = built in this project):

| Category | Components | In this project |
|---|---|---|
| **Action** | Action Link (`xe-action-link`), Button Group, Button (`xe-button`), Floating Action Button, Hyperlink, Icon Button, Menu Button, Segmented Button, Split Button | ✅ `xe-button`, `xe-action-link`, `xe-hyperlink`, `xe-icon-button` |
| **Content Display** | *(list to be added from the DS docs)* | — |
| **Feedback** | *(list to be added from the DS docs)* | — |
| **Input Control** | *(list to be added from the DS docs)* | — |
| **Layout** | *(list to be added from the DS docs)* | — |
| **Media** | Icon (`xe-icon`) — *rest of the list to be added from the DS docs* | ✅ `xe-icon` |
| **Navigation** | Navbar (`xe-navbar`), Nav Item (`xe-nav-item`) — *rest of the list to be added from the DS docs* | ✅ `xe-navbar`, `xe-nav-item` |
| **Design System Compositions** | Banner (`xe-banner`), Feature Cards (`xe-feature-cards`), Footer (`xe-footer`), Hero, Highlight, Nav Drawer, Navbar (`xe-navbar`), Quick Actions, Tile Group, Utility Actions (+ Multi-card Gallery in the integration strategy) | ✅ `xe-banner`, `xe-feature-cards`, `xe-navbar` |
| *Category to confirm* | Banner Column (`xe-banner-column`), Card (`xe-card`) — Tier 2 children | ✅ both |

Tag names are listed only where they've been seen in the DS docs — confirm the rest from the docs
before building. When a component is built, mark it ✅ here and add it to the tables above.

**Documented specs received so far** (build from these when the component is needed):

- **Icon — `<xe-icon icon size>`** *(Design System Primitives › Media › Icon)* — ✅ built
  2026-10-07 (`scripts/components/xe-icon.js`), standalone block 2026-10-08 (`blocks/xe-icon/`) ·
  **Docs status:** props **Verified** against the Ignite Storybook (2026-10-08) · icons and size
  values **Partial** (Path A stand-in).
  Font Awesome icon wrapper with consistent sizing that inherits its color from the parent text.
  - **Props (Ignite Storybook — only these two):** `icon` (string, no default — Font Awesome name,
    e.g. `faArrowRight`) · `size` (string, default `md`: `xs` · `sm` · `md` · `lg` · `xl`).
    Nothing else — no `label`, no size-override custom property.
  - **Standalone XE Icon block** (`blocks/xe-icon/`, any section): model fields `icon` (select —
    every registered icon as a named option; authors never type names) and `size` (select —
    Extra Small / Small / Medium (default) / Large / Extra Large) — exactly the two Ignite props.
    **Model field names: `ic_icon`, `ic_size`** (2026-10-09) — the `ic` element group, so
    Universal Editor delivers them as **one cell with a `<p>` per field**; the decorator reads each
    `<p>` and still reads blocks published before the rename (one row per field). Template:
    `faArrowRight`, `md`. The icon takes the section's text color.
    (A **Color** dropdown — Inherit / Brand Primary / Brand Accent — was added in #14 and
    **removed 2026-10-09**: the ticket confirmed it isn't needed. Old saved color values are
    ignored.)
  - **Primitive API** (team pattern — see "Primitive rendering pattern" below):
    `buildPrimitive({ icon, size })` returns an `<xe-icon>` (or null if the icon isn't registered) ·
    `decorate(block, props)` / `decoratePrimitive(rowOrCell, props)` reads authored values,
    applies `props` > authored > `DEFAULTS`, renders in place and returns the icon. XE Banner
    delegates its Icon cell (size from its Icon Size style) and builds its button arrow with
    `buildPrimitive`; XE Feature Cards delegates its Category Icon cell (size fixed at `xl`).
  - **Registration before use** — icons are registered once at the site level, never inside a
    component: `scripts/icons.js` calls `registerIcons({ faBolt, … })` (Ignite:
    `@ignite/web/utils/icon-resolver.js`). Every block that renders icons imports
    `scripts/icons.js`; so do Storybook's preview and the tests. To add an icon: add it to
    `scripts/components/icons/fa-free.js` (Font Awesome package shape `{ prefix, iconName, icon:
    [width, height, aliases, unicode, svgPathData] }`) and list it in `scripts/icons.js`.
    `buildPrimitive` checks `isIconRegistered(name)`. An unregistered `<xe-icon>` renders empty
    and fills in when it's registered. A unit test keeps the XE Icon / XE Banner / XE Feature Cards
    dropdowns in sync with the registry.
  - Registered (Ignite's "All Registered Icons"): faPlus, faDownload, faBolt, faArrowRight,
    faExternalLink (alias of faArrowUpRightFromSquare), faChevronRight, faChevronDown, faHeart,
    faUser, faLightbulb, faStar, faRocket, faFire · plus ours: faArrowDown,
    faArrowUpRightFromSquare, faBars, faXmark, faMagnifyingGlass, faFileInvoiceDollar, faLeaf,
    faPiggyBank, faSolarPanel, faWrench · footer brands: faSquareFacebook, faXTwitter,
    faSquareXTwitter, faInstagram, faSquareLinkedin, faYoutube.
  - **Sizes from design tokens** with px fallbacks: `--xe-sizing-icon-xs` 14px · `-sm` 16px ·
    `-md` 20px · `-lg` 28px · `-xl` 36px. ⚠️ Token names are placeholders and the px values
    estimates until the design tokens docs arrive (build-log #I-37). A container that needs a
    one-off size sets `width`/`height` on the element (outer styles beat `:host`) — our link
    components use `1em` / `0.95em` so the icon follows the label.
  - **Color:** inherits the text color (`currentcolor`) — the component sets no color. Override
    with `style="color: …"` or a parent's color. Ignite tokens used in the docs:
    `--xe-color-brand-primary` (dark red) · `--xe-color-brand-accent` (dark green) · gap spacing
    `--xe-spacing-space-2xl`. Our stories use them with fallbacks `#c8102e` / `#00664f` / `24px`
    (fallback values are estimates — build-log #I-41).
  - **Accessibility:** always `aria-hidden="true"` and not focusable. There's no `label`
    attribute — **label the parent, not the icon** (e.g. `aria-label` on the icon button/link).
  - DS stories: Default, Sizes, Color Inheritance, All Registered Icons. We add Social Brands.
  - ⚠️ **Path A stand-in:** Ignite uses Font Awesome **Pro** (`@fortawesome/pro-solid-svg-icons`);
    we use Font Awesome **Free** 7.3.1 (solid + brands) in the same package shape until Pro /
    `@ignite/web` access is confirmed. Some shapes differ (e.g. Ignite's faBolt is an outline).
    Path B: replace `xe-icon.js` and the definitions file with `@ignite/web` + Pro imports —
    `scripts/icons.js` stays the single registration point (build-log #I-36).

- **Icon Button — `<xe-icon-button treatment size href target disabled aria-label>`**
  *(Design System Primitives › Action › Icon Button · DS status: Ready)* — ✅ built 2026-10-09
  (`scripts/components/xe-icon-button.js`, block `blocks/xe-icon-button/`) · **Docs status: Verified**
  (colors estimated). A circular-intent action target for a single icon: `<a>` when `href` is set,
  otherwise `<button>`. **The touch target is always 48×48px**, whatever the icon size.
  - Props → attributes: `treatment` (`default` icon only · `filled` · `outlined`; default
    `default`) · `size` (`xxs` · `xs` · `sm` · `md` · `lg` · `xl` · `2xl`; default `md` — sets
    the slotted `xe-icon`'s size) · `href` (default `''`) · `target` (default `''`; only with
    `href`) · `disabled` (boolean) · `aria-label` (**required**).
  - Slot: default — an `<xe-icon>`.
  - **Accessibility (docs):** `aria-label` is required and forwarded from the host to the inner
    `<button>`/`<a>` (shared `applyLinkBehavior`). For `target="_blank"` the context goes **in the
    label** ("Xcel Energy on Facebook (opens in a new window)") — the component adds no note of its
    own (unlike Hyperlink). `disabled` = native `disabled` on the inner `<button>`.
  - **Extensions beyond the Ignite spec** (documented, tested):
    - **Navbar extension, not in Ignite spec:** `aria-expanded` and `aria-haspopup` are forwarded
      to the inner control, so the navbar's ☰ keeps announcing collapsed/expanded (WCAG 4.1.2).
      `aria-controls` isn't used — an id reference can't cross the shadow DOM boundary.
    - **Sizes `xxs` / `2xl`:** `xe-icon` documents only `xs`–`xl`, so it stays at those five;
      Icon Button sets the slotted icon to `xs` / `xl` and overrides its width/height
      (estimates **12px** / **40px**) with `::slotted()` CSS (build-log #I-43).
    - **Disabled link:** an `<a>` can't be natively disabled, so it loses its `href` and gets
      `aria-disabled="true"`.
  - Shape: the docs text says "circular", the examples show **rounded squares** (8px radius) for
    Filled / Outlined — we follow the examples. Colors (estimates, no tokens documented): icon
    `#5c534e` · filled background `--xe-color-brand-primary` (Ignite's red looks a little darker
    than our `#c8102e` fallback) · outline `#6e6560` · disabled greys. No CSS custom properties are
    documented, so they're private.
  - DS stories: Default, Treatments, Sizes, States, As a link; we add Usage (the docs' examples).
  - **Standalone XE Icon Button block** — fields: **Accessible Label** (text, required) · **Icon**
    (select, every registered icon) · **Icon Size** (select, 7 sizes, default Medium) ·
    **Treatment** (select) · **Link** (text, optional) · **Open In** (Same tab / New tab — shown
    only when Link is set, UE `condition`). Without a label or a registered icon nothing renders;
    for new-tab links the block appends "(opens in a new window)" if the label doesn't mention it.
    Exports `buildPrimitive` / `decorate` / `decoratePrimitive` (props > authored > `DEFAULTS`) —
    ready for the footer's social links.
    **Model field names (2026-10-09): `ib_ariaLabel`, `ib_icon`, `ib_size`, `ib_treatment`,
    `ib_href`, `ib_target`** — the `ib` element group (like XE Icon's `ic_`), so Universal Editor
    delivers them as **one cell with an element per field** (the link as `<p><a>`); the "Open In"
    condition reads `ib_href`. The decorator reads the grouped cell by content, and still reads
    one-row-per-field markup. No field name ends in Title / Type / Text / Alt (field collapse).
  - Used by **XE Navbar** for ☰ (open menu) and ✕ (close menu) — replaced its private 44px button.

- **Action Link — `<xe-action-link link-type href target>`** *(DS status: Ready)* — ✅ built
  (`scripts/components/xe-action-link.js`) · **Docs status: Partial — fixes pending.** Built
  2026-09-28 from the first half of the docs page; the full page (Usage, CSS custom properties,
  Accessibility) was received 2026-10-01.
  A labeled link with a trailing directional icon, for card action slots and other inline actions.
  - `link-type` (default `internal`) controls the trailing icon:
    `internal` → arrow right (navigating within the site) ·
    `external` → arrow up-right (new tab or external site) ·
    `download` → arrow down (downloading a file)
  - `href` — URL the link navigates to.
  - `target` — separate attribute, used together with `link-type="external"` (docs usage):
    `<xe-action-link href="https://example.com" target="_blank" link-type="external">Visit site</xe-action-link>`
  - Label is the default slot.
  - Color inherits from the parent card surface via `--card-text-color`, so it adapts to `xe-card`
    variants (neutral, accent, brand…) with no extra configuration. Docs card example:
    `<xe-card variant="accent" treatment="filled">` with `<div slot="title">` and
    `<xe-action-link slot="actions" href="/solar">Learn more</xe-action-link>`.
  - **CSS custom properties:**
    `--xe-action-link-color` (default: inherits `--card-text-color`) — link and icon color ·
    `--xe-action-link-underline-height` (default `2px`) — thickness of the **animated** underline on
    hover · `--xe-action-link-icon-nudge` (default `0`) — vertical offset for the trailing icon
    (e.g. `1px` to optically align with descenders)
  - **Accessibility:** sets `rel="noopener noreferrer"` automatically when `target="_blank"` ·
    supports `aria-label` when the visible label needs more context ("Learn more about solar
    rebates") · focus ring `outline: 2px solid currentColor`, inheriting the link color.
  - DS stories: Default, External, Download, On Dark Surface.
  - External icon: the docs table says "arrow up-right", but the docs example shows an arrow
    leaving a box, so we use `faArrowUpRightFromSquare` to match the example.
  - Extras we keep: "(opens in a new tab)" for screen readers — shown only when `target="_blank"`;
    the native `download` attribute for `download` links; the icon scales with the label (1em).
  - Fixes pending — see "Pending fixes for components already built" (PF-01).

- **Hyperlink — `<xe-hyperlink href variant trailing-icon link-type target>`** *(DS status: Ready)*
  — ✅ built 2026-10-02 (`scripts/components/xe-hyperlink.js`) · **Docs status: Verified**
  Renders a native anchor with an optional trailing icon. Use it whenever a page needs a link —
  standalone, in a link list (e.g. footer legal row), or inside body copy.
  - Props → attributes: `href` (string) · `variant` (default `default`; `variant` = fixed white for
    dark or colored backgrounds — invisible on light) · `trailingIcon` → `trailing-icon` (boolean,
    default false) · `linkType` → `link-type` (default **`external`**: ↗ · `internal` → · `download`
    ↓ — only used when `trailing-icon` is on) · `target` (e.g. `_blank`). All are also JS
    properties (`el.trailingIcon = true`).
  - Label is the default slot: `<xe-hyperlink href="/careers">Careers</xe-hyperlink>`.
  - Accessibility: native `<a>` semantics · `rel="noopener noreferrer"` added automatically for
    `target="_blank"` · `aria-label` when the visible text isn't descriptive enough (several "Learn
    more" links) · Tab / Shift+Tab / Enter · focus ring on `:focus-visible` only (not on click).
  - DS stories: Default, With Trailing Icon, Variant On Dark (on `var(--xe-color-surface-inverse)`
    — the first DS token name seen), Link List. We add "In Body Text" (wrapping inside a sentence).
  - Note: `link-type` defaults to `external` here but to `internal` on Action Link — copy the docs.
  - Not on the docs page (estimates until confirmed / tokens arrive): CSS custom properties (none
    documented, so the color is private), hover/active/visited states (we underline on hover), the
    default link color (`#23384d`, from the screenshots), whether links inside paragraphs should be
    underlined by default (needed for WCAG 1.4.1 if the color alone distinguishes them).
  - Our extras: `javascript:`/`data:`/`vbscript:` URLs are refused (the DS examples use
    `javascript:void(0)` as a Storybook placeholder) · "(opens in a new tab)" for screen readers with
    `target="_blank"` · Windows high-contrast colors · no transitions with reduced motion.

- **Feature Cards — `<xe-feature-cards>`** *(DS status: Ready)* — ✅ built
  (`scripts/components/xe-feature-cards.js`, block `blocks/xe-feature-cards/`)
  Section-level composition that draws users into narrative and brand content: a full-width band
  of tall cards with an optional heading and body copy. Slot 2–3 `<xe-card>` elements as children.
  - Attributes (values seen in the docs): `columns` (`2` | `3`) · `mobile-layout` (`carousel`) ·
    `heading` · `subheading` · `header-align` (`left`) · `background` (`default`)
  - Rules: 2–3 cards max, all the same height · full-width band, cards fill the width equally ·
    mobile: carousel · each card is entirely clickable
  - Card design: usage — narrative/brand content · format — full-width band, tall cards · band
    content — title, body copy · card content — title, body copy, link · content position —
    vertical-top · style — photo, illustration or solid colors · icons — categorical only
  - Accessibility: no implicit landmark role (add `role="region"` + `aria-label` to the host if it
    should be a named landmark) · slotted `xe-card`s carry their own semantics · the title renders
    as `<h2>`, so make sure that fits the page outline
  - DS stories: default (3 cards), 2 Cards
  - Our choices: the mobile carousel switches on the component's own width (container query),
    not the window; `header-align="center"` and a stacked mobile layout for other
    `mobile-layout` values are extras.

- **Card — `<xe-card>`** — ✅ built from its usage in the Feature Cards docs
  (`scripts/components/xe-card.js`). **The Card docs page itself hasn't been received**, so only
  the values seen so far are supported:
  - `variant`: `surface` (light) · `primary-variant` (dark). The Action Link docs also mention
    `neutral`, `accent`, `brand` — naming to confirm against the Card docs.
  - `treatment`: `filled` · `interactive`: `"true"` (whole card follows its first action link;
    ctrl/cmd-click opens a new tab) · `actions-placement`: `inline`
  - Slots: `icon` (`xe-icon size="xl"`) · `title` (author's `<h3>`) · default (body `<p>`) ·
    `actions` (`xe-action-link`) · `decorative` (`xe-svg` or `<img alt="">`)
  - Sets `--card-text-color` per variant; slotted `xe-action-link`s inherit it.
  - Unknown until we get the Card docs: the `style="--xe-card-decorative-…"` custom property in the
    docs example (cut off in the screenshot), other `treatment` / `actions-placement` values, and
    exact colors/radius (current values are estimates from the screenshots).
  - Not built: `<xe-svg name="…">` (DS illustration component) — use an `<img>` in `decorative`.
  - The Action Link docs show `<xe-card variant="accent" treatment="filled">` with a
    `<div slot="title">` — see PF-03.

- **Navbar — `<xe-navbar>`** *(DS status: Ready)* — ✅ built (`scripts/components/xe-navbar.js`)
  Horizontal navigation bar that collapses to a hamburger layout when the nav items no longer fit
  (content-based, not a fixed breakpoint). The mobile drawer is built in — no manual wiring.
  - Slots: `logo` (always visible) · `nav-items` (`xe-nav-item`, hidden when collapsed) ·
    `search` (`xe-search-bar[collapsed]`) · `actions` (right-aligned, forwarded to the drawer on
    mobile) · `toolbar-selector` (full-width segmented button above the main bar) ·
    `toolbar-actions` (right-aligned toolbar actions: sign in, language selector…)
  - Action forwarding — elements in `actions` / `toolbar-actions`:
    *(none)* navbar + drawer · `data-navbar-only` never in the drawer ·
    `data-drawer-only` drawer only · `data-collapse-to-drawer` navbar on desktop, drawer when collapsed
  - Not in the DS docs yet, so **not built**: how `search` switches between inline and delegate
    routing (needs the Search Bar docs). Our extra: a `stacked` state that moves actions to their
    own row when even the collapsed bar can't fit them (prevents horizontal page scroll).
  - Fixed row heights (our extra, 2026-10-05): toolbar `64px`, bar `72px` (+1px border), so the
    header height is predictable and can be reserved (see "Header/Footer Configuration").
    Overridable via `--xe-navbar-toolbar-height` / `--xe-navbar-bar-height`; the stacked bar is
    `height: auto`.

- **Nav Item — `<xe-nav-item active href target>`** — ✅ built (`scripts/components/xe-nav-item.js`)
  Navigation item for use within `<xe-navbar>`.
  - `active` (boolean, default false) · `href` (URL for link-style items) · `target`
  - Slots: default (label), `leading-icon` (uncommon — most items are text only)
  - Background overlay on hover (8% opacity) and active/pressed (12%); rounded corners from the
    design tokens. **Token values aren't documented yet** — overlay color and radius are estimates
    (`--xe-nav-item-overlay-color: #8b5a3c`, `--xe-nav-item-radius: 8px`) until we get them.
  - DS stories: Default, Active, With Leading Icon.

**Reuse-first checklist — before writing any new component:**
1. Check the tables above. If an existing component fits, use it.
2. Check the **design system catalog**. If the DS has the component, build it to the DS docs
   (tag name, attributes, slots, custom properties) — get the **full** docs page first if we don't
   have it (see "Building primitives" → step 1).
3. If an existing component *almost* fits, extend it with a new attribute or slot (keeping existing
   behavior unchanged) instead of creating a near-duplicate.
4. Only create a **new primitive** that isn't in the DS when nothing else covers the UI element,
   and make it generic enough for other blocks to use (no block-specific names, content or layout).
5. Create a **composite component** only for a layout that more than one block could use;
   otherwise keep the layout in the block adapter.
6. Add every new component to the matching table above, and mark it ✅ in the catalog, in the same PR.

### Building primitives — how we work (agreed 2026-10-01)

**Step 1 — Get the full docs page before building.** Action Link was built from half its page and
missed `target`, `aria-label` and three CSS custom properties (PF-01). Every primitive needs:

| Docs section | Why we need it |
|---|---|
| **Props table** — name, type, default, allowed values | Attributes and defaults |
| **Slots** | What authors and blocks can put inside |
| **Usage** code examples | Shows attributes the props table leaves out (e.g. `target`) |
| **CSS custom properties** | What colors/sizes/spacing other components may override |
| **Accessibility** | `aria-*`, focus, keyboard behavior |
| **Stories** list | The states that must work (Default, Disabled, On Dark Surface…) |

If a section isn't on the page, treat it as **unknown** — don't guess. Record what's missing in the
component's spec entry above. When the user shares docs, first read and compare them with what's
built (gap table + recommendations); change code only when asked.

**Step 2 — Design tokens first.** Colors, radius, spacing and typography are currently estimates
copied into each component. Once the DS token values are received, put them in one shared tokens
file (e.g. `--xe-color-primary`, `--xe-radius-md`) that every component reads. Surfaces such as
cards set context tokens that children inherit (as `--card-text-color` already does for Action
Link). A brand change then happens in one place.

**Step 3 — Build order** (what our blocks already need comes first):

| Priority | Primitive | Why |
|---|---|---|
| 1 | **Button** — verify against its docs | Used by XE Banner and XE Navbar; built from the banner example only |
| 2 | **Action Link** — apply PF-01 | Full docs already received |
| 3 | **Icon Button** — ✅ built 2026-10-09 | Navbar menu / close (done); search; footer social links |
| 4 | **Menu Button** | Navbar language selector; possibly nav dropdowns |
| 5 | **Segmented Button** | Navbar `toolbar-selector` (e.g. Residential / Business) |
| 6 | **Hyperlink** — ✅ built 2026-10-02 | Standalone links, link lists (footer legal row), links in body copy |
| 7 | **Button Group** | Groups of actions in banners and cards |
| 8 | **Split Button**, **Floating Action Button** | Not needed by any block yet |

Then the other categories — **Content Display** (Card), **Input Control** (Search Bar) and
**Feedback** (alerts, e.g. for an announcement bar) unlock the most.

**Step 4 — One shared pattern for every primitive.** Shared helpers in `scripts/components/` so
every primitive gets the same behavior instead of re-implementing it. **Started 2026-10-02:**
`xe-link-helpers.js` (link-type icons, safe `href`, `target`/`rel`, `aria-label` passthrough, focus
ring, "(opens in a new tab)" note, reduced-motion/high-contrast CSS, shared constructable
stylesheets) — used by `xe-hyperlink`; `xe-action-link` moves to it with PF-01. Covers:
- **Shared styles** via one constructable stylesheet per component (`adoptedStyleSheets`), shared by
  all instances — faster than a `<style>` copy per instance.
- **Standard link/button behavior**, written once: `href`, `target`, `rel="noopener noreferrer"` on
  `target="_blank"`, `aria-label` passthrough to the inner control, focus ring
  `outline: 2px solid currentColor`.
- **Properties as well as attributes:** the docs list props in camelCase (`linkType`), so
  `el.linkType = 'external'` should work alongside `link-type="external"` (properties reflect to
  attributes).
- **Respect user settings:** no hover/underline animation under `prefers-reduced-motion: reduce`;
  stay visible in Windows high-contrast mode (`forced-colors: active`).

**Step 5 — Check every component against its docs automatically.** Record each docs page as a
small spec file (props + defaults, slots, CSS custom properties, stories) and add one shared test
that checks each primitive against its spec. Drift from the docs then fails the tests.

**Step 6 — Storybook mirrors the DS Storybook.** Same folders and story names
(*Design System Primitives › Action › Action Link* → Default, External, Download, On Dark Surface),
with controls taken from the spec, so our stories can be reviewed side by side with the official
docs.

**Step 7 — Track docs status.** Keep the **Docs status** column in the component tables above up
to date (Verified / Partial / Not from DS docs) and note the date each docs page was received.

### Pending fixes for components already built

Apply these when the component is next worked on (or when asked). Each fix updates the component,
its story/tests, any block that uses it, the spec entry above, and `docs/build-log.md`.

| ID | Component | Fix | Source |
|---|---|---|---|
| PF-01 | `xe-action-link` | (a) Add a **`target`** attribute; `rel="noopener noreferrer"` follows `target="_blank"`, not `link-type`. (b) **`link-type="external"` only changes the icon** — stop opening a new tab automatically; the XE Feature Cards block sets `target="_blank"` for external links instead. (c) Pass **`aria-label`** to the inner link. (d) Add **`--xe-action-link-color`** (default `--card-text-color`). (e) **Animated** hover underline with thickness **`--xe-action-link-underline-height`** (2px). (f) Add **`--xe-action-link-icon-nudge`** (0) for the icon's vertical offset. (g) Show "(opens in a new tab)" only when `target="_blank"`. | Full Action Link docs, 2026-10-01 |
| PF-02 | `xe-button` | Verify every attribute, value, slot, custom property and accessibility rule against the Button docs page (built from the banner example only). | Waiting for the Button docs |
| PF-03 | `xe-card` | Align `variant` names with the Card docs: our `surface` / `primary-variant` vs `neutral` / `accent` / `brand` in the Action Link docs; title slot used as `<div slot="title">` there. Add the cut-off `--xe-card-decorative-…` property. | Waiting for the Card docs |
| PF-04 | All `xe-*` components | Replace estimated colors/radius/spacing with the DS design tokens (Step 2). | Waiting for the tokens docs |
| PF-05 | All primitives | Move to the shared pattern (Step 4) and add spec-based tests (Step 5). `xe-hyperlink` is the first to follow both (`xe-link-helpers.js`, `DOCS_SPEC` in its test) — use it as the template. | In progress |
| PF-06 | XE Navbar header | Reserve the header height up front, fixed navbar row heights, smaller logo rendition — stops the ~66px page jump (build-log I-24, I-28). Until this is done the shift shows up in every AEM PageSpeed run and can make the check fail (it did on #7 and on #9's first run). | ✅ Done 2026-10-05 (PR #11) — layout shift 0 at 360–1920px; keep `--xe-header-height` in sync with the navbar's content |
| PF-07 | XE Banner block | Reads fields by position — confirm with an empty field in Universal Editor; switch to content detection if a field shifts (build-log I-26). | Needs a UE test |

### Primitive rendering pattern (team doc, 2026-10-08)

Primitives that are also blocks (today: **XE Icon**, **XE Icon Button**) expose two entry points:

- **`buildPrimitive(props)`** — builds and returns the primitive element from plain settings
  (pure, importable).
- **`decorate(block, props)`** — reads authored values from the block, merges optional props,
  replaces the block content. Exported again as **`decoratePrimitive`** for compositions.

Rules:
- Define `DEFAULTS` once, ordered to match the model field order.
- `props` override authored values; authored values override `DEFAULTS`.
- A composition never duplicates the primitive's rendering — it imports and reuses it
  (`decoratePrimitive(rowOrCell, props)` for authored values, `buildPrimitive(props)` for fixed ones).
- Prefixed fields (e.g. `icon_size`) in a composition model let authors configure the primitive
  from inside the composition. Existing compositions keep their current field names (`icon`, Icon
  Size style option) so content already authored keeps working.
- Decorate the row/cell **in place** — don't remove it before calling the primitive decorator.
- Read authored values by **content** (e.g. a size name vs an icon name), not position, because
  Universal Editor skips empty fields. Ignore values you don't recognize, so an old or unknown
  value can't break the rest (e.g. an unknown color never hides the icon).
- **Read authored values with the shared `getBlockProps`** (`scripts/utils/primitive.js`, 2026-10-09)
  — no block keeps its own reader. `getBlockProps(block, DEFAULTS, props, OPTIONS)` returns the
  complete props (`DEFAULTS` < authored < `props`, empty props dropped); `OPTIONS` lists each
  dropdown field's allowed values so it can match them by content:

  ```js
  import { getBlockProps } from '../../scripts/utils/primitive.js';

  export const DEFAULTS = { icon: '', size: 'md' }; // model order, keys without the prefix
  const OPTIONS = { size: ICON_SIZES };             // allowed values of each dropdown field

  export default function decorate(block, props = {}) {
    const el = buildPrimitive(getBlockProps(block, DEFAULTS, props, OPTIONS));
    block.replaceChildren(...(el ? [el] : []));     // not `...(el ?? [])` — an element isn't iterable
    return el;                                      // compositions (XE Banner, XE Feature Cards) use it
  }
  export { decorate as decoratePrimitive };
  ```

  Matching: a link / URL → the `href` (or `url` / `link` / `src`) key · an `fa…` name → `icon` ·
  an allowed value → its dropdown field · other text → the free-text key (e.g. `ariaLabel`) ·
  anything else is ignored. Keep **at most one free-text field** per primitive, so nothing depends on
  order.
- **Transfer to another project:** follow the **copy checklist** at the end of "Model field prefix
  rule" below.

#### Model field prefix rule (agreed 2026-10-09)

Every primitive block's model puts **all its fields in one element group** by giving them the same
short prefix: `<prefix>_<field>`. Universal Editor then delivers the block as **one cell with one
element per field** (a `<p>`; a link as `<p><a>`; aem.live "Element grouping"), and the primitive
can be reused inside compositions without field-name clashes.

| Block | Prefix | Fields |
|---|---|---|
| XE Icon (`blocks/xe-icon/`) | **`ic_`** | `ic_icon`, `ic_size` |
| XE Icon Button (`blocks/xe-icon-button/`) | **`ib_`** | `ib_ariaLabel`, `ib_icon`, `ib_size`, `ib_treatment`, `ib_href`, `ib_target` |
| *next primitive* | *pick a new 2-letter prefix, add it here* | |

Rules:
1. **One prefix per block, on every field** — and on the template defaults
   (`"template": { …, "ic_icon": "faArrowRight", "ic_size": "md" }`). Pick a short, unused prefix
   (usually 2 letters from the block name) and **add it to the table above** before building.
2. **`DEFAULTS` keys are the props without the prefix** (`icon`, `size`), in the same order as
   the model fields. Conditions use the prefixed name (`{ "!!": [{ "var": "ib_href" }] }`).
3. **Design-token options are dropdowns** (`select`): icons (every registered icon, by name),
   sizes, treatments. No free text, no color picker.
4. **Interactive primitives** (buttons, links) have a **required** accessible-label field
   (`<prefix>_ariaLabel`); decorative ones (XE Icon) don't.
5. **No field name may end in `Title`, `Type`, `MimeType`, `Alt` or `Text`** — Universal Editor's
   field collapse would merge it into another field. Each block's test checks this.
6. **The decorator reads the grouped cell by content** — one value per element; match each value by
   what it is (an `fa…` name, a size, a treatment, a link…), never by position, and ignore unknown
   values. It should also read one-row-per-field markup. Use the shared `getBlockProps` for this
   (see "Read authored values with the shared getBlockProps" above).
7. **Renaming fields of a block that's already in use** changes the saved property names: the
   decorator must keep reading the old markup, and authors must re-pick the values in Universal
   Editor before republishing (build-log I-53). New blocks start with the prefix from day one.
8. **Stories and tests build the grouped markup** (one row, one cell, an element per field) so they
   match what Universal Editor delivers.

**Copy checklist (for moving a finished primitive to another project).** These blocks are built and
tested here and then copied by hand to another project, so every primitive PR ends with this list:
- the block folder(s) — including any block it reuses (XE Icon Button → also `blocks/xe-icon/`);
- **`scripts/utils/primitive.js`** — **required by every primitive block** (`getBlockProps`);
- **`scripts/icons.js`** — **required by every block that shows an icon** (XE Icon, XE Icon Button,
  XE Banner, XE Feature Cards, XE Navbar). It registers the icons; without it every icon fails — a
  Font Awesome error and empty icons (what happened in the other project, build-log I-54). Copy
  it **together with `scripts/components/icons/`** (the icon shapes it imports), and copy it again
  whenever an icon is added;
- the component(s) in `scripts/components/` (e.g. `xe-icon.js`, `xe-icon-button.js`) and
  `xe-link-helpers.js` for anything with a link;
- the include in `models/_component-definition.json` and the block id in `models/_section.json`;
- `npm run build:json`, then reload Universal Editor;
- any content to re-author (e.g. after a field rename);
- on a project that loads `@ignite/web` (Path B): don't copy our `scripts/components/xe-*.js` —
  change the component import line at the top of the block file instead.

### Block adapter pattern
```js
import '../../scripts/components/xe-banner.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const cells = [...block.children].map((row) => row.lastElementChild);
  const [headingCell] = cells; // read rows in JCR alphabetical order (see below)

  const banner = document.createElement('xe-banner');
  const heading = document.createElement('span');
  heading.slot = 'heading';
  heading.textContent = headingCell?.textContent.trim() || '';
  moveInstrumentation(headingCell, heading); // keep fields selectable in Universal Editor
  banner.append(heading);

  block.replaceChildren(banner);
}
```
- Style options (size, background, alignment…) come in as block classes via a `classes`
  multiselect and are mapped to component **attributes**.
- Authored content goes into **light-DOM slotted elements** (never into the shadow DOM) so it stays
  crawlable and editable in Universal Editor. Always `moveInstrumentation` onto the slotted element.
- Build elements with `createElement`/`textContent` — don't interpolate authored text into `innerHTML`.

### Component rules
1. **Naming:** `xe-` prefix, kebab-case, e.g. `xe-card`, `xe-card-item`.
2. **Shadow DOM** (`attachShadow({ mode: 'open' })`) with styles in a `<style>` in the shadow root.
   Public API = **attributes + named slots**, documented in a comment at the top of the file.
3. **Register safely:** `if (!customElements.get('xe-x')) customElements.define('xe-x', XeX);`
4. **ESLint:** one class per file (`max-classes-per-file`), `export default class …`.
5. **Units in px, not rem** — `styles/styles.css` sets `html { font-size: 62.5% }`, so `1rem` = 10px.
6. **Font:** `Arial, sans-serif` (brand rule above) and brand colors from the table above.
7. **Theming** via CSS custom properties with fallbacks (`var(--xe-button-accent, #c8102e)`) so
   parents can restyle children — don't hard-set the public custom property on `:host`.
8. **Slotted light-DOM content is styled by the page**, not the component. Style it in the block CSS
   and reset global rules there (e.g. `font: inherit` — the global `p` rule forces Roboto).
9. **Accessibility:** wrap heading slots in a real `<h1>`–`<h6>` inside the shadow root; use a real
   `<a>`/`<button>` for actions (`delegatesFocus: true`); decorative icons get `aria-hidden="true"`.
10. **Hide empty slot wrappers** (listen to `slotchange`) so empty headings/spacing aren't rendered.
11. The stylelint rules above (modern `rgb()`, range media queries) also apply to CSS inside components.

---

## Repeating/Multi-Field Content — use container/filter blocks, NOT composite multi-fields

For any content that repeats (FAQ items, testimonials, gallery images, link lists, etc.), use the
**container block + filter** pattern — a parent block with a `filter` referencing a child
`.../block/item` model, authored as separate repeatable child components in Universal Editor
(see `xcel-quick-links`, `xcel-link-list`, `xcel-faq`, `xcel-testimonials`, `xcel-gallery` for
working examples).

```json
// parent block definition
{ "id": "xcel-faq", "template": { "model": "xcel-faq", "filter": "xcel-faq" } }
// child item definition
{ "id": "xcel-faq-item", "resourceType": "core/franklin/components/block/v1/block/item", "template": { "model": "xcel-faq-item" } }
// filter
{ "id": "xcel-faq", "components": ["xcel-faq-item"] }
```

### ⚠️ Do NOT use `"component": "container"` + `"multi": true` (composite multi-field)

AEM's Universal Editor also supports a **composite multi-field** — a single field of
`"component": "container", "multi": true` with nested `fields`, letting an author click "+ Add"
to repeat a group of sub-fields inline in the properties panel (no separate child components).

**This is confirmed broken on this AEM Cloud Service org as of 2026-09.** The UI works
cosmetically — the "+ Add" button appears, you can fill in fields, even use the content
picker — but **the data is never persisted**. Verified by inspecting raw page source
(`Ctrl+U` → View Page Source, search the block name) after saving: the field's row always
serializes as an empty `<div><div></div></div>`, regardless of how many items were added.
This was diagnosed on the `xcel-link-list` block (PR #3 built it this way, PR #4 replaced it
with the container/filter pattern above once the bug was confirmed).

**Rule:** don't build with `"multi": true` composite container fields until this is verified
fixed by Adobe. If you need to test whether it's fixed, verify with raw View Source (not just
DevTools, which only shows the JS-decorated *output* — it won't reveal whether the underlying
data was actually saved).

A **simple** (non-composite) multi-field — e.g. a single `reference` or `text` field with
`"multi": true` and no `container` wrapper — has not been tested here; it may or may not have
the same issue. Test independently before relying on it.

---

## ESLint Rules (airbnb-base — all fail CI if violated)

### Rule 1 — No `for...of` loops
```js
// WRONG
for (const item of items) { ... }

// RIGHT
items.forEach((item) => { ... });
```

### Rule 2 — No `continue` statement
```js
// WRONG
items.forEach((item) => {
  if (!item) continue;  // banned
  doSomething(item);
});

// RIGHT
items.forEach((item) => {
  if (item) doSomething(item);
});
```

### Rule 3 — No unused variables
```js
// WRONG
const iconImg = picture.querySelector('img');  // declared but never read again

// RIGHT — remove it, or use it
picture.querySelector('img').alt = altText;
```

### Rule 4 — Max line length (100 chars)
- `ignoreStrings: true` and `ignoreTemplateLiterals: true` — string/template lines not checked
- Lines with no strings/templates still get checked — break long `.find()` / `.map()` callbacks to multi-line

---

## Xcel Site Design Spec (extracted from xcelenergy.com screenshots)

These patterns apply to the **`xcel-*` blocks** (and `teaser`). Apply these before writing any
CSS for those blocks.

> **`xe-*` web-component blocks follow the Xcel design system docs instead.** Where the design
> system and this spec disagree (CTA style, red dots, heading size…), **the design system wins**.
> Use this spec for `xe-*` blocks only for things the design system docs don't cover.

> **Sizes are in px.** `styles/styles.css` sets `html { font-size: 62.5% }`, so `1rem` = 10px on
> this site, not 16px. The values below were originally written in rem assuming a 16px base and
> have been converted (e.g. `0.875rem` → `14px`). Write new CSS in px.

---

### Universal Patterns — Apply to every `xcel-*` block

#### 1. Red dots decorator above section headings
Every section heading has 3 small red dots (`•••`) above it.
```css
.my-block-heading::before {
  content: "•••";
  display: block;
  color: #c8102e;
  font-size: 16px;
  letter-spacing: 0.25em;
  margin-bottom: 8px;
}
```
Blocks that need this: `xcel-feature-cards`, `xcel-video-feature`, `teaser`.

#### 2. CTA link style — ALL CAPS + arrow
Every CTA link is ALL CAPS with a `→` arrow and a bottom underline. No filled button background.
```css
.my-block-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #8b1a2c;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: underline;
}
.my-block-cta::after {
  content: "→";
  text-decoration: none;
}
```
Blocks that need this: `xcel-feature-cards`, `xcel-video-feature`, `teaser`.

#### 3. Section heading typography
```css
.my-block-heading {
  font-size: 40px;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1.1;
  margin: 0 0 16px;
}
```

---

### Block-by-Block Design Spec

#### xcel-hero
- **Height:** ~60vh minimum
- **Red accent bar** above heading — short horizontal red line (~32px wide, 4px tall):
```css
.xcel-hero-heading::before {
  content: "";
  display: block;
  width: 32px;
  height: 4px;
  background-color: #c8102e;
  margin-bottom: 16px;
}
```
- Heading: white, bold, large (2 lines on desktop)
- Subheading: white, smaller, below heading

#### xcel-quick-links
- **Full-width dark crimson band** (`#8b1a2c`)
- **"Welcome! Get Started Here"** heading in white, bold, centered
- **4 white outlined buttons** in a row — white border, white text, transparent bg, fills on hover
- **NO icons** — text-only buttons

#### xcel-feature-cards (Affordable Energy / Cleaner Energy — 2–3 cards)
- Red `•••` dots above section heading
- Each card: **photo on top**, then card body below
- **Red left vertical bar** on card title — `border-left: 3px solid #c8102e`
- Card title: bold, dark, ~20px
- ALL CAPS CTA with → arrow at bottom

#### xcel-feature-cards (Personalized Energy — 4 cards / media-object variant)
- Red `•••` dots above section heading
- Each card: cream icon square LEFT (~80px), text RIGHT
- 2×2 grid on desktop
- ALL CAPS CTA with →

#### teaser (Convenient Energy / Safer Energy)
- Two-column: **image LEFT** (~35% width), **text RIGHT**
- White background, red `•••` dots above heading
- ALL CAPS CTA with →

#### teaser (Sustainable Energy)
- Two-column: **text LEFT**, **large illustration RIGHT**
- **Cream background** (`#f5ede8`) on the entire section

#### xcel-video-feature (Local Energy)
- Two-column: **text LEFT**, **video RIGHT**
- Red `•••` dots above heading, ALL CAPS CTA with →

#### xcel-cta-banner (Contact Customer Service)
- Dark crimson background `#8b1a2c`
- **White left vertical bar** — `border-left: 4px solid #fff` on the text container
- Button: white outlined (`border: 2px solid #fff`, transparent bg, fills on hover)

---

## Block vs Core Component

| If it is... | Then build... |
|---|---|
| A custom content pattern (hero, cards, banner, footer) | **Block** — `core/franklin/components/block/v1/block` |
| A standard UI element (button, text, title, image) | **Extend a Core Component** — copy the existing model, change the `id` |

Building a block when a core component exists causes **silent render failure** in the UE canvas — block JS decorators do not run natively in UE.
