import './xe-action-link.js';

function actionLink({ linkType, href, label }) {
  const link = document.createElement('xe-action-link');
  if (linkType) link.setAttribute('link-type', linkType);
  if (href) link.setAttribute('href', href);
  link.textContent = label;
  return link;
}

// Centered stage, like the design system docs preview
function stage(content, { background = '', textColor = '' } = {}) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:flex;justify-content:center;padding:48px 24px;font-family:Arial,sans-serif;';
  if (background) wrapper.style.background = background;
  if (textColor) wrapper.style.setProperty('--card-text-color', textColor);
  wrapper.append(content);
  return wrapper;
}

export default {
  title: 'Design System Primitives/Action/Action Link',
  parameters: { layout: 'fullscreen', a11y: { config: { rules: [] } } },
  render: (args) => stage(actionLink(args)),
  argTypes: {
    linkType: {
      name: 'link-type',
      description: 'Controls the trailing icon.',
      control: 'select',
      options: ['internal', 'external', 'download'],
      table: { defaultValue: { summary: 'internal' } },
    },
    href: { description: 'URL the link navigates to.', control: 'text' },
    label: { description: 'Link label (default slot).', control: 'text' },
  },
  args: { linkType: 'internal', href: '/programs', label: 'Learn more' },
};

export const Default = {};

export const External = {
  args: { linkType: 'external', href: 'https://www.xcelenergy.com', label: 'Visit site' },
};

export const Download = {
  args: { linkType: 'download', href: '/files/rate-book.pdf', label: 'Download rate book' },
};

// Color comes from the surrounding card surface via --card-text-color
export const OnDarkSurface = {
  render: (args) => stage(actionLink(args), { background: '#8b1a2c', textColor: '#fff' }),
};
