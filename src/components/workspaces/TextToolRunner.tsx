import React, { useState } from 'react';
import { Copy, Check, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { ToolDefinition } from '../../data/toolRegistry';
import {
  computeLineDiff,
  formatAndValidateJson,
  analyzeTextMetrics,
  convertTextCase,
  CaseConversionMode,
  processTextLines,
} from '../../utils/toolLogic';

interface TextToolRunnerProps {
  tool: ToolDefinition;
}

export function TextToolRunner({ tool }: TextToolRunnerProps) {
  const [copied, setCopied] = useState(false);

  // 1. Text Compare state
  const [leftText, setLeftText] = useState(
    'server {\n  listen 80;\n  server_name vibedesk.si;\n  root /var/www/html;\n  index index.html;\n}'
  );
  const [rightText, setRightText] = useState(
    'server {\n  listen 443 ssl http2;\n  server_name vibedesk.si www.vibedesk.si;\n  root /var/www/public;\n  index index.html;\n}'
  );
  const [onlyShowChanges, setOnlyShowChanges] = useState(false);

  // 2. JSON Formatter state
  const [jsonInput, setJsonInput] = useState(
    '{"brand":"VibeDesk","domain":"https://vibedesk.si","parentVenture":"SoftDows","privacyFirst":true,"categories":["PDF","Images","Calculators","Converters"]}'
  );
  const [jsonIndent, setJsonIndent] = useState<number | 'minify'>(2);

  // 3. Word Counter state
  const [proseInput, setProseInput] = useState(
    'VibeDesk is a calm digital workspace where everyday tasks happen right inside your browser. Every utility is built for speed, clarity, and complete local privacy without uploading personal files to remote servers.'
  );

  // 4. Case & Line Cleaner state
  const [caseInput, setCaseInput] = useState(
    'Merge PDF Document\nCompress Image File\nMerge PDF Document\nPercentage Calculator\nUnit Converter\nCompress Image File'
  );
  const [removeDups, setRemoveDups] = useState(true);
  const [caseSensitiveDups, setCaseSensitiveDups] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [sortMode, setSortMode] = useState<'none' | 'asc' | 'desc' | 'length-asc' | 'reverse'>(
    'none'
  );

  const copyToClipboard = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ==========================================
  // 1. TEXT & CODE DIFF COMPARE
  // ==========================================
  if (tool.id === 'text-compare') {
    const diffResult = computeLineDiff(leftText, rightText);
    const visibleDiffs = onlyShowChanges
      ? diffResult.diffs.filter((d) => d.type !== 'same')
      : diffResult.diffs;

    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="diff-left" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Original Text / Code
            </label>
            <textarea
              id="diff-left"
              rows={8}
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
              className="w-full p-3.5 text-xs font-mono bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl"
            />
          </div>
          <div>
            <label htmlFor="diff-right" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Modified Text / Code
            </label>
            <textarea
              id="diff-right"
              rows={8}
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
              className="w-full p-3.5 text-xs font-mono bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
          <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
            <span className="font-semibold text-[#059669]">+{diffResult.addedCount} added</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-[#DC2626]">-{diffResult.removedCount} removed</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#64748B]">{diffResult.unchangedCount} unchanged</span>
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0F172A] cursor-pointer">
            <input
              type="checkbox"
              checked={onlyShowChanges}
              onChange={(e) => setOnlyShowChanges(e.target.checked)}
              className="w-4 h-4 accent-[#4F46E5] rounded"
            />
            <span>Only show modified lines</span>
          </label>
        </div>

        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#F8FAFC] font-mono text-xs">
          {visibleDiffs.length === 0 ? (
            <div className="p-6 text-center text-[#64748B]">No differences found.</div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]/60 max-h-[400px] overflow-y-auto">
              {visibleDiffs.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex items-start px-3 py-1.5 ${
                    line.type === 'added'
                      ? 'bg-[#059669]/10 text-[#059669]'
                      : line.type === 'removed'
                      ? 'bg-[#DC2626]/10 text-[#DC2626]'
                      : 'bg-white text-[#0F172A]'
                  }`}
                >
                  <span className="w-8 shrink-0 text-[#64748B] select-none tabular-nums">
                    {line.leftLineNumber ?? ''}
                  </span>
                  <span className="w-8 shrink-0 text-[#64748B] select-none tabular-nums">
                    {line.rightLineNumber ?? ''}
                  </span>
                  <span className="w-5 shrink-0 font-bold select-none">
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                  </span>
                  <span className="whitespace-pre-wrap break-all">{line.text || ' '}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. JSON FORMATTER & VALIDATOR
  // ==========================================
  if (tool.id === 'json-formatter-validator') {
    const res = formatAndValidateJson(jsonInput, jsonIndent);

    const handleDownloadJson = () => {
      if (!res.valid) return;
      const blob = new Blob([res.formatted], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vibedesk-formatted.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 500);
    };

    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(
              [
                { id: 2, label: '2 Spaces' },
                { id: 4, label: '4 Spaces' },
                { id: 'minify', label: 'Minify' },
              ] as const
            ).map((opt) => (
              <button
                key={String(opt.id)}
                type="button"
                onClick={() => setJsonIndent(opt.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border ${
                  jsonIndent === opt.id
                    ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                    : 'bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => copyToClipboard(res.formatted)}
              disabled={!res.valid}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              disabled={!res.valid}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .JSON</span>
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div
          className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs ${
            res.valid
              ? 'bg-[#059669]/5 border-[#059669]/25 text-[#059669]'
              : 'bg-[#DC2626]/5 border-[#DC2626]/25 text-[#DC2626]'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {res.valid ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Valid RFC-8259 JSON</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Syntax Error: {res.error}</span>
              </>
            )}
          </div>
          {res.valid && (
            <span className="font-mono tabular-nums text-[#0F172A]">{res.sizeBytes} bytes</span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label htmlFor="json-raw-input" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Raw JSON Input
            </label>
            <textarea
              id="json-raw-input"
              rows={12}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full p-3.5 text-xs font-mono bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl"
            />
          </div>
          <div>
            <label htmlFor="json-formatted-output" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Formatted Output
            </label>
            <textarea
              id="json-formatted-output"
              rows={12}
              readOnly
              value={res.valid ? res.formatted : ''}
              placeholder={res.error || ''}
              className="w-full p-3.5 text-xs font-mono bg-white border border-[#E2E8F0] rounded-xl"
            />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. WORD & CHARACTER COUNTER
  // ==========================================
  if (tool.id === 'word-character-counter') {
    const metrics = analyzeTextMetrics(proseInput);

    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Words', value: metrics.words },
            { label: 'Characters', value: metrics.characters },
            { label: 'No Spaces', value: metrics.charactersNoSpaces },
            { label: 'Sentences', value: metrics.sentences },
            { label: 'Paragraphs', value: metrics.paragraphs },
            { label: 'Reading Time', value: `${metrics.readingTimeMinutes} min` },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
              <span className="text-xs text-[#64748B]">{stat.label}</span>
              <div className="text-xl font-bold font-mono tabular-nums text-[#0F172A] mt-1">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="word-counter-textarea" className="text-xs font-semibold text-[#0F172A]">
              Type or paste your text below
            </label>
            <button
              type="button"
              onClick={() => setProseInput('')}
              className="text-xs font-medium text-[#64748B] hover:text-[#DC2626]"
            >
              Clear Text
            </button>
          </div>
          <textarea
            id="word-counter-textarea"
            rows={10}
            value={proseInput}
            onChange={(e) => setProseInput(e.target.value)}
            placeholder="Start typing or paste your document here..."
            className="w-full p-4 text-sm leading-relaxed bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-2 focus:outline-[#4F46E5]"
          />
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. CASE CONVERTER & LINE DEDUPLICATOR
  // ==========================================
  const lineProcessed = processTextLines(caseInput, {
    removeDuplicates: removeDups,
    caseSensitive: caseSensitiveDups,
    trimLines: trimWhitespace,
    removeEmptyLines: removeEmpty,
    sortMode,
  });

  const caseButtons: Array<{ mode: CaseConversionMode; label: string }> = [
    { mode: 'uppercase', label: 'UPPERCASE' },
    { mode: 'lowercase', label: 'lowercase' },
    { mode: 'titlecase', label: 'Title Case' },
    { mode: 'sentencecase', label: 'Sentence case' },
    { mode: 'camelcase', label: 'camelCase' },
    { mode: 'pascalcase', label: 'PascalCase' },
    { mode: 'snakecase', label: 'snake_case' },
    { mode: 'kebabcase', label: 'kebab-case' },
  ];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="space-y-2">
        <span className="block text-xs font-semibold text-[#0F172A]">
          Instant Case Transformations
        </span>
        <div className="flex flex-wrap gap-2">
          {caseButtons.map((btn) => (
            <button
              key={btn.mode}
              type="button"
              onClick={() => setCaseInput(convertTextCase(caseInput, btn.mode))}
              className="px-3 py-1.5 text-xs font-medium bg-[#F8FAFC] hover:bg-[#4F46E5] hover:text-white border border-[#E2E8F0] rounded-lg transition-colors"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#0F172A]">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={removeDups}
              onChange={(e) => setRemoveDups(e.target.checked)}
              className="w-4 h-4 accent-[#4F46E5] rounded"
            />
            <span>Remove duplicate lines</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitiveDups}
              onChange={(e) => setCaseSensitiveDups(e.target.checked)}
              className="w-4 h-4 accent-[#4F46E5] rounded"
            />
            <span>Case-sensitive</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={trimWhitespace}
              onChange={(e) => setTrimWhitespace(e.target.checked)}
              className="w-4 h-4 accent-[#4F46E5] rounded"
            />
            <span>Trim line whitespace</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={removeEmpty}
              onChange={(e) => setRemoveEmpty(e.target.checked)}
              className="w-4 h-4 accent-[#4F46E5] rounded"
            />
            <span>Remove empty lines</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="line-sort-select" className="text-xs font-semibold text-[#64748B]">
            Sort:
          </label>
          <select
            id="line-sort-select"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
          >
            <option value="none">Original Order</option>
            <option value="asc">Alphabetical (A → Z)</option>
            <option value="desc">Alphabetical (Z → A)</option>
            <option value="length-asc">By Line Length</option>
            <option value="reverse">Reverse Order</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label htmlFor="case-line-input" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            Source Text ({lineProcessed.originalCount} lines)
          </label>
          <textarea
            id="case-line-input"
            rows={9}
            value={caseInput}
            onChange={(e) => setCaseInput(e.target.value)}
            className="w-full p-3.5 text-xs font-mono bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="case-line-output" className="text-xs font-semibold text-[#0F172A]">
              Cleaned Output ({lineProcessed.finalCount} lines · {lineProcessed.removedCount} removed)
            </label>
            <button
              type="button"
              onClick={() => copyToClipboard(lineProcessed.output)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Output'}</span>
            </button>
          </div>
          <textarea
            id="case-line-output"
            rows={9}
            readOnly
            value={lineProcessed.output}
            className="w-full p-3.5 text-xs font-mono bg-white border border-[#E2E8F0] rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
