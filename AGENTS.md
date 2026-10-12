# AGENTS.md — rapidwhale27661

Instructions for AI coding agents working in this repository. The rules themselves live in the
two files below; this file only points to them so every agent and skill starts from the same place.

## Read before any task
1. **`DEVELOPMENT.md`** — all coding rules: CSS/ESLint, JCR field order, block model rules,
   web components (required for new blocks), the Xcel design system catalog, and the design spec.
2. **`SKILLS-GUIDE.md`** — which skill or agent to use for which task.

Also useful: **`CHANGELOG.md`** (what's been built, open items), **`docs/build-log.md`** (every
bug/issue we hit — check it before debugging, and log new ones there), and
**`docs/ue-authoring-guide.md`** (how authors use the XE blocks in Universal Editor).

## Non-negotiables (summary — details in the files above)
- **Workflow:** feature branch → PR → `main`. Never push straight to `main`.
- **New blocks** are built on `xe-*` web components in `scripts/components/`, matching the Xcel
  design system docs (tag names, attributes, slots). Reuse existing components first.
- **Primitives:** follow `DEVELOPMENT.md` → "Building primitives" — get the **full** DS docs page
  (props, slots, usage, CSS custom properties, accessibility, stories) before building; check
  **"Pending fixes for components already built"** (PF-xx) and apply the ones for any component you
  touch. When the user shares DS docs, read and compare first; change code only when asked.
- **Ignite three-tier model:** follow `DEVELOPMENT.md` → "Ignite Design System Integration" —
  Tier 1 page blocks (palette), Tier 2 container-children (scoped by filter), Tier 3 internal
  components (no block; configured through Tier 1/2 fields). Our components are stand-ins
  (**Path A**) until `@ignite/web` can be imported (**Path B**). Documented exceptions (the
  standalone XE Icon and XE Icon Button blocks; Icon Button's navbar extension) are listed there —
  don't add new ones without the user's decision.
- **Primitive blocks** (today: XE Icon, XE Icon Button) follow `DEVELOPMENT.md` → "Primitive rendering pattern":
  `buildPrimitive(props)` + `decorate(block, props)` / `decoratePrimitive`; props > authored >
  `DEFAULTS`; compositions reuse the primitive instead of rebuilding it; read authored values by
  content. Author options that map to design tokens (sizes, colors) are **dropdowns**, never free
  text or a color picker. Interactive primitives (buttons, links) need a **required** accessible
  label field.
- **Primitive model fields use one prefix per block** (`ic_` XE Icon, `ib_` XE Icon Button) —
  see `DEVELOPMENT.md` → "Model field prefix rule". Register a new prefix in its table first, and
  finish every primitive PR with its **copy checklist** (the user copies blocks to another project
  that has no AI help). Blocks read their fields with the shared `getBlockProps`
  (`scripts/utils/primitive.js`); the checklist always includes `scripts/utils/primitive.js` and,
  for anything with an icon, `scripts/icons.js` + `scripts/components/icons/`.
- **Commits:** check `git log` after every commit before pushing (see build-log #I-46).
- **Every new or changed block** has a `.stories.js` and `.test.js`; `npm test` and `npm run lint`
  must pass, and Storybook's a11y panel must show 0 violations.
- **Model changes** (`_*.json`): run `npm run build:json` (the pre-commit hook also does this).
- **Before every PR:** run the quality check (`eds-ue-quality-and-publishing` skill).
- **PR description:** follow `.github/pull_request_template.md` (issue link, Before/After test URLs)
  and include a `URL for testing:` section with the branch preview URL:
  `https://<branch-with-dashes>--rapidwhale27661--aemsitestrial.aem.page/`

## Commands
```bash
npm install                 # dependencies (also builds Commerce drop-ins)
npx -y @adobe/aem-cli up --no-open --forward-browser-logs   # local dev server on :3000
npm run lint                # ESLint + Stylelint (CI)
npm test                    # Vitest unit tests (CI)
npm run storybook           # Storybook on :6006
npm run build:json          # rebuild Universal Editor model files
```
