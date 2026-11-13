import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  evaluateMaterial,
  getRecommendations,
  filterCombinations,
  parsePhValue,
  isCategoryMatched,
} from '../src/engine/recommend.js';
import {
  getMaterialExtensionStatus,
  EXTENSION_COMPATIBILITY_RECORDS,
} from '../src/engine/process-extensions.js';
import {
  hexToHsl,
  computeInteractiveMix,
} from '../src/engine/color-science.js';
import { validatePhInput, renderFormPage } from '../src/pages/form.js';
import { renderResultsPage } from '../src/pages/results.js';
import { renderHomePage } from '../src/pages/home.js';
import { renderAboutPage } from '../src/pages/about.js';
import { renderDetailPage } from '../src/pages/detail.js';
import { renderMixPage } from '../src/pages/mix.js';
import { renderBookletIndexPage, renderBookletGroupPage } from '../src/pages/booklet.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'public', 'data');

const materials = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'materials.json'), 'utf8'));
const combinations = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'combinations.json'), 'utf8'));
const booklet = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'booklet.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'categories.json'), 'utf8'));
const options = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'options.json'), 'utf8'));
const references = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'references.json'), 'utf8'));

const categoryMap = new Map(categories.map((c) => [c.code, c]));
const packagingExposureMap = new Map();
for (const opt of options) {
  if (opt.type === 'Jenis Kemasan' && opt.description) {
    const m = opt.description.match(/Paparan cahaya:\s*(.+)$/i);
    if (m) packagingExposureMap.set(opt.value, m[1].trim());
  }
}
const materialIdsInCombos = new Set();
for (const c of combinations) {
  if (c.a?.id) materialIdsInCombos.add(c.a.id);
  if (c.b?.id) materialIdsInCombos.add(c.b.id);
}

const refMap = new Map(references.map((r) => [r.code, r]));
const mockDataStore = {
  materials,
  combinations,
  booklet,
  categories,
  options,
  references,
  categoryMap,
  refMap,
  packagingExposureMap,
  materialIdsInCombos,
};

export const testSuite = [
  {
    name: 'Kasus Uji 1a (Bagian 7 & 15.1): Acuan 1 — Kategori 14.0, Pasteurisasi, pH 3,5, Botol PET bening, Suhu ruang, Orange',
    fn: () => {
      const res = getRecommendations(
        materials,
        {
          kat: '14.0',
          proses: 'Pasteurisasi',
          ph: '3,5',
          kemasan: 'Botol PET bening',
          simpan: 'Suhu ruang',
          warna: 'Orange',
        },
        { categoryMap, packagingExposureMap }
      );
      assert.equal(res.sangatSesuai.length, 1, 'Jumlah Sangat sesuai harus 1');
      assert.equal(res.sangatSesuai[0].material.id, 'NC-006', 'Bahan teratas harus NC-006');
      assert.equal(res.sesuaiDenganCatatan.length, 15, 'Jumlah Sesuai dengan catatan harus 15');
      assert.equal(res.tersaring.length, 2, 'Jumlah Tersaring harus 2');
    },
  },
  {
    name: 'Kasus Uji 1b (Bagian 7 & 15.1): Acuan 2 — Kategori 01.0, UHT, pH 6,7, Karton aseptik, Chiller, Red',
    fn: () => {
      const res = getRecommendations(
        materials,
        {
          kat: '01.0',
          proses: 'UHT',
          ph: '6,7',
          kemasan: 'Karton aseptik',
          simpan: 'Chiller',
          warna: 'Red',
        },
        { categoryMap, packagingExposureMap }
      );
      assert.equal(res.sangatSesuai.length, 8, 'Jumlah Sangat sesuai harus 8');
      const top3 = res.sangatSesuai.slice(0, 3).map((x) => x.material.id);
      assert.deepEqual(top3, ['NC-041', 'NC-042', 'NC-043'], 'Tiga bahan teratas harus NC-041, NC-042, NC-043');
      assert.equal(res.sesuaiDenganCatatan.length, 3, 'Jumlah Sesuai dengan catatan harus 3');
      assert.equal(res.tersaring.length, 15, 'Jumlah Tersaring harus 15');

      const filteredIds = res.tersaring.map((x) => x.material.id);
      assert.ok(filteredIds.includes('NC-069'), 'NC-069 harus masuk daftar tersaring');
      assert.ok(filteredIds.includes('NC-070'), 'NC-070 harus masuk daftar tersaring');

      const nc069 = res.tersaring.find((x) => x.material.id === 'NC-069');
      assert.ok(
        nc069.filterReasons.some((r) => r.includes('pH')),
        'Alasan tersaring NC-069 harus karena pH'
      );
    },
  },
  {
    name: 'Kasus Uji 1c (Bagian 7 & 15.1): Acuan 3 — Kategori 07.0, Baking / pemanggangan, pH 6,0, Aluminium foil / metalized, Suhu ruang, Yellow',
    fn: () => {
      const res = getRecommendations(
        materials,
        {
          kat: '07.0',
          proses: 'Baking / pemanggangan',
          ph: '6,0',
          kemasan: 'Aluminium foil / metalized',
          simpan: 'Suhu ruang',
          warna: 'Yellow',
        },
        { categoryMap, packagingExposureMap }
      );
      assert.equal(res.sangatSesuai.length, 17, 'Jumlah Sangat sesuai harus 17');
      const top3 = res.sangatSesuai.slice(0, 3).map((x) => x.material.id);
      assert.deepEqual(top3, ['NC-007', 'NC-022', 'NC-023'], 'Tiga bahan teratas harus NC-007, NC-022, NC-023');
      assert.equal(res.sesuaiDenganCatatan.length, 5, 'Jumlah Sesuai dengan catatan harus 5');
      assert.equal(res.tersaring.length, 0, 'Jumlah Tersaring harus 0');
    },
  },
  {
    name: 'Kasus Uji 2 (Bagian 15.1): Bahan tanpa data pH — Kriteria pH tidak muncul dan tidak memengaruhi grup',
    fn: () => {
      const fictionalNoPh = {
        id: 'NC-999',
        name: 'Bahan Uji Tanpa pH',
        group: 'Karbo',
        colors: ['Black'],
        categories: ['07.0'],
        ph: { min: null, max: null },
        heat: 'Tinggi',
        light: 'Tinggi',
        processes: ['Baking / pemanggangan'],
      };
      const evalRes = evaluateMaterial(fictionalNoPh, {
        kat: '07.0',
        proses: 'Baking / pemanggangan',
        ph: '6,0',
        kemasan: 'Botol kaca bening',
        simpan: 'Suhu ruang',
        warna: 'Black',
      });
      assert.ok(evalRes, 'Bahan harus dievaluasi');
      assert.equal(
        evalRes.criteria.some((c) => c.key === 'ph'),
        false,
        'Kriteria pH tidak boleh muncul'
      );
      assert.equal(evalRes.group, 'Sangat sesuai', 'Harus tetap masuk grup Sangat sesuai');
    },
  },
  {
    name: 'Kasus Uji 3 (Bagian 15.1): Warna pengguna tidak ada pada kolom Warna bahan — Bahan tidak tampil di mana pun pada hasil',
    fn: () => {
      const res = getRecommendations(materials, {
        kat: '14.0',
        proses: 'Pasteurisasi',
        ph: '3,5',
        kemasan: 'Botol PET bening',
        simpan: 'Suhu ruang',
        warna: 'Blue',
      });
      const allReturned = [
        ...res.sangatSesuai,
        ...res.sesuaiDenganCatatan,
        ...res.tersaring,
      ];
      for (const item of allReturned) {
        assert.ok(
          item.material.colors.includes('Blue'),
          `Bahan ${item.material.id} tanpa warna Blue tidak boleh muncul`
        );
      }
      // Pastikan bahan Yellow murni seperti NC-001 tidak muncul sama sekali
      assert.equal(
        allReturned.some((x) => x.material.id === 'NC-001'),
        false,
        'NC-001 (Yellow) tidak boleh muncul pada pencarian Blue'
      );
    },
  },
  {
    name: 'Kasus Uji 4 (Bagian 15.1): pH di luar rentang bahan sejauh 1,5 — Bahan masuk daftar tersaring dengan alasan pH',
    fn: () => {
      const sampleMat = {
        id: 'NC-998',
        name: 'Bahan Uji Rentang pH',
        group: 'Karotenoid',
        colors: ['Orange'],
        categories: ['14.0'],
        ph: { min: 4.0, max: 7.0 },
        heat: 'Tinggi',
        light: 'Tinggi',
        processes: ['Pasteurisasi'],
      };
      // pH 2,5 -> selisih 1,5 di bawah pH Min 4,0
      const evaluated = evaluateMaterial(sampleMat, {
        kat: '14.0',
        proses: 'Pasteurisasi',
        ph: '2,5',
        kemasan: 'Botol PET bening',
        simpan: 'Suhu ruang',
        warna: 'Orange',
      });
      assert.equal(evaluated.group, 'Tersaring', 'Harus masuk grup Tersaring');
      assert.equal(evaluated.kurangSesuaiCount, 1);
      assert.ok(
        evaluated.filterReasons[0].includes('pH 2,5 di luar rentang 4,0–7,0'),
        'Alasan tersaring harus menyebutkan pH di luar rentang'
      );
    },
  },
  {
    name: 'Kasus Uji 5 (Bagian 15.1): pH diisi "3,5" dan "3.5" — Keduanya diterima sebagai 3,5',
    fn: () => {
      const vComma = validatePhInput('3,5');
      const vDot = validatePhInput('3.5');
      assert.equal(vComma.valid, true);
      assert.equal(vDot.valid, true);
      assert.equal(vComma.value, 3.5);
      assert.equal(vDot.value, 3.5);
      assert.equal(parsePhValue('3,5'), 3.5);
      assert.equal(parsePhValue('3.5'), 3.5);
    },
  },
  {
    name: 'Kasus Uji 6 (Bagian 15.1): pH diisi "abc" atau 15 — Validasi menolak input dan menampilkan pesan galat',
    fn: () => {
      const vAbc = validatePhInput('abc');
      const v15 = validatePhInput('15');
      const vNeg = validatePhInput('-1');
      assert.equal(vAbc.valid, false, '"abc" harus ditolak');
      assert.equal(v15.valid, false, '15 harus ditolak');
      assert.equal(vNeg.valid, false, '-1 harus ditolak');

      const formHtml = renderFormPage(mockDataStore, new URLSearchParams());
      assert.ok(
        formHtml.includes('Masukkan angka antara 0 dan 14.'),
        'Form harus memuat teks pesan galat pH sesuai spesifikasi'
      );
      assert.ok(
        formHtml.includes('id="btn-find-recommendation" class="btn btn-primary" disabled'),
        'Tombol Find Recommendation harus nonaktif secara bawaan saat input belum valid'
      );
    },
  },
  {
    name: 'Kasus Uji 7 (Bagian 15.1): Tidak ada bahan lolos — Tampil pesan hasil kosong tanpa galat',
    fn: () => {
      const emptyData = {
        ...mockDataStore,
        materials: [],
      };
      const params = new URLSearchParams({
        kat: '14.0',
        proses: 'Pasteurisasi',
        ph: '3.5',
        kemasan: 'Botol PET bening',
        simpan: 'Suhu ruang',
        warna: 'Orange',
      });
      const html = renderResultsPage(emptyData, params);
      assert.ok(
        html.includes('Belum ada bahan yang cocok. Coba ubah pH, proses, atau kemasan.'),
        'Harus menampilkan pesan keadaan hasil kosong sesuai Bagian 11.4'
      );
    },
  },
  {
    name: 'Kasus Uji 8 (Bagian 15.1): Bahan tanpa foto atau tanpa dosis acuan — Bagian itu tidak ditampilkan',
    fn: () => {
      // NC-001 tidak memiliki Dosis Acuan (dosage: null)
      const params = new URLSearchParams({
        kat: '07.0',
        proses: 'Baking / pemanggangan',
        ph: '6.0',
        kemasan: 'Aluminium foil / metalized',
        simpan: 'Suhu ruang',
        warna: 'Yellow',
      });
      const html = renderResultsPage(mockDataStore, params);
      // Ambil blok kartu NC-001
      const nc001Start = html.indexOf('data-material-id="NC-001"');
      assert.ok(nc001Start !== -1, 'Kartu NC-001 harus ditemukan');
      const nc001End = html.indexOf('</article>', nc001Start);
      const nc001Html = html.slice(nc001Start, nc001End);
      assert.equal(
        nc001Html.includes('Dosis Acuan:'),
        false,
        'Kartu bahan tanpa Dosis Acuan tidak boleh menampilkan label Dosis Acuan'
      );
    },
  },
  {
    name: 'Kasus Uji 9 (Bagian 15.1): Explore Color Mix: Orange, pH 3,5, proses Pasteurisasi — Hanya kombinasi yang sesuai & urut Skor menurun',
    fn: () => {
      const combos = filterCombinations(combinations, {
        resultColor: 'Orange',
        ph: '3,5',
        process: 'Pasteurisasi',
      });
      assert.ok(combos.length > 0, 'Harus ada kombinasi yang cocok');
      for (let i = 0; i < combos.length; i++) {
        const c = combos[i];
        assert.equal(c.resultColor, 'Orange', 'Warna hasil harus Orange');
        assert.ok(
          c.ph.min <= 3.5 && 3.5 <= c.ph.max,
          `Kombinasi ${c.id} harus memenuhi pH Min <= 3,5 <= pH Max`
        );
        assert.ok(
          c.processes.includes('Pasteurisasi'),
          `Kombinasi ${c.id} harus memuat proses Pasteurisasi`
        );
        if (i > 0) {
          assert.ok(
            combos[i - 1].score >= c.score,
            'Kombinasi harus diurutkan berdasarkan Skor menurun'
          );
        }
      }
    },
  },
  {
    name: 'Kasus Uji 10 (Bagian 15.1): Salin URL hasil dan buka kembali — Input dan hasil identik',
    fn: () => {
      const queryStr =
        'kat=14.0&proses=Pasteurisasi&ph=3.5&kemasan=Botol%20PET%20bening&simpan=Suhu%20ruang&warna=Orange';
      const htmlA = renderResultsPage(mockDataStore, new URLSearchParams(queryStr));
      const htmlB = renderResultsPage(mockDataStore, new URLSearchParams(queryStr));
      assert.equal(htmlA, htmlB, 'Hasil render dari URL yang disalin harus 100% identik');
      assert.ok(htmlA.includes('429340 Shade Mandarin (Exberry)'), 'Harus memuat kandidat NC-006');
    },
  },
  {
    name: 'Kasus Uji 11 (Bagian 15.1): Periksa public/data/*.json — Hanya kolom daftar putih; tanpa harga, MoQ, atau supplier',
    fn: () => {
      const forbiddenKeys = ['harga', 'price', 'moq', 'supplier', 'vendor', 'dokumen', 'coa', 'halal'];
      const jsonFiles = [
        'materials.json',
        'combinations.json',
        'booklet.json',
        'categories.json',
        'options.json',
        'references.json',
      ];
      for (const file of jsonFiles) {
        const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
        const parsed = JSON.parse(content);
        assert.ok(Array.isArray(parsed) && parsed.length > 0, `${file} harus berisi array data`);
        const keys = Object.keys(parsed[0]).map((k) => k.toLowerCase());
        for (const fk of forbiddenKeys) {
          assert.equal(
            keys.includes(fk),
            false,
            `${file} tidak boleh memiliki kunci terlarang "${fk}"`
          );
        }
      }

      // Pastikan kunci objek pada materials.json persis sesuai daftar putih
      const allowedMaterialKeys = new Set([
        'id',
        'name',
        'group',
        'source',
        'form',
        'colors',
        'hex',
        'solubility',
        'categories',
        'ph',
        'heat',
        'light',
        'processes',
        'packaging',
        'storage',
        'dosage',
        'pros',
        'cons',
        'animal',
        'evaluation',
        'photos',
        'refs',
      ]);
      for (const mat of materials) {
        for (const k of Object.keys(mat)) {
          assert.ok(
            allowedMaterialKeys.has(k),
            `Kunci "${k}" pada materials.json berada di luar daftar putih`
          );
        }
      }
    },
  },
  {
    name: 'Kasus Uji 12 (Bagian 15.1): Periksa teks antarmuka — Tidak ada frasa "belum diuji", "simulasi", atau "data belum tersedia"',
    fn: () => {
      const homeHtml = renderHomePage();
      const formHtml = renderFormPage(mockDataStore, new URLSearchParams());
      const resultsHtml = renderResultsPage(
        mockDataStore,
        new URLSearchParams(
          'kat=14.0&proses=Pasteurisasi&ph=3.5&kemasan=Botol%20PET%20bening&simpan=Suhu%20ruang&warna=Orange'
        )
      );
      const resultsGranulasiHtml = renderResultsPage(
        mockDataStore,
        new URLSearchParams(
          'kat=14.0&proses=Granulasi&ph=3.5&kemasan=Botol%20PET%20bening&simpan=Suhu%20ruang&warna=Red'
        )
      );
      const aboutHtml = renderAboutPage(mockDataStore);
      const detailHtml = renderDetailPage(mockDataStore, 'NC-006');
      const detailUnknownHtml = renderDetailPage(mockDataStore, 'NC-003');
      const mixHtml = renderMixPage(mockDataStore, new URLSearchParams('warna=Orange&proses=Granulasi'));
      const bookletIdxHtml = renderBookletIndexPage(mockDataStore);
      const bookletBasicHtml = renderBookletGroupPage(mockDataStore, 'Dasar Pewarna Alami');
      const bookletGrpHtml = renderBookletGroupPage(mockDataStore, 'Karotenoid');

      const combinedUiText = [
        homeHtml,
        formHtml,
        resultsHtml,
        resultsGranulasiHtml,
        aboutHtml,
        detailHtml,
        detailUnknownHtml,
        mixHtml,
        bookletIdxHtml,
        bookletBasicHtml,
        bookletGrpHtml,
      ]
        .join('\n')
        .toLowerCase();

      for (const forbiddenPhrase of ['belum diuji', 'simulasi', 'data belum tersedia']) {
        assert.equal(
          combinedUiText.includes(forbiddenPhrase),
          false,
          `Teks antarmuka tidak boleh memuat frasa "${forbiddenPhrase}"`
        );
      }
    },
  },
  {
    name: 'Kasus Uji Tambahan (Bagian 4.2): Pencocokan subkategori turunan (mis. 14.1 cocok dengan induk 14.0)',
    fn: () => {
      assert.equal(isCategoryMatched(['01.0', '14.0'], '14.1'), true);
      assert.equal(isCategoryMatched(['01.0', '14.0'], '14.0'), true);
      assert.equal(isCategoryMatched(['01.0', '07.0'], '14.1'), false);
    },
  },
  {
    name: 'Kasus Uji Tambahan (Bagian 8.2 & 10): Detail Bahan, Explore Color Mix, dan Booklet saling terhubung serta menyembunyikan bagian kosong',
    fn: () => {
      const detailNc006 = renderDetailPage(mockDataStore, 'NC-006');
      assert.ok(
        detailNc006.includes('Foto larutan 429340 Shade Mandarin (Exberry)'),
        'Galeri foto harus memiliki alt text sesuai Bagian 8.2'
      );
      assert.ok(
        detailNc006.includes('#/booklet/Karotenoid'),
        'Detail bahan harus memiliki tautan ke halaman kelompok Booklet'
      );
      assert.ok(
        detailNc006.includes('#/mix?bahan=NC-006'),
        'Detail bahan harus memiliki tautan ke Explore Color Mix'
      );

      // Uji bahan tanpa foto (fiktif) -> galeri foto disembunyikan
      const noPhotoData = {
        ...mockDataStore,
        materials: [
          ...materials,
          {
            id: 'NC-990',
            name: 'Bahan Tanpa Foto',
            group: 'Karbon',
            colors: ['Black'],
            photos: [],
            refs: [],
          },
        ],
      };
      const detailNoPhoto = renderDetailPage(noPhotoData, 'NC-990');
      assert.equal(
        detailNoPhoto.includes('Galeri Foto Larutan'),
        false,
        'Galeri foto harus disembunyikan bila bahan tidak memiliki foto'
      );

      // Uji Booklet Melanin (tinta cumi) yang kolom Faktor Stabilitas-nya kosong
      const melaninHtml = renderBookletGroupPage(mockDataStore, 'Melanin (tinta cumi)');
      assert.equal(
        melaninHtml.includes('<h2 class="detail-section-title">Faktor Stabilitas</h2>'),
        false,
        'Bagian Faktor Stabilitas yang kosong pada Melanin harus disembunyikan'
      );
      assert.ok(
        melaninHtml.includes('NC-082'),
        'Halaman Booklet Melanin harus menampilkan contoh bahan perusahaan NC-082'
      );
    },
  },
  {
    name: 'Kasus Uji Process Compatibility Extension (Granulasi): Profil teknis 85 bahan & status Compatible, Incompatible, Unknown bekerja konsisten',
    fn: () => {
      // 1. Pastikan seluruh 85 bahan (NC-001 s.d. NC-085) memiliki profil teknis granulasi lengkap
      for (const mat of materials) {
        const ext = getMaterialExtensionStatus(mat.id, 'Granulasi');
        assert.ok(ext, `Profil granulasi harus ada untuk ${mat.id}`);
        assert.ok(
          ['Compatible', 'Incompatible', 'Unknown'].includes(ext.status),
          `Status granulasi ${mat.id} harus valid`
        );
        assert.ok(ext.recommendedMethod, `recommendedMethod harus terisi untuk ${mat.id}`);
        assert.ok(ext.maxProductTemp, `maxProductTemp harus terisi untuk ${mat.id}`);
        assert.ok(ext.moistureAwLimit, `moistureAwLimit harus terisi untuk ${mat.id}`);
        assert.ok(ext.binderAndMatrix, `binderAndMatrix harus terisi untuk ${mat.id}`);
        assert.ok(ext.specklingRisk, `specklingRisk harus terisi untuk ${mat.id}`);
        assert.ok(ext.evidence, `evidence harus terisi untuk ${mat.id}`);
      }

      // 2. Uji evaluasi Granulasi pada warna Orange (Kategori 14.0, pH 3,5, Botol PET bening)
      const resOrange = getRecommendations(
        materials,
        {
          kat: '14.0',
          proses: 'Granulasi',
          ph: '3,5',
          kemasan: 'Botol PET bening',
          simpan: 'Suhu ruang',
          warna: 'Orange',
        },
        { categoryMap, packagingExposureMap }
      );
      // NC-006 berstatus Compatible dan memenuhi seluruh kriteria lain -> masuk Sangat sesuai
      assert.ok(
        resOrange.sangatSesuai.some((x) => x.material.id === 'NC-006'),
        'NC-006 (Compatible) harus masuk Sangat sesuai pada proses Granulasi'
      );
      // Pastikan tidak ada bahan berstatus Unknown yang masuk ke Sangat sesuai
      for (const item of resOrange.sangatSesuai) {
        assert.equal(
          item.extensionProfile?.status,
          'Compatible',
          `Kandidat Sangat sesuai (${item.material.id}) wajib berstatus Compatible`
        );
      }

      // Bahan berstatus Unknown pada Orange (mis. NC-026 atau NC-030) harus berada di Sesuai dengan catatan
      const nc026InCatatan = resOrange.sesuaiDenganCatatan.find(
        (x) => x.material.id === 'NC-026'
      );
      assert.ok(
        nc026InCatatan,
        'NC-026 (Unknown) harus masuk ke Sesuai dengan catatan, bukan Sangat sesuai'
      );
      const procCrit026 = nc026InCatatan.criteria.find((c) => c.key === 'process');
      assert.equal(procCrit026.extensionStatus, 'Unknown');
      assert.ok(
        procCrit026.reason.includes('Fluid-Bed Top-Spray Granulation'),
        'Alasan Unknown harus memuat keterangan kompatibilitas Fluid-Bed Top-Spray Granulation'
      );

      // 3. Uji bahan berstatus Incompatible (mis. NC-035 Beetroot pada warna Red) -> wajib masuk Tersaring
      const resRed = getRecommendations(
        materials,
        {
          kat: '14.0',
          proses: 'Granulasi',
          ph: '4,5',
          kemasan: 'Aluminium foil / metalized',
          simpan: 'Suhu ruang',
          warna: 'Red',
        },
        { categoryMap, packagingExposureMap }
      );
      const nc035Filtered = resRed.tersaring.find((x) => x.material.id === 'NC-035');
      assert.ok(
        nc035Filtered,
        'NC-035 (Betalain / Incompatible pada granulasi basah termal) harus masuk daftar Tersaring'
      );
      assert.equal(nc035Filtered.extensionProfile?.status, 'Incompatible');

      // 4. Uji Explore Color Mix dengan filter proses Granulasi
      const granCombos = filterCombinations(combinations, {
        materials,
        resultColor: 'Orange',
        ph: '3,5',
        process: 'Granulasi',
      });
      assert.ok(granCombos.length > 0, 'Harus ada pasangan kombinasi Compatible untuk Granulasi');
      for (const c of granCombos) {
        const stA = EXTENSION_COMPATIBILITY_RECORDS.Granulasi[c.a.id]?.status;
        const stB = EXTENSION_COMPATIBILITY_RECORDS.Granulasi[c.b.id]?.status;
        assert.equal(stA, 'Compatible', `Bahan A (${c.a.id}) pada kombinasi harus Compatible`);
        assert.equal(stB, 'Compatible', `Bahan B (${c.b.id}) pada kombinasi harus Compatible`);
      }
    },
  },
  {
    name: 'Kasus Uji Kalibrasi Warna & Explore Color Mix: Yellow dan seluruh Target Color memiliki shade akurat (bukan hitam/abu-abu)',
    fn: () => {
      const matMap = new Map(materials.map((m) => [m.id, m]));
      const allTargetColors = [
        'Yellow',
        'Orange',
        'Red',
        'Pink',
        'Purple',
        'Blue',
        'Green',
        'Brown',
        'Black',
      ];

      for (const col of allTargetColors) {
        const list = filterCombinations(combinations, {
          materials,
          resultColor: col,
        });
        assert.ok(list.length > 0, `Target Color ${col} harus memiliki kombinasi yang valid`);

        for (const c of list) {
          assert.equal(c.resultColor, col);
          const hsl = hexToHsl(c.resultHex);
          const colsA = matMap.get(c.a.id)?.colors || [];
          const colsB = matMap.get(c.b.id)?.colors || [];

          if (col === 'Yellow') {
            assert.ok(
              hsl.h >= 42 && hsl.h <= 62 && hsl.s >= 80 && hsl.l >= 50,
              `Shade Yellow (${c.resultHex}) harus kuning cerah/hangat, bukan abu-abu/hitam`
            );
            assert.ok(
              !colsA.includes('Blue') &&
                !colsB.includes('Blue') &&
                !colsA.includes('Green') &&
                !colsB.includes('Green') &&
                !colsA.includes('Black') &&
                !colsB.includes('Black'),
              `Kombinasi Yellow (${c.id}) tidak boleh mencampur bahan Blue/Green/Black`
            );
          } else if (col === 'Orange') {
            assert.ok(
              hsl.h >= 15 && hsl.h <= 41 && hsl.s >= 75 && hsl.l >= 45,
              `Shade Orange (${c.resultHex}) harus oranye cerah`
            );
          } else if (col === 'Green') {
            assert.ok(
              hsl.h >= 80 && hsl.h <= 155 && hsl.s >= 55 && hsl.l >= 38,
              `Shade Green (${c.resultHex}) harus hijau segar, bukan abu-abu`
            );
          } else if (col === 'Purple') {
            const hasBlack = colsA.includes('Black') || colsB.includes('Black');
            if (hasBlack) {
              assert.ok(
                hsl.h >= 265 && hsl.h <= 310 && hsl.s >= 40 && hsl.l >= 20,
                `Shade Deep Purple/Anggur (${c.resultHex}) harus ungu tua anggur`
              );
            } else {
              assert.ok(
                hsl.h >= 265 && hsl.h <= 310 && hsl.s >= 55 && hsl.l >= 38,
                `Shade Purple (${c.resultHex}) harus ungu jelas, bukan abu-abu`
              );
            }
          }
        }
      }

      // Uji fungsi eksplorasi langsung (Interactive Mix Calculator)
      const matYellow1 = matMap.get('NC-007');
      const matYellow2 = matMap.get('NC-014');
      const liveMix = computeInteractiveMix(matYellow1, matYellow2, 60);
      assert.equal(liveMix.resultColor, 'Yellow');
    },
  },
];

