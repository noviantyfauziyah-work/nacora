import {
  buildEnhancedCombinations,
  getCalibratedMaterialHex,
} from './engine/color-science.js';

let cachedData = null;

export const DISCLAIMER_TEXT =
  'Hasil NACORA adalah rekomendasi awal berdasarkan data evaluasi internal dan literatur, bukan jaminan. Setiap kandidat perlu dicoba dan diuji oleh R&D pada produk Anda.';

export const TARGET_COLOR_HEX = {
  Yellow: '#F5D016',
  Orange: '#F28C28',
  Red: '#D92534',
  Pink: '#EE6B9E',
  Green: '#38B649',
  Blue: '#1E78D2',
  Purple: '#8238B0',
  Brown: '#7E4B26',
  Black: '#2B2D32',
};

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Memetakan nama kelompok pada Bahan ke nama kelompok pada Booklet (dan sebaliknya)
 */
export function resolveBookletGroupName(groupName, bookletList = []) {
  if (!groupName) return null;
  const exact = bookletList.find((b) => b.group === groupName);
  if (exact) return exact.group;

  const lower = groupName.toLowerCase();
  if (lower.startsWith('iridoid')) return 'Iridoid / genipin';
  if (lower.startsWith('flavonoid')) return 'Flavonoid (carthamus)';
  if (lower.startsWith('melanin')) return 'Melanin (tinta cumi)';

  const prefixMatch = bookletList.find(
    (b) =>
      lower.startsWith(b.group.toLowerCase()) ||
      b.group.toLowerCase().startsWith(lower)
  );
  return prefixMatch ? prefixMatch.group : groupName;
}

export function doesMaterialMatchBookletGroup(materialGroup, bookletGroup) {
  if (!materialGroup || !bookletGroup) return false;
  if (materialGroup === bookletGroup) return true;
  const mLow = materialGroup.toLowerCase();
  const bLow = bookletGroup.toLowerCase();
  if (mLow.startsWith('iridoid') && bLow.startsWith('iridoid')) return true;
  if (mLow.startsWith('flavonoid') && bLow.startsWith('flavonoid')) return true;
  if (mLow.startsWith('melanin') && bLow.startsWith('melanin')) return true;
  return false;
}

export async function loadAllData() {
  if (cachedData) return cachedData;

  const [materials, combinations, booklet, categories, options, references] =
    await Promise.all([
      fetch('./data/materials.json').then((r) => r.json()),
      fetch('./data/combinations.json').then((r) => r.json()),
      fetch('./data/booklet.json').then((r) => r.json()),
      fetch('./data/categories.json').then((r) => r.json()),
      fetch('./data/options.json').then((r) => r.json()),
      fetch('./data/references.json').then((r) => r.json()),
    ]);

  const categoryMap = new Map();
  for (const cat of categories) {
    categoryMap.set(cat.code, cat);
  }

  const refMap = new Map();
  for (const ref of references) {
    refMap.set(ref.code, ref);
  }

  const packagingExposureMap = new Map();
  for (const opt of options) {
    if (opt.type === 'Jenis Kemasan' && opt.description) {
      const m = opt.description.match(/Paparan cahaya:\s*(.+)$/i);
      if (m) {
        packagingExposureMap.set(opt.value, m[1].trim());
      }
    }
  }

  // Kalibrasi dan lengkapi kombinasi warna secara otomatis di memori tanpa mengubah file JSON asli
  const enhancedCombinations = buildEnhancedCombinations(combinations, materials);

  const materialIdsInCombos = new Set();
  for (const combo of enhancedCombinations) {
    if (combo.a?.id) materialIdsInCombos.add(combo.a.id);
    if (combo.b?.id) materialIdsInCombos.add(combo.b.id);
  }

  // Tambahkan properti displayHex terkalibrasi secara non-enumerable agar daftar kunci daftar putih tetap murni
  for (const mat of materials) {
    Object.defineProperty(mat, 'displayHex', {
      value: getCalibratedMaterialHex(mat),
      enumerable: false,
      configurable: true,
      writable: true,
    });
  }

  cachedData = {
    materials,
    combinations: enhancedCombinations,
    rawCombinations: combinations,
    booklet,
    categories,
    options,
    references,
    categoryMap,
    refMap,
    packagingExposureMap,
    materialIdsInCombos,
  };

  return cachedData;
}

