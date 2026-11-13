import { escapeHtml, TARGET_COLOR_HEX } from '../data-store.js';
import {
  filterCombinations,
  formatNumberId,
  normalizeProcessInput,
} from '../engine/recommend.js';
import {
  EXTENSION_PROCESSES,
  isExtensionProcess,
  getMaterialExtensionStatus,
} from '../engine/process-extensions.js';
import {
  getCalibratedMaterialHex,
  computeInteractiveMix,
} from '../engine/color-science.js';
import { validatePhInput } from './form.js';

export const MIX_NOTE_TEXT =
  'Warna hasil adalah perkiraan dari foto larutan; rasio menunjukkan kontribusi intensitas warna, bukan massa.';

const COLOR_SHADE_DEFINITIONS = {
  Yellow:
    'Rona Kuning Cerah (Bright Lemon Yellow, Sunny Canary Yellow, Golden Yellow, hingga Warm Amber Yellow) dari kombinasi sesama pigmen kuning atau sentuhan oranye hangat.',
  Orange:
    'Rona Oranye Cerah (Vibrant Tangerine, Bright Mandarin Orange, hingga Deep Coral Orange) dari perpaduan pigmen kuning dan merah/oranye.',
  Red:
    'Rona Merah Pekat & Cerah (Ruby Crimson Red, Bright Scarlet Red, hingga Berry Red) dari kombinasi pigmen merah alami dengan nuansa hangat maupun dingin.',
  Pink:
    'Rona Merah Muda (Soft Flamingo Pink, Berry Rose Pink, hingga Blossom Pink) dari pigmen karmin, bit merah, atau antosianin bernuansa rose pada intensitas ringan.',
  Purple:
    'Rona Ungu & Violet (Deep Royal Violet, Rich Plum Purple, hingga Magenta-Purple) dari perpaduan pigmen merah/ungu dengan biru alami.',
  Blue:
    'Rona Biru Alami (Bright Sky Blue, Ocean Turquoise Blue, hingga Royal Cobalt Blue) dari fikosianin spirulina, iridoid genipin/jagua, dan antosianin biru.',
  Green:
    'Rona Hijau Segar (Fresh Lime Green, Natural Leaf Green, hingga Emerald Mint Green) dari kombinasi klorofilin atau perpaduan pigmen kuning dan biru alami.',
  Brown:
    'Rona Cokelat Alami (Warm Caramel Brown hingga Rich Cocoa Brown) dari perpaduan komplementer pigmen hangat (oranye/merah/kuning) dan pigmen dingin/karbon.',
  Black:
    'Rona Hitam & Abu Gelap Pekat (Deep Jet Black hingga Neutral Charcoal Black) berbasis karbon nabati dan melanin dengan penyeimbang rona.',
};

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

  const extGranA = getMaterialExtensionStatus(combo.a?.id, 'Granulasi');
  const extGranB = getMaterialExtensionStatus(combo.b?.id, 'Granulasi');
  const isGranulasiCompatible =
    extGranA?.status === 'Compatible' && extGranB?.status === 'Compatible';

  const processChips = [
    ...(combo.processes || []).map((p) => `<span class="chip">${escapeHtml(p)}</span>`),
    ...(isGranulasiCompatible
      ? [`<span class="chip" title="Kedua bahan berstatus Compatible untuk Proses Granulasi">Granulasi</span>`]
      : []),
  ].join('');

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
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
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
  const baseColorOptions = options.filter((o) => o.type === 'Target Color');
  const existingColorNames = new Set(baseColorOptions.map((o) => o.value));
  const extraColorOptions = [
    { type: 'Target Color', value: 'Pink', hex: TARGET_COLOR_HEX.Pink },
    { type: 'Target Color', value: 'Brown', hex: TARGET_COLOR_HEX.Brown },
  ].filter((o) => !existingColorNames.has(o.value));

  const colorOptions = [...baseColorOptions, ...extraColorOptions];
  const processOptions = [
    ...options.filter((o) => o.type === 'Proses Pengolahan'),
    ...EXTENSION_PROCESSES,
  ];

  const initialMaterialId = queryParams.get('bahan') || '';
  const initialColor =
    queryParams.get('warna') || (initialMaterialId ? '' : 'Yellow');
  const initialPh = queryParams.get('ph') || '';
  const initialProcess = queryParams.get('proses') || '';

  const materialObj = initialMaterialId
    ? materials.find((m) => m.id === initialMaterialId)
    : null;
  const defaultMatA = materialObj || materials.find((m) => m.id === 'NC-007') || materials[0];
  const defaultMatB =
    materials.find((m) => m.id === 'NC-014' && m.id !== defaultMatA?.id) ||
    materials.find((m) => m.id !== defaultMatA?.id) ||
    materials[0];

  return `
    <div class="page-header">
      <h1 class="page-title">Explore Color Mix</h1>
      <p class="page-subtitle">
        Temukan dan eksplorasi langsung pasangan kombinasi dua bahan pewarna alami untuk menghasilkan berbagai shade warna target yang akurat.
      </p>
    </div>

    ${
      materialObj
        ? `
      <div class="card" style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; background-color: var(--color-primary-light); border-color: var(--color-primary);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="swatch-box" style="background-color: ${escapeHtml(getCalibratedMaterialHex(materialObj))};"></div>
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

    <!-- Kalkulator Eksplorasi Langsung Campuran 2 Bahan -->
    <section class="card" style="margin-bottom: 24px; border-color: var(--color-primary);" aria-labelledby="heading-direct-explorer">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
        <div>
          <h2 id="heading-direct-explorer" style="font-size: 1.15rem; margin: 0 0 4px 0;">
            Eksplorasi Langsung Campuran 2 Bahan (Kalkulator Rasio Interaktif)
          </h2>
          <p style="margin: 0; font-size: 0.875rem; color: var(--color-muted);">
            Pilih Bahan A dan Bahan B serta geser rasio kontribusi warna untuk melihat rona hasil, kecocokan pH, dan proses pengolahan secara langsung.
          </p>
        </div>
      </div>

      <div class="form-row-2" style="margin-bottom: 14px;">
        <div class="form-group">
          <label class="form-label" for="direct-mix-mat-a">Bahan A</label>
          <select id="direct-mix-mat-a" class="form-control">
            ${materials
              .map(
                (m) => `
              <option value="${escapeHtml(m.id)}" ${m.id === defaultMatA?.id ? 'selected' : ''}>
                ${escapeHtml(m.id)} — ${escapeHtml(m.name)} [${escapeHtml((m.colors || []).join('/'))}]
              </option>
            `
              )
              .join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="direct-mix-mat-b">Bahan B</label>
          <select id="direct-mix-mat-b" class="form-control">
            ${materials
              .map(
                (m) => `
              <option value="${escapeHtml(m.id)}" ${m.id === defaultMatB?.id ? 'selected' : ''}>
                ${escapeHtml(m.id)} — ${escapeHtml(m.name)} [${escapeHtml((m.colors || []).join('/'))}]
              </option>
            `
              )
              .join('')}
          </select>
        </div>
      </div>

      <div class="form-group" style="margin-bottom: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <label class="form-label" for="direct-mix-ratio" style="margin: 0;">Rasio Kontribusi Warna (Bahan A : Bahan B)</label>
          <strong id="direct-mix-ratio-label" style="color: var(--color-primary); font-size: 0.95rem;">55 : 45</strong>
        </div>
        <input
          type="range"
          id="direct-mix-ratio"
          min="10"
          max="90"
          step="5"
          value="55"
          style="width: 100%; accent-color: var(--color-primary); cursor: pointer;"
        />
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-muted);">
          <span>Dominan Bahan B (10:90)</span>
          <span>Seimbang (50:50)</span>
          <span>Dominan Bahan A (90:10)</span>
        </div>
      </div>

      <div id="direct-mix-preview-box"></div>
    </section>

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
              const hex = TARGET_COLOR_HEX[opt.value] || opt.hex || '#CCCCCC';
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
        <p id="mix-color-shade-desc" class="form-help" style="margin-top: 8px;">
          ${escapeHtml(COLOR_SHADE_DEFINITIONS[initialColor] || 'Menampilkan seluruh kombinasi lintas kategori warna hasil.')}
        </p>
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
  const shadeDescEl = document.getElementById('mix-color-shade-desc');
  const phInput = document.getElementById('mix-input-ph');
  const phError = document.getElementById('mix-ph-error');
  const processInput = document.getElementById('mix-input-process');
  const colorBtns = document.querySelectorAll('.mix-color-chip-btn');

  // Elemen Kalkulator Eksplorasi Langsung
  const directMatA = document.getElementById('direct-mix-mat-a');
  const directMatB = document.getElementById('direct-mix-mat-b');
  const directRatio = document.getElementById('direct-mix-ratio');
  const directRatioLabel = document.getElementById('direct-mix-ratio-label');
  const directPreviewBox = document.getElementById('direct-mix-preview-box');

  const matMap = new Map((data.materials || []).map((m) => [m.id, m]));

  function renderDirectExplorer() {
    if (!directMatA || !directMatB || !directRatio || !directPreviewBox) return;
    const matA = matMap.get(directMatA.value);
    const matB = matMap.get(directMatB.value);
    const ratioVal = parseInt(directRatio.value, 10) || 55;
    if (directRatioLabel) {
      directRatioLabel.textContent = `${ratioVal} : ${100 - ratioVal}`;
    }
    if (!matA || !matB) return;

    const mix = computeInteractiveMix(matA, matB, ratioVal);
    if (!mix) return;

    const dotHex = TARGET_COLOR_HEX[mix.resultColor] || mix.resultHex;
    const phText =
      mix.ph.min !== null && mix.ph.max !== null
        ? mix.phValid
          ? `pH ${formatNumberId(mix.ph.min)}–${formatNumberId(mix.ph.max)}`
          : 'Rentang pH kedua bahan tidak beririsan'
        : 'Rentang pH fleksibel';

    const procChips = [
      ...(mix.processes || []).map((p) => `<span class="chip">${escapeHtml(p)}</span>`),
      ...(mix.granulasiCompatible
        ? [`<span class="chip">Granulasi (Compatible)</span>`]
        : []),
    ].join('');

    directPreviewBox.innerHTML = `
      <div style="background-color: #F9FAFB; border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px;">
        <div class="combo-equation" style="margin-bottom: 12px;">
          <div class="combo-part">
            <div class="swatch-box" style="background-color: ${escapeHtml(mix.a.hex)};" title="${escapeHtml(mix.a.hex)}"></div>
            <div>
              <div style="font-size: 0.75rem; color: var(--color-muted); font-weight: 600;">Bahan A (${escapeHtml(mix.a.id)} · ${ratioVal}%)</div>
              <strong><a href="#/bahan/${encodeURIComponent(mix.a.id)}">${escapeHtml(mix.a.name)}</a></strong>
            </div>
          </div>

          <span class="combo-operator" aria-label="ditambah">+</span>

          <div class="combo-part">
            <div class="swatch-box" style="background-color: ${escapeHtml(mix.b.hex)};" title="${escapeHtml(mix.b.hex)}"></div>
            <div>
              <div style="font-size: 0.75rem; color: var(--color-muted); font-weight: 600;">Bahan B (${escapeHtml(mix.b.id)} · ${100 - ratioVal}%)</div>
              <strong><a href="#/bahan/${encodeURIComponent(mix.b.id)}">${escapeHtml(mix.b.name)}</a></strong>
            </div>
          </div>

          <span class="combo-operator" aria-label="menghasilkan">=</span>

          <div class="combo-result-part">
            <div class="swatch-box" style="background-color: ${escapeHtml(mix.resultHex)};" title="${escapeHtml(mix.resultHex)}"></div>
            <div>
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span class="chip-color-dot" style="background-color: ${escapeHtml(dotHex)};"></span>
                <strong>${escapeHtml(mix.resultColor)}</strong>
              </div>
              <code style="font-size: 0.8125rem; color: var(--color-muted);">${escapeHtml(mix.resultHex)}</code>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
            <span class="chip"><strong>Irisan pH:</strong> ${escapeHtml(phText)}</span>
            ${procChips || '<span class="chip">Perlu uji kompatibilitas proses</span>'}
          </div>
          <button type="button" id="btn-apply-direct-color" class="btn btn-secondary btn-sm" data-target-color="${escapeHtml(mix.resultColor)}">
            Tampilkan Semua Kombinasi ${escapeHtml(mix.resultColor)} ↓
          </button>
        </div>
        ${
          mix.notes
            ? `<p style="margin: 8px 0 0 0; font-size: 0.8125rem; color: var(--color-text);"><strong>Catatan Teknis:</strong> ${escapeHtml(mix.notes)}</p>`
            : ''
        }
      </div>
    `;

    const applyBtn = document.getElementById('btn-apply-direct-color');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const targetCol = applyBtn.getAttribute('data-target-color') || '';
        colorInput.value = targetCol;
        colorBtns.forEach((b) =>
          b.classList.toggle('selected', b.getAttribute('data-mix-color') === targetCol)
        );
        if (shadeDescEl) {
          shadeDescEl.textContent =
            COLOR_SHADE_DEFINITIONS[targetCol] ||
            'Menampilkan seluruh kombinasi lintas kategori warna hasil.';
        }
        visibleLimit = 30;
        renderResultsList();
      });
    }
  }

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
      materials: data.materials,
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
                  Catatan: Untuk proses <strong>${escapeHtml(processVal)}</strong>, kombinasi hanya ditampilkan apabila Bahan A dan Bahan B sama-sama berstatus <strong>Compatible</strong> terhadap granulasi serta memenuhi rentang pH yang dipilih.
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
      if (shadeDescEl) {
        shadeDescEl.textContent =
          COLOR_SHADE_DEFINITIONS[col] ||
          'Menampilkan seluruh kombinasi lintas kategori warna hasil.';
      }
      visibleLimit = 30;
      renderResultsList();
    });
  });

  if (directMatA) directMatA.addEventListener('change', renderDirectExplorer);
  if (directMatB) directMatB.addEventListener('change', renderDirectExplorer);
  if (directRatio) directRatio.addEventListener('input', renderDirectExplorer);

  phInput.addEventListener('input', () => {
    visibleLimit = 30;
    renderResultsList();
  });

  processInput.addEventListener('change', () => {
    visibleLimit = 30;
    renderResultsList();
  });

  renderDirectExplorer();
  renderResultsList();
}

