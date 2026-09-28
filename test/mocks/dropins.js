/*
 * Stand-in for the Commerce drop-ins (@dropins/*), which the site loads through an import map.
 * Used by Vitest/Storybook so blocks that import them (e.g. header) can be loaded in isolation.
 * Add an export here whenever a tested block imports something new from @dropins.
 */

export const events = {
  on: () => ({ off: () => {} }),
  emit: () => {},
  lastPayload: () => null,
};

export function publishShoppingCartViewEvent() {}
