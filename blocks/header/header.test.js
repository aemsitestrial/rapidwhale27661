import {
  describe, it, expect, beforeAll, beforeEach, vi,
} from 'vitest';
import { loadFragment } from '../fragment/fragment.js';

vi.mock('../fragment/fragment.js', () => ({ loadFragment: vi.fn() }));
vi.mock('./renderAuthCombine.js', () => ({ default: vi.fn() }));
vi.mock('./renderAuthDropdown.js', () => ({ renderAuthDropdown: vi.fn() }));

// A decorated nav page (what loadFragment returns): one section per child
function navPage(...sections) {
  const main = document.createElement('main');
  sections.forEach((html) => {
    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = html;
    main.append(section);
  });
  return main;
}

const XE_NAVBAR_SECTION = `
  <div class="xe-navbar-wrapper">
    <div class="xe-navbar block" data-block-status="loaded"><xe-navbar></xe-navbar></div>
  </div>`;

function renderHeader() {
  const header = document.createElement('header');
  const block = document.createElement('div');
  block.className = 'header block';
  header.append(block);
  document.body.append(header);
  return { header, block };
}

let decorate;

// header.js inserts its overlay into the page's <header> when the module loads
beforeAll(async () => {
  document.body.append(document.createElement('header'));
  ({ default: decorate } = await import('./header.js'));
});

beforeEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  loadFragment.mockReset();
});

describe('header block', () => {
  it('loads the nav page from /xe-navbar by default', async () => {
    loadFragment.mockResolvedValue(navPage(XE_NAVBAR_SECTION));
    const { block } = renderHeader();
    await decorate(block);
    expect(loadFragment).toHaveBeenCalledWith('/xe-navbar');
  });

  it('loads the nav page set in the page\'s "nav" metadata', async () => {
    document.head.innerHTML = '<meta name="nav" content="/nav-landing">';
    loadFragment.mockResolvedValue(navPage(XE_NAVBAR_SECTION));
    const { block } = renderHeader();
    await decorate(block);
    expect(loadFragment).toHaveBeenCalledWith('/nav-landing');
  });

  describe('XE Navbar header', () => {
    it('renders the XE Navbar block from the nav page as the whole header', async () => {
      loadFragment.mockResolvedValue(navPage('<p>Other content</p>', XE_NAVBAR_SECTION));
      const { header, block } = renderHeader();
      await decorate(block);
      expect(block.children).toHaveLength(1);
      expect(block.firstElementChild.classList.contains('xe-navbar')).toBe(true);
      expect(block.querySelector('xe-navbar')).not.toBeNull();
      expect(block.querySelector('nav#nav')).toBeNull();
      expect(block.textContent).not.toContain('Other content');
      expect(header.classList.contains('header-xe-navbar')).toBe(true);
    });

    it('works with a nav page that has only the XE Navbar section', async () => {
      loadFragment.mockResolvedValue(navPage(XE_NAVBAR_SECTION));
      const { block } = renderHeader();
      await expect(decorate(block)).resolves.toBeUndefined();
      expect(block.querySelector('xe-navbar')).not.toBeNull();
    });
  });

  describe('no layout shift while the navbar settles (build-log I-24)', () => {
    it('keeps the reserved height until the navbar has had two frames to lay itself out', async () => {
      const frames = [];
      const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        frames.push(cb);
        return frames.length;
      });
      loadFragment.mockResolvedValue(navPage(XE_NAVBAR_SECTION));
      const { header, block } = renderHeader();

      const done = decorate(block);
      await vi.waitFor(() => expect(block.querySelector('xe-navbar')).not.toBeNull());
      // Navbar is in place but the header still uses its reserved height (no class yet)
      expect(header.classList.contains('header-xe-navbar')).toBe(false);

      frames.shift()();
      expect(header.classList.contains('header-xe-navbar')).toBe(false);
      frames.shift()();
      await done;
      expect(header.classList.contains('header-xe-navbar')).toBe(true);
      raf.mockRestore();
    });
  });

  describe('missing or incomplete nav page', () => {
    it('leaves the header empty instead of crashing when the nav page is missing', async () => {
      loadFragment.mockResolvedValue(null);
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { header, block } = renderHeader();
      await expect(decorate(block)).resolves.toBeUndefined();
      expect(block.children).toHaveLength(0);
      expect(header.classList.contains('header-xe-navbar')).toBe(false);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"/xe-navbar" is missing'));
      warn.mockRestore();
    });

    it('leaves the header empty when a legacy nav page has fewer than 4 sections', async () => {
      loadFragment.mockResolvedValue(navPage('<p>Button</p>', '<ul><li>A</li></ul>', '<p>icon</p>'));
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { block } = renderHeader();
      await expect(decorate(block)).resolves.toBeUndefined();
      expect(block.children).toHaveLength(0);
      expect(warn).toHaveBeenCalledTimes(1);
      warn.mockRestore();
    });
  });
});
