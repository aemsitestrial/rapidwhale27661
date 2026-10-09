import {
  ICON_BUTTON_SIZES, ICON_BUTTON_TREATMENTS,
} from '../../scripts/components/xe-icon-button.js';
import { safeHref } from '../../scripts/components/xe-link-helpers.js';
import { buildPrimitive as buildIcon } from '../xe-icon/xe-icon.js';
import { getBlockProps } from '../../scripts/utils/primitive.js';

/*
 * xe-icon-button — standalone block for <xe-icon-button> (Ignite: Design System Primitives ›
 * Action › Icon Button), following the project's primitive rendering pattern:
 *   buildPrimitive(props)         — returns a configured <xe-icon-button> from plain settings
 *   decorate(block, props)        — standalone: reads the authored values and renders in place
 *   decoratePrimitive(row, props) — the same function, for compositions (e.g. the footer)
 * Precedence: props > authored values > DEFAULTS. The icon itself comes from the XE Icon primitive.
 *
 * Fields: ib_ariaLabel (required), ib_icon, ib_size, ib_treatment, ib_href, ib_target (shown only
 * with a link) — the "ib" element group, so Universal Editor delivers them as ONE cell with one
 * element per field (a <p>; a link as <p><a>), skipping empty fields (aem.live "Element
 * grouping"). Values are read by the shared getBlockProps (scripts/utils/primitive.js) — by
 * content, never by position: a link or URL → href · fa… → icon · a size / treatment / target
 * option → that field · any other text → the label. Unknown values are ignored. One-row-per-field
 * markup (pre-grouping) is read the same way.
 *
 * Accessibility: aria-label is required (Ignite) — without a label or a registered icon nothing is
 * rendered. For new-tab links Ignite puts the context in the label; the block adds
 * "(opens in a new window)" when the author left it out.
 *
 * To use in another project, copy this folder and blocks/xe-icon/, plus scripts/utils/primitive.js,
 * scripts/icons.js (registers the icons — required), scripts/components/xe-icon-button.js,
 * xe-icon.js, xe-link-helpers.js and icons/.
 */

// Ordered to match the model fields (ib_ariaLabel … ib_target)
export const DEFAULTS = {
  ariaLabel: '',
  icon: '',
  size: 'md',
  treatment: 'default',
  href: '',
  target: '_self',
};

export const NEW_WINDOW_NOTE = '(opens in a new window)';

// Allowed values of each dropdown field — how getBlockProps recognizes them
const OPTIONS = {
  size: ICON_BUTTON_SIZES,
  treatment: ICON_BUTTON_TREATMENTS,
  target: ['_self', '_blank'],
};

export function buildPrimitive(props = {}) {
  const {
    ariaLabel, icon, size, treatment, href, target,
  } = { ...DEFAULTS, ...props };
  const label = String(ariaLabel || '').trim();
  const glyph = buildIcon({ icon });
  if (!label || !glyph) return null;

  const button = document.createElement('xe-icon-button');
  button.setAttribute(
    'treatment',
    ICON_BUTTON_TREATMENTS.includes(treatment) ? treatment : DEFAULTS.treatment,
  );
  button.setAttribute('size', ICON_BUTTON_SIZES.includes(size) ? size : DEFAULTS.size);

  const url = safeHref(href);
  const newWindow = Boolean(url) && target === '_blank';
  if (url) button.setAttribute('href', url);
  if (newWindow) button.setAttribute('target', '_blank');
  const needsNote = newWindow && !/new (window|tab)/i.test(label);
  button.setAttribute('aria-label', needsNote ? `${label} ${NEW_WINDOW_NOTE}` : label);

  button.append(glyph);
  return button;
}

/**
 * Renders the icon button in place of the element's content and returns it (or null when the
 * label or a registered icon is missing).
 */
export default function decorate(block, props = {}) {
  const button = buildPrimitive(getBlockProps(block, DEFAULTS, props, OPTIONS));
  block.replaceChildren(...(button ? [button] : []));
  return button;
}

export { decorate as decoratePrimitive };
