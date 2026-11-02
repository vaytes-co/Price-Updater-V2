const MANAGEMENT_MESSAGE = 'Perubahan harga memerlukan verifikasi tambahan dari pihak Manajemen. Harap hubungi pimpinan perusahaan.';
export const MANAGEMENT_WHATSAPP_URL = 'https://wa.me/+6281315188603';

function roundToUnit(value, unit) {
  return Math.round(value / unit) * unit;
}

export function roundOldProductPrice(value, modalBaru) {
  const unit = modalBaru < 1_000
    ? 10
    : modalBaru < 100_000
      ? 100
      : modalBaru < 1_000_000
        ? 1_000
        : 10_000;

  return roundToUnit(value, unit);
}

export function roundNewProductPrice(value, modal) {
  const unit = modal < 1_000 ? 10 : modal < 100_000 ? 100 : 1_000;
  return roundToUnit(value, unit);
}

export function calculateOldProduct({ modalBaru, kenaikan, jualLama }) {
  const modalLama = modalBaru - kenaikan;
  const profit = (jualLama - modalLama) / modalLama;
  const toleransi = 0.02 * modalLama;

  if (Number.isFinite(modalLama) && modalLama <= 0) {
    return { status: 'invalid', message: 'Harga modal baru harus lebih besar daripada kenaikan harga agar modal lama tetap di atas Rp 0.' };
  }

  if (![modalLama, profit, toleransi].every(Number.isFinite)) {
    return { status: 'invalid', message: 'Data menghasilkan perhitungan yang tidak valid.' };
  }

  const result = { modalLama, profit, toleransi, kenaikan };
  const calculateUpdatedPrice = () => {
    const raw = (1 + profit) * modalBaru;
    if (!Number.isFinite(raw)) {
      return { status: 'invalid', message: 'Data menghasilkan perhitungan yang tidak valid.' };
    }

    return {
      ...result,
      status: 'ready',
      price: roundOldProductPrice(raw, modalBaru),
      raw,
      unchanged: false,
    };
  };

  if (profit < 0.20) {
    return calculateUpdatedPrice();
  }

  if (kenaikan <= toleransi) {
    return { ...result, status: 'ready', price: jualLama, raw: jualLama, unchanged: true };
  }

  if (profit < 0.40) {
    return {
      ...result,
      status: 'warning',
      message: MANAGEMENT_MESSAGE,
      whatsappUrl: MANAGEMENT_WHATSAPP_URL,
    };
  }

  return calculateUpdatedPrice();
}

export function calculateNewProductPrices(modalProdukBaru, samples) {
  if (!Number.isFinite(modalProdukBaru) || modalProdukBaru <= 0 || !Array.isArray(samples) || samples.length !== 3) {
    return { status: 'invalid', message: 'Masukkan modal produk baru dan data tepat tiga sampel yang valid.' };
  }

  if (samples.some(sample => !sample || !Number.isFinite(sample.buy) || !Number.isFinite(sample.sell) || sample.buy <= 0 || sample.sell <= 0)) {
    return { status: 'invalid', message: 'Modal dan harga jual setiap produk sampel harus lebih besar dari Rp 0.' };
  }

  const sampleProfits = samples.map(({ buy, sell }) => (sell - buy) / buy);
  const avgProfit = sampleProfits.reduce((sum, profit) => sum + profit, 0) / sampleProfits.length;

  if (!Number.isFinite(avgProfit)) {
    return { status: 'invalid', message: 'Data menghasilkan perhitungan yang tidak valid.' };
  }

  let branch;
  let min;
  let med;
  let max;

  if (avgProfit <= 0.20 + Number.EPSILON / 4) {
    branch = 'TRUE';
    med = (1 + avgProfit) * modalProdukBaru;
    min = med * 0.98;
    max = med * 1.02;
  } else {
    branch = 'FALSE';
    min = modalProdukBaru * 1.2;
    max = (1 + avgProfit) * modalProdukBaru;
    med = (min + max) / 2;
  }

  if (![min, med, max].every(Number.isFinite)) {
    return { status: 'invalid', message: 'Data menghasilkan perhitungan yang tidak valid.' };
  }

  const jualMin = roundNewProductPrice(min, modalProdukBaru);
  const jualMed = roundNewProductPrice(med, modalProdukBaru);
  const jualMax = roundNewProductPrice(max, modalProdukBaru);

  return {
    status: 'ready',
    branch,
    modalProdukBaru,
    avgProfit,
    min: jualMin,
    med: jualMed,
    max: jualMax,
    price: jualMed,
    ...(branch === 'TRUE'
      ? {
          jual_min_TRUE: jualMin,
          jual_med_TRUE: jualMed,
          jual_max_TRUE: jualMax,
        }
      : {
          jual_min_FALSE: jualMin,
          jual_med_FALSE: jualMed,
          jual_max_FALSE: jualMax,
        }),
    samples,
  };
}
