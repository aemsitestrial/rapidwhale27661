import {
  describe, it, expect, beforeEach,
} from 'vitest';
import decorate, {
  buildPrimitive, decoratePrimitive, DEFAULTS, ICON_COLORS,
} from './xe-icon.js';
import { buildBlock } from './xe-icon.stories.js';
import { registeredIconNames } from '../../scripts/components/xe-icon.js';
/* eslint-disable import/extensions -- the block models are JSON */
import model from './_xe-icon.json';
import bannerModel from '../xe-banner/_xe-banner.json';
import cardsModel from '../xe-feature-cards/_xe-feature-cards.json';
/* eslint-enable import/extensions */

// Ignite Storybook (Design System Primitives › Media › Icon): the two props, plus the story's
// "color" control (CSS color, applied with style) — offered to authors as brand tokens only
const IGNITE_PROPS = {
  icon: { default: undefined },
  size: { default: 'md', values: ['xs', 'sm', 'md', 'lg', 'xl'] },
  color: { default: 'inherit' },
};
const BRAND_COLORS = {
  'brand-primary': '--xe-color-brand-primary',
  'brand-accent': '--xe-color-brand-accent',
};

const [{ fields }] = model.models;
const field = (name) => fields.find((f) => f.name === name);

function render(options) {
  const block = buildBlock(options);
  document.body.append(block);
  decorate(block);
  return block;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('xe-icon block', () => {
  describe('model matches the Ignite spec', () => {
    it('has exactly the Ignite props + color as fields — no label', () => {
      expect(fields.map((f) => f.name)).toEqual(Object.keys(IGNITE_PROPS));
      expect(Object.keys(DEFAULTS)).toEqual(Object.keys(IGNITE_PROPS));
    });

    it('offers every registered icon as a named dropdown option — no free text', () => {
      expect(field('icon').component).toBe('select');
      const values = field('icon').options.map((o) => o.value);
      expect([...values].sort()).toEqual([...registeredIconNames()].sort());
      field('icon').options.forEach((o) => expect(o.name, o.value).not.toMatch(/^fa[A-Z]/));
    });

    it('offers exactly the five sizes, default md', () => {
      expect(field('size').component).toBe('select');
      expect(field('size').options.map((o) => o.value)).toEqual(IGNITE_PROPS.size.values);
      expect(field('size').value).toBe(IGNITE_PROPS.size.default);
      expect(DEFAULTS.size).toBe(IGNITE_PROPS.size.default);
    });

    it('only offers registered icons in the compositions too', () => {
      const registered = registeredIconNames();
      const options = (m, name) => m.models.flatMap((x) => x.fields)
        .filter((f) => f.name === name).flatMap((f) => f.options.map((o) => o.value));
      options(bannerModel, 'icon').filter((v) => v !== 'none')
        .forEach((v) => expect(registered, v).toContain(v));
      options(cardsModel, 'icon').map((v) => v.replace(/^icon-/, '')).filter((v) => v !== 'none')
        .forEach((v) => expect(registered, v).toContain(v));
    });

    it('offers color as a dropdown of brand tokens only, default inherit — no free picker', () => {
      expect(field('color').component).toBe('select');
      expect(field('color').value).toBe('inherit');
      const values = field('color').options.map((o) => o.value);
      expect(values).toEqual(['inherit', ...Object.keys(BRAND_COLORS)]);
      expect(Object.keys(ICON_COLORS)).toEqual(values);
      Object.entries(BRAND_COLORS).forEach(([value, token]) => {
        expect(ICON_COLORS[value]).toMatch(new RegExp(`^var\\(${token}, #[0-9a-f]{6}\\)$`));
      });
    });
  });

  describe('decorate() — standalone', () => {
    it('replaces the authored rows with one <xe-icon>', () => {
      const block = render({ icon: 'faBolt', size: 'lg' });
      expect(block.children).toHaveLength(1);
      const icon = block.querySelector(':scope > xe-icon');
      expect(icon.getAttribute('icon')).toBe('faBolt');
      expect(icon.getAttribute('size')).toBe('lg');
      expect(icon.shadowRoot.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
    });

    it('renders the palette template as authored', () => {
      const { template } = model.definitions[0].plugins.xwalk.page;
      const icon = render({ icon: template.icon, size: template.size }).querySelector('xe-icon');
      expect(icon.getAttribute('icon')).toBe('faArrowRight');
      expect(icon.getAttribute('size')).toBe('md');
    });

    it('falls back to md when the size is skipped or unknown', () => {
      expect(render({ icon: 'faStar' }).querySelector('xe-icon').getAttribute('size')).toBe('md');
      expect(render({ icon: 'faStar', size: 'huge' }).querySelector('xe-icon').getAttribute('size'))
        .toBe('md');
    });

    it('reads values by content, so a skipped icon row does not shift the size', () => {
      const block = document.createElement('div');
      block.className = 'xe-icon block';
      block.innerHTML = '<div><div>xl</div></div><div><div>faHeart</div></div>';
      decorate(block);
      expect(block.querySelector('xe-icon').getAttribute('icon')).toBe('faHeart');
      expect(block.querySelector('xe-icon').getAttribute('size')).toBe('xl');
    });

    it('applies the chosen brand color with style, like the Ignite story', () => {
      const icon = render({ icon: 'faBolt', color: 'brand-accent' }).querySelector('xe-icon');
      expect(icon.style.color).toContain('--xe-color-brand-accent');
      expect(icon.hasAttribute('color')).toBe(false);
    });

    it('sets no color for inherit, a skipped field or an unknown value', () => {
      ['inherit', '', 'purple'].forEach((color) => {
        const icon = render({ icon: 'faBolt', color }).querySelector('xe-icon');
        expect(icon.style.color, color).toBe('');
      });
      expect(buildPrimitive({ icon: 'faBolt', color: 'toString' }).style.color).toBe('');
    });

    it('renders nothing for an unknown or missing icon', () => {
      expect(render({ icon: 'faUnknown' }).children).toHaveLength(0);
      expect(render({}).children).toHaveLength(0);
    });
  });

  describe('primitive API for compositions', () => {
    it('buildPrimitive() builds from plain settings, applying DEFAULTS', () => {
      const icon = buildPrimitive({ icon: 'faPlus' });
      expect(icon.tagName).toBe('XE-ICON');
      expect(icon.getAttribute('size')).toBe('md');
      expect(buildPrimitive({ icon: 'none' })).toBeNull();
    });

    it('props override authored values; authored values override DEFAULTS', () => {
      const block = buildBlock({ icon: 'faBolt', size: 'sm' });
      expect(decorate(block, { size: 'xl' }).getAttribute('size')).toBe('xl');
      expect(decorate(buildBlock({ icon: 'faBolt', size: 'sm' }), { size: undefined })
        .getAttribute('size')).toBe('sm');
    });

    it('decorates a composition cell in place and returns the icon', () => {
      const row = document.createElement('div');
      const cell = document.createElement('div');
      cell.textContent = 'faLeaf';
      row.append(cell);
      const icon = decoratePrimitive(cell, { size: 'lg' });
      expect(cell.firstElementChild).toBe(icon);
      expect(row.contains(cell)).toBe(true);
      expect(icon.getAttribute('icon')).toBe('faLeaf');
    });

    it('lets a composition pass the icon as a prop (prefixed select values)', () => {
      const cell = document.createElement('div');
      cell.textContent = 'icon-faWrench';
      expect(decoratePrimitive(cell, { icon: 'faWrench', size: 'xl' }).getAttribute('icon'))
        .toBe('faWrench');
    });
  });
});
