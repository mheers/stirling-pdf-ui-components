import {
  computed,
  isRef,
  onScopeDispose,
  ref,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { acquirePdfDocument, isPdfPasswordError, pdfPasswordErrorCode, type PdfDocumentHandle } from '../lib/pdf';
import type { PdfSource } from '../lib/types';

export type PdfSourceInput =
  | PdfSource
  | MaybeRefOrGetter<PdfSource | null | undefined>
  | null
  | undefined;

export interface UsePdfDocumentOptions {
  /** Reactive or plain password. Changing it reloads the document. */
  password?: MaybeRefOrGetter<string | undefined> | string;
  onProgress?: (progress: { loaded: number; total: number }) => void;
}

function resolveSource(input: PdfSourceInput): PdfSource | null | undefined {
  if (input === null || input === undefined) return null;
  if (isRef(input)) return input.value;
  if (typeof input === 'function') return (input as () => PdfSource | null | undefined)();
  return input;
}

function resolvePassword(input: UsePdfDocumentOptions['password']): string | undefined {
  if (typeof input === 'string') return input;
  return input ? toValue(input) : undefined;
}

/**
 * Open and release a shared PDF document. Components using the same source
 * share a single PDF.js document instance.
 */
export function usePdfDocument(
  source: PdfSourceInput,
  options: UsePdfDocumentOptions = {},
) {
  const doc = shallowRef<PDFDocumentProxy | null>(null);
  const numPages = ref(0);
  const loading = ref(false);
  const error = shallowRef<unknown>(null);
  const progress = ref(0);
  let handle: PdfDocumentHandle | null = null;
  let token = 0;

  const release = () => {
    handle?.release();
    handle = null;
  };

  const reload = async () => {
    const current = ++token;
    const currentSource = resolveSource(source);
    const password = resolvePassword(options.password);

    release();
    doc.value = null;
    numPages.value = 0;
    error.value = null;
    progress.value = 0;

    if (!currentSource) {
      loading.value = false;
      return;
    }

    // PDF.js needs a DOM and a worker. SSR frameworks should render the viewer
    // inside a client-only boundary; on the server we simply stay idle.
    if (typeof window === 'undefined') {
      loading.value = false;
      return;
    }

    loading.value = true;
    const next = acquirePdfDocument(currentSource, {
      password,
      onProgress: (value) => {
        if (current !== token) return;
        progress.value = value.total > 0 ? value.loaded / value.total : 0;
        options.onProgress?.(value);
      },
    });
    handle = next;

    try {
      const loaded = await next.promise;
      if (current !== token) return;
      doc.value = loaded;
      numPages.value = loaded.numPages;
      progress.value = 1;
    } catch (cause) {
      if (current !== token) return;
      error.value = cause;
    } finally {
      if (current === token) loading.value = false;
    }
  };

  watch(
    [
      () => resolveSource(source),
      () => resolvePassword(options.password),
    ],
    () => void reload(),
    { immediate: true },
  );

  onScopeDispose(() => {
    token += 1;
    release();
  });

  const passwordRequired = computed(() => isPdfPasswordError(error.value));
  const passwordErrorCode = computed(() => pdfPasswordErrorCode(error.value));

  return {
    doc,
    numPages,
    loading,
    error,
    progress,
    reload,
    passwordRequired,
    passwordErrorCode,
  };
}
