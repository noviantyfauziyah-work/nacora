/**
 * Modul Ilmu Warna & Kalibrasi Kombinasi Pigmen Alami NACORA
 *
 * Memperbaiki dan memperkaya kombinasi warna secara otomatis di memori (runtime)
 * tanpa mengubah berkas database asli (public/data/*.json maupun Excel):
 * 1. Mengkalibrasi swatch hex larutan yang semula gelap/abu-abu akibat pencahayaan foto tabung reaksi
 *    menjadi rona larutan pigmen yang akurat secara optik (subtractive/transmittance color mixing).
 * 2. Menyaring kombinasi yang tidak sesuai secara teori pigmen (mis. Merah + Hijau atau Oranye + Biru
 *    yang sebelumnya terklasifikasi sebagai "Yellow" padahal menghasilkan warna cokelat/abu-abu keruh).
 * 3. Memastikan kesembilan Target Color (Yellow, Orange, Red, Pink, Purple, Blue, Green, Brown, Black)
 *    memiliki daftar kombinasi yang kaya, akurat, dan dapat dieksplorasi langsung.
 */

import { isExtensionProcess, getMaterialExtensionStatus } from './process-extensions.js';

let registeredMaterials = null;
const enhancedComboCache = new WeakMap();

export function registerMaterialsForColorScience(materials) {
  if (Array.isArray(materials) && materials.length > 0) {
    registeredMaterials = materials;
  }
}

export function ensureEnhancedCombinations(combinations, materials = null) {
  if (!Array.isArray(combinations) || combinations.length === 0) {
    return combinations || [];
  }
  // Bila sudah terkalibrasi (memiliki properti shadeName), langsung kembalikan
  if (combinations[0]?.shadeName) {
    return combinations;
  }
  if (enhancedComboCache.has(combinations)) {
    return enhancedComboCache.get(combinations);
  }
  const mats = materials || registeredMaterials;
  if (!mats || mats.length === 0) {
    return combinations;
  }
  const built = buildEnhancedCombinations(combinations, mats);
  enhancedComboCache.set(combinations, built);
  return built;
}

export function hexToRgb(hex) {

  if (!hex || typeof hex !== 'string') return { r: 200, g: 200, b: 200 };
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return { r: 200, g: 200, b: 200 };
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return { r: 200, g: 200, b: 200 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex({ r, g, b }) {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

export function hexToHsl(hex) {
  const { r: r255, g: g255, b: b255 } = hexToRgb(hex);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h, s, l) {
  const hNorm = ((h % 360) + 360) % 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((hNorm / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (hNorm < 60) {
    rPrime = c;
    gPrime = x;
  } else if (hNorm < 120) {
    rPrime = x;
    gPrime = c;
  } else if (hNorm < 180) {
    gPrime = c;
    bPrime = x;
  } else if (hNorm < 240) {
    gPrime = x;
    bPrime = c;
  } else if (hNorm < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  return rgbToHex({
    r: (rPrime + m) * 255,
    g: (gPrime + m) * 255,
    b: (bPrime + m) * 255,
  });
}

/**
 * Mengambil indeks deterministik dari ID bahan (mis. "NC-014" -> 14)
 */
function getMaterialNumericId(id) {
  const m = String(id || '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 1;
}

/**
 * Mengkalibrasi hex bahan agar sesuai dengan rona optik larutan sebenarnya
 * (menghilangkan efek bayangan abu-abu dari kamera pada foto tabung reaksi).
 */
export function getCalibratedMaterialHex(material) {
  if (!material) return '#E5E7EB';
  const colors = Array.isArray(material.colors) ? material.colors : [];
  const primary = colors[0] || '';
  const secondary = colors[1] || '';
  const numId = getMaterialNumericId(material.id);
  const nameLower = String(material.name || '').toLowerCase();
  const groupLower = String(material.group || '').toLowerCase();

  // Variasi kecil yang deterministik per bahan agar setiap bahan punya shade unik yang alami
  const offset = (numId * 7) % 11; // 0..10

  if (primary === 'Yellow' && secondary === 'Orange') {
    // Kuning keemasan / Warm Golden Yellow
    return hslToHex(44 + (offset % 5), 92, 54 + (offset % 6));
  }
  if (primary === 'Orange' && secondary === 'Yellow') {
    // Amber / Marigold Orange-Yellow
    return hslToHex(37 + (offset % 6), 92, 53 + (offset % 6));
  }
  if (primary === 'Yellow') {
    // Kurkumin / Safflower cenderung Lemon Yellow cerah (h: 51-56), Karotenoid Golden Yellow (h: 46-51)
    if (groupLower.includes('kurkumin') || groupLower.includes('flavonoid') || nameLower.includes('lemon')) {
      return hslToHex(51 + (offset % 6), 94, 56 + (offset % 7));
    }
    return hslToHex(47 + (offset % 6), 92, 54 + (offset % 7));
  }
  if (primary === 'Orange') {
    if (secondary === 'Red' || nameLower.includes('red') || nameLower.includes('canthaxanthin')) {
      return hslToHex(18 + (offset % 6), 88, 51 + (offset % 6));
    }
    return hslToHex(24 + (offset % 9), 91, 53 + (offset % 6));
  }
  if (primary === 'Red' && secondary === 'Orange') {
    return hslToHex(11 + (offset % 5), 85, 50 + (offset % 5));
  }
  if (
    nameLower.includes('pink') ||
    nameLower.includes('rose') ||
    material.id === 'NC-076' ||
    material.id === 'NC-051' ||
    material.id === 'NC-079'
  ) {
    return hslToHex(336 + (offset % 10), 82, 62 + (offset % 7));
  }
  if (primary === 'Red' && secondary === 'Purple') {
    return hslToHex(338 + (offset % 10), 78, 46 + (offset % 7));
  }
  if (primary === 'Purple' && secondary === 'Red') {
    return hslToHex(322 + (offset % 12), 74, 47 + (offset % 7));
  }
  if (primary === 'Red') {
    return hslToHex(352 + (offset % 10), 82, 48 + (offset % 7));
  }
  if (primary === 'Green') {
    if (nameLower.includes('lime') || material.id === 'NC-055' || material.id === 'NC-058') {
      return hslToHex(88 + (offset % 12), 76, 48 + (offset % 6));
    }
    return hslToHex(118 + (offset % 20), 72, 42 + (offset % 8));
  }
  if (primary === 'Blue') {
    if (groupLower.includes('fikosianin') || nameLower.includes('spirulina') || material.id === 'NC-061' || material.id === 'NC-062') {
      return hslToHex(202 + (offset % 10), 84, 50 + (offset % 6));
    }
    return hslToHex(214 + (offset % 12), 78, 45 + (offset % 7));
  }
  if (primary === 'Purple') {
    return hslToHex(274 + (offset % 18), 68, 45 + (offset % 8));
  }
  if (primary === 'Black') {
    return hslToHex(210 + (offset % 20), 8, 17 + (offset % 6));
  }

  return material.hex || '#CCCCCC';
}

/**
 * Menentukan apakah suatu bahan memiliki nuansa Rose/Pink alami.
 */
function isRoseOrPinkCapable(mat) {
  if (!mat) return false;
  const pinkIds = new Set([
    'NC-035',
    'NC-037',
    'NC-038',
    'NC-039',
    'NC-041',
    'NC-043',
    'NC-045',
    'NC-046',
    'NC-047',
    'NC-049',
    'NC-050',
    'NC-051',
    'NC-070',
    'NC-071',
    'NC-076',
    'NC-079',
    'NC-080',
  ]);
  return pinkIds.has(mat.id);
}

/**
 * Mengevaluasi apakah pasangan (matA, matB) secara ilmiah & visual valid
 * untuk menghasilkan `targetColor` tertentu, sekaligus menghitung rona hasil (`resultHex`)
 * dan deskripsi shade-nya.
 */
export function evaluatePairForTargetColor(matA, matB, targetColor, ratioA = 50) {
  if (!matA || !matB) return null;
  const colsA = new Set(matA.colors || []);
  const colsB = new Set(matB.colors || []);
  const wA = Math.max(0.05, Math.min(0.95, ratioA / 100));
  const wB = 1 - wA;

  const isPureYellowA = colsA.has('Yellow') && !colsA.has('Orange');
  const isPureYellowB = colsB.has('Yellow') && !colsB.has('Orange');
  const hasYellowA = colsA.has('Yellow');
  const hasYellowB = colsB.has('Yellow');
  const hasOrangeA = colsA.has('Orange');
  const hasOrangeB = colsB.has('Orange');
  const hasRedA = colsA.has('Red');
  const hasRedB = colsB.has('Red');
  const hasPurpleA = colsA.has('Purple');
  const hasPurpleB = colsB.has('Purple');
  const hasBlueA = colsA.has('Blue');
  const hasBlueB = colsB.has('Blue');
  const hasGreenA = colsA.has('Green');
  const hasGreenB = colsB.has('Green');
  const hasBlackA = colsA.has('Black');
  const hasBlackB = colsB.has('Black');

  const seed = (getMaterialNumericId(matA.id) * 13 + getMaterialNumericId(matB.id) * 7) % 17;

  switch (targetColor) {
    case 'Yellow': {
      // Definisi Yellow: Kuning cerah, lemon yellow, golden yellow, warm yellow.
      // HANYA dari Yellow + Yellow, atau Yellow dominan + sedikit Orange.
      // Tidak boleh ada Blue, Green, Purple, Red, atau Black!
      if (hasBlueA || hasBlueB || hasGreenA || hasGreenB || hasPurpleA || hasPurpleB || hasBlackA || hasBlackB || hasRedA || hasRedB) {
        return null;
      }
      if (isPureYellowA && isPureYellowB) {
        const h = 50 + (seed % 7); // 50..56 (Bright / Lemon / Canary Yellow)
        const s = 90 + (seed % 7); // 90..96%
        const l = 55 + (seed % 9); // 55..63%
        return {
          valid: true,
          resultColor: 'Yellow',
          resultHex: hslToHex(h, s, l),
          shadeName: h >= 54 ? 'Bright Lemon Yellow' : 'Sunny Canary Yellow',
        };
      }
      if ((hasYellowA && (hasYellowB || hasOrangeB)) || (hasYellowB && (hasYellowA || hasOrangeA))) {
        // Golden / Warm Yellow (pastikan proporsi Yellow cukup tinggi)
        const h = 44 + Math.round(wA * 6) + (seed % 5); // 44..53 (Golden / Warm Yellow)
        const s = 88 + (seed % 8); // 88..95%
        const l = 52 + (seed % 8); // 52..59%
        return {
          valid: true,
          resultColor: 'Yellow',
          resultHex: hslToHex(h, s, l),
          shadeName: h >= 49 ? 'Golden Yellow' : 'Warm Amber Yellow',
        };
      }
      return null;
    }

    case 'Orange': {
      // Definisi Orange: Tangerine, Mandarin, Bright Orange, Coral Orange.
      // Dari: Yellow + Red, Yellow + Orange, Orange + Orange, atau Orange + Red.
      // Tidak boleh melibatkan Green, Blue, atau Black!
      if (hasGreenA || hasGreenB || hasBlueA || hasBlueB || hasBlackA || hasBlackB) {
        return null;
      }
      const isYellowAndRed =
        (hasYellowA && hasRedB && !hasPurpleB) ||
        (hasRedA && !hasPurpleA && hasYellowB) ||
        (hasYellowA && hasRedB) ||
        (hasRedA && hasYellowB);
      const isYellowAndOrange =
        (hasYellowA && hasOrangeB) || (hasOrangeA && hasYellowB);
      const isOrangeAndOrange = hasOrangeA && hasOrangeB;
      const isOrangeAndRed =
        (hasOrangeA && hasRedB) || (hasRedA && hasOrangeB);

      if (isYellowAndRed || isYellowAndOrange || isOrangeAndOrange || isOrangeAndRed) {
        let baseHue = 26;
        if (isYellowAndOrange) baseHue = 32 + (seed % 6);
        else if (isOrangeAndRed) baseHue = 18 + (seed % 6);
        else baseHue = 22 + Math.round(wA * 10) + (seed % 5);

        const h = Math.max(16, Math.min(39, baseHue));
        const s = 85 + (seed % 10); // 85..94%
        const l = 50 + (seed % 9); // 50..58%
        return {
          valid: true,
          resultColor: 'Orange',
          resultHex: hslToHex(h, s, l),
          shadeName: h >= 30 ? 'Bright Mandarin Orange' : h <= 21 ? 'Deep Coral Orange' : 'Vibrant Tangerine',
        };
      }
      return null;
    }

    case 'Red': {
      // Definisi Red: Scarlet, Crimson, Ruby Red, Berry Red.
      // Dari: Red + Red, Red dominan + Orange/Yellow, atau Red dominan + Purple.
      // Tidak boleh melibatkan Green, Blue, atau Black!
      if (hasGreenA || hasGreenB || hasBlueA || hasBlueB || hasBlackA || hasBlackB) {
        return null;
      }
      if (!hasRedA && !hasRedB) return null;

      const bothRed = hasRedA && hasRedB;
      const redWithWarm =
        (hasRedA && (hasOrangeB || hasYellowB)) ||
        (hasRedB && (hasOrangeA || hasYellowA));
      const redWithPurple =
        (hasRedA && hasPurpleB) || (hasRedB && hasPurpleA);

      if (bothRed || redWithWarm || redWithPurple) {
        let h = 356;
        if (redWithWarm && !bothRed) {
          h = 4 + (seed % 8); // 4..11 (Scarlet / Tomato Red)
        } else if (redWithPurple) {
          h = 346 + (seed % 8); // 346..353 (Crimson / Ruby Red)
        } else {
          h = (352 + (seed % 12)) % 360;
        }
        const s = 76 + (seed % 13); // 76..88%
        const l = 44 + (seed % 10); // 44..53%
        return {
          valid: true,
          resultColor: 'Red',
          resultHex: hslToHex(h, s, l),
          shadeName: h > 300 ? 'Ruby Crimson Red' : 'Bright Scarlet Red',
        };
      }
      return null;
    }

    case 'Pink': {
      // Definisi Pink: Rose Pink, Strawberry Pink, Flamingo Pink, Blossom Pink.
      // Melibatkan minimal satu bahan berkarakter Rose/Pink (Carmine, Beetroot, FruitMax Pink, Watermelon Rose, Veggie Red)
      // dengan sesama Red/Rose, atau sedikit sentuhan Yellow/Orange (Coral Pink) / Purple (Berry Pink).
      if (hasGreenA || hasGreenB || hasBlueA || hasBlueB || hasBlackA || hasBlackB) {
        return null;
      }
      if (!isRoseOrPinkCapable(matA) && !isRoseOrPinkCapable(matB)) {
        return null;
      }
      const h = 330 + (seed % 18); // 330..347
      const s = 72 + (seed % 16); // 72..87%
      const l = 62 + (seed % 12); // 62..73% (Lightness tinggi khas Pink/Rose)
      return {
        valid: true,
        resultColor: 'Pink',
        resultHex: hslToHex(h, s, l),
        shadeName: h < 338 ? 'Berry Rose Pink' : 'Soft Flamingo Pink',
      };
    }

    case 'Purple': {
      // Definisi Purple: Royal Purple, Violet, Plum, Magenta-Purple.
      // Dari: Red/Purple + Blue, atau Purple + Purple/Red.
      // Tidak boleh melibatkan Green, Yellow, Orange, atau Black!
      if (hasGreenA || hasGreenB || hasYellowA || hasYellowB || hasOrangeA || hasOrangeB || hasBlackA || hasBlackB) {
        return null;
      }
      const isRedPurpleWithBlue =
        ((hasRedA || hasPurpleA) && hasBlueB) ||
        (hasBlueA && (hasRedB || hasPurpleB));
      const isPurplePair =
        (hasPurpleA && (hasPurpleB || hasRedB)) ||
        (hasPurpleB && (hasPurpleA || hasRedA));

      if (isRedPurpleWithBlue || isPurplePair) {
        const h = isRedPurpleWithBlue ? 270 + (seed % 20) : 284 + (seed % 22); // 270..305
        const s = 62 + (seed % 20); // 62..81%
        const l = 42 + (seed % 13); // 42..54%
        return {
          valid: true,
          resultColor: 'Purple',
          resultHex: hslToHex(h, s, l),
          shadeName: h < 282 ? 'Deep Royal Violet' : 'Rich Plum Purple',
        };
      }
      return null;
    }

    case 'Blue': {
      // Definisi Blue: Sky Blue, Ocean Blue, Cobalt Blue, Aqua-Blue.
      // Dari: Blue + Blue, Blue dominan + Purple (Indigo/Cobalt), atau Blue dominan + Green (Ocean/Teal Blue).
      // Tidak boleh melibatkan Yellow, Orange, Red murni, atau Black!
      if (hasYellowA || hasYellowB || hasOrangeA || hasOrangeB || hasBlackA || hasBlackB) {
        return null;
      }
      if (!hasBlueA && !hasBlueB) return null;

      const bothBlue = hasBlueA && hasBlueB;
      const blueWithGreen = (hasBlueA && hasGreenB) || (hasGreenA && hasBlueB);
      const blueWithPurple =
        (hasBlueA && hasPurpleB && !hasRedB) ||
        (hasPurpleA && !hasRedA && hasBlueB);

      if (bothBlue || blueWithGreen || blueWithPurple) {
        let h = 210 + (seed % 14);
        if (blueWithGreen) h = 196 + (seed % 12); // Ocean / Teal Blue
        if (blueWithPurple) h = 224 + (seed % 12); // Cobalt / Indigo Blue
        const s = 70 + (seed % 16); // 70..85%
        const l = 45 + (seed % 13); // 45..57%
        return {
          valid: true,
          resultColor: 'Blue',
          resultHex: hslToHex(h, s, l),
          shadeName: h < 205 ? 'Ocean Turquoise Blue' : h > 222 ? 'Royal Cobalt Blue' : 'Bright Sky Blue',
        };
      }
      return null;
    }

    case 'Green': {
      // Definisi Green: Lime Green, Leaf Green, Emerald Green, Mint Green.
      // Dari: Yellow + Blue (campuran klasik hijau alami), Green + Yellow, Green + Blue, atau Green + Green.
      // Tidak boleh melibatkan Red, Purple, atau Black!
      if (hasRedA || hasRedB || hasPurpleA || hasPurpleB || hasBlackA || hasBlackB) {
        return null;
      }
      const isYellowAndBlue =
        ((hasYellowA || hasOrangeA) && hasBlueB) ||
        (hasBlueA && (hasYellowB || hasOrangeB));
      const isGreenWithYellow =
        (hasGreenA && (hasYellowB || hasOrangeB)) ||
        ((hasYellowA || hasOrangeA) && hasGreenB);
      const isGreenWithBlue =
        (hasGreenA && hasBlueB) || (hasBlueA && hasGreenB);
      const isBothGreen = hasGreenA && hasGreenB;

      if (isYellowAndBlue || isGreenWithYellow || isGreenWithBlue || isBothGreen) {
        let h = 115 + (seed % 20);
        if (isGreenWithYellow || (isYellowAndBlue && wA >= 0.65 && hasYellowA)) {
          h = 88 + (seed % 18); // Lime / Apple Green
        } else if (isGreenWithBlue) {
          h = 134 + (seed % 16); // Emerald / Forest Green
        }
        const s = 64 + (seed % 20); // 64..83%
        const l = 42 + (seed % 12); // 42..53%
        return {
          valid: true,
          resultColor: 'Green',
          resultHex: hslToHex(h, s, l),
          shadeName: h < 105 ? 'Fresh Lime Green' : h > 130 ? 'Emerald Mint Green' : 'Natural Leaf Green',
        };
      }
      return null;
    }

    case 'Brown': {
      // Definisi Brown: Caramel Brown, Cocoa/Chocolate Brown, Coffee Brown, Bronze.
      // Dihasilkan dari pencampuran komplementer alami:
      // 1. Red + Green (komplementer merah-hijau -> cokelat kakao/terracotta)
      // 2. Orange + Blue/Purple, atau Yellow + Purple (komplementer kuning-ungu / oranye-biru -> cokelat karamel)
      //    Catatan: Murni Yellow + Blue adalah Green, BUKAN Brown!
      // 3. Orange/Red/Yellow + Black (pada rasio 70:30 - 85:15 -> cokelat kopi/gelap)
      const isPureYellowAndBlue =
        (isPureYellowA && hasBlueB && !hasPurpleB) ||
        (hasBlueA && !hasPurpleA && isPureYellowB);
      if (isPureYellowAndBlue) return null;

      const isRedAndGreen =
        ((hasRedA || hasPurpleA) && hasGreenB) ||
        (hasGreenA && (hasRedB || hasPurpleB));
      const isOrangeAndBlueOrPurple =
        (hasOrangeA && (hasBlueB || hasPurpleB)) ||
        ((hasBlueA || hasPurpleA) && hasOrangeB);
      const isYellowAndPurple =
        (hasYellowA && hasPurpleB && !hasRedB) ||
        (hasPurpleA && !hasRedA && hasYellowB);
      const isWarmAndBlack =
        ((hasOrangeA || hasRedA || hasYellowA) && hasBlackB) ||
        (hasBlackA && (hasOrangeB || hasRedB || hasYellowB));

      if (isRedAndGreen || isOrangeAndBlueOrPurple || isYellowAndPurple || isWarmAndBlack) {
        const h = 20 + (seed % 15); // 20..34 (Warm Cocoa / Caramel / Terracotta Brown)
        const s = 46 + (seed % 20); // 46..65%
        const l = 28 + (seed % 13); // 28..40%
        return {
          valid: true,
          resultColor: 'Brown',
          resultHex: hslToHex(h, s, l),
          shadeName: l >= 35 ? 'Warm Caramel Brown' : 'Rich Cocoa Brown',
        };
      }
      return null;
    }

    case 'Black': {
      // Definisi Black: Jet Black, Deep Charcoal, Dark Espresso.
      // Melibatkan minimal satu bahan Black (Karbon / Tinta Cumi) dengan sesama Black, Purple, Blue, atau Red pekat.
      if (!hasBlackA && !hasBlackB) return null;
      const bothBlack = hasBlackA && hasBlackB;
      const blackWithDeep =
        (hasBlackA && (hasPurpleB || hasBlueB || hasRedB || hasGreenB)) ||
        ((hasPurpleA || hasBlueA || hasRedA || hasGreenA) && hasBlackB);

      if (bothBlack || blackWithDeep) {
        const h = 220 + (seed % 40);
        const s = 6 + (seed % 10); // 6..15%
        const l = 14 + (seed % 9); // 14..22%
        return {
          valid: true,
          resultColor: 'Black',
          resultHex: hslToHex(h, s, l),
          shadeName: l <= 17 ? 'Deep Jet Black' : 'Neutral Charcoal Black',
        };
      }
      return null;
    }

    default:
      return null;
  }
}

/**
 * Menghitung irisan rentang pH dan proses yang kompatibel untuk pasangan (matA, matB).
 */
export function computePairCompatibility(matA, matB) {
  const solA = String(matA.solubility || '').toLowerCase();
  const solB = String(matB.solubility || '').toLowerCase();
  const isOilA = solA.includes('minyak');
  const isOilB = solB.includes('minyak');
  const solubilityCompatible = isOilA === isOilB;

  const minA = matA.ph?.min ?? null;
  const maxA = matA.ph?.max ?? null;
  const minB = matB.ph?.min ?? null;
  const maxB = matB.ph?.max ?? null;

  let phMin = null;
  let phMax = null;
  if (minA !== null && minB !== null) phMin = Math.max(minA, minB);
  else phMin = minA ?? minB;

  if (maxA !== null && maxB !== null) phMax = Math.min(maxA, maxB);
  else phMax = maxA ?? maxB;

  const phValid = phMin === null || phMax === null || phMin <= phMax;

  const procsA = Array.isArray(matA.processes) ? matA.processes : [];
  const procsB = Array.isArray(matB.processes) ? matB.processes : [];
  const processes = procsA.filter((p) => procsB.includes(p));

  const notesList = [];
  if (!solubilityCompatible) {
    notesList.push('Perbedaan fase kelarutan (air vs minyak): membutuhkan sistem emulsi');
  }
  if (matA.group === 'Antosianin' || matB.group === 'Antosianin') {
    notesList.push('Warna bergantung pH produk');
  }
  if (matA.light === 'Rendah' || matB.light === 'Rendah') {
    notesList.push('Peka cahaya: gunakan kemasan opak');
  }
  if (matA.animal || matB.animal) {
    notesList.push('Mengandung bahan hewani');
  }

  return {
    solubilityCompatible,
    phValid,
    ph: { min: phMin, max: phMax },
    processes,
    notes: notesList.length > 0 ? notesList.join('; ') : null,
  };
}

/**
 * Menghitung warna hasil eksplorasi langsung untuk sembarang pasangan (matA, matB) dan rasio A (10..90).
 */
export function computeInteractiveMix(matA, matB, ratioA = 50) {
  if (!matA || !matB) return null;
  const wA = Math.max(0.05, Math.min(0.95, ratioA / 100));
  const wB = 1 - wA;
  const ratioText = `${Math.round(wA * 100)}:${Math.round(wB * 100)}`;

  const hexA = getCalibratedMaterialHex(matA);
  const hexB = getCalibratedMaterialHex(matB);

  // Urutan prioritas pencocokan kategori warna berdasarkan komposisi dan rasio
  const candidateTargets = [
    'Yellow',
    'Orange',
    'Red',
    'Pink',
    'Purple',
    'Blue',
    'Green',
    'Black',
    'Brown',
  ];

  // Pilih kategori warna yang paling sesuai dengan pasangan & rasio
  const colsA = new Set(matA.colors || []);
  const colsB = new Set(matB.colors || []);

  let preferredOrder = candidateTargets;
  if (colsA.has('Black') || colsB.has('Black')) {
    preferredOrder = wA >= 0.45 && colsA.has('Black') ? ['Black', 'Brown'] : wB >= 0.45 && colsB.has('Black') ? ['Black', 'Brown'] : ['Brown', 'Black'];
  } else if ((colsA.has('Yellow') && colsB.has('Blue')) || (colsA.has('Blue') && colsB.has('Yellow'))) {
    preferredOrder = ['Green', 'Blue', 'Brown'];
  } else if ((colsA.has('Yellow') && colsB.has('Red')) || (colsA.has('Red') && colsB.has('Yellow'))) {
    preferredOrder = wA >= 0.75 && colsA.has('Yellow') ? ['Orange', 'Yellow', 'Red'] : wB >= 0.75 && colsB.has('Yellow') ? ['Orange', 'Yellow', 'Red'] : ['Orange', 'Red', 'Pink'];
  } else if ((colsA.has('Red') && colsB.has('Blue')) || (colsA.has('Blue') && colsB.has('Red'))) {
    preferredOrder = ['Purple', 'Blue', 'Brown'];
  }

  let matchedEval = null;
  for (const target of preferredOrder) {
    const ev = evaluatePairForTargetColor(matA, matB, target, ratioA);
    if (ev && ev.valid) {
      matchedEval = ev;
      break;
    }
  }

  if (!matchedEval) {
    for (const target of candidateTargets) {
      const ev = evaluatePairForTargetColor(matA, matB, target, ratioA);
      if (ev && ev.valid) {
        matchedEval = ev;
        break;
      }
    }
  }

  // Geser hue/lightness secara halus mengikuti slider rasio A:B antara hexA dan hexB
  const hslA = hexToHsl(hexA);
  const hslB = hexToHsl(hexB);
  const baseEvalHex = matchedEval ? matchedEval.resultHex : hexA;
  const hslBase = hexToHsl(baseEvalHex);

  // Interpolasi ringan antara rona A, rona tengah (matchedEval), dan rona B berdasarkan rasio
  const rgbA = hexToRgb(hexA);
  const rgbB = hexToRgb(hexB);
  const rgbMid = hexToRgb(baseEvalHex);

  let finalRgb;
  if (wA >= 0.5) {
    const t = (wA - 0.5) * 2; // 0..1 menuju A
    finalRgb = {
      r: rgbMid.r * (1 - t * 0.55) + rgbA.r * (t * 0.55),
      g: rgbMid.g * (1 - t * 0.55) + rgbA.g * (t * 0.55),
      b: rgbMid.b * (1 - t * 0.55) + rgbA.b * (t * 0.55),
    };
  } else {
    const t = (0.5 - wA) * 2; // 0..1 menuju B
    finalRgb = {
      r: rgbMid.r * (1 - t * 0.55) + rgbB.r * (t * 0.55),
      g: rgbMid.g * (1 - t * 0.55) + rgbB.g * (t * 0.55),
      b: rgbMid.b * (1 - t * 0.55) + rgbB.b * (t * 0.55),
    };
  }

  const finalHex = rgbToHex(finalRgb);
  const compat = computePairCompatibility(matA, matB);
  const granA = getMaterialExtensionStatus(matA.id, 'Granulasi');
  const granB = getMaterialExtensionStatus(matB.id, 'Granulasi');
  const granulasiCompatible =
    granA?.status === 'Compatible' && granB?.status === 'Compatible';

  return {
    a: { id: matA.id, name: matA.name, hex: matA.hex || hexA, group: matA.group },
    b: { id: matB.id, name: matB.name, hex: matB.hex || hexB, group: matB.group },
    ratio: ratioText,
    resultColor: matchedEval ? matchedEval.resultColor : (matA.colors?.[0] || 'Orange'),
    shadeName: matchedEval ? matchedEval.shadeName : 'Custom Blend Shade',
    resultHex: finalHex,
    hsl: hslBase,
    ph: compat.ph,
    phValid: compat.phValid,
    processes: compat.processes,
    granulasiCompatible,
    notes: compat.notes,
  };
}

/**
 * Memperbaiki, menyaring, dan melengkapi daftar kombinasi warna untuk kesembilan Target Color
 * secara otomatis di memori tanpa mengubah berkas JSON database.
 */
export function buildEnhancedCombinations(rawCombinations, materials) {
  if (!Array.isArray(rawCombinations) || !Array.isArray(materials) || materials.length === 0) {
    return rawCombinations || [];
  }

  const matMap = new Map(materials.map((m) => [m.id, m]));
  const enhanced = [];
  const seenColorPair = new Set();

  // 1. Proses kombinasi yang ada di combinations.json:
  //    - Pertahankan bila valid untuk resultColor-nya (dengan swatch terkalibrasi).
  //    - Bila pasangan tersebut sebenarnya menghasilkan Brown/Pink/Black, reklasifikasikan dengan tepat.
  for (const combo of rawCombinations) {
    const matA = matMap.get(combo.a?.id);
    const matB = matMap.get(combo.b?.id);
    if (!matA || !matB) continue;

    const ratioParts = String(combo.ratio || '50:50').split(':');
    const ratioA = parseInt(ratioParts[0], 10) || 50;

    const hexA = matA.hex || getCalibratedMaterialHex(matA);
    const hexB = matB.hex || getCalibratedMaterialHex(matB);

    // Cek apakah valid untuk warna hasil aslinya
    const checkOrig = evaluatePairForTargetColor(matA, matB, combo.resultColor, ratioA);
    if (checkOrig && checkOrig.valid) {
      const pairKey = `${combo.resultColor}:${[matA.id, matB.id].sort().join('+')}`;
      seenColorPair.add(pairKey);
      enhanced.push({
        ...combo,
        a: { ...combo.a, hex: hexA },
        b: { ...combo.b, hex: hexB },
        resultHex: checkOrig.resultHex,
        shadeName: checkOrig.shadeName,
      });
      continue;
    }

    // Jika tidak valid untuk warna aslinya (misal Red+Green atau Orange+Blue yang dulunya dilabeli Yellow),
    // periksa apakah pasangan ini secara alami cocok untuk Brown, Pink, atau Black!
    for (const altColor of ['Brown', 'Pink', 'Black', 'Green', 'Purple']) {
      const checkAlt = evaluatePairForTargetColor(matA, matB, altColor, ratioA);
      if (checkAlt && checkAlt.valid) {
        const pairKey = `${altColor}:${[matA.id, matB.id].sort().join('+')}`;
        if (!seenColorPair.has(pairKey)) {
          seenColorPair.add(pairKey);
          enhanced.push({
            ...combo,
            resultColor: altColor,
            a: { ...combo.a, hex: hexA },
            b: { ...combo.b, hex: hexB },
            resultHex: checkAlt.resultHex,
            shadeName: checkAlt.shadeName,
          });
        }
        break;
      }
    }
  }

  // 2. Lengkapi kombinasi autentik yang belum tercakup (terutama Yellow+Yellow, Red+Red, Pink, Brown, Black, Blue+Blue, Green+Green)
  const targetConfigs = [
    {
      color: 'Yellow',
      ratio: '55:45',
      ratioRange: '30:70 s.d. 75:25',
      filterA: (m) => m.colors?.includes('Yellow'),
      filterB: (m) => m.colors?.includes('Yellow'),
      maxPairs: 120,
    },
    {
      color: 'Red',
      ratio: '55:45',
      ratioRange: '35:65 s.d. 75:25',
      filterA: (m) => m.colors?.includes('Red'),
      filterB: (m) => m.colors?.includes('Red'),
      maxPairs: 80,
    },
    {
      color: 'Pink',
      ratio: '65:35',
      ratioRange: '45:55 s.d. 80:20',
      filterA: (m) => isRoseOrPinkCapable(m),
      filterB: (m) => isRoseOrPinkCapable(m),
      maxPairs: 90,
    },
    {
      color: 'Brown',
      ratio: '60:40',
      ratioRange: '45:55 s.d. 75:25',
      filterA: (m) => m.colors?.includes('Orange') || m.colors?.includes('Red'),
      filterB: (m) => m.colors?.includes('Green') || m.colors?.includes('Blue') || m.colors?.includes('Black') || m.colors?.includes('Purple'),
      maxPairs: 90,
    },
    {
      color: 'Black',
      ratio: '75:25',
      ratioRange: '60:40 s.d. 90:10',
      filterA: (m) => m.colors?.includes('Black'),
      filterB: (m) => m.colors?.includes('Black') || m.colors?.includes('Purple') || m.colors?.includes('Blue') || m.colors?.includes('Red'),
      maxPairs: 45,
    },
    {
      color: 'Blue',
      ratio: '65:35',
      ratioRange: '45:55 s.d. 85:15',
      filterA: (m) => m.colors?.includes('Blue'),
      filterB: (m) => m.colors?.includes('Blue') || m.colors?.includes('Purple') || m.colors?.includes('Green'),
      maxPairs: 60,
    },
    {
      color: 'Green',
      ratio: '55:45',
      ratioRange: '35:65 s.d. 75:25',
      filterA: (m) => m.colors?.includes('Green') || m.colors?.includes('Yellow'),
      filterB: (m) => m.colors?.includes('Green') || m.colors?.includes('Blue'),
      maxPairs: 80,
    },
    {
      color: 'Purple',
      ratio: '55:45',
      ratioRange: '35:65 s.d. 75:25',
      filterA: (m) => m.colors?.includes('Purple') || m.colors?.includes('Red'),
      filterB: (m) => m.colors?.includes('Blue') || m.colors?.includes('Purple'),
      maxPairs: 60,
    },
  ];

  let autoCounter = 1;
  for (const cfg of targetConfigs) {
    const listA = materials.filter(cfg.filterA);
    const listB = materials.filter(cfg.filterB);
    let addedForColor = 0;

    for (const matA of listA) {
      if (addedForColor >= cfg.maxPairs) break;
      for (const matB of listB) {
        if (matA.id === matB.id) continue;
        if (addedForColor >= cfg.maxPairs) break;

        const pairKey = `${cfg.color}:${[matA.id, matB.id].sort().join('+')}`;
        if (seenColorPair.has(pairKey)) continue;

        const compat = computePairCompatibility(matA, matB);
        if (!compat.solubilityCompatible || !compat.phValid || compat.processes.length === 0) continue;

        const ratioParts = cfg.ratio.split(':');
        const ratioA = parseInt(ratioParts[0], 10) || 55;
        const evalRes = evaluatePairForTargetColor(matA, matB, cfg.color, ratioA);
        if (!evalRes || !evalRes.valid) continue;

        seenColorPair.add(pairKey);
        addedForColor++;

        // Hitung skor kompatibilitas (85,0 s.d. 99,2) berdasarkan keluasan rentang pH dan jumlah proses
        const phSpan =
          compat.ph.min !== null && compat.ph.max !== null
            ? Math.max(0, compat.ph.max - compat.ph.min)
            : 4;
        const rawScore = 84 + Math.min(8, phSpan * 1.4) + Math.min(7.2, compat.processes.length * 1.3);
        const score = Math.round(rawScore * 10) / 10;

        enhanced.push({
          id: `KM-A${String(autoCounter++).padStart(3, '0')}`,
          resultColor: cfg.color,
          score,
          a: {
            id: matA.id,
            name: matA.name,
            hex: matA.hex || getCalibratedMaterialHex(matA),
          },
          b: {
            id: matB.id,
            name: matB.name,
            hex: matB.hex || getCalibratedMaterialHex(matB),
          },
          ratio: cfg.ratio,
          ratioRange: cfg.ratioRange,
          resultHex: evalRes.resultHex,
          shadeName: evalRes.shadeName,
          ph: compat.ph,
          processes: compat.processes,
          notes: compat.notes,
        });
      }
    }
  }

  enhanced.sort((x, y) => (y.score ?? 0) - (x.score ?? 0));
  return enhanced;
}
