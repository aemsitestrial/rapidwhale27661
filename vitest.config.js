// eslint-plugin-import cannot resolve package "exports" subpaths
// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';
import aliases from './test/mocks/aliases.js';

export default defineConfig({
  resolve: {
    alias: aliases,
  },
  test: {
    environment: 'happy-dom',
    include: ['blocks/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['blocks/**/*.js', 'scripts/components/**/*.js'],
      exclude: ['blocks/**/*.stories.js', 'blocks/**/*.test.js'],
    },
  },
});
