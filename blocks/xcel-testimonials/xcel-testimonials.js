import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * xcel-testimonials — heading + repeatable quote/author/photo items.
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  const heading = document.createElement('h2');
  heading.className = 'xcel-testimonials-heading';

  const list = document.createElement('ul');
  list.className = 'xcel-testimonials-list';

  rows.forEach((row) => {
    const cells = [...row.children];

    // Heading row: single cell, no picture/richtext content.
    if (cells.length === 1 && !row.querySelector('picture')) {
      const text = (cells[0]?.textContent || '').trim();
      if (text) heading.textContent = text;
      return;
    }

    let photoHTML = '';
    let quoteHTML = '';
    let authorName = '';

    cells.forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture) {
        photoHTML = picture.outerHTML;
        return;
      }
      if (cell.children.length > 0) {
        quoteHTML = cell.innerHTML;
        return;
      }
      const text = (cell.textContent || '').trim();
      if (text) authorName = text;
    });

    const li = document.createElement('li');
    li.className = 'xcel-testimonials-item';
    moveInstrumentation(row, li);

    li.innerHTML = `
      ${photoHTML ? `<div class="xcel-testimonials-photo">${photoHTML}</div>` : ''}
      <blockquote class="xcel-testimonials-quote">${quoteHTML}</blockquote>
      ${authorName ? `<p class="xcel-testimonials-author">${authorName}</p>` : ''}
    `;

    list.append(li);
  });

  if (heading.textContent) block.append(heading);
  block.append(list);
}
