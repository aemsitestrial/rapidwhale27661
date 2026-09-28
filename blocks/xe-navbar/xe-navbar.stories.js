import decorate from './xe-navbar.js';
import './xe-navbar.css';

// Placeholder logo so stories don't depend on site assets
export const LOGO_SRC = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40">'
  + '<rect width="160" height="40" rx="4" fill="#c8102e"/>'
  + '<text x="80" y="26" font-family="Arial" font-size="16" font-weight="700" fill="#fff" '
  + 'text-anchor="middle">Xcel Energy</text></svg>',
)}`;

/*
 * Builds the markup Universal Editor delivers for an xe-navbar container block.
 *   logo / logoLink   — parent fields, one single-cell row each (omitted when empty)
 *   links             — [{ label, link, newTab }]  → XE Navbar Link items
 *   actions           — [{ label, link, location, placement, style }] → XE Navbar Action items
 * Item fields left undefined are skipped, as Universal Editor does for empty fields.
 */
export function buildBlock({
  logo = LOGO_SRC, logoAlt = 'Xcel Energy', logoLink = '/', links = [], actions = [],
} = {}) {
  const block = document.createElement('div');
  block.className = 'xe-navbar block';

  const addRow = (values) => {
    const row = document.createElement('div');
    values.forEach((fill) => {
      const cell = document.createElement('div');
      fill(cell);
      row.append(cell);
    });
    block.append(row);
    return row;
  };
  const text = (value) => (cell) => { cell.textContent = value; };
  const link = (href) => (cell) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = href;
    cell.append(a);
  };

  if (logo) {
    addRow([(cell) => {
      const picture = document.createElement('picture');
      const img = document.createElement('img');
      img.src = logo;
      img.alt = logoAlt;
      picture.append(img);
      cell.append(picture);
    }]);
  }
  if (logoLink) addRow([link(logoLink)]);

  links.forEach((item) => {
    const cells = [];
    if (item.label !== undefined) cells.push(text(item.label));
    if (item.link !== undefined) cells.push(link(item.link));
    if (item.newTab !== undefined) cells.push(text(String(item.newTab)));
    addRow(cells);
  });

  actions.forEach((item) => {
    const cells = [];
    if (item.label !== undefined) cells.push(text(item.label));
    if (item.link !== undefined) cells.push(link(item.link));
    ['location', 'placement', 'style'].forEach((key) => {
      if (item[key] !== undefined) cells.push(text(`${key}-${item[key]}`));
    });
    addRow(cells);
  });

  return block;
}

export const LINKS = [
  { label: 'Billing & Payment', link: '/billing', newTab: false },
  { label: 'Outages', link: '/outages', newTab: false },
  { label: 'Save Energy', link: '/programs', newTab: false },
  { label: 'Start, Stop & Move', link: '/move', newTab: false },
  { label: 'Help', link: 'https://www.xcelenergy.com/help', newTab: true },
];

export const ACTIONS = [
  {
    label: 'Pay Bill', link: '/pay', location: 'actions', placement: 'collapse-to-drawer', style: 'filled',
  },
  {
    label: 'Sign In', link: '/sign-in', location: 'toolbar', placement: 'collapse-to-drawer', style: 'text',
  },
  {
    label: 'Contact Us', link: '/contact', location: 'actions', placement: 'drawer-only', style: 'text',
  },
];

// Render inside the section/wrapper structure EDS creates, optionally constrained in width
function renderInPage(options, { width, openDrawer } = {}) {
  const block = buildBlock(options);
  const main = document.createElement('main');
  const section = document.createElement('div');
  section.className = 'section';
  const wrapper = document.createElement('div');
  wrapper.className = 'xe-navbar-wrapper';
  if (width) wrapper.style.width = `${width}px`;
  wrapper.append(block);
  section.append(wrapper);
  main.append(section);
  decorate(block);
  if (openDrawer) {
    // Wait for the collapse measurement, then open the built-in drawer
    setTimeout(() => block.querySelector('xe-navbar').openDrawer(), 300);
  }
  return main;
}

export default {
  title: 'Blocks/XE Navbar',
  excludeStories: ['buildBlock', 'LOGO_SRC', 'LINKS', 'ACTIONS'],
  parameters: { layout: 'fullscreen', a11y: { config: { rules: [] } } },
};

// Desktop: logo, nav items, a filled action, and Sign In in the toolbar
export const Default = {
  render: () => renderInPage({ links: LINKS, actions: ACTIONS }),
};

// Narrow container: nav items collapse behind the hamburger button
export const Collapsed = {
  render: () => renderInPage({ links: LINKS, actions: ACTIONS }, { width: 390 }),
};

// Collapsed with the built-in drawer open (nav items + forwarded actions)
export const DrawerOpen = {
  render: () => renderInPage({ links: LINKS, actions: ACTIONS }, { width: 390, openDrawer: true }),
};

// Every action forwarding rule from the design system docs
export const ActionForwarding = {
  render: () => renderInPage({
    links: LINKS.slice(0, 3),
    actions: [
      {
        label: 'Both', link: '/a', placement: 'both', style: 'outlined',
      },
      {
        label: 'Navbar only', link: '/b', placement: 'navbar-only', style: 'outlined',
      },
      {
        label: 'Drawer only', link: '/c', placement: 'drawer-only', style: 'outlined',
      },
      {
        label: 'Collapse to drawer', link: '/d', placement: 'collapse-to-drawer', style: 'outlined',
      },
    ],
  }),
};

// Edge cases
export const NoActions = {
  render: () => renderInPage({ links: LINKS }),
};

export const LogoOnly = {
  render: () => renderInPage({}),
};

export const EmptyBlock = {
  render: () => renderInPage({ logo: '', logoLink: '' }),
};
