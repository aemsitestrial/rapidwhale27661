/*
 * Shared utilities for block primitives, following the team's primitive rendering pattern.
 *
 *   getBlockProps(el, defaults, options) — reads authored field values from a block element, a
 *     composition row, or a single cell. Returns only the fields that were found (no defaults),
 *     so the caller can safely spread: { ...DEFAULTS, ...getBlockProps(el, DEFAULTS), ...props }
 *
 *   defined(obj) — strips undefined / null / '' values so they don't accidentally override
 *     DEFAULTS when spread. Use on external props passed in by composition blocks.
 *
 * Universal Editor skips empty fields, so a row's position isn't reliable on its own
 * (build-log I-42, I-51). Values are therefore matched by content wherever possible, and only
 * free-text fields fall back to position.
 */

// Keys whose values are content-detected (not positional) based on the key name
const LINK_KEYS = new Set(['href', 'url', 'link', 'src']);
const ICON_KEYS = new Set(['icon']);
const URL_PATTERN = /^(\/|#|https?:\/\/|mailto:|tel:)/;
const ICON_PATTERN = /^fa[A-Z]/;

/**
 * Reads authored field values from a block element, a composition row, or a single cell.
 *
 * Detection order:
 *   1. Links / URLs  → the first key named href / url / link / src in defaults.
 *   2. Icon names    → the first key named icon in defaults (fa prefix).
 *   3. Option fields → each key listed in `options` takes the first cell whose value is one of
 *      its allowed values (e.g. size: ['xs', 'sm', …]). Never filled by position, so a skipped
 *      field or an unknown / old value can't land in the wrong field.
 *   4. Everything else (free text) → positional: the remaining cells, in order, map to the
 *      remaining keys in defaults order.
 *
 * @param {Element} el       - the block, a composition row, or a single cell element
 * @param {Object}  defaults - the block's DEFAULTS object; key names drive field detection
 * @param {Object<string, string[]>} [options] - allowed values per select field
 * @returns {Object} partial props (found fields only, not full defaults)
 */
export default function getBlockProps(el, defaults, options = {}) {
  const cells = el.children.length
    ? [...el.children].map((child) => (child.children.length ? child.lastElementChild : child))
    : [el];
  const values = cells.map((cell) => cell.textContent.trim());

  const keys = Object.keys(defaults);
  const result = {};
  const claimed = new Set();
  const claim = (key, test, read = (i) => values[i]) => {
    const idx = cells.findIndex((cell, i) => !claimed.has(i) && test(cell, values[i]));
    if (idx === -1) return;
    result[key] = read(idx);
    claimed.add(idx);
  };

  // 1 — links
  const linkKey = keys.find((k) => LINK_KEYS.has(k));
  if (linkKey) {
    claim(
      linkKey,
      (cell, value) => cell.querySelector?.('a') || URL_PATTERN.test(value),
      (i) => cells[i].querySelector?.('a')?.getAttribute('href') || values[i],
    );
  }

  // 2 — icon names
  const iconKey = keys.find((k) => ICON_KEYS.has(k));
  if (iconKey) claim(iconKey, (cell, value) => ICON_PATTERN.test(value));

  // 3 — select fields with known values
  const optionKeys = keys.filter((k) => Array.isArray(options[k]) && !(k in result));
  optionKeys.forEach((key) => claim(key, (cell, value) => options[key].includes(value)));

  // 4 — free text, by position (skipping anything that looks like another field's value)
  const isOtherFieldValue = (value) => URL_PATTERN.test(value) || ICON_PATTERN.test(value)
    || optionKeys.some((k) => options[k].includes(value));
  const textKeys = keys.filter((k) => !LINK_KEYS.has(k) && !ICON_KEYS.has(k)
    && !optionKeys.includes(k) && !(k in result));
  const remaining = values
    .filter((value, i) => !claimed.has(i) && value && !isOtherFieldValue(value));
  textKeys.forEach((key, i) => {
    if (i < remaining.length) result[key] = remaining[i];
  });

  return result;
}

/**
 * Strips undefined / null / '' values from an object so they don't override DEFAULTS when spread.
 */
export function defined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );
}
