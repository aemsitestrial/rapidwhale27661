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
 * Fields: ic_icon, ic_size — the two Ignite props, in the "ic" element group, so Universal Editor
 * delivers them as ONE cell with a <p> per field (aem.live "Element grouping"). Blocks published
 * before the rename (one row per field: icon, size, and the removed color) are read too. Values
 * are matched by content (an icon name or a size), not position; anything else — e.g. an old
 * color value — is ignored. The icon inherits the surrounding text color (Ignite).
 *
 * Accessibility: the icon is always decorative (aria-hidden) — Ignite has no label prop; the
 * parent carries the meaning. Use the standalone block only for decoration.
 *
 * To use in another project, copy this folder plus scripts/icons.js and
 * scripts/components/xe-icon.js + scripts/components/icons/.
 */

// Ordered to match the model fields (ic_icon, ic_size)
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

// A block (rows of cells), a composition row (cells) or a single cell → its text values.
// A grouped cell (<p> per field) yields one value per <p>.
function readValues(el) {
  const cells = el.children.length
    ? [...el.children].map((child) => (child.children.length ? child.lastElementChild : child))
    : [el];
  return cells
    .flatMap((cell) => {
      const parts = cell.querySelectorAll?.(':scope > p');
      return parts?.length > 1 ? [...parts] : [cell];
    })
    .map((node) => node.textContent.trim())
    .filter(Boolean);
}

function readAuthored(el) {
  const authored = {};
  readValues(el).forEach((value) => {
    let key;
    if (ICON_SIZES.includes(value)) key = 'size';
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
