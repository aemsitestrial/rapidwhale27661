import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * xcel-faq — heading + repeatable question/answer items, rendered as native <details> accordion.
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  const heading = document.createElement('h2');
  heading.className = 'xcel-faq-heading';

  const list = document.createElement('div');
  list.className = 'xcel-faq-list';

  rows.forEach((row) => {
    const cells = [...row.children];

    // Heading row: single cell.
    if (cells.length === 1) {
      const text = (cells[0]?.textContent || '').trim();
      if (text) heading.textContent = text;
      return;
    }

    const [questionCell, answerCell] = cells;
    const question = (questionCell?.textContent || '').trim();
    if (!question) return;

    const details = document.createElement('details');
    details.className = 'xcel-faq-item';
    moveInstrumentation(row, details);

    const summary = document.createElement('summary');
    summary.className = 'xcel-faq-question';
    summary.textContent = question;

    const answer = document.createElement('div');
    answer.className = 'xcel-faq-answer';
    answer.innerHTML = answerCell?.innerHTML || '';

    details.append(summary, answer);
    list.append(details);
  });

  if (heading.textContent) block.append(heading);
  block.append(list);
}
