import { DISCLAIMER_TEXT } from '../data-store.js';

export function renderAboutPage(data) {
  const materialCount = data?.materials?.length ?? 85;
  const comboCount = data?.combinations?.length ?? 1450;
  const bookletCount = data?.booklet?.length ?? 12;

  return `
    <div class="page-header">
      <h1 class="page-title">Tentang NACORA</h1>
      <p class="page-subtitle">
        Natural Color Recommendation Assistant — Alat bantu internal R&amp;D untuk eksplorasi kandidat pewarna alami.
      </p>
    </div>

    <div style="display: flex; flex-direction: column; gap: 24px;">
      <section class="card">
        <h2 style="font-size: 1.25rem; margin-bottom: 12px;">Cara Kerja</h2>
        <p>
          NACORA membantu formulator R&amp;D menyaring koleksi bahan pewarna alami perusahaan (${materialCount} bahan) berdasarkan karakteristik produk pangan yang sedang dikembangkan:
        </p>
        <ol style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px;">
          <li>
            <strong>Penyaringan Warna Mutlak:</strong> Hanya bahan yang memiliki <em>Target Color</em> pilihan Anda pada data bahan yang dievaluasi.
          </li>
          <li>
            <strong>Evaluasi Kriteria Teknis:</strong> Setiap bahan dievaluasi terhadap <strong>Kategori Pangan</strong> (klasifikasi BPOM), <strong>pH Produk</strong>, <strong>Proses Pengolahan</strong> (beserta stabilitas panas), dan <strong>Stabilitas Cahaya terhadap Kemasan</strong>. Kondisi penyimpanan ditampilkan sebagai informasi pendamping.
          </li>
          <li>
            <strong>Prinsip Data Kosong:</strong> Apabila suatu parameter pada basis data bahan belum terisi (kosong), kriteria tersebut dilewati dan tidak dihitung sebagai sesuai maupun tidak sesuai.
          </li>
          <li>
            <strong>Explore Color Mix &amp; Booklet:</strong> Selain bahan tunggal, Anda dapat menelusuri ${comboCount.toLocaleString('id-ID')} kombinasi dua bahan pewarna serta mempelajari ${bookletCount} topik pada <em>Color Learning Booklet</em>.
          </li>
        </ol>
      </section>

      <section class="card">
        <h2 style="font-size: 1.25rem; margin-bottom: 12px;">Arti Status dan Pengelompokan Hasil</h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <h3 style="font-size: 1rem; margin-bottom: 8px;">Status per Kriteria</h3>
            <ul class="criteria-list">
              <li class="criteria-item">
                <span class="status-badge status-ok"><span aria-hidden="true">✓</span> Sesuai</span>
                <span>Parameter produk berada di dalam rentang atau daftar yang disarankan untuk bahan tersebut.</span>
              </li>
              <li class="criteria-item">
                <span class="status-badge status-warn"><span aria-hidden="true">▲</span> Perlu perhatian</span>
                <span>Parameter berada sedikit di luar batas acuan (misalnya selisih pH ≤ 1,0), belum tercantum pada daftar kategori/proses lazim, atau peka cahaya pada kemasan transparan.</span>
              </li>
            </ul>
          </div>

          <div style="border-top: 1px solid var(--color-border); padding-top: 16px;">
            <h3 style="font-size: 1rem; margin-bottom: 8px;">Kelompok Kandidat</h3>
            <ul style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px;">
              <li>
                <strong>Sangat sesuai:</strong> Seluruh kriteria yang memiliki data berstatus <em>Sesuai</em> (tidak ada catatan <em>Perlu perhatian</em> maupun <em>Kurang sesuai</em>).
              </li>
              <li>
                <strong>Sesuai dengan catatan:</strong> Terdapat minimal satu kriteria berstatus <em>Perlu perhatian</em>, namun tidak ada kriteria <em>Kurang sesuai</em>.
              </li>
              <li>
                <strong>Bahan yang tersaring (tersembunyi secara bawaan):</strong> Bahan yang memiliki kriteria <em>Kurang sesuai</em> (selisih pH &gt; 1,0 di luar rentang bahan, atau stabilitas panas rendah pada proses pemanasan yang tidak tercantum). Tetap dapat dilihat melalui tautan pelipat di bawah daftar hasil.
              </li>
              <li>
                <strong>Process Compatibility Extension (Granulasi):</strong> Untuk proses tambahan yang informasinya terpisah dari database Excel utama (seperti <em>Granulasi</em>), setiap bahan memiliki salah satu dari tiga status: <code>Compatible</code> (memiliki bukti kompatibilitas), <code>Incompatible</code> (memiliki bukti ketidakcocokan), atau <code>Unknown</code> (data kompatibilitas granulasi belum tersedia). Bahan berstatus <code>Unknown</code> tidak ditampilkan sebagai rekomendasi yang telah terverifikasi pada grup <em>Sangat sesuai</em>, melainkan ditempatkan pada <em>Sesuai dengan catatan</em>.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="card">
        <h2 style="font-size: 1.25rem; margin-bottom: 12px;">Pernyataan Batasan</h2>
        <div class="info-box" style="margin-bottom: 16px;">
          ${DISCLAIMER_TEXT}
        </div>
        <p style="margin-bottom: 0; font-size: 0.9375rem; color: var(--color-muted);">
          <strong>Tanggal Data:</strong> 6 November 2026 · Sumber data: Evaluasi laboratorium internal &amp; rujukan literatur (85 bahan pewarna alami, 1.450 kombinasi warna, 16 kategori pangan BPOM level 1).
        </p>
      </section>
    </div>
  `;
}

