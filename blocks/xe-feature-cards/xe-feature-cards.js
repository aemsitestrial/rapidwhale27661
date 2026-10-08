import '../../scripts/components/xe-feature-cards.js';
import '../../scripts/components/xe-card.js';
import '../../scripts/components/xe-action-link.js';
import '../../scripts/icons.js';
import { isIconRegistered } from '../../scripts/components/xe-icon.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * xe-feature-cards — renders authored content with <xe-feature-cards> and <xe-card>.
 *
 * Authored structure (container block):
 *   Parent fields — single-cell rows: heading, subheading (band title and body copy)
 *   Child items   — one multi-cell row per XE Feature Card, fields in alphabetical order:
 *                   body, ctaLabel, ctaLink, ctaType, decorative, icon, title, variant
 * Universal Editor skips empty item fields, so cells are detected by content: picture →
 * decorative, link → ctaLink, prefixed select values (cta-, icon-, variant-) → options. The
 * remaining text cells are body / ctaLabel / title, and title (required) is always the last.
 * The design system allows 2–3 cards; extra items are not rendered.
 */

const MAX_CARDS = 3;
const OPTION = /^(cta|icon|variant)-(.+)$/;
const LINK_TYPES = ['internal', 'external', 'download'];
const hasBlocks = (cell) => !!cell.querySelector('p, ul, ol, h1, h2, h3, h4, h5, h6');
const isUrl = (text) => text.startsWith('/') || text.startsWith('#') || /^https?:\/\//.test(text);

function readCard(cells) {
  const card = { options: {}, texts: [] };
  cells.forEach((cell) => {
    const text = cell.textContent.trim();
    const option = text.match(OPTION);
    const picture = cell.querySelector('picture') || cell.querySelector('img');
    const link = cell.querySelector('a');
    if (picture) {
      card.decorative = picture;
    } else if (link) {
      card.href = link.getAttribute('href');
    } else if (option) {
      [, , card.options[option[1]]] = option;
    } else if (text && isUrl(text) && !card.href) {
      card.href = text;
    } else if (text) {
      card.texts.push(cell);
    }
  });

  // title is the last text field alphabetically and required
  const titleCell = card.texts.pop();
  card.title = titleCell?.textContent.trim() || '';
  if (card.texts.length === 2) {
    [card.bodyCell, card.labelCell] = card.texts;
  } else if (card.texts.length === 1) {
    const [cell] = card.texts;
    card[hasBlocks(cell) ? 'bodyCell' : 'labelCell'] = cell;
  }
  return card;
}

function buildCard(data, titleTag) {
  const card = document.createElement('xe-card');
  card.setAttribute('variant', data.options.variant === 'primary-variant' ? 'primary-variant' : 'surface');
  card.setAttribute('treatment', 'filled');
  card.setAttribute('interactive', 'true');
  card.setAttribute('actions-placement', 'inline');

  const iconName = data.options.icon;
  if (isIconRegistered(iconName)) {
    const icon = document.createElement('xe-icon');
    icon.slot = 'icon';
    icon.setAttribute('icon', iconName);
    icon.setAttribute('size', 'xl');
    card.append(icon);
  }

  const title = document.createElement(titleTag);
  title.slot = 'title';
  title.textContent = data.title;
  card.append(title);

  if (data.bodyCell) {
    // Body copy goes in the default slot as the author's own paragraphs
    if (hasBlocks(data.bodyCell)) {
      card.append(...data.bodyCell.children);
    } else {
      const p = document.createElement('p');
      p.textContent = data.bodyCell.textContent.trim();
      card.append(p);
    }
  }

  const link = document.createElement('xe-action-link');
  link.slot = 'actions';
  link.setAttribute('href', data.href);
  const type = data.options.cta;
  if (LINK_TYPES.includes(type) && type !== 'internal') link.setAttribute('link-type', type);
  link.textContent = data.labelCell?.textContent.trim() || 'Learn More';
  card.append(link);

  if (data.decorative) {
    data.decorative.slot = 'decorative';
    const img = data.decorative.querySelector('img') || data.decorative;
    img.alt = ''; // decorative only
    card.append(data.decorative);
  }
  return card;
}

export default function decorate(block) {
  const band = document.createElement('xe-feature-cards');
  const headerTexts = [];
  const items = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length === 1) {
      const text = cells[0].textContent.trim();
      if (text) headerTexts.push(text);
      return;
    }
    const data = readCard(cells);
    if (data.title && data.href) items.push({ row, data });
  });

  const [heading = '', subheading = ''] = headerTexts;
  if (heading) band.setAttribute('heading', heading);
  if (subheading) band.setAttribute('subheading', subheading);

  const cards = items.slice(0, MAX_CARDS);
  band.setAttribute('columns', String(Math.min(Math.max(cards.length, 2), 3)));
  band.setAttribute('mobile-layout', 'carousel');
  band.setAttribute('header-align', 'left');
  band.setAttribute('background', 'default');

  // Band title renders as <h2>; card titles sit one level below it
  const titleTag = heading ? 'h3' : 'h2';
  cards.forEach(({ row, data }) => {
    const card = buildCard(data, titleTag);
    moveInstrumentation(row, card);
    band.append(card);
  });

  block.replaceChildren(band);
}
