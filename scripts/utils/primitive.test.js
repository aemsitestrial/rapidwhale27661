import { describe, it, expect } from 'vitest';
import { getBlockProps, defined } from './primitive.js';

// A block as Universal Editor delivers prefixed fields: one row, one cell, an element per field
function groupedBlock(...html) {
  const block = document.createElement('div');
  block.innerHTML = `<div><div>${html.map((h) => `<p>${h}</p>`).join('')}</div></div>`;
  return block;
}

// A block in one-row-per-field markup
function rowsBlock(...values) {
  const block = document.createElement('div');
  block.innerHTML = values.map((v) => `<div><div>${v}</div></div>`).join('');
  return block;
}

const ICON = { defaults: { icon: '', size: 'md' }, options: { size: ['xs', 'sm', 'md', 'lg', 'xl'] } };
const BUTTON = {
  defaults: {
    ariaLabel: '', icon: '', size: 'md', treatment: 'default', href: '', target: '_self',
  },
  options: {
    size: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    treatment: ['default', 'filled', 'outlined'],
    target: ['_self', '_blank'],
  },
};
const read = (el, { defaults, options }, overrides) => (
  getBlockProps(el, defaults, overrides, options));

describe('getBlockProps()', () => {
  it('returns the defaults when nothing is authored', () => {
    expect(read(document.createElement('div'), ICON)).toEqual({ icon: '', size: 'md' });
  });

  it('reads a grouped cell — one value per <p>', () => {
    expect(read(groupedBlock('faHeart', 'xl'), ICON)).toEqual({ icon: 'faHeart', size: 'xl' });
  });

  it('reads one-row-per-field markup the same way', () => {
    expect(read(rowsBlock('faHeart', 'xl'), ICON)).toEqual({ icon: 'faHeart', size: 'xl' });
  });

  it('matches by content, never by position (reordered values)', () => {
    expect(read(groupedBlock('xl', 'faHeart'), ICON)).toEqual({ icon: 'faHeart', size: 'xl' });
    expect(read(rowsBlock('lg', 'faStar'), ICON)).toEqual({ icon: 'faStar', size: 'lg' });
  });

  it('keeps the default when a field was skipped', () => {
    expect(read(groupedBlock('faHeart'), ICON)).toEqual({ icon: 'faHeart', size: 'md' });
  });

  it('ignores values that match nothing (e.g. the removed color option)', () => {
    expect(read(rowsBlock('faHeart', 'xl', 'brand-primary'), ICON)).toEqual({ icon: 'faHeart', size: 'xl' });
    expect(read(groupedBlock('huge', 'faBolt'), ICON)).toEqual({ icon: 'faBolt', size: 'md' });
  });

  it('reads every XE Icon Button field from a grouped cell, link included', () => {
    const block = groupedBlock('View profile', 'faUser', 'lg', 'outlined', '<a href="/profile">/profile</a>', '_blank');
    expect(read(block, BUTTON)).toEqual({
      ariaLabel: 'View profile', icon: 'faUser', size: 'lg', treatment: 'outlined', href: '/profile', target: '_blank',
    });
  });

  it('tells dropdown fields apart by their allowed values', () => {
    const props = read(groupedBlock('_blank', 'filled', 'Edit', '2xl', 'faPen'), BUTTON);
    expect(props).toMatchObject({
      ariaLabel: 'Edit', icon: 'faPen', size: '2xl', treatment: 'filled', target: '_blank',
    });
  });

  it('reads a plain-text URL as the link and the leftover text as the label', () => {
    const props = read(rowsBlock('Settings', 'https://xcelenergy.com', 'faGear'), BUTTON);
    expect(props).toMatchObject({ ariaLabel: 'Settings', href: 'https://xcelenergy.com', icon: 'faGear' });
  });

  it('works on a single composition cell', () => {
    const cell = document.createElement('div');
    cell.textContent = 'faLeaf';
    expect(read(cell, ICON)).toEqual({ icon: 'faLeaf', size: 'md' });
  });

  it('lets overrides win over authored values; empty overrides change nothing', () => {
    const block = groupedBlock('faHeart', 'sm');
    expect(read(block, ICON, { size: 'xl' })).toEqual({ icon: 'faHeart', size: 'xl' });
    expect(read(block, ICON, { size: undefined, icon: '' })).toEqual({ icon: 'faHeart', size: 'sm' });
  });
});

describe('defined()', () => {
  it('drops undefined, null and empty values only', () => {
    expect(defined({
      a: undefined, b: null, c: '', d: 0, e: false, f: 'x',
    })).toEqual({ d: 0, e: false, f: 'x' });
  });
});
