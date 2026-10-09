/*
 * Shared helper for primitive blocks (XE Icon, XE Icon Button …) — see DEVELOPMENT.md →
 * "Primitive rendering pattern" and "Model field prefix rule".
 *
 *   getBlockProps(el, defaults, overrides, options) → the complete props for buildPrimitive():
 *     { ...defaults, ...authored values, ...overrides }  (empty overrides are dropped)
 *
 * `el` is a block, a composition row, or a single cell. Universal Editor delivers a block's
 * prefixed fields (ic_*, ib_*) as ONE grouped cell with an element per field, and skips empty
 * fields — so values are matched by CONTENT, never by position:
 *   a link (<a>) or a URL     → the link key in defaults (href / url / link / src)
 *   an fa… name                → icon
 *   one of a field's options   → that field (options = { size: ['sm', 'md', …], … })
 *   any other text             → the next free-text key (e.g. ariaLabel); otherwise ignored
 * Values that match nothing (old or unknown, e.g. a removed color option) are ignored.
 * One-row-per-field markup is read the same way.
 */

const LINK_KEYS = ['href', 'url', 'link', 'src'];
const ICON_PATTERN = /^fa[A-Z]/;
const URL_PATTERN = /^(\/|#|https?:\/\/|mailto:|tel:)/;

/**
 * Drops undefined / null / '' values, so they don't erase defaults or authored values when spread.
 */
export function defined(obj = {}) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

// One node per authored value: block rows → their cell; a grouped cell → each <p> in it
function valueNodes(el) {
  const cells = el.children.length
    ? [...el.children].map((child) => (
      child.localName === 'div' && child.children.length ? child.lastElementChild : child))
    : [el];
  return cells.flatMap((cell) => {
    const parts = [...cell.children].filter((child) => child.localName === 'p');
    return parts.length > 1 ? parts : [cell];
  });
}

function readAuthored(el, keys, options) {
  const linkKey = keys.find((key) => LINK_KEYS.includes(key));
  const iconKey = keys.includes('icon') ? 'icon' : undefined;
  const optionKeys = keys.filter((key) => Array.isArray(options[key]));
  const textKeys = keys.filter((key) => key !== linkKey && key !== iconKey
    && !optionKeys.includes(key));
  const isOption = (value) => optionKeys.some((key) => options[key].includes(value));

  const authored = {};
  const set = (key, value) => {
    if (key && !(key in authored)) authored[key] = value;
  };

  valueNodes(el).forEach((node) => {
    const anchor = node.localName === 'a' ? node : node.querySelector?.('a');
    const value = node.textContent.trim();
    if (anchor && linkKey) set(linkKey, anchor.getAttribute('href'));
    else if (!value) {
      // empty cell — nothing to read
    } else if (ICON_PATTERN.test(value)) set(iconKey, value);
    else if (isOption(value)) {
      set(optionKeys.find((key) => !(key in authored) && options[key].includes(value)), value);
    } else if (URL_PATTERN.test(value)) set(linkKey, value);
    else set(textKeys.find((key) => !(key in authored)), value);
  });
  return authored;
}

/**
 * @param {Element} el - the block, a composition row, or a single cell
 * @param {Object} defaults - the block's DEFAULTS (key names drive link / icon detection)
 * @param {Object} [overrides] - props from a composition; win over authored values
 * @param {Object<string, string[]>} [options] - allowed values of each dropdown field
 * @returns {Object} complete props: defaults < authored < overrides
 */
export function getBlockProps(el, defaults, overrides = {}, options = {}) {
  return {
    ...defaults,
    ...readAuthored(el, Object.keys(defaults), options),
    ...defined(overrides),
  };
}
