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
    it('has the agreed fields, in order, matching DEFAULTS', () => {
      const names = ['ariaLabel', 'icon', 'size', 'treatment', 'href', 'target'];
      expect(fields.map((f) => f.name)).toEqual(names);
      expect(Object.keys(DEFAULTS)).toEqual(names);
    });

    it('requires the accessible label (Ignite: aria-label is required)', () => {
      expect(field('ariaLabel').component).toBe('text');
      expect(field('ariaLabel').required).toBe(true);
    });

    it('offers every registered icon and the documented sizes / treatments as dropdowns', () => {
      expect(field('icon').component).toBe('select');
      expect([...values('icon')].sort()).toEqual([...registeredIconNames()].sort());
      expect(values('size')).toEqual(['xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']);
      expect(field('size').value).toBe('md');
      expect(values('treatment')).toEqual(['default', 'filled', 'outlined']);
      expect(field('treatment').value).toBe('default');
    });

    it('shows "Open In" (same / new tab) only when a link is set', () => {
      expect(field('href').component).toBe('text');
      expect(field('href').required).toBeFalsy();
      expect(values('target')).toEqual(['_self', '_blank']);
      expect(field('target').condition).toEqual({ '!!': [{ var: 'href' }] });
    });
  });

  describe('decorate() — standalone', () => {
    it('renders the palette template as a labelled <button>', () => {
      const { template } = model.definitions[0].plugins.xwalk.page;
      const block = render(template);
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
