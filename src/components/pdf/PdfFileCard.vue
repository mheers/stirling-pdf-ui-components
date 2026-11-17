<script setup lang="ts">
import { computed } from 'vue';
import { AlertCircle, CheckCircle2, FileText, Loader2, RotateCcw, X } from '@lucide/vue';
import { cn } from '../../lib/cn';
import { formatBytes, pageCountLabel, truncateMiddle } from '../../lib/format';
import type { PdfFileDescriptor } from '../../lib/types';
import Badge from '../ui/Badge.vue';
import Checkbox from '../ui/Checkbox.vue';
import Progress from '../ui/Progress.vue';
import Tooltip from '../ui/Tooltip.vue';

interface Props {
  file: PdfFileDescriptor;
  selected?: boolean;
  selectable?: boolean;
  removable?: boolean;
  disabled?: boolean;
  dense?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  selectable: false,
  removable: true,
  disabled: false,
  dense: false,
});

const emit = defineEmits<{
  remove: [file: PdfFileDescriptor];
  open: [file: PdfFileDescriptor];
  retry: [file: PdfFileDescriptor];
  select: [file: PdfFileDescriptor, event: MouseEvent | undefined, source: 'checkbox' | 'row'];
}>();

const status = computed(() => props.file.status ?? 'ready');
const busy = computed(() => status.value === 'uploading' || status.value === 'processing');
const statusLabel = computed(() => {
  switch (status.value) {
    case 'uploading':
      return 'Uploading';
    case 'processing':
      return 'Processing';
    case 'done':
      return 'Done';
    case 'error':
      return 'Failed';
    case 'queued':
      return 'Queued';
    default:
      return 'Ready';
  }
});
const statusVariant = computed(() => {
  switch (status.value) {
    case 'done':
      return 'success';
    case 'error':
      return 'destructive';
    case 'processing':
    case 'uploading':
      return 'info';
    default:
      return 'muted';
  }
});
const meta = computed(() =>
  [props.file.pageCount ? pageCountLabel(props.file.pageCount) : null, props.file.size ? formatBytes(props.file.size) : null, props.file.meta]
    .filter(Boolean)
    .join(' · '),
);

const progress = computed(() => props.file.progress);
</script>

<template>
  <article
    :class="
      cn(
        'spdf group relative flex items-center gap-3 rounded-xl border bg-card text-card-foreground shadow-xs transition-[border-color,background-color,box-shadow] duration-150',
        props.dense ? 'p-2.5' : 'p-3',
        props.selected ? 'border-primary/60 bg-primary/[0.035] ring-1 ring-primary/15' : 'border-border hover:border-border/80',
        status === 'error' ? 'border-destructive/40 bg-destructive/[0.025]' : '',
        props.disabled ? 'opacity-60' : '',
        props.class,
      )
    "
  >
    <span
      v-if="props.selectable"
      class="shrink-0"
      @click.stop="emit('select', props.file, $event as MouseEvent, 'checkbox')"
    >
      <Checkbox
        :model-value="props.selected"
        :disabled="props.disabled"
        :aria-label="`Select ${props.file.name}`"
      />
    </span>

    <div
      :class="
        cn(
          'relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted',
          props.dense ? 'h-10 w-8' : 'h-12 w-9',
        )
      "
    >
      <img
        v-if="props.file.thumbnailUrl"
        :src="props.file.thumbnailUrl"
        :alt="`Thumbnail of ${props.file.name}`"
        class="size-full object-cover"
        loading="lazy"
      />
      <FileText v-else :class="props.dense ? 'size-4' : 'size-5'" class="text-muted-foreground/80" aria-hidden="true" />
      <span
        v-if="status === 'done'"
        class="absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-full bg-card"
      >
        <CheckCircle2 class="size-3 text-success" aria-hidden="true" />
      </span>
      <span
        v-else-if="status === 'error'"
        class="absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-full bg-card"
      >
        <AlertCircle class="size-3 text-destructive" aria-hidden="true" />
      </span>
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="min-w-0 truncate text-left text-sm font-medium text-foreground hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          :title="props.file.name"
          :disabled="props.disabled"
          @click="emit('open', props.file)"
        >
          {{ truncateMiddle(props.file.name, 44) }}
        </button>
        <Badge v-if="status !== 'ready'" :variant="statusVariant" class="shrink-0">
          <Loader2 v-if="busy" class="animate-spin" aria-hidden="true" />
          {{ statusLabel }}
        </Badge>
      </div>

      <p class="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
        <span v-if="meta">{{ meta }}</span>
        <span v-else class="text-muted-foreground/70">PDF document</span>
      </p>

      <Progress
        v-if="busy"
        :value="progress ?? 0"
        :indeterminate="progress === undefined"
        class="mt-2 h-1.5"
        :label="`${statusLabel} ${props.file.name}`"
      />
      <p v-if="status === 'error' && props.file.error" class="mt-1 line-clamp-2 text-xs text-destructive">
        {{ props.file.error }}
      </p>
    </div>

    <div class="flex shrink-0 items-center gap-1">
      <slot name="actions" :file="props.file" />
      <button
        v-if="status === 'error'"
        type="button"
        :disabled="props.disabled"
        class="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
        :aria-label="`Retry ${props.file.name}`"
        @click="emit('retry', props.file)"
      >
        <RotateCcw class="size-3.5" aria-hidden="true" />
      </button>
      <Tooltip v-if="props.removable" content="Remove file">
        <button
          type="button"
          :disabled="props.disabled"
          class="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          :aria-label="`Remove ${props.file.name}`"
          @click="emit('remove', props.file)"
        >
          <X class="size-4" aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  </article>
</template>
