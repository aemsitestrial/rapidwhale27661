/*
 * <xe-icon-button treatment="default" size="md" href target disabled aria-label="Settings">
 *   <xe-icon icon="faGear"></xe-icon>
 * </xe-icon-button>
 *
 * Action target for a single icon (Ignite: Design System Primitives › Action › Icon Button).
 * Renders an <a> when href is set, otherwise a <button>. The touch target is always 48×48px,
 * whatever the icon size. Ignite Tier 3; in this project also the standalone XE Icon Button block
 * (blocks/xe-icon-button).
 *
 * Props → attributes (Ignite docs):
 *   treatment  — default (icon only) | filled | outlined           (default: default)
 *   size       — xxs | xs | sm | md | lg | xl | 2xl — sets the slotted xe-icon's size (default: md)
 *   href       — renders an <a> instead of a <button>                (default: '')
 *   target     — anchor target, only with href; "_blank" for external   (default: '')
 *   disabled   — disables the button or link                         (default: false)
 *   aria-label — REQUIRED; forwarded to the inner <button> / <a>. With target="_blank" include
 *                the context, e.g. "Xcel Energy on Facebook (opens in a new window)" — the
 *                component adds no note of its own.
 * Slot: default — the icon, an <xe-icon>.
 *
 * Extensions beyond the Ignite spec (documented in DEVELOPMENT.md):
 *   aria-expanded, aria-haspopup — navbar extension, not in Ignite spec: forwarded to the inner
 *     control so a menu toggle keeps announcing its state (WCAG 4.1.2).
 *   sizes xxs / 2xl — xe-icon documents xs–xl only, so for these two the icon button sets the
 *     slotted icon's width/height itself (estimates: 12px / 40px).
 *   A disabled link drops its href and gets aria-disabled="true" (an <a> can't be natively
 *     disabled).
 * Colors are estimates from the docs screenshots until the design tokens docs arrive; the filled
 * background uses --xe-color-brand-primary.
 */

import { ICON_SIZES } from './xe-icon.js';
import { adoptStyles, applyLinkBehavior, safeHref } from './xe-link-helpers.js';

export const ICON_BUTTON_TREATMENTS = ['default', 'filled', 'outlined'];
export const ICON_BUTTON_SIZES = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
// Forwarded to the inner control besides aria-label (navbar extension)
const FORWARDED_ARIA = ['aria-expanded', 'aria-haspopup'];
// xe-icon has no xxs / 2xl: use its nearest size; the CSS below sets the real width/height
const ICON_SIZE_FOR = { xxs: 'xs', '2xl': 'xl' };

const styles = `
  :host {
    --_fg: #5c534e;
    --_overlay: rgb(139 90 60 / 8%);

    display: inline-flex;
    flex: none;
    width: 48px;
    height: 48px;
    vertical-align: middle;
  }
  :host([hidden]) { display: none; }

  .control {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 8px;
    background-color: transparent;
    color: var(--_fg);
    font: inherit;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.15s ease, box-shadow 0.15s ease;
  }
  .control:hover { background-color: var(--_overlay); }
  .control:active { background-color: rgb(139 90 60 / 12%); }
  .control:focus { outline: none; }
  .control:focus-visible {
    outline: 2px solid var(--_fg);
    outline-offset: 2px;
  }

  :host([treatment="filled"]) .control {
    border-color: var(--xe-color-brand-primary, #c8102e);
    background-color: var(--xe-color-brand-primary, #c8102e);
    color: #fff;
  }
  :host([treatment="filled"]) .control:hover { box-shadow: inset 0 0 0 48px rgb(0 0 0 / 12%); }
  :host([treatment="filled"]) .control:focus-visible {
    outline-color: var(--xe-color-brand-primary, #c8102e);
  }
  :host([treatment="outlined"]) .control { border-color: #6e6560; }

  /* Disabled — no hover or pointer interaction */
  .control:disabled,
  .control[aria-disabled="true"] {
    color: #bdb7b3;
    cursor: not-allowed;
    pointer-events: none;
  }
  :host([treatment="filled"]) .control:disabled,
  :host([treatment="filled"]) .control[aria-disabled="true"] {
    border-color: #e3e3e3;
    background-color: #e3e3e3;
    color: #f5f5f5;
  }
  :host([treatment="outlined"]) .control:disabled,
  :host([treatment="outlined"]) .control[aria-disabled="true"] {
    border-color: #ececec;
    color: #d9d9d9;
  }

  ::slotted(xe-icon) { pointer-events: none; }
  :host([size="xxs"]) ::slotted(xe-icon) { width: 12px; height: 12px; }
  :host([size="2xl"]) ::slotted(xe-icon) { width: 40px; height: 40px; }

  @media (prefers-reduced-motion: reduce) {
    .control { transition: none; }
  }

  @media (forced-colors: active) {
    .control { border-color: ButtonText; color: ButtonText; }
    .control:disabled,
    .control[aria-disabled="true"] { border-color: GrayText; color: GrayText; }
  }
`;

export default class XeIconButton extends HTMLElement {
  static get observedAttributes() {
    return ['treatment', 'size', 'href', 'target', 'disabled', 'aria-label', ...FORWARDED_ARIA];
  }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open', delegatesFocus: true });
    adoptStyles(root, styles);
    this.slotEl = document.createElement('slot');
    this.slotEl.addEventListener('slotchange', () => this.syncIconSize());
  }

  get treatment() {
    const value = this.getAttribute('treatment');
    return ICON_BUTTON_TREATMENTS.includes(value) ? value : 'default';
  }

  set treatment(value) { this.setAttribute('treatment', value); }

  get size() {
    const value = this.getAttribute('size');
    return ICON_BUTTON_SIZES.includes(value) ? value : 'md';
  }

  set size(value) { this.setAttribute('size', value); }

  get href() { return this.getAttribute('href') || ''; }

  set href(value) { this.setAttribute('href', value); }

  get target() { return this.getAttribute('target') || ''; }

  set target(value) { this.setAttribute('target', value); }

  get disabled() { return this.hasAttribute('disabled'); }

  set disabled(value) { this.toggleAttribute('disabled', Boolean(value)); }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.control) this.render();
  }

  // Works where delegatesFocus isn't supported, e.g. in unit tests
  focus(options) {
    if (this.control) this.control.focus(options);
    else super.focus(options);
  }

  render() {
    const isLink = Boolean(safeHref(this.href));
    const tag = isLink ? 'a' : 'button';
    if (this.control?.localName !== tag) {
      const control = document.createElement(tag);
      control.className = 'control';
      control.setAttribute('part', 'control');
      if (tag === 'button') control.type = 'button';
      control.append(this.slotEl);
      if (this.control) this.control.replaceWith(control);
      else this.shadowRoot.append(control);
      this.control = control;
    }
    const { control } = this;

    if (isLink) {
      applyLinkBehavior(control, this);
      if (this.disabled) {
        control.removeAttribute('href');
        control.setAttribute('aria-disabled', 'true');
      } else {
        control.removeAttribute('aria-disabled');
      }
    } else {
      control.disabled = this.disabled;
      const label = this.getAttribute('aria-label');
      if (label) control.setAttribute('aria-label', label);
      else control.removeAttribute('aria-label');
    }

    FORWARDED_ARIA.forEach((name) => {
      const value = this.getAttribute(name);
      if (value !== null) control.setAttribute(name, value);
      else control.removeAttribute(name);
    });

    this.syncIconSize();
  }

  // size "controls the slotted xe-icon size"
  syncIconSize() {
    const iconSize = ICON_SIZE_FOR[this.size] || this.size;
    if (!ICON_SIZES.includes(iconSize)) return;
    this.slotEl.assignedElements().forEach((el) => {
      if (el.localName === 'xe-icon') el.setAttribute('size', iconSize);
    });
  }
}

if (!customElements.get('xe-icon-button')) customElements.define('xe-icon-button', XeIconButton);
