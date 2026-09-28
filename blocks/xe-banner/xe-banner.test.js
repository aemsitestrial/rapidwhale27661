import {
  describe, it, expect, beforeEach,
} from 'vitest';
import decorate from './xe-banner.js';
import { buildBlock } from './xe-banner.stories.js';

const FULL = {
  classes: ['size-generous', 'bg-default', 'align-center', 'button-outlined'],
  buttonLabel: 'Explore Programs',
  buttonLink: '/programs',
  heading: 'Save Energy, Save Money',
  headingLevel: '2',
  icon: 'faLeaf',
  message: '<p>Explore rebates, tips, and programs to help reduce your energy use and lower your bill.</p>',
};

// Let slotchange events and other microtasks run
const flush = () => new Promise((resolve) => { setTimeout(resolve, 0); });

function render(options) {
  const block = buildBlock(options);
  document.body.append(block);
  decorate(block);
  return block;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('xe-banner block', () => {
  describe('decorate()', () => {
    it('renders the xe-banner component tree from authored rows', () => {
      const block = render(FULL);

      expect(block.children).toHaveLength(1);
      const banner = block.querySelector(':scope > xe-banner');
      expect(banner.getAttribute('variant')).toBe('message');
      expect(banner.getAttribute('size')).toBe('generous');
      expect(banner.getAttribute('background')).toBe('default');

      const column = banner.querySelector(':scope > xe-banner-column');
      expect(column.hasAttribute('expand')).toBe(true);
      expect(column.getAttribute('align')).toBe('center');
      expect(column.getAttribute('heading-level')).toBe('2');

      const icon = column.querySelector(':scope > xe-icon[slot="icon"]');
      expect(icon.getAttribute('icon')).toBe('faLeaf');
      expect(icon.getAttribute('size')).toBe('lg');

      expect(column.querySelector('[slot="heading"]').textContent).toBe('Save Energy, Save Money');
      expect(column.querySelector('[slot="message"] p').textContent)
        .toContain('Explore rebates, tips, and programs');

      const button = column.querySelector(':scope > xe-button[slot="action"]');
      expect(button.getAttribute('href')).toBe('/programs');
      expect(button.getAttribute('variant')).toBe('primary');
      expect(button.getAttribute('treatment')).toBe('outlined');
      expect(button.getAttribute('size')).toBe('sm');
      expect(button.textContent).toBe('Explore Programs');
      const arrow = button.querySelector('xe-icon[slot="trailing-icon"]');
      expect(arrow.getAttribute('icon')).toBe('faArrowRight');
    });

    it('keeps slotted content in document order: icon, heading, message, action', () => {
      const block = render(FULL);
      const slots = [...block.querySelector('xe-banner-column').children].map((el) => el.slot);
      expect(slots).toEqual(['icon', 'heading', 'message', 'action']);
    });

    it('maps style classes to component attributes', () => {
      const block = render({
        ...FULL,
        classes: ['size-compact', 'bg-brand', 'align-start', 'button-filled'],
      });
      const banner = block.querySelector('xe-banner');
      expect(banner.getAttribute('size')).toBe('compact');
      expect(banner.getAttribute('background')).toBe('brand');
      expect(block.querySelector('xe-banner-column').getAttribute('align')).toBe('start');
      expect(block.querySelector('xe-button').getAttribute('treatment')).toBe('filled');
    });

    it('falls back to the design defaults when no style options are set', () => {
      const block = render({ ...FULL, classes: [] });
      const banner = block.querySelector('xe-banner');
      expect(banner.getAttribute('size')).toBe('generous');
      expect(banner.getAttribute('background')).toBe('default');
      expect(block.querySelector('xe-banner-column').getAttribute('align')).toBe('center');
      expect(block.querySelector('xe-button').getAttribute('treatment')).toBe('outlined');
    });

    it('uses the authored heading level, defaulting to 2', () => {
      expect(render({ ...FULL, headingLevel: '4' })
        .querySelector('xe-banner-column').getAttribute('heading-level')).toBe('4');
      expect(render({ ...FULL, headingLevel: '' })
        .querySelector('xe-banner-column').getAttribute('heading-level')).toBe('2');
    });

    it('renders authored text as text, not HTML', () => {
      const block = render({ ...FULL, heading: '<img src=x onerror="alert(1)">' });
      const heading = block.querySelector('[slot="heading"]');
      expect(heading.querySelector('img')).toBeNull();
      expect(heading.textContent).toBe('<img src=x onerror="alert(1)">');
    });

    it('moves Universal Editor instrumentation onto the slotted elements', () => {
      const block = buildBlock(FULL);
      const [, , headingRow, , , messageRow] = block.children;
      headingRow.firstElementChild.setAttribute('data-aue-prop', 'heading');
      messageRow.firstElementChild.setAttribute('data-aue-prop', 'message');
      messageRow.firstElementChild.setAttribute('data-richtext-prop', 'message');
      decorate(block);

      expect(block.querySelector('[slot="heading"]').dataset.aueProp).toBe('heading');
      const message = block.querySelector('[slot="message"]');
      expect(message.dataset.aueProp).toBe('message');
      expect(message.dataset.richtextProp).toBe('message');
    });

    describe('missing optional fields', () => {
      it('omits the icon when "none" or an unknown icon is chosen', () => {
        expect(render({ ...FULL, icon: 'none' }).querySelector('xe-icon[slot="icon"]')).toBeNull();
        expect(render({ ...FULL, icon: 'faUnknown' }).querySelector('xe-icon[slot="icon"]'))
          .toBeNull();
      });

      it('omits the button when there is no link', () => {
        const block = render({ ...FULL, buttonLink: '' });
        expect(block.querySelector('xe-button')).toBeNull();
      });

      it('uses the link text as the label when no button label is set', () => {
        const block = render({ ...FULL, buttonLabel: '' });
        expect(block.querySelector('xe-button').textContent).toBe('/programs');
      });

      it('accepts a plain-text link value', () => {
        const block = buildBlock({ ...FULL, buttonLink: '' });
        block.children[1].firstElementChild.textContent = '/plain-link';
        decorate(block);
        expect(block.querySelector('xe-button').getAttribute('href')).toBe('/plain-link');
      });

      it('omits the heading and message when they are empty', () => {
        const block = render({ ...FULL, heading: '', message: '' });
        expect(block.querySelector('[slot="heading"]')).toBeNull();
        expect(block.querySelector('[slot="message"]')).toBeNull();
      });
    });

    describe('empty block', () => {
      it('does not throw and renders an empty banner when there are no rows', () => {
        const block = buildBlock({ rows: false });
        expect(() => decorate(block)).not.toThrow();
        const column = block.querySelector('xe-banner > xe-banner-column');
        expect(column).not.toBeNull();
        expect(column.children).toHaveLength(0);
      });

      it('does not throw when every row is empty', () => {
        const block = buildBlock();
        expect(() => decorate(block)).not.toThrow();
        expect(block.querySelector('xe-banner-column').children).toHaveLength(0);
      });
    });
  });

  describe('web components', () => {
    it('<xe-banner-column> wraps the heading slot in a heading of the chosen level', async () => {
      const block = render({ ...FULL, headingLevel: '3' });
      await flush();
      const { shadowRoot } = block.querySelector('xe-banner-column');
      const heading = shadowRoot.querySelector('.heading');
      expect(heading.localName).toBe('h3');
      expect(heading.querySelector('slot[name="heading"]')).not.toBeNull();
      expect(heading.hidden).toBe(false);
    });

    it('<xe-banner-column> hides wrappers for empty slots', async () => {
      const block = render({ ...FULL, icon: 'none', buttonLink: '' });
      await flush();
      const { shadowRoot } = block.querySelector('xe-banner-column');
      expect(shadowRoot.querySelector('.icon').hidden).toBe(true);
      expect(shadowRoot.querySelector('.action').hidden).toBe(true);
      expect(shadowRoot.querySelector('.message').hidden).toBe(false);
    });

    it('<xe-button> renders a link when href is set, otherwise a button', () => {
      const link = document.createElement('xe-button');
      link.setAttribute('href', '/programs');
      link.setAttribute('target', '_blank');
      document.body.append(link);
      const a = link.shadowRoot.querySelector('a.control');
      expect(a.getAttribute('href')).toBe('/programs');
      expect(a.rel).toBe('noopener noreferrer');

      const button = document.createElement('xe-button');
      document.body.append(button);
      expect(button.shadowRoot.querySelector('button.control').type).toBe('button');
    });

    it('<xe-icon> renders a decorative SVG, or a labelled one when label is set', () => {
      const icon = document.createElement('xe-icon');
      icon.setAttribute('icon', 'faLeaf');
      document.body.append(icon);
      expect(icon.shadowRoot.querySelector('svg').getAttribute('aria-hidden')).toBe('true');

      icon.setAttribute('label', 'Leaf');
      const svg = icon.shadowRoot.querySelector('svg');
      expect(svg.getAttribute('role')).toBe('img');
      expect(svg.getAttribute('aria-label')).toBe('Leaf');
      expect(icon.shadowRoot.querySelectorAll('svg')).toHaveLength(1);
    });

    it('<xe-icon> renders nothing for an unknown icon', () => {
      const icon = document.createElement('xe-icon');
      icon.setAttribute('icon', 'faUnknown');
      document.body.append(icon);
      expect(icon.shadowRoot.querySelector('svg')).toBeNull();
    });
  });
});
