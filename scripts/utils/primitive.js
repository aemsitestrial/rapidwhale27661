/*
 * Shared utilities for block primitives, following the team's primitive rendering pattern.
 *
 *   getBlockProps(el, defaults) — reads authored field values from a block element, a
 *     composition row, or a single cell. Returns only the fields that were found (no defaults),
 *     so the caller can safely spread: { ...DEFAULTS, ...getBlockProps(el, DEFAULTS), ...props }
 *
 *   defined(obj) — strips undefined / null / '' values so they don't accidentally override
 *     DEFAULTS when spread. Use on external props passed in by composition blocks.
 */

// Keys whose values are content-detected (not positional) based on the key name
const LINK_KEYS = new Set(['href', 'url', 'link', 'src']);
const ICON_KEYS = new Set(['icon']);

/**
 * Reads authored field values from a block element, a composition row, or a single cell.
 *
 * Detection order:
 *   1. Links / URLs  → assigned to the first key named href / url / link / src in defaults.
 *   2. Icon names    → assigned to the first key named icon in defaults (fa prefix detection).
 *   3. Everything else → positional: each remaining cell maps to the next non-link / non-icon
 *      key in defaults order.
 *
 * @param {Element} el       - the block, a composition row, or a single cell element
 * @param {Object}  defaults - the block's DEFAULTS object; key names drive field detection
 * @returns {Object} partial props (found fields only, not full defaults)
 */
export function getBlockProps(el, defaults) {
  const cells = el.children.length
    ? [...el.children].map((child) => (child.children.length ? child.lastElementChild : child))
    : [el];

  const keys = Object.keys(defaults);
  const result = {};
  const claimed = new Set();

  // Pass 1 — content-detect links for href / url / link / src keys
  const linkKey = keys.find((k) => LINK_KEYS.has(k) && !(k in result));
  if (linkKey) {
    const idx = cells.findIndex((c, i) => !claimed.has(i)
      && (c.querySelector?.('a') || /^(\/|#|https?:\/\/|mailto:|tel:)/.test(c.textContent.trim())));
    if (idx !== -1) {
      const anchor = cells[idx].querySelector('a');
      result[linkKey] = anchor ? anchor.getAttribute('href') : cells[idx].textContent.trim();
      claimed.add(idx);
    }
  }

  // Pass 2 — content-detect icon names (fa prefix) for keys named "icon"
  const iconKey = keys.find((k) => ICON_KEYS.has(k) && !(k in result));
  if (iconKey) {
    const idx = cells.findIndex((c, i) => !claimed.has(i) && /^fa[A-Z]/.test(c.textContent.trim()));
    if (idx !== -1) {
      result[iconKey] = cells[idx].textContent.trim();
      claimed.add(idx);
    }
  }

  // Pass 3 — positional assignment for all remaining non-link / non-icon keys
  const positionalKeys = keys.filter((k) => !LINK_KEYS.has(k) && !ICON_KEYS.has(k) && !(k in result));
  const remaining = cells.filter((_, i) => !claimed.has(i) && cells[i].textContent.trim());
  positionalKeys.forEach((key, i) => {
    if (i < remaining.length) result[key] = remaining[i].textContent.trim();
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

export default getBlockProps;
