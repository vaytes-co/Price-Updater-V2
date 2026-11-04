import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createManagementReviewMessage,
  createNewProductManagementReviewMessage,
  createManagementWhatsAppUrl,
  getIndonesianTimeGreeting,
} from './whatsapp.js';

test('Indonesian WhatsApp greeting follows the time of day', () => {
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 0)), 'pagi');
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 8)), 'pagi');
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 10)), 'pagi');
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 12)), 'siang');
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 14)), 'siang');
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 16)), 'sore');
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 17)), 'sore');
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 20)), 'malam');
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 23)), 'malam');
});

test('management review message includes inputs, proposed price, and time-based greeting', () => {
  const message = createManagementReviewMessage({
    productName: 'Produk Contoh',
    productCode: 'KODE-123',
    modalLama: 5_000,
    modalBaru: 10_000,
    kenaikan: 5_000,
    jualLama: 50_000,
    hargaRekomendasi: 100_000,
    date: new Date(2026, 0, 1, 8),
  });

  assert.equal(message, [
    'Halo, pagi Ko David, saya mau meminta review perhitungan harga produk lama.',
    '',
    'Nama produk: Produk Contoh',
    'Kode produk: KODE-123',
    '',
    'Modal lama: Rp 5,000',
    'Modal baru: Rp 10,000',
    'Kenaikan harga: Rp 5,000',
    '',
    'Harga jual lama: Rp 50,000',
    'Rekomendasi harga jual: Rp 100,000',
    '',
    'Terima kasih.',
  ].join('\n'));
});

test('management verification message does not present an unapproved price as final', () => {
  const message = createManagementReviewMessage({
    productName: 'Produk Contoh',
    productCode: 'KODE-123',
    modalLama: 100_000,
    modalBaru: 103_000,
    kenaikan: 3_000,
    jualLama: 140_000,
    verificationRequired: true,
    date: new Date(2026, 0, 1, 8),
  });

  assert.match(message, /Rekomendasi harga jual: Menunggu verifikasi manajemen\./);
  assert.doesNotMatch(message, /Rekomendasi harga jual: Rp/);
  assert.doesNotMatch(message, /NaN|undefined|null/);
});

test('new product management message includes product details, recommendations, and proposed price', () => {
  const message = createNewProductManagementReviewMessage({
    productName: 'Produk Baru',
    modalProdukBaru: 10_000,
    hargaMinimum: 12_000,
    hargaMedian: 12_500,
    hargaMaksimum: 13_000,
    hargaDiajukan: 12_500,
    date: new Date(2026, 0, 1, 8),
  });

  assert.equal(message, [
    'Halo, pagi Ko David. Saya ingin meminta review dan persetujuan harga untuk produk baru.',
    '',
    '*INFORMASI PRODUK*',
    'Nama produk: Produk Baru',
    '',
    '*INFORMASI MODAL*',
    'Harga modal: Rp 10,000',
    '',
    '*REKOMENDASI HARGA JUAL*',
    'Berdasarkan hasil perhitungan rata-rata profit produk sampel, diperoleh rekomendasi:',
    '',
    '1. Harga Minimum: Rp 12,000',
    '2. Harga Median: Rp 12,500',
    '3. Harga Maksimum: Rp 13,000',
    '',
    '*PENGAJUAN HARGA*',
    'Dari ketiga rekomendasi tersebut, saya mengajukan harga jual sebesar *Rp 12,500*.',
    '',
    'Mohon review dan persetujuannya dari Ko David. Terima kasih.',
  ].join('\n'));
});

test('management WhatsApp URL encodes the complete message', () => {
  const message = 'Harga baru Rp 12,500';

  assert.equal(
    createManagementWhatsAppUrl(message),
    `https://wa.me/+6281315188603?text=${encodeURIComponent(message)}`,
  );
});
