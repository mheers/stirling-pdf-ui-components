<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Expand,
  Maximize,
  Minus,
  MoveHorizontal,
  PanelLeft,
  Plus,
  Printer,
  RotateCw,
  Search,
  Shrink,
} from 'lucide-vue-next';
import { cn } from '../../lib/cn';
import Button from '../ui/Button.vue';
import Input from '../ui/Input.vue';
import Tooltip from '../ui/Tooltip.vue';

interface Props {
  page: number;
  pageCount: number;
  zoom: number;
  rotation?: number;
  filename?: string;
  sidebarOpen?: boolean;
  searchOpen?: boolean;
  showSidebarToggle?: boolean;
  showSearch?: boolean;
  canDownload?: boolean;
  canPrint?: boolean;
  fullscreen?: boolean;
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  rotation: 0,
  sidebarOpen: false,
  searchOpen: false,
  showSidebarToggle: true,
  showSearch: true,
  canDownload: true,
  canPrint: false,
  fullscreen: false,
  disabled: false,
});

const emit = defineEmits<{
  'update:page': [page: number];
  zoomIn: [];
  zoomOut: [];
  resetZoom: [];
  fitWidth: [];
  fitPage: [];
  rotate: [];
  toggleSidebar: [];
  toggleSearch: [];
  download: [];
  print: [];
  fullscreen: [];
}>();

const pageInput = ref(String(props.page));

watch(
  () => props.page,
  (page) => {
    pageInput.value = String(page);
  },
);

const zoomPercent = computed(() => `${Math.round(props.zoom * 100)}%`);
const canGoBack = computed(() => props.page > 1);
const canGoForward = computed(() => props.page < props.pageCount);

function commitPage() {
  const parsed = Number.parseInt(pageInput.value, 10);
  if (!Number.isFinite(parsed)) {
    pageInput.value = String(props.page);
    return;
  }
  const next = Math.min(Math.max(1, parsed), Math.max(1, props.pageCount));
  pageInput.value = String(next);
  if (next !== props.page) emit('update:page', next);
}

function step(delta: number) {
  const next = Math.min(Math.max(1, props.page + delta), Math.max(1, props.pageCount));
  if (next !== props.page) emit('update:page', next);
}
</script>

<template>
  <div
    :class="
      cn(
        'spdf flex min-h-12 shrink-0 flex-wrap items-center gap-1 border-b border-border bg-background/95 px-2 py-1 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:h-12 sm:flex-nowrap sm:py-0',
        props.class,
      )
    "
  >
    <div class="order-1 flex items-center gap-0.5">
      <Tooltip v-if="props.showSidebarToggle" :content="props.sidebarOpen ? 'Hide thumbnails' : 'Show thumbnails'">
        <Button
          variant="ghost"
          size="icon-sm"
          :class="props.sidebarOpen ? 'bg-accent text-accent-foreground' : ''"
          :aria-pressed="props.sidebarOpen"
          aria-label="Toggle thumbnails"
          @click="emit('toggleSidebar')"
        >
          <PanelLeft />
        </Button>
      </Tooltip>
      <span v-if="props.filename" class="ml-1 hidden max-w-48 truncate text-xs font-medium text-muted-foreground lg:block">
        {{ props.filename }}
      </span>
    </div>

    <div class="order-2 flex min-w-0 flex-1 items-center justify-center gap-0.5">
      <Tooltip content="Previous page">
        <Button variant="ghost" size="icon-sm" :disabled="!canGoBack || props.disabled" aria-label="Previous page" @click="step(-1)">
          <ChevronLeft />
        </Button>
      </Tooltip>
      <Input
        v-model="pageInput"
        type="text"
        inputmode="numeric"
        aria-label="Page number"
        class="spdf-tabular h-7 w-11 px-1 text-center text-xs"
        :disabled="props.disabled || props.pageCount === 0"
        @keydown.enter.prevent="commitPage"
        @blur="commitPage"
      />
      <span class="spdf-tabular px-0.5 text-xs text-muted-foreground">/ {{ props.pageCount || '—' }}</span>
      <Tooltip content="Next page">
        <Button variant="ghost" size="icon-sm" :disabled="!canGoForward || props.disabled" aria-label="Next page" @click="step(1)">
          <ChevronRight />
        </Button>
      </Tooltip>
    </div>

    <div class="order-3 flex w-full items-center justify-end gap-0.5 border-t border-border/60 pt-1 sm:w-auto sm:border-0 sm:pt-0">
      <Tooltip content="Zoom out">
        <Button variant="ghost" size="icon-sm" :disabled="props.disabled" aria-label="Zoom out" @click="emit('zoomOut')">
          <Minus />
        </Button>
      </Tooltip>
      <Tooltip content="Reset to 100%">
        <button
          type="button"
          class="spdf-tabular inline-flex h-7 min-w-12 items-center justify-center rounded-md px-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          aria-label="Reset zoom"
          @click="emit('resetZoom')"
        >
          {{ zoomPercent }}
        </button>
      </Tooltip>
      <Tooltip content="Zoom in">
        <Button variant="ghost" size="icon-sm" :disabled="props.disabled" aria-label="Zoom in" @click="emit('zoomIn')">
          <Plus />
        </Button>
      </Tooltip>

      <span class="mx-0.5 hidden h-5 w-px bg-border md:block" />

      <Tooltip content="Fit width">
        <Button variant="ghost" size="icon-sm" class="hidden md:inline-flex" :disabled="props.disabled" aria-label="Fit width" @click="emit('fitWidth')">
          <MoveHorizontal />
        </Button>
      </Tooltip>
      <Tooltip content="Fit page">
        <Button variant="ghost" size="icon-sm" class="hidden md:inline-flex" :disabled="props.disabled" aria-label="Fit page" @click="emit('fitPage')">
          <Maximize />
        </Button>
      </Tooltip>
      <Tooltip content="Rotate">
        <Button variant="ghost" size="icon-sm" :disabled="props.disabled" aria-label="Rotate pages" @click="emit('rotate')">
          <RotateCw />
        </Button>
      </Tooltip>
      <Tooltip v-if="props.showSearch" content="Search">
        <Button
          variant="ghost"
          size="icon-sm"
          :class="props.searchOpen ? 'bg-accent text-accent-foreground' : ''"
          :aria-pressed="props.searchOpen"
          aria-label="Search document"
          @click="emit('toggleSearch')"
        >
          <Search />
        </Button>
      </Tooltip>

      <span class="mx-0.5 hidden h-5 w-px bg-border sm:block" />

      <Tooltip v-if="props.canDownload" content="Download">
        <Button variant="ghost" size="icon-sm" :disabled="props.disabled" aria-label="Download PDF" @click="emit('download')">
          <Download />
        </Button>
      </Tooltip>
      <Tooltip v-if="props.canPrint" content="Print">
        <Button variant="ghost" size="icon-sm" class="hidden lg:inline-flex" :disabled="props.disabled" aria-label="Print PDF" @click="emit('print')">
          <Printer />
        </Button>
      </Tooltip>
      <Tooltip :content="props.fullscreen ? 'Exit full screen' : 'Full screen'">
        <Button
          variant="ghost"
          size="icon-sm"
          class="hidden sm:inline-flex"
          :disabled="props.disabled"
          :aria-label="props.fullscreen ? 'Exit full screen' : 'Full screen'"
          @click="emit('fullscreen')"
        >
          <Shrink v-if="props.fullscreen" />
          <Expand v-else />
        </Button>
      </Tooltip>
    </div>
  </div>
</template>
