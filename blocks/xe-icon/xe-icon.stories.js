import decorate from './xe-icon.js';
import './xe-icon.css';
// eslint-disable-next-line import/extensions -- the block model is JSON
import model from './_xe-icon.json';

/*
 * Builds the markup Universal Editor delivers for an xe-icon block, before decoration.
 * One row per model field, in JCR alphabetical order: color, icon, size.
 */
export function buildBlock({ icon = '', size = '', color = '' } = {}) {
  const block = document.createElement('div');
  block.className = 'xe-icon block';
  [color, icon, size].forEach((value) => {
    const row = document.createElement('div');
    const cell = document.createElement('div');
    cell.textContent = value;
    row.append(cell);
    block.append(row);
  });
  return block;
}

const [iconField, sizeField, colorField] = model.models[0].fields;

// Render inside the section/wrapper structure EDS creates, so the block CSS applies as on a page
function renderInPage({ sectionBackground, ...fields }) {
  const block = buildBlock(fields);
  const section = document.createElement('div');
  section.className = 'section';
  const dark = sectionBackground === 'dark';
  section.style.cssText = `padding:40px 24px;color:${dark ? '#fff' : '#333'};background:${dark ? '#1a1a1a' : '#fff'};`;
  const wrapper = document.createElement('div');
  wrapper.className = 'xe-icon-wrapper';
  wrapper.append(block);
  section.append(wrapper);
  decorate(block);
  return section;
}

export default {
  title: 'Blocks/XE Icon',
  excludeStories: ['buildBlock'],
  parameters: { layout: 'fullscreen', a11y: { config: { rules: [] } } },
  render: (args) => renderInPage(args),
  argTypes: {
    icon: {
      description: 'Icon (the authoring dropdown — every registered icon)',
      control: 'select',
      options: iconField.options.map((option) => option.value),
    },
    size: {
      description: 'Size (the authoring dropdown)',
      control: 'inline-radio',
      options: sizeField.options.map((option) => option.value),
      table: { defaultValue: { summary: 'md' } },
    },
    color: {
      description: 'Color (the authoring dropdown — brand tokens only; Inherit follows the section text)',
      control: 'inline-radio',
      options: colorField.options.map((option) => option.value),
      table: { defaultValue: { summary: 'inherit' } },
    },
    sectionBackground: {
      description: 'Story only — the section the block sits in',
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
  },
  args: {
    icon: iconField.value, size: sizeField.value, color: colorField.value, sectionBackground: 'light',
  },
};

// The block as inserted from the palette (template defaults)
export const Default = {};

export const ExtraLarge = {
  args: { icon: 'faLightbulb', size: 'xl' },
};

export const BrandPrimaryColor = {
  args: { icon: 'faBolt', size: 'lg', color: 'brand-primary' },
};

export const BrandAccentColor = {
  args: { icon: 'faLeaf', size: 'lg', color: 'brand-accent' },
};

// Inherit on a dark section — the icon turns white with the text
export const InheritOnDark = {
  args: { icon: 'faLightbulb', size: 'lg', sectionBackground: 'dark' },
};

// Universal Editor skipped the size field — falls back to md
export const NoSizeAuthored = {
  args: { icon: 'faStar', size: '' },
};
