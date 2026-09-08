/* JCR alphabetical field order: heading, links */
export default function decorate(block) {
  const rows = [...block.children];
  const heading = rows[0]?.querySelector('div:last-child')?.textContent.trim() || '';
  const linksRow = rows[1];

  const links = [...(linksRow?.querySelectorAll('a') || [])].map((a) => {
    let type = 'default';
    if (a.parentElement.tagName === 'STRONG') type = 'primary';
    if (a.parentElement.tagName === 'EM') type = 'secondary';
    return { href: a.getAttribute('href') || '#', text: a.textContent.trim(), type };
  });

  block.innerHTML = `
    ${heading ? `<h2 class="xcel-link-list-heading">${heading}</h2>` : ''}
    <ul class="xcel-link-list-items">
      ${links.map((l) => `<li><a class="button${l.type !== 'default' ? ` ${l.type}` : ''}" href="${l.href}">${l.text}</a></li>`).join('')}
    </ul>
  `;
}
