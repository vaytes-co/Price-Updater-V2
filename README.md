# Price Updater — Pasifik Teknik

Aplikasi kalkulator harga berbasis React + Vite, tanpa database.

## Menjalankan project

```bash
npm install
npm run dev
```

## Build untuk hosting statis

```bash
npm run build

RAYON_NUM_THREADS=1 timeout 60s ./node_modules/.bin/vite build
```

Unggah isi folder `dist/` ke hosting statis/cPanel.

## Mengganti logo

Ganti file `public/logo.svg` dengan logo sendiri. Nama file tetap `logo.svg`. Jika menggunakan PNG, simpan sebagai `public/logo.png` lalu ubah referensi `/logo.svg` menjadi `/logo.png` di `src/main.jsx`.

## Desain dan animasi

- Tipografi Nunito dan layout minimalis terang.
- Transisi mode dan animasi hasil menggunakan Framer Motion.
- Animasi skeleton loading dan success check.
- Hover feedback ringan; kursor sistem tetap terlihat agar input nyaman digunakan.
- Responsif untuk desktop dan perangkat mobile.

## Aturan perhitungan yang diterapkan

### Produk Lama

1. `modal.lama = modal.baru - kenaikan.harga`
2. `basis.profit = (jual.lama - modal.lama) / modal.lama`
3. `toleransi.naik = 0,02 × modal.lama`
4. Jika `basis.profit < 0,20`, hitung `jual.baru = (1 + basis.profit) × modal.baru`.
5. Jika basis profit `>= 0,20`, periksa kenaikan. Jika kenaikan tidak lebih besar dari toleransi, pertahankan harga jual lama.
6. Jika kenaikan lebih besar dari toleransi dan `basis.profit < 0,40`, hitung harga jual baru dengan rumus di atas.
7. Jika kenaikan lebih besar dari toleransi dan `basis.profit >= 0,40`, tampilkan peringatan verifikasi manajemen.

Peringatan verifikasi tidak menampilkan harga rekomendasi sebagai keputusan final. Tautan manajemen membuka WhatsApp tanpa menyertakan pesan harga. Form pesan Produk Lama tersedia setelah kalkulasi menghasilkan harga yang dapat diajukan dan memerlukan nama serta kode produk.

### Produk Baru

1. Setiap sampel: `basis.profit = (jual.sampel - modal.sampel) / modal.sampel`.
2. `avg.profit_sample = (profit1 + profit2 + profit3) / 3`.
3. Jika `avg.profit_sample <= 20%` (cabang TRUE): `jual.med_TRUE = (1 + avg.profit_sample) × modal.produk_baru`; `jual.min_TRUE = jual.med_TRUE × 0,98`; `jual.max_TRUE = jual.med_TRUE × 1,02`.
4. Jika `avg.profit_sample > 20%` (cabang FALSE): `jual.min_FALSE = modal.produk_baru × 1,2`; `jual.max_FALSE = (1 + avg.profit_sample) × modal.produk_baru`; `jual.med_FALSE = (jual.min_FALSE + jual.max_FALSE) / 2`.
5. Setelah rekomendasi tersedia, isi nama produk dan pilih harga minimum, median, atau maksimum sebagai harga pengajuan. Pesan dapat dibuka di WhatsApp atau disalin.

### Pembulatan

Satuan pembulatan ditentukan oleh **harga modal baru** sesuai catatan flowchart.

Produk lama:
- Modal di bawah Rp1.000: kelipatan Rp10.
- Modal Rp1.000 sampai di bawah Rp100.000: kelipatan Rp100.
- Modal Rp100.000 sampai di bawah Rp1.000.000: kelipatan Rp1.000.
- Modal Rp1.000.000 atau lebih: kelipatan Rp10.000.

Produk baru:
- Modal di bawah Rp1.000: kelipatan Rp10.
- Modal Rp1.000 sampai di bawah Rp100.000: kelipatan Rp100.
- Modal Rp100.000 sampai di bawah Rp1.000.000: kelipatan Rp1.000.
- Modal Rp1.000.000 atau lebih: kelipatan Rp10.000.

Nilai dibulatkan ke kelipatan terdekat. PRD tidak menentukan perilaku untuk nilai tepat di titik tengah (`.5`); implementasi saat ini mengikuti perilaku `Math.round` JavaScript, tetapi aturan bisnisnya perlu dikonfirmasi.

## WhatsApp

- Salam lokal menggunakan rentang waktu PRD: pagi 00.00–10.59, siang 11.00–14.59, sore 15.00–17.59, malam 18.00–23.59.
- Pesan Produk Lama memakai harga final hasil kalkulasi (termasuk harga lama jika dipertahankan) dan hanya tersedia untuk hasil yang valid.
- Pesan Produk Baru memuat nama produk, modal, ketiga rekomendasi aktif, dan pilihan harga pengajuan.
- Kedua form menyediakan tindakan untuk membuka WhatsApp ke kontak yang dikonfigurasi atau menyalin template. Peringatan Produk Lama hanya membuka kontak manajemen tanpa pesan harga.

## Catatan sumber

Mengikuti PRD V2.1.1: jika kenaikan melebihi toleransi dan basis profit kurang dari 40%, minta verifikasi manajemen. Basis profit 40% atau lebih menghitung ulang harga jual. Produk baru menggunakan cabang TRUE untuk rata-rata profit `<= 20%` dan cabang FALSE untuk rata-rata profit `> 20%`.
