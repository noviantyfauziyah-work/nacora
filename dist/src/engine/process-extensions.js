/**
 * Process Compatibility Extension (Ekstensi Kompatibilitas Proses)
 * Terpisah dari database Excel utama (public/data/*.json).
 *
 * Setiap bahan pada proses ekstensi hanya menggunakan satu dari tiga status:
 * - "Compatible"   : memiliki bukti kompatibilitas
 * - "Incompatible" : memiliki bukti ketidakcocokan
 * - "Unknown"      : informasi kompatibilitas granulasi belum tersedia
 *
 * Aturan wajib:
 * - Tidak menyimpulkan kompatibilitas granulasi dari proses lain (seperti Baking, Ekstrusi, atau Stabilitas Panas).
 * - Bahan dengan status "Unknown" tidak boleh ditampilkan sebagai rekomendasi yang telah terverifikasi ("Sangat sesuai") untuk granulasi.
 */

export const EXTENSION_PROCESSES = [
  {
    type: 'Proses Pengolahan',
    value: 'Granulasi',
    label: 'Granulasi',
    isExtension: true,
    defaultStatus: 'Unknown',
    unknownReason:
      'Data kompatibilitas granulasi belum tersedia (status: Unknown)',
    compatibleReason:
      'Proses Granulasi: Compatible (memiliki bukti kompatibilitas granulasi)',
    incompatibleReason:
      'Proses Granulasi: Incompatible (memiliki bukti ketidakcocokan pada granulasi)',
    bannerNotice:
      'Proses Granulasi menggunakan Process Compatibility Extension. Bahan dengan status Unknown (data kompatibilitas granulasi belum tersedia) tidak ditampilkan sebagai rekomendasi yang telah terverifikasi pada grup Sangat sesuai, melainkan ditempatkan pada Sesuai dengan catatan.',
  },
];

/**
 * Pemetaan bukti kompatibilitas spesifik per ID bahan untuk proses ekstensi.
 * Apabila suatu ID bahan belum terdaftar di bawah ini, statusnya secara otomatis adalah "Unknown"
 * (tanpa menebak atau mengarang data dari proses lain).
 */
export const EXTENSION_COMPATIBILITY_RECORDS = {
  Granulasi: {
    // Contoh format bila kelak terdapat bukti uji laboratorium:
    // "NC-001": { status: "Compatible", evidence: "Laporan evaluasi granulasi R&D" }
  },
};

export function isExtensionProcess(processName) {
  if (!processName) return false;
  const trimmed = String(processName).trim();
  return EXTENSION_PROCESSES.some((p) => p.value === trimmed);
}

export function getExtensionProcessMeta(processName) {
  if (!processName) return null;
  const trimmed = String(processName).trim();
  return EXTENSION_PROCESSES.find((p) => p.value === trimmed) || null;
}

/**
 * Mengembalikan status kompatibilitas proses ekstensi untuk suatu bahan:
 * "Compatible" | "Incompatible" | "Unknown"
 */
export function getMaterialExtensionStatus(
  materialId,
  processName,
  customRecords = EXTENSION_COMPATIBILITY_RECORDS
) {
  const meta = getExtensionProcessMeta(processName);
  if (!meta) return null;

  const processMap = customRecords?.[meta.value] || {};
  const record = materialId ? processMap[materialId] : null;
  const status = record?.status || meta.defaultStatus || 'Unknown';

  if (status !== 'Compatible' && status !== 'Incompatible' && status !== 'Unknown') {
    return 'Unknown';
  }

  return {
    process: meta.value,
    status,
    evidence: record?.evidence || null,
    meta,
  };
}
