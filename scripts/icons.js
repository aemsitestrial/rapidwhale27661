/*
 * Site-level icon registration — the one place that decides which icons the site can use.
 * Ignite: "Icons must be registered before first use, typically at app entry."
 *
 * Imported once by every block that renders <xe-icon> (directly or through another xe-* component),
 * and by Storybook's preview. Adding an icon: export it from the icon definitions file and list it
 * below. The XE Banner / XE Feature Cards "Icon" selects only offer registered icons.
 *
 * Path A: definitions come from the Font Awesome Free stand-in (components/icons/fa-free.js).
 * Path B: swap these imports for '@ignite/web/utils/icon-resolver.js' and
 * '@fortawesome/pro-solid-svg-icons' / '@fortawesome/free-brands-svg-icons'.
 */

import { registerIcons } from './components/xe-icon.js';
import {
  faArrowDown, faArrowRight, faArrowUpRightFromSquare, faBars, faBolt, faChevronDown,
  faChevronRight, faDownload, faFileInvoiceDollar, faFire, faGear, faHeart, faInstagram, faLeaf,
  faLightbulb, faMagnifyingGlass, faPen, faPiggyBank, faPlus, faRocket, faSolarPanel,
  faSquareFacebook, faSquareLinkedin, faSquareXTwitter, faStar, faUser, faWrench, faXmark,
  faXTwitter, faYoutube,
} from './components/icons/fa-free.js';

registerIcons({
  // Ignite's registered set (Icon docs › All Registered Icons)
  faPlus,
  faDownload,
  faBolt,
  faArrowRight,
  faExternalLink: faArrowUpRightFromSquare, // Font Awesome's older name for the same icon
  faChevronRight,
  faChevronDown,
  faHeart,
  faUser,
  faLightbulb,
  faStar,
  faRocket,
  faFire,

  // Used by our components and blocks
  faArrowDown, // xe-action-link / xe-hyperlink "download"
  faArrowUpRightFromSquare, // xe-action-link / xe-hyperlink "external"
  faBars, // xe-navbar menu button
  faXmark, // xe-navbar drawer close
  faMagnifyingGlass, // search
  faFileInvoiceDollar,
  faLeaf,
  faPiggyBank,
  faSolarPanel,
  faWrench,
  faGear, // Icon Button docs examples (settings)
  faPen, // Icon Button docs examples (edit)

  // Footer social links (Font Awesome Free brands, per the Ignite Footer docs)
  faSquareFacebook,
  faXTwitter,
  faSquareXTwitter,
  faInstagram,
  faSquareLinkedin,
  faYoutube,
});
