# PRD — Price Updater V2.1

## 1. Informasi Dokumen

- **Nama fitur:** Pembaruan perhitungan harga jual berdasarkan kenaikan modal
- **Versi:** 2.1
- **Sumber kebutuhan:** Flowchart *Flowchart Kalkulator Harga V.2.1.pdf*
- **Status:** Draft implementasi
- **Tujuan:** Menerjemahkan alur pada flowchart menjadi kebutuhan produk dan aturan bisnis yang dapat digunakan sebagai acuan pengembangan fitur pada sistem Price Updater yang sudah ada.

> **Catatan interpretasi:** Dokumen ini mempertahankan aturan yang tertulis pada flowchart. Bagian yang belum konsisten atau belum cukup jelas ditandai pada bagian **Pertanyaan dan Keputusan yang Perlu Dikonfirmasi** agar tidak diputuskan diam-diam saat implementasi.

## 2. Latar Belakang

Sistem perlu mendukung dua alur perhitungan harga:

1. **Produk Lama:** menentukan apakah harga jual perlu diperbarui setelah modal naik, berdasarkan basis profit produk lama, besarnya kenaikan modal, toleransi, serta batas basis profit.
2. **Produk Baru:** menghitung rekomendasi harga jual minimum, median, dan maksimum berdasarkan rata-rata basis profit dari tiga produk sampel.

Fitur harus mengikuti percabangan pada flowchart, termasuk kondisi ketika harga jual lama dipertahankan dan ketika perubahan harga memerlukan verifikasi manajemen.

## 3. Tujuan

- Menghasilkan harga jual baru secara konsisten berdasarkan aturan pada flowchart.
- Menangani produk lama dan produk baru melalui alur perhitungan yang berbeda.
- Menampilkan rekomendasi harga untuk produk baru berdasarkan tiga sampel produk.
- Memberikan peringatan dan arahan menghubungi manajemen untuk kondisi tertentu.
- Menerapkan pembulatan harga sesuai rentang modal yang ditentukan.

## 4. Ruang Lingkup

### Termasuk

- Input modal, kenaikan modal, dan harga jual untuk produk lama.
- Input modal serta tiga sampel produk untuk produk baru.
- Perhitungan basis profit.
- Perhitungan rata-rata basis profit sampel.
- Perhitungan toleransi kenaikan harga.
- Penentuan harga jual baru atau penggunaan harga jual lama.
- Perhitungan harga jual minimum, median, dan maksimum untuk produk baru.
- Pembulatan hasil harga.
- Peringatan verifikasi manajemen beserta tautan WhatsApp.

### Tidak ditentukan oleh flowchart

- Perubahan struktur database.
- Hak akses pengguna.
- Penyimpanan riwayat perhitungan.
- Format ekspor atau laporan.
- Desain UI terperinci.
- Validasi format input selain kebutuhan agar perhitungan dapat dilakukan.

Hal-hal tersebut mengikuti sistem yang sudah ada atau perlu ditentukan terpisah.

## 5. Istilah dan Variabel

| Variabel | Arti |
|---|---|
| `modal.lama` | Modal produk sebelum kenaikan |
| `modal.baru` | Modal produk setelah kenaikan |
| `kenaikan.harga` | Nilai kenaikan modal produk |
| `jual.lama` | Harga jual produk sebelum kenaikan |
| `jual.baru` | Harga jual hasil perhitungan |
| `basis.profit` | Rasio profit produk lama |
| `toleransi.naik` | Batas toleransi kenaikan, sebesar 2% dari modal lama |
| `modal` | Modal yang digunakan dalam perhitungan produk baru |
| `modal.sample1`–`modal.sample3` | Modal tiga produk sampel |
| `jual.sample1`–`jual.sample3` | Harga jual tiga produk sampel |
| `basis.profit_sample1`–`basis.profit_sample3` | Basis profit masing-masing sampel |
| `avg.profit_sample` | Rata-rata basis profit tiga sampel |
| `jual.min` | Harga jual minimum |
| `jual.med` | Harga jual median |
| `jual.max` | Harga jual maksimum |

## 6. Kebutuhan Fungsional

### FR-01 — Alur Produk Lama: Input

Sistem harus menerima:
- Harga modal baru (`modal.baru`).
- Nilai kenaikan modal (`kenaikan.harga`).
- Harga jual lama (`jual.lama`).

### FR-02 — Menghitung Modal Lama

Sistem menghitung modal lama menggunakan rumus:

```text
modal.lama = modal.baru - kenaikan.harga
```

### FR-03 — Menghitung Basis Profit Produk Lama

Sistem menghitung basis profit dengan rumus:

```text
basis.profit = (jual.lama - modal.lama) / modal.lama
```

Nilai `basis.profit` digunakan dalam keputusan pembaruan harga berikutnya.

### FR-04 — Menghitung Harga Jual Baru Produk Lama

Apabila alur mengharuskan harga jual baru dihitung, sistem menggunakan:

```text
jual.baru = (1 + basis.profit) * modal.baru
```

Hasil harga jual baru mengikuti aturan pembulatan pada bagian 8.

### FR-05 — Keputusan Berdasarkan Basis Profit Produk Lama

Sistem mengevaluasi apakah:

```text
basis.profit < 0.20
```

Aturannya berdasarkan catatan flowchart:

- Jika basis profit di bawah 20%, produk bersifat **price sensitive**. Setiap kenaikan modal diperhitungkan ke harga jual baru.
- Jika basis profit tidak di bawah 20%, sistem melanjutkan pemeriksaan toleransi kenaikan harga.

### FR-06 — Menghitung Toleransi Kenaikan

Sistem menghitung toleransi sebesar 2% dari modal lama:

```text
toleransi.naik = 0.02 * modal.lama
```

Kemudian membandingkan nilai kenaikan modal dengan toleransi:

```text
kenaikan.harga > toleransi.naik
```

- Jika kenaikan lebih besar daripada toleransi, sistem melanjutkan pemeriksaan basis profit berikutnya.
- Jika kenaikan tidak lebih besar daripada toleransi, sistem mempertahankan harga jual lama:

```text
jual.baru = jual.lama
```

### FR-07 — Pemeriksaan Batas Basis Profit 40%

Pada cabang setelah pemeriksaan toleransi, flowchart memeriksa:

```text
basis.profit < 0.4
```

- Jika kondisi terpenuhi, flowchart mengarah ke penulisan/perhitungan harga jual baru.
- Jika kondisi tidak terpenuhi, flowchart mengarah ke peringatan verifikasi manajemen.

Karena hubungan cabang pada diagram perlu dipastikan saat implementasi, ikuti pertanyaan konfirmasi pada bagian 11 sebelum mengunci logika ini.

### FR-08 — Peringatan Verifikasi Manajemen

Pada cabang yang mengarah ke peringatan, sistem menampilkan pesan:

> Perubahan harga memerlukan verifikasi tambahan dari pihak Manajemen. Harap hubungi pimpinan perusahaan.

Sistem juga menyediakan tautan WhatsApp berikut:

https://wa.me/+6281315188603

Flowchart tidak menjelaskan apakah tautan dibuka di tab baru atau apakah nomor dapat dikonfigurasi melalui pengaturan.

### FR-09 — Alur Produk Baru: Input

Sistem harus menerima:
- Harga modal produk baru (`modal` atau `modal.baru`, sesuai penamaan input pada implementasi).
- Data tiga produk sampel, masing-masing terdiri dari harga modal dan harga jual:
  - `modal.sample1`, `jual.sample1`
  - `modal.sample2`, `jual.sample2`
  - `modal.sample3`, `jual.sample3`

### FR-10 — Menghitung Basis Profit Setiap Sampel

Untuk setiap sampel, sistem menghitung:

```text
basis.profit_sample1 = (jual.sample1 - modal.sample1) / modal.sample1
basis.profit_sample2 = (jual.sample2 - modal.sample2) / modal.sample2
basis.profit_sample3 = (jual.sample3 - modal.sample3) / modal.sample3
```

### FR-11 — Menghitung Rata-rata Basis Profit Sampel

Sistem menghitung rata-rata dari ketiga basis profit:

```text
avg.profit_sample =
  (basis.profit_sample1
   + basis.profit_sample2
   + basis.profit_sample3) / 3
```

### FR-12 — Keputusan Berdasarkan Rata-rata Basis Profit

Sistem mengevaluasi:

```text
avg.profit_sample < 0.20
```

Flowchart memiliki dua cabang perhitungan harga jual minimum, median, dan maksimum. Rumus untuk masing-masing cabang dijelaskan di FR-13 dan FR-14.

### FR-13 — Perhitungan Harga Produk Baru Saat Rata-rata Profit di Bawah 20%

Untuk cabang `avg.profit_sample < 0.20`, flowchart mencantumkan rumus:

```text
jual.min = modal * 1.2
jual.max = (1 + avg.profit_sample) * modal
jual.med = (jual.min + jual.max) / 2
```

Ketiga hasil mengikuti aturan pembulatan khusus produk baru pada bagian 8.

### FR-14 — Perhitungan Harga Produk Baru Saat Rata-rata Profit Tidak di Bawah 20%

Untuk cabang `avg.profit_sample >= 0.20`, flowchart mencantumkan rumus:

```text
jual.med = (1 + avg.profit_sample) * modal
jual.min = jual.med * 0.98
jual.max = jual.med * 1.02
```

Ketiga hasil mengikuti aturan pembulatan khusus produk baru pada bagian 8.

### FR-15 — Menampilkan Hasil Produk Baru

Sistem menampilkan:
- Harga jual minimum (`jual.min`).
- Harga jual median (`jual.med`).
- Harga jual maksimum (`jual.max`).

Label hasil harus jelas sehingga pengguna dapat membedakan ketiga rekomendasi tersebut.

## 7. Aturan Alur Produk Lama

Ringkasan alur sesuai diagram:

1. Pengguna memasukkan modal baru.
2. Pengguna memasukkan nilai kenaikan modal.
3. Sistem menghitung modal lama.
4. Pengguna memasukkan harga jual lama.
5. Sistem menghitung basis profit.
6. Jika `basis.profit < 0.20`, sistem menghitung harga jual baru.
7. Jika `basis.profit >= 0.20`, sistem membandingkan kenaikan modal dengan toleransi `2% × modal.lama`.
8. Jika kenaikan tidak melewati toleransi, harga jual lama dipertahankan.
9. Jika kenaikan melewati toleransi, sistem memeriksa `basis.profit < 0.4`.
10. Berdasarkan cabang terakhir, sistem menghitung/menuliskan harga jual baru atau menampilkan peringatan verifikasi manajemen. Arah cabang ini perlu dikonfirmasi karena diagram hasil ekstraksi belum cukup jelas untuk memastikan seluruh koneksinya.

## 8. Aturan Pembulatan Harga

### 8.1 Produk Lama

Pembulatan harga jual baru berdasarkan nilai `modal.baru`:

| Rentang modal baru | Pembulatan ke |
|---|---|
| `modal.baru < 1.000` | Puluhan |
| `1.000 <= modal.baru < 100.000` | Ratusan |
| `100.000 <= modal.baru < 1.000.000` | Ribuan |
| `modal.baru >= 1.000.000` | Puluhan ribu |

Contoh pada flowchart:
- 27 → 30
- 82 → 80
- 102 → 100
- 872 → 900
- 3.281 → 3.200
- 6.611 → 6.700
- 73.755 → 70.000
- 38.112 → 39.000

Catatan flowchart:
- Pecahan digit pembulatan di bawah `0.5xx` dibulatkan ke bawah.
- Pecahan digit pembulatan di atas `0.5xx` dibulatkan ke atas.

### 8.2 Produk Baru

Pembulatan hasil harga minimum, median, dan maksimum berdasarkan modal produk baru:

| Rentang modal baru | Pembulatan ke |
|---|---|
| `modal.baru < 1.000` | Puluhan |
| `1.000 <= modal.baru < 100.000` | Ratusan |
| `modal.baru >= 100.000` | Ribuan |

Catatan flowchart:
- Pecahan digit pembulatan di bawah `0.5` dibulatkan ke bawah.
- Pecahan digit pembulatan di atas `0.5` dibulatkan ke atas.

Flowchart tidak menjelaskan perilaku tepat pada nilai tengah `0.5` atau aturan teknis untuk nilai negatif. Hal tersebut perlu ditetapkan sebelum implementasi pembulatan.

## 9. Kriteria Penerimaan

### Produk Lama

- [ ] Sistem menghitung `modal.lama` dengan benar dari modal baru dikurangi kenaikan modal.
- [ ] Sistem menghitung `basis.profit` sesuai rumus.
- [ ] Basis profit di bawah 20% masuk ke cabang price sensitive.
- [ ] Sistem menghitung toleransi sebesar 2% dari modal lama.
- [ ] Sistem mempertahankan `jual.lama` jika kenaikan tidak melebihi toleransi pada cabang yang sesuai.
- [ ] Sistem memeriksa ambang basis profit 40% pada cabang yang sesuai.
- [ ] Sistem menampilkan peringatan dan tautan WhatsApp pada cabang yang memerlukannya.
- [ ] Harga jual baru dibulatkan sesuai rentang modal produk lama.

### Produk Baru

- [ ] Sistem menerima modal dan data modal/harga jual dari tiga sampel.
- [ ] Sistem menghitung basis profit masing-masing sampel.
- [ ] Sistem menghitung rata-rata basis profit dari tiga sampel.
- [ ] Sistem memilih cabang berdasarkan ambang 20%.
- [ ] Sistem menghitung harga minimum, median, dan maksimum dengan rumus cabang yang dipilih.
- [ ] Sistem membulatkan hasil sesuai rentang modal produk baru.
- [ ] Sistem menampilkan ketiga harga dengan label yang jelas.

## 10. Validasi Minimum yang Disarankan

Validasi berikut merupakan rekomendasi implementasi, bukan aturan eksplisit yang tertulis pada flowchart:

- Modal dan harga jual harus berupa angka.
- Modal yang menjadi penyebut rumus harus lebih besar dari nol.
- Ketiga sampel harus lengkap agar rata-rata basis profit dapat dihitung.
- Sistem harus menampilkan pesan yang mudah dipahami jika input tidak valid.
- Perhitungan tidak boleh menghasilkan `NaN` atau `Infinity`.

## 11. Pertanyaan dan Keputusan yang Perlu Dikonfirmasi

Bagian berikut sengaja ditandai karena flowchart tidak sepenuhnya konsisten atau belum menjelaskan detailnya.

1. **Cabang `basis.profit < 0.4`:** apakah basis profit di bawah 40% menghasilkan harga jual baru, sedangkan basis profit 40% atau lebih menghasilkan peringatan manajemen? Diagram teks menunjukkan arah cabang yang perlu diperiksa pada file asli.
2. **Rumus `jual.min` produk baru saat rata-rata profit di bawah 20%:** flowchart menetapkan `jual.min = modal * 1.2`, yang berarti harga minimum berbasis margin 20%, meskipun rata-rata profit sampel di bawah 20%. Konfirmasi apakah ini memang aturan bisnis yang diinginkan.
3. **Rumus `jual.max` dan `jual.med` pada cabang di bawah 20%:** rumus yang tercantum menghasilkan `jual.max = (1 + avg.profit_sample) * modal` dan `jual.med` sebagai rata-rata `jual.min` dan `jual.max`. Pastikan urutan nilai minimum, median, dan maksimum tetap masuk akal jika rata-rata profit sampel jauh di bawah 20%.
4. **Batas tepat 20% dan 40%:** rumus menggunakan operator `<`. Dengan demikian, tepat 20% tidak termasuk cabang di bawah 20%, dan tepat 40% tidak termasuk cabang di bawah 40%. Konfirmasi apakah ini sesuai.
5. **Pembulatan nilai tepat 0,5:** flowchart hanya menjelaskan nilai di bawah dan di atas 0,5, bukan nilai tepat 0,5.
6. **Aturan pembulatan produk baru:** catatan di diagram menyebut pembulatan berdasarkan modal, tetapi beberapa contoh/penamaan rentang perlu dikonfirmasi agar tidak tertukar dengan aturan produk lama.
7. **Nama variabel modal produk baru:** diagram memakai `modal` dalam rumus, tetapi pada bagian catatan memakai `modal.baru`. Tentukan satu nama variabel yang konsisten pada implementasi.
8. **Perbandingan toleransi:** flowchart menyebut `Kenaikan Harga > Toleransi Naik?`. Artinya, nilai yang sama persis dengan toleransi tidak melewati batas. Konfirmasi jika aturan yang dimaksud berbeda.

## 12. Catatan Implementasi

- Gunakan perhitungan desimal yang konsisten untuk rasio profit dan toleransi.
- Lakukan pembulatan pada tahap yang ditentukan oleh aturan bisnis; jangan membulatkan basis profit sebelum membandingkan ambang kecuali telah disepakati.
- Pisahkan fungsi perhitungan produk lama dan produk baru agar aturan pembulatan dan percabangannya tidak tercampur.
- Simpan rumus sebagai fungsi yang dapat diuji secara terpisah.
- Jangan mengubah aturan yang ditandai untuk konfirmasi tanpa keputusan pemilik produk.
- PRD ini mendeskripsikan pembaruan fitur berdasarkan flowchart, bukan spesifikasi ulang seluruh sistem yang telah berjalan.

## 13. Skenario Uji Awal

Angka berikut merupakan contoh skenario uji yang perlu disiapkan; hasil final harus disesuaikan setelah pertanyaan pada bagian 11 diputuskan.

1. Produk lama dengan `basis.profit < 0.20`.
2. Produk lama dengan `basis.profit = 0.20`.
3. Produk lama dengan kenaikan modal lebih kecil dari toleransi.
4. Produk lama dengan kenaikan modal sama dengan toleransi.
5. Produk lama dengan kenaikan modal lebih besar dari toleransi dan basis profit di bawah 40%.
6. Produk lama dengan kenaikan modal lebih besar dari toleransi dan basis profit 40% atau lebih.
7. Produk baru dengan `avg.profit_sample < 0.20`.
8. Produk baru dengan `avg.profit_sample = 0.20`.
9. Pembulatan pada batas modal 1.000, 100.000, dan 1.000.000 untuk produk lama.
10. Pembulatan pada batas modal 1.000 dan 100.000 untuk produk baru.
11. Input modal nol atau sampel tidak lengkap.

---
**Acuan utama:** *Flowchart Kalkulator Harga V.2.1.pdf*, halaman 1.
