import {
  ICON_BUTTON_SIZES, ICON_BUTTON_TREATMENTS,
} from '../../scripts/components/xe-icon-button.js';
import { safeHref } from '../../scripts/components/xe-link-helpers.js';
import { buildPrimitive as buildIcon } from '../xe-icon/xe-icon.js';

/*
 * xe-icon-button — standalone block for <xe-icon-button> (Ignite: Design System Primitives ›
 * Action › Icon Button), following the project's primitive rendering pattern:
 *   buildPrimitive(props)         — returns a configured <xe-icon-button> from plain settings
 *   decorate(block, props)        — standalone: reads the authored values and renders in place
 *   decoratePrimitive(row, props) — the same function, for compositions (e.g. the footer)
 * Precedence: props > authored values > DEFAULTS. The icon itself comes from the XE Icon primitive.
 *
 * Fields: ariaLabel (required), icon, size, treatment, href, target (shown only with a link).
 * Authored values are matched by content, not row position (JCR delivers rows alphabetically and
 * skips empty fields): a link or URL → href · fa… → icon · a size / treatment / target option →
 * that field · any other text → the label. Unknown values are ignored.
 *
 * Accessibility: aria-label is required (Ignite) — without a label or a registered icon nothing is
 * rendered. For new-tab links Ignite puts the context in the label; the block adds
 * "(opens in a new window)" when the author left it out.
 *
 * To use in another project, copy this folder and blocks/xe-icon/, plus scripts/icons.js,
 * scripts/components/xe-icon-button.js, xe-icon.js, xe-link-helpers.js and icons/.
 */

// Ordered to match the model fields
export const DEFAULTS = {
  ariaLabel: '',
  icon: '',
  size: 'md',
  treatment: 'default',
  href: '',
  target: '_self',
};

const TARGETS = ['_self', '_blank'];
export const NEW_WINDOW_NOTE = '(opens in a new window)';
const isUrl = (text) => /^(\/|#|https?:\/\/|mailto:|tel:)/.test(text);

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

// A block (rows of cells), a composition row (cells) or a single cell
function readAuthored(el) {
  const cells = el.children.length
    ? [...el.children].map((child) => (child.children.length ? child.lastElementChild : child))
    : [el];
  const authored = {};
  const set = (key, value) => { if (!(key in authored)) authored[key] = value; };
  cells.forEach((cell) => {
    const link = cell.querySelector?.('a');
    const value = cell.textContent.trim();
    if (link) set('href', link.getAttribute('href'));
    else if (/^fa[A-Z]/.test(value)) set('icon', value);
    else if (ICON_BUTTON_SIZES.includes(value)) set('size', value);
    else if (ICON_BUTTON_TREATMENTS.includes(value)) set('treatment', value);
    else if (TARGETS.includes(value)) set('target', value);
    else if (isUrl(value)) set('href', value);
    else if (value) set('ariaLabel', value);
  });
  return authored;
}

const defined = (props) => Object.fromEntries(
  Object.entries(props).filter(([, value]) => value !== undefined && value !== null && value !== ''),
);

/**
 * Renders the icon button in place of the element's content and returns it (or null when the
 * label or a registered icon is missing).
 */
export default function decorate(block, props = {}) {
  const button = buildPrimitive({ ...DEFAULTS, ...readAuthored(block), ...defined(props) });
  block.replaceChildren(...(button ? [button] : []));
  return button;
}

export { decorate as decoratePrimitive };
