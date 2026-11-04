# PRD — Price Updater V2.1.1

## 1. Informasi Dokumen
- **Nama fitur:** Pembaruan kalkulasi harga produk lama dan produk baru
- **Versi:** 2.1.1
- **Sumber:** `Flowchart Kalkulator Harga v.2.1.1.pdf`, halaman 1
- **Status:** Acuan pembaruan fitur pada sistem yang sudah berjalan

> Dokumen ini mengikuti flowchart V2.1.1. Gunakan variabel dan rumus pada versi ini, bukan versi V2.1 sebelumnya. Percabangan profit 40% produk lama telah diselaraskan dengan arah YES/NO pada flowchart. Bagian yang belum sepenuhnya jelas ditandai pada bagian 11.

## 2. Latar Belakang dan Tujuan
Sistem Price Updater yang sudah ada mendapatkan pembaruan aturan kalkulasi. Flowchart memisahkan proses menjadi:
1. **Produk Lama:** menghitung harga jual baru berdasarkan modal lama, kenaikan modal, harga jual lama, basis profit, toleransi kenaikan, dan pemeriksaan ambang profit.
2. **Produk Baru:** menghitung basis profit dari tiga produk sampel, menghitung rata-ratanya, lalu menghasilkan harga jual minimum, median, dan maksimum melalui dua cabang rumus.

Tujuan pembaruan:
- Menyamakan implementasi dengan flowchart V2.1.1.
- Menggunakan nama variabel terbaru secara konsisten.
- Memisahkan hasil produk baru untuk kondisi `avg.profit_sample > 0.20` dan `avg.profit_sample <= 0.20`.
- Menghindari penggunaan rumus atau variabel dari versi sebelumnya.

## 3. Ruang Lingkup
Termasuk:
- Perhitungan produk lama dan produk baru.
- Basis profit dan toleransi kenaikan 2%.
- Perhitungan tiga sampel dan rata-rata profit.
- Dua set perhitungan harga minimum, median, maksimum.
- Pembulatan harga.
- Peringatan verifikasi manajemen dan tautan WhatsApp.
- Form data tambahan dan pembuatan template pesan WhatsApp untuk produk lama dan produk baru.
- Pemilihan salah satu rekomendasi harga sebagai harga yang diajukan untuk produk baru.

Flowchart tidak menentukan perubahan database, hak akses, riwayat perhitungan, ekspor, atau desain UI terperinci. Bagian tersebut mengikuti sistem yang sudah berjalan.

## 4. Daftar Variabel Resmi V2.1.1

### 4.1 Produk Lama

| Variabel | Keterangan |
|---|---|
| `modal.baru` | Harga modal setelah kenaikan |
| `kenaikan.harga` | Nilai kenaikan modal |
| `modal.lama` | Harga modal sebelum kenaikan |
| `jual.lama` | Harga jual sebelum kenaikan |
| `basis.profit` | Basis profit produk lama |
| `toleransi.naik` | Batas toleransi kenaikan |
| `jual.baru` | Harga jual baru atau harga jual hasil keputusan |
| `nama.produk` | Nama produk yang diisi untuk template WhatsApp produk lama |
| `kode.produk` | Kode produk yang diisi untuk template WhatsApp produk lama |

### 4.2 Produk Baru — Input dan Sampel

| Variabel | Keterangan |
|---|---|
| `modal.produk_baru` | Modal produk baru yang akan dihitung |
| `modal.sample1` / `jual.sample1` | Modal / harga jual sampel 1 |
| `modal.sample2` / `jual.sample2` | Modal / harga jual sampel 2 |
| `modal.sample3` / `jual.sample3` | Modal / harga jual sampel 3 |
| `basis.profit_sample1` | Basis profit sampel 1 |
| `basis.profit_sample2` | Basis profit sampel 2 |
| `basis.profit_sample3` | Basis profit sampel 3 |
| `avg.profit_sample` | Rata-rata basis profit ketiga sampel |
| `nama.produk_baru` | Nama produk baru yang diisi setelah kalkulasi selesai |
| `harga.pengajuan` | Salah satu harga rekomendasi yang dipilih pengguna: minimum, median, atau maksimum |

### 4.3 Produk Baru — Hasil Cabang

| Kondisi | Variabel hasil |
|---|---|
| FALSE (`avg.profit_sample > 0.20`) | `jual.min_FALSE`, `jual.med_FALSE`, `jual.max_FALSE` |
| TRUE (`avg.profit_sample <= 0.20`) | `jual.min_TRUE`, `jual.med_TRUE`, `jual.max_TRUE` |

**Ketentuan penamaan:** gunakan `modal.produk_baru` untuk rumus produk baru. Jangan menggantinya dengan `modal` atau `modal.baru`. Pertahankan akhiran `_FALSE` dan `_TRUE` pada variabel hasil sesuai cabangnya.

## 5. Kebutuhan Fungsional — Produk Lama

### FR-OLD-01 — Input
Sistem menerima `modal.baru`, `kenaikan.harga`, dan `jual.lama`.

### FR-OLD-02 — Menghitung Modal Lama

```text
modal.lama = modal.baru - kenaikan.harga
```

### FR-OLD-03 — Menghitung Basis Profit

```text
basis.profit = (jual.lama - modal.lama) / modal.lama
```

### FR-OLD-04 — Rumus Harga Jual Baru

Flowchart menempatkan proses **Calculate Harga Jual Baru** setelah perhitungan basis profit dan sebelum pemeriksaan ambang 20%. Sistem menghitung nilai kandidat harga jual baru:

```text
jual.baru = (1 + basis.profit) * modal.baru
```

Nilai `jual.baru` kemudian digunakan apabila jalur keputusan berakhir pada proses **Write Harga Jual Baru**. Keputusan berikutnya menentukan apakah nilai tersebut ditulis, harga jual lama dipertahankan, atau proses memerlukan verifikasi manajemen. Hasil yang ditulis mengikuti aturan pembulatan produk lama pada bagian 8.

### FR-OLD-05 — Pemeriksaan Basis Profit 20%

Sistem mengevaluasi:

```text
basis.profit < 0.20
```

- **TRUE:** produk termasuk *price sensitive*. Langsung lanjut ke proses **Write Harga Jual Baru** menggunakan nilai `jual.baru` yang sudah dihitung pada FR-OLD-04.
- **FALSE:** sistem melanjutkan pemeriksaan toleransi kenaikan.

### FR-OLD-06 — Toleransi Kenaikan

```text
toleransi.naik = 0.02 * modal.lama
```

Sistem membandingkan:

```text
kenaikan.harga > toleransi.naik
```

- **FALSE:** harga jual baru sama dengan harga jual lama:

```text
jual.baru = jual.lama
```

- **TRUE:** lanjutkan pemeriksaan `basis.profit < 0.4`.

### FR-OLD-07 — Pemeriksaan Basis Profit 40%

```text
basis.profit < 0.4
```

Berdasarkan arah cabang pada diagram:
- **TRUE/YES (`basis.profit < 0.4`):** lanjut ke proses *Write Harga Jual Baru* menggunakan nilai `jual.baru` yang sudah dihitung pada FR-OLD-04.
- **FALSE/NO (`basis.profit >= 0.4`):** tampilkan peringatan verifikasi manajemen.

### FR-OLD-08 — Peringatan Manajemen

Peringatan hanya ditampilkan apabila pemeriksaan toleransi menghasilkan TRUE (`kenaikan.harga > toleransi.naik`) dan pemeriksaan basis profit 40% menghasilkan FALSE (`basis.profit >= 0.4`).

Tampilkan pesan:

> Perubahan harga memerlukan verifikasi tambahan dari pihak Manajemen. Harap hubungi pimpinan perusahaan.

Sediakan tautan WhatsApp:

https://wa.me/+6281315188603

### FR-OLD-09 — Form dan Template Pesan WhatsApp Produk Lama

Setelah hasil kalkulasi produk lama tersedia, sistem menyediakan form data produk untuk menyusun pesan WhatsApp. Form ini meminta:
- `nama.produk` — nama produk.
- `kode.produk` — kode produk.

Sistem membuat template pesan secara otomatis menggunakan data hasil perhitungan yang sudah tersedia:
- `modal.lama`
- `modal.baru`
- `kenaikan.harga`
- `jual.lama`
- Harga jual rekomendasi berdasarkan hasil akhir alur produk lama.

Untuk harga jual rekomendasi:
- Jika keputusan kalkulasi menulis harga jual baru, gunakan nilai `jual.baru` hasil perhitungan.
- Jika kenaikan masih dalam toleransi dan harga lama dipertahankan, gunakan `jual.lama`.
- Jika hasil kalkulasi memerlukan verifikasi manajemen, jangan menampilkan harga rekomendasi seolah-olah sudah menjadi keputusan final. Tampilkan status verifikasi dan gunakan alur pesan/peringatan yang sesuai.

Template pesan produk lama:

```text
Halo, siang Ko David, saya mau meminta review perhitungan harga produk lama.

Nama produk: [Nama Produk]
Kode produk: [Kode Produk]

Modal lama: Rp [Modal Lama]
Modal baru: Rp [Modal Baru]
Kenaikan harga: Rp [Kenaikan Harga]

Harga jual lama: Rp [Harga Jual Lama]
Rekomendasi harga jual: Rp [Harga Jual Rekomendasi]

Terima kasih.
```

Placeholder dalam tanda kurung siku harus diganti dengan data aktual. Format pesan harus mempertahankan susunan baris seperti contoh.

Sediakan tindakan untuk menyalin template pesan yang sudah terisi. Jika aplikasi sudah memiliki mekanisme membuka WhatsApp ke kontak manajemen, gunakan mekanisme tersebut tanpa mengubah nomor tujuan yang telah dikonfigurasi.

## 6. Kebutuhan Fungsional — Produk Baru

### FR-NEW-01 — Input
Sistem menerima `modal.produk_baru` serta tiga pasang data sampel:
- `modal.sample1` dan `jual.sample1`
- `modal.sample2` dan `jual.sample2`
- `modal.sample3` dan `jual.sample3`

### FR-NEW-02 — Basis Profit Sampel

```text
basis.profit_sample1 = (jual.sample1 - modal.sample1) / modal.sample1
basis.profit_sample2 = (jual.sample2 - modal.sample2) / modal.sample2
basis.profit_sample3 = (jual.sample3 - modal.sample3) / modal.sample3
```

### FR-NEW-03 — Rata-rata Basis Profit

```text
avg.profit_sample =
  (basis.profit_sample1
   + basis.profit_sample2
   + basis.profit_sample3) / 3
```

### FR-NEW-04 — Percabangan Rata-rata Profit

Flowchart V2.1.1 menggunakan kondisi:

```text
avg.profit_sample <= 0.20
```

- **TRUE:** jalankan rumus cabang TRUE dan hasilkan variabel berakhiran `_TRUE`.
- **FALSE:** jalankan rumus cabang FALSE dan hasilkan variabel berakhiran `_FALSE`.

Catatan perubahan dari V2.1: operator pada diagram terbaru adalah `<= 0.20`, bukan `< 0.20`.

### FR-NEW-05 — Rumus Cabang FALSE

Berlaku jika `avg.profit_sample > 0.20`:

```text
jual.min_FALSE = modal.produk_baru * 1.2
jual.max_FALSE = (1 + avg.profit_sample) * modal.produk_baru
jual.med_FALSE = (jual.min_FALSE + jual.max_FALSE) / 2
```

### FR-NEW-06 — Rumus Cabang TRUE

Berlaku jika `avg.profit_sample <= 0.20`:

```text
jual.med_TRUE = (1 + avg.profit_sample) * modal.produk_baru
jual.min_TRUE = jual.med_TRUE * 0.98
jual.max_TRUE = jual.med_TRUE * 1.02
```

### FR-NEW-07 — Menampilkan Hasil
Sistem menampilkan tiga rekomendasi dari cabang yang aktif:
- Harga jual minimum.
- Harga jual median.
- Harga jual maksimum.

Variabel internal tetap menggunakan akhiran `_FALSE` atau `_TRUE` sesuai cabang perhitungannya.

### FR-NEW-08 — Form Data Produk dan Pemilihan Harga Pengajuan

Setelah pengguna menyelesaikan seluruh input produk baru dan sistem berhasil menampilkan tiga rekomendasi harga, tampilkan form lanjutan yang meminta:
- `nama.produk_baru` — nama produk baru.
- `harga.pengajuan` — pilihan salah satu dari tiga rekomendasi yang dihasilkan sistem:
  - Harga Minimum.
  - Harga Median.
  - Harga Maksimum.

Pilihan harga harus mengambil nilai dari cabang perhitungan yang aktif. Pengguna hanya dapat memilih satu rekomendasi sebagai harga yang diajukan. Jangan menghitung ulang atau mengubah nilai rekomendasi ketika pengguna memilih salah satu opsi.

### FR-NEW-09 — Template Pesan WhatsApp Produk Baru

Setelah nama produk diisi dan salah satu rekomendasi harga dipilih, sistem membuat template pesan WhatsApp secara otomatis.

Template harus memuat:
- Nama produk baru.
- Harga modal produk baru (`modal.produk_baru`).
- Ketiga rekomendasi harga: minimum, median, dan maksimum dari cabang yang aktif.
- Harga pengajuan yang dipilih pengguna (`harga.pengajuan`).

Gunakan template berikut:

```text
Halo, siang Ko David. Saya ingin meminta review dan persetujuan harga untuk produk baru.

*INFORMASI PRODUK*
Nama produk: [Nama Produk]

*INFORMASI MODAL*
Harga modal: Rp [Harga Modal]

*REKOMENDASI HARGA JUAL*
Berdasarkan hasil perhitungan rata-rata profit produk sampel, diperoleh rekomendasi:
1. Harga Minimum: Rp [Harga Minimum]
2. Harga Median: Rp [Harga Median]
3. Harga Maksimum: Rp [Harga Maksimum]

*PENGAJUAN HARGA*
Dari ketiga rekomendasi tersebut, saya mengajukan harga jual sebesar *Rp [Harga Pengajuan]*.

Mohon review dan persetujuannya dari Ko David. Terima kasih.
```

Placeholder dalam tanda kurung siku harus diganti dengan data aktual. Pesan harus menampilkan seluruh tiga rekomendasi, meskipun pengguna hanya memilih satu harga sebagai pengajuan. Harga pengajuan harus sama persis dengan salah satu rekomendasi yang dipilih, bukan hasil kalkulasi baru.

Sediakan tindakan untuk menyalin template pesan yang sudah terisi. Jika aplikasi sudah memiliki mekanisme membuka WhatsApp ke kontak manajemen, gunakan mekanisme tersebut tanpa mengubah nomor tujuan yang telah dikonfigurasi.

## 7. Ringkasan Alur

### 7.1 Produk Lama
1. Input `modal.baru`.
2. Input `kenaikan.harga`.
3. Hitung `modal.lama`.
4. Input `jual.lama`.
5. Hitung `basis.profit`.
6. Hitung kandidat `jual.baru` menggunakan rumus FR-OLD-04.
7. Evaluasi `basis.profit < 0.20`.
8. Jika TRUE, langsung tulis nilai `jual.baru`.
9. Jika FALSE, hitung `toleransi.naik` dan evaluasi `kenaikan.harga > toleransi.naik`.
10. Jika hasil evaluasi toleransi FALSE, tetapkan `jual.baru = jual.lama`.
11. Jika hasil evaluasi toleransi TRUE, evaluasi `basis.profit < 0.4`.
12. Jika kondisi 40% TRUE, tulis nilai `jual.baru`.
13. Jika kondisi 40% FALSE, tampilkan peringatan manajemen.

### 7.2 Produk Baru
1. Input `modal.produk_baru`.
2. Input modal dan harga jual ketiga sampel.
3. Hitung basis profit setiap sampel.
4. Hitung `avg.profit_sample`.
5. Evaluasi `avg.profit_sample <= 0.20`.
6. TRUE: hitung harga menggunakan rumus `_TRUE`.
7. FALSE: hitung harga menggunakan rumus `_FALSE`.
8. Bulatkan dan tampilkan harga minimum, median, maksimum.
9. Setelah hasil rekomendasi tersedia, tampilkan form nama produk dan pilihan satu harga rekomendasi.
10. Buat template pesan WhatsApp berisi nama produk, modal, seluruh rekomendasi, dan harga pengajuan yang dipilih.
11. Sediakan tindakan untuk menyalin pesan yang telah dibuat.

### 7.3 Template WhatsApp Produk Lama
1. Selesaikan kalkulasi produk lama dan tentukan hasil akhirnya: harga baru, mempertahankan harga lama, atau memerlukan verifikasi manajemen.
2. Tampilkan form `nama.produk` dan `kode.produk`.
3. Isi template pesan dengan data produk dan nilai kalkulasi yang relevan.
4. Sediakan tindakan untuk menyalin pesan.
5. Jangan menyajikan harga rekomendasi final apabila hasil kalkulasi masih berstatus memerlukan verifikasi manajemen.

## 8. Aturan Pembulatan

Flowchart V2.1.1 mencantumkan aturan pembulatan berikut:

| Nilai modal | Satuan pembulatan | Contoh |
|---|---|---|
| `< 1.000` | Puluhan | 27 → 30; 82 → 80 |
| `1.000 <= modal < 100.000` | Ratusan | 102 → 100; 872 → 900 |
| `100.000 <= modal < 1.000.000` | Ribuan | 3.281 → 3.200; 6.611 → 6.700 |
| `>= 1.000.000` | Puluhan ribu | 73.755 → 70.000; 38.112 → 39.000 |

Ketentuan:
- Pecahan digit pembulatan `< 0.5xx` dibulatkan ke bawah.
- Pecahan digit pembulatan `> 0.5xx` dibulatkan ke atas.

Untuk produk lama, dasar rentang adalah `modal.baru`. Untuk produk baru, rumus memakai `modal.produk_baru`, sedangkan catatan pembulatan pada diagram masih menyebut `modal.baru`. Interpretasi dokumen ini: gunakan nilai modal produk baru (`modal.produk_baru`) sebagai dasar rentang pembulatan; konfirmasikan jika maksud flowchart berbeda.

## 9. Kriteria Penerimaan

### Produk Lama
- [ ] Input menggunakan `modal.baru`, `kenaikan.harga`, dan `jual.lama`.
- [ ] `modal.lama` dan `basis.profit` dihitung sesuai rumus.
- [ ] Basis profit di bawah 20% masuk jalur *price sensitive*.
- [ ] Toleransi dihitung sebesar 2% dari `modal.lama`.
- [ ] Kenaikan yang tidak lebih besar dari toleransi mempertahankan `jual.lama`.
- [ ] Kenaikan yang lebih besar dari toleransi memicu pemeriksaan ambang 40%.
- [ ] Kondisi TRUE pada `basis.profit < 0.4` menulis nilai `jual.baru`.
- [ ] Kondisi FALSE pada `basis.profit < 0.4` menampilkan peringatan manajemen.
- [ ] Harga mengikuti aturan pembulatan.
- [ ] Setelah kalkulasi tersedia, sistem meminta nama produk dan kode produk.
- [ ] Template WhatsApp produk lama menampilkan nama produk dan kode produk sesuai input.
- [ ] Template WhatsApp menampilkan modal lama, modal baru, kenaikan harga, harga jual lama, dan rekomendasi harga jual yang sesuai dengan hasil alur kalkulasi.
- [ ] Jika hasil memerlukan verifikasi manajemen, sistem tidak menyajikan harga rekomendasi sebagai harga final.
- [ ] Pesan dapat disalin dengan susunan baris dan format yang rapi.

### Produk Baru
- [ ] Modal produk baru menggunakan variabel `modal.produk_baru`.
- [ ] Sistem menerima tiga pasang input modal dan harga jual sampel.
- [ ] Basis profit ketiga sampel dihitung sesuai rumus.
- [ ] Rata-rata dihitung dari tiga basis profit.
- [ ] Percabangan menggunakan `avg.profit_sample <= 0.20`.
- [ ] Cabang FALSE menghasilkan variabel `_FALSE` dengan rumus yang ditentukan.
- [ ] Cabang TRUE menghasilkan variabel `_TRUE` dengan rumus yang ditentukan.
- [ ] Sistem menampilkan hasil dari cabang yang aktif.
- [ ] Harga mengikuti aturan pembulatan.
- [ ] Setelah ketiga rekomendasi tampil, sistem meminta nama produk baru.
- [ ] Sistem menyediakan pilihan tunggal: minimum, median, atau maksimum.
- [ ] Nilai pilihan harga pengajuan harus sama persis dengan rekomendasi yang dipilih dari cabang aktif.
- [ ] Template WhatsApp produk baru menampilkan nama produk, harga modal, dan ketiga rekomendasi.
- [ ] Template menampilkan harga pengajuan sesuai pilihan pengguna.
- [ ] Pesan dapat disalin dengan format WhatsApp (tanda `*` untuk teks tebal) dan susunan baris yang rapi.
- [ ] Mengubah pilihan harga pengajuan memperbarui bagian pengajuan pada template tanpa mengubah hasil rekomendasi.

## 10. Validasi Teknis yang Disarankan

Poin berikut merupakan rekomendasi implementasi, bukan aturan eksplisit flowchart:
- Pastikan input nominal berupa angka valid.
- Modal lama dan modal sampel harus lebih besar dari nol sebelum menjadi penyebut.
- Pastikan ketiga sampel terisi sebelum rata-rata dihitung.
- Jangan membulatkan `basis.profit` sebelum mengevaluasi ambang 20% dan 40%.
- Gunakan nilai desimal penuh untuk perhitungan antara; pembulatan diterapkan pada hasil harga.
- Tampilkan pesan validasi jika input tidak dapat dihitung.
- Nama produk dan kode produk wajib diisi sebelum template produk lama dibuat.
- Nama produk baru dan pilihan harga pengajuan wajib diisi sebelum template produk baru dibuat.
- Pastikan nilai harga pada template menggunakan format nominal yang konsisten dengan tampilan aplikasi.
- Pastikan karakter baris baru dan tanda `*` pada template tetap terjaga ketika pesan disalin.

## 11. Hal yang Perlu Dikonfirmasi

1. **Nilai tepat 40%:** kondisi tertulis `< 0.4`, sehingga tepat 40% masuk cabang FALSE dan menghitung harga jual baru. Pastikan ini sesuai aturan bisnis.
2. **Nilai pembulatan tepat 0,5:** diagram hanya menyebut `< 0.5xx` dan `> 0.5xx`, tidak menjelaskan nilai tepat 0,5.
3. **Variabel dasar pembulatan produk baru:** rumus memakai `modal.produk_baru`, tetapi catatan pembulatan menyebut `modal.baru`. Dokumen ini mengasumsikan keduanya merujuk pada modal produk baru yang sama.
4. **Urutan harga cabang FALSE:** rumus minimum adalah `modal.produk_baru * 1.2`, sedangkan maksimum berdasarkan rata-rata profit. Pastikan hasil minimum tidak lebih besar dari maksimum untuk data yang mungkin digunakan.
5. **Input modal nol:** rumus basis profit membagi dengan modal sampel dan modal lama. Flowchart tidak menentukan validasi nilai nol.
6. **Format tampilan:** flowchart tidak menentukan simbol mata uang, jumlah desimal, atau format tampilan angka. Contoh template WhatsApp menggunakan awalan `Rp` dan pemisah ribuan koma; samakan dengan format nominal yang dipakai aplikasi.
7. **Kontak WhatsApp:** contoh pesan ditujukan kepada Ko David. Gunakan nomor kontak manajemen yang sudah dikonfigurasi pada aplikasi; jangan mengarang atau mengganti nomor tujuan.
8. **Hasil produk lama yang memerlukan verifikasi:** template contoh produk lama memuat rekomendasi harga jual. Jika cabang kalkulasi menghasilkan warning manajemen, perlu dipastikan apakah pesan review khusus tetap dibuat dengan label bahwa harga masih menunggu verifikasi, atau pembuatan template ditahan sampai ada keputusan manajemen.

## 12. Skenario Pengujian Minimum

### Produk Lama
1. `basis.profit < 0.20`: langsung tulis `jual.baru`.
2. `basis.profit = 0.20`: lanjut ke pemeriksaan toleransi.
3. Profit di atas 20% dan kenaikan di bawah toleransi: pertahankan `jual.lama`.
4. Kenaikan sama dengan toleransi: pertahankan `jual.lama` karena operatornya `>`.
5. Kenaikan di atas toleransi dan `basis.profit < 0.4`: tulis `jual.baru`.
6. Kenaikan di atas toleransi dan `basis.profit = 0.4`: tampilkan warning.
7. Kenaikan di atas toleransi dan `basis.profit > 0.4`: tampilkan warning.
8. Pembulatan pada setiap rentang modal.
9. Form nama produk dan kode produk wajib diisi sebelum template dibuat.
10. Template menampilkan nilai modal dan harga sesuai hasil kalkulasi yang benar.
11. Warning manajemen tidak boleh ditampilkan sebagai harga rekomendasi final dalam template.

### Produk Baru
1. `avg.profit_sample < 0.20` (TRUE).
2. `avg.profit_sample = 0.20` (TRUE).
3. `avg.profit_sample > 0.20` (FALSE).
4. Verifikasi rumus ketiga hasil cabang FALSE.
5. Verifikasi rumus ketiga hasil cabang TRUE.
6. Pembulatan pada setiap rentang modal.
7. Salah satu modal sampel nol atau data sampel tidak lengkap.
8. Nama produk baru belum diisi.
9. Harga pengajuan belum dipilih.
10. Memilih masing-masing opsi minimum, median, dan maksimum; pastikan nilai pengajuan pada template berubah sesuai pilihan.
11. Pastikan template tetap menampilkan ketiga rekomendasi meskipun hanya satu yang dipilih sebagai pengajuan.
12. Pastikan pesan hasil generate dapat disalin dan format baris serta teks tebal tetap benar.

---
**Acuan utama:** `Flowchart Kalkulator Harga v.2.1.1.pdf`, halaman 1.

---

## 13. Fitur Template Pesan WhatsApp

### 13.1 Tujuan

Sistem menyediakan fitur untuk menyiapkan pesan WhatsApp secara otomatis berdasarkan hasil perhitungan harga. Pengguna tidak perlu menyalin pesan secara manual.

Ketika pengguna menekan tombol **Kirim Pesan WhatsApp**, sistem membuka WhatsApp (aplikasi atau WhatsApp Web sesuai perangkat/browser) dengan pesan yang sudah terisi pada kolom penulisan pesan. Pengguna tetap harus menekan tombol **Kirim** di WhatsApp secara manual.

Gunakan nomor tujuan manajemen yang telah ditentukan pada sistem:

```text
+6281315188603
```

Gunakan mekanisme tautan WhatsApp dengan parameter `text` yang di-URL-encode. Jangan mengirim pesan secara otomatis tanpa tindakan pengguna di WhatsApp.

### 13.2 Salam Otomatis Berdasarkan Waktu

Awal pesan harus menggunakan salam yang ditentukan otomatis berdasarkan waktu lokal perangkat pengguna:

| Rentang waktu | Salam |
|---|---|
| 00.00–10.59 | Pagi |
| 11.00–14.59 | Siang |
| 15.00–17.59 | Sore |
| 18.00–23.59 | Malam |

Format sapaan:

```text
Halo, [salam] Ko David, ...
```

Salam dihitung pada saat pesan WhatsApp disiapkan/dibuka, bukan disimpan sebagai teks statis. Gunakan waktu lokal perangkat/browser.

### 13.3 Template WhatsApp — Produk Lama

#### FR-WA-OLD-01 — Form Informasi Produk Lama

Sebelum tombol **Kirim Pesan WhatsApp** digunakan, sistem harus menyediakan form untuk mengisi:

- Nama produk.
- Kode produk.

Kedua informasi tersebut wajib diisi. Data harga lainnya diambil otomatis dari input dan hasil perhitungan produk lama yang sedang aktif; pengguna tidak perlu mengetik ulang.

#### FR-WA-OLD-02 — Isi Pesan Produk Lama

Pesan yang dibuka di WhatsApp harus mengikuti format berikut. Placeholder diganti dengan data aktual dari form dan hasil perhitungan.

```text
Halo, [salam] Ko David, saya mau meminta review perhitungan harga produk lama.

Nama produk: [nama_produk]
Kode produk: [kode_produk]

Modal lama: Rp [modal.lama]
Modal baru: Rp [modal.baru]
Kenaikan harga: Rp [kenaikan.harga]

Harga jual lama: Rp [jual.lama]
Rekomendasi harga jual: Rp [jual.baru]

Terima kasih.
```

Ketentuan:
- `[salam]` diisi otomatis berdasarkan waktu lokal.
- `nama_produk` dan `kode_produk` diambil dari form Produk Lama.
- `modal.lama`, `modal.baru`, dan `kenaikan.harga` diambil dari data perhitungan yang sedang aktif.
- `jual.lama` menampilkan harga jual sebelum kenaikan.
- `jual.baru` menampilkan hasil keputusan akhir Produk Lama yang akan ditulis sebagai harga jual baru.
- Semua nominal menggunakan format Rupiah dengan pemisah ribuan yang konsisten.
- Jika hasil keputusan Produk Lama adalah mempertahankan harga lama, rekomendasi harga jual harus menampilkan nilai `jual.lama`.
- Jika proses berakhir dengan warning verifikasi manajemen, jangan tampilkan atau kirim rekomendasi harga sebagai harga final yang telah disetujui. Tombol pengiriman pesan Produk Lama harus mengikuti status hasil perhitungan; untuk kondisi warning, tampilkan informasi bahwa verifikasi manajemen diperlukan dan jangan membuat pesan seolah-olah harga baru sudah final.

### 13.4 Template WhatsApp — Produk Baru

#### FR-WA-NEW-01 — Form Informasi dan Pengajuan Produk Baru

Setelah seluruh input Produk Baru lengkap dan perhitungan tiga sampel serta rekomendasi harga selesai, sistem menampilkan form tambahan yang berisi:

1. **Nama produk** — wajib diisi.
2. **Harga jual yang diajukan** — wajib dipilih dari salah satu rekomendasi harga yang dihasilkan sistem:
   - Harga Minimum.
   - Harga Median.
   - Harga Maksimum.

Pilihan harga harus menampilkan nominal hasil perhitungan yang sudah mengikuti aturan pembulatan. Pengguna hanya dapat memilih salah satu dari tiga rekomendasi aktif. Jangan menerima nominal pengajuan bebas di luar ketiga pilihan tersebut pada fitur ini.

#### FR-WA-NEW-02 — Isi Pesan Produk Baru

Pesan yang dibuka di WhatsApp harus mengikuti format berikut:

```text
Halo, [salam] Ko David. Saya ingin meminta review dan persetujuan harga untuk produk baru.

*INFORMASI PRODUK*
Nama produk: [nama_produk]

*INFORMASI MODAL*
Harga modal: Rp [modal.produk_baru]

*REKOMENDASI HARGA JUAL*
Berdasarkan hasil perhitungan rata-rata profit produk sampel, diperoleh rekomendasi:
1. Harga Minimum: Rp [harga_minimum]
2. Harga Median: Rp [harga_median]
3. Harga Maksimum: Rp [harga_maksimum]

*PENGAJUAN HARGA*
Dari ketiga rekomendasi tersebut, saya mengajukan harga jual sebesar *Rp [harga_diajukan]*.

Mohon review dan persetujuannya dari Ko David. Terima kasih.
```

Ketentuan:
- `[salam]` diisi otomatis berdasarkan waktu lokal.
- `nama_produk` diambil dari form Produk Baru.
- `modal.produk_baru` diambil dari input modal produk baru.
- Ketiga rekomendasi harga diambil dari cabang perhitungan yang aktif (TRUE atau FALSE), bukan mencampur variabel dari dua cabang.
- Ketiga nominal rekomendasi menampilkan hasil setelah pembulatan.
- `harga_diajukan` adalah satu pilihan yang dipilih pengguna dari Harga Minimum, Median, atau Maksimum.
- Format tebal WhatsApp menggunakan satu tanda bintang di awal dan akhir teks, misalnya `*INFORMASI PRODUK*` dan `*Rp 5.508.000*`.
- Pesan tidak boleh memuat placeholder, nilai `undefined`, `null`, atau format angka yang tidak valid.

### 13.5 FR-WA-03 — Membuka WhatsApp dengan Pesan Terisi

Ketika pengguna menekan tombol **Kirim Pesan WhatsApp**:

1. Validasi seluruh field wajib pada form terkait.
2. Pastikan hasil perhitungan yang diperlukan tersedia dan valid.
3. Bentuk isi pesan sesuai template Produk Lama atau Produk Baru.
4. Tentukan salam berdasarkan waktu lokal saat tombol ditekan.
5. Encode seluruh isi pesan sebagai parameter URL WhatsApp.
6. Buka tautan WhatsApp menuju nomor `+6281315188603` dengan isi pesan yang sudah terisi.
7. Pengguna meninjau pesan dan mengirimkannya sendiri melalui WhatsApp.

Sistem tidak boleh hanya menampilkan pesan untuk disalin, tidak boleh mengandalkan clipboard sebagai alur utama, dan tidak boleh mengirim pesan otomatis tanpa konfirmasi pengguna di WhatsApp.

### 13.6 Validasi dan Perilaku UI

- Tombol WhatsApp tidak dapat digunakan jika field wajib belum lengkap.
- Tampilkan validasi yang jelas pada Nama Produk, Kode Produk (khusus Produk Lama), dan pilihan Harga Pengajuan (khusus Produk Baru).
- Untuk Produk Baru, tombol WhatsApp aktif setelah nama produk diisi dan satu rekomendasi harga dipilih.
- Untuk Produk Lama, tombol WhatsApp aktif setelah nama produk dan kode produk diisi serta hasil perhitungan menghasilkan harga yang boleh diajukan.
- Jika data perhitungan berubah setelah form diisi, pesan harus dibentuk ulang dari data perhitungan terbaru. Jangan menggunakan hasil lama yang sudah tidak sesuai.
- Jangan mengubah rumus, ambang, atau hasil perhitungan hanya untuk membentuk pesan.
- Pastikan tampilan pesan tetap rapi di WhatsApp, termasuk baris kosong dan format tebal.

### 13.7 Kriteria Penerimaan Fitur WhatsApp

- [ ] Produk Lama memiliki form Nama Produk dan Kode Produk.
- [ ] Produk Baru memiliki form Nama Produk.
- [ ] Produk Baru mengharuskan pengguna memilih tepat satu dari Minimum, Median, atau Maksimum.
- [ ] Salam Pagi/Siang/Sore/Malam terisi otomatis berdasarkan waktu lokal.
- [ ] Template Produk Lama memuat data produk, modal lama, modal baru, kenaikan harga, harga jual lama, dan rekomendasi harga jual.
- [ ] Template Produk Baru memuat nama produk, modal, ketiga rekomendasi harga, dan harga yang diajukan.
- [ ] Pesan menggunakan hasil perhitungan dan pembulatan terbaru.
- [ ] Tombol membuka WhatsApp dengan teks sudah terisi pada kolom pesan.
- [ ] Pengguna tetap mengirim pesan secara manual melalui WhatsApp.
- [ ] Tidak ada placeholder atau nilai kosong yang tidak semestinya di dalam pesan.
- [ ] Kondisi warning Produk Lama tidak menghasilkan pesan yang menyatakan rekomendasi sebagai harga final.

### 13.8 Skenario Pengujian Fitur WhatsApp

1. Uji salam otomatis pada rentang pagi, siang, sore, dan malam.
2. Uji Produk Lama dengan nama produk dan kode produk lengkap.
3. Uji validasi jika nama produk Produk Lama kosong.
4. Uji validasi jika kode produk Produk Lama kosong.
5. Uji isi pesan Produk Lama ketika harga jual baru dihitung.
6. Uji isi pesan Produk Lama ketika harga jual lama dipertahankan.
7. Uji bahwa kondisi warning Produk Lama tidak menawarkan pesan harga final.
8. Uji Produk Baru dengan pilihan Harga Minimum.
9. Uji Produk Baru dengan pilihan Harga Median.
10. Uji Produk Baru dengan pilihan Harga Maksimum.
11. Uji bahwa hanya satu rekomendasi dapat dipilih sebagai harga pengajuan.
12. Uji bahwa ketiga rekomendasi pada pesan berasal dari cabang perhitungan yang aktif.
13. Uji format Rupiah dan format tebal WhatsApp.
14. Uji bahwa tombol membuka WhatsApp dengan pesan terisi, bukan sekadar menyalin teks.
15. Uji perubahan hasil perhitungan setelah form pesan diisi agar pesan menggunakan data terbaru.

