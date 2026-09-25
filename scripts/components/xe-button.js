/*
 * <xe-button variant="primary" treatment="outlined" size="sm" href="/programs">
 *   Explore Programs
 *   <xe-icon slot="trailing-icon" size="sm" icon="faArrowRight"></xe-icon>
 * </xe-button>
 *
 * Attributes:
 *   variant   — primary (default) | secondary
 *   treatment — filled (default) | outlined | text
 *   size      — sm | md (default) | lg
 *   href      — renders a link; without it a native <button> is rendered
 *   target    — link target (only used with href)
 * Slots: default (label), leading-icon, trailing-icon
 *
 * Colors can be themed from outside via --xe-button-accent, --xe-button-on-accent and
 * --xe-button-secondary-accent.
 */

const styles = `
  :host {
    --_accent: var(--xe-button-accent, #c8102e);
    --_on-accent: var(--xe-button-on-accent, #fff);

    display: inline-flex;
    vertical-align: middle;
  }
  :host([hidden]) { display: none; }
  :host([variant="secondary"]) {
    --_accent: var(--xe-button-secondary-accent, #005f87);
  }

  .control {
    --pad-y: 12px;
    --pad-x: 24px;
    --font-size: 16px;

    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 0;
    padding: var(--pad-y) var(--pad-x);
    border: 2px solid var(--_accent);
    border-radius: 4px;
    background-color: var(--_accent);
    color: var(--_on-accent);
    font-family: Arial, sans-serif;
    font-size: var(--font-size);
    font-weight: 700;
    line-height: 1.25;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  :host([size="sm"]) .control {
    --pad-y: 14px;
    --pad-x: 28px;
    --font-size: 18px;
  }
  :host([size="lg"]) .control {
    --pad-y: 16px;
    --pad-x: 32px;
    --font-size: 20px;
  }

  :host([treatment="outlined"]) .control {
    border-width: 1px;
    background-color: transparent;
    color: var(--_accent);
  }
  :host([treatment="text"]) .control {
    border-color: transparent;
    background-color: transparent;
    color: var(--_accent);
    padding-inline: 0;
  }

  .control:hover {
    background-color: var(--_on-accent);
    color: var(--_accent);
  }
  :host([treatment="outlined"]) .control:hover {
    background-color: var(--_accent);
    color: var(--_on-accent);
  }
  :host([treatment="text"]) .control:hover {
    background-color: transparent;
    text-decoration: underline;
  }
  .control:focus-visible {
    outline: 2px solid var(--_accent);
    outline-offset: 3px;
  }

  ::slotted([slot="trailing-icon"]) {
    transition: transform 0.2s ease;
  }
  .control:hover ::slotted([slot="trailing-icon"]) {
    transform: translateX(3px);
  }
`;

export default class XeButton extends HTMLElement {
  static get observedAttributes() {
    return ['href', 'target'];
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
    } else {
      control.type = 'button';
    }

    ['leading-icon', '', 'trailing-icon'].forEach((name) => {
      const slot = document.createElement('slot');
      if (name) slot.name = name;
      control.append(slot);
    });

    this.shadowRoot.append(control);
  }
}

if (!customElements.get('xe-button')) customElements.define('xe-button', XeButton);
