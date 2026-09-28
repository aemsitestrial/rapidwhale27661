import decorate from './xe-feature-cards.js';
import './xe-feature-cards.css';
import { illustration } from '../../scripts/components/xe-feature-cards.stories.js';

/*
 * Builds the markup Universal Editor delivers for an xe-feature-cards container block.
 *   heading / subheading — parent fields, one single-cell row each (omitted when empty)
 *   cards — XE Feature Card items; each item is one row with a cell per non-empty field, in
 *           alphabetical order: body, ctaLabel, ctaLink, ctaType, decorative, icon, title, variant
 * Item fields left undefined are skipped, as Universal Editor does for empty fields.
 */
export function buildBlock({ heading, subheading, cards = [] } = {}) {
  const block = document.createElement('div');
  block.className = 'xe-feature-cards block';
  const addRow = (fills) => {
    const row = document.createElement('div');
    fills.forEach((fill) => {
      const cell = document.createElement('div');
      fill(cell);
      row.append(cell);
    });
    block.append(row);
    return row;
  };
  const text = (value) => (cell) => { cell.textContent = value; };

  if (heading) addRow([text(heading)]);
  if (subheading) addRow([text(subheading)]);

  cards.forEach((card) => {
    const cells = [];
    if (card.body !== undefined) cells.push((cell) => { cell.innerHTML = card.body; });
    if (card.ctaLabel !== undefined) cells.push(text(card.ctaLabel));
    if (card.ctaLink !== undefined) {
      cells.push((cell) => {
        const a = document.createElement('a');
        a.href = card.ctaLink;
        a.textContent = card.ctaLink;
        cell.append(a);
      });
    }
    if (card.ctaType !== undefined) cells.push(text(`cta-${card.ctaType}`));
    if (card.decorative !== undefined) {
      cells.push((cell) => {
        const picture = document.createElement('picture');
        const img = document.createElement('img');
        img.src = card.decorative;
        img.alt = 'Illustration';
        picture.append(img);
        cell.append(picture);
      });
    }
    if (card.icon !== undefined) cells.push(text(`icon-${card.icon}`));
    if (card.title !== undefined) cells.push(text(card.title));
    if (card.variant !== undefined) cells.push(text(`variant-${card.variant}`));
    addRow(cells);
  });
  return block;
}

export const AUTHORED_CARDS = [
  {
    body: '<p>Earn rebates on everyday energy-efficiency purchases and projects for your home.</p>',
    ctaLabel: 'Learn More',
    ctaLink: '/rebates',
    ctaType: 'internal',
    decorative: illustration('#2a2522'),
    icon: 'faFileInvoiceDollar',
    title: 'Home Rebates',
    variant: 'surface',
  },
  {
    body: '<p>Make a positive environmental impact by using more renewable energy with these programs.</p>',
    ctaLabel: 'Learn More',
    ctaLink: '/renewable',
    ctaType: 'internal',
    decorative: illustration('#e9e2dc'),
    icon: 'faSolarPanel',
    title: 'Renewable Programs',
    variant: 'primary-variant',
  },
  {
    body: '<p>These in-home services and programs will help you more easily create an energy-efficient home.</p>',
    ctaLabel: 'Learn More',
    ctaLink: 'https://www.xcelenergy.com/home-improvement',
    ctaType: 'external',
    decorative: illustration('#2a2522'),
    icon: 'faWrench',
    title: 'Home Improvement',
    variant: 'surface',
  },
];

function renderInPage(options, { width } = {}) {
  const block = buildBlock(options);
  const main = document.createElement('main');
  const section = document.createElement('div');
  section.className = 'section';
  const wrapper = document.createElement('div');
  wrapper.className = 'xe-feature-cards-wrapper';
  if (width) wrapper.style.maxWidth = `${width}px`;
  wrapper.append(block);
  section.append(wrapper);
  main.append(section);
  decorate(block);
  return main;
}

export default {
  title: 'Blocks/XE Feature Cards',
  excludeStories: ['buildBlock', 'AUTHORED_CARDS'],
  parameters: { layout: 'fullscreen', a11y: { config: { rules: [] } } },
};

export const Default = {
  render: () => renderInPage({
    heading: 'Programs for your home',
    subheading: 'Save energy and money with rebates, renewable programs and in-home services.',
    cards: AUTHORED_CARDS,
  }),
};

export const TwoCards = {
  render: () => renderInPage({ cards: AUTHORED_CARDS.slice(0, 2) }),
};

export const MobileCarousel = {
  render: () => renderInPage({ cards: AUTHORED_CARDS }, { width: 390 }),
};

// Edge cases: optional fields left empty (skipped by Universal Editor)
export const MinimalCards = {
  render: () => renderInPage({
    cards: [
      { ctaLink: '/a', title: 'Title and link only' },
      { ctaLink: '/b', title: 'No icon or image', body: '<p>Body copy without an icon or illustration.</p>' },
    ],
  }),
};

// More than the design system's maximum of 3: only the first 3 render
export const MoreThanThree = {
  render: () => renderInPage({
    cards: [...AUTHORED_CARDS, { ctaLink: '/d', title: 'Fourth card (not shown)' }],
  }),
};

export const EmptyBlock = {
  render: () => renderInPage({}),
};
