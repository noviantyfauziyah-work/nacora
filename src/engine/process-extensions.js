/**
 * Process Compatibility Extension — Modul Teknis Proses Produksi & Fluid-Bed Top-Spray Granulation
 *
 * Mencakup panduan teknis seluruh proses pengolahan pangan (Tanpa Pemanasan, Pasteurisasi, UHT,
 * Sterilisasi / Retort, Baking / Pemanggangan, Ekstrusi, Pembekuan, dan Granulasi) serta
 * profil kompatibilitas spesifik Fluid-Bed Top-Spray Granulation untuk seluruh 85 bahan (NC-001 s.d. NC-085).
 *
 * Tetap terpisah dari berkas JSON database utama (public/data/*.json) sehingga integritas
 * daftar putih Excel asli tetap terjaga 100%.
 */

export const EXTENSION_PROCESSES = [
  {
    type: 'Proses Pengolahan',
    value: 'Granulasi',
    label: 'Granulasi',
    isExtension: true,
    defaultStatus: 'Unknown',
    unknownReason:
      'Kompatibilitas Fluid-Bed Top-Spray Granulation berstatus Unknown — perlu verifikasi suhu produk & komposisi larutan pengikat oleh R&D',
    compatibleReason:
      'Proses Granulasi (Fluid-Bed Top-Spray Granulation): Compatible (stabil terhadap penyemprotan larutan pengikat dan pengeringan fluidisasi)',
    incompatibleReason:
      'Proses Granulasi (Fluid-Bed Top-Spray Granulation): Incompatible terhadap pembasahan pengikat berair & udara pengering panas',
    bannerNotice:
      'Evaluasi Proses Granulasi menggunakan metode Fluid-Bed Top-Spray Granulation, mencakup ketahanan pigmen saat didispersikan dalam cairan pengikat (binder solution), penyemprotan top-spray, suhu udara pengering fluid-bed, dan risiko bercak warna (speckling/mottling). Kandidat berstatus Compatible tampil pada rekomendasi utama, kandidat Unknown ditempatkan pada Sesuai dengan catatan, dan bahan Incompatible dimasukkan ke daftar tersaring.',
  },
];

/**
 * Profil teknis Fluid-Bed Top-Spray Granulation per kelompok/sub-tipe bahan
 * yang dipetakan secara spesifik untuk seluruh 85 bahan (NC-001 s.d. NC-085).
 */
const GRANULATION_PROFILES = {
  // 1. Karotenoid Bubuk Terenkapsulasi / Beadlet / CWS / WSP (Tahan Panas Tinggi)
  CAROTENOID_ENCAPSULATED_POWDER: {
    status: 'Compatible',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Suhu produk ≤ 60–70 °C (suhu udara masuk / inlet 75–85 °C dengan efek pendinginan evaporatif)',
    moistureAwLimit:
      'Toleran terhadap pembasahan top-spray singkat; target aktivitas air (a_w) granul akhir < 0,30',
    binderAndMatrix:
      'Matriks maltodekstrin, gum arab, atau pati termodifikasi; tambahkan antioksidan (natrium askorbat 200–300 ppm atau tokoferol) ke dalam larutan pengikat top-spray',
    specklingRisk:
      'Rendah–Sedang: dispersikan serbuk CWS/WSP secara merata ke dalam cairan pengikat (binder solution) sebelum disemprotkan melalui nozzle top-spray untuk mencegah bintik oranye/kuning',
    evidence:
      'Matriks hidrokoloid pelindung (mikroenkapsulasi CWS/WSP) melindungi ikatan rangkap terkonjugasi karotenoid dari autooksidasi selama fluidisasi udara panas pada Fluid-Bed Top-Spray Granulation.',
  },

  // 2. Karotenoid Larut Air Terformulasi Stabilitas Tinggi (Exberry Mandarin / Yellow Carotene)
  CAROTENOID_EXBERRY_HIGH_STABILITY: {
    status: 'Compatible',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Suhu produk ≤ 65–75 °C; tahan siklus pengeringan Fluid-Bed Top-Spray Granulation standar',
    moistureAwLimit:
      'Stabil pada fase penyemprotan top-spray; jaga kadar air granul akhir < 3–4% (a_w < 0,30)',
    binderAndMatrix:
      'Kompatibel dengan pengikat hidrofilik (maltodekstrin, sukrosa, PVP, HPMC); disarankan penambahan asam askorbat ~300 ppm sebagai pelindung oksidasi',
    specklingRisk:
      'Sangat Rendah: karena terdispersi halus dalam fase berair, atomisasi melalui nozzle top-spray menghasilkan warna granul yang sangat homogen',
    evidence:
      'Dispersi karotenoid terformulasi memiliki ketahanan panas dan cahaya tinggi serta stabil pada rentang pH luas (pH 2–8) selama proses Fluid-Bed Top-Spray Granulation.',
  },

  // 3. Karotenoid Cair / Stabilitas Panas Sedang (Butuh Verifikasi Emulsi & Oksidasi)
  CAROTENOID_LIQUID_OR_MEDIUM_HEAT: {
    status: 'Unknown',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Batasi suhu produk ≤ 50–55 °C pada Fluid-Bed Top-Spray Granulation untuk mencegah pemecahan emulsi dan isomerisasi cis-trans',
    moistureAwLimit:
      'Hindari waktu fluidisasi udara panas yang terlalu panjang setelah penyemprotan selesai',
    binderAndMatrix:
      'Wajib dikombinasikan dengan koloid pelindung (gum arab / pati modifikasi) dan antioksidan (askorbat/tokoferol) pada cairan pengikat top-spray',
    specklingRisk:
      'Sedang: bila emulsi pecah saat dicampur pengikat asam/elektrolit tinggi, dapat terjadi migrasi warna pada permukaan granul',
    evidence:
      'Bentuk emulsi cair/stabilitas panas sedang memerlukan optimasi antioksidan dan suhu udara masuk pada Fluid-Bed Top-Spray Granulation agar tidak mengalami autooksidasi.',
  },

  // 4. Kurkuminoid Bubuk WSP & Cair Larut Air (Tahan Panas, Peka Basa & Cahaya)
  CURCUMINOID_STABLE: {
    status: 'Compatible',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Suhu produk ≤ 65–75 °C pada Fluid-Bed Top-Spray Granulation (kurkumin memiliki stabilitas termal yang baik)',
    moistureAwLimit:
      'Stabil terhadap kelembapan penyemprotan top-spray selama pH mikro lingkungan dijaga < 7,0',
    binderAndMatrix:
      'Gunakan penyangga asam organik (asam sitrat 0,5–1,0%) pada larutan pengikat; HINDARI kontak basah langsung dengan eksipien basa (natrium bikarbonat/karbonat) karena mengubah warna kuning menjadi merah-cokelat',
    specklingRisk:
      'Rendah bila disemprotkan bersama larutan pengikat top-spray; granul akhir wajib dikemas dalam aluminium foil/kemasan opak karena sangat peka cahaya',
    evidence:
      'Kurkuminoid tahan terhadap suhu pengeringan Fluid-Bed Top-Spray Granulation, namun harus dijaga pada kondisi asam-netral (di bawah pH 7,0).',
  },

  // 5. Flavonoid — Carthamus / Safflower Yellow (Larut Air & Tahan Panas)
  FLAVONOID_SAFFLOWER: {
    status: 'Compatible',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Suhu produk ≤ 65–70 °C pada pH asam hingga netral (pH 2,5–7,0)',
    moistureAwLimit:
      'Larut sempurna dalam larutan pengikat top-spray; jaga a_w granul akhir < 0,35 untuk mencegah penggumpalan (caking)',
    binderAndMatrix:
      'Sangat kompatibel dengan pengikat maltodekstrin, laktosa, dekstrosa, atau PVP pada Fluid-Bed Top-Spray Granulation',
    specklingRisk:
      'Sangat Rendah: kelarutan molekuler dalam air memastikan atomisasi top-spray menghasilkan distribusi warna kuning cerah yang merata tanpa bintik',
    evidence:
      'Pigmen kartaflavin/safflomin A dari safflower memiliki ketahanan panas dan cahaya yang baik pada sistem Fluid-Bed Top-Spray Granulation ber-pH asam hingga netral.',
  },

  // 6. Antrakuinon — Karmin & Asam Karminat (Stabilitas Granulasi Terbaik)
  CARMINE_HIGH_STABILITY: {
    status: 'Compatible',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Suhu produk hingga 75–85 °C (sangat tahan panas dan aliran udara fluidisasi)',
    moistureAwLimit:
      'Sangat stabil terhadap fase penyemprotan top-spray maupun pengeringan fluid-bed',
    binderAndMatrix:
      'Stabil pada pH 3,5–9,0 (untuk pH < 3,5 gunakan varian asam karminat tahan asam seperti NC-045 agar tidak mengendap di dalam larutan pengikat top-spray)',
    specklingRisk:
      'Sangat Rendah bila dilarutkan sempurna dalam larutan pengikat sebelum disemprotkan melalui nozzle top-spray',
    evidence:
      'Struktur antrakuinon karmin memiliki stabilitas termal, cahaya, dan oksidasi tertinggi untuk proses Fluid-Bed Top-Spray Granulation (Bersumber hewani/cochineal).',
  },

  // 7. Betalain — Bit Merah Konvensional (Peka Panas & Hidrolisis Air pada Fluid-Bed Top-Spray Granulation)
  BETALAIN_HEAT_SENSITIVE: {
    status: 'Incompatible',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Degradasi cepat di atas 50 °C ketika terpapar kabut air pengikat (top-spray) dan udara panas',
    moistureAwLimit:
      'Sangat peka hidrolisis dan kelembapan: kontak dengan air pengikat top-spray + udara fluidisasi panas memicu dekarboksilasi dan pencokelatan (browning)',
    binderAndMatrix:
      'Tidak tahan bila disemprotkan dalam siklus Fluid-Bed Top-Spray Granulation standar; bila tetap digunakan pada sediaan granul, tambahkan secara pencampuran kering (post-granulation dry blending) setelah granul dasar selesai dikeringkan (kadar air < 2%)',
    specklingRisk:
      'Tinggi: pada penyemprotan top-spray terjadi pemudaran rona merah menjadi kuning-kecokelatan',
    evidence:
      'Betanin mengalami pemutusan hidrolitik dan dekarboksilasi termal ireversibel selama kombinasi pembasahan top-spray dan pengeringan udara panas pada Fluid-Bed Top-Spray Granulation.',
  },

  // 8. Betalain Terformulasi Stabilitas Menengah (Shade Fiesta)
  BETALAIN_MODERATE: {
    status: 'Unknown',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Wajib dijaga ≤ 45–50 °C pada Fluid-Bed Top-Spray Granulation dengan laju semprot rendah dan pendinginan evaporatif cepat',
    moistureAwLimit:
      'Minimalkan durasi pembasahan top-spray; target a_w granul akhir < 0,25',
    binderAndMatrix:
      'Gunakan rasio cairan pengikat minimal pada pH optimum 4,0–6,0 dengan pelindung antioksidan asam askorbat',
    specklingRisk:
      'Sedang: memerlukan uji skala laboratorium untuk memastikan tidak terjadi pergeseran rona merah ke kecokelatan',
    evidence:
      'Meskipun memiliki ketahanan lebih baik dari bit standar, pigmen betalain tetap memerlukan kontrol suhu unggun rendah (< 50 °C) pada Fluid-Bed Top-Spray Granulation.',
  },

  // 9. Klorofilin Tembaga Larut Air / WSP (Tahan Panas & Cahaya Tinggi)
  CHLOROPHYLLIN_COPPER_WS: {
    status: 'Compatible',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Suhu produk ≤ 70–80 °C (kompleks tembaga-porfirin sangat tahan suhu fluid-bed)',
    moistureAwLimit:
      'Stabil selama penyemprotan top-spray dan pengeringan; jaga a_w granul akhir < 0,35',
    binderAndMatrix:
      'Gunakan pada larutan pengikat pH netral hingga sedikit basa (pH 6,0–9,0). Pada matriks asam, tambahkan penyangga (natrium sitrat) atau hidrokoloid pelindung agar asam lokal tidak mengendapkan asam klorofilin',
    specklingRisk:
      'Rendah bila disemprotkan melalui nozzle top-spray menggunakan cairan pengikat ber-pH netral',
    evidence:
      'Natrium tembaga klorofilin memiliki ketahanan panas, cahaya, dan oksidasi yang sangat baik pada proses Fluid-Bed Top-Spray Granulation.',
  },

  // 10. Klorofil Larut Minyak (Inkompatibel dengan Binder Berair Top-Spray)
  CHLOROPHYLL_OIL_SOLUBLE: {
    status: 'Incompatible',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Tahan panas, namun fase minyak bebas menghambat pembentukan jembatan pengikat berair pada Fluid-Bed Top-Spray Granulation',
    moistureAwLimit:
      'Bersifat hidrofobik (larut minyak); memisah dari cairan pengikat berair pada tangki top-spray',
    binderAndMatrix:
      'Harus dikonversi terlebih dahulu menjadi emulsi terenkapsulasi atau gunakan varian Klorofilin Tembaga larut air (WSP)',
    specklingRisk:
      'Sangat Tinggi: membentuk bercak minyak hijau tua dan menyumbat atomisasi seragam pada nozzle top-spray',
    evidence:
      'Pigmen larut minyak murni tidak dapat terdistribusi homogen dalam sistem cairan pengikat berair pada Fluid-Bed Top-Spray Granulation.',
  },

  // 11. Fikosianin — Spirulina Standar (Denaturasi Protein pada Panas Fluid-Bed)
  PHYCOCYANIN_HEAT_SENSITIVE: {
    status: 'Incompatible',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Terdenaturasi ireversibel pada suhu produk > 45–50 °C selama pengeringan fluid-bed',
    moistureAwLimit:
      'Kombinasi kelembapan semprotan pengikat dan udara pengering panas memicu denaturasi gugus kromofor biliprotein dan pemudaran warna biru',
    binderAndMatrix:
      'Tidak tahan siklus Fluid-Bed Top-Spray Granulation panas standar; tambahkan sebagai komponen kering pasca-granulasi pada matriks ber-pH 4,5–7,0',
    specklingRisk:
      'Sedang–Tinggi: kehilangan intensitas warna biru apabila disemprotkan pada suhu fluid-bed standar',
    evidence:
      'Fikosianin adalah kompleks pigmen-protein yang mengalami denaturasi termal di atas 45 °C serta presipitasi pada lingkungan mikro asam selama Fluid-Bed Top-Spray Granulation.',
  },

  // 12. Fikosianin Terstabilkan (Exberry Shade Blue-HP / Shade Lime Green)
  PHYCOCYANIN_STABILIZED: {
    status: 'Unknown',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Wajib dijaga di bawah 45–50 °C pada Fluid-Bed Top-Spray Granulation (gunakan aliran udara pengering berkelembapan rendah / dehumidified inlet air)',
    moistureAwLimit:
      'Waktu pembasahan top-spray harus singkat untuk mencegah denaturasi protein',
    binderAndMatrix:
      'Telah diformulasikan untuk toleransi pH asam (pH 2,5–4,0), namun tetap memerlukan verifikasi R&D terhadap beban panas pengeringan fluid-bed',
    specklingRisk:
      'Rendah bila disemprotkan melalui top-spray pada suhu unggun rendah (< 45 °C)',
    evidence:
      'Varian spirulina terstabilkan tahan terhadap pH asam tetapi tetap sensitif terhadap suhu udara pengering > 60 °C pada Fluid-Bed Top-Spray Granulation.',
  },

  // 13. Iridoid / Genipin — Gardenia Blue & Jagua Blue (Biru Tahan Fluid-Bed Top-Spray Granulation)
  IRIDOID_GENIPIN_BLUE: {
    status: 'Compatible',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Suhu produk hingga 75–85 °C (sangat stabil secara termal pada Fluid-Bed Top-Spray Granulation)',
    moistureAwLimit:
      'Stabil pada fase penyemprotan top-spray dan pengeringan fluidisasi; target a_w granul < 0,35',
    binderAndMatrix:
      'Stabil pada rentang pH luas (pH 3,0–9,0); sangat cocok menggantikan spirulina untuk granul minuman asam dan serbuk instan',
    specklingRisk:
      'Sangat Rendah bila dilarutkan dalam larutan pengikat sebelum disemprotkan melalui nozzle top-spray',
    evidence:
      'Polimer pigmen biru hasil reaksi genipin dengan asam amino memiliki ketahanan panas, cahaya, dan pH yang jauh lebih tinggi dibanding fikosianin pada proses Fluid-Bed Top-Spray Granulation.',
  },

  // 14. Antosianin Terasilasi Tahan Panas Tinggi (Exberry Vivid/Rubescent/Veggie Red, Purple Plum)
  ANTHOCYANIN_ACYLATED_HIGH_HEAT: {
    status: 'Compatible',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Suhu produk ≤ 60–65 °C pada Fluid-Bed Top-Spray Granulation dengan waktu pengeringan terukur',
    moistureAwLimit:
      'Jaga pH cairan pengikat top-spray di bawah 3,5–3,8 selama penyemprotan untuk mempertahankan bentuk kation flavilium merah/ungu yang stabil',
    binderAndMatrix:
      'Tambahkan asam sitrat/malat dalam larutan pengikat top-spray; HINDARI asam askorbat dosis tinggi dan hindari kontak basah langsung dengan natrium bikarbonat',
    specklingRisk:
      'Rendah pada matriks asam homogen; berisiko bercak biru/keunguan bila terpapar partikel alkali atau ion logam (Fe/Al/Sn)',
    evidence:
      'Antosianin sayur terasilasi memiliki penumpukan intramolekuler (intramolecular copigmentation) yang melindungi kromofor dari pembukaan cincin hidrolitik dan panas selama Fluid-Bed Top-Spray Granulation.',
  },

  // 15. Antosianin Stabilitas Panas Sedang (Black Carrot, Purple Sweet Potato, Radish, ColorFruit/FruitMax)
  ANTHOCYANIN_MEDIUM_HEAT: {
    status: 'Unknown',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Batasi suhu produk ≤ 50–55 °C pada Fluid-Bed Top-Spray Granulation untuk mencegah pembentukan kalkon tak berwarna',
    moistureAwLimit:
      'Peka terhadap kelembapan tinggi berkepanjangan; target a_w granul akhir < 0,30',
    binderAndMatrix:
      'Wajib menggunakan larutan pengikat top-spray bersifat asam (pH 2,5–3,5); pisahkan dari komponen bikarbonat, garam kalsium/besi, dan asam askorbat',
    specklingRisk:
      'Sedang: rentan mengalami bercak warna keunguan/abu-biru (mottling) apabila terjadi fluktuasi pH mikro di permukaan granul',
    evidence:
      'Memerlukan optimasi pH larutan pengikat dan suhu udara pengering pada Fluid-Bed Top-Spray Granulation oleh R&D agar rona merah/ungu tidak bergeser.',
  },

  // 16. Antosianin Buah Peka Panas (Acai 300 WSP)
  ANTHOCYANIN_LOW_HEAT: {
    status: 'Incompatible',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Mengalami degradasi cepat dan pencokelatan pada suhu pengeringan fluid-bed > 45–50 °C',
    moistureAwLimit:
      'Paparan semprotan air pengikat dan udara fluidisasi panas mempercepat hidrolisis cincin flavilium antosianin non-terasilasi',
    binderAndMatrix:
      'Tidak direkomendasikan untuk disemprotkan pada Fluid-Bed Top-Spray Granulation; gunakan hanya untuk pencampuran kering akhir (post-granulation dry-mix) pada eksipien ber-a_w rendah (< 0,25)',
    specklingRisk:
      'Tinggi bila terpapar kelembapan lokal atau pH > 4,0',
    evidence:
      'Antosianin buah non-terasilasi memiliki stabilitas panas rendah dan mudah mengalami pembukaan cincin menjadi kalkon tak berwarna selama pengeringan Fluid-Bed Top-Spray Granulation.',
  },

  // 17. Karbon Nabati (Sangat Stabil Kimia & Termal, Tantangan Dispersi Fisik)
  CARBON_BLACK_INERT: {
    status: 'Compatible',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Sangat stabil hingga > 100 °C pada Fluid-Bed Top-Spray Granulation (inert secara termal dan kimia)',
    moistureAwLimit:
      'Tidak terpengaruh kelembapan semprotan top-spray, pH (pH 2–10), maupun oksidasi',
    binderAndMatrix:
      'Karena karbon tidak larut molekuler (dispersi partikel sub-mikron), pra-dispersikan bersama hidrokoloid/pengikat (HPMC/PVP/maltodekstrin) dengan pengadukan kontinu sebelum disemprotkan melalui nozzle top-spray',
    specklingRisk:
      'Rendah bila disemprotkan sebagai suspensi pengikat homogen lewat top-spray; hindari pencampuran kering tanpa pra-dispersi karena rentan menimbulkan bintik hitam',
    evidence:
      'Karbon nabati bersifat inert sempurna terhadap panas, pH, dan cahaya selama proses Fluid-Bed Top-Spray Granulation.',
  },

  // 18. Melanin Tinta Cumi (Butuh Evaluasi R&D Khusus)
  MELANIN_SQUID_INK: {
    status: 'Unknown',
    recommendedMethod: 'Fluid-Bed Top-Spray Granulation',
    maxProductTemp:
      'Memerlukan verifikasi R&D pada suhu produk ≤ 55 °C',
    moistureAwLimit:
      'Berbentuk dispersi; aliran udara panas pada Fluid-Bed Top-Spray Granulation berpotensi menguapkan senyawa volatil aroma laut (seafood odor)',
    binderAndMatrix:
      'Perlu uji kompatibilitas dengan matriks bumbu gurih (savory granules) serta perhatian terhadap deklarasi alergen moluska/seafood',
    specklingRisk:
      'Sedang: memerlukan homogenisasi berkecepatan tinggi dalam suspensi pengikat sebelum penyemprotan top-spray',
    evidence:
      'Memerlukan verifikasi R&D khusus untuk aplikasi Fluid-Bed Top-Spray Granulation pada matriks bumbu gurih.',
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

  // Betalain — Bit Merah Konvensional (Incompatible untuk Fluid-Bed Top-Spray Granulation)
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
 * Mengembalikan objek status dan profil teknis Fluid-Bed Top-Spray Granulation untuk suatu bahan.
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
 * Panduan Teknis Seluruh Proses Produksi & Pengolahan Pangan untuk Color Learning Booklet
 * (Mencakup 8 proses pengolahan: Tanpa pemanasan, Pasteurisasi, UHT, Sterilisasi / retort,
 * Baking / pemanggangan, Ekstrusi, Pembekuan, serta Granulasi — Fluid-Bed Top-Spray Granulation).
 */
export const BOOKLET_GRANULATION_GUIDES = {
  'Dasar Pewarna Alami': {
    summary:
      'Setiap tahapan proses produksi memberikan beban termal, mekanis, kelembapan, dan oksidasi yang berbeda terhadap struktur kromofor pewarna alami. Memilih kelompok pigmen serta titik penambahan (dosing point) yang tepat pada alur proses produksi sangat menentukan retensi warna produk akhir.',
    methodsComparison: [
      {
        method: 'Tanpa Pemanasan Setelah Pencampuran (Cold Process / Dry-Mix)',
        mechanism:
          'Pencampuran langsung pada suhu ruang tanpa perlakuan termal lanjutan (misalnya minuman serbuk instan, dressing dingin, atau icing/fondant).',
        suitability:
          'Kompatibel untuk seluruh kelompok pigmen alami, termasuk pigmen yang sangat peka panas seperti Fikosianin (Spirulina) dan Betalain (Bit Merah). Pastikan kelarutan/dispersi merata.',
      },
      {
        method: 'Pasteurisasi (63–85 °C, beberapa detik s.d. menit)',
        mechanism:
          'Perlakuan panas moderat untuk menonaktifkan mikroba patogen pada minuman sari buah, susu pasteurisasi, yoghurt, dan saus.',
        suitability:
          'Sebagian besar pewarna alami (Karotenoid, Kurkuminoid, Antosianin sayur, Karmin, Klorofilin, Safflower, Gardenia) tahan dengan baik. Untuk Betalain dan Spirulina, batasi waktu tahan panas atau tambahkan mendekati akhir pemanasan.',
      },
      {
        method: 'UHT — Ultra-High Temperature (135–150 °C, 2–8 detik)',
        mechanism:
          'Pemanasan suhu sangat tinggi dalam waktu sangat singkat untuk produk susu UHT, minuman teh/jus aseptik, dan santan kemasan.',
        suitability:
          'Gunakan pigmen tahan panas tinggi (Karmin, Karotenoid terformulasi, Kurkuminoid, Klorofilin Tembaga, Gardenia Blue, Karbon, atau Antosianin terasilasi pada matriks asam). Betalain membutuhkan overdosing terukur; Spirulina standar tidak disarankan.',
      },
      {
        method: 'Sterilisasi / Retort (115–125 °C, 15–45 menit)',
        mechanism:
          'Pemanasan bertekanan dalam wadah tertutup (kaleng, botol kaca, retort pouch) dengan beban termal kumulatif sangat berat.',
        suitability:
          'Hanya pigmen dengan ikatan kimia sangat kokoh yang bertahan baik: Karmin, Karbon Nabati, Klorofilin Tembaga, Gardenia Blue, Kurkuminoid, dan Karotenoid terproteksi antioksidan.',
      },
      {
        method: 'Baking / Pemanggangan (Oven 160–220 °C, Inti Adonan ~95–100 °C)',
        mechanism:
          'Pemanasan kering disertai penguapan air dan reaksi pencokelatan Maillard pada biskuit, kue, roti, dan wafer.',
        suitability:
          'Karotenoid, Kurkuminoid, Karmin, Klorofilin Tembaga, dan Karbon memberikan hasil paling stabil. Perhatikan pengaruh pengembang alkali (baking soda) yang dapat menggeser warna Antosianin (menjadi biru/abu) dan Kurkumin (menjadi jingga-cokelat).',
      },
      {
        method: 'Ekstrusi (110–180 °C, Tekanan & Gaya Geser Mekanis Tinggi)',
        mechanism:
          'Pemasakan singkat bertekanan dan geser tinggi melalui barrel ekstruder untuk sereal sarapan, snack puff, dan pakan/pelet.',
        suitability:
          'Pilih pigmen berketahanan panas dan geser tinggi: Karmin, Karbon Nabati, Kurkuminoid, Klorofilin Tembaga, dan Karotenoid terenkapsulasi.',
      },
      {
        method: 'Pembekuan (Freezing / Frozen Storage -18 s.d. -25 °C)',
        mechanism:
          'Penurunan suhu di bawah titik beku untuk es krim, sorbet, frozen dessert, dan makanan beku.',
        suitability:
          'Sangat ramah bagi seluruh pewarna alami karena suhu rendah menghambat kinetika degradasi kimia. Perhatikan fenomena cryo-concentration (pemekatan fase tak-beku) agar pigmen tidak mengendap.',
      },
      {
        method: 'Granulasi — Fluid-Bed Top-Spray Granulation',
        mechanism:
          'Larutan pengikat (binder solution) yang telah dicampur pewarna disemprotkan dari atas (top-spray) ke unggun serbuk yang terfluidisasi oleh aliran udara hangat hingga terbentuk granul berpori.',
        suitability:
          'Menghasilkan distribusi warna homogen bebas bintik (speckle-free) dengan suhu produk aktual 15–25 °C lebih rendah dari suhu udara masuk berkat pendinginan evaporatif. Sangat cocok untuk Karotenoid CWS/WSP, Kurkuminoid, Safflower, Karmin, Klorofilin Tembaga, Gardenia Blue, Antosianin terasilasi, dan Karbon.',
      },
    ],
  },
  Karotenoid: {
    summary:
      'Karotenoid tahan terhadap berbagai proses termal (Pasteurisasi, UHT, Baking, Pembekuan, hingga Fluid-Bed Top-Spray Granulation), namun ikatan rangkap terkonjugasinya harus dilindungi dari autooksidasi oleh oksigen dan paparan cahaya.',
    keyParameters:
      '• Pasteurisasi, UHT & Baking: Sangat stabil; tambahkan asam askorbat (200–300 ppm) atau tokoferol untuk mencegah oksidasi.\n• Fluid-Bed Top-Spray Granulation: Gunakan varian serbuk terenkapsulasi (CWS/WSP/beadlet, status Compatible) yang didispersikan ke dalam larutan pengikat top-spray pada suhu produk ≤ 60–70 °C (varian emulsi cair berstatus Unknown dan butuh kontrol suhu ≤ 50–55 °C).',
  },
  Kurkuminoid: {
    summary:
      'Kurkuminoid memiliki ketahanan panas yang sangat baik pada proses Pasteurisasi, UHT, Sterilisasi, Baking, Ekstrusi, Pembekuan, maupun Fluid-Bed Top-Spray Granulation, selama pH matriks dijaga asam hingga netral (< 7,0) dan terlindung dari cahaya.',
    keyParameters:
      '• Proses Termal & Baking: Hindari adonan dengan pH basa kuat (baking soda berlebih) karena mengubah warna kuning menjadi jingga-cokelat.\n• Fluid-Bed Top-Spray Granulation (Compatible): Semprotkan bersama larutan pengikat asam-netral (tambahkan asam sitrat 0,5–1,0%) pada suhu produk ≤ 65–75 °C dan kemas granul dalam kemasan opak/aluminium foil.',
  },
  'Flavonoid (carthamus)': {
    summary:
      'Pigmen kuning safflower (Carthamus) larut sempurna dalam air dan stabil pada proses Tanpa Pemanasan, Pasteurisasi, UHT, Baking, Pembekuan, serta Fluid-Bed Top-Spray Granulation pada pH asam hingga netral.',
    keyParameters:
      '• Pasteurisasi, UHT & Pembekuan: Menghasilkan kuning jernih dengan ketahanan cahaya lebih baik dibandingkan kurkumin.\n• Fluid-Bed Top-Spray Granulation (Compatible): Larutkan langsung dalam larutan pengikat top-spray pada suhu produk ≤ 65–70 °C (pH 2,5–7,0) untuk menghasilkan granul kuning bebas bintik.',
  },
  'Antrakuinon (karmin)': {
    summary:
      'Karmin dan asam karminat memiliki ketahanan proses paling lengkap: sangat stabil pada Tanpa Pemanasan, Pasteurisasi, UHT, Sterilisasi / Retort, Baking, Ekstrusi, Pembekuan, hingga Fluid-Bed Top-Spray Granulation.',
    keyParameters:
      '• UHT, Retort, Baking & Ekstrusi: Tidak mengalami pemudaran termal; gunakan varian Acid-Stable Carmine (seperti NC-045) apabila pH matriks < 3,5.\n• Fluid-Bed Top-Spray Granulation (Compatible): Tahan suhu produk hingga 75–85 °C dengan distribusi warna merah-pink sangat merata saat disemprotkan lewat nozzle top-spray.',
  },
  Betalain: {
    summary:
      'Betalain (bit merah) sangat ideal untuk proses Tanpa Pemanasan dan Pembekuan (es krim/frozen), serta dapat digunakan pada Pasteurisasi singkat, namun rentan mengalami degradasi hidrolitik-termal pada UHT, Retort, Baking suhu tinggi, dan Fluid-Bed Top-Spray Granulation.',
    keyParameters:
      '• Tanpa Pemanasan, Pembekuan & Pasteurisasi: Tambahkan pada tahap akhir pemanasan (suhu rendah) bersama asam askorbat untuk menjaga rona pink-merah.\n• Fluid-Bed Top-Spray Granulation (Incompatible untuk bit standar / Unknown untuk varian terstabilkan): Kombinasi semprotan air pengikat dan udara panas memicu pencokelatan; disarankan penambahan kering (post-granulation dry blending) setelah granul dasar dikeringkan.',
  },
  'Klorofil / klorofilin': {
    summary:
      'Kompleks Klorofilin Tembaga tahan terhadap proses Tanpa Pemanasan, Pasteurisasi, UHT, Baking, Pembekuan, dan Fluid-Bed Top-Spray Granulation pada matriks ber-pH netral hingga asam lemah.',
    keyParameters:
      '• Pasteurisasi, UHT & Baking: Stabil terhadap panas; pada pH < 4,0 gunakan sistem terstabilkan atau penyangga agar tidak mengendap.\n• Fluid-Bed Top-Spray Granulation: Varian larut air/WSP berstatus Compatible (suhu produk ≤ 70–80 °C, larutan pengikat pH ≥ 6,0), sedangkan varian larut minyak murni (OS) berstatus Incompatible dengan cairan pengikat berair.',
  },
  'Fikosianin (spirulina)': {
    summary:
      'Sebagai pigmen berbasis protein (biliprotein), Fikosianin paling optimal untuk proses Tanpa Pemanasan dan Pembekuan. Paparan suhu > 45–50 °C pada Pasteurisasi/UHT/Baking maupun Fluid-Bed Top-Spray Granulation memicu denaturasi protein dan pemudaran warna biru.',
    keyParameters:
      '• Tanpa Pemanasan, Pembekuan & Permen: Tambahkan larutan spirulina setelah pemanasan selesai (suhu adonan turun < 50 °C).\n• Fluid-Bed Top-Spray Granulation: Spirulina standar berstatus Incompatible terhadap udara pengering panas; varian terstabilkan (Unknown) wajib menggunakan suhu unggun rendah (< 45 °C) dengan udara pengering berkelembapan rendah.',
  },
  'Iridoid / genipin': {
    summary:
      'Pigmen biru Gardenia dan Jagua (iridoid-genipin) memiliki ketahanan termal tinggi sehingga aman digunakan pada Tanpa Pemanasan, Pasteurisasi, UHT, Sterilisasi / Retort, Baking, Ekstrusi, Pembekuan, serta Fluid-Bed Top-Spray Granulation.',
    keyParameters:
      '• Pasteurisasi, UHT, Retort & Baking: Stabil pada pH 3,0–8,0 tanpa mengalami denaturasi panas seperti spirulina.\n• Fluid-Bed Top-Spray Granulation (Compatible): Tahan suhu produk 75–85 °C saat disemprotkan bersama larutan pengikat top-spray.',
  },
  Antosianin: {
    summary:
      'Pada kondisi asam (pH < 3,8), antosianin — khususnya sumber sayuran terasilasi — tahan terhadap Tanpa Pemanasan, Pasteurisasi, UHT, Baking asam, Pembekuan, dan Fluid-Bed Top-Spray Granulation.',
    keyParameters:
      '• Pasteurisasi, UHT & Pembekuan: Pertahankan pH produk < 3,8 untuk warna merah-ungu kuat dan batasi dosis vitamin C berlebih.\n• Fluid-Bed Top-Spray Granulation: Antosianin sayur terasilasi berstatus Compatible (suhu produk ≤ 60–65 °C), varian panas sedang berstatus Unknown (≤ 50–55 °C), dan antosianin buah non-terasilasi (Acai) berstatus Incompatible. Wajib gunakan larutan pengikat asam (pH 2,5–3,5).',
  },
  'Melanin (tinta cumi)': {
    summary:
      'Dispersi melanin tinta cumi umumnya digunakan pada proses pemasakan produk gurih (perebusan pasta, saus, pemanggangan roti artisan, dan pembekuan boga bahari).',
    keyParameters:
      '• Pemasakan Kuliner & Pembekuan: Dispersikan merata ke dalam fase berair/adonan sebelum pemasakan.\n• Fluid-Bed Top-Spray Granulation (Unknown): Memerlukan verifikasi R&D khusus pada granul bumbu gurih terkait retensi aroma laut dan deklarasi alergen moluska.',
  },
  Karbon: {
    summary:
      'Karbon nabati (Vegetable Carbon) bersifat inert secara kimia dan tahan terhadap seluruh proses produksi ekstrem: Tanpa Pemanasan, Pasteurisasi, UHT, Sterilisasi / Retort, Baking, Ekstrusi, Pembekuan, hingga Fluid-Bed Top-Spray Granulation.',
    keyParameters:
      '• Baking, Ekstrusi, UHT & Retort: Tidak mengalami perubahan rona pada suhu maupun pH berapa pun.\n• Fluid-Bed Top-Spray Granulation (Compatible): Pra-dispersikan karbon ke dalam larutan pengikat hidrokoloid (HPMC/PVP/maltodekstrin) sebelum disemprotkan melalui nozzle top-spray agar warna granul rata tanpa bintik.',
  },
};

// Alias untuk nama grup pendek bila dipanggil dari komponen lain
BOOKLET_GRANULATION_GUIDES.Flavonoid =
  BOOKLET_GRANULATION_GUIDES['Flavonoid (carthamus)'];
BOOKLET_GRANULATION_GUIDES.Klorofil =
  BOOKLET_GRANULATION_GUIDES['Klorofil / klorofilin'];
BOOKLET_GRANULATION_GUIDES.Fikosianin =
  BOOKLET_GRANULATION_GUIDES['Fikosianin (spirulina)'];
BOOKLET_GRANULATION_GUIDES['Iridoid (genipin)'] =
  BOOKLET_GRANULATION_GUIDES['Iridoid / genipin'];

export function getBookletGranulationGuide(groupName) {
  if (!groupName) return null;
  return BOOKLET_GRANULATION_GUIDES[groupName] || null;
}
