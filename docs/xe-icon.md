# XE Icon — guide

A single Font Awesome icon, sized from the design system's scale, in the color of the text around
it. Built to the Ignite docs (**Design System Primitives › Media › Icon**).

This guide is meant to travel with the block: copy it to the other project together with the
files in [section 6](#6-copy-xe-icon-to-another-project).

**Contents**
1. [What it is](#1-what-it-is)
2. [For authors — Universal Editor](#2-for-authors--universal-editor)
3. [Sizes, color and accessibility](#3-sizes-color-and-accessibility)
4. [Where XE Icon is used](#4-where-xe-icon-is-used)
5. [For developers — how it works](#5-for-developers--how-it-works)
6. [Copy XE Icon to another project](#6-copy-xe-icon-to-another-project)
7. [Add a new icon](#7-add-a-new-icon)
8. [Troubleshooting](#8-troubleshooting)
9. [History and open items](#9-history-and-open-items)

---

## 1. What it is

XE Icon comes in two parts:

| Part | File | What it does |
|---|---|---|
| **Component** `<xe-icon>` | `scripts/components/xe-icon.js` | Draws the icon (an SVG) at a size, in the current text color. Ignite web component. |
| **Block** XE Icon | `blocks/xe-icon/` | What authors add in Universal Editor. Reads the author's choices and creates an `<xe-icon>`. |

The component has exactly the **two Ignite props**:

| Prop | Values | Default |
|---|---|---|
| `icon` | A Font Awesome name, e.g. `faArrowRight` | — |
| `size` | `xs` · `sm` · `md` · `lg` · `xl` | `md` |

```html
<xe-icon icon="faBolt" size="lg"></xe-icon>
```

> In Ignite's model the icon is a **Tier 3** component (normally only used inside other blocks).
> This project also offers it as a **standalone block** — a team decision so blocks are easy to
> copy between projects (DEVELOPMENT.md → "Ignite Design System Integration").

---

## 2. For authors — Universal Editor

**Add it:** select a section → **Add (+)** → **Blocks** → **XE Icon**. It starts as an Arrow Right
icon, Medium.

| Field | Saved as | What to choose |
|---|---|---|
| **Icon** (required) | `ic_icon` | Pick from the list — every icon the site has. Names are never typed |
| **Size** | `ic_size` | Extra Small · Small · **Medium (default)** · Large · Extra Large |

The icon list (31): Arrow Down, Arrow Right, Arrow Up-Right From Square, Bill / Invoice, Chevron
Down, Chevron Right, Close (X Mark), Download, External Link, Facebook, Flame, Gear (Settings),
Heart, Instagram, Leaf, Light Bulb, Lightning Bolt, LinkedIn, Menu (Bars), Pen (Edit), Person, Piggy
Bank, Plus, Rocket, Search (Magnifying Glass), Solar Panel, Star, Wrench, X (Twitter), X (Twitter)
square, YouTube.

**Tips**
- **There's no Color field.** The icon takes the section's text color — dark on light sections,
  white on dark ones.
- **Decoration only.** Screen readers skip icons, so the meaning must be in nearby words (a heading
  or paragraph). Don't use an icon instead of text.
- **Inside a banner or card, use that block's own Icon field** — don't add an XE Icon block next
  to it.
- **XE Icon blocks added before 2026-10-09** (old field names `icon` / `size`): open them, pick
  **Icon** and **Size** again, then publish — otherwise they show nothing after the next publish.

---

## 3. Sizes, color and accessibility

**Sizes** come from design tokens; the pixel values are fallbacks (estimates until the Ignite
design tokens docs arrive):

| Size | Token | Fallback |
|---|---|---|
| `xs` | `--xe-sizing-icon-xs` | 14px |
| `sm` | `--xe-sizing-icon-sm` | 16px |
| `md` (default) | `--xe-sizing-icon-md` | 20px |
| `lg` | `--xe-sizing-icon-lg` | 28px |
| `xl` | `--xe-sizing-icon-xl` | 36px |

An unknown size falls back to `md`. A container that needs a one-off size sets `width` / `height`
on the `<xe-icon>` (our link components use `1em` so the icon follows the text;
XE Icon Button sizes `xxs` / `2xl` itself).

**Color:** the icon is drawn in `currentcolor` — the text color of whatever it sits in. To change
it, set `color` on the icon or on its parent. The component never sets a color itself.

**Accessibility:** the SVG is always `aria-hidden="true"` and not focusable — the icon is
decorative. There is no label prop (Ignite): **label the parent, not the icon** (e.g. the button
or link around it). Interactive icons should be an **XE Icon Button**, which has a required label.

---

## 4. Where XE Icon is used

| Used by | How |
|---|---|
| **XE Icon** block | Standalone, authored Icon + Size |
| **XE Banner** | Its **Icon** field + **Icon Size** style option (default Large) |
| **XE Feature Cards** | Each card's **Category Icon** (always Extra Large) |
| **XE Icon Button** (block and component) | The icon inside the button |
| **XE Navbar** | ☰ / ✕ menu buttons (through XE Icon Button) |
| **Action Link**, **Hyperlink** | The small trailing arrow / external / download icon |

The blocks don't build `<xe-icon>` themselves — they reuse the XE Icon block's
`buildPrimitive()` / `decoratePrimitive()` (see below), so a change happens in one place.

---

## 5. For developers — how it works

### Files

| File | Role |
|---|---|
| `scripts/components/xe-icon.js` | The `<xe-icon>` component, `registerIcons()`, `isIconRegistered()`, `ICON_SIZES` |
| `scripts/icons.js` | **Registers the site's icons** — runs once; every block that shows icons imports it |
| `scripts/components/icons/fa-free.js` | The icon shapes (Font Awesome Free 7.3.1 — stand-in for Pro) |
| `scripts/utils/primitive.js` | `getBlockProps()` — reads the author's values from the block |
| `blocks/xe-icon/_xe-icon.json` | Universal Editor model: `ic_icon`, `ic_size` |
| `blocks/xe-icon/xe-icon.js` | The block decorator |
| `blocks/xe-icon/xe-icon.css` | Block CSS (removes extra line height) |
| `blocks/xe-icon/xe-icon.stories.js` | Storybook: **Blocks › XE Icon** |
| `blocks/xe-icon/xe-icon.test.js` | Block tests |
| `scripts/components/xe-icon.stories.js` / `.test.js` | Storybook **Design System Primitives › Media › Icon** + component tests |

### Icons must be registered first

`<xe-icon>` only draws icons that were registered. `scripts/icons.js` does it once for the site:

```js
import { registerIcons } from './components/xe-icon.js';
import { faBolt, faArrowRight /* … */ } from './components/icons/fa-free.js';

registerIcons({ faBolt, faArrowRight /* … */ });
```

An icon that isn't registered renders **empty** (no error) and fills in as soon as it's
registered. **If `scripts/icons.js` is missing, every icon on the site is empty.**

### What Universal Editor sends

The two fields share the prefix `ic_`, so Universal Editor groups them into **one cell with a `<p>`
per field** (aem.live "Element grouping"):

```html
<div class="xe-icon">
  <div><div><p>faHeart</p><p>xl</p></div></div>
</div>
```

Blocks authored before the rename still have one row per field — that's read too.

### The block decorator (primitive pattern)

```js
import '../../scripts/icons.js';
import { isIconRegistered, ICON_SIZES } from '../../scripts/components/xe-icon.js';
import { getBlockProps } from '../../scripts/utils/primitive.js';

export const DEFAULTS = { icon: '', size: 'md' };   // model order, keys without the ic_ prefix
const OPTIONS = { size: ICON_SIZES };               // allowed values of each dropdown

export function buildPrimitive(props = {}) {        // plain settings → <xe-icon> (or null)
  const { icon, size } = { ...DEFAULTS, ...props };
  if (!isIconRegistered(icon)) return null;
  const el = document.createElement('xe-icon');
  el.setAttribute('icon', icon);
  el.setAttribute('size', ICON_SIZES.includes(size) ? size : DEFAULTS.size);
  return el;
}

export default function decorate(block, props = {}) {
  const icon = buildPrimitive(getBlockProps(block, DEFAULTS, props, OPTIONS));
  block.replaceChildren(...(icon ? [icon] : []));
  return icon;                                      // XE Banner / XE Feature Cards use it
}

export { decorate as decoratePrimitive };
```

- `getBlockProps` matches values **by content, never by position**: an `fa…` name → `icon`, a size
  → `size`; anything else (e.g. an old color value) is ignored.
- Settings priority: **props from the calling block > what the author chose > `DEFAULTS`**.
- Use in another block:
  ```js
  import { buildPrimitive as buildIcon, decoratePrimitive as decorateIcon } from '../xe-icon/xe-icon.js';

  const arrow = buildIcon({ icon: 'faArrowRight', size: 'sm' });   // fixed icon
  const icon = decorateIcon(iconCell, { size: 'lg' });             // authored icon, size set by you
  ```

### Storybook and tests

```bash
npm run storybook    # http://localhost:6006 → Blocks › XE Icon, Design System Primitives › Media › Icon
npm test             # includes blocks/xe-icon/xe-icon.test.js and scripts/components/xe-icon.test.js
```

The tests check the model against the Ignite props (only `ic_icon` / `ic_size`, 5 sizes, default
md), that every dropdown option is a registered icon (XE Icon, XE Icon Button, XE Banner,
XE Feature Cards), the grouped and old markup, and that old color values are ignored.

---

## 6. Copy XE Icon to another project

Copy with the **same folder paths**:

| Copy | Required? |
|---|---|
| `blocks/xe-icon/` (whole folder) | ✅ |
| `scripts/components/xe-icon.js` | ✅ |
| **`scripts/icons.js`** | ✅ **Required — registers the icons. Without it: a Font Awesome error and every icon is empty** |
| **`scripts/components/icons/`** (whole folder) | ✅ Required by `scripts/icons.js` |
| `scripts/utils/primitive.js` | ✅ Required by the block |
| `docs/xe-icon.md` (this guide) | Recommended |

Then register the block in that project:

1. `models/_component-definition.json` — in the Blocks group:
   ```json
   { "...": "../blocks/xe-icon/_*.json#/definitions" }
   ```
2. `models/_section.json` — add `"xe-icon"` to the section filter's `components`.
3. Run `npm run build:json`, then reload Universal Editor.
4. If that project already had XE Icon blocks with the old field names, re-pick **Icon** and
   **Size** on them before publishing.

**On a project that loads the real Ignite components (`@ignite/web`, "Path B"):** don't copy
`scripts/components/xe-icon.js` / `icons/`; register icons with Ignite's
`@ignite/web/utils/icon-resolver.js` and Font Awesome Pro instead. The block files stay the same.

---

## 7. Add a new icon

Example: adding `faCalendar`.

1. **Add its shape** to `scripts/components/icons/fa-free.js`, in the same format as the others —
   copy it from the Font Awesome Free npm package (`@fortawesome/free-solid-svg-icons`, or
   `free-brands-svg-icons` for logos):
   ```js
   export const faCalendar = {
     prefix: 'fas',
     iconName: 'calendar',
     icon: [448, 512, [], '', 'M96 32…'],  // width, height, aliases, unicode, SVG path
   };
   ```
2. **Register it** in `scripts/icons.js` (import it and add it to `registerIcons({ … })`).
3. **Offer it to authors** — add `{ "name": "Calendar", "value": "faCalendar" }` to the Icon list in
   `blocks/xe-icon/_xe-icon.json` **and** `blocks/xe-icon-button/_xe-icon-button.json` (in
   alphabetical order by name). XE Banner / XE Feature Cards lists are optional.
4. `npm run build:json`, `npm test` (a test fails if a dropdown lists an unregistered icon — and if
   XE Icon / XE Icon Button don't offer every registered icon).
5. In the other project: copy `scripts/icons.js`, `scripts/components/icons/fa-free.js` and the two
   model files again, then `npm run build:json`.

---

## 8. Troubleshooting

| What you see | Likely cause | Fix |
|---|---|---|
| Font Awesome error in the console, icons empty everywhere | `scripts/icons.js` (or `scripts/components/icons/`) not copied | Copy both (section 6) |
| One icon is empty | The icon isn't registered | Add it (section 7) |
| XE Icon block shows nothing | No icon chosen, or an old block after the field rename | Open it in Universal Editor, pick Icon + Size, publish |
| XE Icon block shows text like "faHeart md" | The block's JS didn't load (404) — e.g. `blocks/xe-icon/xe-icon.js` missing on that branch/project | Copy / restore the block folder |
| "failed to load module for xe-icon" | `scripts/utils/primitive.js` missing | Copy it |
| XE Icon not in the component list | Not registered in `models/_component-definition.json` / `models/_section.json`, or `build:json` not run | Section 6, steps 1–3; reload Universal Editor |
| Icon has the wrong color | It follows the text color | Change the section / parent text color — there's no icon color field |
| Changes don't show in a local workspace preview (not Universal Editor) | That panel can show an old local copy of the page | Check the real preview: `https://main--<repo>--<owner>.aem.page/` after publishing |

---

## 9. History and open items

| Date | Change | PR |
|---|---|---|
| 2026-10-07 | `xe-icon` rebuilt to the Ignite Icon docs: `registerIcons()`, xs–xl sizes, no `label` | #12 |
| 2026-10-08 | Standalone **XE Icon** block (primitive pattern) | #13 |
| 2026-10-08 | Color dropdown added | #14 |
| 2026-10-09 | Color removed (ticket); fields renamed to `ic_icon` / `ic_size` | #20 |
| 2026-10-09 | Shared `getBlockProps` (`scripts/utils/primitive.js`) | #23 |

**Open (waiting for the design team):**
- **Font Awesome Pro** — we use Free as a stand-in; some shapes differ (build-log I-36).
- **Design tokens** — size token names and px values are estimates (I-37).
- **"Banner - Action" composition docs** — to test the icon at composition level as the ticket asks.

More detail: `DEVELOPMENT.md` (Icon spec, "Primitive rendering pattern", "Model field prefix
rule"), `docs/ue-authoring-guide.md` (XE Icon step by step), `docs/build-log.md`.
