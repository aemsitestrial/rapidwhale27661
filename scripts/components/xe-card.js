/*
 * <xe-card variant="surface" treatment="filled" interactive="true" actions-placement="inline">
 *   <xe-icon slot="icon" icon="faFileInvoiceDollar" size="xl"></xe-icon>
 *   <h3 slot="title">Home Rebates</h3>
 *   <p>Earn rebates on everyday energy-efficiency purchases and projects for your home.</p>
 *   <xe-action-link slot="actions" href="/rebates">Learn More</xe-action-link>
 *   <img slot="decorative" src="/illustration.svg" alt="">
 * </xe-card>
 *
 * Card surface (Xcel design system: Card). Built from the usage shown in the Feature Cards docs;
 * the Card docs page itself hasn't been received yet, so only the values seen there are supported.
 *
 * Attributes:
 *   variant           — surface (default, light) | primary-variant (dark)
 *   treatment         — filled (default; the only documented value so far)
 *   interactive       — "true" makes the whole card clickable (it follows the first action link)
 *   actions-placement — inline (default; actions directly after the body copy)
 * Slots: icon (categorical icon), title (author's heading element), default (body copy),
 *        actions (e.g. <xe-action-link>), decorative (illustration/photo at the bottom)
 *
 * Sets --card-text-color for its surface, which slotted <xe-action-link> elements inherit.
 * Surface colors are estimates from the docs screenshots until the design tokens are documented.
 */

const INTERACTIVE_TAGS = ['a', 'button', 'input', 'select', 'textarea', 'label', 'summary'];

const styles = `
  :host {
    --_bg: var(--xe-card-surface-bg, #faf7f5);
    --card-text-color: var(--xe-card-surface-text, #2a2522);

    display: block;
    box-sizing: border-box;
    height: 100%;
  }
  :host([hidden]) { display: none; }
  :host([variant="primary-variant"]) {
    --_bg: var(--xe-card-primary-variant-bg, #3f1b1d);
    --card-text-color: var(--xe-card-primary-variant-text, #fff);
  }

  .card {
    box-sizing: border-box;
    container-type: inline-size;
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 32px 32px 0;
    overflow: hidden;
    border-radius: var(--xe-card-radius, 8px);
    background-color: var(--_bg);
    color: var(--card-text-color);
    font-family: Arial, sans-serif;
    font-size: 20px;
    line-height: 1.5;
    transition: box-shadow 0.2s ease;
  }
  :host([interactive]:not([interactive="false"])) .card { cursor: pointer; }
  :host([interactive]:not([interactive="false"])) .card:hover {
    box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
  }

  [hidden] { display: none !important; }

  .icon {
    margin-bottom: 24px;
    line-height: 0;
  }

  /*
   * Title and body are the author's own light-DOM elements (<h3>, <p>), which the site's global
   * h1–h6/p rules also style. Page styles beat ::slotted() unless the component's are !important.
   */
  ::slotted([slot="title"]) {
    margin: 0 0 24px !important;
    color: inherit !important;
    font-family: "Arial Narrow", Arial, sans-serif !important;
    /* Scales with the card so long words fit (e.g. when Arial Narrow isn't installed) */
    font-size: clamp(26px, 11.5cqi, 40px) !important;
    overflow-wrap: break-word;
    font-stretch: condensed !important;
    font-style: normal !important;
    font-weight: 900 !important;
    letter-spacing: 0.01em !important;
    line-height: 1.05 !important;
    text-transform: uppercase;
  }

  .body { margin-bottom: 32px; }
  .body ::slotted(*) {
    margin: 0 !important;
    color: inherit !important;
    font: inherit !important;
    letter-spacing: inherit !important;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 24px;
    margin-bottom: 32px;
  }

  /* Illustration/photo sits at the bottom of the (equal-height) card */
  .decorative {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    margin: auto -32px 0;
    line-height: 0;
  }
  ::slotted([slot="decorative"]) {
    display: block;
    width: 100%;
    height: auto;
    max-height: var(--xe-card-decorative-max-height, 420px);
    object-fit: contain;
    object-position: bottom;
  }
`;

export default class XeCard extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;

    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('part', 'card');
    // The title slot is unwrapped (it holds the author's own heading element); the others get a
    // wrapper that is hidden while its slot is empty, so no spacing shows for missing content
    const titleSlot = document.createElement('slot');
    titleSlot.name = 'title';
    [['icon', 'icon'], ['title'], ['body', ''], ['actions', 'actions'], ['decorative', 'decorative']]
      .forEach(([name, slotName]) => {
        if (name === 'title') {
          card.append(titleSlot);
          return;
        }
        const slot = document.createElement('slot');
        if (slotName) slot.name = slotName;
        const wrapper = document.createElement('div');
        wrapper.className = name;
        wrapper.setAttribute('part', name);
        wrapper.hidden = true;
        wrapper.append(slot);
        slot.addEventListener('slotchange', () => {
          wrapper.hidden = !slot.assignedNodes()
            .some((node) => node.nodeType === Node.ELEMENT_NODE || node.textContent.trim());
        });
        card.append(wrapper);
      });
    root.append(style, card);

    this.addEventListener('click', (e) => this.onClick(e));
  }

  get isInteractive() {
    return this.hasAttribute('interactive') && this.getAttribute('interactive') !== 'false';
  }

  // The link the whole card follows: the first slotted action's inner <a> (or a plain <a>)
  get primaryLink() {
    const action = [...this.children].find((el) => el.slot === 'actions');
    if (!action) return null;
    if (action.localName === 'a') return action;
    return action.shadowRoot?.querySelector('a[href]') || action.querySelector('a[href]');
  }

  onClick(e) {
    if (!this.isInteractive || e.defaultPrevented) return;
    // Real links/buttons inside the card handle their own clicks
    const path = e.composedPath();
    const hitControl = path.some((el) => el === this.primaryLink
      || INTERACTIVE_TAGS.includes(el.localName) || el.localName === 'xe-action-link'
      || el.localName === 'xe-button');
    if (hitControl) return;
    // Don't hijack text selection
    if (window.getSelection?.().toString()) return;
    const link = this.primaryLink;
    if (!link?.href) return;
    if (e.ctrlKey || e.metaKey) {
      window.open(link.href, '_blank', 'noopener');
    } else {
      link.click();
    }
  }
}

if (!customElements.get('xe-card')) customElements.define('xe-card', XeCard);
