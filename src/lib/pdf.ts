import type {
  PDFDocumentProxy,
  PDFPageProxy,
  PageViewport,
  RenderTask,
} from 'pdfjs-dist';
import type { PdfDocumentStats, PdfSource } from './types';

type PdfJsModule = typeof import('pdfjs-dist');
type PdfDocumentParams = NonNullable<Parameters<PdfJsModule['getDocument']>[0]>;

/**
 * PDF.js configuration. Call this once at application start-up, before any
 * viewer or thumbnail mounts.
 *
 * ```ts
 * import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
 * import { configurePdfJs } from '@mheers/stirling-pdf-ui-components';
 *
 * configurePdfJs({ workerSrc: workerUrl });
 * ```
 */
export interface PdfJsConfig {
  /** URL of `pdf.worker.min.mjs`, usually imported with Vite's `?url`. */
  workerSrc?: string;
  /** Optional URL for PDF.js cmaps (non-embedded CJK fonts). */
  cMapUrl?: string;
  cMapPacked?: boolean;
  /** Optional URL for the standard font data files. */
  standardFontDataUrl?: string;
  /** Optional URL for PDF.js wasm assets (JPEG 2000, ICC profiles, …). */
  wasmUrl?: string;
  iccUrl?: string;
}

export class PdfConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PdfConfigurationError';
  }
}

let userConfig: PdfJsConfig = {};
let pdfJsPromise: Promise<typeof import('pdfjs-dist')> | null = null;

/** Configure PDF.js. Safe to call repeatedly; values are merged. */
export function configurePdfJs(config: PdfJsConfig): void {
  userConfig = { ...userConfig, ...config };
  if (pdfJsPromise) {
    void applyGlobalConfig();
  }
}

export function getPdfJsConfig(): Readonly<PdfJsConfig> {
  return userConfig;
}

async function applyGlobalConfig(): Promise<void> {
  const pdfjs = await loadPdfJsModule();
  if (userConfig.workerSrc && pdfjs.GlobalWorkerOptions.workerSrc !== userConfig.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = userConfig.workerSrc;
  }
}

async function loadPdfJsModule(): Promise<typeof import('pdfjs-dist')> {
  if (!pdfJsPromise) {
    pdfJsPromise = import('pdfjs-dist');
  }
  return pdfJsPromise;
}

/**
 * Lazily import PDF.js and apply the configured worker. The engine stays out of
 * the main bundle until a component that needs it actually mounts.
 */
export async function loadPdfJs(): Promise<typeof import('pdfjs-dist')> {
  const pdfjs = await loadPdfJsModule();
  if (userConfig.workerSrc && pdfjs.GlobalWorkerOptions.workerSrc !== userConfig.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = userConfig.workerSrc;
  }
  return pdfjs;
}

const objectIds = new WeakMap<object, string>();
let objectCounter = 0;

function objectId(source: object): string {
  const existing = objectIds.get(source);
  if (existing) return existing;
  objectCounter += 1;
  const id = `obj-${objectCounter}`;
  objectIds.set(source, id);
  return id;
}

/** Stable cache key for a PDF source. */
export function pdfSourceKey(source: PdfSource): string {
  if (typeof source === 'string') return `url:${source}`;
  if (typeof URL !== 'undefined' && source instanceof URL) return `url:${source.href}`;
  if (typeof File !== 'undefined' && source instanceof File) {
    return `file:${source.name}:${source.size}:${source.lastModified}`;
  }
  return `object:${objectId(source)}`;
}

function isBinarySource(source: PdfSource): source is ArrayBuffer | Uint8Array {
  return source instanceof ArrayBuffer || ArrayBuffer.isView(source);
}

function isBlobSource(source: PdfSource): source is Blob {
  return typeof Blob !== 'undefined' && source instanceof Blob;
}

async function documentParams(
  source: PdfSource,
  password?: string,
): Promise<PdfDocumentParams> {
  const params: PdfDocumentParams = {
    cMapUrl: userConfig.cMapUrl,
    cMapPacked: userConfig.cMapPacked ?? true,
    standardFontDataUrl: userConfig.standardFontDataUrl,
    wasmUrl: userConfig.wasmUrl,
    iccUrl: userConfig.iccUrl,
    password,
  };

  if (typeof source === 'string') {
    params.url = source;
  } else if (typeof URL !== 'undefined' && source instanceof URL) {
    params.url = source.href;
  } else if (source instanceof ArrayBuffer) {
    // PDF.js transfers typed arrays to its worker. Copy so the caller keeps a
    // usable buffer after the document has loaded.
    params.data = source.slice(0);
  } else if (isBinarySource(source)) {
    params.data = new Uint8Array(source);
  } else if (isBlobSource(source)) {
    params.data = new Uint8Array(await source.arrayBuffer());
  } else {
    throw new TypeError('Unsupported PDF source. Use a URL, File, Blob, ArrayBuffer, or Uint8Array.');
  }

  return params;
}

interface CacheEntry {
  key: string;
  refs: number;
  promise: Promise<PDFDocumentProxy>;
  doc: PDFDocumentProxy | null;
}

const documentCache = new Map<string, CacheEntry>();

export interface AcquirePdfDocumentOptions {
  password?: string;
  onProgress?: (progress: { loaded: number; total: number }) => void;
}

export interface PdfDocumentHandle {
  key: string;
  promise: Promise<PDFDocumentProxy>;
  /** Release this component's reference. The document is destroyed at zero. */
  release: () => void;
}

/**
 * Open a PDF and share it between every component using the same source.
 * Thumbnails, the viewer, and the info panel therefore hold one document, not
 * one per component.
 */
export function acquirePdfDocument(
  source: PdfSource,
  options: AcquirePdfDocumentOptions = {},
): PdfDocumentHandle {
  const key = `${pdfSourceKey(source)}::${options.password ? `pw:${options.password}` : ''}`;
  let entry = documentCache.get(key);

  if (!entry) {
    const created: CacheEntry = {
      key,
      refs: 0,
      doc: null,
      promise: Promise.resolve(null as unknown as PDFDocumentProxy),
    };

    created.promise = (async () => {
      const pdfjs = await loadPdfJs();

      if (
        typeof window !== 'undefined' &&
        !pdfjs.GlobalWorkerOptions.workerSrc &&
        !pdfjs.GlobalWorkerOptions.workerPort
      ) {
        throw new PdfConfigurationError(
          'PDF.js has no worker configured. Call configurePdfJs({ workerSrc }) once at application start-up, or set GlobalWorkerOptions.workerSrc yourself.',
        );
      }

      const task = pdfjs.getDocument(await documentParams(source, options.password));

      if (options.onProgress) {
        task.onProgress = (progress: { loaded: number; total: number }) => options.onProgress?.(progress);
      }

      const doc = await task.promise;
      created.doc = doc;
      if (created.refs <= 0) {
        void doc.loadingTask.destroy();
      }
      return doc;
    })().catch((error) => {
      documentCache.delete(key);
      throw error;
    });

    entry = created;
    documentCache.set(key, entry);
  }

  entry.refs += 1;
  let released = false;
  const current = entry;

  return {
    key,
    promise: current.promise,
    release() {
      if (released) return;
      released = true;
      current.refs -= 1;
      if (current.refs <= 0) {
        documentCache.delete(current.key);
        void current.doc?.loadingTask.destroy();
      }
    },
  };
}

/** Destroy every cached document. Useful in tests and hot-reload boundaries. */
export function clearPdfDocumentCache(): void {
  for (const entry of documentCache.values()) {
    void entry.doc?.loadingTask.destroy();
  }
  documentCache.clear();
}

/** True for PDF.js password errors (wrong or missing password). */
export function isPdfPasswordError(error: unknown): boolean {
  return !!error && typeof error === 'object' && (error as { name?: string }).name === 'PasswordException';
}

/** 1 = password required, 2 = incorrect password. */
export function pdfPasswordErrorCode(error: unknown): number | null {
  if (!isPdfPasswordError(error)) return null;
  const code = (error as { code?: number }).code;
  return typeof code === 'number' ? code : null;
}

export function normalizeRotation(rotation: number): number {
  return ((Math.round(rotation / 90) * 90) % 360 + 360) % 360;
}

/** Total rotation a page needs: its intrinsic rotation plus a user rotation. */
export function pageRotation(page: PDFPageProxy, extraRotation = 0): number {
  return normalizeRotation((page.rotate ?? 0) + extraRotation);
}

/** Scale that makes a page exactly `width` CSS pixels wide at a rotation. */
export function scaleForWidth(page: PDFPageProxy, width: number, extraRotation = 0): number {
  const viewport = page.getViewport({ scale: 1, rotation: pageRotation(page, extraRotation) });
  return Math.max(0.01, width / viewport.width);
}

export interface RenderPdfPageOptions {
  scale: number;
  /** Additional rotation on top of the page's intrinsic rotation. */
  rotation?: number;
  dpr?: number;
  background?: string;
}

export interface PdfPageRender {
  viewport: PageViewport;
  task: RenderTask;
  done: Promise<PageViewport>;
  cancel: () => void;
}

/**
 * Start rendering a page into a canvas. The returned `task` can be cancelled
 * when the component re-renders or unmounts.
 */
export function renderPdfPage(
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  options: RenderPdfPageOptions,
): PdfPageRender {
  const dpr = options.dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  const viewport = page.getViewport({
    scale: options.scale,
    rotation: pageRotation(page, options.rotation),
  });

  canvas.width = Math.max(1, Math.floor(viewport.width * dpr));
  canvas.height = Math.max(1, Math.floor(viewport.height * dpr));
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  const task = page.render({
    canvas,
    viewport,
    transform: dpr === 1 ? undefined : [dpr, 0, 0, dpr, 0, 0],
    background: options.background,
  });

  return {
    viewport,
    task,
    done: task.promise.then(() => viewport),
    cancel: () => task.cancel(),
  };
}

/** True when a render error is just a cancelled render. */
export function isRenderCancelled(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    (error as { name?: string }).name === 'RenderingCancelledException'
  );
}

export interface PdfTextLayerHandle {
  cancel: () => void;
}

/**
 * Render PDF.js's selectable text layer on top of a canvas. Returns `null` when
 * the installed PDF.js version does not expose `TextLayer`.
 */
export async function renderPdfTextLayer(
  page: PDFPageProxy,
  container: HTMLElement,
  viewport: PageViewport,
): Promise<PdfTextLayerHandle | null> {
  const pdfjs = await loadPdfJs();
  const TextLayerCtor = (pdfjs as unknown as { TextLayer?: new (params: unknown) => { render: () => Promise<unknown>; cancel: () => void } }).TextLayer;
  if (!TextLayerCtor) return null;

  container.classList.add('textLayer');
  container.style.setProperty('--total-scale-factor', String(viewport.scale));
  container.style.setProperty('--scale-factor', String(viewport.scale));
  container.style.setProperty('--scale-round-x', '1px');
  container.style.setProperty('--scale-round-y', '1px');
  container.replaceChildren();

  const layer = new TextLayerCtor({
    textContentSource: page.streamTextContent(),
    container,
    viewport,
  });

  await layer.render();
  return { cancel: () => layer.cancel() };
}

/**
 * Compute highlight rectangles from the rendered text-layer spans. This is the
 * most accurate option for scaled and rotated pages because the browser has
 * already laid out every glyph run.
 */
export function findTextLayerHighlights(
  textLayer: HTMLElement,
  query: string,
  pageContainer?: HTMLElement,
  limit = 200,
): PdfHighlightBox[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const pageRect = (pageContainer ?? textLayer).getBoundingClientRect();
  const boxes: PdfHighlightBox[] = [];

  for (const span of textLayer.querySelectorAll<HTMLElement>('span')) {
    const text = span.textContent ?? '';
    if (!text.toLowerCase().includes(needle)) continue;

    const rect = span.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;

    boxes.push({
      left: rect.left - pageRect.left,
      top: rect.top - pageRect.top,
      width: rect.width,
      height: rect.height,
      text,
    });

    if (boxes.length >= limit) break;
  }

  return boxes;
}

export interface PdfHighlightBox {
  left: number;
  top: number;
  width: number;
  height: number;
  text: string;
}

/**
 * Compute highlight rectangles for text runs that contain `query`. Handles
 * rotated and scaled pages by following the baseline direction and applying the
 * visual font height.
 */
export async function findPdfTextHighlights(
  page: PDFPageProxy,
  viewport: PageViewport,
  query: string,
  limit = 200,
): Promise<PdfHighlightBox[]> {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const pdfjs = await loadPdfJs();
  const content = await page.getTextContent();
  const boxes: PdfHighlightBox[] = [];

  for (const item of content.items) {
    if (!('str' in item) || !item.str) continue;
    if (!item.str.toLowerCase().includes(needle)) continue;

    const matrix = pdfjs.Util.transform(viewport.transform, item.transform);
    const angle = Math.atan2(matrix[1], matrix[0]);
    const fontHeight = Math.max(1, Math.hypot(matrix[2], matrix[3]));
    const width = Math.max(1, Math.abs(item.width) * viewport.scale);
    const direction = { x: Math.cos(angle), y: Math.sin(angle) };
    const up = { x: Math.sin(angle), y: -Math.cos(angle) };
    const start = { x: matrix[4], y: matrix[5] };

    const corners = [
      start,
      { x: start.x + direction.x * width, y: start.y + direction.y * width },
      { x: start.x + up.x * fontHeight, y: start.y + up.y * fontHeight },
      {
        x: start.x + direction.x * width + up.x * fontHeight,
        y: start.y + direction.y * width + up.y * fontHeight,
      },
    ];

    const xs = corners.map((corner) => corner.x);
    const ys = corners.map((corner) => corner.y);
    const left = Math.min(...xs);
    const top = Math.min(...ys);

    boxes.push({
      left,
      top,
      width: Math.max(1, Math.max(...xs) - left),
      height: Math.max(1, Math.max(...ys) - top),
      text: item.str,
    });

    if (boxes.length >= limit) break;
  }

  return boxes;
}

export interface PdfSearchMatch {
  page: number;
  snippet: string;
  index: number;
}

export interface PdfSearchResults {
  query: string;
  total: number;
  matches: PdfSearchMatch[];
  byPage: { page: number; count: number }[];
  truncated: boolean;
}

/**
 * Search a document's text layer. Matches are case-insensitive and snippets
 * are centred on the first hit in each text run.
 */
export async function searchPdfDocument(
  doc: PDFDocumentProxy,
  query: string,
  options: { maxMatches?: number; perPage?: number; signal?: AbortSignal } = {},
): Promise<PdfSearchResults> {
  const needle = query.trim().toLowerCase();
  const maxMatches = options.maxMatches ?? 200;
  const perPageLimit = options.perPage ?? 8;

  if (needle.length < 2) {
    return { query, total: 0, matches: [], byPage: [], truncated: false };
  }

  const matches: PdfSearchMatch[] = [];
  const byPage: { page: number; count: number }[] = [];
  let total = 0;
  let truncated = false;

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    if (options.signal?.aborted) break;

    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const lower = text.toLowerCase();
    let from = 0;
    let pageMatches = 0;

    while (pageMatches < perPageLimit) {
      const at = lower.indexOf(needle, from);
      if (at === -1) break;

      const start = Math.max(0, at - 36);
      const end = Math.min(text.length, at + needle.length + 48);
      const prefix = start > 0 ? '…' : '';
      const suffix = end < text.length ? '…' : '';
      const snippet = `${prefix}${text.slice(start, end).trim()}${suffix}`;

      matches.push({ page: pageNumber, snippet, index: matches.length });
      total += 1;
      pageMatches += 1;
      from = at + needle.length;

      if (matches.length >= maxMatches) {
        truncated = true;
        break;
      }
    }

    if (pageMatches > 0) byPage.push({ page: pageNumber, count: pageMatches });
    if (truncated) break;
  }

  return { query, total, matches, byPage, truncated };
}

/** Read human-facing document statistics for an info panel. */
export async function getPdfDocumentStats(
  doc: PDFDocumentProxy,
  source?: PdfSource,
): Promise<PdfDocumentStats> {
  let info: Record<string, unknown> = {};
  try {
    const metadata = await doc.getMetadata();
    info = (metadata.info ?? {}) as Record<string, unknown>;
  } catch {
    // Some documents have malformed metadata; the page count is still useful.
  }

  const fileSize = source && isBlobSource(source) ? source.size : undefined;
  const keywords = info.Keywords;

  return {
    pageCount: doc.numPages,
    fileSize,
    title: typeof info.Title === 'string' ? info.Title : undefined,
    author: typeof info.Author === 'string' ? info.Author : undefined,
    subject: typeof info.Subject === 'string' ? info.Subject : undefined,
    keywords: Array.isArray(keywords)
      ? keywords.map(String)
      : typeof keywords === 'string'
        ? keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean)
        : undefined,
    creator: typeof info.Creator === 'string' ? info.Creator : undefined,
    producer: typeof info.Producer === 'string' ? info.Producer : undefined,
    pdfVersion: typeof info.PDFFormatVersion === 'string' ? info.PDFFormatVersion : undefined,
    encrypted: info.IsEncrypted === true,
    linearized: info.IsLinearized === true,
  };
}
