import { describe, it, expect } from 'vitest';
import getBlockProps, { defined } from './primitive.js';

// Builds a block the way Universal Editor delivers it: one row per saved field, one cell each
function block(...cells) {
  const el = document.createElement('div');
  cells.forEach((content) => {
    const row = document.createElement('div');
    const cell = document.createElement('div');
    cell.innerHTML = content;
    row.append(cell);
    el.append(row);
  });
  return el;
}

const DEFAULTS = {
  label: '', icon: '', size: 'md', treatment: 'default', href: '',
};
const OPTIONS = { size: ['sm', 'md', 'lg'], treatment: ['default', 'filled'] };

describe('getBlockProps()', () => {
  it('reads every field from a complete block in model order', () => {
    const props = getBlockProps(block('Settings', 'faGear', 'lg', 'filled', '<a href="/s">/s</a>'), DEFAULTS, OPTIONS);
    expect(props).toEqual({
      label: 'Settings', icon: 'faGear', size: 'lg', treatment: 'filled', href: '/s',
    });
  });

  it('matches option fields by content, so row order does not matter', () => {
    const props = getBlockProps(block('filled', '/s', 'lg', 'faGear', 'Settings'), DEFAULTS, OPTIONS);
    expect(props).toEqual({
      label: 'Settings', icon: 'faGear', size: 'lg', treatment: 'filled', href: '/s',
    });
  });

  it('does not shift fields when Universal Editor skips an empty one', () => {
    // size was left empty and skipped — treatment must not move into size
    const props = getBlockProps(block('Settings', 'faGear', 'filled'), DEFAULTS, OPTIONS);
    expect(props).toEqual({ label: 'Settings', icon: 'faGear', treatment: 'filled' });
  });

  it('ignores values that match no field (old or unknown options)', () => {
    const props = getBlockProps(block('faGear', 'huge', 'md'), { icon: '', size: 'md' }, { size: ['md'] });
    expect(props).toEqual({ icon: 'faGear', size: 'md' });
  });

  it('only returns the fields it found', () => {
    expect(getBlockProps(block('Settings'), DEFAULTS, OPTIONS)).toEqual({ label: 'Settings' });
    expect(getBlockProps(block(), DEFAULTS, OPTIONS)).toEqual({});
  });

  it('reads plain-text URLs as links and prefers the <a> href', () => {
    expect(getBlockProps(block('https://x.com'), { href: '' })).toEqual({ href: 'https://x.com' });
    expect(getBlockProps(block('<a href="/a">Go</a>'), { link: '' })).toEqual({ link: '/a' });
  });

  it('works on a single composition cell', () => {
    const cell = document.createElement('div');
    cell.textContent = 'faLeaf';
    expect(getBlockProps(cell, { icon: '', size: 'md' }, { size: ['md'] })).toEqual({ icon: 'faLeaf' });
  });

  it('without options, non-link / non-icon fields are positional (team default behavior)', () => {
    expect(getBlockProps(block('A', 'B'), { first: '', second: '' })).toEqual({ first: 'A', second: 'B' });
  });
});

describe('defined()', () => {
  it('drops undefined, null and empty values only', () => {
    expect(defined({
      a: undefined, b: null, c: '', d: 0, e: false, f: 'x',
    })).toEqual({ d: 0, e: false, f: 'x' });
  });
});
