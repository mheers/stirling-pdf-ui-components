import type { Component } from 'vue';

/** Anything the PDF engine can open. */
export type PdfSource = File | Blob | ArrayBuffer | Uint8Array | string | URL;

/** Nine-point anchor used by watermarks, page numbers, and stamps. */
export type PdfPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export const PDF_POSITIONS: { value: PdfPosition; label: string }[] = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top-center', label: 'Top center' },
  { value: 'top-right', label: 'Top right' },
  { value: 'middle-left', label: 'Middle left' },
  { value: 'middle-center', label: 'Center' },
  { value: 'middle-right', label: 'Middle right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-center', label: 'Bottom center' },
  { value: 'bottom-right', label: 'Bottom right' },
];

export type PdfFileStatus = 'ready' | 'queued' | 'uploading' | 'processing' | 'done' | 'error';

export interface PdfDropzoneReject {
  file: File;
  reason: 'type' | 'size' | 'count';
  message: string;
}

/** A file row in upload lists, queues, and results. */
export interface PdfFileDescriptor {
  id: string;
  name: string;
  size?: number;
  type?: string;
  pageCount?: number;
  status?: PdfFileStatus;
  /** 0–100. */
  progress?: number;
  error?: string;
  thumbnailUrl?: string;
  meta?: string;
  file?: File;
}

/** A tool in a catalog / launcher grid. */
export interface PdfTool {
  id: string;
  name: string;
  description?: string;
  icon?: Component;
  category?: string;
  keywords?: string[];
  badge?: 'new' | 'beta' | 'pro';
  disabled?: boolean;
  href?: string;
}

/** A finished output file, optionally downloadable directly. */
export interface PdfResult {
  id: string;
  name: string;
  size?: number;
  pageCount?: number;
  url?: string;
  blob?: Blob;
  preview?: boolean;
}

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string[];
  creator: string;
  producer: string;
}

export interface PdfPermissions {
  printing: boolean;
  copying: boolean;
  modifying: boolean;
  annotating: boolean;
  formFilling: boolean;
  accessibility: boolean;
}

export interface PdfPasswordOptions {
  password: string;
  confirmPassword: string;
  ownerPassword: string;
  permissions: PdfPermissions;
}

export interface WatermarkOptions {
  type: 'text' | 'image';
  text: string;
  image: File | null;
  imageUrl: string;
  fontSize: number;
  color: string;
  /** 0–100. */
  opacity: number;
  /** Degrees, -180…180. */
  rotation: number;
  position: PdfPosition;
  tile: boolean;
  pageRange: string;
}

export interface PageNumberOptions {
  position: PdfPosition;
  /** Template supporting `{page}` and `{total}`. */
  format: string;
  startNumber: number;
  fontSize: number;
  /** Margin in points. */
  margin: number;
  skipFirst: boolean;
  pageRange: string;
}

export type CompressionLevel = 'low' | 'medium' | 'high' | 'custom';

export interface CompressionOptions {
  level: CompressionLevel;
  /** 0–100. */
  quality: number;
  dpi: number;
  grayscale: boolean;
  optimizeImages: boolean;
}

export interface OcrLanguage {
  code: string;
  name: string;
}

export type OcrMode = 'skip-text' | 'redo' | 'force';

export interface OcrOptions {
  languages: string[];
  mode: OcrMode;
  deskew: boolean;
  clean: boolean;
  rotatePages: boolean;
  /** Image optimization level, 0 = off. */
  optimize: number;
}

export type SplitMode = 'every' | 'ranges' | 'each';

export interface SplitOptions {
  mode: SplitMode;
  everyN: number;
  ranges: string;
}

/** One slot in the page organizer. `page: 0` represents a blank page. */
export interface PageOrganizerItem {
  id: string;
  page: number;
  /** Additional rotation in degrees: 0, 90, 180, 270. */
  rotation: number;
  blank?: boolean;
}

export type SignatureKind = 'draw' | 'type' | 'upload';

export interface SignatureValue {
  dataUrl: string;
  kind: SignatureKind;
  text?: string;
}

export type PdfProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export interface PdfProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

export type PdfFitMode = 'page' | 'width' | 'custom';

export interface PdfDocumentStats {
  pageCount: number;
  fileSize?: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  pdfVersion?: string;
  encrypted?: boolean;
  linearized?: boolean;
}
