/*
 * Lightweight stand-in for scripts/scripts.js, used by Storybook and Vitest so blocks can be
 * loaded without the Commerce drop-ins and page bootstrapping the real file pulls in.
 * Add a stub here whenever a block imports something new from scripts/scripts.js.
 */

// Attribute `name` (not `nodeName`, as in scripts.js): happy-dom returns an empty nodeName.
export function moveAttributes(from, to, attributes) {
  const names = attributes || [...from.attributes].map(({ name }) => name);
  names.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ name }) => name)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

export function rootLink(link) {
  return link;
}

export function getAllMetadata() {
  return {};
}

export function decorateMain() {}

export async function fetchIndex() {
  return { data: [] };
}

export function getConsent() {
  return true;
}
