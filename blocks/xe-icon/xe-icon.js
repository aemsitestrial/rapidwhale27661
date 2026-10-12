/**
 * XE Icon <xe-icon icon="faArrowRight" size="md"></xe-icon>
 */
import { registerIcons } from '../../scripts/ignite/bundle/primitives/media/icon/xe-icon.js';
import * as allIcons from '../../scripts/ignite/icons/xe-icon-registry.js';
import { getBlockProps } from '../../scripts/utils/primitive.js';
 
registerIcons(allIcons);
 
// Key order matches the field (cell) order of the xe-icon model.
export const DEFAULTS = {
  icon: 'faArrowRight',
  size: 'md',
};
 
export function buildIcon(props = {}) {
  const xeIcon = document.createElement('xe-icon');
  const { icon, size } = { ...DEFAULTS, ...props };
  xeIcon.setAttribute('icon', String(icon));
  xeIcon.setAttribute('size', String(size).toLowerCase());
  return xeIcon;
}
 
export default function decorate(block, props = {}) {
  block.replaceChildren(buildIcon(getBlockProps(block, DEFAULTS, props)));
}