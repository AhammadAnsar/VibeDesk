import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check, Download } from 'lucide-react';
import { ToolDefinition } from '../../data/toolRegistry';
import {
  MEASUREMENT_UNITS,
  MeasurementCategory,
  convertMeasurement,
  csvToJson,
  jsonToCsv,
  encodeDecodeText,
} from '../../utils/toolLogic';

interface ConverterToolRunnerProps {
  tool: ToolDefinition;
}

export function ConverterToolRunner({ tool }: ConverterToolRunnerProps) {
  const [copied, setCopied] = useState(false);

  // 1. Measurement Converter state
  const [measureCat, setMeasureCat] = useState<MeasurementCategory>('length');
  const [inputVal, setInputVal] = useState<number>(10);
  const [fromUnit, setFromUnit] = useState<string>('km');
  const [toUnit, setToUnit] = useState<string>('mi');

  // 2. CSV <-> JSON state
  const [dataDirection, setDataDirection] = useState<'csv-to-json' | 'json-to-csv'>('csv-to-json');
  const [dataInput, setDataInput] = useState<string>(
    'id,product,category,price,inStock\n101,Mechanical Keyboard,Hardware,129.50,true\n102,USB-C Dock,Accessories,74.00,true\n103,Desk Mat,Workspace,28.00,false'
  );

  // 3. Base64 & URL state
  const [codecMode, setCodecMode] = useState<
    'base64-encode' | 'base64-decode' | 'url-encode' | 'url-decode'
  >('base64-encode');
  const [codecInput, setCodecInput] = useState<string>(
    'https://vibedesk.si/?workspace=calm&privacy=local'
  );

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ==========================================
  // 1. UNIT & MEASUREMENT CONVERTER
  // ==========================================
  if (tool.id === 'measurement-converter') {
    const units = MEASUREMENT_UNITS[measureCat];
    const safeFrom = units.some((u) => u.id === fromUnit) ? fromUnit : units[0].id;
    const safeTo = units.some((u) => u.id === toUnit) ? toUnit : units[1]?.id ?? units[0].id;
    const convertedVal = convertMeasurement(inputVal, measureCat, safeFrom, safeTo);

    const handleCategorySelect = (cat: MeasurementCategory) => {
      setMeasureCat(cat);
      const nextUnits = MEASUREMENT_UNITS[cat];
      setFromUnit(nextUnits[0].id);
      setToUnit(nextUnits[1]?.id ?? nextUnits[0].id);
    };

    const categories: Array<{ id: MeasurementCategory; label: string }> = [
      { id: 'length', label: 'Length' },
      { id: 'weight', label: 'Weight & Mass' },
      { id: 'temperature', label: 'Temperature' },
      { id: 'area', label: 'Area' },
      { id: 'storage', label: 'Digital Storage' },
      { id: 'speed', label: 'Speed' },
    ];

    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Category Switcher */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCategorySelect(c.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                measureCat === c.id
                  ? 'bg-[#4F46E5] text-white'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Input -> From -> Swap -> To -> Result */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="md:col-span-3 space-y-2">
            <label htmlFor="unit-input-val" className="block text-xs font-semibold text-[#0F172A]">
              From Value & Unit
            </label>
            <div className="flex gap-2">
              <input
                id="unit-input-val"
                type="number"
                step="any"
                value={inputVal}
                onChange={(e) => setInputVal(Number(e.target.value))}
                className="w-1/2 px-3.5 py-2.5 text-base font-mono tabular-nums bg-white border border-[#E2E8F0] rounded-lg"
              />
              <select
                value={safeFrom}
                onChange={(e) => setFromUnit(e.target.value)}
                aria-label="From Unit"
                className="w-1/2 px-3 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                setFromUnit(safeTo);
                setToUnit(safeFrom);
              }}
              aria-label="Swap units"
              className="p-2.5 bg-white hover:bg-[#E2E8F0]/40 border border-[#E2E8F0] rounded-lg text-[#4F46E5]"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          <div className="md:col-span-3 space-y-2">
            <label className="block text-xs font-semibold text-[#0F172A]">
              Converted Result & Target Unit
            </label>
            <div className="flex gap-2">
              <div className="w-1/2 px-3.5 py-2.5 text-base font-bold font-mono tabular-nums bg-white border border-[#4F46E5]/40 text-[#4F46E5] rounded-lg flex items-center justify-between overflow-x-auto">
                <span>{convertedVal}</span>
              </div>
              <select
                value={safeTo}
                onChange={(e) => setToUnit(e.target.value)}
                aria-label="To Unit"
                className="w-1/2 px-3 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* All-Unit Reference Table */}
        <div>
          <h3 className="text-xs font-semibold text-[#0F172A] mb-2.5">
            All Equivalent {categories.find((c) => c.id === measureCat)?.label} Units
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {units.map((u) => {
              const eqVal = convertMeasurement(inputVal, measureCat, safeFrom, u.id);
              return (
                <div
                  key={u.id}
                  className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between"
                >
                  <span className="text-xs text-[#64748B]">{u.label}</span>
                  <span className="text-sm font-bold font-mono tabular-nums text-[#0F172A] mt-1">
                    {eqVal} {u.symbol}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. CSV <-> JSON DATA CONVERTER
  // ==========================================
  if (tool.id === 'csv-json-converter') {
    const conversion =
      dataDirection === 'csv-to-json' ? csvToJson(dataInput) : jsonToCsv(dataInput);
    const outputText =
      dataDirection === 'csv-to-json'
        ? (conversion as ReturnType<typeof csvToJson>).json
        : (conversion as ReturnType<typeof jsonToCsv>).csv;

    const handleDownloadData = () => {
      if (!outputText) return;
      const ext = dataDirection === 'csv-to-json' ? 'json' : 'csv';
      const mime = dataDirection === 'csv-to-json' ? 'application/json' : 'text/csv';
      const blob = new Blob([outputText], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vibedesk-converted.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 500);
    };

    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            <button
              type="button"
              onClick={() => {
                setDataDirection('csv-to-json');
                setDataInput(
                  'id,product,category,price,inStock\n101,Mechanical Keyboard,Hardware,129.50,true\n102,USB-C Dock,Accessories,74.00,true'
                );
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg ${
                dataDirection === 'csv-to-json'
                  ? 'bg-white text-[#0F172A] shadow-2xs'
                  : 'text-[#64748B]'
              }`}
            >
              CSV → JSON
            </button>
            <button
              type="button"
              onClick={() => {
                setDataDirection('json-to-csv');
                setDataInput(
                  '[\n  {"id": 101, "product": "Mechanical Keyboard", "price": 129.5},\n  {"id": 102, "product": "USB-C Dock", "price": 74}\n]'
                );
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg ${
                dataDirection === 'json-to-csv'
                  ? 'bg-white text-[#0F172A] shadow-2xs'
                  : 'text-[#64748B]'
              }`}
            >
              JSON → CSV
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => copyText(outputText)}
              disabled={!outputText}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#F8FAFC] hover:bg-[#E2E8F0]/50 border border-[#E2E8F0] rounded-lg"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Output'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadData}
              disabled={!outputText}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {dataDirection === 'csv-to-json' ? '.JSON' : '.CSV'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label htmlFor="csv-json-input" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Input ({dataDirection === 'csv-to-json' ? 'CSV' : 'JSON'})
            </label>
            <textarea
              id="csv-json-input"
              rows={10}
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              className="w-full p-3.5 text-xs font-mono bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl"
            />
          </div>
          <div>
            <label htmlFor="csv-json-output" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Converted Output ({conversion.rowCount} records)
            </label>
            <textarea
              id="csv-json-output"
              rows={10}
              readOnly
              value={conversion.error ? `Error: ${conversion.error}` : outputText}
              className="w-full p-3.5 text-xs font-mono bg-white border border-[#E2E8F0] rounded-xl"
            />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. BASE64 & URL ENCODER / DECODER
  // ==========================================
  const codecResult = encodeDecodeText(codecInput, codecMode);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          {(
            [
              { id: 'base64-encode', label: 'Base64 Encode' },
              { id: 'base64-decode', label: 'Base64 Decode' },
              { id: 'url-encode', label: 'URL Encode' },
              { id: 'url-decode', label: 'URL Decode' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setCodecMode(m.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg ${
                codecMode === m.id
                  ? 'bg-[#4F46E5] text-white'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => copyText(codecResult.output)}
          disabled={!!codecResult.error}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied to Clipboard' : 'Copy Output'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="codec-input" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            Source String
          </label>
          <textarea
            id="codec-input"
            rows={6}
            value={codecInput}
            onChange={(e) => setCodecInput(e.target.value)}
            className="w-full p-3.5 text-xs font-mono bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl"
          />
        </div>
        <div>
          <label htmlFor="codec-output" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            Result
          </label>
          <textarea
            id="codec-output"
            rows={6}
            readOnly
            value={codecResult.error || codecResult.output}
            className="w-full p-3.5 text-xs font-mono bg-white border border-[#E2E8F0] rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
