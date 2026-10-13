import decorate from './xe-icon-button.js';
import './xe-icon-button.css';
// eslint-disable-next-line import/extensions -- the block model is JSON
import model from './_xe-icon-button.json';

/*
 * Builds the markup Universal Editor delivers for an xe-icon-button block, before decoration.
 * link_cta + link_ctaText → <p><a href="...">label</a></p> (bare <p><a>label</a></p> when no href)
 * classes_icon, classes_size, classes_treatment, classes_disabled, classes_target → CSS classes
 */
export function buildBlock({
  ariaLabel = '', icon = '', size = '', treatment = '', href = '', target = '', disabled = false,
} = {}) {
  const block = document.createElement('div');
  const classes = ['xe-icon-button', 'block'];
  // icon is classes_icon — stored as CSS class (toClassName-normalized, e.g. faGear → fagear)
  if (icon) classes.push(icon.toLowerCase());
  if (size) classes.push(size);
  if (treatment) classes.push(treatment);
  if (disabled) classes.push('disabled');
  if (target) classes.push(target.replace(/^_/, '')); // _blank → blank, _self → self, etc.
  block.className = classes.join(' ');

  const row = document.createElement('div');
  const cell = document.createElement('div');

  // link_cta + link_ctaText → combined <a> element
  if (ariaLabel || href) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    if (href) a.href = href;
    a.textContent = ariaLabel;
    p.append(a);
    cell.append(p);
  }

  row.append(cell);
  block.append(row);
  return block;
}

const { fields } = model.models[0];
const options = (name) => fields.find((f) => f.name === name).options.map((o) => o.value);
const { template } = model.definitions[0].plugins.xwalk.page;

function renderInPage(args) {
  const block = buildBlock(args);
  const section = document.createElement('div');
  section.className = 'section';
  section.style.cssText = 'padding:40px 24px;color:#333;';
  const wrapper = document.createElement('div');
  wrapper.className = 'xe-icon-button-wrapper';
  wrapper.append(block);
  section.append(wrapper);
  decorate(block);
  return section;
}

export default {
  title: 'Blocks/XE Icon Button',
  excludeStories: ['buildBlock'],
  parameters: { layout: 'fullscreen', a11y: { config: { rules: [] } } },
  render: (args) => renderInPage(args),
  argTypes: {
    ariaLabel: { name: 'link_ctaText', description: 'Accessible Label (required)', control: 'text' },
    icon: {
      name: 'classes_icon', description: 'Icon', control: 'select', options: options('classes_icon'),
    },
    size: {
      name: 'classes_size', description: 'Size', control: 'select', options: options('classes_size'),
    },
    treatment: {
      name: 'classes_treatment', description: 'Treatment', control: 'inline-radio', options: options('classes_treatment'),
    },
    href: { name: 'link_cta', description: 'Link (optional)', control: 'text' },
    target: {
      name: 'classes_target', description: 'Open In — only used with a link', control: 'inline-radio', options: options('classes_target'),
    },
    disabled: {
      name: 'classes_disabled', description: 'Disabled', control: 'boolean',
    },
  },
  args: {
    ariaLabel: template.link_ctaText,
    icon: template.classes_icon,
    size: template.classes_size,
    treatment: template.classes_treatment,
  },
};

// The block as inserted from the palette (template defaults)
export const Default = {};

export const FilledLink = {
  args: {
    ariaLabel: 'View profile', icon: 'faUser', treatment: 'filled', href: '/profile',
  },
};

// The block adds "(opens in a new window)" to the label
export const SocialLinkNewTab = {
  args: {
    ariaLabel: 'Xcel Energy on Facebook',
    icon: 'faSquareFacebook',
    size: 'xl',
    href: 'https://facebook.com/xcelenergy',
    target: '_blank',
  },
};

export const OutlinedLarge = {
  args: {
    ariaLabel: 'Edit', icon: 'faPen', treatment: 'outlined', size: 'lg',
  },
};
