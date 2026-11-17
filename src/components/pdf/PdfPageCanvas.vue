<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import {
  findPdfTextHighlights,
  findTextLayerHighlights,
  isRenderCancelled,
  normalizeRotation,
  pageRotation,
  renderPdfPage,
  renderPdfTextLayer,
  type PdfHighlightBox,
  type PdfPageRender,
  type PdfTextLayerHandle,
} from '../../lib/pdf';
import { cn } from '../../lib/cn';

interface Props {
  doc: PDFDocumentProxy | null;
  page: number;
  scale: number;
  rotation?: number;
  textLayer?: boolean;
  searchQuery?: string;
  visible?: boolean;
  fallbackWidth?: number;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  rotation: 0,
  textLayer: true,
  visible: true,
  fallbackWidth: 612,
});

const emit = defineEmits<{
  rendered: [payload: { page: number; width: number; height: number }];
  error: [error: unknown];
}>();

const root = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const textLayerEl = ref<HTMLElement | null>(null);
const pageProxy = shallowRef<PDFPageProxy | null>(null);
const viewport = shallowRef<ReturnType<PDFPageProxy['getViewport']> | null>(null);
const highlights = ref<PdfHighlightBox[]>([]);
const loading = ref(true);
const rendered = ref(false);
const failed = ref(false);

let renderHandle: PdfPageRender | null = null;
let textHandle: PdfTextLayerHandle | null = null;
let token = 0;

const width = computed(() => viewport.value?.width ?? props.fallbackWidth * props.scale);
const height = computed(() => viewport.value?.height ?? width.value / 0.707);
const rotationValue = computed(() => normalizeRotation(props.rotation));

function cancel() {
  renderHandle?.cancel();
  renderHandle = null;
  textHandle?.cancel();
  textHandle = null;
}

async function loadPage() {
  const document = props.doc;
  if (!document) return;

  const current = ++token;
  cancel();
  loading.value = true;
  rendered.value = false;
  failed.value = false;
  highlights.value = [];
  pageProxy.value = null;
  viewport.value = null;

  try {
    const page = await document.getPage(props.page);
    if (current !== token) return;
    pageProxy.value = page;
    viewport.value = page.getViewport({ scale: props.scale, rotation: pageRotation(page, props.rotation) });
    loading.value = false;

    if (props.visible) await render();
  } catch (cause) {
    if (current !== token) return;
    failed.value = true;
    loading.value = false;
    emit('error', cause);
  }
}

async function render() {
  const page = pageProxy.value;
  const element = canvas.value;
  const layer = textLayerEl.value;
  if (!page || !element || !props.visible) return;

  const current = ++token;
  cancel();
  rendered.value = false;

  try {
    const handle = renderPdfPage(page, element, {
      scale: props.scale,
      rotation: props.rotation,
      dpr: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2),
    });
    renderHandle = handle;
    const pageViewport = await handle.done;
    if (current !== token) return;

    viewport.value = pageViewport;
    rendered.value = true;
    emit('rendered', { page: props.page, width: pageViewport.width, height: pageViewport.height });

    if (props.textLayer && layer) {
      try {
        textHandle = await renderPdfTextLayer(page, layer, pageViewport);
      } catch {
        // Text selection is an enhancement; rendering still succeeded.
      }
    }

    await loadHighlights();
  } catch (cause) {
    if (isRenderCancelled(cause)) return;
    if (current !== token) return;
    failed.value = true;
    emit('error', cause);
  }
}

async function loadHighlights() {
  const page = pageProxy.value;
  const pageViewport = viewport.value;
  const query = props.searchQuery?.trim();
  if (!page || !pageViewport || !query || query.length < 2) {
    highlights.value = [];
    return;
  }

  try {
    const layer = textLayerEl.value;
    if (props.textLayer && layer?.querySelector('span')) {
      highlights.value = findTextLayerHighlights(layer, query, root.value ?? undefined);
      return;
    }
    highlights.value = await findPdfTextHighlights(page, pageViewport, query);
  } catch {
    highlights.value = [];
  }
}

watch(
  [() => props.doc, () => props.page, () => props.scale, () => props.rotation],
  () => void loadPage(),
  { immediate: true },
);

watch(
  () => props.visible,
  (visible) => {
    if (!visible || !pageProxy.value) return;
    if (!rendered.value) void render();
    else void loadHighlights();
  },
);

watch(
  () => props.searchQuery,
  () => {
    if (props.visible) void loadHighlights();
  },
);

onBeforeUnmount(() => {
  token += 1;
  cancel();
});
</script>

<template>
  <div
    ref="root"
    :class="cn('spdf relative shrink-0 overflow-hidden bg-pdf-page spdf-paper', props.class)"
    :style="{ width: `${width}px`, height: `${height}px` }"
    :data-page-rotation="rotationValue"
  >
    <canvas
      ref="canvas"
      class="absolute inset-0 size-full"
      :class="rendered ? 'opacity-100' : 'opacity-0'"
      :aria-label="`Page ${props.page}`"
      role="img"
    />

    <div v-if="props.textLayer" ref="textLayerEl" class="spdf-text-layer" />

    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        v-for="(box, index) in highlights"
        :key="index"
        class="absolute rounded-[1px] bg-pdf-highlight"
        :style="{
          left: `${box.left}px`,
          top: `${box.top}px`,
          width: `${box.width}px`,
          height: `${box.height}px`,
        }"
      />
    </div>

    <div v-if="!rendered && !failed" class="spdf-skeleton absolute inset-0" aria-hidden="true" />
    <div v-if="failed" class="absolute inset-0 grid place-items-center bg-muted text-xs text-muted-foreground">
      Could not render page {{ props.page }}
    </div>
    <div v-if="loading" class="sr-only" role="status">Loading page {{ props.page }}</div>
  </div>
</template>
