<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import type { PdfSearchResults } from '../../lib/pdf';
import {
  configurePdfJs,
  pageRotation,
  searchPdfDocument,
} from '../../lib/pdf';
import { cn } from '../../lib/cn';
import type { PdfFitMode, PdfSource } from '../../lib/types';
import { useElementSize } from '../../composables/useElementSize';
import { usePdfDocument } from '../../composables/usePdfDocument';
import Alert from '../ui/Alert.vue';
import Button from '../ui/Button.vue';
import Dialog from '../ui/Dialog.vue';
import EmptyState from '../ui/EmptyState.vue';
import Field from '../ui/Field.vue';
import Input from '../ui/Input.vue';
import Skeleton from '../ui/Skeleton.vue';
import PdfPageCanvas from './PdfPageCanvas.vue';
import PdfSearchPanel from './PdfSearchPanel.vue';
import PdfThumbnailSidebar from './PdfThumbnailSidebar.vue';
import PdfViewerToolbar from './PdfViewerToolbar.vue';

interface Props {
  source: PdfSource | null | undefined;
  filename?: string;
  initialPage?: number;
  showToolbar?: boolean;
  showThumbnails?: boolean;
  showSearch?: boolean;
  textLayer?: boolean;
  allowDownload?: boolean;
  allowPrint?: boolean;
  workerSrc?: string;
  minZoom?: number;
  maxZoom?: number;
  initialFit?: 'page' | 'width';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  initialPage: 1,
  showToolbar: true,
  showThumbnails: false,
  showSearch: true,
  textLayer: true,
  allowDownload: true,
  allowPrint: false,
  minZoom: 0.25,
  maxZoom: 4,
  initialFit: 'width',
});

const emit = defineEmits<{
  loaded: [payload: { numPages: number }];
  error: [error: unknown];
  pageChange: [page: number];
  download: [];
  print: [];
  passwordRequired: [];
}>();

if (props.workerSrc) configurePdfJs({ workerSrc: props.workerSrc });

const password = ref<string | undefined>();
const { doc, numPages, loading, error, reload, passwordRequired, passwordErrorCode } = usePdfDocument(
  () => props.source,
  { password },
);

const root = ref<HTMLElement | null>(null);
const container = ref<HTMLElement | null>(null);
const { width: containerWidth, height: containerHeight } = useElementSize(container);

const currentPage = ref(Math.max(1, props.initialPage));
const zoom = ref(1);
const rotation = ref(0);
const fitMode = ref<PdfFitMode>(props.initialFit);
const sidebarOpen = ref(
  props.showThumbnails && (typeof window === 'undefined' || window.innerWidth >= 768),
);
const searchOpen = ref(false);
const searchQuery = ref('');
const searchResults = shallowRef<PdfSearchResults | null>(null);
const searching = ref(false);
const fullscreen = ref(false);

const pageSize = ref<{ width: number; height: number } | null>(null);
const renderPages = shallowRef<Set<number>>(new Set());
const pageElements = new Map<number, HTMLElement>();
let visibilityObserver: IntersectionObserver | null = null;
let renderObserver: IntersectionObserver | null = null;
let pendingScrollPage: number | null = null;
let searchTimer: ReturnType<typeof setTimeout> | null = null;
let searchAbort: AbortController | null = null;
let searchToken = 0;

const passwordOpen = ref(false);
const passwordDismissed = ref(false);
const passwordInput = ref('');
const passwordSubmitting = ref(false);
const passwordValidation = ref('');
const unlockError = computed(() => {
  if (passwordValidation.value) return passwordValidation.value;
  if (!passwordRequired.value) return '';
  return passwordErrorCode.value === 2 ? 'That password didn’t work. Try again.' : '';
});

const resolvedFilename = computed(() => {
  if (props.filename) return props.filename;
  if (typeof File !== 'undefined' && props.source instanceof File) return props.source.name;
  return 'document.pdf';
});

function sourceUrl(source: PdfSource): { url: string; revoke: boolean } | null {
  if (typeof source === 'string') return { url: source, revoke: false };
  if (typeof URL !== 'undefined' && source instanceof URL) return { url: source.href, revoke: false };
  if (typeof Blob !== 'undefined' && source instanceof Blob) {
    return { url: URL.createObjectURL(source), revoke: true };
  }
  if (source instanceof ArrayBuffer || ArrayBuffer.isView(source)) {
    const blob = new Blob([source as BlobPart], { type: 'application/pdf' });
    return { url: URL.createObjectURL(blob), revoke: true };
  }
  return null;
}

const showEmpty = computed(() => !props.source);
const showLoadError = computed(() => !!error.value && !passwordRequired.value);
const showLocked = computed(() => passwordRequired.value && passwordDismissed.value);

const zoomPercent = computed(() => Math.round(zoom.value * 100));

function clampZoom(value: number) {
  return Math.min(props.maxZoom, Math.max(props.minZoom, value));
}

function applyFit() {
  if (fitMode.value === 'custom') return;
  const size = pageSize.value;
  if (!size || !containerWidth.value || !containerHeight.value) return;

  const availableWidth = Math.max(120, containerWidth.value - 56);
  const availableHeight = Math.max(120, containerHeight.value - 56);
  const widthScale = availableWidth / size.width;
  const next =
    fitMode.value === 'width'
      ? widthScale
      : Math.min(widthScale, availableHeight / size.height);

  zoom.value = clampZoom(next);
}

async function loadPageSize() {
  const document = doc.value;
  if (!document) {
    pageSize.value = null;
    return;
  }

  try {
    const page = await document.getPage(1);
    const viewport = page.getViewport({ scale: 1, rotation: pageRotation(page, rotation.value) });
    pageSize.value = { width: viewport.width, height: viewport.height };
    applyFit();
  } catch {
    pageSize.value = null;
  }
}

function setZoom(next: number) {
  fitMode.value = 'custom';
  zoom.value = clampZoom(next);
}

function zoomIn() {
  setZoom(zoom.value * 1.2);
}

function zoomOut() {
  setZoom(zoom.value / 1.2);
}

function resetZoom() {
  setZoom(1);
}

function fitWidth() {
  fitMode.value = 'width';
  applyFit();
}

function fitPage() {
  fitMode.value = 'page';
  applyFit();
}

function rotate() {
  rotation.value = (rotation.value + 90) % 360;
}

async function goToPage(page: number, smooth = true) {
  const next = Math.min(Math.max(1, Math.round(page)), Math.max(1, numPages.value));
  currentPage.value = next;
  emit('pageChange', next);

  await nextTick();
  const element = pageElements.get(next);
  const scroll = container.value;
  if (!element || !scroll) {
    pendingScrollPage = next;
    return;
  }

  const top = element.getBoundingClientRect().top - scroll.getBoundingClientRect().top + scroll.scrollTop - 16;
  scroll.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
  pendingScrollPage = null;
}

function setPageElement(page: number, element: unknown) {
  if (element instanceof HTMLElement) {
    pageElements.set(page, element);
    visibilityObserver?.observe(element);
    renderObserver?.observe(element);
    if (pendingScrollPage === page) {
      void nextTick(() => goToPage(page, false));
    }
  } else {
    const existing = pageElements.get(page);
    if (existing) {
      visibilityObserver?.unobserve(existing);
      renderObserver?.unobserve(existing);
      pageElements.delete(page);
    }
  }
}

function onPageRendered(payload: { page: number }) {
  if (pendingScrollPage === payload.page) {
    pendingScrollPage = null;
    void nextTick(() => goToPage(payload.page, false));
  }
}

function setupObservers() {
  visibilityObserver?.disconnect();
  renderObserver?.disconnect();
  visibilityObserver = null;
  renderObserver = null;

  const scroll = container.value;
  if (!scroll || typeof IntersectionObserver === 'undefined') return;

  const visible = new Set<number>();

  visibilityObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const page = Number((entry.target as HTMLElement).dataset.page);
        if (!page) continue;
        if (entry.isIntersecting) visible.add(page);
        else visible.delete(page);
      }
      if (visible.size) {
        const page = Math.min(...visible);
        if (page !== currentPage.value) {
          currentPage.value = page;
          emit('pageChange', page);
        }
      }
    },
    { root: scroll, rootMargin: '-40% 0px -40% 0px', threshold: 0 },
  );

  renderObserver = new IntersectionObserver(
    (entries) => {
      let changed = false;
      const next = new Set(renderPages.value);
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const page = Number((entry.target as HTMLElement).dataset.page);
        if (page && !next.has(page)) {
          next.add(page);
          changed = true;
          renderObserver?.unobserve(entry.target);
        }
      }
      if (changed) renderPages.value = next;
    },
    { root: scroll, rootMargin: '1000px 0px', threshold: 0 },
  );

  for (const [page, element] of pageElements) {
    visibilityObserver.observe(element);
    if (!renderPages.value.has(page)) renderObserver.observe(element);
  }
}

watch(
  doc,
  async (document) => {
    if (!document) return;
    emit('loaded', { numPages: document.numPages });
    currentPage.value = Math.min(Math.max(1, props.initialPage), document.numPages);
    await loadPageSize();
    await nextTick();
    pendingScrollPage = currentPage.value;
    requestAnimationFrame(() => void goToPage(currentPage.value, false));
  },
  { immediate: true },
);

watch(
  () => props.source,
  () => {
    searchQuery.value = '';
    searchResults.value = null;
    password.value = undefined;
    passwordInput.value = '';
    passwordDismissed.value = false;
    pageSize.value = null;
    fitMode.value = props.initialFit;
    renderPages.value = new Set();
  },
);

watch(rotation, async () => {
  await loadPageSize();
  if (fitMode.value !== 'custom') applyFit();
});

watch([containerWidth, containerHeight, fitMode, pageSize], () => applyFit());

watch(
  () => error.value,
  (value) => {
    if (value && !passwordRequired.value) emit('error', value);
  },
);

watch(passwordRequired, (required) => {
  if (required) {
    passwordOpen.value = true;
    passwordDismissed.value = false;
    passwordValidation.value = '';
    emit('passwordRequired');
  } else {
    passwordOpen.value = false;
    passwordSubmitting.value = false;
    passwordInput.value = '';
    passwordValidation.value = '';
  }
});

watch(loading, (value) => {
  if (!value) passwordSubmitting.value = false;
});

function submitPassword() {
  if (!passwordInput.value) {
    passwordValidation.value = 'Enter the password for this PDF.';
    return;
  }
  passwordValidation.value = '';
  passwordSubmitting.value = true;
  password.value = passwordInput.value;
}

function dismissPassword() {
  passwordOpen.value = false;
  passwordDismissed.value = true;
  passwordSubmitting.value = false;
}

function reopenPassword() {
  passwordDismissed.value = false;
  passwordOpen.value = true;
}

function toggleSearch() {
  if (searchOpen.value) closeSearch();
  else searchOpen.value = true;
}

function closeSearch() {
  searchOpen.value = false;
  searchQuery.value = '';
  searchResults.value = null;
  searching.value = false;
  searchAbort?.abort();
  if (searchTimer) clearTimeout(searchTimer);
}

watch(searchQuery, (query) => {
  if (!searchOpen.value) return;

  if (searchTimer) clearTimeout(searchTimer);
  searchAbort?.abort();
  const token = ++searchToken;

  if (query.trim().length < 2) {
    searchResults.value = null;
    searching.value = false;
    return;
  }

  searching.value = true;
  searchTimer = setTimeout(async () => {
    const document = doc.value;
    if (!document) {
      searching.value = false;
      return;
    }
    searchAbort = new AbortController();
    try {
      const results = await searchPdfDocument(document, query, { signal: searchAbort.signal });
      if (token === searchToken) searchResults.value = results;
    } catch {
      if (token === searchToken) searchResults.value = null;
    } finally {
      if (token === searchToken) searching.value = false;
    }
  }, 280);
});

async function downloadFile() {
  const source = props.source;
  if (!source) return;

  const resolved = sourceUrl(source);
  if (!resolved) return;

  const anchor = document.createElement('a');
  anchor.href = resolved.url;
  anchor.download = resolvedFilename.value;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  if (resolved.revoke) window.setTimeout(() => URL.revokeObjectURL(resolved.url), 1500);
  emit('download');
}

function printFile() {
  const source = props.source;
  if (!source) return;

  const resolved = sourceUrl(source);
  if (!resolved) return;

  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.inset = '0';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  frame.src = resolved.url;
  frame.onload = () => {
    try {
      frame.contentWindow?.print();
    } finally {
      window.setTimeout(() => {
        frame.remove();
        if (resolved.revoke) URL.revokeObjectURL(resolved.url);
      }, 1000);
    }
  };
  document.body.append(frame);
  emit('print');
}

function syncFullscreen() {
  fullscreen.value = !!document.fullscreenElement && document.fullscreenElement === root.value;
}

async function toggleFullscreen() {
  if (!root.value) return;
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await root.value.requestFullscreen();
  }
  syncFullscreen();
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault();
    void goToPage(currentPage.value - 1);
  } else if (event.key === 'ArrowRight' || event.key === 'PageDown') {
    event.preventDefault();
    void goToPage(currentPage.value + 1);
  } else if (event.key === '+' || event.key === '=') {
    event.preventDefault();
    zoomIn();
  } else if (event.key === '-') {
    event.preventDefault();
    zoomOut();
  } else if (event.key === '0') {
    event.preventDefault();
    resetZoom();
  } else if (event.key.toLowerCase() === 'f' && !event.metaKey && !event.ctrlKey) {
    event.preventDefault();
    fitWidth();
  }
}

onMounted(() => {
  setupObservers();
  document.addEventListener('fullscreenchange', syncFullscreen);
});

onBeforeUnmount(() => {
  visibilityObserver?.disconnect();
  renderObserver?.disconnect();
  document.removeEventListener('fullscreenchange', syncFullscreen);
  if (searchTimer) clearTimeout(searchTimer);
  searchAbort?.abort();
});

watch(container, setupObservers, { flush: 'post' });

defineExpose({
  goToPage,
  zoomIn,
  zoomOut,
  setZoom,
  fitWidth,
  fitPage,
  resetZoom,
  rotate,
  toggleSearch,
  download: downloadFile,
  print: printFile,
  toggleFullscreen,
});
</script>

<template>
  <div
    ref="root"
    :class="
      cn(
        'spdf flex h-[min(80vh,880px)] min-h-[420px] w-full flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-xs',
        props.class,
      )
    "
  >
    <PdfViewerToolbar
      v-if="props.showToolbar"
      :page="currentPage"
      :page-count="numPages"
      :zoom="zoom"
      :rotation="rotation"
      :filename="props.filename"
      :sidebar-open="sidebarOpen"
      :search-open="searchOpen"
      :show-search="props.showSearch"
      :can-download="props.allowDownload && !!props.source"
      :can-print="props.allowPrint && !!props.source"
      :fullscreen="fullscreen"
      :disabled="loading || !doc"
      @update:page="goToPage($event, false)"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @reset-zoom="resetZoom"
      @fit-width="fitWidth"
      @fit-page="fitPage"
      @rotate="rotate"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      @toggle-search="toggleSearch"
      @download="downloadFile"
      @print="printFile"
      @fullscreen="toggleFullscreen"
    />

    <div class="relative flex min-h-0 flex-1">
      <div
        v-if="sidebarOpen"
        class="absolute inset-y-0 left-0 z-30 h-full shadow-xl md:static md:z-auto md:shadow-none"
      >
        <PdfThumbnailSidebar
          :source="props.source"
          :page-count="numPages"
          :current-page="currentPage"
          :password="password"
          @select="goToPage($event)"
          @close="sidebarOpen = false"
        >
          <template v-if="$slots['sidebar-footer']" #footer>
            <slot name="sidebar-footer" />
          </template>
        </PdfThumbnailSidebar>
      </div>
      <button
        v-if="sidebarOpen"
        type="button"
        class="absolute inset-0 z-20 bg-black/25 md:hidden"
        aria-label="Hide thumbnails"
        @click="sidebarOpen = false"
      />

      <div class="relative min-w-0 flex-1">
        <div
          ref="container"
          class="spdf-scroll absolute inset-0 overflow-auto bg-pdf-canvas focus-visible:outline-none"
          tabindex="0"
          aria-label="Document pages"
          @pointerdown="container?.focus({ preventScroll: true })"
          @keydown="onKeydown"
        >
          <div v-if="showEmpty" class="grid min-h-full place-items-center p-6">
            <slot name="empty">
              <EmptyState
                title="No document open"
                description="Add a PDF to start reading, reviewing, or editing it."
                class="max-w-sm bg-background/60"
              />
            </slot>
          </div>

          <div v-else-if="showLoadError" class="grid min-h-full place-items-center p-6">
            <Alert
              variant="destructive"
              title="Couldn’t open this PDF"
              class="max-w-md"
            >
              <p>{{ error instanceof Error ? error.message : 'The file may be damaged or use an unsupported feature.' }}</p>
              <div class="mt-3">
                <Button size="sm" variant="outline" @click="reload">Try again</Button>
              </div>
            </Alert>
          </div>

          <div v-else-if="showLocked" class="grid min-h-full place-items-center p-6">
            <EmptyState
              title="This PDF is password protected"
              description="Unlock it to view the pages and use document tools."
              class="max-w-sm bg-background/60"
            >
              <template #actions>
                <Button size="sm" @click="reopenPassword">Unlock PDF</Button>
              </template>
            </EmptyState>
          </div>

          <div v-else-if="loading && !numPages" class="flex flex-col items-center gap-6 px-4 py-8">
            <Skeleton
              v-for="index in 2"
              :key="index"
              class="aspect-[0.707] w-[min(100%,560px)] rounded-sm"
            />
            <p class="sr-only" role="status">Loading document</p>
          </div>

          <div v-else-if="numPages" class="mx-auto w-max min-w-full px-4 py-6 sm:px-8">
            <div class="flex flex-col items-center gap-6">
              <div
                v-for="page in numPages"
                :key="page"
                :ref="(element) => setPageElement(page, element)"
                :data-page="page"
                class="relative scroll-mt-4"
              >
                <PdfPageCanvas
                  :doc="doc"
                  :page="page"
                  :scale="zoom"
                  :rotation="rotation"
                  :text-layer="props.textLayer"
                  :search-query="searchQuery"
                  :visible="renderPages.has(page)"
                  :fallback-width="pageSize?.width ?? 612"
                  @rendered="onPageRendered"
                />
              </div>
            </div>
          </div>
        </div>

        <PdfSearchPanel
          v-if="searchOpen"
          v-model="searchQuery"
          :results="searchResults"
          :searching="searching"
          @select="goToPage($event)"
          @close="closeSearch"
        />
      </div>
    </div>

    <Dialog
      v-model:open="passwordOpen"
      title="Password required"
      :description="`Enter the password to open ${resolvedFilename}.`"
      size="sm"
      @update:open="!$event && dismissPassword()"
    >
      <form class="grid gap-4" @submit.prevent="submitPassword">
        <Field label="Password" :error="unlockError" required v-slot="{ id, describedBy, invalid }">
          <Input
            :id="id"
            v-model="passwordInput"
            type="password"
            autocomplete="current-password"
            placeholder="Document password"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
            autofocus
          />
        </Field>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" @click="dismissPassword">Cancel</Button>
          <Button type="submit" :loading="passwordSubmitting">Unlock</Button>
        </div>
      </form>
    </Dialog>
  </div>
</template>
