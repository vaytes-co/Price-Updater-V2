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
5. Jika basis profit `>= 0,20`, periksa kenaikan. Jika `kenaikan.harga > toleransi.naik`, hitung harga jual baru dengan rumus di atas; jika tidak, pertahankan harga jual lama.

### Produk Baru

1. Setiap sampel: `basis.profit = (jual.sampel - modal.sampel) / modal.sampel`.
2. `avg.profit.sample = (profit1 + profit2 + profit3) / 3`.
3. Jika rata-rata profit `< 20%`: `median = (1 + avg.profit.sample) × modal`; `minimum = median × 0,98`; `maksimum = median × 1,02`.
4. Jika rata-rata profit `>= 20%`: `minimum = modal × 1,2`; `maksimum = (1 + avg.profit.sample) × modal`; `median = (minimum + maksimum) / 2`.

### Pembulatan

Satuan pembulatan ditentukan oleh **harga modal baru** sesuai catatan flowchart:
- Modal di bawah Rp1.000: kelipatan Rp10.
- Modal Rp1.000 sampai di bawah Rp100.000: kelipatan Rp100.
- Modal Rp100.000 atau lebih: kelipatan Rp1.000.

Nilai dibulatkan ke kelipatan terdekat. Tepat 0,5 dibulatkan ke atas sebagai konvensi karena flowchart hanya menyebut nilai di bawah dan di atas 0,5.

## Catatan sumber

Flowchart Produk Lama memiliki ketidaksesuaian: simbol keputusan memakai ambang 20%, sementara catatan penjelas menyebut pengecekan toleransi untuk profit di atas 25%. Aplikasi mengikuti simbol keputusan 20% dan alur cabangnya. Konfirmasi pemilik aturan diperlukan bila catatan 25% yang dimaksudkan sebagai aturan bisnis utama.
