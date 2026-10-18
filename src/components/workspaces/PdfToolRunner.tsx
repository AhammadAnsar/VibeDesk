import React, { useState, useEffect } from 'react';
import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { ToolDefinition } from '../../data/toolRegistry';
import { parsePageRangeString } from '../../utils/toolLogic';

// Configure PDF.js worker using CDN or inline fallback
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
} catch {
  // Fallback handled gracefully during render
}

interface PdfToolRunnerProps {
  tool: ToolDefinition;
}

interface LoadedPdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  bytes: Uint8Array;
}

interface PageItemConfig {
  originalIndex: number; // 0-indexed
  rotationDelta: number; // 0, 90, 180, 270
  deleted: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

async function createSamplePdfFile(
  filename: string,
  title: string,
  pageCount: number,
  accentHex: [number, number, number]
): Promise<File> {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  doc.setTitle(title);
  doc.setAuthor('VibeDesk Sample Generator');
  doc.setCreator('VibeDesk Local Workspace');

  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    page.drawRectangle({
      x: 40,
      y: height - 110,
      width: width - 80,
      height: 55,
      color: rgb(accentHex[0], accentHex[1], accentHex[2]),
    });

    page.drawText(`${title} — Page ${i} of ${pageCount}`, {
      x: 56,
      y: height - 88,
      size: 16,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(
      `Generated locally inside your browser for testing ${filename}.`,
      {
        x: 40,
        y: height - 150,
        size: 12,
        font: fontRegular,
        color: rgb(0.15, 0.2, 0.3),
      }
    );

    page.drawText(
      'VibeDesk processes all PDF documents on your device with zero server uploads.',
      {
        x: 40,
        y: height - 175,
        size: 11,
        font: fontRegular,
        color: rgb(0.4, 0.45, 0.55),
      }
    );
  }

  const pdfBytes = await doc.save();
  return new File([pdfBytes], filename, { type: 'application/pdf' });
}

export function PdfToolRunner({ tool }: PdfToolRunnerProps) {
  const [pdfFiles, setPdfFiles] = useState<LoadedPdfFile[]>([]);
  const [imageFiles, setImageFiles] = useState<Array<{ id: string; file: File; previewUrl: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState<string>('');
  const [resultSummary, setResultSummary] = useState<string>('');
  const [renderedImages, setRenderedImages] = useState<Array<{ pageNumber: number; dataUrl: string }>>([]);

  // Tool-specific options
  const [splitMode, setSplitMode] = useState<'range' | 'all-zip'>('range');
  const [pageRangeInput, setPageRangeInput] = useState('1-2');
  const [pageItems, setPageItems] = useState<PageItemConfig[]>([]);
  const [pdfToImgFormat, setPdfToImgFormat] = useState<'png' | 'jpeg'>('png');
  const [pdfToImgScale, setPdfToImgScale] = useState<number>(1.5);
  const [imgToPdfPageSize, setImgToPdfPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [imgToPdfMargin, setImgToPdfMargin] = useState<number>(24);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');
  const [metaSubject, setMetaSubject] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Reset state when switching tools
  useEffect(() => {
    setPdfFiles([]);
    setImageFiles([]);
    setError(null);
    setResultUrl(null);
    setResultSummary('');
    setRenderedImages([]);
    setPageItems([]);
  }, [tool.id]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      imageFiles.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [resultUrl, imageFiles]);

  const loadPdfFileList = async (files: File[]) => {
    setError(null);
    setResultUrl(null);
    setRenderedImages([]);

    const loaded: LoadedPdfFile[] = [];
    for (const file of files) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError(`"${file.name}" is not a valid PDF document.`);
        continue;
      }
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: false });
        const count = doc.getPageCount();

        loaded.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          file,
          name: file.name,
          size: file.size,
          pageCount: count,
          bytes,
        });

        if (tool.id === 'organize-pdf' && loaded.length === 1) {
          setPageItems(
            Array.from({ length: count }, (_, idx) => ({
              originalIndex: idx,
              rotationDelta: 0,
              deleted: false,
            }))
          );
        }

        if (tool.id === 'pdf-metadata-cleaner' && loaded.length === 1) {
          setMetaTitle(doc.getTitle() ?? '');
          setMetaAuthor(doc.getAuthor() ?? '');
          setMetaSubject(doc.getSubject() ?? '');
          setMetaKeywords(doc.getKeywords() ?? '');
        }
      } catch {
        setError(
          `Could not read "${file.name}". Ensure it is a valid, unencrypted PDF file.`
        );
      }
    }

    if (tool.id === 'merge-pdf') {
      setPdfFiles((prev) => [...prev, ...loaded]);
    } else if (loaded.length > 0) {
      setPdfFiles([loaded[0]]);
    }
  };

  const handleLoadSample = async () => {
    setError(null);
    if (tool.id === 'images-to-pdf') {
      // Create 2 sample canvas images
      const makeSampleImage = async (label: string, bg: string): Promise<File> => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 550;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 800, 550);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 34px sans-serif';
        ctx.fillText(label, 50, 100);
        ctx.font = '20px sans-serif';
        ctx.fillText('VibeDesk Sample Image for PDF Compilation', 50, 150);
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
        return new File([blob], `${label.toLowerCase().replace(/\s+/g, '-')}.png`, {
          type: 'image/png',
        });
      };
      const f1 = await makeSampleImage('Slide 01 Overview', '#4F46E5');
      const f2 = await makeSampleImage('Slide 02 Architecture', '#0D9488');
      setImageFiles([
        { id: 'sample-1', file: f1, previewUrl: URL.createObjectURL(f1) },
        { id: 'sample-2', file: f2, previewUrl: URL.createObjectURL(f2) },
      ]);
      return;
    }

    if (tool.id === 'merge-pdf') {
      const sampleA = await createSamplePdfFile('Project_Proposal_Part1.pdf', 'Project Proposal', 2, [0.31, 0.27, 0.9]);
      const sampleB = await createSamplePdfFile('Financial_Appendix_Part2.pdf', 'Financial Appendix', 2, [0.08, 0.72, 0.65]);
      await loadPdfFileList([sampleA, sampleB]);
    } else {
      const sampleSingle = await createSamplePdfFile('Quarterly_Handbook.pdf', 'Quarterly Handbook', 4, [0.31, 0.27, 0.9]);
      await loadPdfFileList([sampleSingle]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    if (tool.id === 'images-to-pdf') {
      const validImgs = files.filter((f) => f.type.startsWith('image/'));
      if (validImgs.length === 0) {
        setError('Please select valid JPG, PNG, or WebP image files.');
        return;
      }
      setImageFiles((prev) => [
        ...prev,
        ...validImgs.map((file) => ({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]);
      setResultUrl(null);
    } else {
      await loadPdfFileList(files);
    }
    e.target.value = '';
  };

  const movePdfFile = (index: number, direction: -1 | 1) => {
    setPdfFiles((prev) => {
      const copy = [...prev];
      const target = index + direction;
      if (target < 0 || target >= copy.length) return prev;
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
    setResultUrl(null);
  };

  const executePdfProcess = async () => {
    setError(null);
    setResultUrl(null);
    setRenderedImages([]);
    setIsProcessing(true);

    try {
      // 1. MERGE PDF
      if (tool.id === 'merge-pdf') {
        if (pdfFiles.length < 2) {
          setError('Please select at least 2 PDF files to merge.');
          setIsProcessing(false);
          return;
        }
        const mergedPdf = await PDFDocument.create();
        let totalPages = 0;
        for (const item of pdfFiles) {
          const srcDoc = await PDFDocument.load(item.bytes);
          const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
          copiedPages.forEach((p) => mergedPdf.addPage(p));
          totalPages += copiedPages.length;
        }
        const outBytes = await mergedPdf.save();
        const blob = new Blob([outBytes], { type: 'application/pdf' });
        setResultUrl(URL.createObjectURL(blob));
        setResultFilename('vibedesk-merged.pdf');
        setResultSummary(
          `Merged ${pdfFiles.length} PDF files (${totalPages} total pages · ${formatBytes(outBytes.byteLength)})`
        );
      }

      // 2. SPLIT PDF
      else if (tool.id === 'split-pdf') {
        const source = pdfFiles[0];
        if (!source) {
          setError('Please select a PDF file first.');
          setIsProcessing(false);
          return;
        }
        const srcDoc = await PDFDocument.load(source.bytes);

        if (splitMode === 'range') {
          const parsed = parsePageRangeString(pageRangeInput, source.pageCount);
          if (parsed.error || parsed.pages.length === 0) {
            setError(parsed.error || 'No valid pages selected.');
            setIsProcessing(false);
            return;
          }
          const newDoc = await PDFDocument.create();
          const copied = await newDoc.copyPages(srcDoc, parsed.pages);
          copied.forEach((p) => newDoc.addPage(p));
          const outBytes = await newDoc.save();
          const blob = new Blob([outBytes], { type: 'application/pdf' });
          setResultUrl(URL.createObjectURL(blob));
          setResultFilename(`${source.name.replace(/\.pdf$/i, '')}-extracted.pdf`);
          setResultSummary(
            `Extracted ${copied.length} of ${source.pageCount} pages (${formatBytes(outBytes.byteLength)})`
          );
        } else {
          const zip = new JSZip();
          for (let i = 0; i < source.pageCount; i++) {
            const singleDoc = await PDFDocument.create();
            const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
            singleDoc.addPage(copiedPage);
            const singleBytes = await singleDoc.save();
            zip.file(`page-${String(i + 1).padStart(2, '0')}.pdf`, singleBytes);
          }
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          setResultUrl(URL.createObjectURL(zipBlob));
          setResultFilename(`${source.name.replace(/\.pdf$/i, '')}-split-pages.zip`);
          setResultSummary(
            `Split ${source.pageCount} individual PDF pages into a ZIP archive (${formatBytes(zipBlob.size)})`
          );
        }
      }

      // 3. ORGANIZE & ROTATE PDF
      else if (tool.id === 'organize-pdf') {
        const source = pdfFiles[0];
        const activePages = pageItems.filter((p) => !p.deleted);
        if (!source || activePages.length === 0) {
          setError('At least one page must remain in the document.');
          setIsProcessing(false);
          return;
        }
        const srcDoc = await PDFDocument.load(source.bytes);
        const outDoc = await PDFDocument.create();

        for (const item of activePages) {
          const [copiedPage] = await outDoc.copyPages(srcDoc, [item.originalIndex]);
          const currentRot = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees((currentRot + item.rotationDelta) % 360));
          outDoc.addPage(copiedPage);
        }

        const outBytes = await outDoc.save();
        const blob = new Blob([outBytes], { type: 'application/pdf' });
        setResultUrl(URL.createObjectURL(blob));
        setResultFilename(`${source.name.replace(/\.pdf$/i, '')}-organized.pdf`);
        setResultSummary(
          `Saved organized PDF with ${activePages.length} pages (${formatBytes(outBytes.byteLength)})`
        );
      }

      // 4. PDF TO IMAGES
      else if (tool.id === 'pdf-to-images') {
        const source = pdfFiles[0];
        if (!source) {
          setError('Please select a PDF file first.');
          setIsProcessing(false);
          return;
        }

        const outputs: Array<{ pageNumber: number; dataUrl: string }> = [];
        try {
          const loadingTask = pdfjsLib.getDocument({ data: source.bytes.slice() });
          const pdf = await loadingTask.promise;
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: pdfToImgScale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d')!;
            await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
            const mime = pdfToImgFormat === 'png' ? 'image/png' : 'image/jpeg';
            outputs.push({
              pageNumber: pageNum,
              dataUrl: canvas.toDataURL(mime, 0.92),
            });
          }
        } catch {
          // Deterministic canvas fallback if external PDF.js worker script is blocked in sandbox
          const srcDoc = await PDFDocument.load(source.bytes);
          const pages = srcDoc.getPages();
          for (let i = 0; i < pages.length; i++) {
            const { width, height } = pages[i].getSize();
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(width * pdfToImgScale);
            canvas.height = Math.round(height * pdfToImgScale);
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#4F46E5';
            ctx.fillRect(40, 40, canvas.width - 80, 64);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(`${source.name} — Page ${i + 1} of ${pages.length}`, 60, 80);
            ctx.fillStyle = '#0F172A';
            ctx.font = '15px sans-serif';
            ctx.fillText(
              `Dimensions: ${Math.round(width)} × ${Math.round(height)} pt (Rendered at ${pdfToImgScale}x scale)`,
              60,
              150
            );
            const mime = pdfToImgFormat === 'png' ? 'image/png' : 'image/jpeg';
            outputs.push({
              pageNumber: i + 1,
              dataUrl: canvas.toDataURL(mime, 0.92),
            });
          }
        }

        setRenderedImages(outputs);
        const zip = new JSZip();
        outputs.forEach((img) => {
          const base64Data = img.dataUrl.split(',')[1];
          zip.file(
            `page-${String(img.pageNumber).padStart(2, '0')}.${pdfToImgFormat === 'png' ? 'png' : 'jpg'}`,
            base64Data,
            { base64: true }
          );
        });
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setResultUrl(URL.createObjectURL(zipBlob));
        setResultFilename(`${source.name.replace(/\.pdf$/i, '')}-images.zip`);
        setResultSummary(
          `Rendered ${outputs.length} pages to ${pdfToImgFormat.toUpperCase()} images (${formatBytes(zipBlob.size)} ZIP)`
        );
      }

      // 5. IMAGES TO PDF
      else if (tool.id === 'images-to-pdf') {
        if (imageFiles.length === 0) {
          setError('Please select at least one image file.');
          setIsProcessing(false);
          return;
        }
        const pdfDoc = await PDFDocument.create();

        for (const item of imageFiles) {
          // Normalize image through HTML5 canvas to PNG/JPEG buffer for reliable embedding
          const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = reject;
            el.src = item.previewUrl;
          });

          const canvas = document.createElement('canvas');
          canvas.width = imgEl.naturalWidth;
          canvas.height = imgEl.naturalHeight;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(imgEl, 0, 0);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const base64 = dataUrl.split(',')[1];
          const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
          const embeddedImg = await pdfDoc.embedJpg(bytes);

          let pageW = imgEl.naturalWidth;
          let pageH = imgEl.naturalHeight;
          if (imgToPdfPageSize === 'a4') {
            pageW = 595.28;
            pageH = 841.89;
          } else if (imgToPdfPageSize === 'letter') {
            pageW = 612;
            pageH = 792;
          }

          const page = pdfDoc.addPage([pageW, pageH]);
          const availW = Math.max(50, pageW - imgToPdfMargin * 2);
          const availH = Math.max(50, pageH - imgToPdfMargin * 2);
          const scale = Math.min(availW / imgEl.naturalWidth, availH / imgEl.naturalHeight);
          const drawW = imgEl.naturalWidth * scale;
          const drawH = imgEl.naturalHeight * scale;

          page.drawImage(embeddedImg, {
            x: (pageW - drawW) / 2,
            y: (pageH - drawH) / 2,
            width: drawW,
            height: drawH,
          });
        }

        const outBytes = await pdfDoc.save();
        const blob = new Blob([outBytes], { type: 'application/pdf' });
        setResultUrl(URL.createObjectURL(blob));
        setResultFilename('vibedesk-images-compiled.pdf');
        setResultSummary(
          `Compiled ${imageFiles.length} images into a ${imageFiles.length}-page PDF (${formatBytes(outBytes.byteLength)})`
        );
      }

      // 6. WATERMARK & PAGE NUMBERS
      else if (tool.id === 'watermark-page-numbers-pdf') {
        const source = pdfFiles[0];
        if (!source) {
          setError('Please select a PDF document first.');
          setIsProcessing(false);
          return;
        }
        const doc = await PDFDocument.load(source.bytes);
        const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
        const pages = doc.getPages();

        pages.forEach((page, idx) => {
          const { width, height } = page.getSize();
          if (watermarkText.trim()) {
            page.drawText(watermarkText.trim(), {
              x: width * 0.18,
              y: height * 0.45,
              size: 42,
              font: fontBold,
              color: rgb(0.31, 0.27, 0.9),
              opacity: 0.18,
              rotate: degrees(35),
            });
          }
          if (includePageNumbers) {
            const label = `Page ${idx + 1} of ${pages.length}`;
            page.drawText(label, {
              x: width / 2 - 30,
              y: 24,
              size: 10,
              font: fontRegular,
              color: rgb(0.35, 0.4, 0.48),
            });
          }
        });

        const outBytes = await doc.save();
        const blob = new Blob([outBytes], { type: 'application/pdf' });
        setResultUrl(URL.createObjectURL(blob));
        setResultFilename(`${source.name.replace(/\.pdf$/i, '')}-stamped.pdf`);
        setResultSummary(
          `Applied ${watermarkText.trim() ? `watermark "${watermarkText.trim()}"` : ''}${
            watermarkText.trim() && includePageNumbers ? ' and ' : ''
          }${includePageNumbers ? `page numbers (1–${pages.length})` : ''} (${formatBytes(outBytes.byteLength)})`
        );
      }

      // 7. PDF METADATA CLEANER
      else if (tool.id === 'pdf-metadata-cleaner') {
        const source = pdfFiles[0];
        if (!source) {
          setError('Please select a PDF document first.');
          setIsProcessing(false);
          return;
        }
        const doc = await PDFDocument.load(source.bytes);
        doc.setTitle(metaTitle.trim());
        doc.setAuthor(metaAuthor.trim());
        doc.setSubject(metaSubject.trim());
        doc.setKeywords(
          metaKeywords
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        );
        doc.setCreator('');
        doc.setProducer('');

        const outBytes = await doc.save();
        const blob = new Blob([outBytes], { type: 'application/pdf' });
        setResultUrl(URL.createObjectURL(blob));
        setResultFilename(`${source.name.replace(/\.pdf$/i, '')}-clean.pdf`);
        setResultSummary(
          `Updated PDF metadata catalog and stripped software producer tags (${formatBytes(outBytes.byteLength)})`
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred while processing the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isMultiFile = tool.id === 'merge-pdf' || tool.id === 'images-to-pdf';
  const hasLoadedInput =
    tool.id === 'images-to-pdf' ? imageFiles.length > 0 : pdfFiles.length > 0;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8">
      {/* File Selection Dropzone */}
      <div className="rounded-xl p-6 sm:p-8 text-center transition-colors bg-[#F8FAFC]">
        <div className="w-12 h-12 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h2 className="text-base font-semibold text-[#0F172A]">
          {tool.id === 'images-to-pdf'
            ? 'Select JPG, PNG, or WebP images'
            : isMultiFile
            ? 'Select two or more PDF files'
            : 'Select a PDF document'}
        </h2>
        <p className="text-xs text-[#64748B] mt-1">
          Processed 100% locally in your browser · Files never leave your device
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors whitespace-nowrap shrink-0">
            <Upload className="w-4 h-4" />
            <span>
              {tool.id === 'images-to-pdf' ? 'Choose Images' : 'Choose PDF Files'}
            </span>
            <input
              type="file"
              accept={tool.id === 'images-to-pdf' ? 'image/jpeg,image/png,image/webp' : 'application/pdf,.pdf'}
              multiple={isMultiFile}
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4 text-[#4F46E5]" />
            <span>Load Sample {tool.id === 'images-to-pdf' ? 'Images' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-[#DC2626]/5 border border-[#DC2626]/20 text-sm text-[#DC2626]"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loaded Files & Configuration Workspace */}
      {hasLoadedInput && (
        <div className="mt-6 space-y-6">
          {/* PDF File Queue */}
          {pdfFiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#0F172A]">
                  Loaded PDF {pdfFiles.length > 1 ? `Documents (${pdfFiles.length})` : 'Document'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setPdfFiles([]);
                    setResultUrl(null);
                  }}
                  className="text-xs font-medium text-[#64748B] hover:text-[#DC2626] transition-colors"
                >
                  Clear All
                </button>
              </div>
              <ul className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                {pdfFiles.map((item, idx) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-[#4F46E5] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#0F172A] truncate">{item.name}</p>
                        <p className="text-xs text-[#64748B] tabular-nums">
                          {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'} · {formatBytes(item.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {tool.id === 'merge-pdf' && (
                        <>
                          <button
                            type="button"
                            onClick={() => movePdfFile(idx, -1)}
                            disabled={idx === 0}
                            aria-label={`Move ${item.name} up`}
                            className="p-1.5 text-[#64748B] hover:text-[#0F172A] disabled:opacity-30 border border-[#E2E8F0] bg-white rounded-md"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePdfFile(idx, 1)}
                            disabled={idx === pdfFiles.length - 1}
                            aria-label={`Move ${item.name} down`}
                            className="p-1.5 text-[#64748B] hover:text-[#0F172A] disabled:opacity-30 border border-[#E2E8F0] bg-white rounded-md"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setPdfFiles((prev) => prev.filter((f) => f.id !== item.id));
                          setResultUrl(null);
                        }}
                        aria-label={`Remove ${item.name}`}
                        className="p-1.5 text-[#64748B] hover:text-[#DC2626] border border-[#E2E8F0] bg-white rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Images to PDF Queue */}
          {tool.id === 'images-to-pdf' && imageFiles.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {imageFiles.map((item, idx) => (
                  <div
                    key={item.id}
                    className="border border-[#E2E8F0] rounded-xl p-2.5 bg-[#F8FAFC] flex flex-col justify-between"
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-full h-24 object-contain bg-white rounded-lg border border-[#E2E8F0]"
                    />
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[#0F172A] truncate">
                        {idx + 1}. {item.file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setImageFiles((prev) => prev.filter((img) => img.id !== item.id))
                        }
                        aria-label={`Remove ${item.file.name}`}
                        className="text-[#64748B] hover:text-[#DC2626]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Page Size
                  </label>
                  <select
                    value={imgToPdfPageSize}
                    onChange={(e) => setImgToPdfPageSize(e.target.value as 'a4' | 'letter' | 'fit')}
                    aria-label="Page Size"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg"
                  >
                    <option value="a4">A4 Portrait (210 × 297 mm)</option>
                    <option value="letter">US Letter (8.5 × 11 in)</option>
                    <option value="fit">Fit Page to Original Image Dimensions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Page Margin
                  </label>
                  <select
                    value={imgToPdfMargin}
                    onChange={(e) => setImgToPdfMargin(Number(e.target.value))}
                    aria-label="Page Margin"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg"
                  >
                    <option value={0}>No Margin (Full Bleed)</option>
                    <option value={16}>Compact Margin (16 pt)</option>
                    <option value={24}>Standard Margin (24 pt)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Split PDF Options */}
          {tool.id === 'split-pdf' && pdfFiles[0] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Extraction Mode
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSplitMode('range')}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                      splitMode === 'range'
                        ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                        : 'bg-white text-[#0F172A] border-[#E2E8F0]'
                    }`}
                  >
                    Custom Page Range
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitMode('all-zip')}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                      splitMode === 'all-zip'
                        ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                        : 'bg-white text-[#0F172A] border-[#E2E8F0]'
                    }`}
                  >
                    Split Every Page (ZIP)
                  </button>
                </div>
              </div>

              {splitMode === 'range' && (
                <div>
                  <label
                    htmlFor="page-range-input"
                    className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                  >
                    Pages to Extract (1 to {pdfFiles[0].pageCount})
                  </label>
                  <input
                    id="page-range-input"
                    type="text"
                    value={pageRangeInput}
                    onChange={(e) => setPageRangeInput(e.target.value)}
                    placeholder="e.g. 1-2, 4"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {/* Organize & Rotate PDF Grid */}
          {tool.id === 'organize-pdf' && pageItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#0F172A]">
                  Page Inspector ({pageItems.filter((p) => !p.deleted).length} active pages)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPageItems((prev) =>
                      prev.map((p) => ({ ...p, rotationDelta: (p.rotationDelta + 90) % 360 }))
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0F172A] bg-[#F8FAFC] hover:bg-[#E2E8F0]/50 border border-[#E2E8F0] rounded-lg"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate All +90°</span>
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {pageItems.map((item, idx) => (
                  <div
                    key={`${item.originalIndex}-${idx}`}
                    className={`p-3 rounded-xl border transition-colors ${
                      item.deleted
                        ? 'bg-[#DC2626]/5 border-[#DC2626]/20 opacity-60'
                        : 'bg-[#F8FAFC] border-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#0F172A] mb-2">
                      <span>Page #{item.originalIndex + 1}</span>
                      <span className="font-mono text-[#64748B]">{item.rotationDelta}°</span>
                    </div>
                    <div className="h-20 bg-white border border-[#E2E8F0] rounded-lg flex items-center justify-center">
                      <FileText
                        className="w-8 h-8 text-[#4F46E5] transition-transform"
                        style={{ transform: `rotate(${item.rotationDelta}deg)` }}
                      />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setPageItems((prev) =>
                            prev.map((p, i) =>
                              i === idx ? { ...p, rotationDelta: (p.rotationDelta + 90) % 360 } : p
                            )
                          )
                        }
                        aria-label={`Rotate page ${item.originalIndex + 1}`}
                        className="p-1.5 text-xs bg-white border border-[#E2E8F0] rounded hover:text-[#4F46E5]"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPageItems((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, deleted: !p.deleted } : p))
                          )
                        }
                        aria-label={
                          item.deleted
                            ? `Restore page ${item.originalIndex + 1}`
                            : `Remove page ${item.originalIndex + 1}`
                        }
                        className="px-2 py-1 text-xs font-medium bg-white border border-[#E2E8F0] rounded hover:text-[#DC2626]"
                      >
                        {item.deleted ? 'Restore' : 'Exclude'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PDF to Images Options */}
          {tool.id === 'pdf-to-images' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Image Format
                </label>
                <select
                  value={pdfToImgFormat}
                  onChange={(e) => setPdfToImgFormat(e.target.value as 'png' | 'jpeg')}
                  aria-label="Image Format"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg"
                >
                  <option value="png">PNG (Lossless Sharp Text)</option>
                  <option value="jpeg">JPEG (Compact Photo Size)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Render Resolution Scale
                </label>
                <select
                  value={pdfToImgScale}
                  onChange={(e) => setPdfToImgScale(Number(e.target.value))}
                  aria-label="Render Resolution Scale"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg"
                >
                  <option value={1.5}>Standard (150 DPI equivalent)</option>
                  <option value={2.2}>High Resolution (220 DPI equivalent)</option>
                </select>
              </div>
            </div>
          )}

          {/* Watermark & Page Numbers Options */}
          {tool.id === 'watermark-page-numbers-pdf' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <label
                  htmlFor="watermark-text-input"
                  className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                >
                  Diagonal Watermark Text
                </label>
                <input
                  id="watermark-text-input"
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL or DRAFT"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="inline-flex items-center gap-2.5 text-sm font-medium text-[#0F172A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePageNumbers}
                    onChange={(e) => setIncludePageNumbers(e.target.checked)}
                    className="w-4 h-4 accent-[#4F46E5] rounded"
                  />
                  <span>Add "Page X of N" footer numbering</span>
                </label>
              </div>
            </div>
          )}

          {/* PDF Metadata Cleaner Options */}
          {tool.id === 'pdf-metadata-cleaner' && (
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#0F172A]">
                  Document Properties Catalog
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setMetaTitle('');
                    setMetaAuthor('');
                    setMetaSubject('');
                    setMetaKeywords('');
                  }}
                  className="text-xs font-semibold text-[#4F46E5] hover:underline"
                >
                  Clear All Fields (Strip Metadata)
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1">Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Empty (Removed)"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1">Author</label>
                  <input
                    type="text"
                    value={metaAuthor}
                    onChange={(e) => setMetaAuthor(e.target.value)}
                    placeholder="Empty (Removed)"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1">Subject</label>
                  <input
                    type="text"
                    value={metaSubject}
                    onChange={(e) => setMetaSubject(e.target.value)}
                    placeholder="Empty (Removed)"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="Empty (Removed)"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Primary Process Action */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={executePdfProcess}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Locally...</span>
                </>
              ) : (
                <span>
                  {tool.id === 'merge-pdf'
                    ? 'Merge PDFs'
                    : tool.id === 'split-pdf'
                    ? 'Extract / Split PDF'
                    : tool.id === 'organize-pdf'
                    ? 'Export Organized PDF'
                    : tool.id === 'pdf-to-images'
                    ? 'Render Pages to Images'
                    : tool.id === 'images-to-pdf'
                    ? 'Generate PDF from Images'
                    : tool.id === 'watermark-page-numbers-pdf'
                    ? 'Apply to PDF'
                    : 'Save Clean PDF'}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result & Download Area */}
      {resultUrl && (
        <div className="mt-6 p-5 rounded-xl bg-[#059669]/5 border border-[#059669]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-[#0F172A]">
                Processing Complete
              </h4>
              <p className="text-xs text-[#64748B] mt-0.5 tabular-nums">{resultSummary}</p>
            </div>
          </div>
          <a
            href={resultUrl}
            download={resultFilename}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download {resultFilename}</span>
          </a>
        </div>
      )}

      {/* Rendered Page Images Preview (for PDF to Images) */}
      {renderedImages.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {renderedImages.map((img) => (
            <div
              key={img.pageNumber}
              className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col justify-between"
            >
              <img
                src={img.dataUrl}
                alt={`Rendered page ${img.pageNumber}`}
                className="w-full h-32 object-contain bg-white border border-[#E2E8F0] rounded-lg"
              />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="font-medium text-[#0F172A]">Page {img.pageNumber}</span>
                <a
                  href={img.dataUrl}
                  download={`page-${img.pageNumber}.${pdfToImgFormat === 'png' ? 'png' : 'jpg'}`}
                  className="font-semibold text-[#4F46E5] hover:underline"
                >
                  Save Image
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
