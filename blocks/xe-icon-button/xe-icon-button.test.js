import {
  describe, it, expect, beforeEach,
} from 'vitest';
import decorate, {
  buildPrimitive, decoratePrimitive, DEFAULTS, NEW_WINDOW_NOTE,
} from './xe-icon-button.js';
import { buildBlock } from './xe-icon-button.stories.js';
import { registeredIconNames } from '../../scripts/components/xe-icon.js';
// eslint-disable-next-line import/extensions -- the block model is JSON
import model from './_xe-icon-button.json';

const [{ fields }] = model.models;
const field = (name) => fields.find((f) => f.name === name);
const values = (name) => field(name).options.map((o) => o.value);
const { template } = model.definitions[0].plugins.xwalk.page;
// Props (DEFAULTS keys) → model field names in the "ib" element group
const FIELD = (key) => `ib_${key}`;
const fromTemplate = () => Object.fromEntries(Object.keys(DEFAULTS)
  .filter((key) => FIELD(key) in template).map((key) => [key, template[FIELD(key)]]));

function render(options) {
  const block = buildBlock(options);
  document.body.append(block);
  decorate(block);
  return block;
}

const control = (button) => button.shadowRoot.querySelector('.control');

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('xe-icon-button block', () => {
  describe('model', () => {
    it('has the agreed fields in the "ib" group, in order, matching DEFAULTS', () => {
      const props = ['ariaLabel', 'icon', 'size', 'treatment', 'href', 'target'];
      expect(fields.map((f) => f.name)).toEqual(props.map(FIELD));
      expect(Object.keys(DEFAULTS)).toEqual(props);
      expect(Object.keys(template)).toEqual(['name', 'model', ...['ariaLabel', 'icon', 'size', 'treatment', 'target'].map(FIELD)]);
    });

    it('has no field whose name Universal Editor would collapse into another (Title / Type / Text / Alt)', () => {
      fields.forEach((f) => expect(f.name, f.name).not.toMatch(/(Title|Type|MimeType|Alt|Text)$/));
    });

    it('requires the accessible label (Ignite: aria-label is required)', () => {
      expect(field('ib_ariaLabel').component).toBe('text');
      expect(field('ib_ariaLabel').required).toBe(true);
    });

    it('offers every registered icon and the documented sizes / treatments as dropdowns', () => {
      expect(field('ib_icon').component).toBe('select');
      expect([...values('ib_icon')].sort()).toEqual([...registeredIconNames()].sort());
      expect(values('ib_size')).toEqual(['xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']);
      expect(field('ib_size').value).toBe('md');
      expect(values('ib_treatment')).toEqual(['default', 'filled', 'outlined']);
      expect(field('ib_treatment').value).toBe('default');
    });

    it('shows "Open In" (same / new tab) only when a link is set', () => {
      expect(field('ib_href').component).toBe('text');
      expect(field('ib_href').required).toBeFalsy();
      expect(values('ib_target')).toEqual(['_self', '_blank']);
      expect(field('ib_target').condition).toEqual({ '!!': [{ var: 'ib_href' }] });
    });
  });

  describe('decorate() — standalone', () => {
    it('renders the palette template as a labelled <button>', () => {
      const block = render(fromTemplate());
      expect(block.children).toHaveLength(1);
      const button = block.querySelector(':scope > xe-icon-button');
      expect(button.getAttribute('aria-label')).toBe('Settings');
      expect(button.getAttribute('treatment')).toBe('default');
      expect(button.getAttribute('size')).toBe('md');
      expect(button.querySelector('xe-icon').getAttribute('icon')).toBe('faGear');
      expect(control(button).localName).toBe('button');
      expect(control(button).getAttribute('aria-label')).toBe('Settings');
    });

    it('renders a link with the chosen treatment and size', () => {
      const button = render({
        ariaLabel: 'View profile', icon: 'faUser', treatment: 'filled', size: 'lg', href: '/profile',
      }).querySelector('xe-icon-button');
      expect(button.getAttribute('href')).toBe('/profile');
      expect(button.hasAttribute('target')).toBe(false);
      expect(button.getAttribute('treatment')).toBe('filled');
      expect(control(button).localName).toBe('a');
    });

    it('adds the new-window context to the label for new-tab links, once', () => {
      const added = render({
        ariaLabel: 'Xcel Energy on Facebook', icon: 'faSquareFacebook', href: 'https://facebook.com/xcelenergy', target: '_blank',
      }).querySelector('xe-icon-button');
      expect(added.getAttribute('target')).toBe('_blank');
      expect(added.getAttribute('aria-label')).toBe(`Xcel Energy on Facebook ${NEW_WINDOW_NOTE}`);

      const kept = buildPrimitive({
        ariaLabel: 'Xcel Energy on Facebook (opens in a new window)', icon: 'faSquareFacebook', href: 'https://facebook.com', target: '_blank',
      });
      expect(kept.getAttribute('aria-label')).toBe('Xcel Energy on Facebook (opens in a new window)');
    });

    it('ignores "Open In" when there is no link', () => {
      const button = render({ ariaLabel: 'Settings', icon: 'faGear', target: '_blank' })
        .querySelector('xe-icon-button');
      expect(button.hasAttribute('target')).toBe(false);
      expect(button.getAttribute('aria-label')).toBe('Settings');
    });

    it('renders nothing without the required label or a registered icon', () => {
      expect(render({ icon: 'faGear' }).children).toHaveLength(0);
      expect(render({ ariaLabel: 'Settings', icon: 'faUnknown' }).children).toHaveLength(0);
    });

    it('reads the grouped cell Universal Editor delivers (one cell, an element per field)', () => {
      const block = buildBlock({
        ariaLabel: 'View profile', icon: 'faUser', size: 'lg', treatment: 'outlined', href: '/profile', target: '_blank',
      });
      expect(block.children).toHaveLength(1);
      expect(block.querySelectorAll(':scope > div > div > p')).toHaveLength(6);
      const button = decorate(block);
      expect(button.getAttribute('aria-label')).toBe(`View profile ${NEW_WINDOW_NOTE}`);
      expect(button.querySelector('xe-icon').getAttribute('icon')).toBe('faUser');
      expect(button.getAttribute('size')).toBe('lg');
      expect(button.getAttribute('treatment')).toBe('outlined');
      expect(button.getAttribute('href')).toBe('/profile');
      expect(button.getAttribute('target')).toBe('_blank');
    });

    it('reads a grouped cell by content, so reordered or skipped values do not shift', () => {
      const block = buildBlock({ ariaLabel: 'Edit', icon: 'faPen', size: 'sm' });
      const cell = block.firstElementChild.firstElementChild;
      cell.prepend(cell.lastElementChild); // size first
      const button = decorate(block);
      expect(button.getAttribute('size')).toBe('sm');
      expect(button.getAttribute('aria-label')).toBe('Edit');
      expect(button.getAttribute('treatment')).toBe('default');
    });

    it('reads values by content, so skipped or reordered rows do not shift the others', () => {
      const block = document.createElement('div');
      block.className = 'xe-icon-button block';
      block.innerHTML = '<div><div>outlined</div></div><div><div>faPen</div></div>'
        + '<div><div>Edit</div></div><div><div>2xl</div></div><div><div><a href="/edit">/edit</a></div></div>';
      const button = decorate(block);
      expect(button.getAttribute('treatment')).toBe('outlined');
      expect(button.getAttribute('size')).toBe('2xl');
      expect(button.getAttribute('aria-label')).toBe('Edit');
      expect(button.getAttribute('href')).toBe('/edit');
    });

    it('drops unsafe links', () => {
      // eslint-disable-next-line no-script-url
      const button = buildPrimitive({ ariaLabel: 'Bad', icon: 'faGear', href: 'javascript:alert(1)' });
      expect(button.hasAttribute('href')).toBe(false);
    });
  });

  describe('primitive API for compositions', () => {
    it('props override authored values; authored values override DEFAULTS', () => {
      const block = buildBlock({ ariaLabel: 'Settings', icon: 'faGear', size: 'sm' });
      const button = decoratePrimitive(block, { size: 'xl', treatment: undefined });
      expect(button.getAttribute('size')).toBe('xl');
      expect(button.getAttribute('treatment')).toBe('default');
    });

    it('builds from plain settings (e.g. a footer social link)', () => {
      const button = buildPrimitive({
        ariaLabel: 'Xcel Energy on YouTube', icon: 'faYoutube', size: 'xl', href: 'https://youtube.com/xcelenergy', target: '_blank',
      });
      expect(button.getAttribute('aria-label')).toContain(NEW_WINDOW_NOTE);
      expect(button.querySelector('xe-icon').getAttribute('icon')).toBe('faYoutube');
    });
  });
});
