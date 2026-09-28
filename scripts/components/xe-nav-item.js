/*
 * <xe-nav-item href="/billing" active>
 *   <xe-icon slot="leading-icon" icon="faFileInvoiceDollar" size="sm"></xe-icon>
 *   Billing &amp; Payment
 * </xe-nav-item>
 *
 * Navigation item for use within <xe-navbar> (Xcel design system: Navigation › Nav Item).
 *
 * Attributes:
 *   active — boolean (default false); marks the current page (aria-current="page")
 *   href   — URL for link-style nav items; without it a native <button> is rendered
 *   target — link target (only used with href)
 * Slots: default (label), leading-icon (uncommon — most nav items are text only)
 *
 * Hover shows an 8% background overlay; active/pressed shows 12%.
 * Themeable via --xe-nav-item-color, --xe-nav-item-overlay-color and --xe-nav-item-radius.
 * The overlay color and radius are estimates until the design tokens are documented.
 */

const styles = `
  :host {
    --_color: var(--xe-nav-item-color, #1a1a1a);
    --_overlay: var(--xe-nav-item-overlay-color, #8b5a3c);
    --_radius: var(--xe-nav-item-radius, 8px);

    display: inline-flex;
    vertical-align: middle;
  }
  :host([hidden]) { display: none; }

  .control {
    position: relative;
    isolation: isolate;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    margin: 0;
    padding: 10px 16px;
    border: 0;
    border-radius: var(--_radius);
    background: transparent;
    color: var(--_color);
    font-family: Arial, sans-serif;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.25;
    text-align: start;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
  }

  .control::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    background-color: var(--_overlay);
    opacity: 0;
    transition: opacity 0.15s ease;
  }
  .control:hover::before { opacity: 0.08; }
  .control:active::before,
  :host([active]) .control::before { opacity: 0.12; }

  .control:focus-visible {
    outline: 2px solid var(--_color);
    outline-offset: 2px;
  }

  ::slotted([slot="leading-icon"]) {
    flex-shrink: 0;
  }
`;

export default class XeNavItem extends HTMLElement {
  static get observedAttributes() {
    return ['active', 'href', 'target'];
  }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open', delegatesFocus: true });
    const style = document.createElement('style');
    style.textContent = styles;
    root.append(style);
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    this.shadowRoot.querySelector('.control')?.remove();

    const href = this.getAttribute('href');
    const control = document.createElement(href ? 'a' : 'button');
    control.className = 'control';
    control.setAttribute('part', 'control');
    if (href) {
      control.href = href;
      const target = this.getAttribute('target');
      if (target) {
        control.target = target;
        if (target === '_blank') control.rel = 'noopener noreferrer';
      }
      if (this.hasAttribute('active')) control.setAttribute('aria-current', 'page');
    } else {
      control.type = 'button';
      if (this.hasAttribute('active')) control.setAttribute('aria-pressed', 'true');
    }

    const icon = document.createElement('slot');
    icon.name = 'leading-icon';
    control.append(icon, document.createElement('slot'));
    this.shadowRoot.append(control);
  }
}

if (!customElements.get('xe-nav-item')) customElements.define('xe-nav-item', XeNavItem);
