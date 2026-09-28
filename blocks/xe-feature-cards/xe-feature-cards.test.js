import {
  describe, it, expect, beforeEach, vi,
} from 'vitest';
import decorate from './xe-feature-cards.js';
import { buildBlock, AUTHORED_CARDS } from './xe-feature-cards.stories.js';

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

describe('xe-feature-cards block', () => {
  describe('decorate()', () => {
    it('renders <xe-feature-cards> with one <xe-card> per authored item', () => {
      const block = render({ cards: AUTHORED_CARDS });
      expect(block.children).toHaveLength(1);
      const band = block.querySelector(':scope > xe-feature-cards');
      expect(band.getAttribute('columns')).toBe('3');
      expect(band.getAttribute('mobile-layout')).toBe('carousel');
      expect(band.getAttribute('header-align')).toBe('left');
      expect(band.getAttribute('background')).toBe('default');
      expect(band.querySelectorAll(':scope > xe-card')).toHaveLength(3);
    });

    it('maps every card field to the documented xe-card attributes and slots', () => {
      const block = render({ cards: AUTHORED_CARDS });
      const [first, second, third] = block.querySelectorAll('xe-card');

      expect(first.getAttribute('variant')).toBe('surface');
      expect(first.getAttribute('treatment')).toBe('filled');
      expect(first.getAttribute('interactive')).toBe('true');
      expect(first.getAttribute('actions-placement')).toBe('inline');
      expect([...first.children].map((el) => `${el.localName}:${el.slot || 'default'}`)).toEqual([
        'xe-icon:icon', 'h2:title', 'p:default', 'xe-action-link:actions', 'picture:decorative',
      ]);
      expect(first.querySelector('xe-icon').getAttribute('icon')).toBe('faFileInvoiceDollar');
      expect(first.querySelector('xe-icon').getAttribute('size')).toBe('xl');
      expect(first.querySelector('[slot="title"]').textContent).toBe('Home Rebates');

      expect(second.getAttribute('variant')).toBe('primary-variant');

      const link = third.querySelector('xe-action-link');
      expect(link.getAttribute('href')).toBe('https://www.xcelenergy.com/home-improvement');
      expect(link.getAttribute('link-type')).toBe('external');
      expect(link.textContent).toBe('Learn More');
    });

    it('marks the decorative image as decorative', () => {
      const block = render({ cards: AUTHORED_CARDS.slice(0, 2) });
      expect(block.querySelector('[slot="decorative"] img').alt).toBe('');
    });

    it('renders the band heading and body copy, with card titles one level below', () => {
      const block = render({ heading: 'Programs', subheading: 'Save more.', cards: AUTHORED_CARDS });
      const band = block.querySelector('xe-feature-cards');
      expect(band.getAttribute('heading')).toBe('Programs');
      expect(band.getAttribute('subheading')).toBe('Save more.');
      expect(block.querySelector('[slot="title"]').localName).toBe('h3');
    });

    it('uses h2 card titles when there is no band heading', () => {
      const block = render({ cards: AUTHORED_CARDS });
      expect(block.querySelector('xe-feature-cards').hasAttribute('heading')).toBe(false);
      expect(block.querySelector('[slot="title"]').localName).toBe('h2');
    });

    it('sets columns to 2 for two cards', () => {
      const block = render({ cards: AUTHORED_CARDS.slice(0, 2) });
      expect(block.querySelector('xe-feature-cards').getAttribute('columns')).toBe('2');
    });

    it('renders at most 3 cards (design system maximum)', () => {
      const block = render({
        cards: [...AUTHORED_CARDS, { ctaLink: '/d', title: 'Fourth' }],
      });
      expect(block.querySelectorAll('xe-card')).toHaveLength(3);
    });

    it('reads cards correctly when optional fields are skipped', () => {
      const block = render({
        cards: [
          { ctaLink: '/a', title: 'Title and link only' },
          { body: '<p>Body only.</p>', ctaLink: '/b', title: 'With body' },
          { ctaLabel: 'Read more', ctaLink: '/c', title: 'With label' },
        ],
      });
      const [a, b, c] = block.querySelectorAll('xe-card');
      expect(a.getAttribute('variant')).toBe('surface');
      expect(a.querySelector('xe-icon')).toBeNull();
      expect(a.querySelector('[slot="decorative"]')).toBeNull();
      expect(a.querySelector('xe-action-link').textContent).toBe('Learn More');
      expect(a.querySelector('xe-action-link').hasAttribute('link-type')).toBe(false);
      expect(b.querySelector(':scope > p').textContent).toBe('Body only.');
      expect(b.querySelector('xe-action-link').textContent).toBe('Learn More');
      expect(c.querySelector(':scope > p')).toBeNull();
      expect(c.querySelector('xe-action-link').textContent).toBe('Read more');
    });

    it('skips items without a link, and reads a lone text field as the title', () => {
      // Title is required in the model; if it's missing anyway, the last text field becomes it
      const block = render({ cards: [{ title: 'No link' }, { ctaLink: '/x', body: '<p>No title</p>' }] });
      expect([...block.querySelectorAll('[slot="title"]')].map((t) => t.textContent)).toEqual(['No title']);
    });

    it('ignores unknown icons and falls back to surface for unknown variants', () => {
      const block = render({
        cards: [{
          ctaLink: '/a', icon: 'faUnknown', title: 'T', variant: 'bogus',
        }],
      });
      const card = block.querySelector('xe-card');
      expect(card.querySelector('xe-icon')).toBeNull();
      expect(card.getAttribute('variant')).toBe('surface');
    });

    it('renders authored titles as text, not HTML', () => {
      const block = render({ cards: [{ ctaLink: '/a', title: '<img src=x onerror="alert(1)">' }] });
      const title = block.querySelector('[slot="title"]');
      expect(title.querySelector('img')).toBeNull();
      expect(title.textContent).toBe('<img src=x onerror="alert(1)">');
    });

    it('moves Universal Editor instrumentation onto each card', () => {
      const block = buildBlock({ cards: AUTHORED_CARDS.slice(0, 2) });
      block.children[0].setAttribute('data-aue-resource', 'urn:card-1');
      decorate(block);
      expect(block.querySelector('xe-card').dataset.aueResource).toBe('urn:card-1');
    });

    it('does not throw for an empty block', () => {
      const block = buildBlock();
      expect(() => decorate(block)).not.toThrow();
      expect(block.querySelector('xe-feature-cards').children).toHaveLength(0);
    });
  });

  describe('<xe-feature-cards>', () => {
    it('renders the heading as an h2 and hides the header when empty', () => {
      const band = document.createElement('xe-feature-cards');
      document.body.append(band);
      const header = band.shadowRoot.querySelector('.header');
      expect(header.hidden).toBe(true);
      band.setAttribute('heading', 'Programs');
      expect(header.hidden).toBe(false);
      expect(band.shadowRoot.querySelector('h2').textContent).toBe('Programs');
      expect(band.shadowRoot.querySelector('.subheading').hidden).toBe(true);
    });

    it('has no implicit landmark role', () => {
      const band = document.createElement('xe-feature-cards');
      document.body.append(band);
      expect(band.hasAttribute('role')).toBe(false);
    });

    it('uses the columns attribute, or the card count (2–3) when absent', async () => {
      const block = render({ cards: AUTHORED_CARDS.slice(0, 2) });
      const band = block.querySelector('xe-feature-cards');
      const columns = () => band.shadowRoot.querySelector('.cards').style.getPropertyValue('--_columns');
      await flush();
      expect(columns()).toBe('2');
      band.removeAttribute('columns');
      band.append(document.createElement('xe-card'));
      await flush();
      expect(columns()).toBe('3');
    });
  });

  describe('<xe-card>', () => {
    it('sets --card-text-color for its variant (read by xe-action-link)', () => {
      const card = document.createElement('xe-card');
      document.body.append(card);
      const css = card.shadowRoot.querySelector('style').textContent;
      expect(css).toContain('--card-text-color: var(--xe-card-surface-text');
      expect(css).toContain('--card-text-color: var(--xe-card-primary-variant-text');
    });

    it('hides wrappers for empty slots', async () => {
      const block = render({ cards: [{ ctaLink: '/a', title: 'Only title' }] });
      await flush();
      const { shadowRoot } = block.querySelector('xe-card');
      expect(shadowRoot.querySelector('.icon').hidden).toBe(true);
      expect(shadowRoot.querySelector('.body').hidden).toBe(true);
      expect(shadowRoot.querySelector('.decorative').hidden).toBe(true);
      expect(shadowRoot.querySelector('.actions').hidden).toBe(false);
    });

    it('is entirely clickable: a click on the card follows its action link', () => {
      const block = render({ cards: AUTHORED_CARDS.slice(0, 2) });
      const card = block.querySelector('xe-card');
      const inner = card.querySelector('xe-action-link').shadowRoot.querySelector('a');
      const click = vi.spyOn(inner, 'click').mockImplementation(() => {});
      card.querySelector(':scope > p').click();
      expect(click).toHaveBeenCalledTimes(1);
    });

    it('opens the link in a new tab on ctrl/cmd-click', () => {
      const block = render({ cards: AUTHORED_CARDS.slice(0, 2) });
      const card = block.querySelector('xe-card');
      const open = vi.spyOn(window, 'open').mockImplementation(() => null);
      card.querySelector(':scope > p').dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
      expect(open).toHaveBeenCalledWith(expect.stringContaining('/rebates'), '_blank', 'noopener');
      open.mockRestore();
    });

    it('lets the action link handle its own clicks (no double navigation)', () => {
      const block = render({ cards: AUTHORED_CARDS.slice(0, 2) });
      const card = block.querySelector('xe-card');
      const inner = card.querySelector('xe-action-link').shadowRoot.querySelector('a');
      const click = vi.spyOn(inner, 'click');
      inner.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, cancelable: true }));
      expect(click).not.toHaveBeenCalled();
    });

    it('is not clickable when interactive is "false"', () => {
      const block = render({ cards: AUTHORED_CARDS.slice(0, 2) });
      const card = block.querySelector('xe-card');
      card.setAttribute('interactive', 'false');
      const inner = card.querySelector('xe-action-link').shadowRoot.querySelector('a');
      const click = vi.spyOn(inner, 'click').mockImplementation(() => {});
      card.querySelector(':scope > p').click();
      expect(click).not.toHaveBeenCalled();
    });
  });
});
