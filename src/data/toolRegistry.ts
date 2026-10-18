/**
 * VibeDesk Centralized Tool Registry
 * Defines all categories, subcategories, and published/planned tools.
 * Only tools with status === 'published' are exposed as active tools on the public portal.
 */

export type ToolCategorySlug =
  | 'pdf'
  | 'images'
  | 'calculators'
  | 'converters'
  | 'text-tools'
  | 'file-utilities';

export type WorkspaceType = 'file' | 'calculator' | 'text';

export type ToolStatus = 'planned' | 'in-development' | 'testing' | 'published';

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  slug: string;
  category: ToolCategorySlug;
  subcategory: string;
  icon: string;
  shortDescription: string;
  introduction: string;
  searchKeywords: string[];
  supportedInputs: string[];
  supportedOutputs: string[];
  workspaceType: WorkspaceType;
  processingEngine: string;
  status: ToolStatus;
  publishedAt: string; // YYYY-MM-DD
  featuredPriority?: number; // Lower number = higher priority in Featured/Popular Picks
  verifiedCapabilities: string[];
  limitations: string[];
  instructions: string[];
  faqs: ToolFAQ[];
  seoMetadata: {
    title: string;
    description: string;
  };
}

export interface CategoryDefinition {
  slug: ToolCategorySlug;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  accentColor: string;
  subcategories: string[];
  faqs: ToolFAQ[];
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    slug: 'pdf',
    name: 'PDF Management',
    shortName: 'PDF Management',
    description:
      'Combine, split, reorder, rotate, watermark, and convert PDF documents directly in your browser without uploading files to external servers.',
    icon: 'FileText',
    accentColor: '#4F46E5',
    subcategories: [
      'Organize PDF',
      'Convert PDF',
      'Edit & Annotate PDF',
      'PDF Security & Metadata',
    ],
    faqs: [
      {
        question: 'Are my PDF documents uploaded to any server?',
        answer:
          'No. All PDF operations in VibeDesk run locally inside your web browser using WebAssembly and JavaScript document processing. Your files never leave your device.',
      },
      {
        question: 'What is the maximum PDF file size supported?',
        answer:
          'Because processing happens in your device memory, files up to 100 MB (or up to 150 pages) process smoothly on most modern computers and mobile devices.',
      },
    ],
  },
  {
    slug: 'images',
    name: 'Image Tools',
    shortName: 'Image Tools',
    description:
      'Compress, resize, convert formats, crop, rotate, and inspect image metadata locally with side-by-side quality and file-size comparisons.',
    icon: 'Image',
    accentColor: '#0D9488',
    subcategories: ['Optimize', 'Convert', 'Edit', 'Utilities'],
    faqs: [
      {
        question: 'Which image formats are supported in the browser?',
        answer:
          'VibeDesk supports JPG/JPEG, PNG, and WebP for full reading, compression, resizing, and conversion using native HTML5 Canvas rendering.',
      },
      {
        question: 'Does compressing an image strip its transparency?',
        answer:
          'PNG and WebP formats preserve alpha transparency. Converting a transparent image to JPEG automatically fills transparent areas with a clean white background.',
      },
    ],
  },
  {
    slug: 'calculators',
    name: 'Calculators',
    shortName: 'Calculators',
    description:
      'Practical, high-precision calculators for everyday arithmetic, percentages, financial loans, tax rates, and calendar date durations.',
    icon: 'Calculator',
    accentColor: '#4F46E5',
    subcategories: ['Everyday', 'Financial', 'Date & Time'],
    faqs: [
      {
        question: 'Do VibeDesk calculators store my financial inputs?',
        answer:
          'Never. Every calculation executes immediately in memory and is cleared when you leave or reset the workspace.',
      },
      {
        question: 'How is monthly loan EMI calculated?',
        answer:
          'We use the standard reducing-balance amortization formula: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1), where P is principal, r is monthly interest rate, and n is total monthly installments.',
      },
    ],
  },
  {
    slug: 'converters',
    name: 'Converters',
    shortName: 'Converters',
    description:
      'Instant unit and data format converters for length, weight, temperature, area, digital storage, CSV/JSON datasets, and Base64/URL strings.',
    icon: 'ArrowLeftRight',
    accentColor: '#0D9488',
    subcategories: ['Measurement Converters', 'File & Data Converters'],
    faqs: [
      {
        question: 'What is the difference between Decimal (MB/GB) and Binary (MiB/GiB) storage units?',
        answer:
          'Decimal storage units use powers of 1,000 (1 GB = 1,000,000,000 bytes), while Binary IEC units use powers of 1,024 (1 GiB = 1,073,741,824 bytes). Our converter supports both.',
      },
    ],
  },
  {
    slug: 'text-tools',
    name: 'Text & Developer Tools',
    shortName: 'Text & Dev',
    description:
      'Clean utilities for comparing text diffs, counting words and reading time, converting text case, formatting JSON, and deduplicating lines.',
    icon: 'Code2',
    accentColor: '#4F46E5',
    subcategories: ['Analysis & Diff', 'Text Manipulation', 'Developer Formatting'],
    faqs: [
      {
        question: 'Can I compare code snippets with the Text Compare tool?',
        answer:
          'Yes. The line-by-line diff engine preserves indentation and monospace formatting, making it ideal for comparing configuration files, code blocks, or prose.',
      },
    ],
  },
  {
    slug: 'file-utilities',
    name: 'File Utilities',
    shortName: 'File Utilities',
    description:
      'Create ZIP archives from multiple files or verify cryptographic SHA-256 and SHA-1 file checksums locally in your browser.',
    icon: 'FolderArchive',
    accentColor: '#0D9488',
    subcategories: ['Archiving', 'Integrity & Checksums'],
    faqs: [
      {
        question: 'How are SHA-256 checksums computed without uploading the file?',
        answer:
          'VibeDesk uses the native browser Web Crypto API (crypto.subtle.digest) to compute cryptographic hashes directly from your local file buffer.',
      },
    ],
  },
];

export const TOOL_REGISTRY: ToolDefinition[] = [
  // ==========================================
  // 1. PDF MANAGEMENT
  // ==========================================
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    slug: 'merge-pdf',
    category: 'pdf',
    subcategory: 'Organize PDF',
    icon: 'Files',
    shortDescription: 'Combine multiple PDF documents into a single ordered file.',
    introduction:
      'Select two or more PDF files, arrange them in your preferred sequence, and merge them into a single clean PDF document right in your browser.',
    searchKeywords: ['combine pdf', 'join pdf', 'merge pdf files', 'binder', 'concatenate pdf'],
    supportedInputs: ['application/pdf (.pdf)'],
    supportedOutputs: ['Merged PDF Document (.pdf)'],
    workspaceType: 'file',
    processingEngine: 'pdf-lib client-side document assembly',
    status: 'published',
    publishedAt: '2026-09-10',
    featuredPriority: 1,
    verifiedCapabilities: [
      'Preserves original page dimensions and vector text quality',
      'Supports drag-and-drop or button-based file reordering',
      'Generates a built-in sample multi-file pair for instant testing',
    ],
    limitations: [
      'Password-encrypted PDFs must be unlocked before merging',
      'Recommended combined size up to 100 MB per session',
    ],
    instructions: [
      'Select two or more PDF files from your device (or load our sample PDFs).',
      'Use the Up and Down controls to arrange the exact document order.',
      'Click "Merge PDFs" and download your combined file immediately.',
    ],
    faqs: [
      {
        question: 'Does merging PDFs reduce text or image quality?',
        answer: 'No. Pages are copied directly at the byte stream level without re-compressing content.',
      },
    ],
    seoMetadata: {
      title: 'Merge PDF Files Online – Free, Private Browser Merger | VibeDesk',
      description: 'Combine multiple PDF files into one document in seconds. 100% local browser processing with zero server uploads.',
    },
  },
  {
    id: 'split-pdf',
    name: 'Split & Extract PDF',
    slug: 'split-pdf',
    category: 'pdf',
    subcategory: 'Organize PDF',
    icon: 'Scissors',
    shortDescription: 'Extract specific page ranges or split a PDF into separate pages.',
    introduction:
      'Extract selected pages into a new PDF file or split every page of a document into individual PDF files packaged in a convenient ZIP archive.',
    searchKeywords: ['split pdf', 'extract pages', 'separate pdf', 'cut pdf', 'page range'],
    supportedInputs: ['application/pdf (.pdf)'],
    supportedOutputs: ['Extracted PDF (.pdf) or ZIP of individual pages (.zip)'],
    workspaceType: 'file',
    processingEngine: 'pdf-lib + JSZip local extraction',
    status: 'published',
    publishedAt: '2026-09-12',
    featuredPriority: 3,
    verifiedCapabilities: [
      'Custom page range syntax (e.g., 1-3, 5)',
      'One-click extraction into a single PDF or individual page PDFs in a ZIP archive',
    ],
    limitations: ['Encrypted PDFs cannot be split without removing password protection first'],
    instructions: [
      'Select a PDF document from your device.',
      'Choose whether to extract a custom page range into one PDF or split all pages into separate files.',
      'Click "Process PDF" and download the resulting file.',
    ],
    faqs: [
      {
        question: 'How do I format custom page ranges?',
        answer: 'Use commas and hyphens, such as "1-3, 5, 8-10" to include pages 1, 2, 3, 5, 8, 9, and 10.',
      },
    ],
    seoMetadata: {
      title: 'Split PDF & Extract Pages Locally – Free Online Tool | VibeDesk',
      description: 'Extract specific pages from a PDF or split every page into separate files directly in your browser.',
    },
  },
  {
    id: 'organize-pdf',
    name: 'Organize & Rotate PDF',
    slug: 'organize-pdf',
    category: 'pdf',
    subcategory: 'Organize PDF',
    icon: 'LayoutGrid',
    shortDescription: 'Reorder, rotate individual pages, or remove unwanted pages from a PDF.',
    introduction:
      'Inspect every page of your PDF visually, rotate pages in 90-degree increments, reorder their sequence, or delete unnecessary pages before saving a clean document.',
    searchKeywords: ['reorder pdf', 'rotate pdf', 'delete pdf pages', 'remove pages', 'rearrange pdf'],
    supportedInputs: ['application/pdf (.pdf)'],
    supportedOutputs: ['Organized PDF (.pdf)'],
    workspaceType: 'file',
    processingEngine: 'pdf-lib + pdfjs-dist page inspector',
    status: 'published',
    publishedAt: '2026-09-18',
    featuredPriority: 6,
    verifiedCapabilities: [
      'Individual page rotation (90°, 180°, 270°)',
      'Page reordering and single-page deletion',
      'Batch rotate all pages clockwise or counter-clockwise',
    ],
    limitations: ['At least one page must remain in the document to export'],
    instructions: [
      'Load a PDF file to inspect its page list.',
      'Use the rotate, move left/right, or remove buttons on any page card.',
      'Click "Export Organized PDF" to save your updated document.',
    ],
    faqs: [
      {
        question: 'Is the rotation permanent in the downloaded file?',
        answer: 'Yes. The new page orientation metadata is written directly into the exported PDF structure.',
      },
    ],
    seoMetadata: {
      title: 'Organize, Reorder & Rotate PDF Pages Online | VibeDesk',
      description: 'Rearrange page order, rotate upside-down PDF pages, and delete unwanted pages privately in your browser.',
    },
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to Images',
    slug: 'pdf-to-images',
    category: 'pdf',
    subcategory: 'Convert PDF',
    icon: 'FileImage',
    shortDescription: 'Render PDF pages into high-resolution PNG or JPG images.',
    introduction:
      'Convert every page of a PDF document into crisp PNG or JPEG images at configurable DPI scale, downloadable individually or bundled as a ZIP archive.',
    searchKeywords: ['pdf to png', 'pdf to jpg', 'rasterize pdf', 'save pdf as image', 'export pdf pages'],
    supportedInputs: ['application/pdf (.pdf)'],
    supportedOutputs: ['PNG (.png), JPEG (.jpg), or ZIP archive (.zip)'],
    workspaceType: 'file',
    processingEngine: 'Mozilla PDF.js HTML5 Canvas renderer',
    status: 'published',
    publishedAt: '2026-09-25',
    verifiedCapabilities: [
      'Selectable output format (PNG or JPEG)',
      'Adjustable render resolution (Standard 1.5x or High-Res 2.5x)',
      'Download individual page images or all pages as a single ZIP',
    ],
    limitations: ['Very large page counts (>50 pages) at High-Res scale may take several seconds to render'],
    instructions: [
      'Select your PDF file.',
      'Choose PNG or JPEG output format and resolution scale.',
      'Click "Render Pages to Images" and download individual images or the full ZIP package.',
    ],
    faqs: [
      {
        question: 'Should I choose PNG or JPEG for PDF pages?',
        answer: 'Choose PNG for sharp text documents and diagrams, or JPEG for photo-heavy brochures with smaller file sizes.',
      },
    ],
    seoMetadata: {
      title: 'Convert PDF to PNG or JPG Images Locally | VibeDesk',
      description: 'Turn PDF pages into high-resolution PNG or JPG images right in your browser without uploading files.',
    },
  },
  {
    id: 'images-to-pdf',
    name: 'Images to PDF',
    slug: 'images-to-pdf',
    category: 'pdf',
    subcategory: 'Convert PDF',
    icon: 'FilePlus2',
    shortDescription: 'Compile JPG, PNG, or WebP images into a clean multi-page PDF.',
    introduction:
      'Turn photos, scanned receipts, or screenshots into a standardized PDF document with configurable page size (A4, Letter, or Fit-to-Image) and margins.',
    searchKeywords: ['jpg to pdf', 'png to pdf', 'photos to pdf', 'combine images to pdf'],
    supportedInputs: ['image/jpeg (.jpg)', 'image/png (.png)', 'image/webp (.webp)'],
    supportedOutputs: ['PDF Document (.pdf)'],
    workspaceType: 'file',
    processingEngine: 'pdf-lib image embedding engine',
    status: 'published',
    publishedAt: '2026-09-28',
    verifiedCapabilities: [
      'Supports A4, US Letter, or automatic Fit-to-Image page geometry',
      'Configurable page margins (None, Compact, Standard)',
      'Automatic WebP/PNG/JPEG normalization',
    ],
    limitations: ['Animated WebP or GIF files only embed their first frame'],
    instructions: [
      'Add one or more JPG, PNG, or WebP images.',
      'Arrange their order and select page size (A4, Letter, or Fit to Image).',
      'Click "Generate PDF" to download your compiled document.',
    ],
    faqs: [
      {
        question: 'Will my images be stretched to fit the page?',
        answer: 'No. Images are proportionally scaled and centered within the page margins so aspect ratios are never distorted.',
      },
    ],
    seoMetadata: {
      title: 'Convert Images to PDF (JPG, PNG, WebP) Online | VibeDesk',
      description: 'Combine multiple JPG, PNG, or WebP images into a single PDF document with custom page sizes and margins.',
    },
  },
  {
    id: 'watermark-page-numbers-pdf',
    name: 'Watermark & Page Numbers',
    slug: 'watermark-pdf',
    category: 'pdf',
    subcategory: 'Edit & Annotate PDF',
    icon: 'Stamp',
    shortDescription: 'Stamp custom text watermarks and formatted page numbers onto PDF pages.',
    introduction:
      'Add diagonal or header/footer text watermarks (such as "CONFIDENTIAL" or "DRAFT") and automatic page numbering ("Page 1 of N") across your PDF.',
    searchKeywords: ['watermark pdf', 'add page numbers pdf', 'stamp pdf', 'footer pdf', 'confidential stamp'],
    supportedInputs: ['application/pdf (.pdf)'],
    supportedOutputs: ['Stamped PDF (.pdf)'],
    workspaceType: 'file',
    processingEngine: 'pdf-lib vector typography overlay',
    status: 'published',
    publishedAt: '2026-10-08',
    verifiedCapabilities: [
      'Custom watermark text with adjustable opacity and diagonal/centered placement',
      'Automatic page numbering in bottom-center or bottom-right formats',
    ],
    limitations: ['Uses standard embedded Helvetica typography for universal PDF viewer compatibility'],
    instructions: [
      'Select a PDF document.',
      'Configure optional watermark text and/or enable automatic page numbering.',
      'Click "Apply to PDF" and download the updated document.',
    ],
    faqs: [
      {
        question: 'Can I add page numbers without adding a watermark?',
        answer: 'Yes. Simply leave the watermark text blank or toggle only the Page Numbers option.',
      },
    ],
    seoMetadata: {
      title: 'Add Watermark & Page Numbers to PDF Locally | VibeDesk',
      description: 'Stamp custom text watermarks and automatic page numbers onto any PDF document in your browser.',
    },
  },
  {
    id: 'pdf-metadata-cleaner',
    name: 'PDF Metadata Editor & Cleaner',
    slug: 'pdf-metadata',
    category: 'pdf',
    subcategory: 'PDF Security & Metadata',
    icon: 'ShieldCheck',
    shortDescription: 'Inspect, edit, or strip hidden author, title, and producer metadata from a PDF.',
    introduction:
      'Before sharing a PDF publicly, inspect its embedded document properties and either strip all identifying metadata or set clean custom Title and Author fields.',
    searchKeywords: ['remove pdf metadata', 'clean pdf properties', 'edit pdf author', 'pdf privacy'],
    supportedInputs: ['application/pdf (.pdf)'],
    supportedOutputs: ['Sanitized PDF (.pdf)'],
    workspaceType: 'file',
    processingEngine: 'pdf-lib document catalog sanitizer',
    status: 'published',
    publishedAt: '2026-10-12',
    verifiedCapabilities: [
      'Reads existing Title, Author, Subject, Creator, and Producer tags',
      'One-click "Strip All Metadata" privacy mode or custom field editing',
    ],
    limitations: ['Does not alter visible text inside the document body'],
    instructions: [
      'Load a PDF file to view its current embedded metadata fields.',
      'Click "Clear All Fields" to strip identifying tags, or enter updated values.',
      'Click "Save Clean PDF" to download the sanitized file.',
    ],
    faqs: [
      {
        question: 'Why should I remove PDF metadata before publishing?',
        answer: 'Word processors and PDF printers often embed your computer username, software version, and organization name in hidden document properties.',
      },
    ],
    seoMetadata: {
      title: 'Remove or Edit PDF Metadata Online – Privacy Sanitizer | VibeDesk',
      description: 'View, edit, or completely strip hidden author, creator, and title metadata from PDF files locally.',
    },
  },

  // ==========================================
  // 2. IMAGE TOOLS
  // ==========================================
  {
    id: 'compress-image',
    name: 'Compress Image',
    slug: 'compress-image',
    category: 'images',
    subcategory: 'Optimize',
    icon: 'Minimize2',
    shortDescription: 'Reduce JPG, PNG, and WebP file size with live visual quality comparison.',
    introduction:
      'Shrink image file sizes for faster web loading or email attachments while inspecting before-and-after clarity and exact byte savings in real time.',
    searchKeywords: ['reduce image size', 'shrink photo', 'optimize image', 'compress jpg', 'compress png', 'compress webp'],
    supportedInputs: ['image/jpeg (.jpg)', 'image/png (.png)', 'image/webp (.webp)'],
    supportedOutputs: ['Compressed JPEG, WebP, or optimized PNG'],
    workspaceType: 'file',
    processingEngine: 'Browser Canvas quantization & encoder',
    status: 'published',
    publishedAt: '2026-09-14',
    featuredPriority: 2,
    verifiedCapabilities: [
      'Interactive quality slider (10% to 95%) with live byte-size recalculation',
      'Optional maximum width downscaling for large camera photos',
      'Side-by-side original vs. compressed preview and exact percentage saved',
    ],
    limitations: ['Lossless PNG files achieve highest size reduction when output as WebP or JPEG'],
    instructions: [
      'Drop an image file (or load our built-in sample photograph).',
      'Adjust the quality slider and output format to balance visual sharpness and file size.',
      'Compare the before/after preview and click "Download Compressed Image".',
    ],
    faqs: [
      {
        question: 'Why does switching to WebP reduce file size so much?',
        answer: 'WebP uses modern predictive coding that typically achieves 25–35% smaller file sizes than JPEG at equivalent visual quality.',
      },
    ],
    seoMetadata: {
      title: 'Compress Images Online – Reduce JPG, PNG & WebP Size Locally | VibeDesk',
      description: 'Reduce image file size in your browser with instant before/after preview and exact byte comparison.',
    },
  },
  {
    id: 'resize-image',
    name: 'Resize Image',
    slug: 'resize-image',
    category: 'images',
    subcategory: 'Optimize',
    icon: 'Scaling',
    shortDescription: 'Change image pixel dimensions by exact width, height, or percentage scale.',
    introduction:
      'Resize images to exact pixel dimensions or percentage presets while locking aspect ratio to prevent distortion.',
    searchKeywords: ['change image resolution', 'scale image', 'image dimensions', 'shrink resolution'],
    supportedInputs: ['image/jpeg', 'image/png', 'image/webp'],
    supportedOutputs: ['Resized JPG, PNG, or WebP'],
    workspaceType: 'file',
    processingEngine: 'High-quality HTML5 Canvas interpolation',
    status: 'published',
    publishedAt: '2026-09-19',
    featuredPriority: 7,
    verifiedCapabilities: [
      'Aspect-ratio lock toggle for proportional scaling',
      'Quick percentage presets (25%, 50%, 75%) and social/web resolution presets',
    ],
    limitations: ['Upscaling images beyond original dimensions cannot invent new optical detail'],
    instructions: [
      'Select an image from your device.',
      'Enter target width or height in pixels, or pick a percentage scale.',
      'Preview the output dimensions and file size, then download.',
    ],
    faqs: [
      {
        question: 'Does resizing preserve the original aspect ratio?',
        answer: 'Yes, by default the aspect ratio lock is active so changing width automatically updates height proportionally.',
      },
    ],
    seoMetadata: {
      title: 'Resize Images by Pixels or Percentage Online | VibeDesk',
      description: 'Resize JPG, PNG, and WebP images to exact pixel dimensions locally in your browser.',
    },
  },
  {
    id: 'convert-image',
    name: 'Convert Image Format',
    slug: 'convert-image',
    category: 'images',
    subcategory: 'Convert',
    icon: 'RefreshCw',
    shortDescription: 'Convert images seamlessly between PNG, JPG, and WebP formats.',
    introduction:
      'Switch image files between modern WebP, universal JPEG, and lossless PNG formats with configurable background fill for transparent layers.',
    searchKeywords: ['webp to png', 'png to jpg', 'jpg to webp', 'image converter', 'change image format'],
    supportedInputs: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    supportedOutputs: ['PNG (.png), JPEG (.jpg), WebP (.webp)'],
    workspaceType: 'file',
    processingEngine: 'Native Canvas MIME transcoder',
    status: 'published',
    publishedAt: '2026-09-22',
    verifiedCapabilities: [
      'Instant conversion between PNG, JPEG, and WebP',
      'Automatic white or custom matte background when converting transparent PNG/WebP to JPEG',
    ],
    limitations: ['Browser security policies restrict exporting to proprietary RAW formats'],
    instructions: [
      'Load your source image.',
      'Choose your target output format (PNG, JPEG, or WebP).',
      'Download the converted image file immediately.',
    ],
    faqs: [
      {
        question: 'What happens to transparency when converting PNG to JPG?',
        answer: 'Because JPEG does not support transparent pixels, VibeDesk fills transparent areas with a clean solid background color (white by default).',
      },
    ],
    seoMetadata: {
      title: 'Image Format Converter – PNG, JPG & WebP in Browser | VibeDesk',
      description: 'Convert WebP to PNG, PNG to JPG, or JPG to WebP instantly on your device without uploading files.',
    },
  },
  {
    id: 'crop-rotate-image',
    name: 'Crop, Rotate & Flip Image',
    slug: 'crop-rotate-image',
    category: 'images',
    subcategory: 'Edit',
    icon: 'Crop',
    shortDescription: 'Rotate 90°, flip horizontally or vertically, and crop to clean aspect ratios.',
    introduction:
      'Fix sideways photos, mirror images horizontally or vertically, and crop to standard aspect ratios (1:1 Square, 16:9 Widescreen, 4:3, or Custom) in seconds.',
    searchKeywords: ['rotate photo', 'flip image', 'mirror image', 'square crop', 'aspect ratio crop'],
    supportedInputs: ['image/jpeg', 'image/png', 'image/webp'],
    supportedOutputs: ['Edited PNG, JPEG, or WebP'],
    workspaceType: 'file',
    processingEngine: '2D Canvas affine transform processor',
    status: 'published',
    publishedAt: '2026-10-02',
    verifiedCapabilities: [
      'Lossless-step 90° clockwise/counter-clockwise rotation',
      'Horizontal and vertical mirror flipping',
      'Centered aspect-ratio cropping (Original, 1:1, 16:9, 4:3, 3:2)',
    ],
    limitations: ['Crops apply symmetrically around the focal center or selected offset'],
    instructions: [
      'Select an image to open the visual transformation preview.',
      'Apply rotation, horizontal/vertical flip, or select an aspect-ratio crop preset.',
      'Click "Download Edited Image" to save.',
    ],
    faqs: [
      {
        question: 'Can I combine rotation and cropping in one step?',
        answer: 'Yes. All transforms are previewed live on the canvas and exported together in a single pass.',
      },
    ],
    seoMetadata: {
      title: 'Crop, Rotate & Flip Images Online | VibeDesk',
      description: 'Rotate photos 90 degrees, flip horizontally or vertically, and crop to clean aspect ratios in your browser.',
    },
  },
  {
    id: 'image-inspector-color-picker',
    name: 'Image Inspector & Color Picker',
    slug: 'image-inspector',
    category: 'images',
    subcategory: 'Utilities',
    icon: 'Pipette',
    shortDescription: 'Inspect exact image dimensions, aspect ratio, file details, and sample pixel HEX/RGB colors.',
    introduction:
      'Click anywhere on an image to extract exact pixel HEX, RGB, and HSL color values, while inspecting intrinsic resolution, aspect ratio, and file properties.',
    searchKeywords: ['color picker from image', 'eyeballing hex code', 'image dimensions', 'image metadata viewer', 'rgb picker'],
    supportedInputs: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    supportedOutputs: ['Copied HEX / RGB / HSL color swatches & inspection summary'],
    workspaceType: 'file',
    processingEngine: 'Canvas pixel buffer sampler',
    status: 'published',
    publishedAt: '2026-10-14',
    verifiedCapabilities: [
      'Interactive pixel loupe sampler returning HEX, RGB, and HSL values',
      'Automatic dominant palette extraction from the loaded image',
      'Intrinsic dimension, megapixels, and aspect ratio calculation',
    ],
    limitations: ['Cross-origin external URLs cannot be sampled; local files work without restriction'],
    instructions: [
      'Load any image from your device (or use the sample artwork).',
      'Click anywhere on the image preview to sample the exact pixel color.',
      'Click any HEX or RGB code to copy it to your clipboard.',
    ],
    faqs: [
      {
        question: 'How accurate is the pixel color picker?',
        answer: 'It reads the exact 8-bit sRGB channel values directly from the unscaled canvas image buffer.',
      },
    ],
    seoMetadata: {
      title: 'Image Color Picker & Dimension Inspector Online | VibeDesk',
      description: 'Extract HEX, RGB, and HSL colors from any image and inspect resolution and aspect ratio in your browser.',
    },
  },

  // ==========================================
  // 3. CALCULATORS
  // ==========================================
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    slug: 'percentage',
    category: 'calculators',
    subcategory: 'Everyday',
    icon: 'Percent',
    shortDescription: 'Calculate percentages of numbers, percentage change, and ratios instantaneously.',
    introduction:
      'Solve all common percentage questions in one unified view: find X% of Y, determine what percentage X is of Y, and calculate percentage increase or decrease.',
    searchKeywords: ['calculate percentage', 'percent change', 'percentage increase', 'percentage decrease', 'what percent of'],
    supportedInputs: ['Numerical values'],
    supportedOutputs: ['Formatted percentage results with formulas'],
    workspaceType: 'calculator',
    processingEngine: 'Precision floating-point arithmetic engine',
    status: 'published',
    publishedAt: '2026-09-11',
    featuredPriority: 4,
    verifiedCapabilities: [
      'Simultaneous calculation of 4 core percentage formulas',
      'One-click copy for any computed result',
      'Transparent formula display for verification',
    ],
    limitations: ['Division by zero returns 0 with a clear indicator when the base value is 0'],
    instructions: [
      'Enter your X and Y values in the input fields.',
      'Review the instant results across all four percentage scenarios below.',
      'Click the copy button beside any result to copy it to your clipboard.',
    ],
    faqs: [
      {
        question: 'What is the difference between percentage change and percentage difference?',
        answer: 'Percentage change measures directional growth or decline from a starting value X to Y, whereas percentage difference compares the absolute gap between two values relative to their average.',
      },
    ],
    seoMetadata: {
      title: 'Percentage Calculator – Percent of Value & % Change | VibeDesk',
      description: 'Free online percentage calculator. Instantly find X% of Y, percentage increase/decrease, and ratios with clear formulas.',
    },
  },
  {
    id: 'basic-calculator',
    name: 'Basic & Expression Calculator',
    slug: 'basic-calculator',
    category: 'calculators',
    subcategory: 'Everyday',
    icon: 'Calculator',
    shortDescription: 'Fast arithmetic keypad and parenthetical expression calculator with tape history.',
    introduction:
      'Perform everyday arithmetic with keyboard or keypad controls, parenthetical grouping, percentages, and a clickable calculation tape so you never lose track of previous steps.',
    searchKeywords: ['math calculator', 'online calculator', 'adding machine', 'arithmetic keypad'],
    supportedInputs: ['Numbers, +, -, ×, ÷, (), %'],
    supportedOutputs: ['Evaluated result and session tape history'],
    workspaceType: 'calculator',
    processingEngine: 'Shunting-yard deterministic expression parser',
    status: 'published',
    publishedAt: '2026-09-15',
    verifiedCapabilities: [
      'Supports full keyboard input and clickable keypad',
      'Respects standard operator precedence and parentheses',
      'Session calculation tape with one-click recall and copy',
    ],
    limitations: ['Designed for arithmetic and business math; use specialized calculators for amortization'],
    instructions: [
      'Type an arithmetic expression using your keyboard or click the calculator buttons.',
      'Press Enter or "=" to record the calculation into the history tape.',
      'Click any history entry to reuse its value or copy the result.',
    ],
    faqs: [
      {
        question: 'Does the calculator follow order of operations (PEMDAS/BODMAS)?',
        answer: 'Yes. Multiplication and division are evaluated before addition and subtraction, and parentheses take top priority.',
      },
    ],
    seoMetadata: {
      title: 'Basic Online Calculator with History Tape | VibeDesk',
      description: 'Clean, fast online calculator supporting parentheses, percentages, keyboard shortcuts, and calculation history.',
    },
  },
  {
    id: 'loan-emi-calculator',
    name: 'Loan & Mortgage EMI Calculator',
    slug: 'loan-calculator',
    category: 'calculators',
    subcategory: 'Financial',
    icon: 'Landmark',
    shortDescription: 'Calculate monthly loan payments, total interest cost, and amortization breakdown.',
    introduction:
      'Estimate monthly installment payments (EMI) for mortgages, auto loans, or personal loans with a clear visual breakdown of principal versus total interest and a 12-month amortization preview.',
    searchKeywords: ['loan calculator', 'emi calculator', 'mortgage payment', 'interest calculator', 'amortization'],
    supportedInputs: ['Loan Amount, Annual Interest Rate (%), Loan Term (Months or Years)'],
    supportedOutputs: ['Monthly EMI, Total Interest, Total Payable, Amortization Schedule'],
    workspaceType: 'calculator',
    processingEngine: 'Reducing-balance amortization engine',
    status: 'published',
    publishedAt: '2026-09-20',
    featuredPriority: 8,
    verifiedCapabilities: [
      'Instant monthly EMI, total interest, and principal/interest ratio bar',
      'First 12-month principal vs. interest amortization schedule table',
    ],
    limitations: ['Assumes a fixed interest rate compounded monthly without external insurance or escrow fees'],
    instructions: [
      'Enter your loan principal amount, annual interest rate (%), and tenure in months.',
      'Inspect your monthly payment and total interest breakdown immediately.',
      'Review the month-by-month amortization table below.',
    ],
    faqs: [
      {
        question: 'Can I calculate a zero-interest (0% APR) installment plan?',
        answer: 'Yes. Setting the annual interest rate to 0% divides the principal evenly across the selected number of months.',
      },
    ],
    seoMetadata: {
      title: 'Loan & EMI Calculator – Monthly Payment & Interest Breakdown | VibeDesk',
      description: 'Calculate monthly loan EMI, total interest payable, and view an amortization schedule instantly.',
    },
  },
  {
    id: 'date-difference-calculator',
    name: 'Date Difference & Working Days',
    slug: 'date-calculator',
    category: 'calculators',
    subcategory: 'Date & Time',
    icon: 'CalendarDays',
    shortDescription: 'Calculate exact years, months, days, and Mon–Fri working days between two dates.',
    introduction:
      'Find the exact calendar duration between any two dates broken down into years, months, and days, as well as total weeks, business working days (Monday–Friday), and weekend days.',
    searchKeywords: ['date calculator', 'days between dates', 'working days calculator', 'age calculator', 'date duration'],
    supportedInputs: ['Start Date (YYYY-MM-DD)', 'End Date (YYYY-MM-DD)'],
    supportedOutputs: ['Total days, Y/M/D breakdown, Working days, Weekend days'],
    workspaceType: 'calculator',
    processingEngine: 'UTC calendar & weekday interval calculator',
    status: 'published',
    publishedAt: '2026-09-26',
    verifiedCapabilities: [
      'Exact Year, Month, Day calendar span accounting for leap years',
      'Automatic Monday–Friday business days vs. weekend days count',
      'Optional toggle to include the end date (+1 day inclusive)',
    ],
    limitations: ['Working day counts exclude Saturdays and Sundays but do not subtract regional public holidays'],
    instructions: [
      'Pick a Start Date and End Date (or click "Today" to anchor to the current date).',
      'Optionally check "Include end date" if counting inclusive project days.',
      'Read the calendar breakdown, total days, and business working days.',
    ],
    faqs: [
      {
        question: 'Can I use this as an Age Calculator?',
        answer: 'Yes. Set your birth date as the Start Date and today as the End Date to see your exact age in years, months, and days.',
      },
    ],
    seoMetadata: {
      title: 'Date Difference & Working Days Calculator | VibeDesk',
      description: 'Count total days, years/months/days, and Monday-Friday working days between any two calendar dates.',
    },
  },
  {
    id: 'discount-vat-calculator',
    name: 'Discount & VAT Tax Calculator',
    slug: 'discount-tax-calculator',
    category: 'calculators',
    subcategory: 'Financial',
    icon: 'Receipt',
    shortDescription: 'Calculate sale price after stacked discounts and add or extract VAT/sales tax.',
    introduction:
      'Compute retail sale prices with single or stacked promotional discounts plus optional sales tax, or switch to the VAT mode to add or reverse-extract VAT from gross prices.',
    searchKeywords: ['discount calculator', 'sale price calculator', 'vat calculator', 'sales tax calculator', 'reverse vat'],
    supportedInputs: ['Original Price, Discount %, Tax / VAT %'],
    supportedOutputs: ['Final Price, Amount Saved, Net & Gross Tax Breakdown'],
    workspaceType: 'calculator',
    processingEngine: 'Commercial pricing & tax formula engine',
    status: 'published',
    publishedAt: '2026-10-05',
    verifiedCapabilities: [
      'Supports stacked secondary discounts (e.g., 20% off + extra 10% off)',
      'Supports both Tax-Exclusive (add VAT) and Tax-Inclusive (extract VAT from gross) modes',
    ],
    limitations: ['Rounds final currency outputs to 2 decimal places'],
    instructions: [
      'Select either Discount Calculator or VAT / Tax Calculator mode.',
      'Enter the price and percentage rates.',
      'View the exact savings, tax amount, and final payable total.',
    ],
    faqs: [
      {
        question: 'How does a stacked discount work?',
        answer: 'A 20% discount followed by an extra 10% discount applies the 10% to the already reduced price (80% × 0.90 = 72%), resulting in a 28% effective discount rather than 30%.',
      },
    ],
    seoMetadata: {
      title: 'Discount, Sale Price & VAT Tax Calculator | VibeDesk',
      description: 'Calculate final sale prices, stacked discounts, and inclusive or exclusive VAT/sales tax.',
    },
  },
  {
    id: 'average-statistics-calculator',
    name: 'Average, Median & Range Calculator',
    slug: 'average-calculator',
    category: 'calculators',
    subcategory: 'Everyday',
    icon: 'BarChart3',
    shortDescription: 'Compute mean average, median, sum, minimum, maximum, and range from any list of numbers.',
    introduction:
      'Paste comma, space, or line-separated numbers to immediately calculate count, sum, arithmetic mean, median, minimum, maximum, and range.',
    searchKeywords: ['average calculator', 'mean median calculator', 'sum numbers', 'statistical summary'],
    supportedInputs: ['Comma, space, or newline-separated numbers'],
    supportedOutputs: ['Count, Sum, Mean, Median, Min, Max, Range'],
    workspaceType: 'calculator',
    processingEngine: 'Descriptive statistics evaluator',
    status: 'published',
    publishedAt: '2026-10-11',
    verifiedCapabilities: [
      'Parses numbers separated by commas, spaces, tabs, or line breaks',
      'Calculates both arithmetic mean and outlier-resistant median',
    ],
    limitations: ['Non-numeric text tokens are ignored automatically'],
    instructions: [
      'Enter or paste your list of numbers into the input box.',
      'Inspect the computed Mean, Median, Sum, Min, Max, and Range values.',
    ],
    faqs: [
      {
        question: 'When is the median more useful than the mean average?',
        answer: 'The median represents the middle value when sorted, so it is not skewed by extreme high or low outliers.',
      },
    ],
    seoMetadata: {
      title: 'Average, Mean & Median Calculator Online | VibeDesk',
      description: 'Calculate arithmetic mean, median, sum, min, max, and range from any list of numbers.',
    },
  },

  // ==========================================
  // 4. CONVERTERS
  // ==========================================
  {
    id: 'measurement-converter',
    name: 'Unit Converter',
    slug: 'unit-converter',
    category: 'converters',
    subcategory: 'Measurement Converters',
    icon: 'Ruler',
    shortDescription: 'Convert length, weight, temperature, area, speed, and digital storage units.',
    introduction:
      'A unified, high-precision unit converter covering Length, Weight & Mass, Temperature, Area, Speed, and Digital Storage (both Decimal MB/GB and Binary MiB/GiB) with instant all-unit reference tables.',
    searchKeywords: [
      'length converter',
      'weight converter',
      'temperature converter',
      'area converter',
      'km to miles',
      'kg to lbs',
      'celsius to fahrenheit',
      'gb to mb',
    ],
    supportedInputs: ['Numerical value + Source Unit'],
    supportedOutputs: ['Target Unit value + full category conversion table'],
    workspaceType: 'calculator',
    processingEngine: 'NIST-aligned unit conversion factors',
    status: 'published',
    publishedAt: '2026-09-13',
    featuredPriority: 5,
    verifiedCapabilities: [
      '6 measurement domains: Length, Weight, Temperature, Area, Storage, Speed',
      'One-click unit swap button and simultaneous all-unit equivalent table',
    ],
    limitations: ['Focuses on physical and digital units; live currency exchange rates are omitted to maintain offline accuracy'],
    instructions: [
      'Choose a measurement category (Length, Weight, Temperature, Area, Storage, or Speed).',
      'Enter a value and select the From and To units (or click Swap).',
      'View the primary converted value and the complete reference table across all units.',
    ],
    faqs: [
      {
        question: 'Are imperial to metric conversion factors exact?',
        answer: 'Yes. We use international standard definitions such as 1 inch = 25.4 millimeters and 1 pound = 0.45359237 kilograms.',
      },
    ],
    seoMetadata: {
      title: 'Unit Converter – Length, Weight, Temperature, Area & Storage | VibeDesk',
      description: 'Convert meters to feet, kilograms to pounds, Celsius to Fahrenheit, and digital storage units instantly.',
    },
  },
  {
    id: 'csv-json-converter',
    name: 'CSV ⇄ JSON Data Converter',
    slug: 'csv-json-converter',
    category: 'converters',
    subcategory: 'File & Data Converters',
    icon: 'TableProperties',
    shortDescription: 'Convert CSV spreadsheets to structured JSON arrays or JSON arrays back to CSV.',
    introduction:
      'Transform comma-, tab-, or semicolon-separated CSV data into clean, typed JSON arrays, or flatten JSON object arrays into downloadable CSV files.',
    searchKeywords: ['csv to json', 'json to csv', 'spreadsheet to json', 'convert data format'],
    supportedInputs: ['CSV text / .csv file', 'JSON array / .json file'],
    supportedOutputs: ['Formatted .json or .csv download & clipboard copy'],
    workspaceType: 'text',
    processingEngine: 'RFC-4180 compliant quote-aware CSV/JSON parser',
    status: 'published',
    publishedAt: '2026-09-29',
    verifiedCapabilities: [
      'Bidirectional conversion: CSV → JSON and JSON → CSV',
      'Automatic number and boolean type inference for CSV → JSON',
      'Handles quoted fields containing commas and escaped quotes',
    ],
    limitations: ['Deeply nested JSON objects are serialized as JSON strings inside CSV cells'],
    instructions: [
      'Choose "CSV to JSON" or "JSON to CSV" direction.',
      'Paste your input data or load a local sample.',
      'Copy the converted output or download it as a .json or .csv file.',
    ],
    faqs: [
      {
        question: 'Does the CSV parser handle commas inside quoted text?',
        answer: 'Yes. Values wrapped in double quotes can safely contain commas without splitting into separate columns.',
      },
    ],
    seoMetadata: {
      title: 'CSV to JSON & JSON to CSV Converter Online | VibeDesk',
      description: 'Convert CSV data to structured JSON or JSON arrays to CSV spreadsheets locally in your browser.',
    },
  },
  {
    id: 'base64-url-converter',
    name: 'Base64 & URL Encoder / Decoder',
    slug: 'base64-url-converter',
    category: 'converters',
    subcategory: 'File & Data Converters',
    icon: 'Binary',
    shortDescription: 'Encode and decode UTF-8 Base64 strings and URL query components safely.',
    introduction:
      'Encode or decode UTF-8 text strings into Base64 or percent-encoded URL format without corrupting international characters or symbols.',
    searchKeywords: ['base64 encode', 'base64 decode', 'url encode', 'url decode', 'percent encoding'],
    supportedInputs: ['Plain UTF-8 text, Base64 string, or URL string'],
    supportedOutputs: ['Encoded or decoded string'],
    workspaceType: 'text',
    processingEngine: 'TextEncoder UTF-8 byte stream codec',
    status: 'published',
    publishedAt: '2026-10-04',
    verifiedCapabilities: [
      'Full UTF-8 multi-byte character safety (handles accents, em-dashes, and emojis)',
      'Instant mode switching between Base64 Encode/Decode and URL Encode/Decode',
    ],
    limitations: ['Designed for text and URI strings'],
    instructions: [
      'Select Base64 Encode, Base64 Decode, URL Encode, or URL Decode.',
      'Paste your string into the input box.',
      'Copy the transformed output immediately.',
    ],
    faqs: [
      {
        question: 'Why do some Base64 tools fail on non-ASCII characters?',
        answer: 'The browser atob/btoa functions only accept Latin-1 characters by default. VibeDesk first encodes strings into UTF-8 byte arrays so all Unicode characters are preserved.',
      },
    ],
    seoMetadata: {
      title: 'Base64 & URL Encoder / Decoder (UTF-8 Safe) | VibeDesk',
      description: 'Encode and decode Base64 strings and URL components locally with full UTF-8 character support.',
    },
  },

  // ==========================================
  // 5. TEXT & DEVELOPER TOOLS
  // ==========================================
  {
    id: 'text-compare',
    name: 'Text & Code Diff Compare',
    slug: 'text-compare',
    category: 'text-tools',
    subcategory: 'Analysis & Diff',
    icon: 'GitCompare',
    shortDescription: 'Compare two blocks of text or code to highlight added, removed, and unchanged lines.',
    introduction:
      'Spot exact line-by-line differences between two versions of a document, configuration file, or source code snippet with clear addition and removal indicators.',
    searchKeywords: ['text compare', 'diff checker', 'code compare', 'compare two texts', 'find differences'],
    supportedInputs: ['Original Text / Code', 'Modified Text / Code'],
    supportedOutputs: ['Unified & Split line diff with addition/deletion counts'],
    workspaceType: 'text',
    processingEngine: 'Longest Common Subsequence (LCS) line diff engine',
    status: 'published',
    publishedAt: '2026-09-16',
    featuredPriority: 6,
    verifiedCapabilities: [
      'Computes exact added, removed, and unchanged line counts',
      'Toggle to show all lines or filter strictly to changed lines',
      'Monospace line-numbered diff inspection',
    ],
    limitations: ['Optimized for files up to 2,500 lines for instant in-browser responsiveness'],
    instructions: [
      'Paste the original text on the left and the revised text on the right.',
      'Inspect the highlighted additions (+) and removals (-) below.',
      'Toggle "Only show differences" to focus on modified lines in longer documents.',
    ],
    faqs: [
      {
        question: 'Is my confidential code or contract text sent anywhere?',
        answer: 'Never. The Longest Common Subsequence diff algorithm runs entirely inside your browser tab.',
      },
    ],
    seoMetadata: {
      title: 'Text & Code Compare – Private Online Diff Checker | VibeDesk',
      description: 'Compare two text or code blocks side by side and highlight line additions and removals locally.',
    },
  },
  {
    id: 'json-formatter-validator',
    name: 'JSON Formatter & Validator',
    slug: 'json-formatter',
    category: 'text-tools',
    subcategory: 'Developer Formatting',
    icon: 'Braces',
    shortDescription: 'Prettify, validate, or minify JSON payloads with syntax error diagnostics.',
    introduction:
      'Format messy or minified JSON strings into clean, readable structures with 2-space or 4-space indentation, or compress JSON for production payloads while verifying syntax validity.',
    searchKeywords: ['json formatter', 'json validator', 'prettify json', 'minify json', 'json lint'],
    supportedInputs: ['Raw or minified JSON string'],
    supportedOutputs: ['Formatted or minified JSON + byte size & validity check'],
    workspaceType: 'text',
    processingEngine: 'Native V8 JSON parser & serializer',
    status: 'published',
    publishedAt: '2026-09-17',
    verifiedCapabilities: [
      'Configurable indentation: 2 Spaces, 4 Spaces, or Minified single-line',
      'Exact syntax error reporting when malformed JSON is entered',
      'Download formatted output as a .json file or copy to clipboard',
    ],
    limitations: ['Requires standard RFC-8259 JSON (trailing commas or single-quoted keys are flagged as syntax errors)'],
    instructions: [
      'Paste your JSON string into the input editor.',
      'Select 2 Spaces, 4 Spaces, or Minify.',
      'Verify the green Valid indicator and copy or download the result.',
    ],
    faqs: [
      {
        question: 'Why does JSON validation fail on trailing commas?',
        answer: 'Standard JSON specification (RFC 8259) forbids trailing commas after the last item in an object or array.',
      },
    ],
    seoMetadata: {
      title: 'JSON Formatter, Prettifier & Validator Online | VibeDesk',
      description: 'Format, validate, and minify JSON data locally in your browser with instant error diagnostics.',
    },
  },
  {
    id: 'word-character-counter',
    name: 'Word & Character Counter',
    slug: 'word-counter',
    category: 'text-tools',
    subcategory: 'Analysis & Diff',
    icon: 'AlignLeft',
    shortDescription: 'Count words, characters, sentences, paragraphs, and estimated reading/speaking time.',
    introduction:
      'Analyze essays, articles, social posts, or meta descriptions in real time with instant counts for words, characters (with and without spaces), sentences, paragraphs, and reading time.',
    searchKeywords: ['word counter', 'character counter', 'letter count', 'reading time calculator', 'paragraph counter'],
    supportedInputs: ['Any plain text or prose'],
    supportedOutputs: ['Live counts for Words, Characters, Sentences, Paragraphs, Reading & Speaking time'],
    workspaceType: 'text',
    processingEngine: 'Real-time lexical boundary analyzer',
    status: 'published',
    publishedAt: '2026-09-24',
    verifiedCapabilities: [
      'Zero-latency live metrics as you type or paste',
      'Includes estimated reading time (225 WPM) and speaking time (130 WPM)',
    ],
    limitations: ['Counts whitespace-delimited words and punctuation-delimited sentences'],
    instructions: [
      'Type or paste your text into the workspace.',
      'Read the live word, character, sentence, and reading-time counters above the editor.',
    ],
    faqs: [
      {
        question: 'How is reading time calculated?',
        answer: 'Reading time is based on an average adult silent reading speed of 225 words per minute, and speaking time uses 130 words per minute.',
      },
    ],
    seoMetadata: {
      title: 'Word & Character Counter with Reading Time | VibeDesk',
      description: 'Count words, characters, sentences, paragraphs, and reading time instantly in your browser.',
    },
  },
  {
    id: 'case-line-utility',
    name: 'Case Converter & Line Deduplicator',
    slug: 'case-converter',
    category: 'text-tools',
    subcategory: 'Text Manipulation',
    icon: 'CaseSensitive',
    shortDescription: 'Convert text between camelCase, snake_case, Title Case, UPPERCASE, and deduplicate or sort lines.',
    introduction:
      'Quickly convert text casing across 8 developer and editorial formats, or clean up lists by removing duplicate lines, trimming whitespace, and sorting alphabetically.',
    searchKeywords: [
      'case converter',
      'uppercase to lowercase',
      'title case',
      'camelcase',
      'snake_case',
      'remove duplicate lines',
      'sort lines',
    ],
    supportedInputs: ['Text or multi-line list'],
    supportedOutputs: ['Transformed text with line reduction stats'],
    workspaceType: 'text',
    processingEngine: 'Regex & locale-aware string transformer',
    status: 'published',
    publishedAt: '2026-10-06',
    verifiedCapabilities: [
      '8 case conversions: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case',
      'Line list cleaner: Remove duplicates, trim whitespace, remove empty lines, sort A–Z / Z–A / by length',
    ],
    limitations: ['Processes plain text; rich HTML formatting is stripped on paste'],
    instructions: [
      'Paste your text or multi-line list into the editor.',
      'Click any Case Conversion button or toggle the Line List Cleaner options.',
      'Copy the cleaned result with one click.',
    ],
    faqs: [
      {
        question: 'Can I remove duplicate lines case-insensitively?',
        answer: 'Yes. Uncheck "Case-sensitive deduplication" to treat "Apple" and "apple" as duplicates.',
      },
    ],
    seoMetadata: {
      title: 'Case Converter, Line Sorter & Duplicate Line Remover | VibeDesk',
      description: 'Convert text between UPPERCASE, Title Case, camelCase, snake_case, and remove duplicate lines online.',
    },
  },

  // ==========================================
  // 6. FILE UTILITIES
  // ==========================================
  {
    id: 'zip-archive-creator',
    name: 'ZIP Archive Creator',
    slug: 'zip-creator',
    category: 'file-utilities',
    subcategory: 'Archiving',
    icon: 'FolderArchive',
    shortDescription: 'Package multiple local files into a compressed .zip archive directly in your browser.',
    introduction:
      'Select files from your device, inspect their individual sizes, choose your compression level, and bundle them into a standard .zip archive without uploading anything.',
    searchKeywords: ['create zip', 'compress files to zip', 'bundle files', 'make zip online'],
    supportedInputs: ['Any local files'],
    supportedOutputs: ['Standard .zip archive'],
    workspaceType: 'file',
    processingEngine: 'JSZip DEFLATE compression engine',
    status: 'published',
    publishedAt: '2026-10-15',
    verifiedCapabilities: [
      'Supports bundling multiple files of any format',
      'Configurable DEFLATE compression level (Store, Fast, Maximum)',
      'Displays uncompressed vs. compressed archive byte size',
    ],
    limitations: ['Total combined file size should stay under 150 MB to fit comfortably in browser RAM'],
    instructions: [
      'Add one or more files to the archive queue.',
      'Enter a custom filename for your ZIP archive and select compression level.',
      'Click "Build ZIP Archive" and download the resulting .zip file.',
    ],
    faqs: [
      {
        question: 'Are the files inside my ZIP uploaded to any server?',
        answer: 'No. The ZIP file is assembled directly inside your browser memory using JSZip.',
      },
    ],
    seoMetadata: {
      title: 'Create ZIP Archives Online – Private Browser File Bundler | VibeDesk',
      description: 'Combine and compress multiple files into a standard .zip archive locally in your browser.',
    },
  },
  {
    id: 'file-hash-checksum',
    name: 'File Hash & Checksum Verifier',
    slug: 'file-checksum',
    category: 'file-utilities',
    subcategory: 'Integrity & Checksums',
    icon: 'Fingerprint',
    shortDescription: 'Compute and verify SHA-256, SHA-384, SHA-512, and SHA-1 cryptographic file hashes locally.',
    introduction:
      'Verify downloaded installers, documents, or backups by computing cryptographic SHA-256, SHA-512, and SHA-1 digests locally via the Web Crypto API and comparing against an expected checksum.',
    searchKeywords: ['sha256 checksum', 'verify file hash', 'sha512', 'sha1 hash', 'file integrity'],
    supportedInputs: ['Any local file or text string'],
    supportedOutputs: ['Hexadecimal SHA-256, SHA-384, SHA-512, and SHA-1 digests + Match verification'],
    workspaceType: 'file',
    processingEngine: 'Hardware-accelerated Web Crypto API (crypto.subtle)',
    status: 'published',
    publishedAt: '2026-10-16',
    verifiedCapabilities: [
      'Simultaneous computation of SHA-256, SHA-384, SHA-512, and SHA-1 hashes',
      'Instant comparison box to verify whether a file matches an expected published hash',
    ],
    limitations: ['MD5 is intentionally omitted in favor of collision-resistant Web Crypto SHA standards'],
    instructions: [
      'Select any file from your device.',
      'View the computed SHA-256, SHA-384, SHA-512, and SHA-1 hexadecimal digests.',
      'Optionally paste an expected checksum to verify an exact match.',
    ],
    faqs: [
      {
        question: 'Why is Web Crypto hashing so fast?',
        answer: 'Modern browsers execute crypto.subtle.digest in native C++/Rust threads with CPU SHA extensions.',
      },
    ],
    seoMetadata: {
      title: 'SHA-256 & SHA-512 File Checksum Calculator Online | VibeDesk',
      description: 'Calculate and verify SHA-256, SHA-512, and SHA-1 file hashes locally in your browser using Web Crypto.',
    },
  },

  // ==========================================
  // PLANNED BACKLOG (NOT EXPOSED AS PUBLIC FUNCTIONAL TOOLS)
  // Per Section 7 & 15: Advanced Office/OCR/Media conversions remain planned
  // until full client-side fidelity is verified.
  // ==========================================
  {
    id: 'word-to-pdf-planned',
    name: 'Word to PDF',
    slug: 'word-to-pdf',
    category: 'pdf',
    subcategory: 'Convert PDF',
    icon: 'FileType',
    shortDescription: 'Convert DOCX files to PDF with full pagination fidelity.',
    introduction: 'Planned local DOCX layout renderer.',
    searchKeywords: ['docx to pdf'],
    supportedInputs: ['.docx'],
    supportedOutputs: ['.pdf'],
    workspaceType: 'file',
    processingEngine: 'Planned WASM layout engine',
    status: 'planned',
    publishedAt: '2026-12-01',
    verifiedCapabilities: [],
    limitations: ['Requires full OpenXML font & pagination fidelity before public release'],
    instructions: [],
    faqs: [],
    seoMetadata: { title: 'Word to PDF', description: 'Planned' },
  },
  {
    id: 'ocr-pdf-planned',
    name: 'OCR PDF',
    slug: 'ocr-pdf',
    category: 'pdf',
    subcategory: 'Optimize PDF',
    icon: 'ScanText',
    shortDescription: 'Recognize text in scanned PDFs.',
    introduction: 'Planned local optical character recognition.',
    searchKeywords: ['ocr pdf'],
    supportedInputs: ['.pdf'],
    supportedOutputs: ['.pdf'],
    workspaceType: 'file',
    processingEngine: 'Planned WebAssembly OCR worker',
    status: 'planned',
    publishedAt: '2026-12-01',
    verifiedCapabilities: [],
    limitations: ['Under evaluation for language training data bundle size'],
    instructions: [],
    faqs: [],
    seoMetadata: { title: 'OCR PDF', description: 'Planned' },
  },
];

// ==========================================
// REGISTRY QUERY HELPERS (STRICTLY PUBLISHED ONLY)
// ==========================================

export function getPublishedTools(): ToolDefinition[] {
  return TOOL_REGISTRY.filter((tool) => tool.status === 'published');
}

export function getToolBySlug(categorySlug: string, toolSlug: string): ToolDefinition | undefined {
  return getPublishedTools().find(
    (t) => t.category === categorySlug && t.slug === toolSlug
  );
}

export function getToolById(id: string): ToolDefinition | undefined {
  return getPublishedTools().find((t) => t.id === id);
}

export function getToolsByCategory(categorySlug: ToolCategorySlug): ToolDefinition[] {
  return getPublishedTools().filter((t) => t.category === categorySlug);
}

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getFeaturedTools(limit = 8): ToolDefinition[] {
  return getPublishedTools()
    .filter((t) => typeof t.featuredPriority === 'number')
    .sort((a, b) => (a.featuredPriority ?? 99) - (b.featuredPriority ?? 99))
    .slice(0, limit);
}

export function getRecentlyAddedTools(limit = 4): ToolDefinition[] {
  return [...getPublishedTools()]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export function getRelatedTools(tool: ToolDefinition, limit = 4): ToolDefinition[] {
  const sameCategory = getPublishedTools().filter(
    (t) => t.category === tool.category && t.id !== tool.id
  );
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }
  const others = getFeaturedTools(8).filter(
    (t) => t.id !== tool.id && !sameCategory.some((sc) => sc.id === t.id)
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export function searchPublishedTools(query: string): ToolDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const tokens = q.split(/\s+/).filter(Boolean);
  const scored = getPublishedTools()
    .map((tool) => {
      let score = 0;
      const nameLower = tool.name.toLowerCase();
      const descLower = tool.shortDescription.toLowerCase();
      const catName = getCategoryBySlug(tool.category)?.name.toLowerCase() ?? '';
      const keywordsJoined = tool.searchKeywords.join(' ').toLowerCase();

      if (nameLower === q) score += 100;
      else if (nameLower.startsWith(q)) score += 60;
      else if (nameLower.includes(q)) score += 40;

      if (keywordsJoined.includes(q)) score += 50;
      if (descLower.includes(q)) score += 20;
      if (catName.includes(q)) score += 15;

      for (const token of tokens) {
        if (nameLower.includes(token)) score += 15;
        if (keywordsJoined.includes(token)) score += 12;
        if (descLower.includes(token)) score += 6;
        if (catName.includes(token)) score += 5;
      }

      return { tool, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((item) => item.tool);
}
