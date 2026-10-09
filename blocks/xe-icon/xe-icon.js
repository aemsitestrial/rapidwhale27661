import '../../scripts/icons.js';
import { isIconRegistered, ICON_SIZES } from '../../scripts/components/xe-icon.js';
import getBlockProps, { defined } from '../../scripts/utils/primitive.js';

/*
 * xe-icon — standalone block for <xe-icon> (Ignite: Design System Primitives › Media › Icon),
 * following the project's primitive rendering pattern:
 *   buildPrimitive(props)         — returns a configured <xe-icon> from plain settings
 *   decorate(block, props)        — standalone: reads the authored values and renders in place
 *   decoratePrimitive(row, props) — the same function, for compositions that delegate a row or
 *                                   cell to this primitive (XE Banner, XE Feature Cards)
 * Precedence: props > authored values > DEFAULTS.
 *
 * Fields: icon, size — the two Ignite props. Authored values are read via getBlockProps
 * (scripts/utils/primitive.js), by content: icon (fa prefix) and the size options
 * (FIELD_OPTIONS) — a skipped field or an unknown value is ignored. That includes the old
 * "color" values still saved on blocks authored before the Color field was removed (2026-10-09).
 * The icon inherits the surrounding text color (Ignite) — set color on the section, not the icon.
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

// Allowed values of the select fields — matched by content, never by position
const FIELD_OPTIONS = {
  size: ICON_SIZES,
};

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
  const authored = getBlockProps(block, DEFAULTS, FIELD_OPTIONS);
  const icon = buildPrimitive({ ...DEFAULTS, ...authored, ...defined(props) });
  block.replaceChildren(...(icon ? [icon] : []));
  return icon;
}

export { decorate as decoratePrimitive };
