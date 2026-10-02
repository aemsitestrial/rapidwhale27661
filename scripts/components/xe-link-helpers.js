/*
 * Shared link behavior for xe-* link primitives (xe-hyperlink; xe-action-link next, see PF-01 in
 * DEVELOPMENT.md). Write link rules once here so every link component behaves the same:
 *   - href, with javascript:/data:/vbscript: URLs refused (authored content can't inject script)
 *   - target, with rel="noopener noreferrer" added automatically for target="_blank"
 *   - aria-label passed through from the host to the inner <a>
 *   - one focus ring (:focus-visible only) and screen-reader "(opens in a new tab)" note
 *   - shared stylesheets: one constructable stylesheet per component, shared by all instances
 */

// Trailing icon per link-type (DS docs: external ↗, internal →, download ↓)
export const LINK_TYPE_ICONS = {
  internal: 'faArrowRight',
  external: 'faArrowUpRightFromSquare',
  download: 'faArrowDown',
};

// Host attributes every link component should observe
export const LINK_ATTRIBUTES = ['href', 'target', 'aria-label'];

export const NEW_TAB_NOTE = ' (opens in a new tab)';

const UNSAFE_URL = /^\s*(javascript|data|vbscript):/i;

export function safeHref(href) {
  return href && !UNSAFE_URL.test(href) ? href : '';
}

// Copy the host's link attributes onto the inner <a>
export function applyLinkBehavior(anchor, host) {
  const href = safeHref(host.getAttribute('href'));
  if (href) anchor.setAttribute('href', href);
  else anchor.removeAttribute('href');

  const target = host.getAttribute('target');
  if (target) anchor.setAttribute('target', target);
  else anchor.removeAttribute('target');
  if (target === '_blank') anchor.setAttribute('rel', 'noopener noreferrer');
  else anchor.removeAttribute('rel');

  const label = host.getAttribute('aria-label');
  if (label) anchor.setAttribute('aria-label', label);
  else anchor.removeAttribute('aria-label');
}

// CSS shared by link components: focus ring, hidden note, user settings
export const LINK_BASE_CSS = `
  a:focus { outline: none; }
  a:focus-visible {
    outline: 2px solid currentcolor;
    outline-offset: 2px;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition: none !important; }
  }

  @media (forced-colors: active) {
    a { color: LinkText; }
  }
`;

const sheets = new Map();

// Attach styles to a shadow root: a shared constructable stylesheet where supported, else <style>
export function adoptStyles(root, ...cssTexts) {
  const css = cssTexts.join('\n');
  const canAdopt = 'adoptedStyleSheets' in root
    && typeof CSSStyleSheet !== 'undefined'
    && typeof CSSStyleSheet.prototype.replaceSync === 'function';
  if (canAdopt) {
    let sheet = sheets.get(css);
    if (!sheet) {
      sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      sheets.set(css, sheet);
    }
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    return;
  }
  const style = document.createElement('style');
  style.textContent = css;
  root.prepend(style);
}
