# NACORA — Plan Final untuk Pengembangan

**Natural Color Recommendation Assistant** · Versi final · 6 November 2026

> Dokumen ini adalah spesifikasi lengkap dan final untuk dibaca oleh agen pengembang (Antigravity). Semua keputusan sudah diambil; tidak ada pertanyaan terbuka. Bila ada hal yang benar-benar menghalangi pekerjaan, ajukan satu pertanyaan singkat dan lanjutkan bagian lain.

## 0. Petunjuk untuk agen

1. Baca seluruh dokumen ini dan buka berkas data di folder `data/` sebelum menulis kode.
2. Mulai dari **Tahap 1** (Bagian 14): tulis rencana dan ringkasan pemahaman, **jangan menulis kode** sampai ringkasan itu selesai.
3. Data di `data/NACORA_Database_Final.xlsx` adalah **sumber kebenaran**. Jangan mengubah, melengkapi, atau menebak nilai data.
4. Aplikasi hanya membaca kolom yang tercantum di Bagian 4 (daftar putih). Kolom lain, bila ada, diabaikan.
5. Ikuti Bagian 16 (aturan wajib) pada setiap tahap.

## 1. Ringkasan produk

NACORA adalah situs web statis, tanpa login, untuk membantu formulator R&D menemukan **kandidat pewarna alami** berdasarkan karakteristik produk (kategori pangan, proses, pH, kemasan, penyimpanan, target warna), dan **kombinasi pewarna** yang dapat menghasilkan warna lain. Ada juga **Color Learning Booklet** untuk mempelajari kelompok pewarna.

**Prinsip produk**

- Hasilnya adalah **rekomendasi awal** untuk dipertimbangkan R&D, bukan jaminan. Cukup satu pernyataan batasan singkat (Bagian 11.6); jangan menempelkan catatan "belum diuji" pada setiap item.
- Hanya memakai bahan pewarna alami yang dimiliki perusahaan (85 bahan pada database).
- Data murni tentang material warna: **tanpa** harga, MoQ, supplier, atau dokumen supplier.
- Sederhana: satu kolom utama, latar putih, mudah dibaca, bahasa Indonesia.
- Dibuka lewat tautan khusus; tanpa akun dan tanpa login.

**Alur utama**

| Jalur | Langkah |
|---|---|
| Color Recommendation | Input karakteristik produk → penyaringan → hasil rekomendasi → detail bahan atau Explore Color Mix |
| Color Learning Booklet | Pilih kelompok pewarna → baca materi → lihat bahan perusahaan di kelompok itu |

Kedua jalur saling terhubung: dari kartu hasil ke detail bahan lalu ke halaman kelompoknya di Booklet, dan sebaliknya.

## 2. Keputusan final

| No | Keputusan |
|---|---|
| 1 | Situs statis (tanpa backend), logika berjalan di browser |
| 2 | Tanpa login; akses hanya lewat tautan; meta noindex dan robots.txt |
| 3 | Data dari Excel → JSON melalui skrip; harga, MoQ, supplier tidak dibaca |
| 4 | Tujuh Target Color: Yellow, Orange, Red, Green, Blue, Purple, Black |
| 5 | Kategori pangan memakai 16 kategori level 1 (sheet Kategori Pangan); turunan dapat ditambahkan kelak di sheet yang sama tanpa mengubah kode |
| 6 | Nilai kosong pada data **diabaikan**: tidak dihitung sebagai kriteria dan tidak ditampilkan |
| 7 | Tidak ada label "belum diuji", "simulasi", atau "teori" pada tiap item; hanya satu pernyataan batasan global |
| 8 | Explore Color Mix memakai sheet Kombinasi (1.450 baris) |
| 9 | Tampilan simpel dengan palet dari identitas perusahaan (Bagian 11) |
| 10 | Tanpa analitik dan tanpa layanan pihak ketiga yang menerima data pengguna |

## 3. Paket berkas

```
NACORA/
  data/
    NACORA_Database_Final.xlsx     sumber data
    foto/                          93 foto (NC-001_1.jpg dst.)
  referensi/
    NACORA_Plan_Final.md           dokumen ini
    stitch/                        (opsional) desain layar bila ada
```

Struktur kode yang dihasilkan agen (usulan): `src/`, `public/data/` (JSON hasil konversi), `public/foto/`, `scripts/`, `tests/`, `README.md`.

## 4. Data

Berkas `NACORA_Database_Final.xlsx` berisi tujuh sheet. Sheet **Kamus Kolom** menjelaskan setiap kolom.

| Sheet | Isi | Dipakai untuk |
|---|---|---|
| Bahan | 85 bahan, 27 kolom | Penyaringan, kartu hasil, detail bahan, Booklet |
| Kombinasi | 1.450 kombinasi dua bahan | Explore Color Mix |
| Booklet | 12 halaman materi (7 bagian) | Color Learning Booklet |
| Kategori Pangan | 16 kategori level 1 | Dropdown kategori |
| Pilihan Form | Opsi proses, kemasan, penyimpanan, Target Color | Form dan pemetaan |
| Rujukan | Kode rujukan R0–R21 | Detail bahan, Booklet |
| Kamus Kolom | Penjelasan kolom | Referensi agen |

### 4.1 Sheet Bahan (daftar putih kolom)

| Kolom | Tipe | Catatan |
|---|---|---|
| ID | teks | Kunci unik, mis. NC-006 |
| Nama Bahan | teks | |
| Kelompok Pigmen | teks | Menjadi kunci halaman Booklet |
| Sumber Bahan | teks | Tumbuhan, Hewan, Alga / mikroba, Mineral / karbon, Nature-identical / sintetik |
| Bentuk | teks | Bubuk, Cair, Beadlet (boleh kosong) |
| Warna | daftar | Satu atau dua Target Color dipisah `;` |
| HEX | teks | `#RRGGBB`, boleh kosong; dipakai untuk swatch |
| Kelarutan | teks | Larut air, Dispersi dalam air, Larut minyak |
| Kategori Pangan | daftar | Kode level 1 dipisah `;` |
| pH Min, pH Max | angka | Boleh kosong |
| Stabilitas Panas, Stabilitas Cahaya | teks | Tinggi, Sedang, Rendah (boleh kosong) |
| Proses yang Cocok | daftar | Dipisah `;` |
| Kemasan, Penyimpanan | teks | Saran singkat |
| Dosis Acuan | teks | Hanya sampel Exberry |
| Kelebihan, Keterbatasan & Tips | teks | Tampil di kartu hasil dan detail |
| Bahan Hewani | teks | `Ya` atau kosong |
| Warna Dasar, Perubahan Warna per Konsentrasi, Sifat Fisik, Sifat pH, Catatan Evaluasi | teks | Hasil evaluasi laboratorium |
| Foto | daftar | Nama berkas dipisah `;`, berada di folder foto |
| Rujukan | daftar | Kode dipisah `;` |

### 4.2 Aturan data

- Sel kosong = informasi tidak ada. **Jangan menampilkan placeholder** seperti "Data belum tersedia"; sembunyikan baris atau bagian itu.
- Kriteria penyaringan yang datanya kosong dilewati (tidak dihitung sesuai maupun tidak sesuai).
- pH dibaca sebagai angka; terima koma atau titik pada input pengguna.
- Nama kategori di Bahan memakai kode (mis. `14.0`); nama lengkap diambil dari sheet Kategori Pangan.
- Kode kategori berformat `NN.0` untuk level 1. Bila turunan ditambahkan kelak (mis. `14.1`), kategori induknya adalah bagian sebelum titik ditambah `.0`; bahan yang memuat induk dianggap cocok untuk semua turunannya.

### 4.3 Skrip konversi (`npm run data`)

Skrip membaca Excel dan menulis ke `public/data/`:

- `materials.json` — array bahan (kunci camelCase; angka sebagai number; daftar sebagai array).
- `combinations.json` — array kombinasi.
- `booklet.json`, `categories.json`, `options.json`, `references.json`.
- Menyalin `data/foto/` ke `public/foto/`.
- **Daftar putih:** hanya kolom di Bagian 4.1 dan sheet lain yang tertulis di dokumen ini yang boleh masuk JSON.
- **Validasi (keluar dengan error bila gagal):** ID unik dan berformat NC-###; Warna hanya berisi tujuh nilai sah; pH 0–14 dan Min ≤ Max; HEX valid; berkas foto yang disebut ada; ID A/B pada Kombinasi ada di Bahan.
- Cetak laporan ringkas: jumlah bahan, kombinasi, dan peringatan.

### 4.4 Contoh JSON

```json
{
  "id": "NC-006",
  "name": "429340 Shade Mandarin (Exberry)",
  "group": "Karotenoid",
  "source": "Tumbuhan",
  "colors": ["Orange"],
  "hex": "#F1A043",
  "solubility": "Larut air",
  "categories": ["01.0", "07.0", "14.0"],
  "ph": { "min": 2, "max": 8 },
  "heat": "Tinggi",
  "light": "Tinggi",
  "processes": ["Tanpa pemanasan", "Pasteurisasi", "UHT", "Baking / pemanggangan", "Pembekuan"],
  "packaging": "Kemasan bening dapat dipakai; kemasan opak menambah perlindungan",
  "storage": "Simpan sejuk dan terlindung cahaya",
  "dosage": "Soft drink 0,15% w/v (pH 2,9-3,8); ...",
  "pros": "Karotenoid dari wortel dan apel; ...",
  "cons": "Tampilan keruh; perlu antioksidan ...",
  "animal": false,
  "evaluation": { "baseColor": "...", "concentration": "...", "physical": "...", "phNote": null, "notes": "..." },
  "photos": ["NC-006_1.jpg"],
  "refs": ["R21", "R1", "R2", "R3"]
}
```

```json
{
  "id": "KM-0001", "resultColor": "Orange", "score": 99.7,
  "a": { "id": "NC-007", "hex": "#E7C314" }, "b": { "id": "NC-045", "hex": "#AC3978" },
  "ratio": "60:40", "ratioRange": "45:55 s.d. 80:20", "resultHex": "#CD7729",
  "ph": { "min": 2, "max": 7 },
  "processes": ["Tanpa pemanasan", "Pasteurisasi", "UHT", "Baking / pemanggangan", "Pembekuan"],
  "notes": "Warna bergantung pH produk; Mengandung bahan hewani"
}
```

## 5. Halaman dan navigasi

Gunakan **routing berbasis hash** agar berjalan di hosting statis tanpa konfigurasi server.

| Rute | Halaman | Isi |
|---|---|---|
| `#/` | Beranda | Dua kartu: Color Recommendation dan Color Learning Booklet; pernyataan batasan singkat |
| `#/rekomendasi` | Form | Enam input (Bagian 6) |
| `#/hasil?...` | Hasil | Rekomendasi (Bagian 7–8); seluruh input ada di query agar bisa dibagikan |
| `#/bahan/NC-006` | Detail Bahan | Bagian 8.2 |
| `#/mix` | Explore Color Mix | Bagian 9 |
| `#/booklet` | Indeks Booklet | Kartu kelompok |
| `#/booklet/Karotenoid` | Halaman Kelompok | Bagian 10 |
| `#/tentang` | Tentang | Cara kerja, arti status, pernyataan batasan, tanggal data |

Header tetap berisi: logo/judul NACORA, tautan Color Recommendation, Color Learning Booklet, Explore Color Mix, Tentang. Footer berisi pernyataan batasan (Bagian 11.6).

Contoh URL hasil: `#/hasil?kat=14.0&proses=Pasteurisasi&ph=3.5&kemasan=Botol%20PET%20bening&simpan=Suhu%20ruang&warna=Orange`

## 6. Form Color Recommendation

| Input | Kontrol | Opsi | Wajib |
|---|---|---|---|
| Kategori Pangan | Dropdown berisi 16 kategori dengan kotak cari | Sheet Kategori Pangan (kode + nama) | Ya |
| Proses Pengolahan | Dropdown | Tanpa pemanasan setelah pencampuran · Pasteurisasi · UHT · Sterilisasi / retort · Baking / pemanggangan · Ekstrusi · Pembekuan | Ya |
| pH Produk | Kolom angka | 0–14; koma atau titik; maksimal dua desimal | Ya |
| Jenis Kemasan | Dropdown | Sheet Pilihan Form: Botol kaca bening, Botol PET bening, Botol PET berwarna / opak, Kaleng, Aluminium foil / metalized, Pouch transparan, Karton aseptik, Cup plastik bening | Ya |
| Kondisi Penyimpanan | Dropdown | Suhu ruang · Chiller · Beku | Ya |
| Target Color | Tujuh swatch pilihan tunggal | Yellow, Orange, Red, Green, Blue, Purple, Black | Ya |

- Pilihan proses "Tanpa pemanasan setelah pencampuran" dipetakan ke nilai data `Tanpa pemanasan`.
- Tombol **Find Recommendation** aktif bila semua input valid; tombol **Reset** mengosongkan form.
- Teks bantu kategori: "Pilih kategori sesuai klasifikasi BPOM, bukan nama produk sehari-hari."
- Galat pH: "Masukkan angka antara 0 dan 14."
- Jenis Kemasan dipetakan ke paparan cahaya (Sheet Pilihan Form): Tinggi, Sedang, Rendah, atau Tidak ada.

## 7. Logika rekomendasi

Untuk setiap bahan, hitung kriteria berikut. **Kriteria yang datanya kosong dilewati.**

| Kriteria | Aturan | Hasil |
|---|---|---|
| Warna | Target Color pengguna ada di kolom Warna bahan | Bila tidak: bahan **tidak ditampilkan sama sekali** |
| Kategori | Kategori pilihan ada di kolom Kategori Pangan | Ada: Sesuai · Tidak ada: Perlu perhatian |
| pH | pH produk di antara pH Min dan pH Max (jika hanya satu batas terisi, bandingkan dengan batas itu) | Di dalam: Sesuai · di luar sejauh ≤ 1,0: Perlu perhatian · di luar > 1,0: **Kurang sesuai** |
| Proses | Proses ada di kolom Proses yang Cocok | Ada: Sesuai · Tidak ada: Perlu perhatian · Tidak ada dan Stabilitas Panas = Rendah dan proses butuh panas (Pasteurisasi, UHT, Baking, Ekstrusi, Sterilisasi): **Kurang sesuai** |
| Cahaya × kemasan | Stabilitas Cahaya bahan dibandingkan paparan cahaya kemasan | Rendah dengan paparan Tinggi atau Sedang → Perlu perhatian; Sedang dengan paparan Tinggi → Perlu perhatian; selain itu Sesuai |
| Penyimpanan | Tampilkan kolom Penyimpanan sebagai informasi | Tidak dihitung |

**Pengelompokan hasil**

1. **Sangat sesuai** — tidak ada Perlu perhatian dan tidak ada Kurang sesuai.
2. **Sesuai dengan catatan** — minimal satu Perlu perhatian, tidak ada Kurang sesuai.
3. **Tidak ditampilkan di daftar utama** — ada kriteria Kurang sesuai. Sediakan tautan "Lihat bahan yang tersaring dan alasannya" (daftar tertutup secara bawaan).

**Urutan di dalam grup:** jumlah kriteria Sesuai (terbanyak dulu) → jumlah Perlu perhatian (paling sedikit dulu) → nama A–Z.

**Teks alasan** (satu baris per kriteria), contoh: "pH 3,5 berada di rentang 2,0–8,0" · "pH 3,5 di luar rentang 4,5–7,0" · "Proses Pasteurisasi termasuk proses yang cocok" · "Peka cahaya dan kemasan bening: pertimbangkan kemasan opak".

**Hasil acuan untuk pengujian** (dari data final):

| Input | Sangat sesuai | Sesuai dengan catatan | Tersaring |
|---|---|---|---|
| Kategori 14.0, Pasteurisasi, pH 3,5, Botol PET bening, Suhu ruang, Orange | 1 (NC-006 teratas) | 15 | 2 |
| Kategori 01.0, UHT, pH 6,7, Karton aseptik, Chiller, Red | 8 (teratas NC-041, NC-042, NC-043) | 3 | 15 (antara lain NC-069, NC-070 karena pH) |
| Kategori 07.0, Baking / pemanggangan, pH 6,0, Aluminium foil / metalized, Suhu ruang, Yellow | 17 (teratas NC-007, NC-022, NC-023) | 5 | 0 |

## 8. Kartu hasil dan Detail Bahan

### 8.1 Kartu hasil

- Swatch (HEX), Nama Bahan, chip Kelompok Pigmen, chip Warna.
- Baris kriteria (Kategori, pH, Proses, Cahaya/kemasan) dengan ikon ✓ (Sesuai) atau ▲ (Perlu perhatian) dan teks alasan.
- **Keterbatasan & Tips** (dipotong dua baris, bisa dibuka) dan **Dosis Acuan** bila ada.
- Penanda "Bahan hewani" bila kolom Bahan Hewani = Ya.
- Tombol **Lihat detail** dan **Explore Color Mix** (tampil bila bahan ada di sheet Kombinasi).

### 8.2 Detail Bahan

- Header: swatch, nama, kelompok (tautan ke Booklet), chip Warna dan Sumber.
- Tabel data teknis (hanya baris yang terisi): Bentuk, Kelarutan, rentang pH, Stabilitas Panas, Stabilitas Cahaya, Proses yang Cocok, Kategori Pangan (nama kategori), Kemasan, Penyimpanan, Dosis Acuan.
- Kelebihan dan Keterbatasan & Tips.
- Evaluasi laboratorium (hanya bagian yang terisi): Warna Dasar, Perubahan Warna per Konsentrasi, Sifat Fisik, Sifat pH, Catatan Evaluasi.
- Galeri foto (klik untuk memperbesar; teks alternatif: "Foto larutan {nama bahan}").
- Daftar rujukan (kode → judul dari sheet Rujukan).
- Hingga lima kombinasi teratas yang memuat bahan ini dan tautan ke Explore Color Mix.

## 9. Explore Color Mix

Menampilkan pasangan dua bahan yang diperkirakan menghasilkan warna lain.

- **Dari menu:** pilih Warna Hasil (tujuh chip). Penyaring opsional: pH produk dan proses.
- **Dari kartu hasil / detail bahan:** tampilkan kombinasi yang memuat bahan itu, dikelompokkan menurut Warna Hasil.
- **Penyaringan:** bila pH diisi, tampilkan kombinasi dengan pH Min ≤ pH ≤ pH Max; bila proses dipilih, kombinasi dengan proses itu pada Proses Kompatibel. Urutkan berdasarkan Skor (menurun). Tampilkan 30 pertama dengan tombol "Tampilkan lebih banyak".
- **Kartu kombinasi:** swatch A, tanda +, swatch B, tanda =, swatch hasil (HEX Hasil) dengan kodenya; nama kedua bahan (tautan ke detail); "Rasio A:B {rasio}" dengan keterangan kecil "(rasio intensitas warna; rentang {rentang})"; chip rentang pH dan proses; Catatan.
- Catatan di bawah daftar: "Warna hasil adalah perkiraan dari foto larutan; rasio menunjukkan kontribusi intensitas warna, bukan massa."
- Keadaan kosong: "Tidak ada kombinasi yang cocok dengan penyaring ini. Coba ubah pH atau proses."

## 10. Color Learning Booklet

- **Indeks:** kartu untuk setiap baris sheet Booklet (12 kartu, "Dasar Pewarna Alami" paling awal) dengan swatch representatif (HEX bahan pertama pada kelompok itu; kartu Dasar memakai warna utama) dan jumlah bahan perusahaan.
- **Halaman kelompok:** menampilkan tujuh bagian dari kolom sheet Booklet: Pengenalan, Karakteristik Warna, Kelarutan, Faktor Stabilitas, Aplikasi Pangan, Kelebihan dan Keterbatasan. Bagian yang kosong disembunyikan. Di akhir: **Contoh bahan perusahaan** (kartu bahan dengan Kelompok Pigmen yang sama, tautan ke detail) dan rujukan.
- Navigasi sisi (desktop) atau dropdown (HP) untuk berpindah bagian.

## 11. Desain UI

### 11.1 Prinsip

Simpel dan bersih: latar putih, satu kolom utama (lebar maksimal sekitar 960 px), banyak ruang kosong, tanpa ilustrasi dekoratif, mode terang saja. Informasi teknis harus mudah dipindai.

### 11.2 Palet dan tipografi

| Elemen | Nilai |
|---|---|
| Warna utama (tombol, judul) | Hijau `#008040` |
| Latar | Putih `#FFFFFF`; kartu putih dengan garis abu `#E5E7EB` |
| Teks | Abu tua `#515055` untuk isi; hitam kebiruan `#1F2933` untuk judul |
| Strip aksen header (tipis) | Biru `#08ACDF`, Kuning `#F1C90F`, Merah `#D32548`, Hijau muda `#8DC442`, Abu tua `#515055` |
| Swatch Target Color | Yellow `#F1C90F` · Orange `#F28C28` · Red `#D32548` · Green `#8DC442` · Blue `#08ACDF` · Purple `#7B4B94` · Black `#515055` |
| Status | Sesuai: hijau `#2E7D32` + ✓ · Perlu perhatian: kuning tua `#B7791F` + ▲ |
| Font | `"Plus Jakarta Sans", Inter, system-ui, sans-serif`, dipasang lewat paket lokal (tanpa mengambil dari server luar); isi 16 px |
| Bentuk | Sudut kartu 12 px; jarak kelipatan 8 px; target sentuh minimal 44 px |

Palet diambil dari gambar identitas perusahaan. Bila logo tersedia di `referensi/`, letakkan di header; bila tidak, pakai teks "NACORA" berwarna hijau utama.

### 11.3 Komponen

Header dengan strip aksen · kartu bahan · chip (kelompok, warna) · swatch · baris kriteria dengan ikon dan teks · pelipat (accordion) · galeri foto dengan lightbox · tabel data bersih · tombol utama (hijau) dan sekunder (garis) · kotak informasi.

### 11.4 Keadaan

Memuat · hasil kosong ("Belum ada bahan yang cocok. Coba ubah pH, proses, atau kemasan.") · galat input · bahan tanpa foto (sembunyikan galeri) · Explore Color Mix kosong.

### 11.5 Responsif dan aksesibilitas

Desktop utama, nyaman di tablet dan HP (lebar minimal 360 px). Kontras teks memenuhi WCAG AA; status selalu berupa ikon **dan** teks; dapat dioperasikan dengan keyboard; teks alternatif pada foto; fokus terlihat.

### 11.6 Teks tetap

- **Pernyataan batasan** (footer dan halaman hasil): "Hasil NACORA adalah rekomendasi awal berdasarkan data evaluasi internal dan literatur, bukan jaminan. Setiap kandidat perlu dicoba dan diuji oleh R&D pada produk Anda."
- **Beranda:** "Cari kandidat pewarna alami untuk produk Anda, atau pelajari karakteristik tiap kelompok pewarna."
- **Kartu menu:** Color Recommendation — "Cari kandidat pewarna alami berdasarkan karakteristik produk dan target warna." Color Learning Booklet — "Pelajari jenis pewarna alami, karakteristik, aplikasi, dan faktor yang memengaruhi stabilitasnya."
- **Kategori status:** Sesuai · Perlu perhatian.
- **Grup hasil:** Sangat sesuai · Sesuai dengan catatan.

## 12. Non-fungsional, privasi, dan akses

- Situs statis; hasil build berada di folder `dist/` dan siap diunggah ke hosting statis.
- Halaman pertama tampil kurang dari 2 detik pada jaringan kantor; penyaringan selesai kurang dari 0,5 detik.
- Foto dikompres (sudah dikompres pada paket) dan dimuat malas (lazy).
- Tidak ada analitik, cookie, atau permintaan jaringan ke layanan luar. Font dan pustaka dipaketkan lokal.
- `index.html` memuat `<meta name="robots" content="noindex, nofollow">`; sertakan `robots.txt` berisi `Disallow: /`.
- JSON terbitan hanya berisi kolom daftar putih (Bagian 4.3).
- Halaman hasil dan detail rapi saat dicetak atau disimpan sebagai PDF (CSS cetak).

## 13. Teknologi dan struktur

Usulan (boleh diganti bila memenuhi persyaratan): **Vite + React + TypeScript**, Tailwind CSS, hash router, Vitest untuk pengujian, paket `xlsx` pada skrip data.

Perintah yang harus tersedia:

| Perintah | Fungsi |
|---|---|
| `npm install` | Memasang dependensi |
| `npm run data` | Konversi Excel → JSON + validasi + salin foto |
| `npm run dev` | Menjalankan situs lokal |
| `npm test` | Menjalankan uji otomatis |
| `npm run build` | Membangun situs statis ke `dist/` |

Sertakan `README.md` berbahasa Indonesia untuk non-programmer yang menjelaskan: cara menjalankan lokal, cara memperbarui data (ubah Excel → `npm run data` → `npm run build` → unggah `dist/`), dan cara menerbitkan.

Pisahkan logika penyaringan menjadi modul murni (tanpa tampilan) agar mudah diuji.

## 14. Tahapan kerja

| Tahap | Pekerjaan | Selesai bila |
|---|---|---|
| 1 | Baca dokumen dan data; tulis ringkasan pemahaman, rencana, dan hal yang tidak jelas | Ringkasan disetujui pengguna (tanpa kode) |
| 2 | Skrip data dan validasi | `npm run data` menghasilkan JSON; laporan validasi lulus |
| 3 | Kerangka, desain, navigasi, Beranda, Form, Tentang | Semua rute terbuka; desain sesuai Bagian 11 |
| 4 | Mesin rekomendasi + halaman Hasil + uji otomatis | Kasus uji Bagian 15 lulus |
| 5 | Detail Bahan, Explore Color Mix, Booklet | Halaman berfungsi dan saling terhubung |
| 6 | Privasi, cetak, README, build produksi | Daftar periksa Bagian 15.2 lulus; `dist/` siap diunggah |

Setelah setiap tahap, jelaskan hasilnya dengan bahasa sederhana dan cara memeriksanya.

## 15. Penerimaan

### 15.1 Kasus uji

| No | Kondisi | Hasil yang diharapkan |
|---|---|---|
| 1 | Tiga input acuan pada Bagian 7 | Jumlah bahan per grup dan bahan teratas sesuai tabel |
| 2 | Bahan tanpa data pH | Kriteria pH tidak muncul dan tidak memengaruhi grup |
| 3 | Warna pengguna tidak ada pada kolom Warna bahan | Bahan tidak tampil di mana pun pada hasil |
| 4 | pH di luar rentang bahan sejauh 1,5 | Bahan masuk daftar tersaring dengan alasan pH |
| 5 | pH diisi "3,5" dan "3.5" | Keduanya diterima sebagai 3,5 |
| 6 | pH diisi "abc" atau 15 | Pesan galat; tombol Find Recommendation nonaktif |
| 7 | Tidak ada bahan lolos | Tampil pesan hasil kosong tanpa galat |
| 8 | Bahan tanpa foto atau tanpa dosis acuan | Bagian itu tidak ditampilkan; halaman tetap rapi |
| 9 | Explore Color Mix: Orange, pH 3,5, proses Pasteurisasi | Hanya kombinasi dengan pH Min ≤ 3,5 ≤ pH Max dan proses itu; urut Skor menurun |
| 10 | Salin URL hasil dan buka di browser lain | Input dan hasil identik |
| 11 | Periksa `public/data/*.json` | Tidak ada kolom di luar daftar putih; tidak ada harga, MoQ, atau supplier |
| 12 | Periksa teks antarmuka | Tidak ada frasa "belum diuji", "simulasi", atau "data belum tersedia" |

### 15.2 Daftar periksa rilis

- Semua kasus uji lulus; `npm run data` dan `npm run build` berjalan tanpa galat.
- Meta noindex dan robots.txt ada.
- Pernyataan batasan tampil di footer dan halaman hasil.
- Diuji pada lebar HP (360 px) dan desktop.
- README selesai.

## 16. Aturan wajib untuk agen

1. Jangan menebak, mengisi, atau mengubah data. Tampilkan apa yang ada; sembunyikan yang kosong.
2. Jangan menyatakan bahan "pasti cocok" atau "terbukti stabil"; gunakan kata "kandidat" dan "rekomendasi".
3. Jangan memuat harga, MoQ, supplier, atau kolom di luar daftar putih.
4. Jangan menambah login, backend, basis data server, analitik, atau layanan pihak ketiga yang menerima data pengguna.
5. Jangan menempelkan label "belum diuji", "simulasi", atau "teori" pada item; cukup pernyataan batasan global.
6. Status selalu ikon dan teks, tidak hanya warna.
7. Seluruh teks antarmuka berbahasa Indonesia; nama fitur tetap Color Recommendation, Color Learning Booklet, Explore Color Mix, Find Recommendation.
8. Tulis uji otomatis untuk mesin penyaringan memakai data fiktif atau data acuan Bagian 7.
9. Tuliskan asumsi yang Anda buat secara singkat pada akhir setiap tahap.
