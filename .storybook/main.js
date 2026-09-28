import aliases from '../test/mocks/aliases.js';

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: ['../blocks/**/*.stories.js', '../scripts/components/**/*.stories.js'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  async viteFinal(viteConfig) {
    // Redirect AEM runtime imports to lightweight mocks so block code works in isolation
    const existing = viteConfig.resolve?.alias || [];
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: [
        ...(Array.isArray(existing)
          ? existing
          : Object.entries(existing).map(([find, replacement]) => ({ find, replacement }))),
        ...aliases,
      ],
    };
    return viteConfig;
  },
};

export default config;
