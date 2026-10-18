import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Upload,
  FolderArchive,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { ToolDefinition } from '../../data/toolRegistry';

interface FileUtilityRunnerProps {
  tool: ToolDefinition;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

async function computeBufferDigest(buffer: ArrayBuffer, algo: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algo, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function FileUtilityRunner({ tool }: FileUtilityRunnerProps) {
  // 1. ZIP Archive Creator state
  const [zipFiles, setZipFiles] = useState<File[]>([]);
  const [archiveName, setArchiveName] = useState('vibedesk-bundle.zip');
  const [compressionLevel, setCompressionLevel] = useState<number>(6);
  const [zipResultUrl, setZipResultUrl] = useState<string | null>(null);
  const [zipResultSize, setZipResultSize] = useState<number>(0);

  // 2. File Hash & Checksum state
  const [hashTargetFile, setHashTargetFile] = useState<File | null>(null);
  const [digests, setDigests] = useState<{
    sha256: string;
    sha384: string;
    sha512: string;
    sha1: string;
  } | null>(null);
  const [expectedHash, setExpectedHash] = useState('');
  const [copiedAlgo, setCopiedAlgo] = useState<string | null>(null);

  // ==========================================
  // 1. ZIP ARCHIVE CREATOR
  // ==========================================
  if (tool.id === 'zip-archive-creator') {
    const totalInputSize = zipFiles.reduce((acc, f) => acc + f.size, 0);

    const handleLoadSampleBundle = () => {
      const f1 = new File(
        ['# VibeDesk Project Notes\nAll files in this archive were bundled locally in your browser.'],
        'README.md',
        { type: 'text/markdown' }
      );
      const f2 = new File(
        [JSON.stringify({ portal: 'VibeDesk', venture: 'SoftDows', localProcessing: true }, null, 2)],
        'manifest.json',
        { type: 'application/json' }
      );
      setZipFiles([f1, f2]);
      setZipResultUrl(null);
    };

    const handleBuildZip = async () => {
      if (zipFiles.length === 0) return;
      const zip = new JSZip();
      zipFiles.forEach((f) => {
        zip.file(f.name, f);
      });
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: compressionLevel === 0 ? 'STORE' : 'DEFLATE',
        compressionOptions: { level: compressionLevel || 6 },
      });
      if (zipResultUrl) URL.revokeObjectURL(zipResultUrl);
      setZipResultUrl(URL.createObjectURL(blob));
      setZipResultSize(blob.size);
    };

    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-2 border-dashed border-[#E2E8F0] hover:border-[#0D9488]/50 rounded-xl p-8 text-center bg-[#F8FAFC]/60">
          <div className="w-12 h-12 rounded-xl bg-[#14B8A6]/10 text-[#0D9488] flex items-center justify-center mx-auto mb-3">
            <FolderArchive className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-[#0F172A]">
            Select files to package into a .ZIP archive
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Bundled in local browser memory using JSZip DEFLATE compression
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg">
              <Upload className="w-4 h-4" />
              <span>Add Files</span>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const list = Array.from(e.target.files ?? []);
                  if (list.length > 0) {
                    setZipFiles((prev) => [...prev, ...list]);
                    setZipResultUrl(null);
                  }
                  e.target.value = '';
                }}
                className="sr-only"
              />
            </label>
            <button
              type="button"
              onClick={handleLoadSampleBundle}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg"
            >
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span>Load Sample Files</span>
            </button>
          </div>
        </div>

        {zipFiles.length > 0 && (
          <div className="space-y-4">
            <ul className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
              {zipFiles.map((file, idx) => (
                <li key={`${file.name}-${idx}`} className="flex items-center justify-between px-4 py-2.5 text-xs">
                  <span className="font-medium text-[#0F172A] truncate">{file.name}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[#64748B] tabular-nums">{formatBytes(file.size)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setZipFiles((prev) => prev.filter((_, i) => i !== idx));
                        setZipResultUrl(null);
                      }}
                      aria-label={`Remove ${file.name}`}
                      className="text-[#64748B] hover:text-[#DC2626]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <label htmlFor="zip-name-input" className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Output Archive Filename
                </label>
                <input
                  id="zip-name-input"
                  type="text"
                  value={archiveName}
                  onChange={(e) => setArchiveName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg font-mono"
                />
              </div>
              <div>
                <label htmlFor="zip-level-select" className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Compression Level
                </label>
                <select
                  id="zip-level-select"
                  value={compressionLevel}
                  onChange={(e) => setCompressionLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg"
                >
                  <option value={0}>Store Only (0 — Fastest, No Compression)</option>
                  <option value={6}>Standard DEFLATE (Level 6 — Balanced)</option>
                  <option value={9}>Maximum DEFLATE (Level 9 — Smallest Size)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBuildZip}
              className="px-6 py-3 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-colors"
            >
              Build ZIP Archive ({zipFiles.length} files · {formatBytes(totalInputSize)})
            </button>
          </div>
        )}

        {zipResultUrl && (
          <div className="p-4 rounded-xl bg-[#059669]/5 border border-[#059669]/25 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-[#0F172A]">
              <CheckCircle2 className="w-5 h-5 text-[#059669]" />
              <span>
                Archive Ready ({formatBytes(zipResultSize)})
              </span>
            </div>
            <a
              href={zipResultUrl}
              download={archiveName.endsWith('.zip') ? archiveName : `${archiveName}.zip`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-lg"
            >
              <Download className="w-4 h-4" />
              <span>Download {archiveName}</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. FILE HASH & CHECKSUM VERIFIER
  // ==========================================
  const handleFileForHashing = async (file: File) => {
    setHashTargetFile(file);
    const buffer = await file.arrayBuffer();
    const [sha256, sha384, sha512, sha1] = await Promise.all([
      computeBufferDigest(buffer, 'SHA-256'),
      computeBufferDigest(buffer, 'SHA-384'),
      computeBufferDigest(buffer, 'SHA-512'),
      computeBufferDigest(buffer, 'SHA-1'),
    ]);
    setDigests({ sha256, sha384, sha512, sha1 });
  };

  const cleanExpected = expectedHash.trim().toLowerCase();
  const matchedAlgo =
    digests && cleanExpected
      ? Object.entries(digests).find(([, val]) => val.toLowerCase() === cleanExpected)?.[0]
      : undefined;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="border-2 border-dashed border-[#E2E8F0] hover:border-[#4F46E5]/50 rounded-xl p-8 text-center bg-[#F8FAFC]/60">
        <h2 className="text-base font-semibold text-[#0F172A]">
          Select any file to compute cryptographic SHA digests locally
        </h2>
        <p className="text-xs text-[#64748B] mt-1">
          Powered by native browser Web Crypto API (crypto.subtle.digest)
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg">
            <Upload className="w-4 h-4" />
            <span>Select File to Hash</span>
            <input
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileForHashing(f);
              }}
              className="sr-only"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              const sample = new File(
                ['VibeDesk Deterministic Integrity Verification Sample Payload\n'],
                'vibedesk-release-v1.txt',
                { type: 'text/plain' }
              );
              handleFileForHashing(sample);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg"
          >
            <Sparkles className="w-4 h-4 text-[#4F46E5]" />
            <span>Hash Sample File</span>
          </button>
        </div>
      </div>

      {hashTargetFile && digests && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#0F172A]">{hashTargetFile.name}</span>
            <span className="font-mono text-[#64748B] tabular-nums">
              {formatBytes(hashTargetFile.size)}
            </span>
          </div>

          <div>
            <label htmlFor="expected-checksum" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Compare with Expected Checksum (Optional)
            </label>
            <input
              id="expected-checksum"
              type="text"
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              placeholder="Paste an expected SHA-256, SHA-512, or SHA-1 hash to verify..."
              className="w-full px-3.5 py-2 text-xs font-mono bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
            />
            {cleanExpected && (
              <div
                className={`mt-2 flex items-center gap-2 text-xs font-semibold ${
                  matchedAlgo ? 'text-[#059669]' : 'text-[#DC2626]'
                }`}
              >
                {matchedAlgo ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified Match ({matchedAlgo.toUpperCase()})</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>No match against computed digests</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            {(
              [
                { key: 'sha256', label: 'SHA-256', val: digests.sha256 },
                { key: 'sha384', label: 'SHA-384', val: digests.sha384 },
                { key: 'sha512', label: 'SHA-512', val: digests.sha512 },
                { key: 'sha1', label: 'SHA-1', val: digests.sha1 },
              ] as const
            ).map((row) => (
              <div
                key={row.key}
                className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[#0F172A]">{row.label}</span>
                  <p className="text-xs font-mono text-[#64748B] break-all mt-0.5">{row.val}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(row.val);
                    setCopiedAlgo(row.key);
                    setTimeout(() => setCopiedAlgo(null), 1500);
                  }}
                  aria-label={`Copy ${row.label} hash`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#4F46E5] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg shrink-0"
                >
                  {copiedAlgo === row.key ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#059669]" />
                      <span className="text-[#059669]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
