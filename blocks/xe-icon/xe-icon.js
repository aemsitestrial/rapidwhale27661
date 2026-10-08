import '../../scripts/icons.js';
import { isIconRegistered, ICON_SIZES } from '../../scripts/components/xe-icon.js';

/*
 * xe-icon — standalone block for <xe-icon> (Ignite: Design System Primitives › Media › Icon),
 * following the project's primitive rendering pattern:
 *   buildPrimitive(props)         — returns a configured <xe-icon> from plain settings
 *   decorate(block, props)        — standalone: reads the authored values and renders in place
 *   decoratePrimitive(row, props) — the same function, for compositions that delegate a row or
 *                                   cell to this primitive (XE Banner, XE Feature Cards)
 * Precedence: props > authored values > DEFAULTS.
 *
 * Fields: icon, size (the two Ignite props) and color (the Ignite Storybook "color" control —
 * applied as style="color: …", like the docs; not an <xe-icon> attribute). Authored values are
 * matched by content (a size, a color option or an icon name), not by row position, so JCR's
 * alphabetical row order and fields Universal Editor skips don't matter.
 * Color options are brand tokens only (no free color picker — keeps icons on brand). The
 * fallbacks are estimates until the design tokens docs arrive.
 *
 * Accessibility: the icon is always decorative (aria-hidden) — Ignite has no label prop; the
 * parent carries the meaning. Use the standalone block only for decoration.
 *
 * To use in another project, copy this folder plus scripts/icons.js and
 * scripts/components/xe-icon.js + scripts/components/icons/.
 */

// Ordered to match the model fields
export const DEFAULTS = {
  icon: '',
  size: 'md',
  color: 'inherit',
};

// Color option → CSS color. "inherit" sets nothing, so the icon follows the parent's text color.
export const ICON_COLORS = {
  inherit: '',
  'brand-primary': 'var(--xe-color-brand-primary, #c8102e)',
  'brand-accent': 'var(--xe-color-brand-accent, #00664f)',
};

const isColor = (value) => Object.prototype.hasOwnProperty.call(ICON_COLORS, value);

export function buildPrimitive(props = {}) {
  const { icon, size, color } = { ...DEFAULTS, ...props };
  if (!isIconRegistered(icon)) return null;
  const el = document.createElement('xe-icon');
  el.setAttribute('icon', icon);
  el.setAttribute('size', ICON_SIZES.includes(size) ? size : DEFAULTS.size);
  if (isColor(color) && ICON_COLORS[color]) el.style.color = ICON_COLORS[color];
  return el;
}

// A block (rows of cells), a composition row (cells) or a single cell
function readAuthored(el) {
  const cells = el.children.length
    ? [...el.children].map((child) => (child.children.length ? child.lastElementChild : child))
    : [el];
  const authored = {};
  cells.map((cell) => cell.textContent.trim()).filter(Boolean).forEach((value) => {
    let key;
    if (ICON_SIZES.includes(value)) key = 'size';
    else if (isColor(value)) key = 'color';
    else if (/^fa[A-Z]/.test(value)) key = 'icon';
    // Anything else (an old or unknown value) is ignored, so it can't hide the icon
    if (key && !(key in authored)) authored[key] = value;
  });
  return authored;
}

const defined = (props) => Object.fromEntries(
  Object.entries(props).filter(([, value]) => value !== undefined && value !== null && value !== ''),
);

/**
 * Renders the icon in place of the element's content and returns it (or null when the icon
 * isn't registered, e.g. "none").
 */
export default function decorate(block, props = {}) {
  const icon = buildPrimitive({ ...DEFAULTS, ...readAuthored(block), ...defined(props) });
  block.replaceChildren(...(icon ? [icon] : []));
  return icon;
}

export { decorate as decoratePrimitive };
