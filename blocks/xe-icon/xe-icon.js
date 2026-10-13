import '../../scripts/icons.js';
import { isIconRegistered, ICON_SIZES, registeredIconNames } from '../../scripts/components/xe-icon.js';

// The authoring dropdown (ic_icon here, classes_icon in xe-icon-button): the 13 icons of the Ignite
// docs (Design System Primitives › Media › Icon), in the docs' order. Keep the models' options in
// sync — xe-icon.test.js checks it.
export const ICON_OPTIONS = [
  'faPlus', 'faDownload', 'faBolt', 'faArrowRight', 'faExternalLink', 'faChevronRight',
  'faChevronDown', 'faHeart', 'faUser', 'faLightbulb', 'faStar', 'faRocket', 'faFire',
];

// Every registered icon — used to READ authored values, so blocks saved with an icon that's no
// longer in the dropdown (e.g. faGear) keep rendering. The navbar, links and footer need the
// other registered icons, so they stay registered (scripts/icons.js).
export const ICON_NAMES = registeredIconNames();

/*
 * xe-icon — standalone block for <xe-icon> (Ignite: Design System Primitives › Media › Icon),
 * following the project's primitive rendering pattern:
 *   buildPrimitive(props)         — returns a configured <xe-icon> from plain settings
 *   decorate(block, props)        — standalone: reads the authored values and renders in place
 *   decoratePrimitive(row, props) — the same function, for compositions that delegate a row or
 *                                   cell to this primitive (XE Banner, XE Feature Cards)
 * Precedence: props > authored values > DEFAULTS.
 *
 * Fields: ic_icon (content field — FA name as text), classes_size (CSS class on block).
 * ic_icon is read from the block's first <p> text content; classes_size from block.classList.
 * The icon inherits the surrounding text color (Ignite).
 *
 * Accessibility: the icon is always decorative (aria-hidden) — Ignite has no label prop; the
 * parent carries the meaning. Use the standalone block only for decoration.
 *
 * To use in another project, copy this folder plus scripts/utils/primitive.js, scripts/icons.js
 * (registers the icons — required), scripts/components/xe-icon.js and scripts/components/icons/.
 */

// Ordered to match the model fields (ic_icon, classes_size)
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

// Alias used by xe-icon-button and other compositions
export { buildPrimitive as buildIcon };

/**
 * Renders the icon in place of the element's content and returns it (or null when the icon
 * isn't registered, e.g. "none").
 */
export default function decorate(block, props = {}) {
  // ic_icon: FA name — scan only leaf elements so concatenated text doesn't bleed across values
  const iconText = [block, ...block.querySelectorAll('*')]
    .filter((el) => el.childElementCount === 0)
    .map((el) => el.textContent.trim())
    .find((t) => /^fa[A-Z]\w*$/.test(t));
  const icon = props.icon || iconText || DEFAULTS.icon;
  // classes_size: size token applied as a CSS class on the block
  // (blocks published before classes_size have the size as a cell value — read that too)
  const leafTexts = [block, ...block.querySelectorAll('*')]
    .filter((el) => el.childElementCount === 0)
    .map((el) => el.textContent.trim());
  const size = props.size || ICON_SIZES.find((s) => block.classList.contains(s))
    || ICON_SIZES.find((s) => leafTexts.includes(s)) || DEFAULTS.size;
  const el = buildPrimitive({ icon, size });
  block.replaceChildren(...(el ? [el] : []));
  return el;
}

export { decorate as decoratePrimitive };
