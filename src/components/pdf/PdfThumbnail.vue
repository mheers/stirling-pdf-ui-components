<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import type { PDFPageProxy } from 'pdfjs-dist';
import { AlertCircle, Check } from 'lucide-vue-next';
import { useElementSize } from '../../composables/useElementSize';
import { useInView } from '../../composables/useInView';
import { usePdfDocument } from '../../composables/usePdfDocument';
import { cn } from '../../lib/cn';
import {
  isRenderCancelled,
  normalizeRotation,
  pageRotation,
  renderPdfPage,
  scaleForWidth,
  type PdfPageRender,
} from '../../lib/pdf';
import type { PdfSource } from '../../lib/types';

interface Props {
  source: PdfSource | null | undefined;
  /** 1-based page number. */
  page: number;
  /** Rendered thumbnail width in CSS pixels; the card scales down on mobile. */
  width?: number;
  rotation?: number;
  selected?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  lazy?: boolean;
  showNumber?: boolean;
  /** Let the card grow with its container instead of capping at `width`. */
  fluid?: boolean;
  /** Optional caller identifier echoed in the select event. */
  itemId?: string;
  /** Open password for encrypted documents. */
  password?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 150,
  rotation: 0,
  selected: false,
  selectable: false,
  disabled: false,
  lazy: true,
  showNumber: true,
  fluid: false,
});

const emit = defineEmits<{
  select: [payload: { page: number; event: MouseEvent; itemId?: string }];
  open: [page: number];
}>();

const root = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const pageProxy = shallowRef<PDFPageProxy | null>(null);
const rendered = ref(false);
const renderError = ref(false);
const aspectRatio = ref(0.707);
const displayRotation = computed(() => normalizeRotation(props.rotation));
const rotated = computed(() => displayRotation.value !== 0);

const { doc, error: documentError } = usePdfDocument(() => props.source, {
  password: () => props.password,
});
const nearViewport = useInView(root, { rootMargin: '320px 0px', once: true });
const { width: measuredWidth } = useElementSize(root);
const targetWidth = computed(() => Math.max(1, Math.round(measuredWidth.value || props.width)));

let renderHandle: PdfPageRender | null = null;
let renderToken = 0;

function cancelRender() {
  renderHandle?.cancel();
  renderHandle = null;
}

async function loadPage() {
  const document = doc.value;
  if (!document) {
    renderToken += 1;
    cancelRender();
    pageProxy.value = null;
    rendered.value = false;
    renderError.value = false;
    return;
  }

  const token = ++renderToken;
  cancelRender();
  rendered.value = false;
  renderError.value = false;
  pageProxy.value = null;

  try {
    const page = await document.getPage(props.page);
    if (token !== renderToken) return;
    pageProxy.value = page;

    const viewport = page.getViewport({ scale: 1, rotation: pageRotation(page, props.rotation) });
    aspectRatio.value = viewport.width / viewport.height;

    if (nearViewport.value || !props.lazy) {
      await draw();
    }
  } catch {
    if (token === renderToken) renderError.value = true;
  }
}

async function draw() {
  const page = pageProxy.value;
  const element = canvas.value;
  if (!page || !element) return;

  const token = ++renderToken;
  cancelRender();
  rendered.value = false;

  const scale = scaleForWidth(page, targetWidth.value, props.rotation);
  try {
    const handle = renderPdfPage(page, element, {
      scale,
      rotation: props.rotation,
      dpr: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2),
    });
    renderHandle = handle;
    await handle.done;
    if (token === renderToken) rendered.value = true;
  } catch (cause) {
    if (isRenderCancelled(cause)) return;
    if (token === renderToken) renderError.value = true;
  }
}

watch(
  [() => props.source, () => props.page, () => props.rotation],
  () => void loadPage(),
  { immediate: true },
);

watch(doc, () => void loadPage());

watch(nearViewport, (visible) => {
  if (visible && pageProxy.value && !rendered.value) void draw();
});

watch(targetWidth, () => {
  if (pageProxy.value && nearViewport.value) void draw();
});

onBeforeUnmount(() => {
  renderToken += 1;
  cancelRender();
});

const displayError = computed(() => renderError.value || !!documentError.value);
</script>

<template>
  <button
    ref="root"
    type="button"
    :disabled="props.disabled"
    :aria-label="`Page ${props.page}${props.selected ? ', selected' : ''}`"
    :aria-pressed="props.selectable ? props.selected : undefined"
    :class="
      cn(
        'spdf group block w-full text-left focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
        props.class,
      )
    "
    :style="{ maxWidth: props.fluid ? '100%' : `${props.width}px` }"
    @click="emit('select', { page: props.page, event: $event, itemId: props.itemId })"
    @dblclick="emit('open', props.page)"
  >
    <div
      class="spdf-paper relative w-full overflow-hidden rounded-sm border border-pdf-page-border transition-[box-shadow,transform,border-color] duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-pdf-canvas"
      :class="props.selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''"
      :style="{ aspectRatio: `${aspectRatio}` }"
    >
      <canvas
        ref="canvas"
        class="absolute inset-0 size-full"
        :class="rendered ? 'opacity-100' : 'opacity-0'"
        aria-hidden="true"
      />
      <div v-if="!rendered && !displayError" class="spdf-skeleton absolute inset-0" aria-hidden="true" />
      <div v-if="displayError" class="absolute inset-0 grid place-items-center bg-muted text-muted-foreground">
        <div class="grid justify-items-center gap-1.5">
          <AlertCircle class="size-5" aria-hidden="true" />
          <span class="text-[10px] font-medium">Page {{ props.page }}</span>
        </div>
      </div>

      <div
        v-if="props.selectable && props.selected"
        class="pointer-events-none absolute inset-0 bg-primary/5 ring-2 ring-primary ring-inset"
        aria-hidden="true"
      />
      <span
        v-if="props.selectable && props.selected"
        class="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm"
        aria-hidden="true"
      >
        <Check class="size-3" />
      </span>
    </div>

    <div v-if="props.showNumber" class="mt-1.5 flex h-4 items-center gap-1.5 px-0.5">
      <span
        class="spdf-tabular text-[11px] font-medium transition-colors"
        :class="props.selected ? 'text-primary' : 'text-muted-foreground'"
      >{{ props.page }}</span>
      <span v-if="rotated" class="text-[10px] text-muted-foreground/70">{{ displayRotation }}°</span>
    </div>
  </button>
</template>
