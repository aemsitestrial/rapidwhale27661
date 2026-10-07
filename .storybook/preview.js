import '../styles/styles.css';
// Site-level icon registration, as on the live site
import '../scripts/icons.js';

/** @type { import('@storybook/html').Preview } */
const preview = {
  parameters: {
    a11y: {
      // axe-core configuration — add project-specific rule overrides here
      config: {
        rules: [],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
