import {
  escapeHtml,
  DISCLAIMER_TEXT,
  TARGET_COLOR_HEX,
  resolveBookletGroupName,
} from '../data-store.js';
import {
  getRecommendations,
  formatNumberId,
  parsePhValue,
  normalizeProcessInput,
} from '../engine/recommend.js';
import {
  isExtensionProcess,
  getExtensionProcessMeta,
} from '../engine/process-extensions.js';
import { getCalibratedMaterialHex } from '../engine/color-science.js';

function renderGranulationTechBlock(extProfile) {
  if (!extProfile || !extProfile.recommendedMethod) return '';
  const badgeClass =
    extProfile.status === 'Compatible'
      ? 'status-ok'
      : extProfile.status === 'Incompatible'
        ? 'status-err'
        : 'status-warn';
  const badgeIcon =
    extProfile.status === 'Compatible'
      ? '✓'
      : extProfile.status === 'Incompatible'
        ? '✕'
        : '▲';

  return `
    <div class="result-meta-block" style="background-color: var(--color-surface-subtle, #F9FAFB); border: 1px solid var(--color-border); border-radius: 8px; padding: 12px 14px; margin-top: 10px;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
        <strong style="font-size: 0.875rem; color: var(--color-heading);">Parameter Teknis Proses Granulasi</strong>
        <span class="status-badge ${badgeClass}" style="font-size: 0.75rem; padding: 2px 8px;">
          <span aria-hidden="true">${badgeIcon}</span> ${escapeHtml(extProfile.status)}
        </span>
      </div>
      <div style="display: grid; gap: 6px; font-size: 0.85rem;">
        <div><strong>Metode Disarankan:</strong> ${escapeHtml(extProfile.recommendedMethod)}</div>
        ${extProfile.maxProductTemp ? `<div><strong>Batas Suhu Produk:</strong> ${escapeHtml(extProfile.maxProductTemp)}</div>` : ''}
        ${extProfile.moistureAwLimit ? `<div><strong>Batas Kelembapan (a_w):</strong> ${escapeHtml(extProfile.moistureAwLimit)}</div>` : ''}
        ${extProfile.binderAndMatrix ? `<div><strong>Sistem Binder &amp; Matriks:</strong> ${escapeHtml(extProfile.binderAndMatrix)}</div>` : ''}
        ${extProfile.specklingRisk ? `<div><strong>Risiko Speckling / Mottling:</strong> ${escapeHtml(extProfile.specklingRisk)}</div>` : ''}
      </div>
    </div>
  `;
}

function renderSingleResultCard(evaluated, data) {
  const { material, criteria, extensionProfile } = evaluated;
  const { booklet, materialIdsInCombos } = data;

  const bookletGroup = resolveBookletGroupName(material.group, booklet);
  const bookletHref = bookletGroup
    ? `#/booklet/${encodeURIComponent(bookletGroup)}`
    : '#/booklet';

  const hasCombos = materialIdsInCombos.has(material.id);

  const calibratedHex = material.hex ? getCalibratedMaterialHex(material) : null;
  const swatchStyle = calibratedHex
    ? `background-color: ${escapeHtml(calibratedHex)};`
    : 'background-color: #F3F4F6;';
  const swatchContent = material.hex ? '' : '<span>—</span>';

  const colorChipsHtml = (material.colors || [])
    .map((c) => {
      const dotHex = TARGET_COLOR_HEX[c] || '#CCCCCC';
      return `
        <span class="chip">
          <span class="chip-color-dot" style="background-color: ${escapeHtml(dotHex)};" aria-hidden="true"></span>
          ${escapeHtml(c)}
        </span>
      `;
    })
    .join('');

  const animalChipHtml = material.animal
    ? `<span class="chip chip-animal"><span aria-hidden="true">▲</span> Bahan hewani</span>`
    : '';

  const criteriaHtml = criteria
    .map((crit) => {
      const isOk = crit.status === 'Sesuai';
      const iconClass = isOk ? 'ok' : 'warn';
      const statusText = crit.status;
      return `
        <li class="criteria-item">
          <span class="criteria-icon ${iconClass}" aria-hidden="true">${escapeHtml(crit.icon)}</span>
          <div>
            <strong>${escapeHtml(crit.label)} (${escapeHtml(statusText)}):</strong>
            <span>${escapeHtml(crit.reason)}</span>
          </div>
        </li>
      `;
    })
    .join('');

  const consId = `cons-${material.id}`;
  const isLongCons = material.cons && material.cons.length > 130;

  return `
    <article class="card result-card" data-material-id="${escapeHtml(material.id)}">
      <div class="result-card-top">
        <div class="swatch-box" style="${swatchStyle}" title="${escapeHtml(material.hex || material.name)}" aria-label="Swatch warna ${escapeHtml(material.name)}">
          ${swatchContent}
        </div>
        <div class="result-card-title-wrap">
          <h3 class="result-card-title">
            <a href="#/bahan/${encodeURIComponent(material.id)}">${escapeHtml(material.name)}</a>
          </h3>
          <div class="result-card-chips">
            <a href="${escapeHtml(bookletHref)}" class="chip" title="Pelajari kelompok pigmen di Booklet">
              ${escapeHtml(material.group)}
            </a>
            ${colorChipsHtml}
            ${animalChipHtml}
          </div>
        </div>
      </div>

      ${
        criteria.length > 0
          ? `
        <div class="result-criteria-box">
          <ul class="criteria-list" aria-label="Evaluasi kriteria ${escapeHtml(material.name)}">
            ${criteriaHtml}
          </ul>
        </div>
      `
          : ''
      }

      ${renderGranulationTechBlock(extensionProfile)}

      <div class="result-meta-block">
        ${
          material.cons
            ? `
          <div class="result-meta-row">
            <strong>Keterbatasan &amp; Tips:</strong>
            <p id="${escapeHtml(consId)}" class="${isLongCons ? 'cons-text-clamp' : ''}" style="margin: 4px 0 0 0;">
              ${escapeHtml(material.cons)}
            </p>
            ${
              isLongCons
                ? `<button type="button" class="cons-toggle-btn no-print" data-target="${escapeHtml(consId)}" aria-expanded="false">Selengkapnya</button>`
                : ''
            }
          </div>
        `
            : ''
        }

        ${
          material.dosage
            ? `
          <p class="result-meta-row">
            <strong>Dosis Acuan:</strong> ${escapeHtml(material.dosage)}
          </p>
        `
            : ''
        }

        ${
          material.storage
            ? `
          <p class="result-meta-row">
            <strong>Penyimpanan:</strong> ${escapeHtml(material.storage)}
          </p>
        `
            : ''
        }
      </div>

      <div class="result-card-actions no-print">
        <a href="#/bahan/${encodeURIComponent(material.id)}" class="btn btn-primary btn-sm">Lihat detail</a>
        ${
          hasCombos
            ? `<a href="#/mix?bahan=${encodeURIComponent(material.id)}" class="btn btn-secondary btn-sm">Explore Color Mix</a>`
            : ''
        }
      </div>
    </article>
  `;
}

export function renderResultsPage(data, queryParams) {
  const kat = queryParams.get('kat') || '';
  const proses = normalizeProcessInput(queryParams.get('proses') || '');
  const rawPh = queryParams.get('ph') || '';
  const phVal = parsePhValue(rawPh);
  const kemasan = queryParams.get('kemasan') || '';
  const simpan = queryParams.get('simpan') || '';
  const warna = queryParams.get('warna') || '';

  if (!kat || !proses || Number.isNaN(phVal) || !kemasan || !simpan || !warna) {
    return `
      <div class="page-header">
        <h1 class="page-title">Parameter Pencarian Belum Lengkap</h1>
        <p class="page-subtitle">Silakan lengkapi keenam karakteristik produk pada formulir Color Recommendation.</p>
      </div>
      <div class="card">
        <p>Beberapa parameter input tidak ditemukan atau tidak valid pada URL.</p>
        <a href="#/rekomendasi" class="btn btn-primary">Buka Form Color Recommendation</a>
      </div>
    `;
  }

  const input = { kat, proses, ph: phVal, kemasan, simpan, warna };
  const result = getRecommendations(data.materials, input, {
    categoryMap: data.categoryMap,
    packagingExposureMap: data.packagingExposureMap,
  });

  const catObj = data.categoryMap.get(kat);
  const catLabel = catObj ? `${catObj.code} — ${catObj.name}` : kat;
  const colorHex = TARGET_COLOR_HEX[warna] || '#CCCCCC';
  const editQuery = new URLSearchParams({
    kat,
    proses,
    ph: String(phVal),
    kemasan,
    simpan,
    warna,
  }).toString();

  const hasCandidates =
    result.sangatSesuai.length > 0 || result.sesuaiDenganCatatan.length > 0;
  const extProcessMeta = isExtensionProcess(proses)
    ? getExtensionProcessMeta(proses)
    : null;

  return `
    <div class="results-summary-bar">
      <div>
        <h1 class="page-title" style="margin-bottom: 4px;">Hasil Rekomendasi Pewarna Alami</h1>
        <p class="page-subtitle">Ringkasan karakteristik produk yang dievaluasi:</p>
        <div class="summary-chips" aria-label="Parameter pencarian">
          <span class="chip"><strong>Kategori:</strong> ${escapeHtml(catLabel)}</span>
          <span class="chip"><strong>Proses:</strong> ${escapeHtml(proses)}</span>
          <span class="chip"><strong>pH:</strong> ${escapeHtml(formatNumberId(phVal))}</span>
          <span class="chip"><strong>Kemasan:</strong> ${escapeHtml(kemasan)}</span>
          <span class="chip"><strong>Penyimpanan:</strong> ${escapeHtml(simpan)}</span>
          <span class="chip">
            <span class="chip-color-dot" style="background-color: ${escapeHtml(colorHex)};" aria-hidden="true"></span>
            <strong>Target Color:</strong> ${escapeHtml(warna)}
          </span>
        </div>
      </div>

      <div class="no-print" style="display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="#/rekomendasi?${escapeHtml(editQuery)}" class="btn btn-secondary btn-sm">Ubah Pencarian</a>
        <button type="button" id="btn-print-results" class="btn btn-secondary btn-sm">Cetak / PDF</button>
      </div>
    </div>

    <div class="info-box" style="margin-bottom: 20px;" role="note" aria-label="Pernyataan batasan">
      ${DISCLAIMER_TEXT}
    </div>

    ${
      extProcessMeta
        ? `
      <div class="info-box" style="margin-bottom: 24px; border-left-color: var(--status-warn); background-color: var(--status-warn-bg);" role="note" aria-label="Informasi kompatibilitas granulasi">
        <strong>Catatan Kompatibilitas ${escapeHtml(extProcessMeta.label)}:</strong>
        ${escapeHtml(extProcessMeta.bannerNotice)}
      </div>
    `
        : ''
    }

    ${
      !hasCandidates
        ? `
      <div class="card" style="text-align: center; padding: 40px 24px;">
        <h2 style="font-size: 1.25rem; margin-bottom: 8px;">Belum ada bahan yang cocok. Coba ubah pH, proses, atau kemasan.</h2>
        <p style="color: var(--color-muted); margin-bottom: 20px;">
          Tidak ditemukan kandidat dalam grup Sangat sesuai maupun Sesuai dengan catatan untuk kombinasi parameter ini.
        </p>
        <a href="#/rekomendasi?${escapeHtml(editQuery)}" class="btn btn-primary no-print">Ubah Parameter Produk</a>
      </div>
    `
        : ''
    }

    ${
      result.sangatSesuai.length > 0
        ? `
      <section class="results-group-section" aria-labelledby="heading-sangat-sesuai">
        <div class="results-group-header">
          <h2 id="heading-sangat-sesuai" class="results-group-title">
            <span class="status-badge status-ok"><span aria-hidden="true">✓</span> Sangat sesuai</span>
          </h2>
          <span class="results-count-pill">${result.sangatSesuai.length} kandidat</span>
        </div>
        <div class="results-cards-stack">
          ${result.sangatSesuai.map((item) => renderSingleResultCard(item, data)).join('')}
        </div>
      </section>
    `
        : ''
    }

    ${
      result.sesuaiDenganCatatan.length > 0
        ? `
      <section class="results-group-section" aria-labelledby="heading-sesuai-catatan">
        <div class="results-group-header">
          <h2 id="heading-sesuai-catatan" class="results-group-title">
            <span class="status-badge status-warn"><span aria-hidden="true">▲</span> Sesuai dengan catatan</span>
          </h2>
          <span class="results-count-pill">${result.sesuaiDenganCatatan.length} kandidat</span>
        </div>
        <div class="results-cards-stack">
          ${result.sesuaiDenganCatatan.map((item) => renderSingleResultCard(item, data)).join('')}
        </div>
      </section>
    `
        : ''
    }

    ${
      result.tersaring.length > 0
        ? `
      <div class="filtered-accordion">
        <button
          type="button"
          id="filtered-accordion-btn"
          class="filtered-accordion-trigger"
          aria-expanded="false"
          aria-controls="filtered-accordion-panel"
        >
          <span>Lihat bahan yang tersaring dan alasannya (${result.tersaring.length} bahan)</span>
          <span id="filtered-accordion-arrow" aria-hidden="true">▾</span>
        </button>
        <div id="filtered-accordion-panel" class="filtered-accordion-body" hidden>
          <p class="form-help" style="margin-bottom: 4px;">
            Bahan berikut memiliki Target Color <strong>${escapeHtml(warna)}</strong>, namun memiliki kriteria yang kurang sesuai dengan kondisi produk:
          </p>
          ${result.tersaring
            .map(
              (item) => `
            <div class="filtered-item-row" data-filtered-id="${escapeHtml(item.material.id)}">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span class="swatch-circle" style="background-color: ${escapeHtml(item.material.hex || '#E5E7EB')};"></span>
                  <strong><a href="#/bahan/${encodeURIComponent(item.material.id)}">${escapeHtml(item.material.name)}</a></strong>
                  <span class="chip">${escapeHtml(item.material.group)}</span>
                  ${item.material.animal ? `<span class="chip chip-animal"><span aria-hidden="true">▲</span> Bahan hewani</span>` : ''}
                </div>
                <a href="#/bahan/${encodeURIComponent(item.material.id)}" class="btn btn-secondary btn-sm no-print">Lihat detail</a>
              </div>
              <ul class="criteria-list" style="margin-top: 4px;">
                ${item.filterReasons
                  .map(
                    (reason) => `
                  <li class="criteria-item" style="color: var(--status-err);">
                    <span class="criteria-icon" aria-hidden="true">✕</span>
                    <span><strong>Kurang sesuai:</strong> ${escapeHtml(reason)}</span>
                  </li>
                `
                  )
                  .join('')}
              </ul>
              ${
                item.extensionProfile?.recommendedMethod
                  ? `
                <div style="margin-top: 6px; font-size: 0.8125rem; color: var(--color-text); background-color: #F9FAFB; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-border);">
                  <div><strong>Solusi Alternatif Granulasi:</strong> ${escapeHtml(item.extensionProfile.recommendedMethod)}</div>
                  ${item.extensionProfile.binderAndMatrix ? `<div style="margin-top: 2px;"><strong>Penanganan Matriks:</strong> ${escapeHtml(item.extensionProfile.binderAndMatrix)}</div>` : ''}
                </div>
              `
                  : ''
              }
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
        : ''
    }
  `;
}

export function attachResultsPageEvents() {
  // Pelipat Keterbatasan & Tips (buka/tutup 2 baris)
  document.querySelectorAll('.cons-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const pEl = targetId ? document.getElementById(targetId) : null;
      if (!pEl) return;
      const isCollapsed = pEl.classList.contains('cons-text-clamp');
      if (isCollapsed) {
        pEl.classList.remove('cons-text-clamp');
        btn.textContent = 'Sembunyikan';
        btn.setAttribute('aria-expanded', 'true');
      } else {
        pEl.classList.add('cons-text-clamp');
        btn.textContent = 'Selengkapnya';
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Pelipat Bahan yang Tersaring (tertutup secara bawaan)
  const accBtn = document.getElementById('filtered-accordion-btn');
  const accPanel = document.getElementById('filtered-accordion-panel');
  const accArrow = document.getElementById('filtered-accordion-arrow');
  if (accBtn && accPanel) {
    accBtn.addEventListener('click', () => {
      const isHidden = accPanel.hidden;
      accPanel.hidden = !isHidden;
      accBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      if (accArrow) {
        accArrow.textContent = isHidden ? '▴' : '▾';
      }
    });
  }

  // Tombol Cetak / PDF
  const printBtn = document.getElementById('btn-print-results');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

