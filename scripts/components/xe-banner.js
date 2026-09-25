/*
 * <xe-banner variant="message" size="generous" background="default">
 *   <xe-banner-column expand align="center" heading-level="2">
 *     <xe-icon slot="icon" icon="faLeaf" size="lg"></xe-icon>
 *     <span slot="heading">Save Energy, Save Money</span>
 *     <div slot="message">Explore rebates, tips, and programs…</div>
 *     <xe-button slot="action" variant="primary" treatment="outlined" size="sm">…</xe-button>
 *   </xe-banner-column>
 * </xe-banner>
 *
 * xe-banner attributes:
 *   variant    — message (default)
 *   size       — compact | default | generous (vertical spacing)
 *   background — default (white) | subtle (cream) | brand (crimson) | dark
 *
 * Columns are <xe-banner-column> elements — see xe-banner-column.js.
 */

import './xe-banner-column.js';

const styles = `
  :host {
    --xe-banner-bg: #fff;
    --xe-banner-fg: #333;
    --xe-banner-heading-color: #1a1a1a;
    --xe-banner-icon-color: #1a1a1a;
    --xe-banner-padding-block: 64px;

    display: block;
    background-color: var(--xe-banner-bg);
    color: var(--xe-banner-fg);
    font-family: Arial, sans-serif;
  }
  :host([hidden]) { display: none; }

  :host([size="compact"]) { --xe-banner-padding-block: 32px; }
  :host([size="generous"]) { --xe-banner-padding-block: 96px; }

  :host([background="subtle"]) {
    --xe-banner-bg: #f5ede8;
  }
  :host([background="brand"]),
  :host([background="dark"]) {
    --xe-banner-fg: #fff;
    --xe-banner-heading-color: #fff;
    --xe-banner-icon-color: #fff;
    --xe-button-accent: #fff;
    --xe-button-secondary-accent: #fff;
    --xe-button-on-accent: var(--xe-banner-bg);
  }
  :host([background="brand"]) { --xe-banner-bg: #8b1a2c; }
  :host([background="dark"]) { --xe-banner-bg: #1a1a1a; }

  .inner {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    gap: 32px 48px;
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--xe-banner-padding-block) 24px;
  }

  @media (width <= 767px) {
    :host([size="generous"]) { --xe-banner-padding-block: 64px; }
    :host(:not([size])),
    :host([size="default"]) { --xe-banner-padding-block: 48px; }
  }
`;

export default class XeBanner extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    const inner = document.createElement('div');
    inner.className = 'inner';
    inner.setAttribute('part', 'inner');
    inner.append(document.createElement('slot'));
    root.append(style, inner);
  }
}

if (!customElements.get('xe-banner')) customElements.define('xe-banner', XeBanner);
