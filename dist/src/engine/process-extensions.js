/**
 * Process Compatibility Extension — Modul Teknis Granulasi (Lengkap untuk 85 Bahan)
 *
 * Disusun berdasarkan literatur global teknologi pangan & formulasi sediaan granul/serbuk instan
 * (Wet High-Shear Granulation, Fluid-Bed Top-Spray Granulation, Dry Granulation / Roller Compaction,
 * dan Effervescent / Instant Beverage Granules).
 *
 * Tetap terpisah dari berkas JSON database utama (public/data/*.json) sehingga integritas
 * daftar putih Excel asli tetap terjaga 100%.
 *
 * Tiga status standar yang digunakan:
 * - "Compatible"   : Memiliki bukti kompatibilitas terhadap proses granulasi (wet/fluid-bed/dry).
 * - "Incompatible" : Memiliki bukti ketidakcocokan terhadap granulasi basah/termal standar
 *                    (degradasi hidrolitik, dekarboksilasi termal, denaturasi protein, atau inkompatibilitas fase).
 * - "Unknown"      : Informasi kompatibilitas granulasi spesifik belum terverifikasi penuh dan
 *                    membutuhkan optimasi parameter R&D (suhu rendah, penyangga pH mikro, atau stabilisasi emulsi).
 */

export const EXTENSION_PROCESSES = [
  {
    type: 'Proses Pengolahan',
    value: 'Granulasi',
    label: 'Granulasi',
    isExtension: true,
    defaultStatus: 'Unknown',
    unknownReason:
      'Data kompatibilitas granulasi belum tersedia secara terverifikasi (Unknown) — perlu uji parameter suhu & pengikat oleh R&D',
    compatibleReason:
      'Proses Granulasi: Compatible (stabil terhadap beban panas, kelembapan singkat, dan gaya geser granulasi)',
    incompatibleReason:
      'Proses Granulasi: Incompatible pada granulasi basah/termal standar',
    bannerNotice:
      'Evaluasi Proses Granulasi mencakup ketahanan pigmen terhadap kelembapan cairan pengikat (binder), suhu udara pengering (fluid-bed / oven drying), paparan oksigen, dan risiko bercak warna (speckling/mottling). Kandidat berstatus Compatible tampil pada rekomendasi utama, kandidat Unknown ditempatkan pada Sesuai dengan catatan, dan bahan Incompatible dimasukkan ke daftar tersaring.',
  },
];

/**
 * Profil teknis granulasi per kelompok/sub-tipe bahan yang dipetakan secara spesifik
 * untuk seluruh 85 bahan (NC-001 s.d. NC-085).
 */
const GRANULATION_PROFILES = {
  // 1. Karotenoid Bubuk Terenkapsulasi / Beadlet / CWS / WSP (Tahan Panas Tinggi)
  CAROTENOID_ENCAPSULATED_POWDER: {
    status: 'Compatible',
    recommendedMethod:
      'Fluid-Bed Top-Spray Granulation (FBG) atau High-Shear Wet Granulation (dispersi dalam binder)',
    maxProductTemp: 'Suhu produk ≤ 60–70 °C (suhu udara masuk / inlet 75–85 °C dengan pendinginan evaporatif)',
    moistureAwLimit:
      'Toleran terhadap pembasahan singkat; target aktivitas air (a_w) granul akhir < 0,30',
    binderAndMatrix:
      'Matriks maltodekstrin, gum arab, atau pati termodifikasi; tambahkan antioksidan (natrium askorbat 200–300 ppm atau tokoferol) ke dalam larutan pengikat',
    specklingRisk:
      'Rendah–Sedang: dispersikan serbuk CWS/WSP ke dalam cairan pengikat (binder solution) sebelum disemprotkan untuk mencegah bintik oranye/kuning (speckling)',
    evidence:
      'Matriks hidrokoloid pelindung (core-shell microencapsulation / beadlet) melindungi ikatan rangkap terkonjugasi karotenoid dari autooksidasi selama fluidisasi udara panas.',
  },

  // 2. Karotenoid Larut Air Terformulasi Stabilitas Tinggi (Exberry Mandarin / Yellow Carotene)
  CAROTENOID_EXBERRY_HIGH_STABILITY: {
    status: 'Compatible',
    recommendedMethod:
      'Fluid-Bed Granulation (penyemprotan bersama larutan binder) atau Wet Granulation',
    maxProductTemp: 'Suhu produk ≤ 65–75 °C; tahan siklus pengeringan fluid-bed standar',
    moistureAwLimit:
      'Stabil pada fase pembasahan; jaga kadar air granul akhir < 3–4% (a_w < 0,30)',
    binderAndMatrix:
      'Kompatibel dengan pengikat hidrofilik (maltodekstrin, sukrosa, PVP, HPMC); disarankan penambahan asam askorbat ~300 ppm sebagai pelindung oksidasi',
    specklingRisk:
      'Sangat Rendah: karena terdispersi halus/larut dalam fase berair, penyemprotan lewat nozzle menghasilkan warna granul yang sangat homogen',
    evidence:
      'Dispersi karotenoid terformulasi memiliki ketahanan panas dan cahaya tinggi serta stabil pada rentang pH luas (pH 2–8) selama proses granulasi minuman serbuk maupun tablet hisap.',
  },

  // 3. Karotenoid Cair / Stabilitas Panas Sedang (Butuh Verifikasi Emulsi & Oksidasi)
  CAROTENOID_LIQUID_OR_MEDIUM_HEAT: {
    status: 'Unknown',
    recommendedMethod:
      'Fluid-Bed Top-Spray Granulation suhu moderat (dimasukkan ke dalam emulsi larutan pengikat)',
    maxProductTemp: 'Batasi suhu produk ≤ 50–55 °C untuk mencegah pemecahan emulsi dan isomerisasi cis-trans',
    moistureAwLimit:
      'Hindari pengeringan berkepanjangan dengan aliran udara panas beroksigen tinggi',
    binderAndMatrix:
      'Wajib dikombinasikan dengan koloid pelindung (gum arab / pati oktanil suksinat) dan antioksidan (askorbat/tokoferol) pada cairan pengikat',
    specklingRisk:
      'Sedang: bila emulsi pecah saat dicampur pengikat asam/elektrolit tinggi, dapat terjadi migrasi warna atau cincin minyak pada granul',
    evidence:
      'Data kompatibilitas granulasi belum tersedia secara terverifikasi; bentuk emulsi cair/stabilitas panas sedang berisiko mengalami autooksidasi pada fluid-bed drying tanpa optimasi antioksidan.',
  },

  // 4. Kurkuminoid Bubuk WSP & Cair Larut Air (Tahan Panas, Peka Basa & Cahaya)
  CURCUMINOID_STABLE: {
    status: 'Compatible',
    recommendedMethod:
      'Fluid-Bed Granulation atau High-Shear Wet Granulation pada matriks asam-netral',
    maxProductTemp: 'Suhu produk ≤ 65–75 °C (kurkumin memiliki stabilitas termal yang baik)',
    moistureAwLimit:
      'Stabil terhadap kelembapan granulasi selama pH mikro lingkungan dijaga < 7,0',
    binderAndMatrix:
      'Gunakan penyangga asam organik (asam sitrat 0,5–1,0%) pada matriks; HINDARI kontak langsung dengan eksipien basa (natrium bikarbonat/karbonat) pada granulasi basah karena mengubah warna kuning menjadi merah-cokelat',
    specklingRisk:
      'Rendah bila disemprotkan bersama larutan pengikat; granul akhir wajib dikemas dalam aluminium foil/kemasan opak karena sangat peka fotodegradasi',
    evidence:
      'Kurkuminoid tahan terhadap suhu pengeringan granulasi, namun mengalami hidrolisis basa di atas pH 7,5–8,0. Pada granul effervescent, pisahkan kurkumin pada fase granul asam.',
  },

  // 5. Flavonoid — Carthamus / Safflower Yellow (Larut Air & Tahan Panas)
  FLAVONOID_SAFFLOWER: {
    status: 'Compatible',
    recommendedMethod:
      'Fluid-Bed Top-Spray Granulation atau Wet Granulation (larut sempurna dalam binder berair)',
    maxProductTemp: 'Suhu produk ≤ 65–70 °C pada pH asam hingga netral (pH 2,5–7,0)',
    moistureAwLimit:
      'Larut air dengan cepat; jaga a_w granul akhir < 0,35 untuk mencegah penggumpalan (caking)',
    binderAndMatrix:
      'Sangat kompatibel dengan pengikat maltodekstrin, laktosa, dekstrosa, atau PVP untuk minuman serbuk instan dan granul effervescent',
    specklingRisk:
      'Sangat Rendah: kelarutan molekuler dalam air memastikan distribusi warna kuning cerah yang merata tanpa bintik (speckle-free)',
    evidence:
      'Pigmen kalkon/kartaflavin dari safflower memiliki ketahanan panas dan cahaya yang baik pada matriks asam-netral serta umum dipakai pada granul minuman instan.',
  },

  // 6. Antrakuinon — Karmin & Asam Karminat (Stabilitas Granulasi Terbaik)
  CARMINE_HIGH_STABILITY: {
    status: 'Compatible',
    recommendedMethod:
      'Semua metode granulasi: High-Shear Wet Granulation, Fluid-Bed Granulation, Dry Roller Compaction, & Tablet Coating',
    maxProductTemp: 'Suhu produk hingga 75–85 °C (sangat tahan panas dan oksidasi)',
    moistureAwLimit:
      'Sangat stabil terhadap kelembapan fase pembasahan maupun pengeringan',
    binderAndMatrix:
      'Stabil pada pH 3,5–9,0 (untuk pH < 3,5 gunakan varian asam karminat tahan asam seperti NC-045 agar tidak mengendap pada cairan pengikat asam)',
    specklingRisk:
      'Sangat Rendah bila dilarutkan dalam larutan pengikat (binder solution); hindari pencampuran kering tanpa pre-blending karena kekuatan warna (tinctorial strength) sangat tinggi',
    evidence:
      'Struktur antrakuinon karmin memiliki stabilitas termal, cahaya, dan oksidasi tertinggi di antara pewarna alami, menjadikannya standar acuan pada granulasi dan penyalutan tablet (Bersumber hewani/cochineal).',
  },

  // 7. Betalain — Bit Merah Konvensional (Peka Panas & Hidrolisis Air pada Granulasi Basah)
  BETALAIN_HEAT_SENSITIVE: {
    status: 'Incompatible',
    recommendedMethod:
      'Tidak cocok untuk Wet/Fluid-Bed Granulation termal; gunakan Post-Granulation Dry Blending atau Dry Roller Compaction suhu rendah',
    maxProductTemp: 'Degradasi cepat di atas 50 °C ketika terdapat air bebas (a_w tinggi)',
    moistureAwLimit:
      'Sangat peka hidrolisis dan kelembapan: kontak dengan air pengikat + udara panas memicu dekarboksilasi dan pencokelatan (browning)',
    binderAndMatrix:
      'Bila wajib masuk ke dalam granul, tambahkan secara pencampuran kering (dry blending) setelah granul dasar dikeringkan (kadar air granul dasar < 2%) bersama antioksidan asam askorbat',
    specklingRisk:
      'Tinggi pada pencampuran kering jika ukuran partikel pembawa tidak seragam; pada granulasi basah terjadi migrasi warna dan pemudaran ke cokelat',
    evidence:
      'Literatur granulasi menunjukkan betanin mengalami pemutusan hidrolitik dan dekarboksilasi termal ireversibel selama pembasahan dan pengeringan fluid-bed/oven standar.',
  },

  // 8. Betalain Terformulasi Stabilitas Menengah (Shade Fiesta)
  BETALAIN_MODERATE: {
    status: 'Unknown',
    recommendedMethod:
      'Dry Granulation (Roller Compaction) atau Fluid-Bed Granulation suhu sangat rendah dengan waktu tinggal singkat',
    maxProductTemp: 'Wajib dijaga ≤ 45–50 °C dengan pendinginan evaporatif cepat',
    moistureAwLimit:
      'Minimalkan waktu kontak dengan air pengikat; target a_w granul akhir < 0,25',
    binderAndMatrix:
      'Gunakan pengikat hidroalkohol atau rasio cairan pengikat minimal pada pH optimum 4,0–6,0 dengan pelindung antioksidan',
    specklingRisk:
      'Sedang: memerlukan uji skala laboratorium untuk memastikan tidak terjadi pergeseran rona merah ke kecokelatan',
    evidence:
      'Data kompatibilitas granulasi belum tersedia secara terverifikasi; meskipun memiliki ketahanan lebih baik dari bit standar, pigmen betalain tetap berisiko terdegradasi oleh kombinasi uap air dan panas.',
  },

  // 9. Klorofilin Tembaga Larut Air / WSP (Tahan Panas & Cahaya Tinggi)
  CHLOROPHYLLIN_COPPER_WS: {
    status: 'Compatible',
    recommendedMethod:
      'Fluid-Bed Top-Spray Granulation atau High-Shear Wet Granulation',
    maxProductTemp: 'Suhu produk ≤ 70–80 °C (kompleks tembaga-porfirin sangat tahan panas)',
    moistureAwLimit:
      'Stabil selama pembasahan dan pengeringan; jaga a_w granul akhir < 0,35',
    binderAndMatrix:
      'Gunakan pada matriks pH netral hingga sedikit basa (pH 6,0–9,0). Pada granul asam/effervescent, tambahkan penyangga (natrium sitrat) atau hidrokoloid pelindung agar asam klembapan lokal tidak mengendapkan asam klorofilin',
    specklingRisk:
      'Rendah bila disemprotkan lewat cairan pengikat ber-pH netral',
    evidence:
      'Natrium tembaga klorofilin memiliki ketahanan panas, cahaya, dan oksidasi yang sangat baik pada pembuatan granul minuman serbuk dan tablet hisap.',
  },

  // 10. Klorofil Larut Minyak (Inkompatibel dengan Binder Berair)
  CHLOROPHYLL_OIL_SOLUBLE: {
    status: 'Incompatible',
    recommendedMethod:
      'Tidak kompatibel untuk granulasi berair standar tanpa pra-mikroenkapsulasi (spray-drying emulsi)',
    maxProductTemp: 'Tahan panas, namun fase minyak bebas mengganggu ikatan antar-partikel granul',
    moistureAwLimit:
      'Bersifat hidrofobik (larut minyak); menolak cairan pengikat berair',
    binderAndMatrix:
      'Harus diubah terlebih dahulu menjadi serbuk terenkapsulasi (WSP/CWS) dengan gum arab/maltodekstrin sebelum dapat digranulasi',
    specklingRisk:
      'Sangat Tinggi: membentuk bercak minyak hijau tua dan menurunkan kompresibilitas granul',
    evidence:
      'Pigmen larut minyak murni tidak dapat terdistribusi homogen dalam sistem granulasi basah berair dan membentuk lapisan hidrofobik yang menghambat jembatan pengikat (liquid bridges).',
  },

  // 11. Fikosianin — Spirulina Standar (Denaturasi Protein pada Panas Granulasi)
  PHYCOCYANIN_HEAT_SENSITIVE: {
    status: 'Incompatible',
    recommendedMethod:
      'Tidak cocok untuk Wet/Fluid-Bed Granulation panas; gunakan Post-Granulation Dry Blending atau Dry Granulation dingin',
    maxProductTemp: 'Terdenaturasi ireversibel pada suhu > 45–50 °C',
    moistureAwLimit:
      'Kombinasi kelembapan pengikat dan suhu pengeringan memicu denaturasi gugus kromofor biliprotein dan pemudaran warna biru',
    binderAndMatrix:
      'Tambahkan sebagai komponen kering (dry-blend) pasca-granulasi pada matriks ber-pH 4,5–7,0; hindari kontak langsung dengan kristal asam sitrat tanpa penyangga',
    specklingRisk:
      'Sedang–Tinggi pada dry-blending: gunakan ukuran partikel halus (microfine) atau ko-granulasi suhu dingin (< 40 °C)',
    evidence:
      'Fikosianin adalah kompleks pigmen-protein yang mengalami denaturasi termal di atas 45 °C serta presipitasi pada lingkungan mikro asam selama granulasi basah.',
  },

  // 12. Fikosianin Terstabilkan (Exberry Shade Blue-HP / Shade Lime Green)
  PHYCOCYANIN_STABILIZED: {
    status: 'Unknown',
    recommendedMethod:
      'Fluid-Bed Granulation suhu rendah (< 45–50 °C) atau Dry Roller Compaction',
    maxProductTemp: 'Wajib dijaga di bawah 50 °C (gunakan aliran udara pengering dengan kelembapan rendah / dehumidified air)',
    moistureAwLimit:
      'Waktu pembasahan harus singkat untuk mencegah denaturasi protein',
    binderAndMatrix:
      'Telah diformulasikan untuk toleransi pH asam (pH 2,5–4,0), namun tetap memerlukan verifikasi R&D terhadap beban panas pengeringan granul',
    specklingRisk:
      'Rendah bila disemprotkan pada suhu rendah; perlu uji stabilitas penyimpanan dipercepat (accelerated shelf-life)',
    evidence:
      'Data kompatibilitas granulasi belum tersedia secara terverifikasi; varian spirulina terstabilkan tahan terhadap pH asam tetapi tetap sensitif terhadap suhu pengeringan > 60 °C.',
  },

  // 13. Iridoid / Genipin — Gardenia Blue & Jagua Blue (Biru Tahan Granulasi)
  IRIDOID_GENIPIN_BLUE: {
    status: 'Compatible',
    recommendedMethod:
      'Fluid-Bed Top-Spray Granulation, High-Shear Wet Granulation, dan Tablet Film Coating',
    maxProductTemp: 'Suhu produk hingga 75–85 °C (stabil secara termal)',
    moistureAwLimit:
      'Stabil pada fase pembasahan dan pengeringan; target a_w granul < 0,35',
    binderAndMatrix:
      'Stabil pada rentang pH luas (pH 3,0–9,0); sangat cocok menggantikan spirulina untuk granul minuman asam, effervescent, dan tablet kunyah',
    specklingRisk:
      'Sangat Rendah bila dilarutkan/didispersikan dalam larutan pengikat sebelum disemprotkan',
    evidence:
      'Polimer pigmen biru hasil reaksi genipin dengan asam amino memiliki ketahanan panas, cahaya, dan pH yang jauh lebih tinggi dibanding fikosianin pada proses granulasi dan penyalutan tablet.',
  },

  // 14. Antosianin Terasilasi Tahan Panas Tinggi (Exberry Vivid/Rubescent/Veggie Red, Purple Plum)
  ANTHOCYANIN_ACYLATED_HIGH_HEAT: {
    status: 'Compatible',
    recommendedMethod:
      'Fluid-Bed Top-Spray Granulation pada sistem matriks terasidifikasi (pH asam)',
    maxProductTemp: 'Suhu produk ≤ 60–65 °C dengan waktu pengeringan terukur',
    moistureAwLimit:
      'Jaga pH cairan pengikat di bawah 3,5–3,8 selama pembasahan untuk mempertahankan bentuk kation flavilium merah/ungu yang stabil',
    binderAndMatrix:
      'Tambahkan asam sitrat/malat dalam larutan pengikat; HINDARI asam askorbat dosis tinggi dan hindari kontak basah langsung dengan natrium bikarbonat (gunakan sistem granulasi dua fase pada tablet effervescent)',
    specklingRisk:
      'Rendah pada matriks asam homogen; berisiko bercak biru/keunguan bila terpapar partikel alkali atau ion logam (Fe/Al/Sn)',
    evidence:
      'Antosianin sayur terasilasi memiliki penumpukan intramolekuler (intramolecular copigmentation) yang melindungi kromofor dari pembukaan cincin hidrolitik dan panas selama granulasi.',
  },

  // 15. Antosianin Stabilitas Panas Sedang (Black Carrot, Purple Sweet Potato, Radish, ColorFruit/FruitMax)
  ANTHOCYANIN_MEDIUM_HEAT: {
    status: 'Unknown',
    recommendedMethod:
      'Fluid-Bed Granulation suhu rendah-menengah (≤ 50–55 °C) dengan penyangga asam, atau Dry Granulation',
    maxProductTemp: 'Batasi suhu produk ≤ 50–55 °C untuk mencegah pembentukan kalkon tak berwarna',
    moistureAwLimit:
      'Peka terhadap kelembapan tinggi berkepanjangan; target a_w granul akhir < 0,30',
    binderAndMatrix:
      'Wajib menggunakan larutan pengikat asam (pH 2,5–3,5); pisahkan dari komponen bikarbonat, garam kalsium/besi, dan asam askorbat',
    specklingRisk:
      'Sedang: sangat rentan mengalami bercak warna keunguan/abu-biru (mottling) apabila terjadi fluktuasi pH mikro di permukaan granul',
    evidence:
      'Data kompatibilitas granulasi belum tersedia secara terverifikasi; memerlukan optimasi pH mikro lingkungan dan suhu pengeringan oleh R&D agar rona merah/ungu tidak bergeser.',
  },

  // 16. Antosianin Buah Peka Panas (Acai 300 WSP)
  ANTHOCYANIN_LOW_HEAT: {
    status: 'Incompatible',
    recommendedMethod:
      'Tidak disarankan untuk Wet/Fluid-Bed Granulation termal; gunakan Post-Granulation Dry Blending pada matriks asam kering',
    maxProductTemp: 'Mengalami degradasi cepat dan pencokelatan pada suhu pengeringan > 45–50 °C',
    moistureAwLimit:
      'Paparan air pengikat dan udara panas mempercepat hidrolisis cincin flavilium antosianin non-terasilasi',
    binderAndMatrix:
      'Hanya untuk pencampuran kering akhir (dry-mix) dengan eksipien ber-a_w rendah (< 0,25) dan pengemasan kedap uap air/oksigen',
    specklingRisk:
      'Tinggi bila terpapar kelembapan lokal atau pH > 4,0',
    evidence:
      'Antosianin buah non-terasilasi memiliki stabilitas panas rendah dan mudah mengalami pembukaan cincin menjadi kalkon tak berwarna selama pengeringan granulasi.',
  },

  // 17. Karbon Nabati (Sangat Stabil Kimia & Termal, Tantangan Dispersi Fisik)
  CARBON_BLACK_INERT: {
    status: 'Compatible',
    recommendedMethod:
      'High-Shear Wet Granulation atau Fluid-Bed Granulation (wajib suspensi homogen dalam larutan pengikat)',
    maxProductTemp: 'Sangat stabil hingga > 100 °C (inert secara termal dan kimia)',
    moistureAwLimit:
      'Tidak terpengaruh kelembapan, pH (pH 2–10), maupun oksidasi',
    binderAndMatrix:
      'Karena karbon tidak larut molekuler (dispersi partikel sub-mikron), predipersikan bersama hidrokoloid/pengikat (HPMC/PVP/maltodekstrin) sebelum disemprotkan',
    specklingRisk:
      'Sedang–Tinggi bila hanya dicampur kering (dry-blending) karena aglomerasi partikel hitam; penyemprotan suspensi pengikat menghasilkan granul abu-hitam yang rata',
    evidence:
      'Karbon nabati bersifat inert sempurna terhadap panas, pH, dan cahaya selama granulasi serta penyalutan tablet.',
  },

  // 18. Melanin Tinta Cumi (Data Granulasi Belum Tersedia & Tantangan Sensorik)
  MELANIN_SQUID_INK: {
    status: 'Unknown',
    recommendedMethod:
      'Memerlukan evaluasi R&D khusus (umumnya untuk matriks gurih / pasta, jarang digunakan pada granul minuman manis)',
    maxProductTemp: 'Belum terdapat acuan suhu granulasi standar',
    moistureAwLimit:
      'Berbentuk dispersi; aliran udara panas pada fluid-bed berpotensi menguapkan senyawa volatil amis (seafood odor)',
    binderAndMatrix:
      'Perlu uji kompatibilitas dengan matriks bumbu gurih (savory granules) serta perhatian terhadap label alergen moluska/seafood',
    specklingRisk:
      'Sedang: memerlukan homogenisasi berkecepatan tinggi dalam suspensi pengikat',
    evidence:
      'Data kompatibilitas granulasi belum tersedia secara terverifikasi pada literatur maupun basis data internal.',
  },
};

/**
 * Pemetaan eksplisit seluruh 85 bahan (NC-001 s.d. NC-085) ke profil granulasi di atas.
 */
const MATERIAL_PROFILE_ASSIGNMENT = {
  // Karotenoid Bubuk / WS / Beadlet / CWS (Compatible)
  'NC-001': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-004': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-005': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-006': 'CAROTENOID_EXBERRY_HIGH_STABILITY',
  'NC-007': 'CAROTENOID_EXBERRY_HIGH_STABILITY',
  'NC-008': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-009': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-010': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-011': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-012': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-016': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-018': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-020': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-021': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-024': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-028': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-031': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-040': 'CAROTENOID_ENCAPSULATED_POWDER',
  'NC-043': 'CAROTENOID_ENCAPSULATED_POWDER',

  // Karotenoid Cair / Stabilitas Panas Sedang (Unknown)
  'NC-003': 'CAROTENOID_LIQUID_OR_MEDIUM_HEAT',
  'NC-015': 'CAROTENOID_LIQUID_OR_MEDIUM_HEAT',
  'NC-026': 'CAROTENOID_LIQUID_OR_MEDIUM_HEAT',
  'NC-027': 'CAROTENOID_LIQUID_OR_MEDIUM_HEAT',
  'NC-030': 'CAROTENOID_LIQUID_OR_MEDIUM_HEAT',
  'NC-051': 'CAROTENOID_LIQUID_OR_MEDIUM_HEAT',

  // Kurkuminoid (Compatible pada matriks asam-netral)
  'NC-002': 'CURCUMINOID_STABLE',
  'NC-019': 'CURCUMINOID_STABLE',
  'NC-022': 'CURCUMINOID_STABLE',
  'NC-023': 'CURCUMINOID_STABLE',
  'NC-029': 'CURCUMINOID_STABLE',
  'NC-033': 'CURCUMINOID_STABLE',
  'NC-034': 'CURCUMINOID_STABLE',

  // Flavonoid — Carthamus / Safflower (Compatible)
  'NC-013': 'FLAVONOID_SAFFLOWER',
  'NC-014': 'FLAVONOID_SAFFLOWER',
  'NC-017': 'FLAVONOID_SAFFLOWER',
  'NC-025': 'FLAVONOID_SAFFLOWER',
  'NC-032': 'FLAVONOID_SAFFLOWER',

  // Betalain — Bit Merah Konvensional (Incompatible untuk granulasi basah/termal)
  'NC-035': 'BETALAIN_HEAT_SENSITIVE',
  'NC-036': 'BETALAIN_HEAT_SENSITIVE',
  'NC-037': 'BETALAIN_HEAT_SENSITIVE',
  'NC-044': 'BETALAIN_HEAT_SENSITIVE',
  'NC-046': 'BETALAIN_HEAT_SENSITIVE',
  'NC-047': 'BETALAIN_HEAT_SENSITIVE',
  'NC-039': 'BETALAIN_MODERATE',

  // Antrakuinon — Karmin (Compatible)
  'NC-038': 'CARMINE_HIGH_STABILITY',
  'NC-041': 'CARMINE_HIGH_STABILITY',
  'NC-042': 'CARMINE_HIGH_STABILITY',
  'NC-045': 'CARMINE_HIGH_STABILITY',
  'NC-048': 'CARMINE_HIGH_STABILITY',
  'NC-049': 'CARMINE_HIGH_STABILITY',
  'NC-050': 'CARMINE_HIGH_STABILITY',
  'NC-080': 'CARMINE_HIGH_STABILITY',

  // Klorofil / Klorofilin
  'NC-052': 'CHLOROPHYLLIN_COPPER_WS',
  'NC-053': 'CHLOROPHYLL_OIL_SOLUBLE',
  'NC-056': 'CHLOROPHYLLIN_COPPER_WS',
  'NC-057': 'CHLOROPHYLLIN_COPPER_WS',
  'NC-058': 'CHLOROPHYLLIN_COPPER_WS',
  'NC-059': 'CHLOROPHYLLIN_COPPER_WS',
  'NC-060': 'CHLOROPHYLLIN_COPPER_WS',

  // Fikosianin — Spirulina
  'NC-054': 'PHYCOCYANIN_HEAT_SENSITIVE',
  'NC-061': 'PHYCOCYANIN_HEAT_SENSITIVE',
  'NC-055': 'PHYCOCYANIN_STABILIZED',
  'NC-062': 'PHYCOCYANIN_STABILIZED',

  // Iridoid / Genipin — Gardenia & Jagua Blue (Compatible)
  'NC-064': 'IRIDOID_GENIPIN_BLUE',
  'NC-065': 'IRIDOID_GENIPIN_BLUE',
  'NC-072': 'IRIDOID_GENIPIN_BLUE',

  // Antosianin
  'NC-063': 'ANTHOCYANIN_LOW_HEAT',
  'NC-068': 'ANTHOCYANIN_ACYLATED_HIGH_HEAT',
  'NC-069': 'ANTHOCYANIN_ACYLATED_HIGH_HEAT',
  'NC-070': 'ANTHOCYANIN_ACYLATED_HIGH_HEAT',
  'NC-071': 'ANTHOCYANIN_ACYLATED_HIGH_HEAT',
  'NC-066': 'ANTHOCYANIN_MEDIUM_HEAT',
  'NC-067': 'ANTHOCYANIN_MEDIUM_HEAT',
  'NC-073': 'ANTHOCYANIN_MEDIUM_HEAT',
  'NC-074': 'ANTHOCYANIN_MEDIUM_HEAT',
  'NC-075': 'ANTHOCYANIN_MEDIUM_HEAT',
  'NC-076': 'ANTHOCYANIN_MEDIUM_HEAT',
  'NC-077': 'ANTHOCYANIN_MEDIUM_HEAT',
  'NC-078': 'ANTHOCYANIN_MEDIUM_HEAT',
  'NC-079': 'ANTHOCYANIN_MEDIUM_HEAT',
  'NC-081': 'ANTHOCYANIN_MEDIUM_HEAT',

  // Melanin & Karbon
  'NC-082': 'MELANIN_SQUID_INK',
  'NC-083': 'CARBON_BLACK_INERT',
  'NC-084': 'CARBON_BLACK_INERT',
  'NC-085': 'CARBON_BLACK_INERT',
};

export const EXTENSION_COMPATIBILITY_RECORDS = {
  Granulasi: Object.fromEntries(
    Object.entries(MATERIAL_PROFILE_ASSIGNMENT).map(([id, profileKey]) => [
      id,
      { ...GRANULATION_PROFILES[profileKey], profileKey },
    ])
  ),
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
 * Mengembalikan objek status dan profil teknis granulasi lengkap untuk suatu bahan.
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
  const rawStatus = record?.status || meta.defaultStatus || 'Unknown';
  const status =
    rawStatus === 'Compatible' ||
    rawStatus === 'Incompatible' ||
    rawStatus === 'Unknown'
      ? rawStatus
      : 'Unknown';

  return {
    process: meta.value,
    status,
    recommendedMethod: record?.recommendedMethod || null,
    maxProductTemp: record?.maxProductTemp || null,
    moistureAwLimit: record?.moistureAwLimit || null,
    binderAndMatrix: record?.binderAndMatrix || null,
    specklingRisk: record?.specklingRisk || null,
    evidence: record?.evidence || null,
    meta,
  };
}

/**
 * Panduan teknis proses granulasi tingkat kelompok pigmen untuk Color Learning Booklet.
 */
export const BOOKLET_GRANULATION_GUIDES = {
  'Dasar Pewarna Alami': {
    summary:
      'Proses granulasi mengubah campuran serbuk halus menjadi aglomerat berpori (granul) yang bebas mengalir (free-flowing), bebas debu, dan mudah terbasahi (instantaneous wettability). Pada formulasi pewarna alami, tahapan kritis terletak pada kontak pigmen dengan larutan pengikat (binder solution), gaya geser impeller, suhu udara pengering, dan aktivitas air (a_w) granul akhir.',
    methodsComparison: [
      {
        method: 'Fluid-Bed Top-Spray Granulation (FBG)',
        mechanism:
          'Larutan pengikat yang telah dicampur pewarna disemprotkan ke atas unggun serbuk yang terfluidisasi oleh udara hangat.',
        suitability:
          'Metode terbaik untuk distribusi warna homogen bebas bintik (speckle-free) pada minuman serbuk instan. Suhu produk aktual 15–25 °C lebih rendah dari suhu udara masuk (inlet air) berkat pendinginan evaporatif.',
      },
      {
        method: 'High-Shear Wet Granulation (HSWG)',
        mechanism:
          'Pencampuran mekanis berkecepatan tinggi (impeller & chopper) dengan cairan pengikat dilanjutkan pengeringan fluid-bed atau tray oven.',
        suitability:
          'Menghasilkan granul berdensitas tinggi untuk kempa tablet. Cocok untuk pigmen tahan panas & geser (Karmin, Klorofilin Tembaga, Karotenoid CWS/Beadlet, Gardenia Blue, Karbon).',
      },
      {
        method: 'Dry Granulation (Roller Compaction / Slugging)',
        mechanism:
          'Pemadatan serbuk kering dengan tekanan mekanis tanpa air dan tanpa pengeringan panas, diikuti penggilingan (milling) menjadi granul.',
        suitability:
          'Solusi utama untuk pigmen yang rusak oleh air + panas seperti Betalain (Bit Merah), Fikosianin (Spirulina), dan Antosianin buah non-terasilasi.',
      },
      {
        method: 'Granulasi Effervescent Dua Fase (Asam–Basa Terpisah)',
        mechanism:
          'Granulasi komponen asam (asam sitrat/malat) dan komponen basa (natrium bikarbonat) dilakukan terpisah atau menggunakan pengikat anhidrat (etanol/isopropanol/PVP).',
        suitability:
          'Wajib diterapkan untuk pigmen peka pH alkali seperti Antosianin dan Kurkuminoid: selalu tempatkan pigmen di dalam fase granul asam agar tidak mengalami perubahan warna atau degradasi basa.',
      },
    ],
  },
  Karotenoid: {
    summary:
      'Karotenoid (beta-karoten, apokarotenal, lutein, likopen, bixin/norbixin, kapsantin) memiliki sistem ikatan rangkap terkonjugasi yang peka terhadap autooksidasi selama fluidisasi udara panas. Bentuk serbuk terenkapsulasi (CWS/WSP/beadlet) berstatus Compatible, sedangkan emulsi cair berstatus Unknown dan memerlukan verifikasi antioksidan.',
    keyParameters:
      'Gunakan suhu produk ≤ 60–70 °C; tambahkan natrium askorbat (200–300 ppm) atau dl-alfa-tokoferol pada larutan pengikat; dispersikan serbuk CWS dalam cairan pengikat sebelum penyemprotan untuk mencegah bintik oranye.',
  },
  Kurkuminoid: {
    summary:
      'Kurkumin tahan terhadap suhu pengeringan granulasi hingga 70 °C (Compatible), tetapi mengalami pergeseran struktur keto-enol dan hidrolisis basa yang mengubah warna kuning cerah menjadi merah-kecokelatan pada pH > 7,5.',
    keyParameters:
      'Pertahankan lingkungan mikro granul bersifat asam-netral (tambahkan asam sitrat 0,5–1,0%); pisahkan dari fase natrium bikarbonat pada granul effervescent; kemas granul dalam aluminium foil karena kurkumin sangat peka fotodegradasi.',
  },
  Flavonoid: {
    summary:
      'Pigmen kartaflavin/kalkon dari Safflower (Carthamus tinctorius) larut sempurna secara molekuler dalam air dan tahan suhu granulasi fluid-bed maupun wet granulation (Compatible).',
    keyParameters:
      'Suhu produk ≤ 65–70 °C pada pH 2,5–7,0; larutkan langsung ke dalam larutan pengikat maltodekstrin/sukrosa untuk menghasilkan granul kuning cerah yang homogen tanpa risiko speckling.',
  },
  'Antrakuinon (karmin)': {
    summary:
      'Karmin dan asam karminat memiliki ketahanan panas, cahaya, dan oksidasi paling unggul di antara seluruh pewarna alami (Compatible pada seluruh metode granulasi basah, kering, maupun penyalutan tablet).',
    keyParameters:
      'Tahan suhu produk hingga 75–85 °C; untuk matriks granulasi dengan pH sangat asam (< 3,5) gunakan varian asam karminat tahan asam (seperti NC-045) agar pigmen tidak mengendap di dalam larutan pengikat.',
  },
  Betalain: {
    summary:
      'Betanin dari bit merah mengalami pemutusan hidrolitik (menjadi asam betalamat kuning-cokelat) dan dekarboksilasi termal saat terpapar air pengikat dan udara pengering panas secara bersamaan (Incompatible untuk granulasi basah termal standar).',
    keyParameters:
      'Hindari High-Shear Wet Granulation dengan pengeringan oven; gunakan Dry Roller Compaction atau Post-Granulation Dry Blending ke dalam granul dasar yang sudah kering (a_w < 0,25) bersama asam askorbat.',
  },
  Klorofil: {
    summary:
      'Turunan Natrium Tembaga Klorofilin larut air (WSP) sangat stabil terhadap panas dan oksidasi selama granulasi (Compatible), sedangkan Klorofil larut minyak murni tidak kompatibel (Incompatible) dengan sistem pengikat berair.',
    keyParameters:
      'Suhu produk ≤ 70–80 °C untuk klorofilin tembaga; jaga pH larutan pengikat ≥ 6,0 atau tambahkan penyangga natrium sitrat untuk mencegah pengendapan asam klorofilin pada matriks minuman asam.',
  },
  Fikosianin: {
    summary:
      'Fikosianin (Spirulina) merupakan biliprotein yang mengalami denaturasi struktur tersier protein secara ireversibel pada suhu > 45–50 °C ketika basah (Incompatible pada granulasi basah panas; varian terstabilkan berstatus Unknown).',
    keyParameters:
      'Terapkan Dry Granulation (Roller Compaction) atau pencampuran kering pasca-granulasi; bila menggunakan Fluid-Bed untuk varian terstabilkan, jaga suhu produk < 45 °C dengan udara pengering berkelembapan rendah (dehumidified air).',
  },
  'Iridoid (genipin)': {
    summary:
      'Gardenia Blue dan Jagua Blue (polimer iridoid-asam amino) memiliki ketahanan termal dan rentang pH yang jauh lebih kokoh dibanding fikosianin (Compatible untuk Wet/Fluid-Bed Granulation dan penyalutan tablet).',
    keyParameters:
      'Tahan suhu produk 75–85 °C dan stabil pada pH 3,0–9,0; pilihan utama untuk granul biru atau kombinasi hijau/ungu pada minuman serbuk asam dan tablet effervescent.',
  },
  Antosianin: {
    summary:
      'Stabilitas granulasi antosianin ditentukan oleh derajat asilasi struktur molekulnya: antosianin sayur terasilasi (Exberry Vivid/Rubescent/Veggie Red, Purple Plum) berstatus Compatible pada matriks asam, antosianin ketahanan panas sedang berstatus Unknown, dan antosianin buah non-terasilasi (Acai) berstatus Incompatible.',
    keyParameters:
      'Asidifikasi larutan pengikat hingga pH 2,5–3,5 (dengan asam sitrat/malat) untuk mengunci bentuk kation flavilium; cegah kontak basah dengan natrium bikarbonat dan garam logam (Fe/Al/Ca) agar tidak timbul bercak biru-keabuan (mottling).',
  },
  'Melanin (tinta cumi)': {
    summary:
      'Dispersi melanin tinta cumi (Unknown) jarang diaplikasikan pada granul minuman manis dan membutuhkan verifikasi R&D khusus terkait volatilitas aroma laut saat pengeringan udara panas.',
    keyParameters:
      'Jika diaplikasikan pada granul bumbu gurih (savory seasoning granules), lakukan homogenisasi suspensi pengikat dan cantumkan deklarasi alergen moluska.',
  },
  Karbon: {
    summary:
      'Karbon nabati (Vegetable Carbon Black) bersifat inert sempurna terhadap suhu tinggi (> 100 °C), pH ekstrem, cahaya, dan oksidasi (Compatible), namun memerlukan kontrol dispersi fisik agar tidak menggumpal.',
    keyParameters:
      'Jangan hanya dicampur kering tanpa pra-dispersi karena rentan menimbulkan bintik hitam; suspensikan ke dalam larutan pengikat hidrokoloid (HPMC/PVP/maltodekstrin) dan semprotkan melalui Fluid-Bed atau High-Shear Granulator.',
  },
};

export function getBookletGranulationGuide(groupName) {
  if (!groupName) return null;
  return BOOKLET_GRANULATION_GUIDES[groupName] || null;
}

