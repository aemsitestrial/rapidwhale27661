/*
 * <xe-action-link link-type="internal" href="/programs">Learn more</xe-action-link>
 *
 * A labeled link with a trailing directional icon, for card action slots and other inline action
 * contexts (Xcel design system: Action › Action Link).
 *
 * Attributes:
 *   link-type — controls the trailing icon (default "internal"):
 *               internal → arrow right    — navigating within the site
 *               external → arrow up-right — opening a new tab or external site
 *               download → arrow down     — downloading a file
 *   href      — URL the link navigates to
 * Slots: default (label)
 *
 * Color inherits from the parent card surface via --card-text-color, so it adapts to xe-card
 * variants (neutral, accent, brand…) without extra configuration; outside a card it uses the
 * surrounding text color.
 *
 * Extras beyond the DS docs (the docs describe when to use each type, not the link behavior):
 *   external → opens in a new tab (target="_blank", rel="noopener noreferrer") and adds
 *              "(opens in a new tab)" for screen readers
 *   download → sets the native `download` attribute
 */

import './xe-icon.js';

const LINK_TYPES = {
  internal: 'faArrowRight',
  external: 'faArrowUpRightFromSquare',
  download: 'faArrowDown',
};

const styles = `
  :host {
    display: inline-flex;
    vertical-align: middle;
    color: var(--card-text-color, currentcolor);
  }
  :host([hidden]) { display: none; }

  a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: inherit;
    font-family: Arial, sans-serif;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.3;
    text-decoration: none;
    border-radius: 2px;
  }
  a:hover .label { text-decoration: underline; }
  a:focus-visible {
    outline: 2px solid currentcolor;
    outline-offset: 3px;
  }

  /* Icon scales with the label, as in the DS docs preview */
  xe-icon {
    --xe-icon-size: 1em;

    transition: transform 0.2s ease;
  }
  :host(:not([link-type])) a:hover xe-icon,
  :host([link-type="internal"]) a:hover xe-icon { transform: translateX(3px); }
  :host([link-type="external"]) a:hover xe-icon { transform: translate(2px, -2px); }
  :host([link-type="download"]) a:hover xe-icon { transform: translateY(3px); }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`;

export default class XeActionLink extends HTMLElement {
  static get observedAttributes() {
    return ['href', 'link-type'];
  }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open', delegatesFocus: true });
    const style = document.createElement('style');
    style.textContent = styles;
    root.append(style);
  }

  get linkType() {
    const type = this.getAttribute('link-type');
    return LINK_TYPES[type] ? type : 'internal';
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    this.shadowRoot.querySelector('a')?.remove();
    const type = this.linkType;

    const link = document.createElement('a');
    link.setAttribute('part', 'link');
    const href = this.getAttribute('href');
    if (href) link.href = href;
    if (type === 'external') {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else if (type === 'download') {
      link.setAttribute('download', '');
    }

    const label = document.createElement('span');
    label.className = 'label';
    label.append(document.createElement('slot'));
    link.append(label);

    if (type === 'external') {
      const note = document.createElement('span');
      note.className = 'visually-hidden';
      note.textContent = ' (opens in a new tab)';
      link.append(note);
    }

    const icon = document.createElement('xe-icon');
    icon.setAttribute('icon', LINK_TYPES[type]);
    icon.setAttribute('part', 'icon');
    link.append(icon);

    this.shadowRoot.append(link);
  }
}

if (!customElements.get('xe-action-link')) customElements.define('xe-action-link', XeActionLink);
