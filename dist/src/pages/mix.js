import { escapeHtml, TARGET_COLOR_HEX } from '../data-store.js';
import {
  filterCombinations,
  formatNumberId,
  normalizeProcessInput,
} from '../engine/recommend.js';
import {
  EXTENSION_PROCESSES,
  isExtensionProcess,
} from '../engine/process-extensions.js';
import { validatePhInput } from './form.js';

export const MIX_NOTE_TEXT =
  'Warna hasil adalah perkiraan dari foto larutan; rasio menunjukkan kontribusi intensitas warna, bukan massa.';

export function renderCombinationCard(combo) {
  const hexA = combo.a?.hex || '#E5E7EB';
  const hexB = combo.b?.hex || '#E5E7EB';
  const resHex = combo.resultHex || '#E5E7EB';
  const resColorDot = TARGET_COLOR_HEX[combo.resultColor] || resHex;

  const phRangeText =
    combo.ph?.min !== null &&
    combo.ph?.min !== undefined &&
    combo.ph?.max !== null &&
    combo.ph?.max !== undefined
      ? `pH ${formatNumberId(combo.ph.min)}–${formatNumberId(combo.ph.max)}`
      : null;

  const processChips = (combo.processes || [])
    .map((p) => `<span class="chip">${escapeHtml(p)}</span>`)
    .join('');

  return `
    <article class="card combo-card" data-combo-id="${escapeHtml(combo.id)}">
      <div class="combo-equation">
        <div class="combo-part">
          <div class="swatch-box" style="background-color: ${escapeHtml(hexA)};" title="${escapeHtml(hexA)}"></div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-muted); font-weight: 600;">Bahan A (${escapeHtml(combo.a?.id || '')})</div>
            <strong>
              <a href="#/bahan/${encodeURIComponent(combo.a?.id || '')}">${escapeHtml(combo.a?.name || combo.a?.id || '')}</a>
            </strong>
          </div>
        </div>

        <span class="combo-operator" aria-label="ditambah">+</span>

        <div class="combo-part">
          <div class="swatch-box" style="background-color: ${escapeHtml(hexB)};" title="${escapeHtml(hexB)}"></div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-muted); font-weight: 600;">Bahan B (${escapeHtml(combo.b?.id || '')})</div>
            <strong>
              <a href="#/bahan/${encodeURIComponent(combo.b?.id || '')}">${escapeHtml(combo.b?.name || combo.b?.id || '')}</a>
            </strong>
          </div>
        </div>

        <span class="combo-operator" aria-label="menghasilkan">=</span>

        <div class="combo-result-part">
          <div class="swatch-box" style="background-color: ${escapeHtml(resHex)};" title="${escapeHtml(resHex)}"></div>
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="chip-color-dot" style="background-color: ${escapeHtml(resColorDot)};"></span>
              <strong>${escapeHtml(combo.resultColor)}</strong>
            </div>
            <code style="font-size: 0.8125rem; color: var(--color-muted);">${escapeHtml(resHex)}</code>
          </div>
        </div>
      </div>

      <div class="combo-meta-row">
        <div>
          <strong class="combo-ratio-text">Rasio A:B ${escapeHtml(combo.ratio || '-')}</strong>
          ${
            combo.ratioRange
              ? `<span class="combo-ratio-sub">(rasio intensitas warna; rentang ${escapeHtml(combo.ratioRange)})</span>`
              : `<span class="combo-ratio-sub">(rasio intensitas warna)</span>`
          }
        </div>
        <span class="chip" title="Skor kompatibilitas dan kejelasan warna">
          Skor: ${escapeHtml(formatNumberId(combo.score))}
        </span>
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${phRangeText ? `<span class="chip"><strong>Rentang pH:</strong> ${escapeHtml(phRangeText)}</span>` : ''}
        ${processChips}
      </div>

      ${
        combo.notes
          ? `
        <p style="margin: 0; font-size: 0.875rem; color: var(--color-text);">
          <strong>Catatan:</strong> ${escapeHtml(combo.notes)}
        </p>
      `
          : ''
      }
    </article>
  `;
}

export function renderMixPage(data, queryParams) {
  const { options, materials } = data;
  const colorOptions = options.filter((o) => o.type === 'Target Color');
  const processOptions = [
    ...options.filter((o) => o.type === 'Proses Pengolahan'),
    ...EXTENSION_PROCESSES,
  ];

  const initialMaterialId = queryParams.get('bahan') || '';
  const initialColor =
    queryParams.get('warna') || (initialMaterialId ? '' : 'Orange');
  const initialPh = queryParams.get('ph') || '';
  const initialProcess = queryParams.get('proses') || '';

  const materialObj = initialMaterialId
    ? materials.find((m) => m.id === initialMaterialId)
    : null;

  return `
    <div class="page-header">
      <h1 class="page-title">Explore Color Mix</h1>
      <p class="page-subtitle">
        Temukan pasangan kombinasi dua bahan pewarna alami untuk menghasilkan warna target lainnya.
      </p>
    </div>

    ${
      materialObj
        ? `
      <div class="card" style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; background-color: var(--color-primary-light); border-color: var(--color-primary);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="swatch-box" style="background-color: ${escapeHtml(materialObj.hex || '#FFFFFF')};"></div>
          <div>
            <div style="font-size: 0.8125rem; font-weight: 600; color: var(--color-primary);">Menampilkan kombinasi yang memuat bahan:</div>
            <strong style="font-size: 1.05rem; color: var(--color-heading);">
              <a href="#/bahan/${encodeURIComponent(materialObj.id)}">${escapeHtml(materialObj.name)} (${escapeHtml(materialObj.id)})</a>
            </strong>
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="#/bahan/${encodeURIComponent(materialObj.id)}" class="btn btn-secondary btn-sm">Detail Bahan</a>
          <a href="#/mix" class="btn btn-secondary btn-sm">Lihat Semua Bahan</a>
        </div>
      </div>
    `
        : ''
    }

    <section class="card mix-filter-bar" aria-label="Penyaring Explore Color Mix">
      <input type="hidden" id="mix-material-id" value="${escapeHtml(initialMaterialId)}" />
      <input type="hidden" id="mix-selected-color" value="${escapeHtml(initialColor)}" />

      <div class="form-group">
        <span class="form-label" id="label-mix-color">
          Warna Hasil ${materialObj ? '(Opsional — dikelompokkan per Warna Hasil bila Semua dipilih)' : ''}
        </span>
        <div class="mix-color-chips" role="group" aria-labelledby="label-mix-color">
          ${
            materialObj
              ? `
            <button
              type="button"
              class="mix-color-chip-btn ${initialColor === '' ? 'selected' : ''}"
              data-mix-color=""
            >
              <span>Semua Warna Hasil</span>
            </button>
          `
              : ''
          }
          ${colorOptions
            .map((opt) => {
              const hex = opt.hex || TARGET_COLOR_HEX[opt.value] || '#CCCCCC';
              const active = opt.value === initialColor;
              return `
                <button
                  type="button"
                  class="mix-color-chip-btn ${active ? 'selected' : ''}"
                  data-mix-color="${escapeHtml(opt.value)}"
                >
                  <span class="swatch-circle" style="width: 18px; height: 18px; background-color: ${escapeHtml(hex)};"></span>
                  <span>${escapeHtml(opt.value)}</span>
                </button>
              `;
            })
            .join('')}
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label" for="mix-input-ph">pH Produk (Opsional)</label>
          <input
            type="text"
            inputmode="decimal"
            id="mix-input-ph"
            class="form-control"
            placeholder="Contoh: 3,5 (kosongkan untuk semua pH)"
            value="${escapeHtml(initialPh)}"
          />
          <p id="mix-ph-error" class="form-error" role="alert" hidden>
            Masukkan angka antara 0 dan 14.
          </p>
        </div>

        <div class="form-group">
          <label class="form-label" for="mix-input-process">Proses Pengolahan (Opsional)</label>
          <select id="mix-input-process" class="form-control">
            <option value="">Semua proses pengolahan</option>
            ${processOptions
              .map((opt) => {
                const label =
                  opt.value === 'Tanpa pemanasan'
                    ? 'Tanpa pemanasan setelah pencampuran'
                    : opt.value;
                const sel = opt.value === initialProcess ? 'selected' : '';
                return `<option value="${escapeHtml(opt.value)}" ${sel}>${escapeHtml(label)}</option>`;
              })
              .join('')}
          </select>
        </div>
      </div>
    </section>

    <div id="mix-results-container"></div>

    <div class="info-box" style="margin-top: 24px;" role="note">
      ${MIX_NOTE_TEXT}
    </div>
  `;
}

export function attachMixPageEvents(data) {
  const container = document.getElementById('mix-results-container');
  if (!container) return;

  const materialInput = document.getElementById('mix-material-id');
  const colorInput = document.getElementById('mix-selected-color');
  const phInput = document.getElementById('mix-input-ph');
  const phError = document.getElementById('mix-ph-error');
  const processInput = document.getElementById('mix-input-process');
  const colorBtns = document.querySelectorAll('.mix-color-chip-btn');

  let visibleLimit = 30;

  function renderResultsList() {
    const materialId = materialInput.value.trim();
    const selectedColor = colorInput.value.trim();
    const rawPh = phInput.value.trim();
    const processVal = normalizeProcessInput(processInput.value);

    let phParam = '';
    if (rawPh !== '') {
      const check = validatePhInput(rawPh);
      if (!check.valid) {
        phError.hidden = false;
        phInput.classList.add('invalid');
        return;
      }
      phError.hidden = true;
      phInput.classList.remove('invalid');
      phParam = check.normalizedText;
    } else {
      phError.hidden = true;
      phInput.classList.remove('invalid');
    }

    const filtered = filterCombinations(data.combinations, {
      materialId,
      resultColor: selectedColor,
      ph: phParam,
      process: processVal,
    });

    if (filtered.length === 0) {
      const isExt = isExtensionProcess(processVal);
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 36px 24px;">
          <h2 style="font-size: 1.2rem; margin-bottom: 8px;">
            Tidak ada kombinasi yang cocok dengan penyaring ini. Coba ubah pH atau proses.
          </h2>
          ${
            isExt
              ? `<p style="margin: 8px 0 0 0; color: var(--color-muted); font-size: 0.9375rem;">
                  Catatan: Untuk proses <strong>${escapeHtml(processVal)}</strong>, data kompatibilitas granulasi belum tersedia (status bahan: Unknown) sehingga belum ada pasangan kombinasi yang telah terverifikasi Compatible.
                </p>`
              : ''
          }
        </div>
      `;
      return;
    }

    const sliced = filtered.slice(0, visibleLimit);
    const hasMore = filtered.length > visibleLimit;

    // Bila masuk dari kartu/detail bahan dan "Semua Warna Hasil" aktif, kelompokkan menurut Warna Hasil (Bagian 9)
    let cardsHtml = '';
    if (materialId && !selectedColor) {
      const groups = new Map();
      for (const item of sliced) {
        if (!groups.has(item.resultColor)) {
          groups.set(item.resultColor, []);
        }
        groups.get(item.resultColor).push(item);
      }

      for (const [colorName, list] of groups.entries()) {
        const dotHex = TARGET_COLOR_HEX[colorName] || '#CCCCCC';
        cardsHtml += `
          <section class="results-group-section">
            <div class="results-group-header">
              <h2 class="results-group-title" style="font-size: 1.2rem;">
                <span class="swatch-circle" style="width: 20px; height: 20px; background-color: ${escapeHtml(dotHex)};"></span>
                <span>Warna Hasil: ${escapeHtml(colorName)}</span>
              </h2>
              <span class="results-count-pill">${list.length} ditampilkan</span>
            </div>
            <div class="results-cards-stack">
              ${list.map((c) => renderCombinationCard(c)).join('')}
            </div>
          </section>
        `;
      }
    } else {
      cardsHtml = `
        <div class="results-group-header" style="margin-bottom: 16px;">
          <h2 class="results-group-title" style="font-size: 1.2rem;">
            Daftar Kombinasi ${selectedColor ? `(${escapeHtml(selectedColor)})` : ''}
          </h2>
          <span class="results-count-pill">Menampilkan ${sliced.length} dari ${filtered.length} kombinasi</span>
        </div>
        <div class="results-cards-stack">
          ${sliced.map((c) => renderCombinationCard(c)).join('')}
        </div>
      `;
    }

    const loadMoreHtml = hasMore
      ? `
        <div style="text-align: center; margin-top: 24px;">
          <button type="button" id="btn-mix-load-more" class="btn btn-secondary">
            Tampilkan lebih banyak (${filtered.length - visibleLimit} tersisa)
          </button>
        </div>
      `
      : '';

    container.innerHTML = cardsHtml + loadMoreHtml;

    const loadMoreBtn = document.getElementById('btn-mix-load-more');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        visibleLimit += 30;
        renderResultsList();
      });
    }
  }

  colorBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const col = btn.getAttribute('data-mix-color') ?? '';
      colorInput.value = col;
      colorBtns.forEach((b) => b.classList.toggle('selected', b === btn));
      visibleLimit = 30;
      renderResultsList();
    });
  });

  phInput.addEventListener('input', () => {
    visibleLimit = 30;
    renderResultsList();
  });

  processInput.addEventListener('change', () => {
    visibleLimit = 30;
    renderResultsList();
  });

  renderResultsList();
}

