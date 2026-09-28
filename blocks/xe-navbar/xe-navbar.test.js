import {
  describe, it, expect, beforeEach,
} from 'vitest';
import decorate from './xe-navbar.js';
import { buildBlock, LINKS, ACTIONS } from './xe-navbar.stories.js';

// Let slotchange events and other microtasks run
const flush = () => new Promise((resolve) => { setTimeout(resolve, 0); });

function render(options) {
  const block = buildBlock(options);
  document.body.append(block);
  decorate(block);
  return block;
}

// happy-dom has no layout engine: fake the sizes xe-navbar measures, then re-run its check
function layout(navbar, {
  width, navNeeds, navHas, barNeeds = 0, barHas = 0,
}) {
  navbar.getBoundingClientRect = () => ({ width });
  Object.defineProperty(navbar.nav, 'scrollWidth', { configurable: true, value: navNeeds });
  Object.defineProperty(navbar.nav, 'clientWidth', { configurable: true, value: navHas });
  Object.defineProperty(navbar.bar, 'scrollWidth', { configurable: true, value: barNeeds });
  Object.defineProperty(navbar.bar, 'clientWidth', { configurable: true, value: barHas });
  navbar.update();
}

beforeEach(() => {
  document.body.innerHTML = '';
  document.body.style.overflow = '';
});

describe('xe-navbar block', () => {
  describe('decorate()', () => {
    it('renders an <xe-navbar> with logo, nav items and actions in the right slots', () => {
      const block = render({ links: LINKS, actions: ACTIONS });
      expect(block.children).toHaveLength(1);
      const navbar = block.querySelector(':scope > xe-navbar');
      const slots = [...navbar.children].map((el) => `${el.localName}:${el.slot}`);
      expect(slots).toEqual([
        'a:logo',
        ...LINKS.map(() => 'xe-nav-item:nav-items'),
        'xe-button:actions',
        'xe-button:toolbar-actions',
        'xe-button:actions',
      ]);
    });

    it('builds the logo as a link around the authored picture', () => {
      const block = render({ logoLink: '/home' });
      const logo = block.querySelector('xe-navbar > a[slot="logo"]');
      expect(logo.getAttribute('href')).toBe('/home');
      expect(logo.querySelector('img').alt).toBe('Xcel Energy');
    });

    it('links the logo to the home page when no logo link is set', () => {
      const block = render({ logoLink: '' });
      expect(block.querySelector('a[slot="logo"]').getAttribute('href')).toBe('/');
    });

    it('maps nav link fields to <xe-nav-item> attributes', () => {
      const block = render({ links: LINKS });
      const items = [...block.querySelectorAll('xe-nav-item')];
      expect(items.map((el) => el.textContent)).toEqual(LINKS.map((l) => l.label));
      expect(items[0].getAttribute('href')).toBe('/billing');
      expect(items[0].hasAttribute('target')).toBe(false);
      expect(items[4].getAttribute('target')).toBe('_blank');
    });

    it('marks the nav item for the current page as active', () => {
      const current = window.location.pathname;
      const block = render({ links: [{ label: 'Here', link: current }, ...LINKS] });
      const active = block.querySelectorAll('xe-nav-item[active]');
      expect(active).toHaveLength(1);
      expect(active[0].textContent).toBe('Here');
    });

    it('maps action fields to <xe-button> slot, treatment and forwarding attribute', () => {
      const block = render({ actions: ACTIONS });
      const [pay, signIn, contact] = block.querySelectorAll('xe-button');
      expect(pay.slot).toBe('actions');
      expect(pay.getAttribute('treatment')).toBe('filled');
      expect(pay.hasAttribute('data-collapse-to-drawer')).toBe(true);
      expect(signIn.slot).toBe('toolbar-actions');
      expect(signIn.getAttribute('treatment')).toBe('text');
      expect(contact.hasAttribute('data-drawer-only')).toBe(true);
      expect(pay.getAttribute('href')).toBe('/pay');
      expect(pay.textContent).toBe('Pay Bill');
    });

    it('adds no forwarding attribute for "Navbar and menu" actions', () => {
      const block = render({ actions: [{ label: 'Both', link: '/x', placement: 'both' }] });
      const button = block.querySelector('xe-button');
      expect(button.slot).toBe('actions');
      expect(button.getAttribute('treatment')).toBe('outlined');
      const forwarding = [...button.attributes].filter((a) => a.name.startsWith('data-'));
      expect(forwarding).toHaveLength(0);
    });

    it('reads items correctly when optional fields are skipped', () => {
      const block = render({
        links: [{ label: 'No new-tab field', link: '/a' }],
        actions: [{ label: 'Only style', link: '/b', style: 'filled' }],
      });
      expect(block.querySelector('xe-nav-item').getAttribute('href')).toBe('/a');
      const button = block.querySelector('xe-button');
      expect(button.slot).toBe('actions');
      expect(button.getAttribute('treatment')).toBe('filled');
    });

    it('skips items without a label or link', () => {
      const block = render({
        links: [{ label: 'No link', newTab: false }, { link: '/no-label', newTab: false }],
      });
      expect(block.querySelectorAll('xe-nav-item')).toHaveLength(0);
    });

    it('renders authored labels as text, not HTML', () => {
      const block = render({ links: [{ label: '<img src=x onerror="alert(1)">', link: '/x' }] });
      const item = block.querySelector('xe-nav-item');
      expect(item.querySelector('img')).toBeNull();
      expect(item.textContent).toBe('<img src=x onerror="alert(1)">');
    });

    it('moves Universal Editor instrumentation onto the rendered elements', () => {
      const block = buildBlock({ links: LINKS.slice(0, 1), actions: ACTIONS.slice(0, 1) });
      const [logoRow, , linkRow, actionRow] = block.children;
      logoRow.setAttribute('data-aue-prop', 'logo');
      linkRow.setAttribute('data-aue-resource', 'urn:link');
      actionRow.setAttribute('data-aue-resource', 'urn:action');
      decorate(block);
      expect(block.querySelector('a[slot="logo"]').dataset.aueProp).toBe('logo');
      expect(block.querySelector('xe-nav-item').dataset.aueResource).toBe('urn:link');
      expect(block.querySelector('xe-button').dataset.aueResource).toBe('urn:action');
    });

    it('does not throw for an empty block', () => {
      const block = buildBlock({ logo: '', logoLink: '' });
      expect(() => decorate(block)).not.toThrow();
      expect(block.querySelector('xe-navbar').children).toHaveLength(0);
    });
  });

  describe('<xe-navbar>', () => {
    it('shows the toolbar row only when toolbar content is visible', async () => {
      const withToolbar = render({ actions: ACTIONS.slice(1, 2) });
      const drawerOnly = render({
        actions: [{
          label: 'Hidden', link: '/h', location: 'toolbar', placement: 'drawer-only',
        }],
      });
      const none = render({ links: LINKS });
      await flush();
      const toolbar = (block) => block.querySelector('xe-navbar').shadowRoot.querySelector('.toolbar-wrap');
      expect(toolbar(withToolbar).hidden).toBe(false);
      expect(toolbar(drawerOnly).hidden).toBe(true);
      expect(toolbar(none).hidden).toBe(true);
    });

    it('labels the navigation landmark', () => {
      const navbar = render({ links: LINKS }).querySelector('xe-navbar');
      expect(navbar.shadowRoot.querySelector('nav.nav').getAttribute('aria-label')).toBe('Main');
      navbar.setAttribute('label', 'Primary');
      expect(navbar.shadowRoot.querySelector('nav.nav').getAttribute('aria-label')).toBe('Primary');
    });

    it('collapses when nav items no longer fit and shows the menu button', () => {
      const navbar = render({ links: LINKS, actions: ACTIONS }).querySelector('xe-navbar');
      const menuButton = navbar.shadowRoot.querySelector('.menu-toggle');

      layout(navbar, { width: 1440, navNeeds: 700, navHas: 800 });
      expect(navbar.hasAttribute('collapsed')).toBe(false);
      expect(menuButton.hidden).toBe(true);

      layout(navbar, { width: 1000, navNeeds: 700, navHas: 400 });
      expect(navbar.hasAttribute('collapsed')).toBe(true);
      expect(menuButton.hidden).toBe(false);
    });

    it('only expands again once wider than where it collapsed', () => {
      const navbar = render({ links: LINKS }).querySelector('xe-navbar');
      layout(navbar, { width: 1000, navNeeds: 700, navHas: 400 });
      expect(navbar.hasAttribute('collapsed')).toBe(true);

      // Hidden collapse-to-drawer actions free space, but the bar is no wider: stay collapsed
      layout(navbar, { width: 1000, navNeeds: 700, navHas: 900 });
      expect(navbar.hasAttribute('collapsed')).toBe(true);

      layout(navbar, { width: 1440, navNeeds: 700, navHas: 800 });
      expect(navbar.hasAttribute('collapsed')).toBe(false);
    });

    it('stacks actions on their own row when even the collapsed bar overflows', () => {
      const navbar = render({ links: LINKS, actions: ACTIONS }).querySelector('xe-navbar');
      layout(navbar, {
        width: 390, navNeeds: 700, navHas: 0, barNeeds: 600, barHas: 390,
      });
      expect(navbar.hasAttribute('stacked')).toBe(true);
      layout(navbar, {
        width: 390, navNeeds: 700, navHas: 0, barNeeds: 390, barHas: 390,
      });
      expect(navbar.hasAttribute('stacked')).toBe(false);
    });

    it('fills the drawer with nav items and forwards actions per their attributes', () => {
      const block = render({
        links: LINKS.slice(0, 2),
        actions: [
          { label: 'Both', link: '/a', placement: 'both' },
          { label: 'Navbar only', link: '/b', placement: 'navbar-only' },
          { label: 'Drawer only', link: '/c', placement: 'drawer-only' },
          { label: 'Collapse', link: '/d', placement: 'collapse-to-drawer' },
          {
            label: 'Toolbar', link: '/e', location: 'toolbar', placement: 'both',
          },
        ],
      });
      const navbar = block.querySelector('xe-navbar');
      layout(navbar, { width: 390, navNeeds: 700, navHas: 0 });
      navbar.shadowRoot.querySelector('.menu-toggle').click();

      const { shadowRoot } = navbar;
      const drawerNav = [...shadowRoot.querySelectorAll('.drawer-nav > xe-nav-item')];
      expect(drawerNav.map((el) => el.textContent)).toEqual(['Billing & Payment', 'Outages']);
      expect(drawerNav.every((el) => !el.slot && el.hasAttribute('data-drawer-copy'))).toBe(true);

      const drawerActions = [...shadowRoot.querySelectorAll('.drawer-actions > *')];
      expect(drawerActions.map((el) => el.textContent))
        .toEqual(['Both', 'Drawer only', 'Collapse', 'Toolbar']);
      // Originals stay in the light DOM, untouched
      expect(block.querySelectorAll('xe-navbar > xe-button')).toHaveLength(5);
    });

    it('opens and closes the drawer with correct state, focus and scroll lock', () => {
      const navbar = render({ links: LINKS }).querySelector('xe-navbar');
      layout(navbar, { width: 390, navNeeds: 700, navHas: 0 });
      const { shadowRoot } = navbar;
      const menuButton = shadowRoot.querySelector('.menu-toggle');
      const drawer = shadowRoot.querySelector('.drawer');

      menuButton.click();
      expect(drawer.hidden).toBe(false);
      expect(navbar.hasAttribute('drawer-open')).toBe(true);
      expect(menuButton.getAttribute('aria-expanded')).toBe('true');
      expect(drawer.getAttribute('role')).toBe('dialog');
      expect(document.body.style.overflow).toBe('hidden');

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(drawer.hidden).toBe(true);
      expect(navbar.hasAttribute('drawer-open')).toBe(false);
      expect(menuButton.getAttribute('aria-expanded')).toBe('false');
      expect(document.body.style.overflow).toBe('');
    });

    it('closes the drawer from the close button and the backdrop', () => {
      const navbar = render({ links: LINKS }).querySelector('xe-navbar');
      layout(navbar, { width: 390, navNeeds: 700, navHas: 0 });
      const { shadowRoot } = navbar;

      navbar.openDrawer();
      shadowRoot.querySelector('.drawer-close').click();
      expect(shadowRoot.querySelector('.drawer').hidden).toBe(true);

      navbar.openDrawer();
      shadowRoot.querySelector('.scrim').click();
      expect(shadowRoot.querySelector('.drawer').hidden).toBe(true);
    });

    it('closes the drawer when the navbar expands again', () => {
      const navbar = render({ links: LINKS }).querySelector('xe-navbar');
      layout(navbar, { width: 390, navNeeds: 700, navHas: 0 });
      navbar.openDrawer();
      layout(navbar, { width: 1440, navNeeds: 700, navHas: 800 });
      expect(navbar.shadowRoot.querySelector('.drawer').hidden).toBe(true);
    });
  });

  describe('<xe-nav-item>', () => {
    it('renders a link, with aria-current when active', () => {
      const item = document.createElement('xe-nav-item');
      item.setAttribute('href', '/billing');
      document.body.append(item);
      const a = item.shadowRoot.querySelector('a.control');
      expect(a.getAttribute('href')).toBe('/billing');
      expect(a.hasAttribute('aria-current')).toBe(false);

      item.setAttribute('active', '');
      expect(item.shadowRoot.querySelector('a').getAttribute('aria-current')).toBe('page');
    });

    it('adds rel="noopener noreferrer" for target="_blank"', () => {
      const item = document.createElement('xe-nav-item');
      item.setAttribute('href', 'https://example.com');
      item.setAttribute('target', '_blank');
      document.body.append(item);
      const a = item.shadowRoot.querySelector('a');
      expect(a.target).toBe('_blank');
      expect(a.rel).toBe('noopener noreferrer');
    });

    it('renders a button without href', () => {
      const item = document.createElement('xe-nav-item');
      item.setAttribute('active', '');
      document.body.append(item);
      const button = item.shadowRoot.querySelector('button.control');
      expect(button.type).toBe('button');
      expect(button.getAttribute('aria-pressed')).toBe('true');
    });

    it('has leading-icon and default slots', () => {
      const item = document.createElement('xe-nav-item');
      document.body.append(item);
      const slots = [...item.shadowRoot.querySelectorAll('slot')].map((s) => s.name);
      expect(slots).toEqual(['leading-icon', '']);
    });
  });
});
