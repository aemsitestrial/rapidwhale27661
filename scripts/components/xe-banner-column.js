/*
 * <xe-banner-column expand align="center" heading-level="2">
 *   <xe-icon slot="icon" icon="faLeaf" size="lg"></xe-icon>
 *   <span slot="heading">Save Energy, Save Money</span>
 *   <div slot="message">Explore rebates, tips, and programs…</div>
 *   <xe-button slot="action" …>…</xe-button>
 * </xe-banner-column>
 *
 * Attributes:
 *   expand        — boolean; column grows to fill the available width
 *   align         — start (default) | center | end
 *   heading-level — 1–6 (default 2); the level of the heading wrapped around the "heading" slot
 * Slots: icon, heading, message, action, default
 *
 * Colors come from the parent <xe-banner> via --xe-banner-heading-color and --xe-banner-icon-color.
 */

const styles = `
  :host {
    display: block;
    flex: 0 1 auto;
    min-width: 0;
    text-align: start;
  }
  :host([hidden]) { display: none; }
  :host([expand]) { flex: 1 1 0; }
  :host([align="center"]) { text-align: center; }
  :host([align="end"]) { text-align: end; }

  .column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }
  :host([align="center"]) .column { align-items: center; }
  :host([align="end"]) .column { align-items: flex-end; }

  [hidden] { display: none; }

  .icon {
    color: var(--xe-banner-icon-color, currentcolor);
    line-height: 0;
  }

  .heading {
    max-width: 672px;
    margin: 8px 0 8px;
    color: var(--xe-banner-heading-color, inherit);
    font-family: "Arial Narrow", Arial, sans-serif;
    font-size: clamp(40px, 4vw + 16px, 72px);
    font-stretch: condensed;
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: 0.01em;
    text-transform: uppercase;
  }

  .message {
    max-width: 672px;
    font-size: 20px;
    line-height: 1.5;
  }

  .action {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
`;

export default class XeBannerColumn extends HTMLElement {
  static get observedAttributes() {
    return ['heading-level'];
  }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    root.append(style);
    this.column = document.createElement('div');
    this.column.className = 'column';
    this.column.setAttribute('part', 'column');

    this.wrappers = {};
    ['icon', 'heading', 'message', 'action'].forEach((name) => {
      const wrapper = document.createElement(name === 'heading' ? this.headingTag : 'div');
      wrapper.className = name;
      wrapper.setAttribute('part', name);
      const slot = document.createElement('slot');
      slot.name = name;
      // Look the wrapper up on each change: the heading wrapper is replaced when its level changes.
      slot.addEventListener('slotchange', () => this.toggleEmpty(this.wrappers[name], slot));
      wrapper.append(slot);
      wrapper.hidden = true;
      this.wrappers[name] = wrapper;
      this.column.append(wrapper);
    });
    this.column.append(document.createElement('slot'));
    root.append(this.column);
  }

  get headingTag() {
    const level = parseInt(this.getAttribute('heading-level'), 10);
    return `h${level >= 1 && level <= 6 ? level : 2}`;
  }

  // Hide slot wrappers with no assigned content so empty headings/spacing aren't rendered.
  // eslint-disable-next-line class-methods-use-this
  toggleEmpty(wrapper, slot) {
    wrapper.hidden = slot.assignedNodes().length === 0;
  }

  attributeChangedCallback() {
    const current = this.wrappers?.heading;
    if (!current || current.localName === this.headingTag) return;
    const heading = document.createElement(this.headingTag);
    heading.className = current.className;
    heading.setAttribute('part', 'heading');
    heading.hidden = current.hidden;
    heading.append(...current.childNodes);
    current.replaceWith(heading);
    this.wrappers.heading = heading;
  }
}

if (!customElements.get('xe-banner-column')) {
  customElements.define('xe-banner-column', XeBannerColumn);
}
