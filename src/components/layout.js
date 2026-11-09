import { DISCLAIMER_TEXT } from '../data-store.js';

export function renderAppShell(activeRoute, contentHtml) {
  const isRec =
    activeRoute === '/rekomendasi' ||
    activeRoute.startsWith('/hasil') ||
    activeRoute.startsWith('/bahan/');
  const isBooklet = activeRoute.startsWith('/booklet');
  const isMix = activeRoute.startsWith('/mix');
  const isAbout = activeRoute === '/tentang';

  return `
    <div class="site-wrapper">
      <div class="header-accent-strip" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <header class="site-header">
        <div class="header-inner">
          <a href="#/" class="brand-link" aria-label="Beranda NACORA">
            <span class="brand-logo-text">NACORA</span>
            <span class="brand-subtitle">Natural Color Recommendation Assistant</span>
          </a>
          <nav class="site-nav" aria-label="Navigasi utama">
            <a href="#/rekomendasi" class="nav-link ${isRec ? 'active' : ''}">Color Recommendation</a>
            <a href="#/booklet" class="nav-link ${isBooklet ? 'active' : ''}">Color Learning Booklet</a>
            <a href="#/mix" class="nav-link ${isMix ? 'active' : ''}">Explore Color Mix</a>
            <a href="#/tentang" class="nav-link ${isAbout ? 'active' : ''}">Tentang</a>
          </nav>
        </div>
      </header>

      <main id="main-content" class="main-content" tabindex="-1">
        ${contentHtml}
      </main>

      <footer class="site-footer">
        <div class="footer-inner">
          <p class="disclaimer-text">${DISCLAIMER_TEXT}</p>
          <p class="footer-meta">NACORA · Basis Data R&amp;D Pewarna Alami (85 bahan · 1.450 kombinasi)</p>
        </div>
      </footer>
    </div>
  `;
}

