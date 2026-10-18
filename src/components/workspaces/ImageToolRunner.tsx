import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Download,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sparkles,
  Copy,
  Check,
  Lock,
  Unlock,
} from 'lucide-react';
import { ToolDefinition } from '../../data/toolRegistry';

interface ImageToolRunnerProps {
  tool: ToolDefinition;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function rgbToHsl(r: number, g: number, b: number): string {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export function ImageToolRunner({ tool }: ImageToolRunnerProps) {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [naturalWidth, setNaturalWidth] = useState<number>(0);
  const [naturalHeight, setNaturalHeight] = useState<number>(0);

  // Output state
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);
  const [outputWidth, setOutputWidth] = useState<number>(0);
  const [outputHeight, setOutputHeight] = useState<number>(0);

  // Settings
  const [quality, setQuality] = useState<number>(78);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>(
    tool.id === 'convert-image' ? 'image/webp' : 'image/jpeg'
  );
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [cropPreset, setCropPreset] = useState<'none' | '1:1' | '16:9' | '4:3'>('none');

  // Color Picker state
  const [sampledColor, setSampledColor] = useState<{
    hex: string;
    rgb: string;
    hsl: string;
    x: number;
    y: number;
  }>({
    hex: '#4F46E5',
    rgb: 'rgb(79, 70, 229)',
    hsl: 'hsl(243, 75%, 59%)',
    x: 0,
    y: 0,
  });
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const inspectorCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setSourceFile(null);
    setSourceUrl(null);
    setOutputUrl(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCropPreset('none');
    setOutputFormat(tool.id === 'convert-image' ? 'image/webp' : 'image/jpeg');
  }, [tool.id]);

  const loadSelectedImage = (file: File) => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setSourceFile(file);
      setSourceUrl(url);
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);

      if (tool.id === 'image-inspector-color-picker' && inspectorCanvasRef.current) {
        const c = inspectorCanvasRef.current;
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const pixel = ctx.getImageData(
          Math.floor(img.naturalWidth / 2),
          Math.floor(img.naturalHeight / 2),
          1,
          1
        ).data;
        setSampledColor({
          hex: rgbToHex(pixel[0], pixel[1], pixel[2]),
          rgb: `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`,
          hsl: rgbToHsl(pixel[0], pixel[1], pixel[2]),
          x: Math.floor(img.naturalWidth / 2),
          y: Math.floor(img.naturalHeight / 2),
        });
      }
    };
    img.src = url;
  };

  const handleLoadSampleArtwork = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d')!;

    // Draw rich geometric architectural scene for compression/inspection
    const grad = ctx.createLinearGradient(0, 0, 1200, 800);
    grad.addColorStop(0, '#4F46E5');
    grad.addColorStop(0.55, '#0D9488');
    grad.addColorStop(1, '#0F172A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 800);

    // Subtle geometric grid circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.beginPath();
    ctx.arc(920, 260, 180, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(80, 520, 1040, 200);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText('VibeDesk High-Resolution Sample Image', 120, 605);
    ctx.fillStyle = '#64748B';
    ctx.font = '26px sans-serif';
    ctx.fillText('1200 × 800 px · Local Browser Canvas Pipeline', 120, 660);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const sample = new File([blob], 'vibedesk-sample-studio.png', { type: 'image/png' });
          loadSelectedImage(sample);
        }
      },
      'image/png'
    );
  };

  // Re-render processed image whenever parameters change
  useEffect(() => {
    if (!sourceUrl || !naturalWidth || !naturalHeight || tool.id === 'image-inspector-color-picker') {
      return;
    }

    const img = new Image();
    img.onload = () => {
      let sx = 0;
      let sy = 0;
      let sw = img.naturalWidth;
      let sh = img.naturalHeight;

      if (tool.id === 'crop-rotate-image' && cropPreset !== 'none') {
        const [rw, rh] = cropPreset.split(':').map(Number);
        const targetRatio = rw / rh;
        const currentRatio = sw / sh;
        if (currentRatio > targetRatio) {
          sw = Math.round(sh * targetRatio);
          sx = Math.round((img.naturalWidth - sw) / 2);
        } else {
          sh = Math.round(sw / targetRatio);
          sy = Math.round((img.naturalHeight - sh) / 2);
        }
      }

      let destW = tool.id === 'resize-image' && targetWidth > 0 ? targetWidth : sw;
      let destH = tool.id === 'resize-image' && targetHeight > 0 ? targetHeight : sh;

      const isRotated90 = rotation % 180 !== 0;
      const canvas = document.createElement('canvas');
      canvas.width = isRotated90 ? destH : destW;
      canvas.height = isRotated90 ? destW : destH;

      const ctx = canvas.getContext('2d')!;
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, sx, sy, sw, sh, -destW / 2, -destH / 2, destW, destH);
      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          setOutputUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
          setOutputSize(blob.size);
          setOutputWidth(canvas.width);
          setOutputHeight(canvas.height);
        },
        outputFormat,
        outputFormat === 'image/png' ? undefined : quality / 100
      );
    };
    img.src = sourceUrl;
  }, [
    sourceUrl,
    naturalWidth,
    naturalHeight,
    quality,
    outputFormat,
    targetWidth,
    targetHeight,
    rotation,
    flipH,
    flipV,
    cropPreset,
    tool.id,
  ]);

  const handleCanvasSampleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = inspectorCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.max(0, Math.min(canvas.width - 1, Math.floor((e.clientX - rect.left) * scaleX)));
    const y = Math.max(0, Math.min(canvas.height - 1, Math.floor((e.clientY - rect.top) * scaleY)));
    const ctx = canvas.getContext('2d')!;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setSampledColor({
      hex: rgbToHex(pixel[0], pixel[1], pixel[2]),
      rgb: `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`,
      hsl: rgbToHsl(pixel[0], pixel[1], pixel[2]),
      x,
      y,
    });
  };

  const copyColorValue = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedToken(val);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  const ext =
    outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';
  const savingsPercent =
    sourceFile && outputSize > 0
      ? Math.round(((sourceFile.size - outputSize) / sourceFile.size) * 100)
      : 0;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8">
      {/* Dropzone */}
      {!sourceFile ? (
        <div className="rounded-xl p-8 text-center transition-colors bg-[#F8FAFC]">
          <div className="w-12 h-12 rounded-xl bg-[#14B8A6]/10 text-[#0D9488] flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-[#0F172A]">
            Select a JPG, PNG, or WebP image
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Instant client-side processing with live before/after size comparison
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors whitespace-nowrap shrink-0">
              <Upload className="w-4 h-4" />
              <span>Choose Image</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) loadSelectedImage(f);
                }}
                className="sr-only"
              />
            </label>
            <button
              type="button"
              onClick={handleLoadSampleArtwork}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span>Load Sample Image</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">{sourceFile.name}</h3>
              <p className="text-xs text-[#64748B] tabular-nums">
                Original: {naturalWidth} × {naturalHeight} px · {formatBytes(sourceFile.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSourceFile(null);
                setSourceUrl(null);
                setOutputUrl(null);
              }}
              className="px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] rounded-lg"
            >
              Change Image
            </button>
          </div>

          {/* Inspector & Color Picker Mode */}
          {tool.id === 'image-inspector-color-picker' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <p className="text-xs font-medium text-[#64748B] mb-2">
                  Click anywhere on the image below to sample pixel color values:
                </p>
                <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#F8FAFC] flex items-center justify-center p-2">
                  <canvas
                    ref={inspectorCanvasRef}
                    onClick={handleCanvasSampleClick}
                    className="max-h-[420px] w-auto cursor-crosshair rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                  <h4 className="text-xs font-semibold text-[#0F172A]">Sampled Pixel Color</h4>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl border border-[#E2E8F0] shrink-0"
                      style={{ backgroundColor: sampledColor.hex }}
                    />
                    <div className="text-xs text-[#64748B] tabular-nums">
                      Coordinates: X {sampledColor.x}, Y {sampledColor.y}
                    </div>
                  </div>

                  {[
                    { label: 'HEX', val: sampledColor.hex },
                    { label: 'RGB', val: sampledColor.rgb },
                    { label: 'HSL', val: sampledColor.hsl },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg"
                    >
                      <span className="text-xs font-mono text-[#0F172A]">{row.val}</span>
                      <button
                        type="button"
                        onClick={() => copyColorValue(row.val)}
                        aria-label={`Copy ${row.label} color`}
                        className="text-xs font-medium text-[#4F46E5] inline-flex items-center gap-1"
                      >
                        {copiedToken === row.val ? (
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

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
                  <h4 className="font-semibold text-[#0F172A]">Intrinsic Image Properties</h4>
                  <div className="flex justify-between text-[#64748B] tabular-nums">
                    <span>Dimensions</span>
                    <span className="font-mono text-[#0F172A]">
                      {naturalWidth} × {naturalHeight} px
                    </span>
                  </div>
                  <div className="flex justify-between text-[#64748B] tabular-nums">
                    <span>Megapixels</span>
                    <span className="font-mono text-[#0F172A]">
                      {((naturalWidth * naturalHeight) / 1e6).toFixed(2)} MP
                    </span>
                  </div>
                  <div className="flex justify-between text-[#64748B] tabular-nums">
                    <span>File Size</span>
                    <span className="font-mono text-[#0F172A]">{formatBytes(sourceFile.size)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>MIME Type</span>
                    <span className="font-mono text-[#0F172A]">{sourceFile.type || 'image/*'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Controls Panel */}
              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Resize Controls */}
                {tool.id === 'resize-image' && (
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        min={16}
                        max={8000}
                        value={targetWidth}
                        onChange={(e) => {
                          const w = Math.max(1, Number(e.target.value));
                          setTargetWidth(w);
                          if (lockAspect && naturalWidth > 0) {
                            setTargetHeight(Math.round((w * naturalHeight) / naturalWidth));
                          }
                        }}
                        aria-label="Width in pixels"
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg font-mono tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        min={16}
                        max={8000}
                        value={targetHeight}
                        onChange={(e) => {
                          const h = Math.max(1, Number(e.target.value));
                          setTargetHeight(h);
                          if (lockAspect && naturalHeight > 0) {
                            setTargetWidth(Math.round((h * naturalWidth) / naturalHeight));
                          }
                        }}
                        aria-label="Height in pixels"
                        className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg font-mono tabular-nums"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLockAspect((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                      >
                        {lockAspect ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-[#4F46E5]" />
                            <span>Ratio Locked</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>Unlocked</span>
                          </>
                        )}
                      </button>
                      {[0.5, 0.75].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            setTargetWidth(Math.round(naturalWidth * pct));
                            setTargetHeight(Math.round(naturalHeight * pct));
                          }}
                          className="px-2.5 py-2 text-xs font-semibold bg-white border border-[#E2E8F0] rounded-lg hover:border-[#4F46E5]"
                        >
                          {pct * 100}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Crop & Rotate Controls */}
                {tool.id === 'crop-rotate-image' && (
                  <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-[#E2E8F0] rounded-lg hover:border-[#4F46E5]"
                      >
                        <RotateCw className="w-4 h-4 text-[#4F46E5]" />
                        <span>Rotate +90°</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlipH((f) => !f)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border rounded-lg ${
                          flipH
                            ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                            : 'bg-white text-[#0F172A] border-[#E2E8F0]'
                        }`}
                      >
                        <FlipHorizontal className="w-4 h-4" />
                        <span>Flip Horizontal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlipV((f) => !f)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border rounded-lg ${
                          flipV
                            ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                            : 'bg-white text-[#0F172A] border-[#E2E8F0]'
                        }`}
                      >
                        <FlipVertical className="w-4 h-4" />
                        <span>Flip Vertical</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#64748B] mr-1">Crop Ratio:</span>
                      {(['none', '1:1', '16:9', '4:3'] as const).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setCropPreset(ratio)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                            cropPreset === ratio
                              ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                              : 'bg-white text-[#0F172A] border-[#E2E8F0]'
                          }`}
                        >
                          {ratio === 'none' ? 'Original' : ratio}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Output Format & Quality */}
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Output Image Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) =>
                      setOutputFormat(e.target.value as 'image/jpeg' | 'image/webp' | 'image/png')
                    }
                    aria-label="Output Image Format"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg"
                  >
                    <option value="image/jpeg">JPEG (.jpg) — Best for Photos</option>
                    <option value="image/webp">WebP (.webp) — Modern High Compression</option>
                    <option value="image/png">PNG (.png) — Lossless Graphics</option>
                  </select>
                </div>

                {outputFormat !== 'image/png' && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-[#0F172A] mb-1.5">
                      <label htmlFor="img-quality-slider">Compression Quality</label>
                      <span className="font-mono text-[#4F46E5] tabular-nums">{quality}%</span>
                    </div>
                    <input
                      id="img-quality-slider"
                      type="range"
                      min={15}
                      max={95}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full accent-[#4F46E5]"
                    />
                  </div>
                )}
              </div>

              {/* Before / After Comparison & Download Bar */}
              {outputUrl && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                      <div className="flex items-center justify-between text-xs text-[#64748B] mb-2 tabular-nums">
                        <span className="font-semibold text-[#0F172A]">Original</span>
                        <span>
                          {naturalWidth} × {naturalHeight} px · {formatBytes(sourceFile.size)}
                        </span>
                      </div>
                      <img
                        src={sourceUrl!}
                        alt="Original preview"
                        className="w-full h-48 object-contain bg-white rounded-lg border border-[#E2E8F0]"
                      />
                    </div>

                    <div className="p-3 rounded-xl border border-[#059669]/30 bg-[#059669]/5">
                      <div className="flex items-center justify-between text-xs text-[#64748B] mb-2 tabular-nums">
                        <span className="font-semibold text-[#0F172A]">
                          Processed ({ext.toUpperCase()})
                        </span>
                        <span className="font-semibold text-[#059669]">
                          {outputWidth} × {outputHeight} px · {formatBytes(outputSize)}
                          {savingsPercent > 0 ? ` (-${savingsPercent}%)` : ''}
                        </span>
                      </div>
                      <img
                        src={outputUrl}
                        alt="Processed output preview"
                        className="w-full h-48 object-contain bg-white rounded-lg border border-[#E2E8F0]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <a
                      href={outputUrl}
                      download={`${sourceFile.name.replace(/\.[^.]+$/, '')}-vibedesk.${ext}`}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-xl transition-colors whitespace-nowrap shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download {ext.toUpperCase()} Image</span>
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
