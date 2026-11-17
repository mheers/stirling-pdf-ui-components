<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { FileText, ShieldCheck } from 'lucide-vue-next';
import { usePdfDocument } from '../../composables/usePdfDocument';
import { getPdfDocumentStats } from '../../lib/pdf';
import { cn } from '../../lib/cn';
import { formatBytes, pageCountLabel } from '../../lib/format';
import type { PdfDocumentStats, PdfSource } from '../../lib/types';
import Alert from '../ui/Alert.vue';
import Badge from '../ui/Badge.vue';
import Skeleton from '../ui/Skeleton.vue';

interface Props {
  source: PdfSource | null | undefined;
  showMetadata?: boolean;
  password?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), { showMetadata: true });

const emit = defineEmits<{ loaded: [stats: PdfDocumentStats] }>();

const stats = shallowRef<PdfDocumentStats | null>(null);
const statsLoading = shallowRef(false);
const { doc, loading, error, numPages } = usePdfDocument(() => props.source, {
  password: () => props.password,
});

const filename = computed(() => {
  if (typeof File !== 'undefined' && props.source instanceof File) return props.source.name;
  if (typeof props.source === 'string') return props.source.split('/').pop()?.split('?')[0] || props.source;
  if (props.source instanceof URL) return props.source.pathname.split('/').pop() || props.source.href;
  return 'Document';
});

const metadataRows = computed(() => {
  const value = stats.value;
  if (!value) return [];
  return [
    { label: 'Title', value: value.title },
    { label: 'Author', value: value.author },
    { label: 'Subject', value: value.subject },
    { label: 'Keywords', value: value.keywords?.join(', ') },
    { label: 'Creator', value: value.creator },
    { label: 'Producer', value: value.producer },
  ].filter((row) => !!row.value);
});

const infoRows = computed(() => {
  const value = stats.value;
  if (!value) return [];
  return [
    { label: 'Page count', value: pageCountLabel(value.pageCount) },
    { label: 'File size', value: value.fileSize ? formatBytes(value.fileSize) : undefined },
    { label: 'PDF version', value: value.pdfVersion },
    { label: 'Linearized', value: value.linearized ? 'Yes' : undefined },
  ].filter((row) => !!row.value);
});

watch(
  doc,
  async (document) => {
    if (!document) {
      stats.value = null;
      return;
    }
    statsLoading.value = true;
    try {
      const value = await getPdfDocumentStats(document, props.source ?? undefined);
      stats.value = value;
      emit('loaded', value);
    } finally {
      statsLoading.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div :class="cn('spdf rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xs', props.class)">
    <div class="flex items-start gap-3">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <FileText class="size-5" aria-hidden="true" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-foreground" :title="filename">{{ filename }}</p>
        <div class="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{{ pageCountLabel(stats?.pageCount ?? numPages) }}</Badge>
          <Badge v-if="stats?.fileSize" variant="muted">{{ formatBytes(stats.fileSize) }}</Badge>
          <Badge v-if="stats?.encrypted" variant="warning">
            <ShieldCheck class="size-3" aria-hidden="true" />
            Protected
          </Badge>
        </div>
      </div>
    </div>

    <div v-if="loading || statsLoading" class="mt-5 grid gap-2">
      <Skeleton v-for="index in 4" :key="index" class="h-4 w-full" />
    </div>

    <Alert v-else-if="error" variant="destructive" title="Could not read document information" class="mt-5">
      {{ error instanceof Error ? error.message : 'The file could not be opened.' }}
    </Alert>

    <template v-else>
      <dl v-if="infoRows.length" class="mt-5 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div v-for="row in infoRows" :key="row.label" class="flex items-baseline justify-between gap-3 border-b border-border/60 pb-1.5">
          <dt class="text-xs text-muted-foreground">{{ row.label }}</dt>
          <dd class="spdf-tabular text-right text-xs font-medium text-foreground">{{ row.value }}</dd>
        </div>
      </dl>

      <template v-if="props.showMetadata">
        <div class="mt-5 flex items-center gap-2">
          <h3 class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Metadata</h3>
          <span class="h-px flex-1 bg-border" />
        </div>
        <dl v-if="metadataRows.length" class="mt-2 grid gap-2">
          <div v-for="row in metadataRows" :key="row.label" class="grid grid-cols-[7rem_1fr] gap-3 text-xs">
            <dt class="text-muted-foreground">{{ row.label }}</dt>
            <dd class="line-clamp-2 break-words text-foreground" :title="row.value">{{ row.value }}</dd>
          </div>
        </dl>
        <p v-else class="mt-2 text-xs text-muted-foreground">This document has no descriptive metadata.</p>
      </template>
    </template>
  </div>
</template>
