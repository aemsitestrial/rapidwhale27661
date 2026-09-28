# AGENTS.md — rapidwhale27661

Instructions for AI coding agents working in this repository. The rules themselves live in the
two files below; this file only points to them so every agent and skill starts from the same place.

## Read before any task
1. **`DEVELOPMENT.md`** — all coding rules: CSS/ESLint, JCR field order, block model rules,
   web components (required for new blocks), the Xcel design system catalog, and the design spec.
2. **`SKILLS-GUIDE.md`** — which skill or agent to use for which task.

## Non-negotiables (summary — details in the files above)
- **Workflow:** feature branch → PR → `main`. Never push straight to `main`.
- **New blocks** are built on `xe-*` web components in `scripts/components/`, matching the Xcel
  design system docs (tag names, attributes, slots). Reuse existing components first.
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
