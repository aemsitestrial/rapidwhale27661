import decorate from './xe-icon-button.js';
import './xe-icon-button.css';
// eslint-disable-next-line import/extensions -- the block model is JSON
import model from './_xe-icon-button.json';

/*
 * Builds the markup Universal Editor delivers for an xe-icon-button block, before decoration.
 * The ib_* fields are one element group ("ib"), so they arrive as ONE row with ONE cell holding
 * an element per field, in model order — ib_ariaLabel, ib_icon, ib_size, ib_treatment, ib_href
 * (as <p><a>), ib_target. Empty fields are skipped, as Universal Editor does.
 */
export function buildBlock({
  ariaLabel = '', icon = '', size = '', treatment = '', href = '', target = '',
} = {}) {
  const block = document.createElement('div');
  block.className = 'xe-icon-button block';
  const row = document.createElement('div');
  const cell = document.createElement('div');
  [ariaLabel, icon, size, treatment, href, target].forEach((value, i) => {
    if (!value) return;
    const p = document.createElement('p');
    if (i === 4) {
      const a = document.createElement('a');
      a.href = value;
      a.textContent = value;
      p.append(a);
    } else {
      p.textContent = value;
    }
    cell.append(p);
  });
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
    ariaLabel: { name: 'ib_ariaLabel', description: 'Accessible Label (required)', control: 'text' },
    icon: {
      name: 'ib_icon', description: 'Icon', control: 'select', options: options('ib_icon'),
    },
    size: {
      name: 'ib_size', description: 'Icon Size', control: 'select', options: options('ib_size'),
    },
    treatment: {
      name: 'ib_treatment', description: 'Treatment', control: 'inline-radio', options: options('ib_treatment'),
    },
    href: { name: 'ib_href', description: 'Link (optional)', control: 'text' },
    target: {
      name: 'ib_target', description: 'Open In — only used with a link', control: 'inline-radio', options: options('ib_target'),
    },
  },
  args: {
    ariaLabel: template.ib_ariaLabel,
    icon: template.ib_icon,
    size: template.ib_size,
    treatment: template.ib_treatment,
    target: template.ib_target,
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
