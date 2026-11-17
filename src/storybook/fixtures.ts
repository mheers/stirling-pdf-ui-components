import {
  Archive,
  ArrowLeftRight,
  Combine,
  Droplets,
  FileImage,
  Files,
  Hash,
  ImagePlus,
  KeyRound,
  LayoutGrid,
  Lock,
  PenLine,
  RotateCw,
  ScanText,
  Scissors,
  ShieldCheck,
  Wrench,
} from 'lucide-vue-next';
import type { PageOrganizerItem, PdfFileDescriptor, PdfMetadata, PdfResult, PdfTool } from '../lib/types';
import type { PdfSearchResults } from '../lib/pdf';

export const handbookUrl = '/samples/handbook.pdf';
export const invoiceUrl = '/samples/invoice.pdf';
export const stampUrl = '/samples/stamp.png';
export const signatureUrl = '/samples/signature.png';

export const sampleTools: PdfTool[] = [
  {
    id: 'merge',
    name: 'Merge PDFs',
    description: 'Combine several documents into one file in the order you choose.',
    icon: Combine,
    category: 'Organize',
    keywords: ['combine', 'join', 'append'],
  },
  {
    id: 'split',
    name: 'Split PDF',
    description: 'Break a document into ranges, fixed-size chunks, or single pages.',
    icon: Scissors,
    category: 'Organize',
    keywords: ['extract', 'ranges', 'pages'],
  },
  {
    id: 'organize',
    name: 'Organize pages',
    description: 'Reorder, rotate, duplicate, or remove pages with a visual editor.',
    icon: LayoutGrid,
    category: 'Organize',
    badge: 'new',
    keywords: ['reorder', 'rotate', 'delete', 'duplicate'],
  },
  {
    id: 'rotate',
    name: 'Rotate pages',
    description: 'Fix sideways scans or turn a single page permanently.',
    icon: RotateCw,
    category: 'Organize',
  },
  {
    id: 'compress',
    name: 'Compress PDF',
    description: 'Shrink large files with quality presets built for sharing.',
    icon: Archive,
    category: 'Optimize',
  },
  {
    id: 'ocr',
    name: 'OCR scans',
    description: 'Make scanned pages searchable and selectable in over 25 languages.',
    icon: ScanText,
    category: 'Optimize',
    badge: 'beta',
  },
  {
    id: 'repair',
    name: 'Repair PDF',
    description: 'Recover pages from damaged or partially downloaded files.',
    icon: Wrench,
    category: 'Optimize',
  },
  {
    id: 'protect',
    name: 'Protect PDF',
    description: 'Encrypt a document and control printing, copying, and editing.',
    icon: Lock,
    category: 'Secure',
  },
  {
    id: 'unlock',
    name: 'Unlock PDF',
    description: 'Remove a known password from a document you own.',
    icon: KeyRound,
    category: 'Secure',
  },
  {
    id: 'redact',
    name: 'Redact content',
    description: 'Permanently remove sensitive text and images before sharing.',
    icon: ShieldCheck,
    category: 'Secure',
    badge: 'pro',
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to images',
    description: 'Export pages as PNG or JPEG for slides and the web.',
    icon: FileImage,
    category: 'Convert',
    keywords: ['png', 'jpeg', 'export'],
  },
  {
    id: 'images-to-pdf',
    name: 'Images to PDF',
    description: 'Turn photos and screenshots into a single, tidy document.',
    icon: ImagePlus,
    category: 'Convert',
    keywords: ['jpg', 'png', 'photo'],
  },
  {
    id: 'page-numbers',
    name: 'Add page numbers',
    description: 'Place consistent page numbers with a position and margin preview.',
    icon: Hash,
    category: 'Edit',
  },
  {
    id: 'watermark',
    name: 'Add watermark',
    description: 'Stamp text or an image across one page or the whole document.',
    icon: Droplets,
    category: 'Edit',
  },
  {
    id: 'sign',
    name: 'Sign PDF',
    description: 'Draw, type, or upload a signature and place it on the page.',
    icon: PenLine,
    category: 'Edit',
  },
  {
    id: 'convert',
    name: 'Convert document',
    description: 'Move between Word, Excel, and PDF without losing the layout.',
    icon: ArrowLeftRight,
    category: 'Convert',
  },
];

export const sampleFiles: PdfFileDescriptor[] = [
  {
    id: 'file-handbook',
    name: 'pdf-workflow-handbook.pdf',
    size: 2_411_520,
    pageCount: 12,
    status: 'ready',
    thumbnailUrl: '/samples/handbook-cover.png',
  },
  {
    id: 'file-invoice',
    name: 'invoice-2026-0314.pdf',
    size: 842_135,
    pageCount: 2,
    status: 'uploading',
    progress: 64,
    thumbnailUrl: '/samples/invoice-cover.png',
  },
  {
    id: 'file-contract',
    name: 'contract-signed-draft.pdf',
    size: 1_180_400,
    pageCount: 8,
    status: 'error',
    error: 'The upload was interrupted. Check your connection and try again.',
  },
  {
    id: 'file-scan',
    name: 'scan-batch-07.pdf',
    size: 8_640_200,
    pageCount: 24,
    status: 'processing',
  },
];

export const sampleResults: PdfResult[] = [
  {
    id: 'result-1',
    name: 'pdf-workflow-handbook-compressed.pdf',
    size: 1_180_400,
    pageCount: 12,
    url: handbookUrl,
    preview: true,
  },
];

export const sampleMultipleResults: PdfResult[] = [
  {
    id: 'result-part-1',
    name: 'handbook_pages-1-4.pdf',
    size: 612_000,
    pageCount: 4,
    url: handbookUrl,
  },
  {
    id: 'result-part-2',
    name: 'handbook_pages-5-8.pdf',
    size: 780_400,
    pageCount: 4,
    url: handbookUrl,
  },
  {
    id: 'result-part-3',
    name: 'handbook_pages-9-12.pdf',
    size: 534_800,
    pageCount: 4,
    url: handbookUrl,
  },
];

export const sampleMetadata: PdfMetadata = {
  title: 'The PDF Workflow Handbook',
  author: 'Stirling PDF UI Components',
  subject: 'A practical field guide to document workflows',
  keywords: ['pdf', 'workflow', 'design', 'documentation'],
  creator: 'Stirling PDF UI Components',
  producer: 'Stirling PDF',
};

export const sampleSteps = [
  { id: 'upload', label: 'Upload document', status: 'done' as const },
  { id: 'parse', label: 'Read pages and metadata', status: 'done' as const },
  { id: 'process', label: 'Compress images', status: 'active' as const },
  { id: 'package', label: 'Package the result', status: 'pending' as const },
];

export const sampleSearchResults: PdfSearchResults = {
  query: 'document',
  total: 7,
  matches: [
    { page: 3, snippet: '…what is this document, how many pages does it have, and what can I do with it?…', index: 0 },
    { page: 3, snippet: '…Good document interfaces answer those questions before the user clicks anything.…', index: 1 },
    { page: 4, snippet: '…Review is where documents slow down. Comments get lost in email…', index: 2 },
    { page: 6, snippet: '…The numbers our teams check most often include time to first page on a document…', index: 3 },
    { page: 8, snippet: '…A scan is an image of a document. OCR turns that image into searchable text…', index: 4 },
    { page: 9, snippet: '…The last mile decides whether the document feels finished…', index: 5 },
    { page: 11, snippet: '…Every component in this handbook helps a document leave your desk with confidence.…', index: 6 },
  ],
  byPage: [
    { page: 3, count: 2 },
    { page: 4, count: 1 },
    { page: 6, count: 1 },
    { page: 8, count: 1 },
    { page: 9, count: 1 },
    { page: 11, count: 1 },
  ],
  truncated: false,
};

export function organizerItems(count = 12): PageOrganizerItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `page-${index + 1}`,
    page: index + 1,
    rotation: 0,
  }));
}

export async function loadSampleFile(
  url: string,
  name: string,
  type = 'application/pdf',
): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], name, { type });
}
