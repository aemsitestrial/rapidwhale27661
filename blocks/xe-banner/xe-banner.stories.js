import decorate from './xe-banner.js';
import './xe-banner.css';

/*
 * Builds the markup Universal Editor delivers for an xe-banner block, before decoration.
 * One row per model field, in JCR alphabetical order:
 *   buttonLabel, buttonLink, heading, headingLevel, icon, message
 * Style options are block classes (size-*, bg-*, align-*, button-*, icon-size-*).
 * Pass `rows: false` to build a block with no rows at all.
 */
export function buildBlock({
  classes = [],
  buttonLabel = '',
  buttonLink = '',
  heading = '',
  headingLevel = '',
  icon = '',
  message = '',
  rows = true,
} = {}) {
  const block = document.createElement('div');
  block.className = ['xe-banner', 'block', ...classes].join(' ');
  if (!rows) return block;

  const addRow = (fill) => {
    const row = document.createElement('div');
    const cell = document.createElement('div');
    fill(cell);
    row.append(cell);
    block.append(row);
    return cell;
  };

  addRow((cell) => { cell.textContent = buttonLabel; });
  addRow((cell) => {
    if (!buttonLink) return;
    const a = document.createElement('a');
    a.href = buttonLink;
    a.textContent = buttonLink;
    cell.append(a);
  });
  addRow((cell) => { cell.textContent = heading; });
  addRow((cell) => { cell.textContent = headingLevel; });
  addRow((cell) => { cell.textContent = icon; });
  // Rich text arrives as authored HTML
  addRow((cell) => { cell.innerHTML = message; });
  return block;
}

const DESIGN_EXAMPLE = {
  buttonLabel: 'Explore Programs',
  buttonLink: '/programs',
  heading: 'Save Energy, Save Money',
  headingLevel: '2',
  icon: 'faLeaf',
  message: '<p>Explore rebates, tips, and programs to help reduce your energy use and lower your bill.</p>',
};

// Render inside the section/wrapper structure EDS creates, so the block CSS applies as on a page
function renderInPage(options) {
  const block = buildBlock(options);
  const main = document.createElement('main');
  const section = document.createElement('div');
  section.className = 'section';
  const wrapper = document.createElement('div');
  wrapper.className = 'xe-banner-wrapper';
  wrapper.append(block);
  section.append(wrapper);
  main.append(section);
  decorate(block);
  return main;
}

const fromArgs = ({
  size, background, align, buttonStyle, iconSize, ...fields
}) => ({
  ...fields,
  classes: [
    `size-${size}`, `bg-${background}`, `align-${align}`, `button-${buttonStyle}`, `icon-size-${iconSize}`,
  ],
});

export default {
  title: 'Blocks/XE Banner',
  excludeStories: ['buildBlock'],
  parameters: { layout: 'fullscreen', a11y: { config: { rules: [] } } },
  render: (args) => renderInPage(fromArgs(args)),
  argTypes: {
    size: { control: 'inline-radio', options: ['compact', 'default', 'generous'] },
    background: { control: 'inline-radio', options: ['default', 'subtle', 'brand', 'dark'] },
    align: { control: 'inline-radio', options: ['start', 'center'] },
    buttonStyle: { control: 'inline-radio', options: ['outlined', 'filled'] },
    iconSize: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    headingLevel: { control: 'select', options: ['1', '2', '3', '4', '5', '6'] },
    icon: {
      control: 'select',
      options: [
        'none', 'faLeaf', 'faBolt', 'faLightbulb', 'faPiggyBank', 'faFire', 'faSolarPanel', 'faStar',
        'faHeart', 'faUser', 'faRocket', 'faWrench',
      ],
    },
    message: { control: 'text' },
  },
  args: {
    ...DESIGN_EXAMPLE,
    size: 'generous',
    background: 'default',
    align: 'center',
    buttonStyle: 'outlined',
    iconSize: 'lg',
  },
};

// Matches the design: white, centered, leaf icon, outlined red button
export const Default = {};

export const Cream = {
  args: { background: 'subtle' },
};

export const CrimsonLeftAligned = {
  args: {
    size: 'default',
    background: 'brand',
    align: 'start',
    buttonStyle: 'filled',
    icon: 'faBolt',
    heading: 'Need help with your account?',
    headingLevel: '3',
    message: '<p>Our team is here to help. <a href="/faq">Read the FAQ</a>.</p>',
    buttonLabel: 'Contact Us',
    buttonLink: '/contact',
  },
};

export const Dark = {
  args: { background: 'dark', size: 'compact' },
};

// Edge cases: optional content missing
export const NoIcon = {
  args: { icon: 'none' },
};

export const ExtraLargeIcon = {
  args: { iconSize: 'xl', icon: 'faLightbulb' },
};

export const NoButton = {
  args: { buttonLabel: '', buttonLink: '' },
};

export const HeadingOnly = {
  args: {
    icon: 'none', message: '', buttonLabel: '', buttonLink: '',
  },
};

export const NoStyleOptions = {
  render: () => renderInPage({ ...DESIGN_EXAMPLE }),
};

export const EmptyBlock = {
  render: () => renderInPage({ rows: false }),
};
