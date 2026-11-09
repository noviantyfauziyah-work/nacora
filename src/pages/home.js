import { DISCLAIMER_TEXT } from '../data-store.js';

export function renderHomePage() {
  return `
    <section class="hero-section">
      <h1 class="hero-title">NACORA</h1>
      <p class="hero-lead">
        Cari kandidat pewarna alami untuk produk Anda, atau pelajari karakteristik tiap kelompok pewarna.
      </p>
    </section>

    <section class="home-grid" aria-label="Menu utama">
      <article class="card card-interactive home-card">
        <div>
          <h2 class="home-card-title">Color Recommendation</h2>
          <p class="home-card-desc">
            Cari kandidat pewarna alami berdasarkan karakteristik produk dan target warna.
          </p>
        </div>
        <div>
          <a href="#/rekomendasi" class="btn btn-primary">Mulai Color Recommendation</a>
        </div>
      </article>

      <article class="card card-interactive home-card">
        <div>
          <h2 class="home-card-title">Color Learning Booklet</h2>
          <p class="home-card-desc">
            Pelajari jenis pewarna alami, karakteristik, aplikasi, dan faktor yang memengaruhi stabilitasnya.
          </p>
        </div>
        <div>
          <a href="#/booklet" class="btn btn-secondary">Buka Color Learning Booklet</a>
        </div>
      </article>
    </section>

    <section class="card home-secondary-bar">
      <div>
        <h3 style="margin-bottom: 4px; font-size: 1.1rem;">Explore Color Mix</h3>
        <p style="margin-bottom: 0; font-size: 0.9375rem;">
          Eksplorasi pasangan kombinasi dua bahan pewarna alami untuk menghasilkan warna target lainnya.
        </p>
      </div>
      <a href="#/mix" class="btn btn-secondary btn-sm">Buka Explore Color Mix</a>
    </section>

    <div class="info-box" role="note" aria-label="Pernyataan batasan">
      ${DISCLAIMER_TEXT}
    </div>
  `;
}

