import {
  describe, it, expect, beforeEach,
} from 'vitest';
import XeIcon, {
  registerIcons, isIconRegistered, registeredIconNames, ICON_SIZES,
} from './xe-icon.js';
import * as fa from './icons/fa-free.js';
import '../icons.js';

// The Icon docs page (Design System Primitives › Media › Icon), recorded as data
const DOCS_SPEC = {
  tag: 'xe-icon',
  props: {
    icon: { attribute: 'icon', default: '' },
    size: { attribute: 'size', default: 'md', values: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  // Size tokens — names are placeholders and px values estimates until the token docs arrive
  sizeTokens: {
    xs: ['--xe-sizing-icon-xs', '14px'],
    sm: ['--xe-sizing-icon-sm', '16px'],
    md: ['--xe-sizing-icon-md', '20px'],
    lg: ['--xe-sizing-icon-lg', '28px'],
    xl: ['--xe-sizing-icon-xl', '36px'],
  },
  // "All Registered Icons" story
  registered: [
    'faPlus', 'faDownload', 'faBolt', 'faArrowRight', 'faExternalLink', 'faChevronRight',
    'faChevronDown', 'faHeart', 'faUser', 'faLightbulb', 'faStar', 'faRocket', 'faFire',
  ],
  // Footer social links
  brands: ['faSquareFacebook', 'faXTwitter', 'faInstagram', 'faSquareLinkedin', 'faYoutube'],
};

function create(attrs = {}) {
  const el = document.createElement('xe-icon');
  Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, value));
  document.body.append(el);
  return el;
}

const svg = (el) => el.shadowRoot.querySelector('svg');
const css = (el) => el.shadowRoot.querySelector('style').textContent;

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('<xe-icon>', () => {
  describe('matches the design system docs', () => {
    it('is registered under the documented tag', () => {
      expect(customElements.get(DOCS_SPEC.tag)).toBe(XeIcon);
    });

    it('has the documented props and defaults', () => {
      const el = create();
      Object.entries(DOCS_SPEC.props).forEach(([prop, spec]) => {
        expect(el[prop], `${prop} default`).toBe(spec.default);
      });
      expect(ICON_SIZES).toEqual(DOCS_SPEC.props.size.values);
    });

    it('accepts every documented size and falls back to md for anything else', () => {
      const el = create({ icon: 'faBolt' });
      DOCS_SPEC.props.size.values.forEach((value) => {
        el.size = value;
        expect(el.size).toBe(value);
      });
      el.size = 'huge';
      expect(el.size).toBe('md');
    });

    it('maps each size to its design token with a px fallback', () => {
      const styles = css(create());
      Object.entries(DOCS_SPEC.sizeTokens).forEach(([size, [token, px]]) => {
        expect(styles, size).toContain(`var(${token}, ${px})`);
      });
      expect(styles).toContain('width: var(--_size)');
      // Only the Ignite props — no extra size override property
      expect(styles).not.toContain('--xe-icon-size');
    });

    it('inherits its color from the parent', () => {
      const styles = css(create());
      expect(styles).toContain('color: inherit');
      expect(styles).toContain('fill: currentcolor');
    });

    it('has every icon from the docs registered at the site level, plus the footer brands', () => {
      [...DOCS_SPEC.registered, ...DOCS_SPEC.brands].forEach((name) => {
        expect(isIconRegistered(name), name).toBe(true);
      });
    });

    it('registers faExternalLink as an alias of faArrowUpRightFromSquare', () => {
      const a = svg(create({ icon: 'faExternalLink' })).querySelector('path').getAttribute('d');
      const b = svg(create({ icon: 'faArrowUpRightFromSquare' })).querySelector('path')
        .getAttribute('d');
      expect(a).toBe(b);
    });
  });

  describe('rendering', () => {
    it('renders the registered SVG with the icon’s own viewBox', () => {
      const el = create({ icon: 'faBolt' });
      const [width, height, , , d] = fa.faBolt.icon;
      expect(svg(el).getAttribute('viewBox')).toBe(`0 0 ${width} ${height}`);
      expect(svg(el).querySelector('path').getAttribute('d')).toBe(d);
    });

    it('is always decorative and never focusable — label the parent instead', () => {
      const el = create({ icon: 'faBolt', label: 'Bolt' });
      expect(svg(el).getAttribute('aria-hidden')).toBe('true');
      expect(svg(el).getAttribute('focusable')).toBe('false');
      expect(svg(el).hasAttribute('aria-label')).toBe(false);
      expect(XeIcon.observedAttributes).not.toContain('label');
    });

    it('re-renders when the icon changes, keeping a single SVG', () => {
      const el = create({ icon: 'faBolt' });
      el.icon = 'faLeaf';
      expect(el.shadowRoot.querySelectorAll('svg')).toHaveLength(1);
      expect(svg(el).querySelector('path').getAttribute('d')).toBe(fa.faLeaf.icon[4]);
    });

    it('renders nothing for an unknown or missing icon', () => {
      expect(svg(create({ icon: 'faUnknown' }))).toBeNull();
      expect(svg(create())).toBeNull();
    });

    it('fills in once a waiting icon is registered', () => {
      const el = create({ icon: 'faTestLate' });
      expect(svg(el)).toBeNull();
      registerIcons({ faTestLate: fa.faStar });
      expect(svg(el)).not.toBeNull();
      expect(registeredIconNames()).toContain('faTestLate');
    });

    it('ignores definitions that are not in the Font Awesome shape', () => {
      registerIcons({ faBroken: { path: 'M0 0' }, faNull: null });
      expect(isIconRegistered('faBroken')).toBe(false);
      expect(isIconRegistered('faNull')).toBe(false);
    });

    it('renders every path of a multi-path (duotone) definition', () => {
      registerIcons({ faTestDuo: { icon: [512, 512, [], '', ['M0 0h1', 'M1 1h1']] } });
      expect(svg(create({ icon: 'faTestDuo' })).querySelectorAll('path')).toHaveLength(2);
    });
  });
});
