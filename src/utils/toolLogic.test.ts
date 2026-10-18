import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePercentages,
  calculateLoanEMI,
  calculateDateDifference,
  calculateDiscount,
  calculateVatTax,
  calculateAverageStats,
  evaluateBasicExpression,
  convertMeasurement,
  csvToJson,
  jsonToCsv,
  encodeDecodeText,
  analyzeTextMetrics,
  convertTextCase,
  processTextLines,
  computeLineDiff,
  formatAndValidateJson,
  parsePageRangeString,
} from './toolLogic.ts';

test('calculatePercentages computes accurate percentage metrics', () => {
  const res = calculatePercentages(25, 200);
  assert.equal(res.percentOfValue, 50); // 25% of 200 = 50
  assert.equal(res.isWhatPercent, 12.5); // 25 is 12.5% of 200
  assert.equal(res.percentChange, 700); // from 25 to 200 is +700%
});

test('calculateLoanEMI computes accurate monthly payment and interest', () => {
  const res = calculateLoanEMI(100000, 6, 120); // $100k, 6% APR, 10 years
  assert.equal(res.monthlyPayment, 1110.21);
  assert.equal(res.schedulePreview.length, 12);
  assert.ok(res.totalInterest > 33000);
});

test('calculateDateDifference computes total days and working days', () => {
  const res = calculateDateDifference('2026-10-01', '2026-10-15', false);
  assert.equal(res.totalDays, 14);
  assert.equal(res.totalWeeks, 2);
  assert.equal(res.workingDays, 10);
  assert.equal(res.weekendDays, 4);
});

test('calculateDiscount and calculateVatTax compute accurate financial values', () => {
  const disc = calculateDiscount(200, 20, 10, 5);
  // 200 -> -20% = 160 -> -10% = 144 -> +5% tax = 151.2
  assert.equal(disc.amountSaved, 56);
  assert.equal(disc.finalPrice, 151.2);
  assert.equal(disc.effectiveDiscountPercent, 28);

  const vatEx = calculateVatTax(100, 20, 'exclusive');
  assert.equal(vatEx.grossAmount, 120);
  const vatInc = calculateVatTax(120, 20, 'inclusive');
  assert.equal(vatInc.netAmount, 100);
  assert.equal(vatInc.vatAmount, 20);
});

test('calculateAverageStats and evaluateBasicExpression work reliably', () => {
  const stats = calculateAverageStats([10, 20, 30, 40, 100]);
  assert.equal(stats.count, 5);
  assert.equal(stats.mean, 40);
  assert.equal(stats.median, 30);
  assert.equal(stats.range, 90);

  const expr = evaluateBasicExpression('(15 + 25) * 2 - 10 / 2');
  assert.equal(expr.result, 75);
});

test('convertMeasurement handles length, weight, and temperature accurately', () => {
  assert.equal(convertMeasurement(1, 'length', 'km', 'm'), 1000);
  assert.equal(convertMeasurement(100, 'temperature', 'c', 'f'), 212);
  assert.equal(convertMeasurement(32, 'temperature', 'f', 'c'), 0);
  assert.equal(convertMeasurement(1, 'storage', 'gib', 'mib'), 1024);
});

test('CSV and JSON converters roundtrip cleanly', () => {
  const csv = 'name,score,active\nAlice,95,true\nBob,82,false';
  const toJson = csvToJson(csv);
  assert.equal(toJson.rowCount, 2);
  const parsed = JSON.parse(toJson.json);
  assert.equal(parsed[0].name, 'Alice');
  assert.equal(parsed[0].score, 95);
  assert.equal(parsed[0].active, true);

  const backToCsv = jsonToCsv(toJson.json);
  assert.equal(backToCsv.rowCount, 2);
  assert.ok(backToCsv.csv.includes('Alice,95,true'));
});

test('encodeDecodeText handles UTF-8 Base64 and URL encoding', () => {
  const encoded = encodeDecodeText('VibeDesk — Calm Workspace', 'base64-encode');
  const decoded = encodeDecodeText(encoded.output, 'base64-decode');
  assert.equal(decoded.output, 'VibeDesk — Calm Workspace');
});

test('text utilities analyze, convert case, deduplicate, and diff lines', () => {
  const metrics = analyzeTextMetrics('Hello world. Welcome to VibeDesk.');
  assert.equal(metrics.words, 5);
  assert.equal(metrics.sentences, 2);

  assert.equal(convertTextCase('hello world utility', 'camelcase'), 'helloWorldUtility');
  assert.equal(convertTextCase('hello world utility', 'kebabcase'), 'hello-world-utility');

  const dedup = processTextLines('apple\nbanana\napple\ncherry', {
    removeDuplicates: true,
    sortMode: 'asc',
  });
  assert.equal(dedup.finalCount, 3);
  assert.equal(dedup.output, 'apple\nbanana\ncherry');

  const diff = computeLineDiff('line1\nline2\nline3', 'line1\nline2-modified\nline3');
  assert.equal(diff.unchangedCount, 2);
  assert.equal(diff.addedCount, 1);
  assert.equal(diff.removedCount, 1);
});

test('formatAndValidateJson and parsePageRangeString validate inputs', () => {
  const validJson = formatAndValidateJson('{"a":1,"b":[2,3]}', 2);
  assert.equal(validJson.valid, true);
  assert.ok(validJson.formatted.includes('\n'));

  const range = parsePageRangeString('1-3, 5', 6);
  assert.deepEqual(range.pages, [0, 1, 2, 4]);
});
