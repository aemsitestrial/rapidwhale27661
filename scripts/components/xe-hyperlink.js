/*
 * <xe-hyperlink href="/rates">View rate options</xe-hyperlink>
 * <xe-hyperlink href="/report" trailing-icon>View full report</xe-hyperlink>
 * <xe-hyperlink href="https://example.com" target="_blank" trailing-icon link-type="external">…</xe-hyperlink>
 * <xe-hyperlink href="/privacy" variant="variant">Privacy Policy</xe-hyperlink>
 *
 * Renders a native anchor with an optional trailing icon (Xcel design system: Action › Hyperlink).
 *
 * Attributes (props in the DS docs → attributes here):
 *   href                     — URL the link navigates to
 *   variant                  — "default" (light surfaces) | "variant" (fixed white, for dark or
 *                              colored backgrounds — invisible on light surfaces)
 *   trailing-icon            — boolean (default false): show the icon after the label
 *   link-type                — icon shown when trailing-icon is on: "external" (default) ↗ ·
 *                              "internal" → · "download" ↓
 *   target                   — anchor target, e.g. "_blank"
 *   aria-label               — passed to the anchor when the visible text isn't descriptive enough
 * Properties: href, variant, trailingIcon, linkType, target (reflect to the attributes above).
 * Slots: default (label)
 *
 * Accessibility (DS docs): native <a> semantics · rel="noopener noreferrer" added automatically
 * for target="_blank" · aria-label support · Tab / Shift+Tab / Enter · focus ring on
 * :focus-visible only.
 *
 * Extras beyond the DS docs: javascript:/data:/vbscript: URLs are refused; screen readers
 * hear "(opens in a new tab)" for target="_blank"; underline on hover; high-contrast colors.
 * Colors are estimates until the design tokens are documented (PF-04).
 */

import './xe-icon.js';
import {
  LINK_ATTRIBUTES, LINK_BASE_CSS, LINK_TYPE_ICONS, NEW_TAB_NOTE, adoptStyles, applyLinkBehavior,
} from './xe-link-helpers.js';

const DEFAULT_LINK_TYPE = 'external';

const styles = `
  /* Private color (the DS docs list no CSS custom properties for Hyperlink); estimate until PF-04 */
  :host {
    --_color: #23384d;

    display: inline;
  }
  :host([hidden]) { display: none; }
  :host([variant="variant"]) { --_color: #fff; }

  a {
    border-radius: 2px;
    color: var(--_color);
    font: inherit;
    text-decoration: none;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
    cursor: pointer;
  }
  a:hover { text-decoration-line: underline; }

  /* Trailing icon follows the text size and sits on the text baseline */
  xe-icon {
    width: 0.95em;
    height: 0.95em;
    margin-inline-start: 0.3em;
    vertical-align: -0.1em;
  }
`;

export default class XeHyperlink extends HTMLElement {
  static get observedAttributes() {
    return [...LINK_ATTRIBUTES, 'variant', 'trailing-icon', 'link-type'];
  }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open', delegatesFocus: true });
    adoptStyles(root, LINK_BASE_CSS, styles);

    this.anchor = document.createElement('a');
    this.anchor.setAttribute('part', 'link');

    this.note = document.createElement('span');
    this.note.className = 'visually-hidden';
    this.note.textContent = NEW_TAB_NOTE;

    this.icon = document.createElement('xe-icon');
    this.icon.setAttribute('part', 'icon');

    this.anchor.append(document.createElement('slot'), this.note, this.icon);
    root.append(this.anchor);
  }

  connectedCallback() {
    this.update();
  }

  attributeChangedCallback() {
    this.update();
  }

  update() {
    applyLinkBehavior(this.anchor, this);
    this.note.hidden = this.target !== '_blank';
    this.icon.hidden = !this.trailingIcon;
    this.icon.setAttribute('icon', LINK_TYPE_ICONS[this.linkType]);
  }

  get href() { return this.getAttribute('href') || ''; }

  set href(value) { this.setAttribute('href', value); }

  get target() { return this.getAttribute('target') || ''; }

  set target(value) { this.setAttribute('target', value); }

  get variant() { return this.getAttribute('variant') === 'variant' ? 'variant' : 'default'; }

  set variant(value) { this.setAttribute('variant', value); }

  get trailingIcon() { return this.hasAttribute('trailing-icon'); }

  set trailingIcon(value) { this.toggleAttribute('trailing-icon', Boolean(value)); }

  get linkType() {
    const type = this.getAttribute('link-type');
    return LINK_TYPE_ICONS[type] ? type : DEFAULT_LINK_TYPE;
  }

  set linkType(value) { this.setAttribute('link-type', value); }
}

if (!customElements.get('xe-hyperlink')) customElements.define('xe-hyperlink', XeHyperlink);
