import '../../scripts/icons.js';
import { isIconRegistered, ICON_SIZES } from '../../scripts/components/xe-icon.js';
import { getBlockProps } from '../../scripts/utils/primitive.js';

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
 * delivers them as ONE cell with a <p> per field (aem.live "Element grouping"). Authored values
 * are read by the shared getBlockProps (scripts/utils/primitive.js) — by content (an fa… name →
 * icon, a size option → size), never by position; anything else — e.g. an old color value — is
 * ignored. Blocks published before the rename (one row per field) are read too.
 * The icon inherits the surrounding text color (Ignite).
 *
 * Accessibility: the icon is always decorative (aria-hidden) — Ignite has no label prop; the
 * parent carries the meaning. Use the standalone block only for decoration.
 *
 * To use in another project, copy this folder plus scripts/utils/primitive.js, scripts/icons.js
 * (registers the icons — required), scripts/components/xe-icon.js and scripts/components/icons/.
 */

// Ordered to match the model fields (ic_icon, ic_size)
export const DEFAULTS = {
  icon: '',
  size: 'md',
};

// Allowed values of each dropdown field — how getBlockProps recognizes them
const OPTIONS = { size: ICON_SIZES };

export function buildPrimitive(props = {}) {
  const { icon, size } = { ...DEFAULTS, ...props };
  if (!isIconRegistered(icon)) return null;
  const el = document.createElement('xe-icon');
  el.setAttribute('icon', icon);
  el.setAttribute('size', ICON_SIZES.includes(size) ? size : DEFAULTS.size);
  return el;
}

/**
 * Renders the icon in place of the element's content and returns it (or null when the icon
 * isn't registered, e.g. "none").
 */
export default function decorate(block, props = {}) {
  const icon = buildPrimitive(getBlockProps(block, DEFAULTS, props, OPTIONS));
  block.replaceChildren(...(icon ? [icon] : []));
  return icon;
}

export { decorate as decoratePrimitive };
