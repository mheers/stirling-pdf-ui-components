<script setup lang="ts">
import { computed } from 'vue';
import { Check, Download, Eye, FileText, Files, RotateCcw } from '@lucide/vue';
import { cn } from '../../lib/cn';
import { formatBytes, formatDuration, savedPercent, truncateMiddle } from '../../lib/format';
import type { PdfResult } from '../../lib/types';
import Badge from '../ui/Badge.vue';
import Button from '../ui/Button.vue';

interface Props {
  results: PdfResult[];
  originalSize?: number;
  elapsedMs?: number;
  title?: string;
  description?: string;
  showReset?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showReset: true,
});

const emit = defineEmits<{
  download: [result: PdfResult];
  preview: [result: PdfResult];
  reset: [];
}>();

const totalSize = computed(() => props.results.reduce((sum, result) => sum + (result.size ?? 0), 0));
const saved = computed(() => savedPercent(props.originalSize ?? null, totalSize.value));

const resolvedTitle = computed(() => {
  if (props.title) return props.title;
  return props.results.length > 1 ? `${props.results.length} files are ready` : 'Your PDF is ready';
});

const resolvedDescription = computed(() => {
  if (props.description) return props.description;
  return props.results.length > 1
    ? 'Download the files below or start another task.'
    : 'Download the result or start another task.';
});

function urlFor(result: PdfResult): string {
  if (result.url) return result.url;
  if (result.blob) return URL.createObjectURL(result.blob);
  return '';
}

function download(result: PdfResult) {
  const url = urlFor(result);
  if (!url) {
    emit('download', result);
    return;
  }

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = result.name;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  emit('download', result);
  if (result.blob && !result.url) window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function downloadAll() {
  props.results.forEach((result, index) => {
    window.setTimeout(() => download(result), index * 180);
  });
}
</script>

<template>
  <div :class="cn('spdf rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm', props.class)" role="status">
    <div class="flex flex-col items-center text-center">
      <div class="grid size-14 place-items-center rounded-full bg-success/12 text-success">
        <svg viewBox="0 0 24 24" class="size-7" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path class="spdf-check-path" d="M5 12.5l4.5 4.5L19 7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h2 class="mt-4 text-lg font-semibold tracking-tight text-foreground">{{ resolvedTitle }}</h2>
      <p class="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">{{ resolvedDescription }}</p>

      <div class="mt-3 flex flex-wrap items-center justify-center gap-2">
        <Badge variant="secondary">
          <Files class="size-3" aria-hidden="true" />
          {{ props.results.length }} {{ props.results.length === 1 ? 'file' : 'files' }}
        </Badge>
        <Badge v-if="totalSize" variant="muted">{{ formatBytes(totalSize) }}</Badge>
        <Badge v-if="saved !== null && saved > 0" variant="success">−{{ saved }}%</Badge>
        <Badge v-if="props.elapsedMs" variant="muted">{{ formatDuration(props.elapsedMs) }}</Badge>
      </div>
    </div>

    <div class="mt-5 grid gap-2">
      <div
        v-for="result in props.results"
        :key="result.id"
        class="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
      >
        <div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FileText class="size-4" aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-foreground" :title="result.name">{{ truncateMiddle(result.name, 44) }}</p>
          <p class="mt-0.5 text-[11px] text-muted-foreground">
            <span v-if="result.pageCount">{{ result.pageCount }} {{ result.pageCount === 1 ? 'page' : 'pages' }}</span>
            <span v-if="result.pageCount && result.size"> · </span>
            <span v-if="result.size">{{ formatBytes(result.size) }}</span>
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <Button
            v-if="result.url || result.preview"
            variant="ghost"
            size="icon-sm"
            :aria-label="`Preview ${result.name}`"
            @click="emit('preview', result)"
          >
            <Eye />
          </Button>
          <Button
            :variant="props.results.length === 1 ? 'default' : 'outline'"
            size="sm"
            :aria-label="`Download ${result.name}`"
            @click="download(result)"
          >
            <Download class="size-3.5" />
            Download
          </Button>
        </div>
      </div>
    </div>

    <div class="mt-5 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-center">
      <Button
        v-if="props.results.length > 1"
        :disabled="!props.results.length"
        @click="downloadAll"
      >
        <Download class="size-4" />
        Download all
      </Button>
      <Button v-if="props.showReset" variant="outline" @click="emit('reset')">
        <RotateCcw class="size-4" />
        Start over
      </Button>
    </div>
  </div>
</template>
