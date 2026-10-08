import decorate from './xe-icon-button.js';
import './xe-icon-button.css';
// eslint-disable-next-line import/extensions -- the block model is JSON
import model from './_xe-icon-button.json';

/*
 * Builds the markup Universal Editor delivers for an xe-icon-button block, before decoration.
 * One row per saved field, in JCR alphabetical order: ariaLabel, href, icon, size, target,
 * treatment. Empty fields are skipped, as Universal Editor does.
 */
export function buildBlock({
  ariaLabel = '', href = '', icon = '', size = '', target = '', treatment = '',
} = {}) {
  const block = document.createElement('div');
  block.className = 'xe-icon-button block';
  [ariaLabel, href, icon, size, target, treatment].filter(Boolean).forEach((value) => {
    const row = document.createElement('div');
    const cell = document.createElement('div');
    cell.textContent = value;
    row.append(cell);
    block.append(row);
  });
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
    ariaLabel: { description: 'Accessible Label (required)', control: 'text' },
    icon: { control: 'select', options: options('icon') },
    size: { control: 'select', options: options('size') },
    treatment: { control: 'inline-radio', options: options('treatment') },
    href: { description: 'Link (optional)', control: 'text' },
    target: { description: 'Open In — only used with a link', control: 'inline-radio', options: options('target') },
  },
  args: {
    ariaLabel: template.ariaLabel,
    icon: template.icon,
    size: template.size,
    treatment: template.treatment,
    target: template.target,
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
