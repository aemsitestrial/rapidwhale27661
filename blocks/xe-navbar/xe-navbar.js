import '../../scripts/components/xe-navbar.js';
import '../../scripts/components/xe-nav-item.js';
import '../../scripts/components/xe-button.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * xe-navbar — renders authored content with the <xe-navbar> web component.
 *
 * Authored structure (container block):
 *   Parent fields — one single-cell row each: logo (+ logoAlt → picture), logoLink
 *   Child items   — one multi-cell row each:
 *     XE Navbar Link:   label, link, newTab
 *     XE Navbar Action: label, link, location, placement, style
 * Universal Editor skips empty fields, so cells are detected by content instead of position.
 * Select values are prefixed (location-, placement-, style-) so they can't be mistaken for labels.
 */

const PLACEMENT_ATTRS = {
  'navbar-only': 'data-navbar-only',
  'drawer-only': 'data-drawer-only',
  'collapse-to-drawer': 'data-collapse-to-drawer',
};

const isUrl = (text) => text.startsWith('/') || text.startsWith('#') || /^https?:\/\//.test(text);

function readItem(cells) {
  const item = { label: '', href: '', options: {} };
  cells.forEach((cell) => {
    const link = cell.querySelector('a');
    const text = cell.textContent.trim();
    const option = text.match(/^(location|placement|style)-(.+)$/);
    if (link) {
      item.href = link.getAttribute('href') || '';
    } else if (option) {
      [, , item.options[option[1]]] = option;
    } else if (text === 'true' || text === 'false') {
      item.newTab = text === 'true';
    } else if (text && isUrl(text) && !item.href) {
      item.href = text;
    } else if (text && !item.label) {
      item.label = text;
    }
  });
  item.isAction = Object.keys(item.options).length > 0;
  return item;
}

function isCurrentPage(href) {
  try {
    const url = new URL(href, window.location.href);
    const normalize = (path) => path.replace(/\/$/, '') || '/';
    return url.origin === window.location.origin
      && normalize(url.pathname) === normalize(window.location.pathname);
  } catch (e) {
    return false;
  }
}

function buildNavItem({ label, href, newTab }) {
  const navItem = document.createElement('xe-nav-item');
  navItem.slot = 'nav-items';
  navItem.setAttribute('href', href);
  if (newTab) navItem.setAttribute('target', '_blank');
  if (isCurrentPage(href)) navItem.setAttribute('active', '');
  navItem.textContent = label;
  return navItem;
}

function buildAction({ label, href, options }) {
  const button = document.createElement('xe-button');
  button.slot = options.location === 'toolbar' ? 'toolbar-actions' : 'actions';
  button.setAttribute('variant', 'primary');
  button.setAttribute('treatment', options.style || 'outlined');
  button.setAttribute('size', 'sm');
  button.setAttribute('href', href);
  const attr = PLACEMENT_ATTRS[options.placement];
  if (attr) button.setAttribute(attr, '');
  button.textContent = label;
  return button;
}

export default function decorate(block) {
  const navbar = document.createElement('xe-navbar');
  let picture;
  let logoHref = '';
  let logoRow;

  [...block.children].forEach((row) => {
    const cells = [...row.children];

    // Parent fields: single-cell rows
    if (cells.length === 1) {
      const cell = cells[0];
      const text = cell.textContent.trim();
      if (cell.querySelector('picture, img')) {
        picture = cell.querySelector('picture') || cell.querySelector('img');
        logoRow = row;
      } else if (cell.querySelector('a') || isUrl(text)) {
        logoHref = cell.querySelector('a')?.getAttribute('href') || text;
      }
      return;
    }

    // Child items: multi-cell rows
    const item = readItem(cells);
    if (!item.label || !item.href) return;
    const el = item.isAction ? buildAction(item) : buildNavItem(item);
    moveInstrumentation(row, el);
    navbar.append(el);
  });

  if (picture) {
    const logo = document.createElement('a');
    logo.slot = 'logo';
    logo.href = logoHref || '/';
    moveInstrumentation(logoRow, logo);
    logo.append(picture);
    navbar.prepend(logo);
  }

  block.replaceChildren(navbar);
}
