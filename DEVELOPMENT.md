# Development Conventions — rapidwhale27661

> **Before starting any task — read both files:**
> 1. **This file** (`DEVELOPMENT.md`) — all coding rules, CSS/ESLint/JCR/design spec
> 2. **`SKILLS-GUIDE.md`** — what skills and agents are available and when to use them
>
> AI agents: `AGENTS.md` summarizes the non-negotiables and points back here.
> History of what's been built: `CHANGELOG.md` · Authoring the XE blocks in Universal Editor:
> `docs/ue-authoring-guide.md`.

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
  (`'/nav'`) and [blocks/footer/footer.js](blocks/footer/footer.js#L17) (`'/footer'`). Changing these two
  lines is how you switch the source page for the **entire site**.
- **Per-page override:** add a `nav` and/or `footer` row to a page's **Metadata** block
  (e.g. `nav` → `/nav-v2`) to point just that page at a different header/footer page, without touching code.
- **Fetch mechanism:** both blocks call `loadFragment(path)` in
  [blocks/fragment/fragment.js](blocks/fragment/fragment.js#L17), which fetches `{rootPath}{path}.plain.html`.
  The target page must be **Previewed + Published** or this 404s.
- **Required content structure for a nav page** (read by [header.js](blocks/header/header.js#L206-L209) as
  5 sections, in this exact order — each section is a section break in the doc):
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

---

## Block Model Rules

1. Define `_block.json` (definitions + models + filters) **before** writing JS
2. Register the block in `models/_component-definition.json` (glob entry)
3. Register the block ID in the section filter in `models/_section.json`
4. Run `npm run build:json` after any model changes to rebuild the generated JSON files
5. Insert the block in UE and inspect the **Content Tree** — verify fields appear inside the correct parent before writing the JS decorator

---

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

**Available primitives:**
| Component | Purpose |
|---|---|
| `<xe-icon icon="faLeaf" size="sm\|md\|lg\|xl">` | Inline SVG icons (Font Awesome Free registry in `xe-icon.js`) |
| `<xe-button variant treatment size href>` | Button/link; slots: default, `leading-icon`, `trailing-icon` |
| `<xe-nav-item active href target>` | Navbar link/button; slots: default, `leading-icon` |
| `<xe-action-link link-type href>` | Labeled link with a trailing direction icon (internal / external / download); color from `--card-text-color` |

**Available composite components:**
| Component | Built from | Purpose |
|---|---|---|
| `<xe-banner variant size background>` | — | Banner container |
| `<xe-banner-column expand align heading-level>` | `xe-icon`, `xe-button` (slotted) | Banner column; slots: `icon`, `heading`, `message`, `action` |
| `<xe-navbar label>` | `xe-icon`; `xe-nav-item`, `xe-button` (slotted) | Navigation bar with built-in mobile drawer; slots: `logo`, `nav-items`, `search`, `actions`, `toolbar-selector`, `toolbar-actions` |
| `<xe-card variant treatment interactive actions-placement>` | `xe-icon`, `xe-action-link` (slotted) | Card surface; sets `--card-text-color`; slots: `icon`, `title`, default (body), `actions`, `decorative` |
| `<xe-feature-cards columns mobile-layout heading subheading header-align background>` | `xe-card` (slotted) | Full-width band of 2–3 equal-height cards; carousel on mobile |

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
| **Action** | Action Link (`xe-action-link`), Button Group, Button (`xe-button`), Floating Action Button, Hyperlink, Icon Button, Menu Button, Segmented Button, Split Button | ✅ `xe-button`, `xe-action-link` |
| **Content Display** | *(list to be added from the DS docs)* | — |
| **Feedback** | *(list to be added from the DS docs)* | — |
| **Input Control** | *(list to be added from the DS docs)* | — |
| **Layout** | *(list to be added from the DS docs)* | — |
| **Media** | *(list to be added from the DS docs)* | — |
| **Navigation** | Navbar (`xe-navbar`), Nav Item (`xe-nav-item`) — *rest of the list to be added from the DS docs* | ✅ `xe-navbar`, `xe-nav-item` |
| *Category to confirm* | Banner (`xe-banner`, `xe-banner-column`), Icon (`xe-icon`), Card (`xe-card`), Feature Cards (`xe-feature-cards`) | ✅ all five |

Tag names are listed only where they've been seen in the DS docs — confirm the rest from the docs
before building. When a component is built, mark it ✅ here and add it to the tables above.

**Documented specs received so far** (build from these when the component is needed):

- **Action Link — `<xe-action-link link-type href>`** *(DS status: Ready)* — ✅ built (`scripts/components/xe-action-link.js`)
  A labeled link with a trailing directional icon, for card action slots and other inline actions.
  - `link-type` (default `internal`) controls the trailing icon:
    `internal` → arrow right (navigating within the site) ·
    `external` → arrow up-right (new tab or external site) ·
    `download` → arrow down (downloading a file)
  - `href` — URL the link navigates to.
  - Label is the default slot: `<xe-action-link link-type="external" href="…">Visit site</xe-action-link>`
  - Color inherits from the parent card surface via `--card-text-color`, so it adapts to `xe-card`
    variants (neutral, accent, brand…) with no extra configuration.
  - DS stories: Default, External, Download, On Dark Surface.
  - External icon: the docs table says "arrow up-right", but the docs example shows an arrow
    leaving a box, so we use `faArrowUpRightFromSquare` to match the example.
  - Our extras (the docs say when to use each type, not how the link behaves): `external` opens
    in a new tab with `rel="noopener noreferrer"` and adds "(opens in a new tab)" for screen
    readers; `download` sets the native `download` attribute. The icon scales with the label (1em).

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
   (tag name, attributes, slots, custom properties) — get the docs page first if we don't have it.
3. If an existing component *almost* fits, extend it with a new attribute or slot (keeping existing
   behavior unchanged) instead of creating a near-duplicate.
4. Only create a **new primitive** that isn't in the DS when nothing else covers the UI element,
   and make it generic enough for other blocks to use (no block-specific names, content or layout).
5. Create a **composite component** only for a layout that more than one block could use;
   otherwise keep the layout in the block adapter.
6. Add every new component to the matching table above, and mark it ✅ in the catalog, in the same PR.

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

These patterns apply to the **`xcel-*` blocks** (and `teaser`). EMA: apply these before writing any
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
