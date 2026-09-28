/*
 * Lightweight stand-in for scripts/aem.js, used by Storybook and Vitest.
 * Add a stub here whenever a block imports something new from scripts/aem.js.
 */

export function toClassName(name) {
  return typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : '';
}

export function toCamelCase(name) {
  return toClassName(name).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

export function readBlockConfig(block) {
  const config = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    const [key, value] = row.children;
    if (key && value) config[toClassName(key.textContent)] = value.textContent.trim();
  });
  return config;
}

export function createOptimizedPicture(src, alt = '') {
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  picture.append(img);
  return picture;
}

// Reads <meta> tags like the real getMetadata
export function getMetadata(name, doc = document) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  return [...doc.head.querySelectorAll(`meta[${attr}="${name}"]`)]
    .map((m) => m.content)
    .join(', ');
}

export function buildBlock(blockName, content) {
  const block = document.createElement('div');
  block.classList.add(blockName);
  [content].flat().forEach((row) => {
    const rowEl = document.createElement('div');
    const cell = document.createElement('div');
    cell.append(row);
    rowEl.append(cell);
    block.append(rowEl);
  });
  return block;
}

export function loadCSS() {
  return Promise.resolve();
}

export function loadScript() {
  return Promise.resolve();
}

export function decorateIcons() {}

export function sampleRUM() {}
