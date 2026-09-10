import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * xcel-link-list — heading + repeatable link items, each authored as a child block instance.
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  block.classList.add('xcel-link-list-column');

  const heading = document.createElement('h2');
  heading.className = 'xcel-link-list-column-heading';

  const list = document.createElement('ul');
  list.className = 'xcel-link-list-column-items';

  rows.forEach((row) => {
    const cells = [...row.children];

    // Heading row: single cell, no link.
    if (cells.length === 1 && !row.querySelector('a')) {
      const text = (cells[0]?.textContent || '').trim();
      if (text) heading.textContent = text;
      return;
    }

    // Link item row — detect fields by content type (xwalk skips empty fields so indices shift).
    let label = '';
    let href = '#';
    let style = '';

    cells.forEach((cell) => {
      const a = cell.querySelector('a');
      if (a) {
        href = a.getAttribute('href') || '#';
        return;
      }
      const text = (cell.textContent || '').trim();
      if (!text) return;
      if (text.startsWith('/') || /^https?:\/\//.test(text)) {
        href = text;
      } else if (['primary', 'secondary'].includes(text.toLowerCase())) {
        style = text.toLowerCase();
      } else if (!label) {
        label = text;
      }
    });

    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const link = document.createElement('a');
    link.className = `button${style ? ` ${style}` : ''}`;
    link.href = href;
    link.textContent = label;

    li.append(link);
    list.append(li);
  });

  if (heading.textContent) block.append(heading);
  block.append(list);
}
