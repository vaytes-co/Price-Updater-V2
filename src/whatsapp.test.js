import test from 'node:test';
import assert from 'node:assert/strict';
import { createManagementReviewMessage, getIndonesianTimeGreeting } from './whatsapp.js';

test('Indonesian WhatsApp greeting follows the time of day', () => {
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 8)), 'pagi');
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 12)), 'siang');
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 16)), 'sore');
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 20)), 'malam');
});

test('management review message includes inputs, proposed price, and time-based greeting', () => {
  const message = createManagementReviewMessage({
    productName: 'Produk Contoh',
    productCode: 'KODE-123',
    modalLama: 5_000,
    modalBaru: 10_000,
    kenaikan: 5_000,
    jualLama: 50_000,
    profit: 9,
    date: new Date(2026, 0, 1, 8),
  });

  assert.equal(message, [
    'Halo, pagi Ko David, saya mau meminta review perhitungan harga produk lama.',
    '',
    'Nama produk: Produk Contoh',
    'Kode produk: KODE-123',
    '',
    'Modal lama: Rp 5.000',
    'Modal baru: Rp 10.000',
    'Kenaikan harga: Rp 5.000',
    '',
    'Harga jual lama: Rp 50.000',
    'Rekomendasi harga jual: Rp 100.000',
    '',
    'Terima kasih.',
  ].join('\n'));
});
