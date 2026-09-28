import './xe-feature-cards.js';
import './xe-card.js';
import './xe-action-link.js';

// Placeholder illustration (the DS uses brand illustrations we don't have yet)
export function illustration(color) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="360" viewBox="0 0 400 360">
      <circle cx="300" cy="80" r="40" fill="${color}" opacity=".5"/>
      <path d="M0 360 L0 250 Q100 180 200 240 T400 220 L400 360 Z" fill="${color}"/>
      <rect x="90" y="150" width="200" height="90" rx="6" fill="none" stroke="${color}" stroke-width="10"/>
      <path d="M190 150v90M90 195h200" stroke="${color}" stroke-width="8"/></svg>`,
  )}`;
}

export const CARDS = [
  {
    variant: 'surface',
    icon: 'faFileInvoiceDollar',
    title: 'Home Rebates',
    body: 'Earn rebates on everyday energy-efficiency purchases and projects for your home.',
    href: '/rebates',
    decorative: illustration('#2a2522'),
  },
  {
    variant: 'primary-variant',
    icon: 'faSolarPanel',
    title: 'Renewable Programs',
    body: 'Make a positive environmental impact by using more renewable energy with these programs.',
    href: '/renewable',
    decorative: illustration('#e9e2dc'),
  },
  {
    variant: 'surface',
    icon: 'faWrench',
    title: 'Home Improvement',
    body: 'These in-home services and programs will help you more easily create an energy-efficient home.',
    href: '/home-improvement',
    decorative: illustration('#2a2522'),
  },
];

export function card({
  variant, icon, title, body, href, linkType, label = 'Learn More', decorative,
}) {
  const el = document.createElement('xe-card');
  el.setAttribute('variant', variant);
  el.setAttribute('treatment', 'filled');
  el.setAttribute('interactive', 'true');
  el.setAttribute('actions-placement', 'inline');
  if (icon) {
    const xeIcon = document.createElement('xe-icon');
    xeIcon.slot = 'icon';
    xeIcon.setAttribute('icon', icon);
    xeIcon.setAttribute('size', 'xl');
    el.append(xeIcon);
  }
  const h3 = document.createElement('h3');
  h3.slot = 'title';
  h3.textContent = title;
  const p = document.createElement('p');
  p.textContent = body;
  const link = document.createElement('xe-action-link');
  link.slot = 'actions';
  link.setAttribute('href', href);
  if (linkType) link.setAttribute('link-type', linkType);
  link.textContent = label;
  el.append(h3, p, link);
  if (decorative) {
    const img = document.createElement('img');
    img.slot = 'decorative';
    img.src = decorative;
    img.alt = '';
    el.append(img);
  }
  return el;
}

function featureCards({
  columns, heading = '', subheading = '', cards,
}) {
  const band = document.createElement('xe-feature-cards');
  band.setAttribute('columns', String(columns));
  band.setAttribute('mobile-layout', 'carousel');
  band.setAttribute('heading', heading);
  band.setAttribute('subheading', subheading);
  band.setAttribute('header-align', 'left');
  band.setAttribute('background', 'default');
  band.append(...cards.map(card));
  return band;
}

export default {
  title: 'Design System Primitives/Feature Cards',
  excludeStories: ['illustration', 'CARDS', 'card'],
  parameters: { layout: 'fullscreen', a11y: { config: { rules: [] } } },
};

// Matches the DS docs example: three tall cards (surface, primary-variant, surface)
export const Default = {
  render: () => featureCards({ columns: 3, cards: CARDS }),
};

// "Two equal-width cards side by side. Collapses to a carousel at mobile."
export const TwoCards = {
  name: '2 Cards',
  render: () => featureCards({ columns: 2, cards: CARDS.slice(0, 2) }),
};

// Band content: title (h2) and body copy
export const WithHeader = {
  render: () => featureCards({
    columns: 3,
    heading: 'Programs for your home',
    subheading: 'Save energy and money with rebates, renewable programs and in-home services.',
    cards: CARDS,
  }),
};

// Narrow container shows the mobile carousel
export const MobileCarousel = {
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.maxWidth = '390px';
    wrapper.append(featureCards({ columns: 3, cards: CARDS }));
    return wrapper;
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
