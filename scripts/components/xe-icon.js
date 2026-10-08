/*
 * <xe-icon icon="faBolt" size="md"></xe-icon>
 *
 * Font Awesome icon wrapper with consistent sizing that inherits its color from the surrounding
 * text (Ignite: Design System Primitives › Media › Icon). Ignite Tier 3 internal component; in this
 * project it is also the standalone XE Icon block (blocks/xe-icon), whose buildPrimitive() /
 * decoratePrimitive() the compositions reuse.
 *
 * Icons must be registered before use, typically once at the site level (scripts/icons.js):
 *   import { registerIcons } from './components/xe-icon.js';
 *   registerIcons({ faBolt, faArrowRight });
 * Definitions use the Font Awesome npm package shape:
 *   { prefix, iconName, icon: [width, height, aliases, unicode, svgPathData] }
 * An <xe-icon> whose icon isn't registered yet renders empty (keeping its size) and fills in as
 * soon as the icon is registered.
 *
 * Attributes (Ignite docs):
 *   icon — Font Awesome icon name, e.g. "faBolt"
 *   size — xs | sm | md (default) | lg | xl — mapped to the design token sizing scale
 * These are the only two props (Ignite Storybook). Color: inherits the current text color; override
 * with style="color: …" or a parent's color, e.g. var(--xe-color-brand-primary) or
 * var(--xe-color-brand-accent) — the component itself sets no color.
 * Containers that need a one-off size (e.g. icon follows the label in links) set width/height on
 * the element; those outer styles win over :host.
 * Accessibility: always decorative (aria-hidden="true"). Label the parent button/link instead.
 *
 * Path A stand-in: Path B replaces this file and registerIcons() with @ignite/web
 * (`@ignite/web/utils/icon-resolver.js`). Token names below are placeholders until the Ignite
 * design tokens docs are received; the px values are estimates from the Icon docs (Sizes story).
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

export const ICON_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'];
const DEFAULT_SIZE = 'md';

const registry = new Map();
const waiting = new Set(); // connected <xe-icon>s whose icon isn't registered yet

/**
 * Registers Font Awesome icon definitions by name, e.g. registerIcons({ faBolt, faArrowRight }).
 * Icons already on the page that were waiting for one of these names render immediately.
 * @param {Object<string, {icon: Array}>} icons
 */
export function registerIcons(icons) {
  Object.entries(icons || {}).forEach(([name, definition]) => {
    if (Array.isArray(definition?.icon)) registry.set(name, definition);
  });
  [...waiting].forEach((el) => el.render());
}

export function isIconRegistered(name) {
  return registry.has(name);
}

export function registeredIconNames() {
  return [...registry.keys()];
}

const styles = `
  :host {
    --_size: var(--xe-sizing-icon-md, 20px);

    display: inline-flex;
    flex-shrink: 0;
    width: var(--_size);
    height: var(--_size);
    color: inherit;
    line-height: 0;
    vertical-align: middle;
  }
  :host([hidden]) { display: none; }
  :host([size="xs"]) { --_size: var(--xe-sizing-icon-xs, 14px); }
  :host([size="sm"]) { --_size: var(--xe-sizing-icon-sm, 16px); }
  :host([size="lg"]) { --_size: var(--xe-sizing-icon-lg, 28px); }
  :host([size="xl"]) { --_size: var(--xe-sizing-icon-xl, 36px); }
  svg {
    width: 100%;
    height: 100%;
    fill: currentcolor;
  }
`;

export default class XeIcon extends HTMLElement {
  static get observedAttributes() {
    return ['icon'];
  }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    root.append(style);
  }

  get icon() { return this.getAttribute('icon') || ''; }

  set icon(value) { this.setAttribute('icon', value); }

  get size() {
    const size = this.getAttribute('size');
    return ICON_SIZES.includes(size) ? size : DEFAULT_SIZE;
  }

  set size(value) { this.setAttribute('size', value); }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    waiting.delete(this);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    this.shadowRoot.querySelector('svg')?.remove();
    const definition = registry.get(this.icon);
    if (!definition) {
      if (this.isConnected && this.icon) waiting.add(this);
      return;
    }
    waiting.delete(this);

    const [width, height, , , pathData] = definition.icon;
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('part', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    // Duotone icons carry two paths; single-color icons one
    [].concat(pathData).forEach((d) => {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', d);
      svg.append(path);
    });
    this.shadowRoot.append(svg);
  }
}

if (!customElements.get('xe-icon')) customElements.define('xe-icon', XeIcon);
