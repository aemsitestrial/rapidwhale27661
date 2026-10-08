import { registeredIconNames } from './xe-icon.js';
import '../icons.js';

/*
 * Stories mirror the DS Storybook (Design System Primitives › Media › Icon):
 * Default, Sizes, Color Inheritance, All Registered Icons — plus the footer's social brand icons.
 * Icons come from the site-level registration (scripts/icons.js). Path A: Font Awesome Free
 * stand-in for Pro, so some shapes differ from the DS Storybook (e.g. faBolt is solid here).
 */

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'];
const DOCS_ICONS = [
  'faPlus', 'faDownload', 'faBolt', 'faArrowRight', 'faExternalLink', 'faChevronRight',
  'faChevronDown', 'faHeart', 'faUser', 'faLightbulb', 'faStar', 'faRocket', 'faFire',
];
const BRANDS = ['faSquareFacebook', 'faXTwitter', 'faInstagram', 'faSquareLinkedin', 'faYoutube'];

function icon({ name, size, color }) {
  const el = document.createElement('xe-icon');
  el.setAttribute('icon', name);
  if (size) el.setAttribute('size', size);
  if (color) el.style.color = color;
  return el;
}

function stage(...children) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:flex;flex-wrap:wrap;align-items:flex-end;gap:24px;padding:40px 24px;'
    + 'font-family:Arial,sans-serif;font-size:14px;color:#333;';
  // Ignite's gap token (fallback is our estimate)
  wrapper.style.gap = 'var(--xe-spacing-space-2xl, 24px)';
  wrapper.append(...children);
  return wrapper;
}

function labelled(el, text) {
  const figure = document.createElement('div');
  figure.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;min-width:96px;';
  const caption = document.createElement('code');
  caption.textContent = text;
  figure.append(el, caption);
  return figure;
}

export default {
  title: 'Design System Primitives/Media/Icon',
  parameters: { layout: 'fullscreen', a11y: { config: { rules: [] } } },
  render: (args) => stage(icon(args)),
  argTypes: {
    name: {
      name: 'icon',
      description: 'Font Awesome icon name (must be registered with registerIcons())',
      control: 'select',
      options: registeredIconNames(),
    },
    size: {
      description: 'Size on the design token scale',
      control: 'inline-radio',
      options: SIZES,
      table: { defaultValue: { summary: 'md' } },
    },
    color: {
      description: 'Story only — sets CSS `color` on the icon (it inherits the parent’s text color)',
      control: 'color',
    },
  },
  args: { name: 'faBolt', size: 'md' },
};

export const Default = {};

// xs → xl, all from the same icon
export const Sizes = {
  render: () => stage(...SIZES.map((size) => labelled(icon({ name: 'faBolt', size }), size))),
};

// No color prop — the icon follows the text color of whatever it sits in. Ignite's color tokens;
// the fallbacks are our estimates until the tokens docs arrive.
const COLORS = [
  ['var(--xe-color-brand-primary, #c8102e)', 'Brand primary'],
  ['var(--xe-color-brand-accent, #00664f)', 'Brand accent'],
  ['#333', 'Text (inherited)'],
];

export const ColorInheritance = {
  render: () => stage(...COLORS.map(
    ([color, text]) => {
      const line = document.createElement('span');
      line.style.cssText = `display:inline-flex;align-items:center;gap:8px;color:${color};font-size:18px;`;
      line.append(icon({ name: 'faLightbulb', size: 'md' }), text);
      return line;
    },
  )),
};

export const AllRegisteredIcons = {
  render: () => stage(...DOCS_ICONS.map((name) => labelled(icon({ name, size: 'lg' }), name))),
};

// Footer social links (Font Awesome Free brands)
export const SocialBrands = {
  render: () => stage(...BRANDS.map((name) => labelled(icon({ name, size: 'lg' }), name))),
};
