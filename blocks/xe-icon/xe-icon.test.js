import {
  describe, it, expect, beforeEach,
} from 'vitest';
import decorate, { buildPrimitive, decoratePrimitive, DEFAULTS } from './xe-icon.js';
import { buildBlock } from './xe-icon.stories.js';
import { registeredIconNames } from '../../scripts/components/xe-icon.js';
/* eslint-disable import/extensions -- the block models are JSON */
import model from './_xe-icon.json';
import bannerModel from '../xe-banner/_xe-banner.json';
import cardsModel from '../xe-feature-cards/_xe-feature-cards.json';
/* eslint-enable import/extensions */

// Ignite Storybook (Design System Primitives › Media › Icon): the only two props
const IGNITE_PROPS = {
  icon: { default: undefined },
  size: { default: 'md', values: ['xs', 'sm', 'md', 'lg', 'xl'] },
};
// Model field names: the two props in the "ic" element group (one grouped cell)
const MODEL_FIELDS = { icon: 'ic_icon', size: 'ic_size' };

// Builds a block in the old, pre-rename format: one row per field (icon, size, color)
function legacyBlock(...values) {
  const block = document.createElement('div');
  block.className = 'xe-icon block';
  block.innerHTML = values.map((v) => `<div><div>${v}</div></div>`).join('');
  return block;
}

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
    it('has exactly the Ignite props as fields, in the "ic" group — no label, no color', () => {
      expect(fields.map((f) => f.name))
        .toEqual(Object.keys(IGNITE_PROPS).map((k) => MODEL_FIELDS[k]));
      expect(Object.keys(DEFAULTS)).toEqual(Object.keys(IGNITE_PROPS));
      const { template } = model.definitions[0].plugins.xwalk.page;
      expect(Object.keys(template)).toEqual(['name', 'model', 'ic_icon', 'ic_size']);
    });

    it('offers every registered icon as a named dropdown option — no free text', () => {
      expect(field('ic_icon').component).toBe('select');
      const values = field('ic_icon').options.map((o) => o.value);
      expect([...values].sort()).toEqual([...registeredIconNames()].sort());
      field('ic_icon').options.forEach((o) => expect(o.name, o.value).not.toMatch(/^fa[A-Z]/));
    });

    it('offers exactly the five sizes, default md', () => {
      expect(field('ic_size').component).toBe('select');
      expect(field('ic_size').options.map((o) => o.value)).toEqual(IGNITE_PROPS.size.values);
      expect(field('ic_size').value).toBe(IGNITE_PROPS.size.default);
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
      const icon = render({ icon: template.ic_icon, size: template.ic_size }).querySelector('xe-icon');
      expect(icon.getAttribute('icon')).toBe('faArrowRight');
      expect(icon.getAttribute('size')).toBe('md');
    });

    it('falls back to md when the size is skipped or unknown', () => {
      expect(render({ icon: 'faStar' }).querySelector('xe-icon').getAttribute('size')).toBe('md');
      expect(render({ icon: 'faStar', size: 'huge' }).querySelector('xe-icon').getAttribute('size'))
        .toBe('md');
    });

    it('reads the grouped cell (a <p> per field), as Universal Editor delivers ic_icon / ic_size', () => {
      const block = buildBlock({ icon: 'faHeart', size: 'xl' });
      expect(block.children).toHaveLength(1);
      expect(block.querySelectorAll('p')).toHaveLength(2);
      const icon = decorate(block);
      expect(icon.getAttribute('icon')).toBe('faHeart');
      expect(icon.getAttribute('size')).toBe('xl');
    });

    it('reads values by content, so reordered or skipped values do not shift', () => {
      const block = buildBlock({ icon: 'faHeart', size: 'xl' });
      const cell = block.firstElementChild.firstElementChild;
      cell.prepend(cell.lastElementChild); // size first
      expect(decorate(block).getAttribute('size')).toBe('xl');
      expect(decorate(legacyBlock('xl', 'faHeart')).getAttribute('icon')).toBe('faHeart');
    });

    it('still reads blocks published before the rename, ignoring the removed color', () => {
      // Real published markup (2026-10-09): one row each for icon, size, color
      ['brand-primary', 'brand-accent', 'inherit'].forEach((oldColor) => {
        const icon = decorate(legacyBlock('faHeart', 'xl', oldColor));
        expect(icon.getAttribute('icon'), oldColor).toBe('faHeart');
        expect(icon.getAttribute('size'), oldColor).toBe('xl');
        expect(icon.style.color, oldColor).toBe('');
      });
      expect(buildPrimitive({ icon: 'faBolt', color: 'brand-primary' }).style.color).toBe('');
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
