import { roundOldProductPrice } from './calculations.js';

const formatRupiah = value => `Rp ${new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 0,
}).format(value)}`;

export function getIndonesianTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 4 && hour < 11) return 'pagi';
  if (hour >= 11 && hour < 15) return 'siang';
  if (hour >= 15 && hour < 18) return 'sore';
  return 'malam';
}

export function createManagementReviewMessage({ productName, productBrand, modalLama, modalBaru, kenaikan, jualLama, profit, date = new Date() }) {
  const proposedPrice = roundOldProductPrice((1 + profit) * modalBaru, modalBaru);

  return [
    `Halo, ${getIndonesianTimeGreeting(date)} Ko David, saya mau meminta review perhitungan harga produk lama.`,
    '',
    `Nama produk: ${productName}`,
    `Merek produk: ${productBrand}`,
    `Modal lama: ${formatRupiah(modalLama)}`,
    `Modal baru: ${formatRupiah(modalBaru)}`,
    `Kenaikan modal: ${formatRupiah(kenaikan)}`,
    `Harga jual lama: ${formatRupiah(jualLama)}`,
    `Rekomendasi harga jual: ${formatRupiah(proposedPrice)}`,
    '',
    'Terima kasih.',
  ].join('\n');
}
