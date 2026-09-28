import { fileURLToPath } from 'node:url';

/*
 * Shared by .storybook/main.js and vitest.config.js: redirect the AEM runtime imports blocks use
 * ('../../scripts/aem.js', '../../scripts/scripts.js') to the mocks in this folder.
 * Vite matches aliases against the import specifier as written, so these are regexes on the
 * specifier rather than resolved file paths.
 */
const mock = (file) => fileURLToPath(new URL(`./${file}`, import.meta.url));

export default [
  { find: /^(?:\.\.?\/)+scripts\/aem\.js$/, replacement: mock('aem.js') },
  { find: /^(?:\.\.?\/)+scripts\/scripts\.js$/, replacement: mock('scripts.js') },
  // Commerce drop-ins come from an import map on the site; stub them for tests
  { find: /^@dropins\/.+$/, replacement: mock('dropins.js') },
];
