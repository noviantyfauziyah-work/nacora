/**
 * Mesin Penyaringan & Rekomendasi NACORA (Modul Murni — Bagian 7 & 9)
 * Tidak bergantung pada DOM agar dapat diuji otomatis secara mandiri.
 */

import {
  isExtensionProcess,
  getMaterialExtensionStatus,
} from './process-extensions.js';

export const HEAT_PROCESSES = new Set([
  'Pasteurisasi',
  'UHT',
  'Baking / pemanggangan',
  'Ekstrusi',
  'Sterilisasi / retort',
]);

export const DEFAULT_PACKAGING_EXPOSURE = {
  'Botol kaca bening': 'Tinggi',
  'Botol PET bening': 'Tinggi',
  'Botol PET berwarna / opak': 'Sedang',
  'Kaleng': 'Tidak ada',
  'Aluminium foil / metalized': 'Tidak ada',
  'Pouch transparan': 'Tinggi',
  'Karton aseptik': 'Rendah',
  'Cup plastik bening': 'Tinggi',
};

export function formatNumberId(num) {
  if (num === null || num === undefined || Number.isNaN(Number(num))) return '';
  const n = Number(num);
  // Tampilkan minimal satu desimal bila bulat untuk pH atau sesuai nilai
  const str = Number.isInteger(n) ? n.toFixed(1) : String(n);
  return str.replace('.', ',');
}

export function getParentCategoryCode(code) {
  if (!code) return '';
  const str = String(code).trim();
  const dotIdx = str.indexOf('.');
  if (dotIdx === -1) return `${str}.0`;
  return `${str.slice(0, dotIdx)}.0`;
}

export function isCategoryMatched(materialCategories, selectedCategoryCode) {
  if (!Array.isArray(materialCategories) || !selectedCategoryCode) return false;
  const target = String(selectedCategoryCode).trim();
  const parentCode = getParentCategoryCode(target);
  return materialCategories.some((c) => {
    const trimmed = String(c).trim();
    return trimmed === target || trimmed === parentCode;
  });
}

export function normalizeProcessInput(processValue) {
  if (!processValue) return '';
  const trimmed = String(processValue).trim();
  if (trimmed === 'Tanpa pemanasan setelah pencampuran') {
    return 'Tanpa pemanasan';
  }
  return trimmed;
}

export function parsePhValue(rawPh) {
  if (rawPh === null || rawPh === undefined) return NaN;
  const s = String(rawPh).trim();
  if (s === '') return NaN;
  const normalized = s.replace(',', '.');
  const n = Number(normalized);
  if (Number.isNaN(n) || n < 0 || n > 14) return NaN;
  return n;
}

/**
 * Mengevaluasi satu bahan terhadap input pengguna sesuai Bagian 7
 */
export function evaluateMaterial(material, input, options = {}) {
  const targetColor = String(input.warna || input.color || '').trim();
  const materialColors = Array.isArray(material.colors) ? material.colors : [];

  // 1. Warna: Bila Target Color pengguna tidak ada di kolom Warna bahan -> tidak ditampilkan sama sekali
  if (!targetColor || !materialColors.includes(targetColor)) {
    return null;
  }

  const categoryCode = String(input.kat || input.category || '').trim();
  const categoryName = options.categoryMap?.get(categoryCode)?.name || categoryCode;
  const processName = normalizeProcessInput(input.proses || input.process || '');
  const phVal = typeof input.ph === 'number' ? input.ph : parsePhValue(input.ph);
  const packagingName = String(input.kemasan || input.packaging || '').trim();

  const packagingExposure =
    options.packagingExposureMap?.get(packagingName) ||
    DEFAULT_PACKAGING_EXPOSURE[packagingName] ||
    null;

  const criteria = [];

  // 2. Kriteria Kategori (dilewati bila kolom Kategori Pangan pada bahan kosong)
  if (Array.isArray(material.categories) && material.categories.length > 0 && categoryCode) {
    const matched = isCategoryMatched(material.categories, categoryCode);
    if (matched) {
      criteria.push({
        key: 'category',
        label: 'Kategori',
        status: 'Sesuai',
        icon: '✓',
        reason: `Kategori ${categoryCode} (${categoryName}) termasuk kategori pangan bahan ini`,
      });
    } else {
      criteria.push({
        key: 'category',
        label: 'Kategori',
        status: 'Perlu perhatian',
        icon: '▲',
        reason: `Kategori ${categoryCode} (${categoryName}) belum tercantum pada daftar kategori lazim bahan ini`,
      });
    }
  }

  // 3. Kriteria pH (dilewati bila pH Min dan pH Max keduanya kosong)
  const phMin = material.ph?.min ?? null;
  const phMax = material.ph?.max ?? null;
  if ((phMin !== null || phMax !== null) && !Number.isNaN(phVal)) {
    const phText = formatNumberId(phVal);
    let diff = 0;
    let rangeText = '';

    if (phMin !== null && phMax !== null) {
      rangeText = `${formatNumberId(phMin)}–${formatNumberId(phMax)}`;
      if (phVal < phMin) {
        diff = Math.round((phMin - phVal) * 1000) / 1000;
      } else if (phVal > phMax) {
        diff = Math.round((phVal - phMax) * 1000) / 1000;
      }
    } else if (phMin !== null) {
      rangeText = `≥ ${formatNumberId(phMin)}`;
      if (phVal < phMin) {
        diff = Math.round((phMin - phVal) * 1000) / 1000;
      }
    } else if (phMax !== null) {
      rangeText = `≤ ${formatNumberId(phMax)}`;
      if (phVal > phMax) {
        diff = Math.round((phVal - phMax) * 1000) / 1000;
      }
    }

    if (diff === 0) {
      criteria.push({
        key: 'ph',
        label: 'pH',
        status: 'Sesuai',
        icon: '✓',
        reason: `pH ${phText} berada di rentang ${rangeText}`,
      });
    } else if (diff <= 1.0) {
      criteria.push({
        key: 'ph',
        label: 'pH',
        status: 'Perlu perhatian',
        icon: '▲',
        reason: `pH ${phText} sedikit di luar rentang ${rangeText} (selisih ${formatNumberId(diff)})`,
      });
    } else {
      criteria.push({
        key: 'ph',
        label: 'pH',
        status: 'Kurang sesuai',
        icon: '✕',
        reason: `pH ${phText} di luar rentang ${rangeText} (selisih ${formatNumberId(diff)})`,
      });
    }
  }

  // 4. Kriteria Proses
  if (processName && isExtensionProcess(processName)) {
    // Jalur Process Compatibility Extension (mis. Granulasi):
    // Tidak menyimpulkan dari proses lain atau Stabilitas Panas.
    const extInfo = getMaterialExtensionStatus(
      material.id,
      processName,
      options.extensionRecords
    );
    if (extInfo.status === 'Compatible') {
      criteria.push({
        key: 'process',
        label: 'Proses',
        status: 'Sesuai',
        extensionStatus: 'Compatible',
        icon: '✓',
        reason: extInfo.evidence
          ? `${extInfo.meta.compatibleReason} (${extInfo.evidence})`
          : extInfo.meta.compatibleReason,
      });
    } else if (extInfo.status === 'Incompatible') {
      criteria.push({
        key: 'process',
        label: 'Proses',
        status: 'Kurang sesuai',
        extensionStatus: 'Incompatible',
        icon: '✕',
        reason: extInfo.evidence
          ? `${extInfo.meta.incompatibleReason} (${extInfo.evidence})`
          : extInfo.meta.incompatibleReason,
      });
    } else {
      // Unknown -> tidak boleh masuk rekomendasi terverifikasi (Sangat sesuai)
      criteria.push({
        key: 'process',
        label: 'Proses',
        status: 'Perlu perhatian',
        extensionStatus: 'Unknown',
        icon: '▲',
        reason: extInfo.meta.unknownReason,
      });
    }
  } else if (Array.isArray(material.processes) && material.processes.length > 0 && processName) {
    const inProcesses = material.processes.includes(processName);
    if (inProcesses) {
      criteria.push({
        key: 'process',
        label: 'Proses',
        status: 'Sesuai',
        icon: '✓',
        reason: `Proses ${processName} termasuk proses yang cocok`,
      });
    } else {
      const heatIsLow = material.heat === 'Rendah';
      const needsHeat = HEAT_PROCESSES.has(processName);
      if (heatIsLow && needsHeat) {
        criteria.push({
          key: 'process',
          label: 'Proses',
          status: 'Kurang sesuai',
          icon: '✕',
          reason: `Proses ${processName} membutuhkan panas dan stabilitas panas bahan rendah`,
        });
      } else {
        criteria.push({
          key: 'process',
          label: 'Proses',
          status: 'Perlu perhatian',
          icon: '▲',
          reason: `Proses ${processName} tidak tercantum pada proses yang cocok`,
        });
      }
    }
  }

  // 5. Kriteria Cahaya × Kemasan (dilewati bila Stabilitas Cahaya bahan kosong)
  if (material.light && packagingExposure) {
    const light = material.light;
    const isWarn =
      (light === 'Rendah' && (packagingExposure === 'Tinggi' || packagingExposure === 'Sedang')) ||
      (light === 'Sedang' && packagingExposure === 'Tinggi');

    if (isWarn) {
      criteria.push({
        key: 'light',
        label: 'Cahaya/kemasan',
        status: 'Perlu perhatian',
        icon: '▲',
        reason: `Peka cahaya (stabilitas ${light.toLowerCase()}) pada ${packagingName.toLowerCase()}: pertimbangkan kemasan opak`,
      });
    } else {
      criteria.push({
        key: 'light',
        label: 'Cahaya/kemasan',
        status: 'Sesuai',
        icon: '✓',
        reason: `Stabilitas cahaya ${light.toLowerCase()} sesuai dengan ${packagingName.toLowerCase()}`,
      });
    }
  }

  const sesuaiCount = criteria.filter((c) => c.status === 'Sesuai').length;
  const perhatianCount = criteria.filter((c) => c.status === 'Perlu perhatian').length;
  const kurangSesuaiList = criteria.filter((c) => c.status === 'Kurang sesuai');
  const kurangSesuaiCount = kurangSesuaiList.length;

  let group = 'Sangat sesuai';
  if (kurangSesuaiCount > 0) {
    group = 'Tersaring';
  } else if (perhatianCount > 0) {
    group = 'Sesuai dengan catatan';
  }

  return {
    material,
    group,
    criteria,
    sesuaiCount,
    perhatianCount,
    kurangSesuaiCount,
    filterReasons: kurangSesuaiList.map((c) => c.reason),
  };
}

/**
 * Pengurutan di dalam grup (Bagian 7):
 * jumlah kriteria Sesuai (terbanyak dulu) -> jumlah Perlu perhatian (paling sedikit dulu) -> nama A-Z
 */
export function compareEvaluatedMaterials(itemA, itemB) {
  if (itemB.sesuaiCount !== itemA.sesuaiCount) {
    return itemB.sesuaiCount - itemA.sesuaiCount;
  }
  if (itemA.perhatianCount !== itemB.perhatianCount) {
    return itemA.perhatianCount - itemB.perhatianCount;
  }
  const nameA = String(itemA.material.name || '');
  const nameB = String(itemB.material.name || '');
  if (nameA < nameB) return -1;
  if (nameA > nameB) return 1;
  return 0;
}

/**
 * Menjalankan mesin rekomendasi untuk seluruh daftar bahan
 */
export function getRecommendations(materials, input, options = {}) {
  const sangatSesuai = [];
  const sesuaiDenganCatatan = [];
  const tersaring = [];

  for (const mat of materials) {
    const evaluated = evaluateMaterial(mat, input, options);
    if (!evaluated) continue;

    if (evaluated.group === 'Sangat sesuai') {
      sangatSesuai.push(evaluated);
    } else if (evaluated.group === 'Sesuai dengan catatan') {
      sesuaiDenganCatatan.push(evaluated);
    } else {
      tersaring.push(evaluated);
    }
  }

  sangatSesuai.sort(compareEvaluatedMaterials);
  sesuaiDenganCatatan.sort(compareEvaluatedMaterials);
  tersaring.sort(compareEvaluatedMaterials);

  return {
    sangatSesuai,
    sesuaiDenganCatatan,
    tersaring,
    totalMatchedColor: sangatSesuai.length + sesuaiDenganCatatan.length + tersaring.length,
  };
}

/**
 * Penyaringan Explore Color Mix (Bagian 9 & Kasus Uji 9 Bagian 15.1):
 * - Bila warna hasil dipilih: cocokkan resultColor
 * - Bila bahan dipilih: cocokkan a.id atau b.id
 * - Bila pH diisi: tampilkan kombinasi dengan pH Min <= pH <= pH Max
 * - Bila proses dipilih: kombinasi dengan proses itu pada Proses Kompatibel
 * - Urutkan berdasarkan Skor (menurun)
 */
export function filterCombinations(combinations, filters = {}) {
  const targetColor = filters.resultColor ? String(filters.resultColor).trim() : '';
  const materialId = filters.materialId ? String(filters.materialId).trim() : '';
  const processName = filters.process ? normalizeProcessInput(filters.process) : '';
  const hasPh =
    filters.ph !== null &&
    filters.ph !== undefined &&
    String(filters.ph).trim() !== '';
  const phVal = hasPh ? parsePhValue(filters.ph) : NaN;

  const filtered = combinations.filter((combo) => {
    if (targetColor && combo.resultColor !== targetColor) {
      return false;
    }
    if (materialId && combo.a?.id !== materialId && combo.b?.id !== materialId) {
      return false;
    }
    if (hasPh && !Number.isNaN(phVal)) {
      const min = combo.ph?.min ?? null;
      const max = combo.ph?.max ?? null;
      if (min === null || max === null) return false;
      if (phVal < min || phVal > max) return false;
    }
    if (processName) {
      if (isExtensionProcess(processName)) {
        const extA = getMaterialExtensionStatus(
          combo.a?.id,
          processName,
          filters.extensionRecords
        );
        const extB = getMaterialExtensionStatus(
          combo.b?.id,
          processName,
          filters.extensionRecords
        );
        if (extA?.status !== 'Compatible' || extB?.status !== 'Compatible') {
          return false;
        }
      } else {
        const procs = Array.isArray(combo.processes) ? combo.processes : [];
        if (!procs.includes(processName)) return false;
      }
    }
    return true;
  });

  filtered.sort((x, y) => (y.score ?? 0) - (x.score ?? 0));
  return filtered;
}
