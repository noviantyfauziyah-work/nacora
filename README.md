# NACORA — Natural Color Recommendation Assistant

**NACORA** adalah situs web statis internal (tanpa login dan tanpa database server) untuk membantu tim R&D menemukan **kandidat pewarna alami** berdasarkan karakteristik produk pangan, menelusuri **kombinasi dua bahan pewarna** (*Explore Color Mix*), serta mempelajari sifat kelompok pigmen (*Color Learning Booklet*).

> **Pernyataan Batasan:** Hasil NACORA adalah rekomendasi awal berdasarkan data evaluasi internal dan literatur, bukan jaminan. Setiap kandidat perlu dicoba dan diuji oleh R&D pada produk Anda.

---

## 1. Struktur Folder Proyek

```text
NACORA/
├── data/
│   ├── NACORA_Database_Final.xlsx   # Sumber data utama (Excel)
│   └── foto/                        # 93 foto larutan bahan pewarna
├── public/
│   ├── data/                        # Berkas JSON hasil konversi (daftar putih)
│   ├── foto/                        # Salinan foto untuk disajikan di web
│   └── robots.txt                   # Pengaturan pencegah indeks mesin pencari
├── referensi/
│   └── NACORA_Plan_Final.md         # Dokumen spesifikasi pengembangan
├── scripts/
│   ├── convert-data.mjs             # Skrip konversi Excel -> JSON + validasi
│   ├── dev-server.mjs               # Server pengembangan lokal
│   ├── run-tests.mjs                # Pengujian otomatis mesin rekomendasi
│   └── build.mjs                    # Pembuat paket rilis statis ke folder dist/
├── src/                             # Kode sumber aplikasi web (halaman, mesin, gaya)
├── tests/                           # Berkas kasus uji otomatis
├── dist/                            # Hasil build produksi siap unggah
└── index.html                       # Halaman induk aplikasi (memuat meta noindex)
```

---

## 2. Daftar Perintah Utama

Buka **Command Prompt (CMD)** atau **PowerShell** pada folder proyek ini, lalu jalankan perintah berikut:

| Perintah | Fungsi |
|---|---|
| `npm install` | Memastikan lingkungan lokal siap (tidak membutuhkan unduhan paket internet) |
| `npm run data` | Membaca `data/NACORA_Database_Final.xlsx`, memvalidasi data, membuat JSON di `public/data/`, dan menyalin foto ke `public/foto/` |
| `npm run dev` | Menjalankan situs di komputer Anda pada alamat `http://localhost:5173/` |
| `npm test` | Menjalankan seluruh pengujian otomatis untuk memastikan perhitungan rekomendasi akurat |
| `npm run build` | Membangun situs statis siap terbit ke dalam folder `dist/` |

*(Catatan untuk pengguna Windows tanpa instalasi Node.js terpisah: di dalam folder proyek sudah disediakan berkas pembantu `npm.cmd` dan `node.cmd`, sehingga Anda juga dapat mengetik `.\npm run data`, `.\npm run dev`, `.\npm test`, dan `.\npm run build` di PowerShell).*

---

## 3. Cara Menjalankan Situs Secara Lokal

1. Buka terminal (**PowerShell** atau **Command Prompt**) di folder proyek ini.
2. Jalankan perintah:
   ```bash
   npm run dev
   ```
   *(atau `.\npm run dev` pada PowerShell).*
3. Buka browser (Chrome, Edge, atau Firefox) dan kunjungi alamat:
   **http://localhost:5173/**
4. Untuk menghentikan server lokal, tekan `Ctrl + C` pada jendela terminal.

---

## 4. Cara Memperbarui Data (Panduan untuk Non-Programmer)

Apabila tim R&D ingin mengubah isi data bahan, menambah foto larutan, memperbaiki catatan evaluasi, atau menambah subkategori pangan:

### Langkah 1 — Ubah Berkas Excel atau Foto
1. Buka berkas **`data/NACORA_Database_Final.xlsx`** menggunakan Microsoft Excel.
2. Lakukan perubahan pada sheet yang sesuai (`Bahan`, `Kombinasi`, `Booklet`, `Kategori Pangan`, `Pilihan Form`, atau `Rujukan`):
   * Pastikan format **ID Bahan** selalu `NC-###` (misalnya `NC-086`) dan tidak ada yang ganda.
   * Pastikan kolom **Warna** hanya berisi satu atau dua dari 7 nama warna sah yang dipisah titik koma (`;`): `Yellow`, `Orange`, `Red`, `Green`, `Blue`, `Purple`, `Black`.
   * Pastikan **pH Min** dan **pH Max** berada di antara `0` dan `14`, serta `pH Min <= pH Max`.
   * Pastikan kode **HEX** diawali tanda pagar `#` diikuti 6 karakter heksadesimal (contoh `#F1A043`).
   * Jika menambah foto baru, simpan berkas fotonya (`.jpg`) ke dalam folder **`data/foto/`** dan tulis nama berkasnya pada kolom **Foto** di sheet `Bahan`.
3. Simpan (*Save*) dan tutup berkas Excel.

### Langkah 2 — Jalankan Konversi & Validasi Data
Di terminal pada folder proyek, jalankan:
```bash
npm run data
```
* Skrip akan memeriksa seluruh aturan di atas secara otomatis.
* Jika terdapat kesalahan ketik (misalnya nama berkas foto belum dimasukkan ke `data/foto/` atau nilai pH terbalik), terminal akan menampilkan pesan letak baris yang perlu diperbaiki.
* Jika tertulis **`[STATUS] VALIDASI LULUS (0 galat)`**, maka berkas JSON di `public/data/` dan foto di `public/foto/` telah berhasil diperbarui.
* Hanya kolom pada **daftar putih (whitelist)** yang dibaca ke JSON. Kolom lain di luar daftar putih (seperti harga, MoQ, atau nama supplier bila ada) otomatis diabaikan demi menjaga kerahasiaan data.

### Langkah 3 — Bangun Ulang Situs (`dist/`)
Jalankan perintah berikut untuk memperbarui paket siap unggah:
```bash
npm run build
```
Perintah ini akan menghasilkan ulang seluruh berkas situs terbaru di dalam folder **`dist/`**.

---

## 5. Cara Menerbitkan (Deploy) ke Hosting Statis

Situs NACORA murni berupa berkas statis (HTML, CSS, JavaScript, JSON, dan foto) yang menggunakan navigasi berbasis tanda pagar (`#/...`), sehingga **tidak memerlukan konfigurasi server khusus**.

1. Pastikan Anda sudah menjalankan `npm run data` dan `npm run build`.
2. Ambil seluruh isi di dalam folder **`dist/`**.
3. Unggah (*upload*) isi folder **`dist/`** tersebut ke layanan hosting statis pilihan perusahaan Anda (seperti Netlify, Cloudflare Pages, Vercel, GitHub Pages, atau server web internal perusahaan).
4. Privasi mesin pencari sudah diaktifkan secara bawaan:
   * `dist/index.html` telah memuat tag `<meta name="robots" content="noindex, nofollow" />`.
   * `dist/robots.txt` telah memuat aturan `Disallow: /` agar halaman tidak diindeks oleh mesin pencari publik.
   * Tidak ada layanan analitik, *cookie*, maupun pengiriman data ke pihak ketiga.


