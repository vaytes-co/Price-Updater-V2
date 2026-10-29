import test from 'node:test';
import assert from 'node:assert/strict';
import { createManagementReviewMessage, getIndonesianTimeGreeting } from './whatsapp.js';

test('Indonesian WhatsApp greeting follows the time of day', () => {
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 8)), 'pagi');
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 12)), 'siang');
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 16)), 'sore');
  assert.equal(getIndonesianTimeGreeting(new Date(2026, 0, 1, 20)), 'malam');
});

test('management review message includes inputs, proposed price, and thanks', () => {
  const message = createManagementReviewMessage({
    productName: 'Produk Contoh',
    productBrand: 'Merek Contoh',
    modalLama: 5_000,
    modalBaru: 10_000,
    kenaikan: 5_000,
    jualLama: 50_000,
    profit: 9,
    date: new Date(2026, 0, 1, 9),
  });

  assert.match(message, /^Halo, pagi Ko David, saya mau meminta review perhitungan harga produk lama\./);
  assert.match(message, /Nama produk: Produk Contoh/);
  assert.match(message, /Merek produk: Merek Contoh/);
  assert.match(message, /Modal lama: Rp 5\.000/);
  assert.match(message, /Modal baru: Rp 10\.000/);
  assert.match(message, /Kenaikan modal: Rp 5\.000/);
  assert.match(message, /Harga jual lama: Rp 50\.000/);
  assert.match(message, /Rekomendasi harga jual \(menunggu review\): Rp 100\.000/);
  assert.ok(message.endsWith('Terima kasih.'));
});
