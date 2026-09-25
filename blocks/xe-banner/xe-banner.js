import '../../scripts/components/xe-banner.js';
import '../../scripts/components/xe-button.js';
import { ICONS } from '../../scripts/components/xe-icon.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * xe-banner — renders authored content with the <xe-banner> web component family.
 * JCR alphabetical field order (matches model order):
 *   buttonLabel, buttonLink, heading, headingLevel, icon, message
 * Style options (size-*, bg-*, align-*, button-*) arrive as block classes.
 */

const DEFAULTS = {
  size: 'generous',
  bg: 'default',
  align: 'center',
  button: 'outlined',
};

function getOption(block, prefix) {
  const cls = [...block.classList].find((c) => c.startsWith(`${prefix}-`));
  return cls ? cls.slice(prefix.length + 1) : DEFAULTS[prefix];
}

export default function decorate(block) {
  const cells = [...block.children].map((row) => row.lastElementChild);
  const [labelCell, linkCell, headingCell, levelCell, iconCell, messageCell] = cells;
  const text = (cell) => cell?.textContent.trim() || '';

  const banner = document.createElement('xe-banner');
  banner.setAttribute('variant', 'message');
  banner.setAttribute('size', getOption(block, 'size'));
  banner.setAttribute('background', getOption(block, 'bg'));

  const column = document.createElement('xe-banner-column');
  column.setAttribute('expand', '');
  column.setAttribute('align', getOption(block, 'align'));
  column.setAttribute('heading-level', text(levelCell) || '2');
  banner.append(column);

  const iconName = text(iconCell);
  if (ICONS[iconName]) {
    const icon = document.createElement('xe-icon');
    icon.slot = 'icon';
    icon.setAttribute('icon', iconName);
    icon.setAttribute('size', 'lg');
    column.append(icon);
  }

  const headingText = text(headingCell);
  if (headingText) {
    const heading = document.createElement('span');
    heading.slot = 'heading';
    heading.textContent = headingText;
    if (headingCell) moveInstrumentation(headingCell, heading);
    column.append(heading);
  }

  if (text(messageCell)) {
    const message = document.createElement('div');
    message.slot = 'message';
    moveInstrumentation(messageCell, message);
    message.append(...messageCell.childNodes);
    column.append(message);
  }

  const link = linkCell?.querySelector('a');
  const href = link?.getAttribute('href') || text(linkCell);
  const label = text(labelCell) || text(link);
  if (href && label) {
    const button = document.createElement('xe-button');
    button.slot = 'action';
    button.setAttribute('variant', 'primary');
    button.setAttribute('treatment', getOption(block, 'button'));
    button.setAttribute('size', 'sm');
    button.setAttribute('href', href);
    button.append(label);

    const arrow = document.createElement('xe-icon');
    arrow.slot = 'trailing-icon';
    arrow.setAttribute('size', 'sm');
    arrow.setAttribute('icon', 'faArrowRight');
    button.append(arrow);
    column.append(button);
  }

  block.replaceChildren(banner);
}
