import type {
  CompressionOptions,
  OcrLanguage,
  OcrOptions,
  PageNumberOptions,
  PdfMetadata,
  PdfPasswordOptions,
  PdfPermissions,
  SplitOptions,
  WatermarkOptions,
} from './types';

export function defaultPdfMetadata(): PdfMetadata {
  return {
    title: '',
    author: '',
    subject: '',
    keywords: [],
    creator: '',
    producer: '',
  };
}

export function defaultPdfPermissions(): PdfPermissions {
  return {
    printing: true,
    copying: true,
    modifying: true,
    annotating: true,
    formFilling: true,
    accessibility: true,
  };
}

export function defaultPasswordOptions(): PdfPasswordOptions {
  return {
    password: '',
    confirmPassword: '',
    ownerPassword: '',
    permissions: defaultPdfPermissions(),
  };
}

export function defaultWatermarkOptions(): WatermarkOptions {
  return {
    type: 'text',
    text: 'CONFIDENTIAL',
    image: null,
    imageUrl: '',
    fontSize: 48,
    color: '#64748b',
    opacity: 18,
    rotation: -35,
    position: 'middle-center',
    tile: false,
    pageRange: 'all',
  };
}

export function defaultPageNumberOptions(): PageNumberOptions {
  return {
    position: 'bottom-center',
    format: '{page} of {total}',
    startNumber: 1,
    fontSize: 10,
    margin: 24,
    skipFirst: false,
    pageRange: 'all',
  };
}

export function defaultCompressionOptions(): CompressionOptions {
  return {
    level: 'medium',
    quality: 75,
    dpi: 150,
    grayscale: false,
    optimizeImages: true,
  };
}

export function defaultOcrOptions(): OcrOptions {
  return {
    languages: ['eng'],
    mode: 'skip-text',
    deskew: true,
    clean: true,
    rotatePages: false,
    optimize: 1,
  };
}

export function defaultSplitOptions(): SplitOptions {
  return {
    mode: 'every',
    everyN: 1,
    ranges: '',
  };
}

export const COMMON_OCR_LANGUAGES: OcrLanguage[] = [
  { code: 'eng', name: 'English' },
  { code: 'deu', name: 'German' },
  { code: 'fra', name: 'French' },
  { code: 'spa', name: 'Spanish' },
  { code: 'ita', name: 'Italian' },
  { code: 'por', name: 'Portuguese' },
  { code: 'nld', name: 'Dutch' },
  { code: 'pol', name: 'Polish' },
  { code: 'rus', name: 'Russian' },
  { code: 'ukr', name: 'Ukrainian' },
  { code: 'tur', name: 'Turkish' },
  { code: 'swe', name: 'Swedish' },
  { code: 'dan', name: 'Danish' },
  { code: 'nor', name: 'Norwegian' },
  { code: 'fin', name: 'Finnish' },
  { code: 'ces', name: 'Czech' },
  { code: 'ron', name: 'Romanian' },
  { code: 'hun', name: 'Hungarian' },
  { code: 'ell', name: 'Greek' },
  { code: 'ara', name: 'Arabic' },
  { code: 'heb', name: 'Hebrew' },
  { code: 'hin', name: 'Hindi' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'kor', name: 'Korean' },
  { code: 'chi_sim', name: 'Chinese (Simplified)' },
  { code: 'chi_tra', name: 'Chinese (Traditional)' },
];
