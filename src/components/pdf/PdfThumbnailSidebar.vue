<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { X } from '@lucide/vue';
import { cn } from '../../lib/cn';
import type { PdfSource } from '../../lib/types';
import Button from '../ui/Button.vue';
import PdfThumbnail from './PdfThumbnail.vue';
import Skeleton from '../ui/Skeleton.vue';
import Tooltip from '../ui/Tooltip.vue';

interface Props {
  source: PdfSource | null | undefined;
  pageCount: number;
  currentPage: number;
  title?: string;
  password?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), { title: 'Pages' });

const emit = defineEmits<{
  select: [page: number];
  close: [];
}>();

const elements = new Map<number, HTMLElement>();
const scrollContainer = ref<HTMLElement | null>(null);

function setElement(page: number, element: unknown) {
  if (element instanceof HTMLElement) {
    elements.set(page, element);
    if (page === props.currentPage) scrollToCurrent();
  } else {
    elements.delete(page);
  }
}

function scrollToCurrent() {
  void nextTick(() => {
    const element = elements.get(props.currentPage);
    const container = scrollContainer.value;
    if (!element || !container) return;

    const top = element.offsetTop;
    const visibleTop = container.scrollTop;
    const visibleBottom = visibleTop + container.clientHeight;
    if (top < visibleTop || top + element.offsetHeight > visibleBottom) {
      const reduceMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      container.scrollTo({
        top: Math.max(0, top - 12),
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    }
  });
}

watch(() => props.currentPage, scrollToCurrent);
onMounted(scrollToCurrent);
</script>

<template>
  <aside :class="cn('spdf flex h-full w-52 shrink-0 flex-col border-r border-border bg-background', props.class)" aria-label="Page thumbnails">
    <div class="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-foreground">{{ props.title }}</span>
        <span class="spdf-tabular rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">{{ props.pageCount }}</span>
      </div>
      <Tooltip content="Hide thumbnails">
        <Button variant="ghost" size="icon-sm" aria-label="Hide thumbnails" @click="emit('close')">
          <X />
        </Button>
      </Tooltip>
    </div>

    <div ref="scrollContainer" class="spdf-scroll relative min-h-0 flex-1 overflow-y-auto p-3">
      <div v-if="!props.pageCount" class="grid gap-4">
        <Skeleton v-for="index in 4" :key="index" class="aspect-[0.707] w-full rounded-sm" />
      </div>
      <div v-else class="grid gap-4">
        <div
          v-for="page in props.pageCount"
          :key="page"
          :ref="(element) => setElement(page, element)"
          style="content-visibility: auto; contain-intrinsic-size: 190px"
        >
          <PdfThumbnail
            :source="props.source"
            :page="page"
            :width="190"
            :selected="page === props.currentPage"
            :password="props.password"
            fluid
            @select="emit('select', $event.page)"
            @open="emit('select', page)"
          />
        </div>
      </div>
    </div>

    <div v-if="$slots.footer" class="shrink-0 border-t border-border p-3">
      <slot name="footer" />
    </div>
  </aside>
</template>
