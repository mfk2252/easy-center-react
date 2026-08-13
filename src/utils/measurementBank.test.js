import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SCALE_LIBRARY,
  buildAssessmentResult,
  getScaleById,
  groupScalesByCategory,
} from './measurementBank.js';

test('default scale library includes autism and speech categories', () => {
  assert.ok(DEFAULT_SCALE_LIBRARY.length >= 3);
  const names = DEFAULT_SCALE_LIBRARY.map(scale => scale.name);
  assert.ok(names.includes('كارز (CARS-2)'));
  assert.ok(names.includes('سجل ملاحظات النطق'));
});

test('buildAssessmentResult calculates total and percentage using the correct CARS scoring range', () => {
  const scale = getScaleById('cars');
  const result = buildAssessmentResult(scale, {
    c1: 2,
    c2: 3,
    c3: 1,
    c4: 4,
    c5: 1,
    c6: 2,
    c7: 3,
    c8: 2,
    c9: 3,
    c10: 1,
    c11: 2,
    c12: 3,
    c13: 4,
    c14: 2,
    c15: 1,
  });

  assert.equal(scale.maxScore, 60);
  assert.equal(result.total, 34);
  assert.equal(result.percentage, 56.7);
  assert.equal(result.level, 'بسيط إلى متوسط التوحد');
});

test('groupScalesByCategory groups all scales by their category', () => {
  const grouped = groupScalesByCategory(DEFAULT_SCALE_LIBRARY);

  assert.ok(grouped.autism.some(scale => scale.id === 'cars'));
  assert.equal(grouped.autism.length, 3);
  assert.equal(grouped.speech.length, 1);
  assert.equal(grouped.learning.length, 1);
  assert.equal(grouped.other.length, 0);
});
