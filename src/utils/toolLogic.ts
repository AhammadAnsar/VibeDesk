/**
 * Pure calculation and conversion logic for VibeDesk utilities.
 * Self-contained for deterministic unit testing and client-side processing.
 */

// ==========================================
// 1. CALCULATORS LOGIC
// ==========================================

export interface PercentageResult {
  percentOfValue: number; // What is X% of Y?
  isWhatPercent: number;  // X is what % of Y?
  percentChange: number;  // % change from X to Y
  percentDifference: number; // |X - Y| / ((X + Y)/2) * 100
}

export function calculatePercentages(x: number, y: number): PercentageResult {
  const percentOfValue = (x / 100) * y;
  const isWhatPercent = y !== 0 ? (x / y) * 100 : 0;
  const percentChange = x !== 0 ? ((y - x) / Math.abs(x)) * 100 : 0;
  const avg = (Math.abs(x) + Math.abs(y)) / 2;
  const percentDifference = avg !== 0 ? (Math.abs(x - y) / avg) * 100 : 0;

  return {
    percentOfValue: Number(percentOfValue.toFixed(6)),
    isWhatPercent: Number(isWhatPercent.toFixed(6)),
    percentChange: Number(percentChange.toFixed(6)),
    percentDifference: Number(percentDifference.toFixed(6)),
  };
}

export interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principalRatio: number;
  interestRatio: number;
  schedulePreview: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export function calculateLoanEMI(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number
): LoanResult {
  if (principal <= 0 || tenureMonths <= 0) {
    return {
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      principalRatio: 0,
      interestRatio: 0,
      schedulePreview: [],
    };
  }

  if (annualRatePercent <= 0) {
    const monthly = principal / tenureMonths;
    return {
      monthlyPayment: Number(monthly.toFixed(2)),
      totalPayment: Number(principal.toFixed(2)),
      totalInterest: 0,
      principalRatio: 100,
      interestRatio: 0,
      schedulePreview: Array.from({ length: Math.min(12, tenureMonths) }, (_, i) => ({
        month: i + 1,
        payment: Number(monthly.toFixed(2)),
        principal: Number(monthly.toFixed(2)),
        interest: 0,
        balance: Number(Math.max(0, principal - monthly * (i + 1)).toFixed(2)),
      })),
    };
  }

  const r = annualRatePercent / 12 / 100;
  const n = tenureMonths;
  const factor = Math.pow(1 + r, n);
  const emi = (principal * r * factor) / (factor - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - principal;

  const schedulePreview = [];
  let balance = principal;
  const previewMonths = Math.min(12, n);
  for (let m = 1; m <= previewMonths; m++) {
    const interestForMonth = balance * r;
    const principalForMonth = emi - interestForMonth;
    balance = Math.max(0, balance - principalForMonth);
    schedulePreview.push({
      month: m,
      payment: Number(emi.toFixed(2)),
      principal: Number(principalForMonth.toFixed(2)),
      interest: Number(interestForMonth.toFixed(2)),
      balance: Number(balance.toFixed(2)),
    });
  }

  return {
    monthlyPayment: Number(emi.toFixed(2)),
    totalPayment: Number(totalPayment.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    principalRatio: Number(((principal / totalPayment) * 100).toFixed(1)),
    interestRatio: Number(((totalInterest / totalPayment) * 100).toFixed(1)),
    schedulePreview,
  };
}

export interface DateDifferenceResult {
  totalDays: number;
  years: number;
  months: number;
  days: number;
  totalWeeks: number;
  remainingDaysAfterWeeks: number;
  workingDays: number;
  weekendDays: number;
  totalHours: number;
}

export function calculateDateDifference(startIso: string, endIso: string, includeEndDate = false): DateDifferenceResult {
  const d1 = new Date(startIso + 'T00:00:00Z');
  const d2 = new Date(endIso + 'T00:00:00Z');

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return {
      totalDays: 0,
      years: 0,
      months: 0,
      days: 0,
      totalWeeks: 0,
      remainingDaysAfterWeeks: 0,
      workingDays: 0,
      weekendDays: 0,
      totalHours: 0,
    };
  }

  const start = d1 <= d2 ? new Date(d1) : new Date(d2);
  const end = d1 <= d2 ? new Date(d2) : new Date(d1);

  if (includeEndDate) {
    end.setUTCDate(end.getUTCDate() + 1);
  }

  const diffMs = end.getTime() - start.getTime();
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let years = end.getUTCFullYear() - start.getUTCFullYear();
  let months = end.getUTCMonth() - start.getUTCMonth();
  let days = end.getUTCDate() - start.getUTCDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 0));
    days += prevMonth.getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // Count working days (Mon-Fri)
  let workingDays = 0;
  let weekendDays = 0;
  const cursor = new Date(start);
  for (let i = 0; i < totalDays; i++) {
    const dayOfWeek = cursor.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays++;
    } else {
      workingDays++;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return {
    totalDays,
    years,
    months,
    days,
    totalWeeks: Math.floor(totalDays / 7),
    remainingDaysAfterWeeks: totalDays % 7,
    workingDays,
    weekendDays,
    totalHours: totalDays * 24,
  };
}

export interface DiscountResult {
  finalPrice: number;
  amountSaved: number;
  taxAmount: number;
  effectiveDiscountPercent: number;
}

export function calculateDiscount(
  originalPrice: number,
  discountPercent: number,
  extraDiscountPercent = 0,
  taxPercent = 0
): DiscountResult {
  if (originalPrice <= 0) {
    return { finalPrice: 0, amountSaved: 0, taxAmount: 0, effectiveDiscountPercent: 0 };
  }
  const clampedD1 = Math.max(0, Math.min(100, discountPercent));
  const clampedD2 = Math.max(0, Math.min(100, extraDiscountPercent));
  const afterD1 = originalPrice * (1 - clampedD1 / 100);
  const afterD2 = afterD1 * (1 - clampedD2 / 100);
  const amountSaved = originalPrice - afterD2;
  const taxAmount = afterD2 * (Math.max(0, taxPercent) / 100);
  const finalPrice = afterD2 + taxAmount;
  const effectiveDiscountPercent = (amountSaved / originalPrice) * 100;

  return {
    finalPrice: Number(finalPrice.toFixed(2)),
    amountSaved: Number(amountSaved.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    effectiveDiscountPercent: Number(effectiveDiscountPercent.toFixed(2)),
  };
}

export interface VatTaxResult {
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
}

export function calculateVatTax(
  amount: number,
  ratePercent: number,
  mode: 'exclusive' | 'inclusive'
): VatTaxResult {
  if (amount <= 0) {
    return { netAmount: 0, vatAmount: 0, grossAmount: 0 };
  }
  const r = Math.max(0, ratePercent) / 100;
  if (mode === 'exclusive') {
    const vat = amount * r;
    return {
      netAmount: Number(amount.toFixed(2)),
      vatAmount: Number(vat.toFixed(2)),
      grossAmount: Number((amount + vat).toFixed(2)),
    };
  } else {
    const net = amount / (1 + r);
    const vat = amount - net;
    return {
      netAmount: Number(net.toFixed(2)),
      vatAmount: Number(vat.toFixed(2)),
      grossAmount: Number(amount.toFixed(2)),
    };
  }
}

export interface AverageStatsResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  range: number;
}

export function calculateAverageStats(numbers: number[]): AverageStatsResult {
  const valid = numbers.filter((n) => Number.isFinite(n));
  if (valid.length === 0) {
    return { count: 0, sum: 0, mean: 0, median: 0, min: 0, max: 0, range: 0 };
  }
  const sorted = [...valid].sort((a, b) => a - b);
  const sum = valid.reduce((acc, v) => acc + v, 0);
  const mean = sum / valid.length;
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  return {
    count: valid.length,
    sum: Number(sum.toFixed(4)),
    mean: Number(mean.toFixed(4)),
    median: Number(median.toFixed(4)),
    min,
    max,
    range: Number((max - min).toFixed(4)),
  };
}

// Safe arithmetic expression evaluator for Basic Calculator (no eval)
export function evaluateBasicExpression(expr: string): { result: number | null; error?: string } {
  const cleaned = expr.replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/');
  if (!cleaned) return { result: 0 };
  if (!/^[0-9+\-*/.()%]+$/.test(cleaned)) {
    return { result: null, error: 'Invalid characters in expression' };
  }

  try {
    // Tokenize numbers and operators
    const tokens: (number | string)[] = [];
    let i = 0;
    while (i < cleaned.length) {
      const ch = cleaned[i];
      if (
        /[0-9.]/.test(ch) ||
        (ch === '-' && (i === 0 || ['+', '-', '*', '/', '('].includes(String(tokens[tokens.length - 1]))))
      ) {
        let numStr = ch;
        i++;
        while (i < cleaned.length && /[0-9.]/.test(cleaned[i])) {
          numStr += cleaned[i];
          i++;
        }
        const parsed = Number(numStr);
        if (isNaN(parsed)) return { result: null, error: 'Malformed number' };
        if (cleaned[i] === '%') {
          tokens.push(parsed / 100);
          i++;
        } else {
          tokens.push(parsed);
        }
      } else if (['+', '-', '*', '/', '(', ')'].includes(ch)) {
        tokens.push(ch);
        i++;
      } else {
        return { result: null, error: 'Unexpected token' };
      }
    }

    // Shunting-yard algorithm
    const outputQueue: (number | string)[] = [];
    const opStack: string[] = [];
    const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };

    for (const token of tokens) {
      if (typeof token === 'number') {
        outputQueue.push(token);
      } else if (token in precedence) {
        while (
          opStack.length > 0 &&
          opStack[opStack.length - 1] in precedence &&
          precedence[opStack[opStack.length - 1]] >= precedence[token]
        ) {
          outputQueue.push(opStack.pop()!);
        }
        opStack.push(token);
      } else if (token === '(') {
        opStack.push(token);
      } else if (token === ')') {
        while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
          outputQueue.push(opStack.pop()!);
        }
        if (opStack.length === 0) return { result: null, error: 'Mismatched parentheses' };
        opStack.pop();
      }
    }

    while (opStack.length > 0) {
      const op = opStack.pop()!;
      if (op === '(' || op === ')') return { result: null, error: 'Mismatched parentheses' };
      outputQueue.push(op);
    }

    // Evaluate RPN
    const evalStack: number[] = [];
    for (const item of outputQueue) {
      if (typeof item === 'number') {
        evalStack.push(item);
      } else {
        const b = evalStack.pop();
        const a = evalStack.pop();
        if (a === undefined || b === undefined) return { result: null, error: 'Incomplete expression' };
        if (item === '+') evalStack.push(a + b);
        else if (item === '-') evalStack.push(a - b);
        else if (item === '*') evalStack.push(a * b);
        else if (item === '/') {
          if (b === 0) return { result: null, error: 'Cannot divide by zero' };
          evalStack.push(a / b);
        }
      }
    }

    if (evalStack.length !== 1 || !Number.isFinite(evalStack[0])) {
      return { result: null, error: 'Invalid calculation' };
    }

    return { result: Number(evalStack[0].toFixed(8)) };
  } catch {
    return { result: null, error: 'Evaluation error' };
  }
}

// ==========================================
// 2. UNIT & DATA CONVERTERS LOGIC
// ==========================================

export type MeasurementCategory = 'length' | 'weight' | 'temperature' | 'area' | 'storage' | 'speed';

export interface UnitDefinition {
  id: string;
  label: string;
  symbol: string;
  toBaseFactor?: number; // For linear conversions relative to base unit
}

export const MEASUREMENT_UNITS: Record<MeasurementCategory, UnitDefinition[]> = {
  length: [
    { id: 'm', label: 'Meters', symbol: 'm', toBaseFactor: 1 },
    { id: 'km', label: 'Kilometers', symbol: 'km', toBaseFactor: 1000 },
    { id: 'cm', label: 'Centimeters', symbol: 'cm', toBaseFactor: 0.01 },
    { id: 'mm', label: 'Millimeters', symbol: 'mm', toBaseFactor: 0.001 },
    { id: 'mi', label: 'Miles', symbol: 'mi', toBaseFactor: 1609.344 },
    { id: 'yd', label: 'Yards', symbol: 'yd', toBaseFactor: 0.9144 },
    { id: 'ft', label: 'Feet', symbol: 'ft', toBaseFactor: 0.3048 },
    { id: 'in', label: 'Inches', symbol: 'in', toBaseFactor: 0.0254 },
  ],
  weight: [
    { id: 'kg', label: 'Kilograms', symbol: 'kg', toBaseFactor: 1 },
    { id: 'g', label: 'Grams', symbol: 'g', toBaseFactor: 0.001 },
    { id: 'mg', label: 'Milligrams', symbol: 'mg', toBaseFactor: 0.000001 },
    { id: 't', label: 'Metric Tons', symbol: 't', toBaseFactor: 1000 },
    { id: 'lb', label: 'Pounds', symbol: 'lb', toBaseFactor: 0.45359237 },
    { id: 'oz', label: 'Ounces', symbol: 'oz', toBaseFactor: 0.028349523125 },
  ],
  temperature: [
    { id: 'c', label: 'Celsius', symbol: '°C' },
    { id: 'f', label: 'Fahrenheit', symbol: '°F' },
    { id: 'k', label: 'Kelvin', symbol: 'K' },
  ],
  area: [
    { id: 'sqm', label: 'Square Meters', symbol: 'm²', toBaseFactor: 1 },
    { id: 'sqkm', label: 'Square Kilometers', symbol: 'km²', toBaseFactor: 1000000 },
    { id: 'sqft', label: 'Square Feet', symbol: 'ft²', toBaseFactor: 0.09290304 },
    { id: 'sqyd', label: 'Square Yards', symbol: 'yd²', toBaseFactor: 0.83612736 },
    { id: 'ac', label: 'Acres', symbol: 'ac', toBaseFactor: 4046.8564224 },
    { id: 'ha', label: 'Hectares', symbol: 'ha', toBaseFactor: 10000 },
  ],
  storage: [
    { id: 'b', label: 'Bytes', symbol: 'B', toBaseFactor: 1 },
    { id: 'kb', label: 'Kilobytes (Decimal)', symbol: 'KB', toBaseFactor: 1000 },
    { id: 'mb', label: 'Megabytes (Decimal)', symbol: 'MB', toBaseFactor: 1e6 },
    { id: 'gb', label: 'Gigabytes (Decimal)', symbol: 'GB', toBaseFactor: 1e9 },
    { id: 'tb', label: 'Terabytes (Decimal)', symbol: 'TB', toBaseFactor: 1e12 },
    { id: 'kib', label: 'Kibibytes (Binary)', symbol: 'KiB', toBaseFactor: 1024 },
    { id: 'mib', label: 'Mebibytes (Binary)', symbol: 'MiB', toBaseFactor: 1048576 },
    { id: 'gib', label: 'Gibibytes (Binary)', symbol: 'GiB', toBaseFactor: 1073741824 },
  ],
  speed: [
    { id: 'mps', label: 'Meters per second', symbol: 'm/s', toBaseFactor: 1 },
    { id: 'kmh', label: 'Kilometers per hour', symbol: 'km/h', toBaseFactor: 0.2777777778 },
    { id: 'mph', label: 'Miles per hour', symbol: 'mph', toBaseFactor: 0.44704 },
    { id: 'kn', label: 'Knots', symbol: 'kn', toBaseFactor: 0.5144444444 },
  ],
};

export function convertMeasurement(
  value: number,
  category: MeasurementCategory,
  fromUnitId: string,
  toUnitId: string
): number {
  if (!Number.isFinite(value)) return 0;
  if (fromUnitId === toUnitId) return value;

  if (category === 'temperature') {
    let celsius = value;
    if (fromUnitId === 'f') celsius = ((value - 32) * 5) / 9;
    else if (fromUnitId === 'k') celsius = value - 273.15;

    let result = celsius;
    if (toUnitId === 'f') result = (celsius * 9) / 5 + 32;
    else if (toUnitId === 'k') result = celsius + 273.15;

    return Number(result.toFixed(6));
  }

  const units = MEASUREMENT_UNITS[category];
  const fromUnit = units.find((u) => u.id === fromUnitId);
  const toUnit = units.find((u) => u.id === toUnitId);

  if (!fromUnit?.toBaseFactor || !toUnit?.toBaseFactor) return 0;
  const baseValue = value * fromUnit.toBaseFactor;
  const converted = baseValue / toUnit.toBaseFactor;
  return Number(converted.toPrecision(10));
}

export function csvToJson(csvText: string, delimiter = ','): { json: string; rowCount: number; error?: string } {
  const trimmed = csvText.trim();
  if (!trimmed) return { json: '[]', rowCount: 0 };

  try {
    const lines = trimmed.split(/\r?\n/);
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = parseLine(lines[i]);
      const obj: Record<string, string | number | boolean> = {};
      headers.forEach((header, idx) => {
        const key = header || `column_${idx + 1}`;
        const rawVal = values[idx] ?? '';
        if (rawVal !== '' && !isNaN(Number(rawVal))) {
          obj[key] = Number(rawVal);
        } else if (rawVal.toLowerCase() === 'true') {
          obj[key] = true;
        } else if (rawVal.toLowerCase() === 'false') {
          obj[key] = false;
        } else {
          obj[key] = rawVal;
        }
      });
      rows.push(obj);
    }

    return {
      json: JSON.stringify(rows, null, 2),
      rowCount: rows.length,
    };
  } catch (e) {
    return { json: '', rowCount: 0, error: e instanceof Error ? e.message : 'Failed to parse CSV' };
  }
}

export function jsonToCsv(jsonText: string, delimiter = ','): { csv: string; rowCount: number; error?: string } {
  const trimmed = jsonText.trim();
  if (!trimmed) return { csv: '', rowCount: 0 };

  try {
    const parsed = JSON.parse(trimmed);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    if (arr.length === 0 || typeof arr[0] !== 'object' || arr[0] === null) {
      return { csv: '', rowCount: 0, error: 'JSON must be an array of objects or a single object.' };
    }

    const headerSet = new Set<string>();
    arr.forEach((item) => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach((k) => headerSet.add(k));
      }
    });
    const headers = Array.from(headerSet);

    const escapeCell = (val: unknown): string => {
      if (val === null || val === undefined) return '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvLines = [
      headers.map(escapeCell).join(delimiter),
      ...arr.map((row) => headers.map((h) => escapeCell((row as Record<string, unknown>)[h])).join(delimiter)),
    ];

    return {
      csv: csvLines.join('\n'),
      rowCount: arr.length,
    };
  } catch (e) {
    return { csv: '', rowCount: 0, error: e instanceof Error ? e.message : 'Invalid JSON input' };
  }
}

export function encodeDecodeText(
  input: string,
  mode: 'base64-encode' | 'base64-decode' | 'url-encode' | 'url-decode'
): { output: string; error?: string } {
  try {
    switch (mode) {
      case 'base64-encode': {
        const bytes = new TextEncoder().encode(input);
        let binary = '';
        bytes.forEach((b) => (binary += String.fromCharCode(b)));
        return { output: btoa(binary) };
      }
      case 'base64-decode': {
        const binary = atob(input.trim());
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        return { output: new TextDecoder().decode(bytes) };
      }
      case 'url-encode':
        return { output: encodeURIComponent(input) };
      case 'url-decode':
        return { output: decodeURIComponent(input) };
    }
  } catch {
    return { output: '', error: 'Input string is not valid for the selected decoding format.' };
  }
}

// ==========================================
// 3. TEXT & DEVELOPER TOOLS LOGIC
// ==========================================

export interface WordCountMetrics {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

export function analyzeTextMetrics(text: string): WordCountMetrics {
  if (!text) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const wordMatches = text.trim().match(/\S+/g);
  const words = wordMatches ? wordMatches.length : 0;
  const sentenceMatches = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentences = sentenceMatches.length;
  const paragraphMatches = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const paragraphs = paragraphMatches.length;
  const lines = text.split(/\r?\n/).length;

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    readingTimeMinutes: Number((words / 225).toFixed(1)),
    speakingTimeMinutes: Number((words / 130).toFixed(1)),
  };
}

export type CaseConversionMode =
  | 'uppercase'
  | 'lowercase'
  | 'titlecase'
  | 'sentencecase'
  | 'camelcase'
  | 'pascalcase'
  | 'snakecase'
  | 'kebabcase';

export function convertTextCase(text: string, mode: CaseConversionMode): string {
  if (!text) return '';
  switch (mode) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'titlecase':
      return text
        .toLowerCase()
        .replace(/(?:^|\s|[-_])\S/g, (match) => match.toUpperCase());
    case 'sentencecase':
      return text
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
    case 'camelcase': {
      const words = text
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(/[\s_\-.]+/)
        .filter(Boolean);
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join('');
    }
    case 'pascalcase': {
      const words = text
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(/[\s_\-.]+/)
        .filter(Boolean);
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    }
    case 'snakecase':
      return text
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .trim()
        .toLowerCase()
        .replace(/[\s\-.]+/g, '_');
    case 'kebabcase':
      return text
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .trim()
        .toLowerCase()
        .replace(/[\s_.]+/g, '-');
  }
}

export interface LineOperationOptions {
  removeDuplicates?: boolean;
  caseSensitive?: boolean;
  trimLines?: boolean;
  removeEmptyLines?: boolean;
  sortMode?: 'none' | 'asc' | 'desc' | 'length-asc' | 'length-desc' | 'reverse';
}

export function processTextLines(text: string, options: LineOperationOptions): {
  output: string;
  originalCount: number;
  finalCount: number;
  removedCount: number;
} {
  if (!text) return { output: '', originalCount: 0, finalCount: 0, removedCount: 0 };
  let lines = text.split(/\r?\n/);
  const originalCount = lines.length;

  if (options.trimLines) {
    lines = lines.map((l) => l.trim());
  }

  if (options.removeEmptyLines) {
    lines = lines.filter((l) => l.trim().length > 0);
  }

  if (options.removeDuplicates) {
    const seen = new Set<string>();
    lines = lines.filter((line) => {
      const key = options.caseSensitive !== false ? line : line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  if (options.sortMode && options.sortMode !== 'none') {
    const copy = [...lines];
    if (options.sortMode === 'asc') {
      copy.sort((a, b) => a.localeCompare(b));
    } else if (options.sortMode === 'desc') {
      copy.sort((a, b) => b.localeCompare(a));
    } else if (options.sortMode === 'length-asc') {
      copy.sort((a, b) => a.length - b.length);
    } else if (options.sortMode === 'length-desc') {
      copy.sort((a, b) => b.length - a.length);
    } else if (options.sortMode === 'reverse') {
      copy.reverse();
    }
    lines = copy;
  }

  return {
    output: lines.join('\n'),
    originalCount,
    finalCount: lines.length,
    removedCount: originalCount - lines.length,
  };
}

export interface DiffLine {
  type: 'same' | 'added' | 'removed';
  text: string;
  leftLineNumber?: number;
  rightLineNumber?: number;
}

export function computeLineDiff(leftText: string, rightText: string): {
  diffs: DiffLine[];
  addedCount: number;
  removedCount: number;
  unchangedCount: number;
} {
  const leftLines = leftText.split(/\r?\n/);
  const rightLines = rightText.split(/\r?\n/);

  // LCS matrix for line diff
  const m = leftLines.length;
  const n = rightLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (leftLines[i] === rightLines[j]) {
        dp[i][j] = 1 + dp[i + 1][j + 1];
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const diffs: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  while (i < m && j < n) {
    if (leftLines[i] === rightLines[j]) {
      diffs.push({
        type: 'same',
        text: leftLines[i],
        leftLineNumber: i + 1,
        rightLineNumber: j + 1,
      });
      unchangedCount++;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      diffs.push({
        type: 'removed',
        text: leftLines[i],
        leftLineNumber: i + 1,
      });
      removedCount++;
      i++;
    } else {
      diffs.push({
        type: 'added',
        text: rightLines[j],
        rightLineNumber: j + 1,
      });
      addedCount++;
      j++;
    }
  }

  while (i < m) {
    diffs.push({
      type: 'removed',
      text: leftLines[i],
      leftLineNumber: i + 1,
    });
    removedCount++;
    i++;
  }

  while (j < n) {
    diffs.push({
      type: 'added',
      text: rightLines[j],
      rightLineNumber: j + 1,
    });
    addedCount++;
    j++;
  }

  return { diffs, addedCount, removedCount, unchangedCount };
}

export function formatAndValidateJson(
  rawJson: string,
  indentSpaces: number | 'minify' = 2
): { formatted: string; valid: boolean; error?: string; sizeBytes: number } {
  if (!rawJson.trim()) {
    return { formatted: '', valid: false, error: 'Input is empty', sizeBytes: 0 };
  }
  try {
    const parsed = JSON.parse(rawJson);
    const formatted =
      indentSpaces === 'minify' ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indentSpaces);
    const sizeBytes = new TextEncoder().encode(formatted).length;
    return { formatted, valid: true, sizeBytes };
  } catch (e) {
    return {
      formatted: '',
      valid: false,
      error: e instanceof Error ? e.message : 'Invalid JSON syntax',
      sizeBytes: 0,
    };
  }
}

// Parse page range strings like "1-3, 5, 7-9" into 0-indexed page numbers
export function parsePageRangeString(rangeStr: string, maxPages: number): { pages: number[]; error?: string } {
  const cleaned = rangeStr.trim();
  if (!cleaned) {
    return { pages: Array.from({ length: maxPages }, (_, i) => i) };
  }

  const pageSet = new Set<number>();
  const parts = cleaned.split(',').map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = Number(startStr);
      const end = Number(endStr);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > maxPages) {
        return { pages: [], error: `Invalid range "${part}". Enter pages between 1 and ${maxPages}.` };
      }
      for (let p = start; p <= end; p++) {
        pageSet.add(p - 1);
      }
    } else {
      const pageNum = Number(part);
      if (!Number.isInteger(pageNum) || pageNum < 1 || pageNum > maxPages) {
        return { pages: [], error: `Invalid page number "${part}". Must be between 1 and ${maxPages}.` };
      }
      pageSet.add(pageNum - 1);
    }
  }

  return { pages: Array.from(pageSet).sort((a, b) => a - b) };
}
