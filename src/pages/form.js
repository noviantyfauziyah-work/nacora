import { escapeHtml, TARGET_COLOR_HEX } from '../data-store.js';
import { EXTENSION_PROCESSES } from '../engine/process-extensions.js';

/**
 * Validasi input pH sesuai Bagian 4.2, Bagian 6, dan Bagian 15.1:
 * - Menerima koma atau titik
 * - Angka antara 0 dan 14
 * - Maksimal dua desimal
 */
export function validatePhInput(rawValue) {
  if (rawValue === null || rawValue === undefined) {
    return { valid: false, value: null, normalizedText: '' };
  }
  const trimmed = String(rawValue).trim();
  if (trimmed === '') {
    return { valid: false, value: null, normalizedText: '' };
  }
  // Hanya izinkan digit dan opsional koma/titik diikuti 1-2 digit
  if (!/^\d+([.,]\d{1,2})?$/.test(trimmed)) {
    return { valid: false, value: null, normalizedText: trimmed };
  }
  const normalized = trimmed.replace(',', '.');
  const num = Number(normalized);
  if (Number.isNaN(num) || num < 0 || num > 14) {
    return { valid: false, value: null, normalizedText: normalized };
  }
  return { valid: true, value: num, normalizedText: String(num) };
}

export function renderFormPage(data, queryParams) {
  const { categories, options } = data;

  const processOptions = [
    ...options.filter((o) => o.type === 'Proses Pengolahan'),
    ...EXTENSION_PROCESSES,
  ];
  const packagingOptions = options.filter((o) => o.type === 'Jenis Kemasan');
  const storageOptions = options.filter((o) => o.type === 'Kondisi Penyimpanan');
  const colorOptions = options.filter((o) => o.type === 'Target Color');

  const initialKat = queryParams.get('kat') || '';
  const initialProses = queryParams.get('proses') || '';
  const initialPh = queryParams.get('ph') || '';
  const initialKemasan = queryParams.get('kemasan') || '';
  const initialSimpan = queryParams.get('simpan') || '';
  const initialWarna = queryParams.get('warna') || '';

  const selectedCatObj = categories.find((c) => c.code === initialKat);
  const triggerLabel = selectedCatObj
    ? `${selectedCatObj.code} — ${selectedCatObj.name}`
    : 'Pilih kategori pangan...';

  return `
    <div class="page-header">
      <h1 class="page-title">Color Recommendation</h1>
      <p class="page-subtitle">
        Masukkan karakteristik produk pangan Anda untuk menemukan kandidat pewarna alami yang sesuai.
      </p>
    </div>

    <form id="recommendation-form" class="card form-card" novalidate>
      <!-- 1. Kategori Pangan (Dropdown 16 kategori dengan kotak cari) -->
      <div class="form-group">
        <label class="form-label" id="label-kategori" for="category-trigger-btn">
          Kategori Pangan <span class="required-mark" aria-hidden="true">*</span>
        </label>
        <p class="form-help">Pilih kategori sesuai klasifikasi BPOM, bukan nama produk sehari-hari.</p>

        <div class="category-picker" id="category-picker">
          <input type="hidden" id="input-kat" name="kat" value="${escapeHtml(initialKat)}" />
          <button
            type="button"
            id="category-trigger-btn"
            class="category-trigger ${selectedCatObj ? '' : 'placeholder'}"
            aria-haspopup="listbox"
            aria-expanded="false"
            aria-labelledby="label-kategori"
          >
            <span id="category-trigger-text">${escapeHtml(triggerLabel)}</span>
            <span aria-hidden="true">▾</span>
          </button>

          <div id="category-dropdown-panel" class="category-dropdown-panel" hidden>
            <input
              type="search"
              id="category-search-input"
              class="category-search-input"
              placeholder="Cari kode atau nama kategori (mis. 14.0 atau Minuman)..."
              aria-label="Cari kategori pangan"
              autocomplete="off"
            />
            <ul id="category-options-list" class="category-options-list" role="listbox" aria-label="Daftar kategori pangan">
              ${categories
                .map(
                  (c) => `
                <li role="option" aria-selected="${c.code === initialKat ? 'true' : 'false'}" data-code="${escapeHtml(c.code)}" data-search="${escapeHtml((c.code + ' ' + c.name).toLowerCase())}">
                  <button type="button" class="category-option-btn ${c.code === initialKat ? 'selected' : ''}" data-code="${escapeHtml(c.code)}" data-label="${escapeHtml(`${c.code} — ${c.name}`)}">
                    <span class="category-code-badge">${escapeHtml(c.code)}</span>
                    <span>${escapeHtml(c.name)}</span>
                  </button>
                </li>
              `
                )
                .join('')}
            </ul>
            <p id="category-empty-msg" class="form-help" style="padding: 8px 4px;" hidden>
              Kategori tidak ditemukan.
            </p>
          </div>
        </div>
      </div>

      <div class="form-row-2">
        <!-- 2. Proses Pengolahan -->
        <div class="form-group">
          <label class="form-label" for="input-proses">
            Proses Pengolahan <span class="required-mark" aria-hidden="true">*</span>
          </label>
          <select id="input-proses" name="proses" class="form-control" required>
            <option value="">Pilih proses pengolahan...</option>
            ${processOptions
              .map((opt) => {
                const label =
                  opt.value === 'Tanpa pemanasan'
                    ? 'Tanpa pemanasan setelah pencampuran'
                    : opt.value;
                const sel = opt.value === initialProses ? 'selected' : '';
                return `<option value="${escapeHtml(opt.value)}" ${sel}>${escapeHtml(label)}</option>`;
              })
              .join('')}
          </select>
        </div>

        <!-- 3. pH Produk -->
        <div class="form-group">
          <label class="form-label" for="input-ph">
            pH Produk <span class="required-mark" aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            inputmode="decimal"
            id="input-ph"
            name="ph"
            class="form-control"
            placeholder="Contoh: 3,5 atau 6.7 (rentang 0–14)"
            value="${escapeHtml(initialPh)}"
            autocomplete="off"
            required
          />
          <p id="ph-error-msg" class="form-error" role="alert" hidden>
            Masukkan angka antara 0 dan 14.
          </p>
          <p class="form-help">Rentang 0–14; dapat menggunakan koma atau titik (maksimal dua desimal).</p>
        </div>
      </div>

      <div class="form-row-2">
        <!-- 4. Jenis Kemasan -->
        <div class="form-group">
          <label class="form-label" for="input-kemasan">
            Jenis Kemasan <span class="required-mark" aria-hidden="true">*</span>
          </label>
          <select id="input-kemasan" name="kemasan" class="form-control" required>
            <option value="">Pilih jenis kemasan...</option>
            ${packagingOptions
              .map((opt) => {
                const sel = opt.value === initialKemasan ? 'selected' : '';
                return `<option value="${escapeHtml(opt.value)}" ${sel}>${escapeHtml(opt.value)}</option>`;
              })
              .join('')}
          </select>
        </div>

        <!-- 5. Kondisi Penyimpanan -->
        <div class="form-group">
          <label class="form-label" for="input-simpan">
            Kondisi Penyimpanan <span class="required-mark" aria-hidden="true">*</span>
          </label>
          <select id="input-simpan" name="simpan" class="form-control" required>
            <option value="">Pilih kondisi penyimpanan...</option>
            ${storageOptions
              .map((opt) => {
                const sel = opt.value === initialSimpan ? 'selected' : '';
                return `<option value="${escapeHtml(opt.value)}" ${sel}>${escapeHtml(opt.value)}</option>`;
              })
              .join('')}
          </select>
        </div>
      </div>

      <!-- 6. Target Color (7 swatch pilihan tunggal) -->
      <div class="form-group">
        <span class="form-label" id="label-target-color">
          Target Color <span class="required-mark" aria-hidden="true">*</span>
        </span>
        <input type="hidden" id="input-warna" name="warna" value="${escapeHtml(initialWarna)}" />
        <div class="swatch-grid" role="radiogroup" aria-labelledby="label-target-color">
          ${colorOptions
            .map((opt) => {
              const hex = opt.hex || TARGET_COLOR_HEX[opt.value] || '#CCCCCC';
              const isSelected = opt.value === initialWarna;
              return `
                <button
                  type="button"
                  role="radio"
                  aria-checked="${isSelected ? 'true' : 'false'}"
                  class="swatch-option-btn ${isSelected ? 'selected' : ''}"
                  data-color="${escapeHtml(opt.value)}"
                >
                  <span class="swatch-circle" style="background-color: ${escapeHtml(hex)};"></span>
                  <span>${escapeHtml(opt.value)}</span>
                </button>
              `;
            })
            .join('')}
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" id="btn-find-recommendation" class="btn btn-primary" disabled>
          Find Recommendation
        </button>
        <button type="button" id="btn-reset-form" class="btn btn-secondary">
          Reset
        </button>
      </div>
    </form>
  `;
}

export function attachFormPageEvents() {
  const form = document.getElementById('recommendation-form');
  if (!form) return;

  const inputKat = document.getElementById('input-kat');
  const triggerBtn = document.getElementById('category-trigger-btn');
  const triggerText = document.getElementById('category-trigger-text');
  const dropdownPanel = document.getElementById('category-dropdown-panel');
  const searchInput = document.getElementById('category-search-input');
  const optionsList = document.getElementById('category-options-list');
  const emptyMsg = document.getElementById('category-empty-msg');

  const inputProses = document.getElementById('input-proses');
  const inputPh = document.getElementById('input-ph');
  const phErrorMsg = document.getElementById('ph-error-msg');
  const inputKemasan = document.getElementById('input-kemasan');
  const inputSimpan = document.getElementById('input-simpan');
  const inputWarna = document.getElementById('input-warna');
  const swatchButtons = form.querySelectorAll('.swatch-option-btn');
  const submitBtn = document.getElementById('btn-find-recommendation');
  const resetBtn = document.getElementById('btn-reset-form');

  function updateFormValidity() {
    const katOk = Boolean(inputKat.value.trim());
    const prosesOk = Boolean(inputProses.value.trim());
    const rawPh = inputPh.value;
    const phValidation = validatePhInput(rawPh);

    if (rawPh.trim() !== '' && !phValidation.valid) {
      phErrorMsg.hidden = false;
      inputPh.classList.add('invalid');
    } else {
      phErrorMsg.hidden = true;
      inputPh.classList.remove('invalid');
    }

    const kemasanOk = Boolean(inputKemasan.value.trim());
    const simpanOk = Boolean(inputSimpan.value.trim());
    const warnaOk = Boolean(inputWarna.value.trim());

    submitBtn.disabled = !(
      katOk &&
      prosesOk &&
      phValidation.valid &&
      kemasanOk &&
      simpanOk &&
      warnaOk
    );
  }

  // Dropdown Kategori dengan kotak cari
  function closeDropdown() {
    dropdownPanel.hidden = true;
    triggerBtn.setAttribute('aria-expanded', 'false');
  }

  function openDropdown() {
    dropdownPanel.hidden = false;
    triggerBtn.setAttribute('aria-expanded', 'true');
    searchInput.value = '';
    filterCategoryList('');
    searchInput.focus();
  }

  function filterCategoryList(query) {
    const q = query.trim().toLowerCase();
    let visibleCount = 0;
    const items = optionsList.querySelectorAll('li[data-search]');
    items.forEach((li) => {
      const text = li.getAttribute('data-search') || '';
      const match = q === '' || text.includes(q);
      li.hidden = !match;
      if (match) visibleCount++;
    });
    emptyMsg.hidden = visibleCount > 0;
  }

  triggerBtn.addEventListener('click', () => {
    if (dropdownPanel.hidden) {
      openDropdown();
    } else {
      closeDropdown();
    }
  });

  searchInput.addEventListener('input', (e) => {
    filterCategoryList(e.target.value);
  });

  optionsList.addEventListener('click', (e) => {
    const btn = e.target.closest('.category-option-btn');
    if (!btn) return;
    const code = btn.getAttribute('data-code') || '';
    const label = btn.getAttribute('data-label') || '';
    inputKat.value = code;
    triggerText.textContent = label;
    triggerBtn.classList.remove('placeholder');

    optionsList.querySelectorAll('.category-option-btn').forEach((b) => {
      b.classList.toggle('selected', b === btn);
    });
    optionsList.querySelectorAll('li[role="option"]').forEach((li) => {
      li.setAttribute('aria-selected', li.getAttribute('data-code') === code ? 'true' : 'false');
    });

    closeDropdown();
    updateFormValidity();
  });

  document.addEventListener('click', (e) => {
    const picker = document.getElementById('category-picker');
    if (picker && !picker.contains(e.target)) {
      closeDropdown();
    }
  });

  // Swatch Target Color
  swatchButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-color') || '';
      inputWarna.value = color;
      swatchButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('selected', active);
        b.setAttribute('aria-checked', active ? 'true' : 'false');
      });
      updateFormValidity();
    });
  });

  inputProses.addEventListener('change', updateFormValidity);
  inputPh.addEventListener('input', updateFormValidity);
  inputKemasan.addEventListener('change', updateFormValidity);
  inputSimpan.addEventListener('change', updateFormValidity);

  // Tombol Reset
  resetBtn.addEventListener('click', () => {
    inputKat.value = '';
    triggerText.textContent = 'Pilih kategori pangan...';
    triggerBtn.classList.add('placeholder');
    optionsList.querySelectorAll('.category-option-btn').forEach((b) => b.classList.remove('selected'));
    optionsList.querySelectorAll('li[role="option"]').forEach((li) => li.setAttribute('aria-selected', 'false'));

    inputProses.value = '';
    inputPh.value = '';
    inputPh.classList.remove('invalid');
    phErrorMsg.hidden = true;
    inputKemasan.value = '';
    inputSimpan.value = '';
    inputWarna.value = '';
    swatchButtons.forEach((b) => {
      b.classList.remove('selected');
      b.setAttribute('aria-checked', 'false');
    });
    updateFormValidity();
  });

  // Submit -> Navigasi ke #/hasil?...
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const phCheck = validatePhInput(inputPh.value);
    if (!phCheck.valid) {
      updateFormValidity();
      return;
    }
    const params = new URLSearchParams({
      kat: inputKat.value.trim(),
      proses: inputProses.value.trim(),
      ph: phCheck.normalizedText,
      kemasan: inputKemasan.value.trim(),
      simpan: inputSimpan.value.trim(),
      warna: inputWarna.value.trim(),
    });
    window.location.hash = `#/hasil?${params.toString()}`;
  });

  updateFormValidity();
}

