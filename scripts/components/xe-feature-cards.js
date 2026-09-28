/*
 * <xe-feature-cards columns="3" mobile-layout="carousel" heading="" subheading=""
 *                   header-align="left" background="default">
 *   <xe-card …>…</xe-card>
 *   <xe-card …>…</xe-card>
 *   <xe-card …>…</xe-card>
 * </xe-feature-cards>
 *
 * Section-level composition that draws users into narrative and brand content (Xcel design
 * system: Feature Cards). A full-width band of tall, equal-height cards with an optional heading
 * and body copy. Slot 2–3 <xe-card> elements directly as children.
 *
 * Attributes:
 *   columns       — 2 | 3; defaults to the number of cards (2–3)
 *   mobile-layout — carousel (default): cards become a horizontal, swipeable row on mobile
 *   heading       — band title, rendered as an <h2> (make sure the level fits the page outline)
 *   subheading    — band body copy
 *   header-align  — left (default)
 *   background    — default
 * Slots: default (the <xe-card> elements)
 *
 * No implicit landmark role: add role="region" and aria-label to the host if the section needs
 * to be a named landmark.
 *
 * Extras beyond the DS docs (only the values above are documented): header-align="center";
 * any mobile-layout other than "carousel" stacks the cards in one column on mobile.
 */

const styles = `
  :host {
    container-type: inline-size;
    display: block;
    background-color: var(--xe-feature-cards-bg, transparent);
    color: #1a1a1a;
    font-family: Arial, sans-serif;
  }
  :host([hidden]) { display: none; }
  [hidden] { display: none !important; }

  .band {
    box-sizing: border-box;
    max-width: var(--xe-feature-cards-max-width, 1200px);
    margin: 0 auto;
    padding: 64px 24px;
  }

  .header {
    margin-bottom: 40px;
    text-align: start;
  }
  :host([header-align="center"]) .header { text-align: center; }

  h2 {
    margin: 0 0 12px;
    font-family: "Arial Narrow", Arial, sans-serif;
    font-size: clamp(32px, 2vw + 24px, 48px);
    font-stretch: condensed;
    font-weight: 900;
    line-height: 1.05;
    text-transform: uppercase;
  }

  .subheading {
    max-width: 720px;
    margin: 0;
    color: #333;
    font-size: 20px;
    line-height: 1.5;
  }
  :host([header-align="center"]) .subheading { margin-inline: auto; }

  /* Cards fill the width equally and share the same height */
  .cards {
    display: grid;
    grid-template-columns: repeat(var(--_columns, 3), minmax(0, 1fr));
    align-items: stretch;
    gap: 40px;
  }
  ::slotted(*) { min-width: 0; }

  /* Mobile layout follows the component's own width, not the window */
  @container (width <= 767px) {
    .band { padding-block: 48px; }

    .cards { grid-template-columns: minmax(0, 1fr); gap: 16px; }

    /* Carousel: horizontal swipeable row; the next card peeks in to show there's more */
    :host(:not([mobile-layout])) .cards,
    :host([mobile-layout="carousel"]) .cards {
      display: flex;
      margin-inline: -24px;
      padding-inline: 24px;
      overflow-x: auto;
      scroll-padding-inline: 24px;
      scroll-snap-type: x mandatory;
      overscroll-behavior-x: contain;
    }
    :host(:not([mobile-layout])) ::slotted(*),
    :host([mobile-layout="carousel"]) ::slotted(*) {
      flex: 0 0 85%;
      height: auto; /* let the row stretch every card to the same height */
      scroll-snap-align: start;
    }
  }
`;

export default class XeFeatureCards extends HTMLElement {
  static get observedAttributes() {
    return ['columns', 'heading', 'subheading'];
  }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;

    const band = document.createElement('div');
    band.className = 'band';
    band.setAttribute('part', 'band');

    this.header = document.createElement('div');
    this.header.className = 'header';
    this.header.setAttribute('part', 'header');
    this.headingEl = document.createElement('h2');
    this.headingEl.setAttribute('part', 'heading');
    this.subheadingEl = document.createElement('p');
    this.subheadingEl.className = 'subheading';
    this.subheadingEl.setAttribute('part', 'subheading');
    this.header.append(this.headingEl, this.subheadingEl);

    this.cards = document.createElement('div');
    this.cards.className = 'cards';
    this.cards.setAttribute('part', 'cards');
    this.slotEl = document.createElement('slot');
    this.slotEl.addEventListener('slotchange', () => this.updateColumns());
    this.cards.append(this.slotEl);

    band.append(this.header, this.cards);
    root.append(style, band);
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const heading = (this.getAttribute('heading') || '').trim();
    const subheading = (this.getAttribute('subheading') || '').trim();
    this.headingEl.textContent = heading;
    this.subheadingEl.textContent = subheading;
    this.headingEl.hidden = !heading;
    this.subheadingEl.hidden = !subheading;
    this.header.hidden = !heading && !subheading;
    this.updateColumns();
  }

  updateColumns() {
    const requested = parseInt(this.getAttribute('columns'), 10);
    const cardCount = this.slotEl.assignedElements().length;
    const columns = [2, 3].includes(requested) ? requested : Math.min(Math.max(cardCount, 2), 3);
    this.cards.style.setProperty('--_columns', columns);
  }
}

if (!customElements.get('xe-feature-cards')) customElements.define('xe-feature-cards', XeFeatureCards);
