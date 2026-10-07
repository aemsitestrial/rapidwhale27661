import {
  describe, it, expect, beforeEach,
} from 'vitest';
import './xe-action-link.js';
import '../icons.js'; // site-level icon registration, as on a page

function create(attrs = {}, label = 'Learn more') {
  const el = document.createElement('xe-action-link');
  Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, value));
  el.textContent = label;
  document.body.append(el);
  return el;
}

const link = (el) => el.shadowRoot.querySelector('a');
const icon = (el) => el.shadowRoot.querySelector('xe-icon').getAttribute('icon');

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('<xe-action-link>', () => {
  it('renders a link with the href, the label slot and a trailing icon', () => {
    const el = create({ href: '/programs' });
    const a = link(el);
    expect(a.getAttribute('href')).toBe('/programs');
    expect(a.querySelector('slot')).not.toBeNull();
    expect(a.lastElementChild.localName).toBe('xe-icon');
    expect(el.textContent).toBe('Learn more');
  });

  it('defaults to link-type "internal" with an arrow right', () => {
    const el = create({ href: '/programs' });
    expect(icon(el)).toBe('faArrowRight');
    expect(link(el).hasAttribute('target')).toBe(false);
    expect(link(el).hasAttribute('download')).toBe(false);
  });

  it('treats an unknown link-type as internal', () => {
    expect(icon(create({ href: '/x', 'link-type': 'bogus' }))).toBe('faArrowRight');
  });

  it('link-type="external" shows arrow up-right and opens safely in a new tab', () => {
    const el = create({ href: 'https://www.xcelenergy.com', 'link-type': 'external' }, 'Visit site');
    const a = link(el);
    expect(icon(el)).toBe('faArrowUpRightFromSquare');
    expect(a.target).toBe('_blank');
    expect(a.rel).toBe('noopener noreferrer');
    expect(a.querySelector('.visually-hidden').textContent).toBe(' (opens in a new tab)');
  });

  it('link-type="download" shows arrow down and sets the download attribute', () => {
    const el = create({ href: '/files/rate-book.pdf', 'link-type': 'download' });
    expect(icon(el)).toBe('faArrowDown');
    expect(link(el).hasAttribute('download')).toBe(true);
    expect(link(el).hasAttribute('target')).toBe(false);
  });

  it('updates when link-type or href change', () => {
    const el = create({ href: '/a' });
    el.setAttribute('link-type', 'download');
    el.setAttribute('href', '/b.pdf');
    expect(icon(el)).toBe('faArrowDown');
    expect(link(el).getAttribute('href')).toBe('/b.pdf');
    expect(el.shadowRoot.querySelectorAll('a')).toHaveLength(1);
  });

  it('keeps the trailing icon decorative', () => {
    const el = create({ href: '/a' });
    const svg = el.shadowRoot.querySelector('xe-icon').shadowRoot.querySelector('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders without href without throwing', () => {
    const el = create();
    expect(link(el).hasAttribute('href')).toBe(false);
  });
});
