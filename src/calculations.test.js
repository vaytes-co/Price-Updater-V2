import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNewProductPrices,
  calculateOldProduct,
  roundNewProductPrice,
  roundOldProductPrice,
} from './calculations.js';

test('old products recalculate profit below 20 percent regardless of tolerance', () => {
  const result = calculateOldProduct({ modalBaru: 101_000, kenaikan: 1_000, jualLama: 119_000 });

  assert.equal(result.status, 'ready');
  assert.equal(result.profit, 0.19);
  assert.equal(result.price, 120_000);
});

test('old products retain their price when increase equals the 2 percent tolerance', () => {
  const result = calculateOldProduct({ modalBaru: 102_000, kenaikan: 2_000, jualLama: 120_000 });

  assert.equal(result.status, 'ready');
  assert.equal(result.profit, 0.2);
  assert.equal(result.unchanged, true);
  assert.equal(result.price, 120_000);
});

test('old products require management verification above tolerance when profit is below 40 percent', () => {
  const result = calculateOldProduct({ modalBaru: 103_000, kenaikan: 3_000, jualLama: 139_900 });

  assert.equal(result.status, 'warning');
  assert.match(result.message, /verifikasi tambahan dari pihak Manajemen/);
  assert.equal(result.whatsappUrl, 'https://wa.me/+6281315188603');
});

test('old products recalculate at exactly 40 percent profit when increase exceeds tolerance', () => {
  const result = calculateOldProduct({ modalBaru: 103_000, kenaikan: 3_000, jualLama: 140_000 });

  assert.equal(result.status, 'ready');
  assert.equal(result.profit, 0.4);
  assert.equal(result.price, 144_000);
});

test('old products recalculate above 40 percent profit when increase exceeds tolerance', () => {
  const result = calculateOldProduct({ modalBaru: 103_000, kenaikan: 3_000, jualLama: 141_000 });

  assert.equal(result.status, 'ready');
  assert.equal(result.price, 145_000);
});

test('old product increase must remain below the new modal to keep the old modal positive', () => {
  const equalResult = calculateOldProduct({ modalBaru: 10_000, kenaikan: 10_000, jualLama: 50_000 });
  const greaterResult = calculateOldProduct({ modalBaru: 10_000, kenaikan: 10_001, jualLama: 50_000 });

  assert.equal(equalResult.status, 'invalid');
  assert.equal(greaterResult.status, 'invalid');
  assert.match(equalResult.message, /modal lama tetap di atas Rp 0/);
});

test('old product rounding uses units based on the new modal, including one million', () => {
  assert.equal(roundOldProductPrice(1_234, 999), 1_230);
  assert.equal(roundOldProductPrice(1_234, 1_000), 1_200);
  assert.equal(roundOldProductPrice(123_456, 100_000), 123_000);
  assert.equal(roundOldProductPrice(1_234_567, 1_000_000), 1_230_000);
});

test('new products below 20 percent use the TRUE median-based bounds', () => {
  const samples = Array.from({ length: 3 }, () => ({ buy: 100, sell: 110 }));
  const result = calculateNewProductPrices(10_000, samples);

  assert.ok(Math.abs(result.avgProfit - 0.1) < Number.EPSILON);
  assert.equal(result.branch, 'TRUE');
  assert.equal(result.min, 10_800);
  assert.equal(result.med, 11_000);
  assert.equal(result.max, 11_200);
  assert.equal(result.jual_min_TRUE, result.min);
  assert.equal(result.jual_med_TRUE, result.med);
  assert.equal(result.jual_max_TRUE, result.max);
});

test('new products at exactly 20 percent use the TRUE median-based bounds', () => {
  const samples = Array.from({ length: 3 }, () => ({ buy: 100, sell: 120 }));
  const result = calculateNewProductPrices(10_000, samples);

  assert.ok(Math.abs(result.avgProfit - 0.2) < Number.EPSILON);
  assert.equal(result.branch, 'TRUE');
  assert.equal(result.min, 11_800);
  assert.equal(result.med, 12_000);
  assert.equal(result.max, 12_200);
});

test('new products above 20 percent use the FALSE 20 percent minimum formula', () => {
  const samples = Array.from({ length: 3 }, () => ({ buy: 100, sell: 130 }));
  const result = calculateNewProductPrices(10_000, samples);

  assert.equal(result.avgProfit, 0.3);
  assert.equal(result.branch, 'FALSE');
  assert.equal(result.min, 12_000);
  assert.equal(result.med, 12_500);
  assert.equal(result.max, 13_000);
  assert.equal(result.jual_min_FALSE, result.min);
  assert.equal(result.jual_med_FALSE, result.med);
  assert.equal(result.jual_max_FALSE, result.max);
});

test('new product calculations reject zero modal and invalid sample data', () => {
  const samples = Array.from({ length: 3 }, () => ({ buy: 100, sell: 120 }));

  assert.equal(calculateNewProductPrices(0, samples).status, 'invalid');
  assert.equal(calculateNewProductPrices(10_000, [{ buy: 0, sell: 120 }, ...samples.slice(1)]).status, 'invalid');
  assert.equal(calculateNewProductPrices(10_000, samples.slice(1)).status, 'invalid');
});

test('new product rounding uses the new-product modal ranges', () => {
  assert.equal(roundNewProductPrice(1_234, 999), 1_230);
  assert.equal(roundNewProductPrice(1_234, 1_000), 1_200);
  assert.equal(roundNewProductPrice(123_456, 100_000), 123_000);
});
