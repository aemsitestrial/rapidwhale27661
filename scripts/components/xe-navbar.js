/*
 * <xe-navbar label="Main">
 *   <a slot="logo" href="/"><img src="/logo.svg" alt="Xcel Energy"></a>
 *   <xe-nav-item slot="nav-items" href="/billing" active>Billing &amp; Payment</xe-nav-item>
 *   <xe-search-bar slot="search" collapsed></xe-search-bar>
 *   <xe-button slot="actions" href="/outages">Outages</xe-button>
 *   <xe-segmented-button slot="toolbar-selector">…</xe-segmented-button>
 *   <xe-button slot="toolbar-actions" href="/sign-in" data-collapse-to-drawer>Sign In</xe-button>
 * </xe-navbar>
 *
 * Horizontal navigation bar (Xcel design system: Navigation › Navbar). Collapses to a hamburger
 * layout when the nav items no longer fit; the mobile drawer is built in.
 *
 * Slots:
 *   logo             — brand logo, always visible
 *   nav-items        — desktop nav links (<xe-nav-item>), hidden when collapsed (shown in drawer)
 *   search           — <xe-search-bar collapsed>; rendered inline in the bar
 *   actions          — right-aligned actions; forwarded to the drawer on mobile
 *   toolbar-selector — full-width segmented button above the main bar
 *   toolbar-actions  — right-aligned toolbar actions (sign in, language selector…)
 *
 * Action forwarding (elements in `actions` or `toolbar-actions`):
 *   (none)                  — always visible in the navbar; also forwarded to the drawer
 *   data-navbar-only        — navbar only, never forwarded to the drawer
 *   data-drawer-only        — drawer only, hidden in the navbar
 *   data-collapse-to-drawer — navbar on desktop; drawer on mobile when the nav collapses
 *
 * Attributes:
 *   label       — accessible name of the navigation landmark (default "Main")
 *   collapsed   — set by the component while the hamburger layout is active (don't set it)
 *   drawer-open — set by the component while the drawer is open
 *   stacked     — set by the component when even the collapsed bar can't fit its actions; they
 *                 then move to their own row (an extra beyond the DS docs, to avoid page overflow)
 *
 * The drawer shows copies (clones) of the nav items and forwarded actions: event listeners added
 * to the originals with JavaScript are not copied, so drawer copies should be plain links/buttons.
 */

import './xe-icon.js';

const styles = `
  :host {
    --_bg: var(--xe-navbar-bg, #fff);
    --_toolbar-bg: var(--xe-navbar-toolbar-bg, #f5ede8);
    --_border: var(--xe-navbar-border-color, #e6e1dc);
    --_max-width: var(--xe-navbar-max-width, 1360px);

    display: block;
    position: relative;
    background-color: var(--_bg);
    color: #1a1a1a;
    font-family: Arial, sans-serif;
  }
  :host([hidden]) { display: none; }
  [hidden] { display: none !important; }

  .row {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    max-width: var(--_max-width);
    margin: 0 auto;
    padding-inline: 24px;
  }

  .toolbar-wrap {
    background-color: var(--_toolbar-bg);
    font-size: 14px;
  }
  /*
   * Fixed row heights so the header's height is predictable and can be reserved before it loads
   * (no layout shift — build-log I-24): toolbar 64px + bar 72px + 1px border = 137px.
   * Mirrored by --xe-header-height in styles/styles.css; keep the two in sync.
   */
  .toolbar {
    gap: 16px;
    height: var(--xe-navbar-toolbar-height, 64px);
  }
  .toolbar-selector {
    flex: 1 1 auto;
    min-width: 0;
  }
  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-inline-start: auto;
  }

  .bar-wrap { border-bottom: 1px solid var(--_border); }
  .bar {
    gap: 24px;
    height: var(--xe-navbar-bar-height, 72px);
  }

  .logo {
    display: flex;
    flex: none;
    align-items: center;
  }
  ::slotted([slot="logo"]) {
    display: inline-flex;
    max-height: 48px;
  }

  /* Takes all remaining space; its scrollWidth vs clientWidth decides when to collapse */
  .nav {
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
  }
  .nav-items {
    display: flex;
    align-items: center;
    gap: 4px;
    width: max-content;
  }
  :host([collapsed]) .nav { visibility: hidden; }

  .search,
  .actions {
    display: flex;
    flex: none;
    align-items: center;
    gap: 8px;
  }

  /* Extra (not in DS docs): if the collapsed bar still overflows, actions move to their own row */
  :host([stacked]) .bar {
    flex-wrap: wrap;
    row-gap: 8px;
    height: auto;
    padding-block: 14px;
  }
  :host([stacked]) .actions {
    flex-wrap: wrap;
    flex-basis: 100%;
    order: 1;
  }

  ::slotted([data-drawer-only]) { display: none !important; }
  :host([collapsed]) ::slotted([data-collapse-to-drawer]) { display: none !important; }

  .icon-button {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  .icon-button:hover { background-color: rgb(139 90 60 / 8%); }
  .icon-button:focus-visible {
    outline: 2px solid currentcolor;
    outline-offset: 2px;
  }

  .scrim {
    position: fixed;
    inset: 0;
    z-index: 999;
    background-color: rgb(0 0 0 / 40%);
  }
  .drawer {
    box-sizing: border-box;
    position: fixed;
    inset: 0 0 0 auto;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: min(360px, 85vw);
    padding: 12px 16px 24px;
    overflow-y: auto;
    background-color: var(--_bg);
    box-shadow: -4px 0 24px rgb(0 0 0 / 20%);
  }
  .drawer-header {
    display: flex;
    justify-content: flex-end;
  }
  .drawer-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .drawer-nav xe-nav-item { display: flex; }
  .drawer-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--_border);
  }
  .drawer-actions:empty { display: none; }
`;

function iconButton(className, icon, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `icon-button ${className}`;
  button.setAttribute('aria-label', label);
  const xeIcon = document.createElement('xe-icon');
  xeIcon.setAttribute('icon', icon);
  xeIcon.setAttribute('size', 'md');
  button.append(xeIcon);
  return button;
}

function region(className, slotName, tag = 'div') {
  const el = document.createElement(tag);
  el.className = className;
  if (slotName) {
    const slot = document.createElement('slot');
    slot.name = slotName;
    el.append(slot);
  }
  return el;
}

// Copy an element for the drawer without duplicating ids or slot assignment
function drawerCopy(el) {
  const copy = el.cloneNode(true);
  copy.removeAttribute('slot');
  copy.removeAttribute('id');
  copy.querySelectorAll('[id]').forEach((child) => child.removeAttribute('id'));
  copy.setAttribute('data-drawer-copy', '');
  return copy;
}

let drawerCount = 0;

export default class XeNavbar extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;

    // Toolbar row — only shown when one of its slots has content
    this.toolbarWrap = region('toolbar-wrap');
    const toolbar = region('row toolbar');
    toolbar.setAttribute('part', 'toolbar');
    toolbar.append(
      region('toolbar-selector', 'toolbar-selector'),
      region('toolbar-actions', 'toolbar-actions'),
    );
    this.toolbarWrap.append(toolbar);
    this.toolbarWrap.hidden = true;

    // Main bar
    const barWrap = region('bar-wrap');
    const bar = region('row bar');
    bar.setAttribute('part', 'bar');
    this.bar = bar;
    this.nav = region('nav', null, 'nav');
    this.nav.append(region('nav-items', 'nav-items'));
    drawerCount += 1;
    const drawerId = `xe-navbar-drawer-${drawerCount}`;
    this.menuButton = iconButton('menu-toggle', 'faBars', 'Open menu');
    this.menuButton.setAttribute('aria-expanded', 'false');
    this.menuButton.setAttribute('aria-controls', drawerId);
    this.menuButton.hidden = true;
    bar.append(
      region('logo', 'logo'),
      this.nav,
      region('search', 'search'),
      region('actions', 'actions'),
      this.menuButton,
    );
    barWrap.append(bar);

    // Drawer
    this.scrim = region('scrim');
    this.scrim.hidden = true;
    this.drawer = region('drawer');
    this.drawer.id = drawerId;
    this.drawer.setAttribute('part', 'drawer');
    this.drawer.setAttribute('role', 'dialog');
    this.drawer.setAttribute('aria-modal', 'true');
    this.drawer.hidden = true;
    const drawerHeader = region('drawer-header');
    this.closeButton = iconButton('drawer-close', 'faXmark', 'Close menu');
    drawerHeader.append(this.closeButton);
    this.drawerNav = region('drawer-nav', null, 'nav');
    this.drawerActions = region('drawer-actions');
    this.drawer.append(drawerHeader, this.drawerNav, this.drawerActions);

    root.append(style, this.toolbarWrap, barWrap, this.scrim, this.drawer);

    this.menuButton.addEventListener('click', () => this.openDrawer());
    this.closeButton.addEventListener('click', () => this.closeDrawer());
    this.scrim.addEventListener('click', () => this.closeDrawer());
    this.drawer.addEventListener('click', (e) => {
      if (e.composedPath().some((el) => el.localName === 'a' && el.href)) this.closeDrawer();
    });
    this.onKeydown = this.onKeydown.bind(this);

    root.addEventListener('slotchange', () => {
      this.expandThreshold = 0; // content changed: re-measure from the expanded layout
      this.update();
      this.updateToolbar();
    });
    this.resizeObserver = new ResizeObserver(() => this.update());
  }

  static get observedAttributes() {
    return ['label'];
  }

  attributeChangedCallback() {
    this.applyLabel();
  }

  connectedCallback() {
    this.applyLabel();
    this.resizeObserver.observe(this);
    this.update();
  }

  disconnectedCallback() {
    this.resizeObserver.disconnect();
    this.closeDrawer();
  }

  applyLabel() {
    const label = this.getAttribute('label') || 'Main';
    this.nav.setAttribute('aria-label', label);
    this.drawerNav.setAttribute('aria-label', label);
    this.drawer.setAttribute('aria-label', `${label} menu`);
  }

  slotted(name) {
    return [...this.children].filter((el) => el.slot === name);
  }

  // Collapse when the nav items overflow; expand again only once the bar is wider than it was
  // when it collapsed (prevents flip-flopping when collapse-to-drawer actions hide and free space).
  update() {
    const { width } = this.getBoundingClientRect();
    if (!width) return;
    this.removeAttribute('stacked'); // measure the normal layout
    const collapsed = this.hasAttribute('collapsed');
    if (!collapsed || width > this.expandThreshold) {
      if (collapsed) this.setCollapsed(false);
      if (this.nav.scrollWidth > this.nav.clientWidth + 1) {
        this.expandThreshold = width;
        this.setCollapsed(true);
      }
    }
    if (this.hasAttribute('collapsed') && this.bar.scrollWidth > this.bar.clientWidth + 1) {
      this.setAttribute('stacked', '');
    }
  }

  setCollapsed(collapsed) {
    this.toggleAttribute('collapsed', collapsed);
    this.menuButton.hidden = !collapsed;
    if (!collapsed) this.closeDrawer();
    this.updateToolbar();
  }

  // Show the toolbar row only while something in it is visible in the navbar
  updateToolbar() {
    const collapsed = this.hasAttribute('collapsed');
    const visibleActions = this.slotted('toolbar-actions').filter((el) => !(
      el.hasAttribute('data-drawer-only')
      || (collapsed && el.hasAttribute('data-collapse-to-drawer'))
    ));
    this.toolbarWrap.hidden = !this.slotted('toolbar-selector').length && !visibleActions.length;
  }

  buildDrawer() {
    this.drawerNav.replaceChildren(...this.slotted('nav-items').map(drawerCopy));
    const forwarded = [...this.slotted('actions'), ...this.slotted('toolbar-actions')]
      .filter((el) => !el.hasAttribute('data-navbar-only'))
      .map((el) => {
        const copy = drawerCopy(el);
        copy.removeAttribute('data-drawer-only');
        copy.removeAttribute('data-collapse-to-drawer');
        return copy;
      });
    this.drawerActions.replaceChildren(...forwarded);
  }

  openDrawer() {
    this.buildDrawer();
    this.drawer.hidden = false;
    this.scrim.hidden = false;
    this.setAttribute('drawer-open', '');
    this.menuButton.setAttribute('aria-expanded', 'true');
    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this.onKeydown);
    this.closeButton.focus();
  }

  closeDrawer() {
    if (this.drawer.hidden) return;
    this.drawer.hidden = true;
    this.scrim.hidden = true;
    this.removeAttribute('drawer-open');
    this.menuButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = this.previousOverflow || '';
    document.removeEventListener('keydown', this.onKeydown);
    if (!this.menuButton.hidden) this.menuButton.focus();
  }

  // Escape closes; Tab stays inside the drawer while it is open
  onKeydown(e) {
    if (e.key === 'Escape') {
      this.closeDrawer();
      return;
    }
    if (e.key !== 'Tab') return;
    // Drawer copies are links, buttons or custom elements that delegate focus to their control
    const focusables = [this.closeButton, ...this.drawer.querySelectorAll('[data-drawer-copy]')];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = this.shadowRoot.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

if (!customElements.get('xe-navbar')) customElements.define('xe-navbar', XeNavbar);
