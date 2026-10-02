import './xe-hyperlink.js';

/*
 * Stories mirror the DS Storybook (Design System Primitives › Action › Hyperlink):
 * Default, With Trailing Icon, Variant On Dark, Link List — plus one project example in body copy.
 * The DS examples use href="javascript:void(0)"; our component refuses javascript: URLs, so the
 * stories use "#".
 */

function hyperlink({
  href = '#', variant, trailingIcon, linkType, target, label,
}) {
  const link = document.createElement('xe-hyperlink');
  link.setAttribute('href', href);
  if (variant) link.setAttribute('variant', variant);
  if (trailingIcon) link.setAttribute('trailing-icon', '');
  if (linkType) link.setAttribute('link-type', linkType);
  if (target) link.setAttribute('target', target);
  link.textContent = label;
  return link;
}

function stage(...children) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'padding:40px 24px;font-family:Arial,sans-serif;font-size:18px;color:#333;';
  wrapper.append(...children);
  return wrapper;
}

export default {
  title: 'Design System Primitives/Action/Hyperlink',
  parameters: { layout: 'fullscreen', a11y: { config: { rules: [] } } },
  render: (args) => stage(hyperlink(args)),
  argTypes: {
    href: { description: 'URL the link navigates to', control: 'text' },
    variant: {
      description: 'Color variant — use "variant" (white) on dark backgrounds',
      control: 'select',
      options: ['default', 'variant'],
      table: { defaultValue: { summary: 'default' } },
    },
    trailingIcon: {
      name: 'trailing-icon',
      description: 'Show the trailing icon after the label',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    linkType: {
      name: 'link-type',
      description: 'Icon shown when trailing-icon is enabled — external (↗), internal (→), or download (↓)',
      control: 'select',
      options: ['external', 'internal', 'download'],
      table: { defaultValue: { summary: 'external' } },
    },
    target: { description: 'Anchor target attribute (e.g. "_blank")', control: 'text' },
    label: { description: 'Link label (default slot)', control: 'text' },
  },
  args: {
    href: '#',
    variant: 'default',
    trailingIcon: true,
    linkType: 'external',
    label: 'Learn more about our energy plans',
  },
};

// Default hyperlink on a light surface
export const Default = {};

// "With the trailing external-link icon, indicating the link opens additional content."
export const WithTrailingIcon = {
  args: {
    trailingIcon: true, linkType: undefined, variant: undefined, label: 'View full report',
  },
};

// "The 'variant' color is fixed-light (white) — intended for use on dark or colored backgrounds."
export const VariantOnDark = {
  args: { variant: 'variant', trailingIcon: false, label: 'Privacy Policy' },
  render: (args) => {
    const surface = document.createElement('div');
    surface.style.cssText = 'background:var(--xe-color-surface-inverse, #111);padding:24px;border-radius:8px;display:inline-block;';
    surface.append(hyperlink(args));
    return stage(surface);
  },
};

// "Multiple hyperlinks as they commonly appear in a list, such as a footer legal row."
export const LinkList = {
  render: () => {
    const list = document.createElement('div');
    list.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
    list.append(
      hyperlink({ label: 'Careers' }),
      hyperlink({ label: 'Community' }),
      hyperlink({ label: 'Corporate Governance' }),
      hyperlink({ label: 'Filings & Regulations', trailingIcon: true }),
    );
    return stage(list);
  },
};

// Project example (not a DS story): a long link inside body copy wraps with the sentence
export const InBodyText = {
  render: () => {
    const p = document.createElement('p');
    p.style.cssText = 'max-width:360px;line-height:1.5;margin:0;';
    p.append(
      'Before you move, ',
      hyperlink({
        label: 'review the start, stop and transfer service checklist', trailingIcon: true, linkType: 'internal',
      }),
      ' so your account is ready on moving day.',
    );
    return stage(p);
  },
};
