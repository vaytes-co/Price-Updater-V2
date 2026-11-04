import { MANAGEMENT_WHATSAPP_URL } from './calculations.js';

const formatRupiah = value => `Rp ${new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
}).format(value)}`;

export function getIndonesianTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 11) return 'pagi';
  if (hour < 15) return 'siang';
  if (hour < 18) return 'sore';
  return 'malam';
}

export function createManagementReviewMessage({ productName, productCode, modalLama, modalBaru, kenaikan, jualLama, hargaRekomendasi, verificationRequired = false, date = new Date() }) {
  return [
    `Halo, ${getIndonesianTimeGreeting(date)} Ko David, saya mau meminta review perhitungan harga produk lama.`,
    '',
    `Nama produk: ${productName}`,
    `Kode produk: ${productCode}`,
    '',
    `Modal lama: ${formatRupiah(modalLama)}`,
    `Modal baru: ${formatRupiah(modalBaru)}`,
    `Kenaikan harga: ${formatRupiah(kenaikan)}`,
    '',
    `Harga jual lama: ${formatRupiah(jualLama)}`,
    '',
    verificationRequired
      ? 'Apakah ada perubahan harga jual?'
      : `Rekomendasi harga jual: ${formatRupiah(hargaRekomendasi)}`,
    '',
    'Terima kasih.',
  ].join('\n');
}

export function createNewProductManagementReviewMessage({ productName, modalProdukBaru, hargaMinimum, hargaMedian, hargaMaksimum, hargaDiajukan, date = new Date() }) {
  return [
    `Halo, ${getIndonesianTimeGreeting(date)} Ko David. Saya ingin meminta review dan persetujuan harga untuk produk baru.`,
    '',
    '*INFORMASI PRODUK*',
    `Nama produk: ${productName}`,
    '',
    '*INFORMASI MODAL*',
    `Harga modal: ${formatRupiah(modalProdukBaru)}`,
    '',
    '*REKOMENDASI HARGA JUAL*',
    'Berdasarkan hasil perhitungan rata-rata profit produk sampel, diperoleh rekomendasi:',
    '',
    `1. Harga Minimum: ${formatRupiah(hargaMinimum)}`,
    `2. Harga Median: ${formatRupiah(hargaMedian)}`,
    `3. Harga Maksimum: ${formatRupiah(hargaMaksimum)}`,
    '',
    '*PENGAJUAN HARGA*',
    `Dari ketiga rekomendasi tersebut, saya mengajukan harga jual sebesar *${formatRupiah(hargaDiajukan)}*.`,
    '',
    'Mohon review dan persetujuannya dari Ko David. Terima kasih.',
  ].join('\n');
}

export function createManagementWhatsAppUrl(message) {
  return `${MANAGEMENT_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}
