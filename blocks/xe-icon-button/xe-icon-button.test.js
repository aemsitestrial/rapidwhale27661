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
    it('has the agreed fields in the right groups, in order, matching DEFAULTS', () => {
      const names = fields.map((f) => f.name);
      expect(names).toEqual([
        'link_cta', 'link_ctaText', 'ic_icon',
        'classes_size', 'classes_treatment', 'classes_disabled', 'classes_target',
      ]);
      expect(Object.keys(DEFAULTS)).toEqual([
        'ariaLabel', 'icon', 'size', 'treatment', 'disabled', 'href', 'target',
      ]);
      expect(Object.keys(template)).toEqual([
        'name', 'model',
        'link_cta', 'link_ctaText', 'ic_icon',
        'classes_size', 'classes_treatment', 'classes_disabled',
      ]);
    });

    it('has no field name Universal Editor would silently collapse', () => {
      // link_ctaText is the intentional paired-field name for link_cta — Text suffix is by design
      const notPaired = fields.filter((f) => !f.name.startsWith('link_') || !f.name.endsWith('Text'));
      notPaired.forEach((f) => expect(f.name, f.name).not.toMatch(/(Title|Type|MimeType|Alt|Text)$/));
    });

    it('requires the accessible label (Ignite: aria-label is required)', () => {
      expect(field('link_ctaText').component).toBe('text');
      expect(field('link_ctaText').required).toBe(true);
    });

    it('offers every registered icon and the documented sizes / treatments as dropdowns', () => {
      expect(field('ic_icon').component).toBe('select');
      expect([...values('ic_icon')].sort()).toEqual([...registeredIconNames()].sort());
      expect(values('classes_size')).toEqual(['xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']);
      expect(field('classes_size').value).toBe('md');
      expect(values('classes_treatment')).toEqual(['default', 'filled', 'outlined']);
      expect(field('classes_treatment').value).toBe('default');
    });

    it('link uses link_ prefix; disabled and Open In use classes_ prefix', () => {
      expect(field('link_cta').component).toBe('aem-content');
      expect(field('link_cta').required).toBeFalsy();
      expect(field('classes_disabled').component).toBe('toggle');
      expect(values('classes_target')).toEqual(['', '_blank', '_self', '_parent', '_top']);
    });
  });

  describe('decorate() — standalone', () => {
    it('renders the palette template as a labelled <button>', () => {
      const block = render({
        ariaLabel: template.link_ctaText,
        icon: template.ic_icon,
        size: template.classes_size,
        treatment: template.classes_treatment,
      });
      expect(block.children).toHaveLength(1);
      const button = block.querySelector(':scope > xe-icon-button');
      expect(button.getAttribute('aria-label')).toBe('Action');
      expect(button.getAttribute('treatment')).toBe('default');
      expect(button.getAttribute('size')).toBe('md');
      expect(button.querySelector('xe-icon').getAttribute('icon')).toBe('faGear');
      expect(control(button).localName).toBe('button');
      expect(control(button).getAttribute('aria-label')).toBe('Action');
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

    it('reads the block UE delivers: link+label from <a>, icon from <p>, options from classList', () => {
      const block = buildBlock({
        ariaLabel: 'View profile', icon: 'faUser', size: 'lg', treatment: 'outlined', href: '/profile', target: '_blank',
      });
      expect(block.children).toHaveLength(1);
      // Two <p> elements: one wrapping the <a>, one for ic_icon
      expect(block.querySelectorAll(':scope > div > div > p')).toHaveLength(2);
      const button = decorate(block);
      expect(button.getAttribute('aria-label')).toBe(`View profile ${NEW_WINDOW_NOTE}`);
      expect(button.querySelector('xe-icon').getAttribute('icon')).toBe('faUser');
      expect(button.getAttribute('size')).toBe('lg');
      expect(button.getAttribute('treatment')).toBe('outlined');
      expect(button.getAttribute('href')).toBe('/profile');
      expect(button.getAttribute('target')).toBe('_blank');
    });

    it('reads icon from any <p> by FA name; size and treatment always from classList', () => {
      const block = buildBlock({ ariaLabel: 'Edit', icon: 'faPen', size: 'sm' });
      const cell = block.firstElementChild.firstElementChild;
      // Swap <p> order — icon is still found by FA name pattern, not position
      cell.prepend(cell.lastElementChild);
      const button = decorate(block);
      expect(button.getAttribute('size')).toBe('sm');
      expect(button.getAttribute('aria-label')).toBe('Edit');
      expect(button.getAttribute('treatment')).toBe('default');
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
