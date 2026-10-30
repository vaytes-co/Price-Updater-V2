const MANAGEMENT_MESSAGE = 'Perubahan harga memerlukan verifikasi tambahan dari pihak Manajemen. Harap hubungi pimpinan perusahaan.';
const MANAGEMENT_WHATSAPP_URL = 'https://wa.me/+6281315188603';

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
    return calculateUpdatedPrice();
  }

  return {
    ...result,
    status: 'warning',
    message: MANAGEMENT_MESSAGE,
    whatsappUrl: MANAGEMENT_WHATSAPP_URL,
  };
}

export function calculateNewProductPrices(modal, samples) {
  const sampleProfits = samples.map(({ buy, sell }) => (sell - buy) / buy);
  const avgProfit = sampleProfits.reduce((sum, profit) => sum + profit, 0) / sampleProfits.length;

  if (!Number.isFinite(avgProfit)) {
    return { status: 'invalid', message: 'Data menghasilkan perhitungan yang tidak valid.' };
  }

  let min;
  let med;
  let max;

  if (avgProfit < 0.20) {
    min = modal * 1.2;
    max = (1 + avgProfit) * modal;
    med = (min + max) / 2;
  } else {
    med = (1 + avgProfit) * modal;
    min = med * 0.98;
    max = med * 1.02;
  }

  if (![min, med, max].every(Number.isFinite)) {
    return { status: 'invalid', message: 'Data menghasilkan perhitungan yang tidak valid.' };
  }

  return {
    status: 'ready',
    modal,
    avgProfit,
    min: roundNewProductPrice(min, modal),
    med: roundNewProductPrice(med, modal),
    max: roundNewProductPrice(max, modal),
    price: roundNewProductPrice(med, modal),
    samples,
  };
}
