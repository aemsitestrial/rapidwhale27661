import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * xcel-gallery — heading + repeatable image/caption items.
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  const heading = document.createElement('h2');
  heading.className = 'xcel-gallery-heading';

  const grid = document.createElement('ul');
  grid.className = 'xcel-gallery-grid';

  rows.forEach((row) => {
    const cells = [...row.children];

    // Heading row: single cell, no image.
    if (cells.length === 1 && !row.querySelector('picture')) {
      const text = (cells[0]?.textContent || '').trim();
      if (text) heading.textContent = text;
      return;
    }

    let pictureHTML = '';
    let caption = '';

    cells.forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture) {
        pictureHTML = picture.outerHTML;
        return;
      }
      const text = (cell.textContent || '').trim();
      if (text) caption = text;
    });

    if (!pictureHTML) return;

    const li = document.createElement('li');
    li.className = 'xcel-gallery-item';
    moveInstrumentation(row, li);

    li.innerHTML = `
      ${pictureHTML}
      ${caption ? `<p class="xcel-gallery-caption">${caption}</p>` : ''}
    `;

    grid.append(li);
  });

  if (heading.textContent) block.append(heading);
  block.append(grid);
}
