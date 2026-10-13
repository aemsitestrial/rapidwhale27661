/**
 * XE Icon Button <xe-icon-button aria-label="…" size="md" treatment="default"></xe-icon-button>
 *
 * Model fields:
 *   link_cta          — authored URL (aem-content), read from <a href>
 *   link_ctaText      — accessible label, read from <a> text content
 *   ic_icon           — authored FA name, read from cell <p> content
 *   classes_size      — size token, applied as a CSS class on the block div
 *   classes_treatment — treatment token, applied as a CSS class on the block div
 *   classes_disabled  — boolean, class "disabled" present when true
 *   classes_target    — "_blank" renders as class "blank", applied as CSS class
 *
 * Primitive rendering pattern:
 *   buildPrimitive(props)         — returns a configured <xe-icon-button> from plain settings
 *   decorate(block, props)        — standalone: reads the authored values and renders in place
 *   decoratePrimitive(row, props) — same function, for compositions that delegate a row/cell
 * Precedence: props > authored values > DEFAULTS.
 *
 * Accessibility: aria-label is required (Ignite) — without a label or registered icon nothing
 * is rendered. For new-tab links "(opens in a new window)" is appended when the author omits it.
 *
 * To use in another project, copy this folder and blocks/xe-icon/, plus scripts/utils/primitive.js,
 * scripts/icons.js, scripts/components/xe-icon-button.js, xe-icon.js, xe-link-helpers.js, icons/.
 */
import {
  ICON_BUTTON_SIZES, ICON_BUTTON_TREATMENTS,
} from '../../scripts/components/xe-icon-button.js';
import { safeHref } from '../../scripts/components/xe-link-helpers.js';
import { buildIcon, ICON_OPTIONS } from '../xe-icon/xe-icon.js';
import { getLinkBlockProps } from '../../scripts/utils/primitive.js';

export const DEFAULTS = {
  ariaLabel: '',
  icon: ICON_OPTIONS[0],
  size: 'md',
  treatment: 'default',
  disabled: false,
  href: '',
  target: '',
};

export const NEW_WINDOW_NOTE = '(opens in a new window)';

// link_cta + link_ctaText → read from <a href="…">label</a>
// classes_icon, classes_size, classes_treatment, classes_disabled, classes_target → block classList
const FIELDS = {
  cta: DEFAULTS.href,
  ctaText: DEFAULTS.ariaLabel,
  icon: ICON_OPTIONS,
  size: ICON_BUTTON_SIZES,
  treatment: ICON_BUTTON_TREATMENTS,
  disabled: false,
  target: ['', '_blank', '_self', '_parent', '_top'],
};

export function buildPrimitive(props = {}) {
  const {
    ariaLabel, icon, size, treatment, disabled, href, target,
  } = { ...DEFAULTS, ...props };
  const label = String(ariaLabel || '').trim();
  const glyph = buildIcon({ icon });
  if (!label || !glyph) return null;

  const button = document.createElement('xe-icon-button');
  button.setAttribute('treatment', ICON_BUTTON_TREATMENTS.includes(treatment) ? treatment : DEFAULTS.treatment);
  button.setAttribute('size', ICON_BUTTON_SIZES.includes(size) ? size : DEFAULTS.size);
  if (disabled) button.setAttribute('disabled', '');

  const url = safeHref(href);
  const newWindow = Boolean(url) && target === '_blank';
  if (url) button.setAttribute('href', url);
  if (url && target) button.setAttribute('target', target);

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
  const {
    cta, ctaText, icon, size, treatment, disabled, target,
  } = getLinkBlockProps(block, FIELDS);

  const button = buildPrimitive({
    ariaLabel: ctaText, icon, size, treatment, disabled, href: cta, target, ...props,
  });
  block.replaceChildren(...(button ? [button] : []));
  return button;
}

export { decorate as decoratePrimitive };
