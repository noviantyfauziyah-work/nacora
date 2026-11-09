import {
  escapeHtml,
  TARGET_COLOR_HEX,
  doesMaterialMatchBookletGroup,
  resolveBookletGroupName,
} from '../data-store.js';
import { formatNumberId } from '../engine/recommend.js';
import {
  getBookletGranulationGuide,
  getMaterialExtensionStatus,
} from '../engine/process-extensions.js';
import { getCalibratedMaterialHex } from '../engine/color-science.js';
import { renderReferencesList } from './detail.js';

function getMaterialsForBookletGroup(materials, bookletGroup) {
  if (bookletGroup === 'Dasar Pewarna Alami') {
    return [];
  }
  return materials.filter((m) =>
    doesMaterialMatchBookletGroup(m.group, bookletGroup)
  );
}

function getRepresentativeHex(materials, bookletGroup) {
  if (bookletGroup === 'Dasar Pewarna Alami') {
    return '#008040';
  }
  const groupMats = getMaterialsForBookletGroup(materials, bookletGroup);
  const firstWithHex = groupMats.find((m) => Boolean(m.hex));
  return firstWithHex ? getCalibratedMaterialHex(firstWithHex) : '#008040';
}

export function renderBookletIndexPage(data) {
  const { booklet, materials } = data;

  return `
    <div class="page-header">
      <h1 class="page-title">Color Learning Booklet</h1>
      <p class="page-subtitle">
        Pelajari karakteristik dasar pewarna alami serta 11 kelompok pigmen beserta koleksi bahan perusahaan.
      </p>
    </div>

    <div class="booklet-index-grid">
      ${booklet
        .map((item) => {
          const isBasic = item.group === 'Dasar Pewarna Alami';
          const groupMats = getMaterialsForBookletGroup(materials, item.group);
          const swatchHex = getRepresentativeHex(materials, item.group);
          const countLabel = isBasic
            ? `${materials.length} total bahan di database`
            : `${groupMats.length} bahan perusahaan`;
          const href = `#/booklet/${encodeURIComponent(item.group)}`;

          return `
            <article class="card card-interactive booklet-index-card">
              <div>
                <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
                  <div
                    class="swatch-box"
                    style="background-color: ${escapeHtml(swatchHex)};"
                    aria-hidden="true"
                  ></div>
                  <div>
                    <h2 style="font-size: 1.2rem; margin: 0 0 4px 0;">
                      <a href="${escapeHtml(href)}" style="color: var(--color-heading);">${escapeHtml(item.group)}</a>
                    </h2>
                    <span class="chip">${escapeHtml(countLabel)}</span>
                  </div>
                </div>
                ${
                  item.introduction
                    ? `<p style="margin: 0; font-size: 0.9375rem; color: var(--color-text);">${escapeHtml(item.introduction)}</p>`
                    : ''
                }
              </div>

              <div>
                <a href="${escapeHtml(href)}" class="btn btn-secondary btn-sm">
                  Baca Materi →
                </a>
              </div>
            </article>
          `;
        })
        .join('')}
    </div>
  `;
}

export function renderBookletGroupPage(data, requestedGroup) {
  const { booklet, materials, refMap } = data;
  const resolvedName = resolveBookletGroupName(requestedGroup, booklet);
  const currentEntry = booklet.find((b) => b.group === resolvedName);

  if (!currentEntry) {
    return `
      <div class="page-header">
        <h1 class="page-title">Topik Booklet Tidak Ditemukan</h1>
        <p class="page-subtitle">Halaman kelompok "${escapeHtml(requestedGroup)}" tidak ditemukan.</p>
      </div>
      <div class="card">
        <a href="#/booklet" class="btn btn-primary">Kembali ke Indeks Booklet</a>
      </div>
    `;
  }

  const swatchHex = getRepresentativeHex(materials, currentEntry.group);
  const groupMaterials = getMaterialsForBookletGroup(
    materials,
    currentEntry.group
  );
  const granulationGuide = getBookletGranulationGuide(currentEntry.group);

  // Tujuh bagian kolom Booklet (Bagian yang kosong disembunyikan — Bagian 10)
  const contentSections = [
    { id: 'sec-pengenalan', title: 'Pengenalan', text: currentEntry.introduction },
    {
      id: 'sec-karakteristik',
      title: 'Karakteristik Warna',
      text: currentEntry.colorCharacteristics,
    },
    { id: 'sec-kelarutan', title: 'Kelarutan', text: currentEntry.solubility },
    {
      id: 'sec-stabilitas',
      title: 'Faktor Stabilitas',
      text: currentEntry.stabilityFactors,
    },
    {
      id: 'sec-aplikasi',
      title: 'Aplikasi Pangan',
      text: currentEntry.foodApplications,
    },
    {
      id: 'sec-kelebihan',
      title: 'Kelebihan dan Keterbatasan',
      text: currentEntry.prosAndCons,
    },
  ].filter((sec) => Boolean(sec.text));

  return `
    <div style="margin-bottom: 16px;">
      <a href="#/booklet" class="btn btn-secondary btn-sm">← Indeks Color Learning Booklet</a>
    </div>

    <!-- Dropdown Navigasi HP (Bagian 10) -->
    <div class="booklet-mobile-nav card" style="padding: 16px; margin-bottom: 20px;">
      <div class="form-row-2" style="gap: 12px;">
        <div class="form-group">
          <label class="form-label" for="booklet-mobile-group-select">Pilih Kelompok Pigmen</label>
          <select id="booklet-mobile-group-select" class="form-control">
            ${booklet
              .map(
                (b) => `
              <option value="${escapeHtml(b.group)}" ${b.group === currentEntry.group ? 'selected' : ''}>
                ${escapeHtml(b.group)}
              </option>
            `
              )
              .join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="booklet-mobile-section-select">Lompat ke Bagian</label>
          <select id="booklet-mobile-section-select" class="form-control">
            ${contentSections
              .map(
                (sec) => `
              <option value="${escapeHtml(sec.id)}">${escapeHtml(sec.title)}</option>
            `
              )
              .join('')}
            ${
              granulationGuide
                ? `<option value="sec-granulasi">Panduan Proses Granulasi</option>`
                : ''
            }
            ${
              groupMaterials.length > 0
                ? `<option value="sec-contoh-bahan">Contoh Bahan Perusahaan (${groupMaterials.length})</option>`
                : ''
            }
            ${
              currentEntry.refs?.length > 0
                ? `<option value="sec-rujukan">Rujukan</option>`
                : ''
            }
          </select>
        </div>
      </div>
    </div>

    <div class="booklet-layout">
      <!-- Navigasi Sisi Desktop (Bagian 10) -->
      <aside class="booklet-sidebar" aria-label="Navigasi Booklet">
        <div class="card" style="padding: 16px; margin-bottom: 16px;">
          <h2 style="font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-muted); margin-bottom: 10px;">
            Bagian Halaman Ini
          </h2>
          <ul class="booklet-nav-list">
            ${contentSections
              .map(
                (sec) => `
              <li>
                <a href="#/booklet/${encodeURIComponent(currentEntry.group)}" data-scroll-target="${escapeHtml(sec.id)}" class="booklet-nav-link booklet-section-jump">
                  ${escapeHtml(sec.title)}
                </a>
              </li>
            `
              )
              .join('')}
            ${
              granulationGuide
                ? `
              <li>
                <a href="#/booklet/${encodeURIComponent(currentEntry.group)}" data-scroll-target="sec-granulasi" class="booklet-nav-link booklet-section-jump">
                  Panduan Proses Granulasi
                </a>
              </li>
            `
                : ''
            }
            ${
              groupMaterials.length > 0
                ? `
              <li>
                <a href="#/booklet/${encodeURIComponent(currentEntry.group)}" data-scroll-target="sec-contoh-bahan" class="booklet-nav-link booklet-section-jump">
                  Contoh Bahan (${groupMaterials.length})
                </a>
              </li>
            `
                : ''
            }
            ${
              currentEntry.refs?.length > 0
                ? `
              <li>
                <a href="#/booklet/${encodeURIComponent(currentEntry.group)}" data-scroll-target="sec-rujukan" class="booklet-nav-link booklet-section-jump">
                  Rujukan
                </a>
              </li>
            `
                : ''
            }
          </ul>
        </div>

        <div class="card" style="padding: 16px;">
          <h2 style="font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-muted); margin-bottom: 10px;">
            Kelompok Pigmen
          </h2>
          <ul class="booklet-nav-list">
            ${booklet
              .map((b) => {
                const active = b.group === currentEntry.group;
                return `
                  <li>
                    <a href="#/booklet/${encodeURIComponent(b.group)}" class="booklet-nav-link ${active ? 'active' : ''}">
                      ${escapeHtml(b.group)}
                    </a>
                  </li>
                `;
              })
              .join('')}
          </ul>
        </div>
      </aside>

      <!-- Isi Materi Kelompok -->
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <section class="card" style="display: flex; align-items: center; gap: 16px;">
          <div class="swatch-box-lg" style="background-color: ${escapeHtml(swatchHex)};" aria-hidden="true"></div>
          <div>
            <div style="font-size: 0.875rem; font-weight: 600; color: var(--color-primary);">Color Learning Booklet</div>
            <h1 class="page-title" style="margin-bottom: 4px;">${escapeHtml(currentEntry.group)}</h1>
            ${
              groupMaterials.length > 0
                ? `<span class="chip">${groupMaterials.length} bahan perusahaan pada kelompok ini</span>`
                : `<span class="chip">Panduan Pengantar</span>`
            }
          </div>
        </section>

        ${contentSections
          .map(
            (sec) => `
          <section id="${escapeHtml(sec.id)}" class="card">
            <h2 class="detail-section-title">${escapeHtml(sec.title)}</h2>
            <p style="margin: 0; white-space: pre-line;">${escapeHtml(sec.text)}</p>
          </section>
        `
          )
          .join('')}

        ${
          granulationGuide
            ? `
          <section id="sec-granulasi" class="card">
            <h2 class="detail-section-title">Panduan Teknis Proses Granulasi &amp; Serbuk Instan</h2>
            <p style="margin: 0 0 12px 0; white-space: pre-line;">${escapeHtml(granulationGuide.summary)}</p>
            ${
              granulationGuide.keyParameters
                ? `
              <div class="info-box" style="margin: 0;">
                <strong>Parameter Kritis Formulasi &amp; Granulasi:</strong><br />
                ${escapeHtml(granulationGuide.keyParameters)}
              </div>
            `
                : ''
            }
            ${
              Array.isArray(granulationGuide.methodsComparison)
                ? `
              <table class="clean-table" style="margin-top: 12px;">
                <thead>
                  <tr>
                    <th scope="col">Metode Granulasi</th>
                    <th scope="col">Mekanisme Proses</th>
                    <th scope="col">Kesesuaian Pigmen Alami</th>
                  </tr>
                </thead>
                <tbody>
                  ${granulationGuide.methodsComparison
                    .map(
                      (m) => `
                    <tr>
                      <th scope="row">${escapeHtml(m.method)}</th>
                      <td>${escapeHtml(m.mechanism)}</td>
                      <td>${escapeHtml(m.suitability)}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            `
                : ''
            }
          </section>
        `
            : ''
        }

        <!-- Contoh Bahan Perusahaan pada Kelompok Ini (Bagian 10) -->
        ${
          groupMaterials.length > 0
            ? `
          <section id="sec-contoh-bahan" class="card">
            <h2 class="detail-section-title">
              Contoh Bahan Perusahaan (${groupMaterials.length} bahan)
            </h2>
            <div class="booklet-materials-grid">
              ${groupMaterials
                .map((mat) => {
                  const colorChips = (mat.colors || [])
                    .map((c) => {
                      const dot = TARGET_COLOR_HEX[c] || '#CCCCCC';
                      return `<span class="chip"><span class="chip-color-dot" style="background-color: ${escapeHtml(dot)};"></span>${escapeHtml(c)}</span>`;
                    })
                    .join('');
                  const phStr =
                    mat.ph?.min !== null && mat.ph?.max !== null
                      ? `pH ${formatNumberId(mat.ph.min)}–${formatNumberId(mat.ph.max)}`
                      : null;
                  const granStatus = getMaterialExtensionStatus(mat.id, 'Granulasi');

                  return `
                    <article class="card card-interactive" style="padding: 16px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
                      <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <div class="swatch-box" style="background-color: ${escapeHtml(mat.hex ? getCalibratedMaterialHex(mat) : '#F3F4F6')};">
                          ${mat.hex ? '' : '—'}
                        </div>
                        <div style="flex: 1; min-width: 0;">
                          <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-primary);">${escapeHtml(mat.id)}</div>
                          <h3 style="font-size: 1rem; margin: 0 0 6px 0;">
                            <a href="#/bahan/${encodeURIComponent(mat.id)}">${escapeHtml(mat.name)}</a>
                          </h3>
                          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${colorChips}
                            ${phStr ? `<span class="chip">${escapeHtml(phStr)}</span>` : ''}
                            ${granStatus ? `<span class="chip">Granulasi: ${escapeHtml(granStatus.status)}</span>` : ''}
                            ${mat.animal ? `<span class="chip chip-animal"><span aria-hidden="true">▲</span> Bahan hewani</span>` : ''}
                          </div>
                        </div>
                      </div>
                      <div>
                        <a href="#/bahan/${encodeURIComponent(mat.id)}" class="btn btn-secondary btn-sm">Lihat detail →</a>
                      </div>
                    </article>
                  `;
                })
                .join('')}
            </div>
          </section>
        `
            : ''
        }

        <!-- Daftar Rujukan (Bagian 10) -->
        ${
          Array.isArray(currentEntry.refs) && currentEntry.refs.length > 0
            ? `
          <section id="sec-rujukan" class="card">
            <h2 class="detail-section-title">Rujukan</h2>
            ${renderReferencesList(currentEntry.refs, refMap)}
          </section>
        `
            : ''
        }
      </div>
    </div>
  `;
}

export function attachBookletGroupEvents() {
  const groupSelect = document.getElementById('booklet-mobile-group-select');
  if (groupSelect) {
    groupSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val) {
        window.location.hash = `#/booklet/${encodeURIComponent(val)}`;
      }
    });
  }

  const sectionSelect = document.getElementById('booklet-mobile-section-select');
  if (sectionSelect) {
    sectionSelect.addEventListener('change', (e) => {
      const secId = e.target.value;
      const el = secId ? document.getElementById(secId) : null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  document.querySelectorAll('.booklet-section-jump').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-scroll-target');
      const el = targetId ? document.getElementById(targetId) : null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

