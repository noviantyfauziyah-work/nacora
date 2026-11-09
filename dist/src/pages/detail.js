import {
  escapeHtml,
  TARGET_COLOR_HEX,
  resolveBookletGroupName,
} from '../data-store.js';
import { formatNumberId, filterCombinations } from '../engine/recommend.js';
import {
  EXTENSION_PROCESSES,
  getMaterialExtensionStatus,
} from '../engine/process-extensions.js';
import { getCalibratedMaterialHex } from '../engine/color-science.js';
import { renderCombinationCard } from './mix.js';

export function renderReferencesList(refCodes, refMap) {
  if (!Array.isArray(refCodes) || refCodes.length === 0) return '';
  const items = refCodes
    .map((code) => {
      const refObj = refMap?.get(code);
      const title = refObj ? refObj.title : code;
      const url = refObj?.url && refObj.url.startsWith('http') ? refObj.url : null;
      return `
        <li>
          <strong>[${escapeHtml(code)}]</strong> ${escapeHtml(title)}
          ${
            url
              ? ` — <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="no-print">Buka tautan ↗</a>`
              : ''
          }
        </li>
      `;
    })
    .join('');

  return `<ul class="ref-list">${items}</ul>`;
}

export function renderDetailPage(data, materialId) {
  const { materials, booklet, categoryMap, refMap, combinations } = data;
  const material = materials.find((m) => m.id === materialId);

  if (!material) {
    return `
      <div class="page-header">
        <h1 class="page-title">Bahan Tidak Ditemukan</h1>
        <p class="page-subtitle">Bahan dengan kode "${escapeHtml(materialId)}" tidak ditemukan pada basis data.</p>
      </div>
      <div class="card">
        <a href="#/rekomendasi" class="btn btn-primary">Ke Color Recommendation</a>
      </div>
    `;
  }

  const bookletGroup = resolveBookletGroupName(material.group, booklet);
  const bookletHref = bookletGroup
    ? `#/booklet/${encodeURIComponent(bookletGroup)}`
    : '#/booklet';

  const calibratedHex = material.hex ? getCalibratedMaterialHex(material) : null;
  const swatchStyle = calibratedHex
    ? `background-color: ${escapeHtml(calibratedHex)};`
    : 'background-color: #F3F4F6;';
  const swatchContent = calibratedHex ? escapeHtml(calibratedHex) : '—';

  const colorChips = (material.colors || [])
    .map((c) => {
      const dotHex = TARGET_COLOR_HEX[c] || '#CCCCCC';
      return `
        <span class="chip">
          <span class="chip-color-dot" style="background-color: ${escapeHtml(dotHex)};" aria-hidden="true"></span>
          Warna: ${escapeHtml(c)}
        </span>
      `;
    })
    .join('');

  // Susun baris tabel data teknis (hanya baris yang terisi — Bagian 8.2 & 4.2)
  const techRows = [];
  if (material.form) {
    techRows.push(['Bentuk', escapeHtml(material.form)]);
  }
  if (material.solubility) {
    techRows.push(['Kelarutan', escapeHtml(material.solubility)]);
  }
  const phMin = material.ph?.min ?? null;
  const phMax = material.ph?.max ?? null;
  if (phMin !== null || phMax !== null) {
    let phStr = '';
    if (phMin !== null && phMax !== null) {
      phStr = `${formatNumberId(phMin)} – ${formatNumberId(phMax)}`;
    } else if (phMin !== null) {
      phStr = `≥ ${formatNumberId(phMin)}`;
    } else {
      phStr = `≤ ${formatNumberId(phMax)}`;
    }
    techRows.push(['Rentang pH', escapeHtml(phStr)]);
  }
  if (material.heat) {
    techRows.push(['Stabilitas Panas', escapeHtml(material.heat)]);
  }
  if (material.light) {
    techRows.push(['Stabilitas Cahaya', escapeHtml(material.light)]);
  }
  if (Array.isArray(material.processes) && material.processes.length > 0) {
    techRows.push([
      'Proses yang Cocok',
      material.processes.map((p) => escapeHtml(p)).join(' · '),
    ]);
  }
  const granulationProfile = getMaterialExtensionStatus(material.id, 'Granulasi');
  if (EXTENSION_PROCESSES.length > 0) {
    const extItemsHtml = EXTENSION_PROCESSES.map((extProc) => {
      const extInfo = getMaterialExtensionStatus(material.id, extProc.value);
      const statusText = extInfo ? extInfo.status : 'Unknown';
      const detailNote =
        extInfo?.evidence ||
        (statusText === 'Unknown'
          ? 'Data kompatibilitas granulasi belum tersedia'
          : statusText);
      return `<div><strong>${escapeHtml(extProc.label)}:</strong> <span class="chip">${escapeHtml(statusText)}</span> — ${escapeHtml(detailNote)}</div>`;
    }).join('');
    techRows.push(['Kompatibilitas Proses Tambahan', extItemsHtml]);
  }
  if (Array.isArray(material.categories) && material.categories.length > 0) {
    const catListHtml = material.categories
      .map((code) => {
        const cObj = categoryMap.get(code);
        return cObj
          ? `<div><strong>${escapeHtml(code)}</strong> — ${escapeHtml(cObj.name)}</div>`
          : `<div>${escapeHtml(code)}</div>`;
      })
      .join('');
    techRows.push(['Kategori Pangan', catListHtml]);
  }
  if (material.packaging) {
    techRows.push(['Kemasan', escapeHtml(material.packaging)]);
  }
  if (material.storage) {
    techRows.push(['Penyimpanan', escapeHtml(material.storage)]);
  }
  if (material.dosage) {
    techRows.push(['Dosis Acuan', escapeHtml(material.dosage)]);
  }

  // Susun baris Evaluasi Laboratorium (hanya bagian yang terisi — Bagian 8.2)
  const evalRows = [];
  const ev = material.evaluation || {};
  if (ev.baseColor) evalRows.push(['Warna Dasar', ev.baseColor]);
  if (ev.concentration)
    evalRows.push(['Perubahan Warna per Konsentrasi', ev.concentration]);
  if (ev.physical) evalRows.push(['Sifat Fisik', ev.physical]);
  if (ev.phNote) evalRows.push(['Sifat pH', ev.phNote]);
  if (ev.notes) evalRows.push(['Catatan Evaluasi', ev.notes]);

  const photos = Array.isArray(material.photos) ? material.photos : [];
  const photoBase = data.photoBasePath || './foto';
  const altText = `Foto larutan ${material.name}`;

  // Hingga lima kombinasi teratas yang memuat bahan ini (Bagian 8.2)
  const allRelatedCombos = filterCombinations(combinations, {
    materials,
    materialId: material.id,
  });
  const top5Combos = allRelatedCombos.slice(0, 5);

  return `
    <div class="no-print" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px;">
      <button type="button" id="btn-detail-back" class="btn btn-secondary btn-sm">
        ← Kembali
      </button>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <a href="${escapeHtml(bookletHref)}" class="btn btn-secondary btn-sm">
          Materi Booklet: ${escapeHtml(bookletGroup || material.group)}
        </a>
        <button type="button" id="btn-detail-print" class="btn btn-secondary btn-sm">
          Cetak / PDF
        </button>
      </div>
    </div>

    <!-- Header Detail Bahan -->
    <section class="card detail-header-card">
      <div class="detail-header-top">
        <div
          class="swatch-box-lg"
          style="${swatchStyle}; color: #FFFFFF; text-shadow: 0 1px 2px rgba(0,0,0,0.45);"
          title="${escapeHtml(material.hex || material.name)}"
        >
          ${swatchContent}
        </div>
        <div style="flex: 1;">
          <div style="font-size: 0.875rem; font-weight: 700; color: var(--color-primary); margin-bottom: 2px;">
            ${escapeHtml(material.id)}
          </div>
          <h1 class="page-title" style="margin-bottom: 10px;">${escapeHtml(material.name)}</h1>
          <div class="result-card-chips">
            <a href="${escapeHtml(bookletHref)}" class="chip" title="Buka halaman kelompok di Color Learning Booklet">
              <strong>Kelompok Pigmen:</strong> ${escapeHtml(material.group)} ↗
            </a>
            ${colorChips}
            ${
              material.source
                ? `<span class="chip"><strong>Sumber:</strong> ${escapeHtml(material.source)}</span>`
                : ''
            }
            ${
              material.animal
                ? `<span class="chip chip-animal"><span aria-hidden="true">▲</span> Bahan hewani</span>`
                : ''
            }
          </div>
        </div>
      </div>
    </section>

    <!-- Tabel Data Teknis -->
    ${
      techRows.length > 0
        ? `
      <section class="card detail-section">
        <h2 class="detail-section-title">Data Teknis</h2>
        <table class="clean-table">
          <tbody>
            ${techRows
              .map(
                ([label, valHtml]) => `
              <tr>
                <th scope="row">${escapeHtml(label)}</th>
                <td>${valHtml}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </section>
    `
        : ''
    }

    <!-- Profil Kompatibilitas Proses Granulasi (Ekstensi Teknis) -->
    ${
      granulationProfile && granulationProfile.recommendedMethod
        ? `
      <section class="card detail-section" id="sec-profil-granulasi">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
          <h2 class="detail-section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">
            Profil Kompatibilitas Proses Granulasi (Ekstensi Teknis)
          </h2>
          <span class="status-badge ${
            granulationProfile.status === 'Compatible'
              ? 'status-ok'
              : granulationProfile.status === 'Incompatible'
                ? 'status-err'
                : 'status-warn'
          }">
            <span aria-hidden="true">${
              granulationProfile.status === 'Compatible'
                ? '✓'
                : granulationProfile.status === 'Incompatible'
                  ? '✕'
                  : '▲'
            }</span>
            Granulasi: ${escapeHtml(granulationProfile.status)}
          </span>
        </div>
        <table class="clean-table">
          <tbody>
            <tr>
              <th scope="row">Status Kompatibilitas</th>
              <td><strong>${escapeHtml(granulationProfile.status)}</strong></td>
            </tr>
            <tr>
              <th scope="row">Metode Granulasi yang Disarankan</th>
              <td>${escapeHtml(granulationProfile.recommendedMethod)}</td>
            </tr>
            ${
              granulationProfile.maxProductTemp
                ? `
              <tr>
                <th scope="row">Batas Suhu Produk &amp; Pengeringan</th>
                <td>${escapeHtml(granulationProfile.maxProductTemp)}</td>
              </tr>
            `
                : ''
            }
            ${
              granulationProfile.moistureAwLimit
                ? `
              <tr>
                <th scope="row">Sensitivitas Kelembapan (a_w) &amp; Oksidasi</th>
                <td>${escapeHtml(granulationProfile.moistureAwLimit)}</td>
              </tr>
            `
                : ''
            }
            ${
              granulationProfile.binderAndMatrix
                ? `
              <tr>
                <th scope="row">Sistem Pengikat (Binder) &amp; Matriks</th>
                <td>${escapeHtml(granulationProfile.binderAndMatrix)}</td>
              </tr>
            `
                : ''
            }
            ${
              granulationProfile.specklingRisk
                ? `
              <tr>
                <th scope="row">Risiko Bercak Warna (Speckling / Mottling)</th>
                <td>${escapeHtml(granulationProfile.specklingRisk)}</td>
              </tr>
            `
                : ''
            }
            ${
              granulationProfile.evidence
                ? `
              <tr>
                <th scope="row">Mekanisme Stabilitas &amp; Catatan R&amp;D</th>
                <td>${escapeHtml(granulationProfile.evidence)}</td>
              </tr>
            `
                : ''
            }
          </tbody>
        </table>
      </section>
    `
        : ''
    }

    <!-- Kelebihan dan Keterbatasan & Tips -->
    ${
      material.pros || material.cons
        ? `
      <section class="card detail-section">
        <h2 class="detail-section-title">Kelebihan serta Keterbatasan &amp; Tips</h2>
        <div class="pros-cons-grid">
          ${
            material.pros
              ? `
            <div class="pros-box">
              <h3 style="font-size: 1rem; color: var(--status-ok); margin-bottom: 8px;">
                <span aria-hidden="true">✓</span> Kelebihan
              </h3>
              <p style="margin: 0; white-space: pre-line;">${escapeHtml(material.pros)}</p>
            </div>
          `
              : ''
          }
          ${
            material.cons
              ? `
            <div class="cons-box">
              <h3 style="font-size: 1rem; color: var(--status-warn); margin-bottom: 8px;">
                <span aria-hidden="true">▲</span> Keterbatasan &amp; Tips
              </h3>
              <p style="margin: 0; white-space: pre-line;">${escapeHtml(material.cons)}</p>
            </div>
          `
              : ''
          }
        </div>
      </section>
    `
        : ''
    }

    <!-- Evaluasi Laboratorium -->
    ${
      evalRows.length > 0
        ? `
      <section class="card detail-section">
        <h2 class="detail-section-title">Evaluasi Laboratorium</h2>
        <table class="clean-table">
          <tbody>
            ${evalRows
              .map(
                ([label, val]) => `
              <tr>
                <th scope="row">${escapeHtml(label)}</th>
                <td style="white-space: pre-line;">${escapeHtml(val)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </section>
    `
        : ''
    }

    <!-- Galeri Foto (Hanya tampil bila bahan memiliki foto — Bagian 8.2 & 11.4) -->
    ${
      photos.length > 0
        ? `
      <section class="card detail-section">
        <h2 class="detail-section-title">Galeri Foto Larutan</h2>
        <div class="photo-gallery-grid">
          ${photos
            .map(
              (photoFile, idx) => `
            <button
              type="button"
              class="photo-thumb-btn"
              data-lightbox-src="${escapeHtml(photoBase)}/${escapeHtml(photoFile)}"
              data-lightbox-alt="${escapeHtml(altText)}"
              data-lightbox-caption="${escapeHtml(`${material.name} (${photoFile})`)}"
              aria-label="Perbesar ${escapeHtml(altText)} (${idx + 1})"
            >
              <img
                src="${escapeHtml(photoBase)}/${escapeHtml(photoFile)}"
                alt="${escapeHtml(altText)}"
                loading="lazy"
                class="photo-thumb-img"
              />
              <span class="photo-thumb-caption">
                <span>${escapeHtml(photoFile)}</span>
                <span class="no-print">Perbesar ⤢</span>
              </span>
            </button>
          `
            )
            .join('')}
        </div>
      </section>
    `
        : ''
    }

    <!-- Daftar Rujukan -->
    ${
      Array.isArray(material.refs) && material.refs.length > 0
        ? `
      <section class="card detail-section">
        <h2 class="detail-section-title">Daftar Rujukan</h2>
        ${renderReferencesList(material.refs, refMap)}
      </section>
    `
        : ''
    }

    <!-- Hingga Lima Kombinasi Teratas (Bagian 8.2) -->
    ${
      top5Combos.length > 0
        ? `
      <section class="card detail-section">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid var(--color-border);">
          <h2 style="font-size: 1.25rem; margin: 0;">
            Kombinasi Warna Teratas (${top5Combos.length} dari ${allRelatedCombos.length} kombinasi)
          </h2>
          <a href="#/mix?bahan=${encodeURIComponent(material.id)}" class="btn btn-secondary btn-sm no-print">
            Lihat Semua di Explore Color Mix →
          </a>
        </div>
        <div class="results-cards-stack">
          ${top5Combos.map((c) => renderCombinationCard(c)).join('')}
        </div>
      </section>
    `
        : ''
    }

    <!-- Lightbox Modal -->
    <div id="photo-lightbox" class="lightbox-backdrop no-print" role="dialog" aria-modal="true" aria-label="Tampilan foto diperbesar" hidden>
      <div class="lightbox-content">
        <div class="lightbox-header">
          <strong id="lightbox-caption-text"></strong>
          <button type="button" id="btn-close-lightbox" class="btn btn-secondary btn-sm">Tutup ✕</button>
        </div>
        <img id="lightbox-main-img" src="" alt="" class="lightbox-img" />
      </div>
    </div>
  `;
}

export function attachDetailPageEvents() {
  const backBtn = document.getElementById('btn-detail-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.hash = '#/rekomendasi';
      }
    });
  }

  const printBtn = document.getElementById('btn-detail-print');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const lightbox = document.getElementById('photo-lightbox');
  const lightboxImg = document.getElementById('lightbox-main-img');
  const lightboxCaption = document.getElementById('lightbox-caption-text');
  const closeBtn = document.getElementById('btn-close-lightbox');

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    if (lightboxImg) lightboxImg.src = '';
  }

  document.querySelectorAll('.photo-thumb-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!lightbox || !lightboxImg) return;
      const src = btn.getAttribute('data-lightbox-src') || '';
      const alt = btn.getAttribute('data-lightbox-alt') || '';
      const caption = btn.getAttribute('data-lightbox-caption') || alt;
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      if (lightboxCaption) lightboxCaption.textContent = caption;
      lightbox.hidden = false;
      if (closeBtn) closeBtn.focus();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) {
      closeLightbox();
    }
  });
}

