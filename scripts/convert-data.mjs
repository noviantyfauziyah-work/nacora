import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Pastikan folder data/ dan referensi/ tersedia di root jika awalnya berada di NACORA_Paket_Antigravity/NACORA
const packagedDir = path.join(ROOT_DIR, 'NACORA_Paket_Antigravity', 'NACORA');
for (const sub of ['data', 'referensi']) {
  const targetSub = path.join(ROOT_DIR, sub);
  const sourceSub = path.join(packagedDir, sub);
  if (!fs.existsSync(targetSub) && fs.existsSync(sourceSub)) {
    fs.cpSync(sourceSub, targetSub, { recursive: true });
  }
}

const EXCEL_PATH = path.join(ROOT_DIR, 'data', 'NACORA_Database_Final.xlsx');
const FOTO_SRC_DIR = path.join(ROOT_DIR, 'data', 'foto');
const OUT_DATA_DIR = path.join(ROOT_DIR, 'public', 'data');
const OUT_FOTO_DIR = path.join(ROOT_DIR, 'public', 'foto');

// Daftar putih kolom per sheet sesuai Bagian 4 NACORA_Plan_Final.md
const WHITELIST = {
  Bahan: [
    'ID',
    'Nama Bahan',
    'Kelompok Pigmen',
    'Sumber Bahan',
    'Bentuk',
    'Warna',
    'HEX',
    'Kelarutan',
    'Kategori Pangan',
    'pH Min',
    'pH Max',
    'Stabilitas Panas',
    'Stabilitas Cahaya',
    'Proses yang Cocok',
    'Kemasan',
    'Penyimpanan',
    'Dosis Acuan',
    'Kelebihan',
    'Keterbatasan & Tips',
    'Bahan Hewani',
    'Warna Dasar',
    'Perubahan Warna per Konsentrasi',
    'Sifat Fisik',
    'Sifat pH',
    'Catatan Evaluasi',
    'Foto',
    'Rujukan',
  ],
  Kombinasi: [
    'ID Kombinasi',
    'Warna Hasil',
    'Skor',
    'Bahan A',
    'ID A',
    'Bahan B',
    'ID B',
    'Rasio A:B',
    'Rentang Rasio',
    'HEX A',
    'HEX B',
    'HEX Hasil',
    'pH Min',
    'pH Max',
    'Proses Kompatibel',
    'Catatan',
  ],
  Booklet: [
    'Kelompok',
    'Pengenalan',
    'Karakteristik Warna',
    'Kelarutan',
    'Faktor Stabilitas',
    'Aplikasi Pangan',
    'Kelebihan dan Keterbatasan',
    'Rujukan',
  ],
  'Kategori Pangan': ['Kode', 'Nama Kategori', 'Level', 'Kode Induk'],
  'Pilihan Form': ['Jenis', 'Nilai', 'Keterangan', 'HEX (UI)'],
  Rujukan: ['Kode', 'Rujukan', 'Tautan'],
};

const VALID_COLORS = new Set([
  'Yellow',
  'Orange',
  'Red',
  'Green',
  'Blue',
  'Purple',
  'Black',
]);

function decodeXmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function readZipEntries(filePath) {
  const buf = fs.readFileSync(filePath);
  const entries = new Map();
  // Find End of Central Directory (EOCD)
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) {
    throw new Error('Berkas bukan arsip ZIP/XLSX yang valid.');
  }
  const cdCount = buf.readUInt16LE(eocdOffset + 10);
  const cdOffset = buf.readUInt32LE(eocdOffset + 16);
  let ptr = cdOffset;
  for (let i = 0; i < cdCount; i++) {
    if (buf.readUInt32LE(ptr) !== 0x02014b50) break;
    const compressionMethod = buf.readUInt16LE(ptr + 10);
    const compressedSize = buf.readUInt32LE(ptr + 20);
    const fileNameLen = buf.readUInt16LE(ptr + 28);
    const extraLen = buf.readUInt16LE(ptr + 30);
    const commentLen = buf.readUInt16LE(ptr + 32);
    const localHeaderOffset = buf.readUInt32LE(ptr + 42);
    const fileName = buf.subarray(ptr + 46, ptr + 46 + fileNameLen).toString('utf8');

    const localFileNameLen = buf.readUInt16LE(localHeaderOffset + 26);
    const localExtraLen = buf.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localFileNameLen + localExtraLen;
    const compressedData = buf.subarray(dataStart, dataStart + compressedSize);

    let content;
    if (compressionMethod === 0) {
      content = compressedData;
    } else if (compressionMethod === 8) {
      content = zlib.inflateRawSync(compressedData);
    } else {
      throw new Error(`Metode kompresi tidak didukung: ${compressionMethod}`);
    }
    entries.set(fileName, content.toString('utf8'));
    ptr += 46 + fileNameLen + extraLen + commentLen;
  }
  return entries;
}

function colLettersToIndex(letters) {
  let idx = 0;
  for (let i = 0; i < letters.length; i++) {
    idx = idx * 26 + (letters.charCodeAt(i) - 64);
  }
  return idx - 1;
}

function parseWorkbookNative(filePath) {
  const entries = readZipEntries(filePath);
  const sharedStrings = [];
  if (entries.has('xl/sharedStrings.xml')) {
    const ssXml = entries.get('xl/sharedStrings.xml');
    const siMatches = ssXml.match(/<si[\s>][\s\S]*?<\/si>/g) || [];
    for (const si of siMatches) {
      const tMatches = si.match(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g) || [];
      const text = tMatches
        .map((t) => decodeXmlEntities(t.replace(/<[^>]+>/g, '')))
        .join('');
      sharedStrings.push(text);
    }
  }

  const wbXml = entries.get('xl/workbook.xml');
  const relsXml = entries.get('xl/_rels/workbook.xml.rels');

  const relMap = new Map();
  const relMatches = relsXml.match(/<Relationship\s+[^>]*\/?>/g) || [];
  for (const rel of relMatches) {
    const idMatch = rel.match(/\bId="([^"]+)"/);
    const targetMatch = rel.match(/\bTarget="([^"]+)"/);
    if (idMatch && targetMatch) {
      let target = targetMatch[1].replace(/^\//, '');
      if (!target.startsWith('xl/')) target = 'xl/' + target;
      relMap.set(idMatch[1], target);
    }
  }

  const sheets = {};
  const sheetMatches = wbXml.match(/<sheet\s+[^>]*\/?>/g) || [];
  for (const sh of sheetMatches) {
    const nameMatch = sh.match(/\bname="([^"]+)"/);
    const rIdMatch = sh.match(/\br:id="([^"]+)"/);
    if (!nameMatch || !rIdMatch) continue;
    const sheetName = decodeXmlEntities(nameMatch[1]);
    const targetPath = relMap.get(rIdMatch[1]);
    const sheetXml = entries.get(targetPath);
    if (!sheetXml) continue;

    const rowMatches = sheetXml.match(/<row[\s>][\s\S]*?<\/row>/g) || [];
    const rows = [];
    for (const rowXml of rowMatches) {
      const cellMatches = rowXml.match(/<c\s+[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g) || [];
      const rowCells = [];
      for (const cellXml of cellMatches) {
        const refMatch = cellXml.match(/\br="([A-Z]+)\d+"/);
        if (!refMatch) continue;
        const colIdx = colLettersToIndex(refMatch[1]);
        const typeMatch = cellXml.match(/\bt="([^"]+)"/);
        const cellType = typeMatch ? typeMatch[1] : '';

        let val = '';
        if (cellType === 'inlineStr') {
          const tMatches = cellXml.match(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g) || [];
          val = tMatches
            .map((t) => decodeXmlEntities(t.replace(/<[^>]+>/g, '')))
            .join('');
        } else {
          const vMatch = cellXml.match(/<v>([\s\S]*?)<\/v>/);
          if (vMatch) {
            const rawV = decodeXmlEntities(vMatch[1]);
            if (cellType === 's') {
              val = sharedStrings[parseInt(rawV, 10)] ?? '';
            } else {
              val = rawV;
            }
          }
        }
        rowCells[colIdx] = val;
      }
      rows.push(rowCells);
    }

    if (rows.length > 0) {
      const headers = rows[0].map((h) => (h ?? '').trim());
      const dataRows = [];
      for (let r = 1; r < rows.length; r++) {
        const rowArr = rows[r];
        if (!rowArr || rowArr.every((c) => !c || String(c).trim() === '')) continue;
        const obj = {};
        for (let c = 0; c < headers.length; c++) {
          const colName = headers[c];
          if (!colName) continue;
          obj[colName] = rowArr[c] !== undefined ? String(rowArr[c]).trim() : '';
        }
        dataRows.push(obj);
      }
      sheets[sheetName] = { headers, rows: dataRows };
    }
  }
  return sheets;
}

function cleanStr(val) {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  return s === '' ? null : s;
}

function splitList(val) {
  const s = cleanStr(val);
  if (!s) return [];
  return s
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNum(val) {
  const s = cleanStr(val);
  if (s === null) return null;
  const normalized = s.replace(',', '.');
  const num = Number(normalized);
  return Number.isNaN(num) ? NaN : num;
}

function filterWhitelistRow(sheetName, rawRow) {
  const allowedCols = WHITELIST[sheetName];
  if (!allowedCols) {
    throw new Error(`Sheet "${sheetName}" tidak memiliki daftar putih.`);
  }
  const filtered = {};
  for (const col of allowedCols) {
    filtered[col] = rawRow[col] ?? '';
  }
  return filtered;
}

function main() {
  console.log('====================================================');
  console.log(' NACORA Data Converter & Validator (npm run data)');
  console.log('====================================================');

  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`GALAT: Berkas Excel tidak ditemukan di ${EXCEL_PATH}`);
    process.exit(1);
  }

  const workbook = parseWorkbookNative(EXCEL_PATH);
  const errors = [];
  const warnings = [];

  // Pastikan semua sheet wajib ada dan periksa kolom daftar putih
  for (const [sheetName, expectedCols] of Object.entries(WHITELIST)) {
    if (!workbook[sheetName]) {
      errors.push(`Sheet wajib "${sheetName}" tidak ditemukan di Excel.`);
      continue;
    }
    const actualHeaders = workbook[sheetName].headers;
    for (const col of expectedCols) {
      if (!actualHeaders.includes(col)) {
        errors.push(`Kolom wajib "${col}" tidak ditemukan pada sheet "${sheetName}".`);
      }
    }
    const extraCols = actualHeaders.filter((h) => h && !expectedCols.includes(h));
    if (extraCols.length > 0) {
      warnings.push(
        `Sheet "${sheetName}" memiliki kolom di luar daftar putih yang diabaikan: ${extraCols.join(', ')}`
      );
    }
  }

  if (errors.length > 0) {
    console.error('Validasi struktur gagal:\n- ' + errors.join('\n- '));
    process.exit(1);
  }

  // 1. Konversi & Validasi Sheet Bahan -> materials.json
  const seenIds = new Set();
  const materials = [];
  let noPhCount = 0;
  let noPhotoCount = 0;
  let noHexCount = 0;
  let noEvalCount = 0;

  for (let idx = 0; idx < workbook['Bahan'].rows.length; idx++) {
    const row = filterWhitelistRow('Bahan', workbook['Bahan'].rows[idx]);
    const rowNum = idx + 2;

    const id = cleanStr(row['ID']);
    if (!id || !/^NC-\d{3}$/.test(id)) {
      errors.push(`Bahan baris ${rowNum}: ID "${id}" tidak berformat NC-###.`);
    } else if (seenIds.has(id)) {
      errors.push(`Bahan baris ${rowNum}: ID duplikat "${id}".`);
    } else {
      seenIds.add(id);
    }

    const name = cleanStr(row['Nama Bahan']);
    if (!name) {
      errors.push(`Bahan ${id || `baris ${rowNum}`}: Nama Bahan kosong.`);
    }

    const group = cleanStr(row['Kelompok Pigmen']);
    if (!group) {
      errors.push(`Bahan ${id}: Kelompok Pigmen kosong.`);
    }

    const colors = splitList(row['Warna']);
    if (colors.length === 0) {
      errors.push(`Bahan ${id}: Kolom Warna kosong.`);
    }
    for (const c of colors) {
      if (!VALID_COLORS.has(c)) {
        errors.push(
          `Bahan ${id}: Warna "${c}" tidak sah (harus salah satu dari: ${[...VALID_COLORS].join(', ')}).`
        );
      }
    }

    const hex = cleanStr(row['HEX']);
    if (hex !== null && !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      errors.push(`Bahan ${id}: HEX "${hex}" tidak berformat #RRGGBB.`);
    }
    if (hex === null) noHexCount++;

    const phMin = parseNum(row['pH Min']);
    const phMax = parseNum(row['pH Max']);
    if (Number.isNaN(phMin) || Number.isNaN(phMax)) {
      errors.push(`Bahan ${id}: Nilai pH bukan angka yang sah.`);
    } else {
      if (phMin !== null && (phMin < 0 || phMin > 14)) {
        errors.push(`Bahan ${id}: pH Min (${phMin}) di luar rentang 0–14.`);
      }
      if (phMax !== null && (phMax < 0 || phMax > 14)) {
        errors.push(`Bahan ${id}: pH Max (${phMax}) di luar rentang 0–14.`);
      }
      if (phMin !== null && phMax !== null && phMin > phMax) {
        errors.push(`Bahan ${id}: pH Min (${phMin}) > pH Max (${phMax}).`);
      }
    }
    if (phMin === null && phMax === null) {
      noPhCount++;
    }

    const photos = splitList(row['Foto']);
    if (photos.length === 0) {
      noPhotoCount++;
    } else {
      for (const photoFile of photos) {
        const photoPath = path.join(FOTO_SRC_DIR, photoFile);
        if (!fs.existsSync(photoPath)) {
          errors.push(`Bahan ${id}: Berkas foto "${photoFile}" tidak ditemukan di data/foto/.`);
        }
      }
    }

    const evalBaseColor = cleanStr(row['Warna Dasar']);
    const evalConcentration = cleanStr(row['Perubahan Warna per Konsentrasi']);
    const evalPhysical = cleanStr(row['Sifat Fisik']);
    const evalPhNote = cleanStr(row['Sifat pH']);
    const evalNotes = cleanStr(row['Catatan Evaluasi']);

    if (!evalBaseColor && !evalConcentration && !evalPhysical && !evalPhNote && !evalNotes) {
      noEvalCount++;
    }

    const animalRaw = cleanStr(row['Bahan Hewani']);
    const animal = animalRaw !== null && animalRaw.toLowerCase() === 'ya';

    materials.push({
      id,
      name,
      group,
      source: cleanStr(row['Sumber Bahan']),
      form: cleanStr(row['Bentuk']),
      colors,
      hex,
      solubility: cleanStr(row['Kelarutan']),
      categories: splitList(row['Kategori Pangan']),
      ph: {
        min: phMin,
        max: phMax,
      },
      heat: cleanStr(row['Stabilitas Panas']),
      light: cleanStr(row['Stabilitas Cahaya']),
      processes: splitList(row['Proses yang Cocok']),
      packaging: cleanStr(row['Kemasan']),
      storage: cleanStr(row['Penyimpanan']),
      dosage: cleanStr(row['Dosis Acuan']),
      pros: cleanStr(row['Kelebihan']),
      cons: cleanStr(row['Keterbatasan & Tips']),
      animal,
      evaluation: {
        baseColor: evalBaseColor,
        concentration: evalConcentration,
        physical: evalPhysical,
        phNote: evalPhNote,
        notes: evalNotes,
      },
      photos,
      refs: splitList(row['Rujukan']),
    });
  }

  if (noPhCount > 0) {
    warnings.push(`${noPhCount} bahan tidak memiliki data pH (akan dilewati saat penyaringan pH).`);
  }
  if (noPhotoCount > 0) {
    warnings.push(`${noPhotoCount} bahan tidak memiliki foto (galeri disembunyikan pada detail).`);
  }
  if (noHexCount > 0) {
    warnings.push(`${noHexCount} bahan tidak memiliki kode HEX.`);
  }
  if (noEvalCount > 0) {
    warnings.push(`${noEvalCount} bahan tidak memiliki catatan evaluasi laboratorium.`);
  }

  // 2. Konversi & Validasi Sheet Kombinasi -> combinations.json
  const combinations = [];
  const seenComboIds = new Set();

  for (let idx = 0; idx < workbook['Kombinasi'].rows.length; idx++) {
    const row = filterWhitelistRow('Kombinasi', workbook['Kombinasi'].rows[idx]);
    const rowNum = idx + 2;

    const id = cleanStr(row['ID Kombinasi']);
    if (!id) {
      errors.push(`Kombinasi baris ${rowNum}: ID Kombinasi kosong.`);
    } else if (seenComboIds.has(id)) {
      errors.push(`Kombinasi baris ${rowNum}: ID Kombinasi duplikat "${id}".`);
    } else {
      seenComboIds.add(id);
    }

    const resultColor = cleanStr(row['Warna Hasil']);
    if (!resultColor || !VALID_COLORS.has(resultColor)) {
      errors.push(`Kombinasi ${id}: Warna Hasil "${resultColor}" tidak sah.`);
    }

    const score = parseNum(row['Skor']);
    if (score === null || Number.isNaN(score)) {
      errors.push(`Kombinasi ${id}: Skor tidak valid.`);
    }

    const idA = cleanStr(row['ID A']);
    const idB = cleanStr(row['ID B']);
    if (!idA || !seenIds.has(idA)) {
      errors.push(`Kombinasi ${id}: ID A "${idA}" tidak ditemukan di sheet Bahan.`);
    }
    if (!idB || !seenIds.has(idB)) {
      errors.push(`Kombinasi ${id}: ID B "${idB}" tidak ditemukan di sheet Bahan.`);
    }

    const hexA = cleanStr(row['HEX A']);
    const hexB = cleanStr(row['HEX B']);
    const resultHex = cleanStr(row['HEX Hasil']);
    for (const [label, hVal] of [
      ['HEX A', hexA],
      ['HEX B', hexB],
      ['HEX Hasil', resultHex],
    ]) {
      if (!hVal || !/^#[0-9A-Fa-f]{6}$/.test(hVal)) {
        errors.push(`Kombinasi ${id}: ${label} "${hVal}" tidak valid.`);
      }
    }

    const phMin = parseNum(row['pH Min']);
    const phMax = parseNum(row['pH Max']);
    if (Number.isNaN(phMin) || Number.isNaN(phMax)) {
      errors.push(`Kombinasi ${id}: Nilai pH bukan angka yang sah.`);
    } else {
      if (phMin !== null && (phMin < 0 || phMin > 14)) {
        errors.push(`Kombinasi ${id}: pH Min (${phMin}) di luar rentang 0–14.`);
      }
      if (phMax !== null && (phMax < 0 || phMax > 14)) {
        errors.push(`Kombinasi ${id}: pH Max (${phMax}) di luar rentang 0–14.`);
      }
      if (phMin !== null && phMax !== null && phMin > phMax) {
        errors.push(`Kombinasi ${id}: pH Min (${phMin}) > pH Max (${phMax}).`);
      }
    }

    combinations.push({
      id,
      resultColor,
      score,
      a: {
        id: idA,
        name: cleanStr(row['Bahan A']),
        hex: hexA,
      },
      b: {
        id: idB,
        name: cleanStr(row['Bahan B']),
        hex: hexB,
      },
      ratio: cleanStr(row['Rasio A:B']),
      ratioRange: cleanStr(row['Rentang Rasio']),
      resultHex,
      ph: {
        min: phMin,
        max: phMax,
      },
      processes: splitList(row['Proses Kompatibel']),
      notes: cleanStr(row['Catatan']),
    });
  }

  // 3. Konversi Sheet Booklet -> booklet.json
  const booklet = workbook['Booklet'].rows.map((rawRow) => {
    const row = filterWhitelistRow('Booklet', rawRow);
    return {
      group: cleanStr(row['Kelompok']),
      introduction: cleanStr(row['Pengenalan']),
      colorCharacteristics: cleanStr(row['Karakteristik Warna']),
      solubility: cleanStr(row['Kelarutan']),
      stabilityFactors: cleanStr(row['Faktor Stabilitas']),
      foodApplications: cleanStr(row['Aplikasi Pangan']),
      prosAndCons: cleanStr(row['Kelebihan dan Keterbatasan']),
      refs: splitList(row['Rujukan']),
    };
  });

  // 4. Konversi Sheet Kategori Pangan -> categories.json
  const categories = workbook['Kategori Pangan'].rows.map((rawRow) => {
    const row = filterWhitelistRow('Kategori Pangan', rawRow);
    return {
      code: cleanStr(row['Kode']),
      name: cleanStr(row['Nama Kategori']),
      level: parseNum(row['Level']) ?? 1,
      parentCode: cleanStr(row['Kode Induk']),
    };
  });

  // 5. Konversi Sheet Pilihan Form -> options.json
  const options = workbook['Pilihan Form'].rows.map((rawRow, idx) => {
    const row = filterWhitelistRow('Pilihan Form', rawRow);
    const hex = cleanStr(row['HEX (UI)']);
    if (hex !== null && !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      errors.push(`Pilihan Form baris ${idx + 2}: HEX "${hex}" tidak valid.`);
    }
    return {
      type: cleanStr(row['Jenis']),
      value: cleanStr(row['Nilai']),
      description: cleanStr(row['Keterangan']),
      hex,
    };
  });

  // 6. Konversi Sheet Rujukan -> references.json
  const references = workbook['Rujukan'].rows.map((rawRow) => {
    const row = filterWhitelistRow('Rujukan', rawRow);
    const rawUrl = cleanStr(row['Tautan']);
    return {
      code: cleanStr(row['Kode']),
      title: cleanStr(row['Rujukan']),
      url: rawUrl === '-' ? null : rawUrl,
    };
  });

  // Bila ada error validasi, hentikan proses dengan kode keluar non-nol
  if (errors.length > 0) {
    console.error('\nVALIDASI GAGAL DENGAN GALAT:');
    for (const err of errors) {
      console.error(`  [ERROR] ${err}`);
    }
    process.exit(1);
  }

  // Tulis JSON ke public/data/
  fs.mkdirSync(OUT_DATA_DIR, { recursive: true });
  const filesToWrite = [
    ['materials.json', materials],
    ['combinations.json', combinations],
    ['booklet.json', booklet],
    ['categories.json', categories],
    ['options.json', options],
    ['references.json', references],
  ];

  for (const [filename, data] of filesToWrite) {
    const outPath = path.join(OUT_DATA_DIR, filename);
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  }

  // Salin foto dari data/foto/ ke public/foto/
  fs.mkdirSync(OUT_FOTO_DIR, { recursive: true });
  let copiedPhotos = 0;
  if (fs.existsSync(FOTO_SRC_DIR)) {
    const files = fs.readdirSync(FOTO_SRC_DIR);
    for (const file of files) {
      const srcFile = path.join(FOTO_SRC_DIR, file);
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, path.join(OUT_FOTO_DIR, file));
        copiedPhotos++;
      }
    }
  }

  console.log('\n[STATUS] VALIDASI LULUS (0 galat)');
  console.log('----------------------------------------------------');
  console.log(`- Bahan (materials.json)        : ${materials.length} bahan`);
  console.log(`- Kombinasi (combinations.json) : ${combinations.length} kombinasi`);
  console.log(`- Booklet (booklet.json)        : ${booklet.length} halaman kelompok`);
  console.log(`- Kategori (categories.json)    : ${categories.length} kategori pangan`);
  console.log(`- Opsi Form (options.json)      : ${options.length} baris opsi`);
  console.log(`- Rujukan (references.json)     : ${references.length} rujukan`);
  console.log(`- Foto disalin ke public/foto/  : ${copiedPhotos} berkas foto`);
  console.log('----------------------------------------------------');
  if (warnings.length > 0) {
    console.log('Catatan / Peringatan Data:');
    for (const w of warnings) {
      console.log(`  [INFO] ${w}`);
    }
  } else {
    console.log('Catatan / Peringatan Data: Tidak ada peringatan.');
  }
  console.log('====================================================');
}

main();

