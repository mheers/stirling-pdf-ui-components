<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { FileText } from '@lucide/vue';
import { usePdfDocument } from '../../composables/usePdfDocument';
import { cn } from '../../lib/cn';
import { inDocumentOrder, updateSelection } from '../../lib/selection';
import type { PdfSource } from '../../lib/types';
import EmptyState from '../ui/EmptyState.vue';
import Skeleton from '../ui/Skeleton.vue';
import PdfThumbnail from './PdfThumbnail.vue';

interface Props {
  source: PdfSource | null | undefined;
  pageCount?: number;
  /** Optional subset/order of pages to display. Defaults to every page. */
  pages?: number[];
  selectionMode?: 'none' | 'single' | 'multiple';
  columns?: number | 'auto';
  thumbnailWidth?: number;
  rotation?: Record<number, number>;
  disabled?: boolean;
  showNumbers?: boolean;
  lazy?: boolean;
  password?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  selectionMode: 'multiple',
  columns: 'auto',
  thumbnailWidth: 150,
  disabled: false,
  showNumbers: true,
  lazy: true,
});

const emit = defineEmits<{
  'update:selected': [pages: number[]];
  pageClick: [page: number, event: MouseEvent];
  pageOpen: [page: number];
}>();

const selected = defineModel<number[]>('selected', { default: () => [] });
const anchor = ref<number | null>(null);

const { numPages, loading } = usePdfDocument(() => props.source, {
  password: () => props.password,
});

const resolvedPageCount = computed(() => props.pageCount ?? numPages.value ?? 0);
const pageList = computed(() => {
  if (props.pages?.length) return props.pages;
  return Array.from({ length: resolvedPageCount.value }, (_, index) => index + 1);
});

const gridStyle = computed(() => ({
  gridTemplateColumns:
    props.columns === 'auto'
      ? `repeat(auto-fill, minmax(${props.thumbnailWidth}px, 1fr))`
      : `repeat(${props.columns}, minmax(0, 1fr))`,
}));

watch(pageList, (pages) => {
  const allowed = new Set(pages);
  const next = selected.value.filter((page) => allowed.has(page));
  if (next.length !== selected.value.length) selected.value = next;
});

function onClick(page: number, event: MouseEvent) {
  emit('pageClick', page, event);

  if (props.selectionMode === 'none' || props.disabled) return;

  if (props.selectionMode === 'single') {
    selected.value = [page];
    return;
  }

  const all = pageList.value.map(String);
  const current = selected.value.map(String);
  const result = updateSelection(current, String(page), all, anchor.value === null ? null : String(anchor.value), {
    range: event.shiftKey,
    additive: event.metaKey || event.ctrlKey,
  });

  selected.value = inDocumentOrder(result.selection, all).map(Number);
  anchor.value = result.anchor === null ? null : Number(result.anchor);
}
</script>

<template>
  <div
    role="group"
    aria-label="PDF pages"
    :aria-busy="loading || undefined"
    :class="cn('spdf', props.class)"
  >
    <div v-if="!pageList.length && loading" class="grid gap-4" :style="gridStyle">
      <div v-for="index in 6" :key="index" class="grid gap-1.5">
        <Skeleton class="aspect-[0.707] w-full rounded-sm" />
        <Skeleton class="h-3 w-6" />
      </div>
    </div>

    <EmptyState
      v-else-if="!pageList.length"
      title="No pages to show"
      description="This document doesn’t contain any pages yet."
      :icon="FileText"
      compact
    />

    <div v-else class="grid gap-x-4 gap-y-5" :style="gridStyle">
      <PdfThumbnail
        v-for="page in pageList"
        :key="page"
        :source="props.source"
        :page="page"
        :width="props.thumbnailWidth"
        :rotation="props.rotation?.[page] ?? 0"
        :selected="selected.includes(page)"
        :selectable="props.selectionMode !== 'none'"
        :disabled="props.disabled"
        :show-number="props.showNumbers"
        :lazy="props.lazy"
        :password="props.password"
        fluid
        @select="onClick($event.page, $event.event)"
        @open="emit('pageOpen', page)"
      />
    </div>
  </div>
</template>
