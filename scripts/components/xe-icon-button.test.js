import {
  describe, it, expect, beforeEach,
} from 'vitest';
import XeIconButton, { ICON_BUTTON_SIZES, ICON_BUTTON_TREATMENTS } from './xe-icon-button.js';
import '../icons.js'; // site-level icon registration, as on a page

// The Icon Button docs page (Design System Primitives › Action › Icon Button), recorded as data
const DOCS_SPEC = {
  tag: 'xe-icon-button',
  props: {
    treatment: { default: 'default', values: ['default', 'filled', 'outlined'] },
    size: { default: 'md', values: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    href: { default: '' },
    target: { default: '' },
    disabled: { default: false },
  },
  attributes: ['treatment', 'size', 'href', 'target', 'disabled', 'aria-label'],
  // Our documented extension (navbar), not in the Ignite spec
  extensionAttributes: ['aria-expanded', 'aria-haspopup'],
  touchTarget: '48px',
};

function create(attrs = {}, icon = 'faGear') {
  const el = document.createElement('xe-icon-button');
  Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, value));
  const glyph = document.createElement('xe-icon');
  glyph.setAttribute('icon', icon);
  el.append(glyph);
  document.body.append(el);
  return el;
}

const control = (el) => el.shadowRoot.querySelector('.control');
const css = (el) => [...el.shadowRoot.adoptedStyleSheets || []]
  .flatMap((sheet) => [...sheet.cssRules].map((rule) => rule.cssText)).join('\n')
  || el.shadowRoot.querySelector('style')?.textContent || '';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('<xe-icon-button>', () => {
  describe('matches the design system docs', () => {
    it('is registered under the documented tag', () => {
      expect(customElements.get(DOCS_SPEC.tag)).toBe(XeIconButton);
    });

    it('has the documented props and defaults', () => {
      const el = create({ 'aria-label': 'Settings' });
      Object.entries(DOCS_SPEC.props).forEach(([prop, spec]) => {
        expect(el[prop], `${prop} default`).toBe(spec.default);
      });
      expect(ICON_BUTTON_TREATMENTS).toEqual(DOCS_SPEC.props.treatment.values);
      expect(ICON_BUTTON_SIZES).toEqual(DOCS_SPEC.props.size.values);
      expect(XeIconButton.observedAttributes)
        .toEqual([...DOCS_SPEC.attributes, ...DOCS_SPEC.extensionAttributes]);
    });

    it('renders a <button> by default and an <a> when href is set', () => {
      const button = create({ 'aria-label': 'Settings' });
      expect(control(button).localName).toBe('button');
      expect(control(button).type).toBe('button');

      const link = create({ href: '/profile', 'aria-label': 'View profile' }, 'faUser');
      expect(control(link).localName).toBe('a');
      expect(control(link).getAttribute('href')).toBe('/profile');

      link.removeAttribute('href');
      expect(control(link).localName).toBe('button');
      expect(link.shadowRoot.querySelectorAll('.control')).toHaveLength(1);
    });

    it('keeps the 48×48px touch target', () => {
      expect(css(create())).toContain(`width: ${DOCS_SPEC.touchTarget}`);
      expect(css(create())).toContain(`height: ${DOCS_SPEC.touchTarget}`);
    });
  });

  describe('accessibility (docs)', () => {
    it('forwards the required aria-label to the inner <button> or <a>', () => {
      const button = create({ 'aria-label': 'Settings' });
      expect(control(button).getAttribute('aria-label')).toBe('Settings');
      button.setAttribute('aria-label', 'Open settings');
      expect(control(button).getAttribute('aria-label')).toBe('Open settings');

      const link = create({
        href: 'https://facebook.com/xcelenergy',
        target: '_blank',
        'aria-label': 'Xcel Energy on Facebook (opens in a new window)',
      }, 'faSquareFacebook');
      expect(control(link).getAttribute('aria-label'))
        .toBe('Xcel Energy on Facebook (opens in a new window)');
    });

    it('adds no new-tab note of its own — the context belongs in the label', () => {
      const link = create({ href: 'https://xcelenergy.com', target: '_blank', 'aria-label': 'Xcel' });
      expect(control(link).getAttribute('aria-label')).toBe('Xcel');
      expect(control(link).textContent).toBe('');
      expect(control(link).getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('uses the native disabled state on the inner <button>', () => {
      const el = create({ disabled: '', 'aria-label': 'Settings' });
      expect(control(el).disabled).toBe(true);
      el.disabled = false;
      expect(control(el).disabled).toBe(false);
    });

    it('disables a link by dropping its href and setting aria-disabled', () => {
      const el = create({ href: '/profile', disabled: '', 'aria-label': 'View profile' });
      expect(control(el).hasAttribute('href')).toBe(false);
      expect(control(el).getAttribute('aria-disabled')).toBe('true');
      el.disabled = false;
      expect(control(el).getAttribute('href')).toBe('/profile');
      expect(control(el).hasAttribute('aria-disabled')).toBe(false);
    });

    it('navbar extension: forwards aria-expanded and aria-haspopup', () => {
      const el = create({ 'aria-label': 'Open menu', 'aria-expanded': 'false', 'aria-haspopup': 'dialog' });
      expect(control(el).getAttribute('aria-expanded')).toBe('false');
      expect(control(el).getAttribute('aria-haspopup')).toBe('dialog');
      el.setAttribute('aria-expanded', 'true');
      expect(control(el).getAttribute('aria-expanded')).toBe('true');
      el.removeAttribute('aria-haspopup');
      expect(control(el).hasAttribute('aria-haspopup')).toBe(false);
    });

    it('refuses javascript: URLs and renders a button instead', () => {
      // eslint-disable-next-line no-script-url
      const el = create({ href: 'javascript:alert(1)', 'aria-label': 'Bad' });
      expect(control(el).localName).toBe('button');
    });

    it('moves focus to the inner control', () => {
      const el = create({ 'aria-label': 'Settings' });
      el.focus();
      expect(el.shadowRoot.activeElement).toBe(control(el));
    });
  });

  describe('size controls the slotted xe-icon', () => {
    it('sets the documented xe-icon sizes on the slotted icon', () => {
      const el = create({ size: 'lg', 'aria-label': 'Settings' });
      const icon = el.querySelector('xe-icon');
      expect(icon.getAttribute('size')).toBe('lg');
      ['xs', 'sm', 'md', 'xl'].forEach((size) => {
        el.size = size;
        expect(icon.getAttribute('size')).toBe(size);
      });
    });

    it('handles xxs / 2xl itself — xe-icon stays at its documented xs–xl', () => {
      const el = create({ size: 'xxs', 'aria-label': 'Settings' });
      const icon = el.querySelector('xe-icon');
      expect(icon.getAttribute('size')).toBe('xs');
      el.size = '2xl';
      expect(icon.getAttribute('size')).toBe('xl');
      // The 12px / 40px width/height come from ::slotted() CSS — checked in the browser (Storybook)
    });

    it('falls back to md for an unknown size', () => {
      const el = create({ size: 'huge', 'aria-label': 'Settings' });
      expect(el.size).toBe('md');
      expect(el.querySelector('xe-icon').getAttribute('size')).toBe('md');
    });
  });
});
