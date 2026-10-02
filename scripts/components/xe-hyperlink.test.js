import {
  describe, it, expect, beforeEach,
} from 'vitest';
import './xe-hyperlink.js';
import { safeHref } from './xe-link-helpers.js';

// The Hyperlink docs page (DS status: Ready), recorded as data — the component must match it
const DOCS_SPEC = {
  tag: 'xe-hyperlink',
  props: {
    href: { attribute: 'href', default: '' },
    variant: { attribute: 'variant', default: 'default', values: ['default', 'variant'] },
    trailingIcon: { attribute: 'trailing-icon', default: false },
    linkType: {
      attribute: 'link-type', default: 'external', values: ['external', 'internal', 'download'],
    },
    target: { attribute: 'target', default: '' },
  },
  linkTypeIcons: {
    external: 'faArrowUpRightFromSquare', internal: 'faArrowRight', download: 'faArrowDown',
  },
};

function create(attrs = {}, label = 'Learn more') {
  const el = document.createElement('xe-hyperlink');
  Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, value));
  el.textContent = label;
  document.body.append(el);
  return el;
}

const anchor = (el) => el.shadowRoot.querySelector('a');
const icon = (el) => el.shadowRoot.querySelector('xe-icon');
const note = (el) => el.shadowRoot.querySelector('.visually-hidden');

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('<xe-hyperlink>', () => {
  describe('matches the design system docs', () => {
    it('is registered under the documented tag', () => {
      expect(customElements.get(DOCS_SPEC.tag)).toBeDefined();
    });

    it('has the documented props, attributes and defaults', () => {
      const el = create();
      Object.entries(DOCS_SPEC.props).forEach(([prop, spec]) => {
        expect(el[prop], `${prop} default`).toBe(spec.default);
        expect(XeHyperlinkObserved(), `${spec.attribute} observed`).toContain(spec.attribute);
      });
    });

    it('accepts every documented value', () => {
      const el = create();
      DOCS_SPEC.props.variant.values.forEach((value) => {
        el.setAttribute('variant', value);
        expect(el.variant).toBe(value);
      });
      DOCS_SPEC.props.linkType.values.forEach((value) => {
        el.setAttribute('link-type', value);
        expect(el.linkType).toBe(value);
      });
    });

    it('shows the documented icon per link-type when trailing-icon is on', () => {
      const el = create({ 'trailing-icon': '' });
      Object.entries(DOCS_SPEC.linkTypeIcons).forEach(([type, iconName]) => {
        el.setAttribute('link-type', type);
        expect(icon(el).getAttribute('icon'), type).toBe(iconName);
      });
    });
  });

  describe('rendering', () => {
    it('renders a native <a> with the href and the label slot', () => {
      const el = create({ href: '/rates' }, 'View rate options');
      const a = anchor(el);
      expect(a).not.toBeNull();
      expect(a.getAttribute('href')).toBe('/rates');
      expect(a.querySelector('slot')).not.toBeNull();
      expect(el.textContent).toBe('View rate options');
    });

    it('hides the trailing icon by default', () => {
      expect(icon(create({ href: '/a' })).hidden).toBe(true);
    });

    it('shows the external icon by default when trailing-icon is set', () => {
      const el = create({ href: '/a', 'trailing-icon': '' });
      expect(icon(el).hidden).toBe(false);
      expect(icon(el).getAttribute('icon')).toBe('faArrowUpRightFromSquare');
    });

    it('falls back to the default for unknown variant and link-type values', () => {
      const el = create({ variant: 'bogus', 'link-type': 'bogus', 'trailing-icon': '' });
      expect(el.variant).toBe('default');
      expect(el.linkType).toBe('external');
      expect(icon(el).getAttribute('icon')).toBe('faArrowUpRightFromSquare');
    });

    it('keeps the trailing icon decorative', () => {
      const el = create({ href: '/a', 'trailing-icon': '' });
      const svg = icon(el).shadowRoot.querySelector('svg');
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    });

    it('updates the anchor when attributes change', () => {
      const el = create({ href: '/a' });
      el.setAttribute('href', '/b');
      el.setAttribute('trailing-icon', '');
      el.setAttribute('link-type', 'download');
      expect(anchor(el).getAttribute('href')).toBe('/b');
      expect(icon(el).getAttribute('icon')).toBe('faArrowDown');
      expect(el.shadowRoot.querySelectorAll('a')).toHaveLength(1);
    });
  });

  describe('properties reflect to attributes', () => {
    it('href, variant, trailingIcon, linkType and target', () => {
      const el = create();
      el.href = '/x';
      el.variant = 'variant';
      el.trailingIcon = true;
      el.linkType = 'internal';
      el.target = '_blank';
      expect(el.getAttribute('href')).toBe('/x');
      expect(el.getAttribute('variant')).toBe('variant');
      expect(el.hasAttribute('trailing-icon')).toBe(true);
      expect(el.getAttribute('link-type')).toBe('internal');
      expect(el.getAttribute('target')).toBe('_blank');
      el.trailingIcon = false;
      expect(el.hasAttribute('trailing-icon')).toBe(false);
    });
  });

  describe('accessibility (DS docs)', () => {
    it('adds rel="noopener noreferrer" automatically for target="_blank"', () => {
      const el = create({ href: 'https://example.com', target: '_blank' });
      expect(anchor(el).getAttribute('target')).toBe('_blank');
      expect(anchor(el).getAttribute('rel')).toBe('noopener noreferrer');
      expect(note(el).hidden).toBe(false);
      expect(note(el).textContent).toBe(' (opens in a new tab)');
    });

    it('adds no rel or new-tab note without target="_blank"', () => {
      const el = create({ href: '/a', target: '_self' });
      expect(anchor(el).hasAttribute('rel')).toBe(false);
      expect(note(el).hidden).toBe(true);
    });

    it('passes aria-label to the anchor', () => {
      const el = create({ href: '/a', 'aria-label': 'Learn more about solar rebates' });
      expect(anchor(el).getAttribute('aria-label')).toBe('Learn more about solar rebates');
      el.removeAttribute('aria-label');
      expect(anchor(el).hasAttribute('aria-label')).toBe(false);
    });

    // Real keyboard focus (Tab / :focus-visible) is checked in the browser; happy-dom doesn't
    // implement delegatesFocus
    it('renders a focusable anchor (has an href)', () => {
      const el = create({ href: '/a' });
      expect(anchor(el).tabIndex).toBe(0);
      expect(anchor(el).hasAttribute('href')).toBe(true);
    });
  });

  describe('security (our extra)', () => {
    it('refuses javascript:, data: and vbscript: URLs', () => {
      // eslint-disable-next-line no-script-url -- these unsafe URLs are what the test feeds in
      ['javascript:void(0)', ' JavaScript:alert(1)', 'data:text/html,x', 'vbscript:x'].forEach((href) => {
        const el = create({ href });
        expect(anchor(el).hasAttribute('href'), href).toBe(false);
      });
      expect(safeHref('/ok')).toBe('/ok');
      expect(safeHref('https://example.com')).toBe('https://example.com');
    });
  });
});

function XeHyperlinkObserved() {
  return customElements.get('xe-hyperlink').observedAttributes;
}
