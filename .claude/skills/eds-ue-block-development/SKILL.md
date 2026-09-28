# eds-ue-block-development

Create and evolve reusable blocks in Adobe EDS using boilerplate conventions.

## Use When

- Implementing or refactoring blocks under blocks/<block-name>/.
- Adding authorable structure with resilient DOM decoration.
- Improving responsive behavior and accessibility of blocks.

## Responsibilities

- Ensure each block remains self-contained:
  - blocks/<name>/<name>.js
  - blocks/<name>/<name>.css
  - blocks/<name>/_<name>.json
- Build every new block on web components (see "Web Components" in DEVELOPMENT.md):
  - Reuse existing components in scripts/components/ before creating new ones.
  - New components go in scripts/components/xe-<name>.js (shadow DOM, attributes + slots).
  - The block JS is a thin adapter that maps authored rows to component attributes and slots.
- Use robust DOM decoration patterns and tolerate missing authored fields.
- Keep CSS selectors block-scoped and mobile-first.
- Preserve progressive page loading behavior and avoid unnecessary dependencies.
- Add concise comments only where logic is non-obvious.

## Quality Checklist

- New blocks render through xe-* web components; authored content is slotted in light DOM
  with Universal Editor instrumentation moved onto the slotted elements.
- Block renders correctly with partial or missing content.
- Accessibility checks pass for headings, links, and media.
- CSS stays scoped and does not leak outside the block.
- Linting passes for JavaScript and CSS.