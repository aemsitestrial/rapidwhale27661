import './xe-icon-button.js';
import '../icons.js';

/*
 * Stories mirror the DS Storybook (Design System Primitives › Action › Icon Button):
 * Default, Treatments, Sizes, States, As a link, plus the docs' Usage examples.
 * Path A: Font Awesome Free icons; colors are estimates until the design tokens docs arrive.
 */

const SIZES = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];

function iconButton({
  icon = 'faGear', label = 'Settings', treatment, size, href, target, disabled,
}) {
  const el = document.createElement('xe-icon-button');
  if (treatment) el.setAttribute('treatment', treatment);
  if (size) el.setAttribute('size', size);
  if (href) el.setAttribute('href', href);
  if (target) el.setAttribute('target', target);
  if (disabled) el.setAttribute('disabled', '');
  el.setAttribute('aria-label', label);
  const glyph = document.createElement('xe-icon');
  glyph.setAttribute('icon', icon);
  el.append(glyph);
  return el;
}

function row(...children) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:flex;gap:16px;align-items:center;';
  wrapper.append(...children);
  return wrapper;
}

function stage(...children) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:24px;'
    + 'padding:40px 24px;font-family:Arial,sans-serif;color:#333;';
  wrapper.append(...children);
  return wrapper;
}

function captioned(el, text) {
  const figure = document.createElement('div');
  figure.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;';
  const caption = document.createElement('p');
  caption.style.cssText = 'margin:0;font-size:12px;';
  caption.textContent = text;
  figure.append(el, caption);
  return figure;
}

export default {
  title: 'Design System Primitives/Action/Icon Button',
  parameters: { layout: 'fullscreen', a11y: { config: { rules: [] } } },
  render: (args) => stage(iconButton(args)),
  argTypes: {
    treatment: {
      description: 'Visual style treatment',
      control: 'select',
      options: ['default', 'filled', 'outlined'],
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      description: 'Icon size — controls the slotted xe-icon size. Touch target is always 48×48.',
      control: 'select',
      options: SIZES,
      table: { defaultValue: { summary: 'md' } },
    },
    disabled: {
      description: 'Disables the button or link.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    href: { description: 'When set, renders an <a> element instead of <button>.', control: 'text' },
    target: {
      description: 'Anchor target — only applies when href is set. Use _blank for external links.',
      control: 'select',
      options: ['', '_self', '_blank'],
    },
    label: {
      name: 'aria-label',
      description: 'Required. Accessible label forwarded to the inner element',
      control: 'text',
    },
    icon: { description: 'Story only — the slotted xe-icon', control: 'text' },
  },
  args: {
    treatment: 'default', size: 'md', disabled: false, label: 'Settings', icon: 'faGear',
  },
};

export const Default = {};

export const Treatments = {
  render: () => stage(row(
    iconButton({ icon: 'faMagnifyingGlass', label: 'Search' }),
    iconButton({ icon: 'faHeart', label: 'Favorite', treatment: 'filled' }),
    iconButton({ icon: 'faPen', label: 'Edit', treatment: 'outlined' }),
  )),
};

// "The visible icon scales with size; the 48×48px touch target is preserved at all sizes."
export const Sizes = {
  render: () => stage(row(...SIZES.map((size) => captioned(iconButton({ size }), size)))),
};

export const States = {
  render: () => stage(...[
    ['Default', 'default', 'faGear', 'Settings'],
    ['Filled', 'filled', 'faPlus', 'Add'],
    ['Outlined', 'outlined', 'faPen', 'Edit'],
  ].map(([title, treatment, icon, label]) => {
    const group = document.createElement('div');
    const heading = document.createElement('h3');
    heading.style.cssText = 'margin:0 0 16px;font-size:20px;font-weight:600;';
    heading.textContent = title;
    group.append(heading, row(
      captioned(iconButton({ treatment, icon, label }), 'Enabled'),
      captioned(iconButton({
        treatment, icon, label, disabled: true,
      }), 'Disabled'),
    ));
    return group;
  })),
};

// "Set href to render an <a> element. Commonly used for social media icons in footers."
export const AsALink = {
  args: {
    icon: 'faExternalLink',
    href: 'https://xcelenergy.com',
    target: '_blank',
    label: 'Xcel Energy (opens in a new window)',
  },
};

// The docs' Usage examples: button, link, external social link
export const Usage = {
  render: () => stage(row(
    iconButton({ icon: 'faGear', label: 'Settings' }),
    iconButton({ icon: 'faUser', label: 'View profile', href: '/profile' }),
    iconButton({
      icon: 'faSquareFacebook',
      label: 'Xcel Energy on Facebook (opens in a new window)',
      href: 'https://facebook.com/xcelenergy',
      target: '_blank',
      size: 'xl',
    }),
  )),
};
