# Building pages with the XE blocks in Universal Editor

A step-by-step guide to laying out a page on the Universal Editor canvas with the `xe-*` blocks
built on the Xcel design system web components. For developers building new components, see
`DEVELOPMENT.md` → "Web Components".

---

## 0. Before you start

- **The blocks appear in Universal Editor once their PRs are merged into `main`** (#2 → #3 → #4 →
  #5 → #6, in that order). Until then they only exist on the feature branches.
- Open the page: **AEM Sites console → select the page → Edit**. The page opens in Universal Editor.
- On the right you'll use two panels: **Properties** (fields of whatever is selected) and the
  **Content Tree** (the page's sections, blocks and items — use it to select, reorder and delete).

## 1. Know what you're placing

Authors only ever place **blocks**. Each block is rendered by design system web components:

| Block you add | What it renders | Use it for |
|---|---|---|
| **XE Navbar** | `xe-navbar` + `xe-nav-item` + `xe-button` | A navigation bar with logo, links and actions; collapses to a menu on mobile |
| **XE Banner** | `xe-banner` + `xe-icon` + `xe-button` | A message band: icon, big heading, short message, one button |
| **XE Feature Cards** | `xe-feature-cards` + `xe-card` + `xe-action-link` | A full-width band of 2–3 tall cards that draw users into narrative/brand content |

> The site header (from the `/nav` page) still appears at the top of every page. XE Navbar is a
> separate block you place yourself.

## 2. Plan the layout

A typical landing page, top to bottom — **one block per section**, so each band can run full width:

| Section | Block | Tip |
|---|---|---|
| 1 | XE Navbar | Only if the page needs its own navigation |
| 2 | XE Banner | The page's main message; heading level **H1** if it's the page title |
| 3 | XE Feature Cards | 2–3 cards; band heading optional |
| 4+ | Other blocks / default content | Text, images, other xcel blocks |

Check the **heading outline** as you go: one H1 per page, then H2s for sections. Feature Cards'
band heading is an H2, and its card titles become H3 (or H2 when there's no band heading).

## 3. Add a section

1. In the **Content Tree**, select **Main** (or an existing section).
2. Click **Add (+)** → **Section**.
3. Repeat for each band in your plan.

## 4. Add a block to a section

1. Select the section in the Content Tree.
2. Click **Add (+)** → under **Blocks** choose **XE Navbar**, **XE Banner** or **XE Feature Cards**.
3. The block appears on the canvas with starter content. Select it to edit its fields in
   **Properties**.

---

## 5. XE Navbar — step by step

**Block fields** (select the XE Navbar):

| Field | What to enter |
|---|---|
| Logo | Pick the logo image from Assets |
| Logo Alt Text | The brand name, e.g. "Xcel Energy" (read by screen readers) |
| Logo Link | Usually `/` (home) |

**Add links:** select the XE Navbar → **Add (+)** → **XE Navbar Link**. Repeat per link.

| Field | What to enter |
|---|---|
| Label *(required)* | Short text, 1–3 words |
| Link *(required)* | The page it goes to |
| Open in new tab | Only for external sites |

The link for the page you're on is highlighted automatically.

**Add actions** (buttons like "Pay Bill", "Sign In"): select the XE Navbar → **Add (+)** →
**XE Navbar Action**.

| Field | Options |
|---|---|
| Label, Link *(required)* | Button text and destination |
| Location | **Main bar (right side)** or **Top toolbar (right side)** — the thin cream bar above |
| On mobile | **Navbar and menu** · **Navbar only** · **Menu only** · **Navbar on desktop, menu on mobile** |
| Button Style | Outlined · Filled · Text |

**Layout tips**
- Keep it to about 4–6 links; when they don't fit, the navbar switches to the ☰ menu by itself.
- Use **Filled** for the single most important action; Outlined/Text for the rest.
- Set secondary actions to **Navbar on desktop, menu on mobile** so phones stay uncluttered.
  If too many actions stay visible on a phone, they move to their own row under the logo.
- Reorder links/actions by dragging them in the Content Tree.

---

## 6. XE Banner — step by step

| Field | What to enter |
|---|---|
| Style | Pick **one option from each group**: Spacing (Compact / Default / Generous), Background (White / Cream / Crimson / Dark), Alignment (Left / Center), Button Style (Outlined / Filled) |
| Icon | Leaf, Lightning Bolt, Light Bulb, Piggy Bank, Flame — or None |
| Heading | Short and punchy (it's shown in capitals) |
| Heading Level | H1 if it's the page title, otherwise H2 |
| Message | One or two sentences |
| Button Label + Button Link | Leave both empty for no button |

**Layout tips**
- Generous spacing + Center alignment matches the design system example.
- On Crimson or Dark backgrounds, text and button turn white automatically.
- Don't leave only one of Button Label / Button Link filled. Test once with an empty field and
  check the rest still shows (see "Still open" in `CHANGELOG.md`).

---

## 7. XE Feature Cards — step by step

**Band fields** (select the XE Feature Cards block — both optional):

| Field | What to enter |
|---|---|
| Band Heading | The section title (H2), e.g. "Programs for your home" |
| Band Body Copy | One sentence under the heading |

**Add cards:** select the block → **Add (+)** → **XE Feature Card**. Add **2 or 3** — a 4th won't
be shown (design system rule).

| Field | What to enter |
|---|---|
| Title *(required)* | 1–3 words (shown in capitals) |
| Body Copy | One or two sentences |
| Link *(required)* | Where the card goes — the **whole card is clickable** |
| Link Label | Defaults to "Learn More" |
| Link Type | Internal (→) · External, opens a new tab (↗) · Download (↓) |
| Category Icon | Only a categorical icon (design system rule) — or None |
| Illustration or Photo | Shown at the bottom of the card; decorative, so no alt text needed |
| Card Color | **Surface** (light) or **Primary variant** (dark) |

**Layout tips**
- Follow the design system rhythm: **light – dark – light** for three cards, or light – dark for two.
- Keep titles and body copy a similar length across cards — cards always share one height, so one
  long card makes all of them tall.
- Style: photo, illustration or solid colors — pick one style for the whole band.
- On phones the cards become a swipeable carousel; the next card peeks in automatically.
- Reorder cards by dragging them in the Content Tree.

---

## 8. Check the layout

1. **Canvas:** click through each block and confirm the content is right.
2. **Mobile:** use Universal Editor's device preview if available, or **Preview** the page and
   make the browser window narrow. Check: navbar ☰ menu opens and closes, feature cards swipe,
   nothing scrolls sideways.
3. **Saved data:** open the preview page → **View Page Source** (Ctrl+U) → search for the block
   name and confirm your fields are there. (DevTools only shows the decorated result, not whether
   the data was saved.)

## 9. Publish

1. In Universal Editor click **Publish** (Preview first if your process requires it).
2. Check the page on:
   - Preview: `https://main--rapidwhale27661--aemsitestrial.aem.page/<page-path>`
   - Live: `https://main--rapidwhale27661--aemsitestrial.aem.live/<page-path>`

---

## Checklist before publishing

- [ ] One H1 on the page; section headings are H2
- [ ] Logo has alt text; decorative card images don't need it
- [ ] Feature Cards has 2–3 cards, each with a title and a link
- [ ] Icons are categorical only (they describe the topic, not decoration)
- [ ] Only one **Filled** button per band/navbar
- [ ] Checked on a narrow screen (menu, carousel, no sideways scrolling)

## Troubleshooting

| Problem | Likely cause / fix |
|---|---|
| An XE block isn't in the **Add** list | Its PR isn't merged into `main` yet |
| A card or link doesn't appear | It's missing its required Title or Link |
| A fourth card doesn't show | By design — Feature Cards shows 2–3 cards |
| Fields look empty after saving | Check View Page Source (step 8); report the block and field to the dev team |
| Colors/spacing look slightly off vs. the design system | Expected for now — exact design tokens are still to be received |
