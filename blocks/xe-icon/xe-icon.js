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
 * Fields (JCR alphabetical = model order): icon, size — the only two Ignite props.
 * Authored values are matched by content (a size name or an icon name), so a field Universal
 * Editor skips doesn't shift the others.
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
};

export function buildPrimitive(props = {}) {
  const { icon, size } = { ...DEFAULTS, ...props };
  if (!isIconRegistered(icon)) return null;
  const el = document.createElement('xe-icon');
  el.setAttribute('icon', icon);
  el.setAttribute('size', ICON_SIZES.includes(size) ? size : DEFAULTS.size);
  return el;
}

// A block (rows of cells), a composition row (cells) or a single cell
function readAuthored(el) {
  const cells = el.children.length
    ? [...el.children].map((child) => (child.children.length ? child.lastElementChild : child))
    : [el];
  const authored = {};
  cells.map((cell) => cell.textContent.trim()).filter(Boolean).forEach((value) => {
    const key = ICON_SIZES.includes(value) ? 'size' : 'icon';
    if (!(key in authored)) authored[key] = value;
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
