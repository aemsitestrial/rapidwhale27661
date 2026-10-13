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
        'link_cta', 'link_label', 'classes_icon',
        'classes_size', 'classes_treatment', 'classes_disabled', 'classes_target',
      ]);
      expect(Object.keys(DEFAULTS)).toEqual([
        'ariaLabel', 'icon', 'size', 'treatment', 'disabled', 'href', 'target',
      ]);
      expect(Object.keys(template)).toEqual([
        'name', 'model',
        'link_cta', 'link_label', 'classes_icon',
        'classes_size', 'classes_treatment', 'classes_disabled',
      ]);
    });

    it('has no field name Universal Editor would collapse into another (Title / Type / Text / Alt)', () => {
      // A *Text field is the text OF a link — Universal Editor drops it when the link is empty,
      // which is how link_ctaText made unlinked icon buttons disappear (build-log I-55)
      fields.forEach((f) => expect(f.name, f.name).not.toMatch(/(Title|Type|MimeType|Alt|Text)$/));
    });

    it('requires the accessible label (Ignite: aria-label is required)', () => {
      expect(field('link_label').component).toBe('text');
      expect(field('link_label').required).toBe(true);
    });

    it('offers every registered icon and the documented sizes / treatments as dropdowns', () => {
      expect(field('classes_icon').component).toBe('select');
      expect([...values('classes_icon')].sort()).toEqual([...registeredIconNames()].sort());
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
        ariaLabel: template.link_label,
        icon: template.classes_icon,
        size: template.classes_size,
        treatment: template.classes_treatment,
      });
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

    it('renders nothing without the required label', () => {
      expect(render({ icon: 'faGear' }).children).toHaveLength(0);
    });

    it('renders WITHOUT a link — the label is its own field (the I-55 bug)', () => {
      // What Universal Editor delivers for: Link empty, Label "Action", Close icon, Small
      const block = document.createElement('div');
      block.className = 'xe-icon-button block faxmark sm default';
      block.innerHTML = '<div><div><p>Action</p></div></div>';
      document.body.append(block);
      const button = decorate(block);
      expect(button).not.toBeNull();
      expect(button.getAttribute('aria-label')).toBe('Action');
      expect(button.querySelector('xe-icon').getAttribute('icon')).toBe('faXmark');
      expect(button.getAttribute('size')).toBe('sm');
      expect(button.hasAttribute('href')).toBe(false);
      expect(control(button).localName).toBe('button');
    });

    it('reads a link and its label as two values of the link group', () => {
      const block = document.createElement('div');
      block.className = 'xe-icon-button block fauser md filled';
      block.innerHTML = '<div><div><p><a href="/profile">/profile</a></p><p>View profile</p></div></div>';
      const button = decorate(block);
      expect(button.getAttribute('href')).toBe('/profile');
      expect(button.getAttribute('aria-label')).toBe('View profile');
      expect(button.getAttribute('treatment')).toBe('filled');
    });

    it('still reads blocks saved with the earlier link_ctaText field (label = the link text)', () => {
      const block = document.createElement('div');
      block.className = 'xe-icon-button block fagear md default';
      block.innerHTML = '<div><div><p><a href="/settings">Open settings</a></p></div></div>';
      const button = decorate(block);
      expect(button.getAttribute('aria-label')).toBe('Open settings');
      expect(button.getAttribute('href')).toBe('/settings');
    });

    it('still reads blocks published with the ib_ fields (real /ignite markup, 2026-10-13)', () => {
      const block = document.createElement('div');
      block.className = 'xe-icon-button block';
      block.innerHTML = '<div><div><p>Settings</p><p>faGear</p><p>md</p><p>default</p><p>_self</p></div></div>';
      const button = decorate(block);
      expect(button).not.toBeNull();
      expect(button.getAttribute('aria-label')).toBe('Settings');
      expect(button.querySelector('xe-icon').getAttribute('icon')).toBe('faGear');
      expect(button.getAttribute('size')).toBe('md');
      expect(button.getAttribute('treatment')).toBe('default');
    });

    it('reads the block UE delivers: link + label in the link cell, icon + options from classList', () => {
      const block = buildBlock({
        ariaLabel: 'View profile', icon: 'faUser', size: 'lg', treatment: 'outlined', href: '/profile', target: '_blank',
      });
      expect(block.children).toHaveLength(1);
      // The link and the label are two <p>s in one cell; icon / options are CSS classes
      expect(block.querySelectorAll(':scope > div > div > p')).toHaveLength(2);
      const button = decorate(block);
      expect(button.getAttribute('aria-label')).toBe(`View profile ${NEW_WINDOW_NOTE}`);
      expect(button.querySelector('xe-icon').getAttribute('icon')).toBe('faUser');
      expect(button.getAttribute('size')).toBe('lg');
      expect(button.getAttribute('treatment')).toBe('outlined');
      expect(button.getAttribute('href')).toBe('/profile');
      expect(button.getAttribute('target')).toBe('_blank');
    });

    it('reads icon, size and treatment from classList — order irrelevant', () => {
      const block = buildBlock({ ariaLabel: 'Edit', icon: 'faPen', size: 'sm' });
      // All options come from classList; no DOM order dependency
      const button = decorate(block);
      expect(button.getAttribute('size')).toBe('sm');
      expect(button.getAttribute('aria-label')).toBe('Edit');
      expect(button.getAttribute('treatment')).toBe('default');
      expect(button.querySelector('xe-icon').getAttribute('icon')).toBe('faPen');
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
