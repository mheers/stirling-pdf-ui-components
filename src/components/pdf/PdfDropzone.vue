<script setup lang="ts">
import { computed, ref } from 'vue';
import { AlertCircle, CloudUpload, FileUp, Loader2, UploadCloud } from '@lucide/vue';
import { cn } from '../../lib/cn';
import { formatBytes } from '../../lib/format';
import type { PdfDropzoneReject } from '../../lib/types';

interface Props {
  /** MIME types or file extensions, e.g. `['application/pdf']`. */
  accept?: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  title?: string;
  description?: string;
  hint?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  accept: () => ['application/pdf'],
  multiple: true,
  maxFiles: 20,
  maxSize: 100 * 1024 * 1024,
  disabled: false,
  loading: false,
  compact: false,
});

const emit = defineEmits<{
  files: [files: File[]];
  reject: [rejects: PdfDropzoneReject[]];
  error: [message: string];
}>();

const input = ref<HTMLInputElement | null>(null);
const dragging = ref(false);
const rejects = ref<PdfDropzoneReject[]>([]);
let dragDepth = 0;

const acceptLabel = computed(() =>
  props.accept
    .map((value) => (value.startsWith('.') ? value.slice(1).toUpperCase() : value.replace('/*', '').split('/').pop()?.toUpperCase() ?? value))
    .filter((value, index, list) => list.indexOf(value) === index)
    .join(', '),
);

const wantsImages = computed(() =>
  props.accept.some((rule) => rule.toLowerCase().startsWith('image/')),
);

const resolvedTitle = computed(() => {
  if (props.title) return props.title;
  if (props.compact) return wantsImages.value ? 'Upload an image' : 'Upload a file';
  return props.multiple ? 'Drop your PDFs here' : 'Drop a PDF here';
});

const resolvedDescription = computed(() => {
  if (props.description) return props.description;
  return props.multiple ? 'or click to browse your files' : 'or click to choose a file';
});

const resolvedHint = computed(() => {
  if (props.hint) return props.hint;
  return [
    acceptLabel.value,
    props.maxFiles > 1 ? `up to ${props.maxFiles} files` : null,
    `max ${formatBytes(props.maxSize)}`,
  ]
    .filter(Boolean)
    .join(' · ');
});

function matchesAccept(file: File): boolean {
  if (!props.accept.length) return true;
  return props.accept.some((rule) => {
    const value = rule.trim().toLowerCase();
    if (!value) return true;
    if (value.startsWith('.')) return file.name.toLowerCase().endsWith(value);
    if (value.endsWith('/*')) return file.type.toLowerCase().startsWith(value.slice(0, -1));
    if (value === 'application/pdf' && file.name.toLowerCase().endsWith('.pdf')) return true;
    return file.type.toLowerCase() === value;
  });
}

function validate(fileList: File[]): { accepted: File[]; rejected: PdfDropzoneReject[] } {
  const accepted: File[] = [];
  const rejected: PdfDropzoneReject[] = [];

  for (const file of fileList) {
    if (!matchesAccept(file)) {
      rejected.push({
        file,
        reason: 'type',
        message: `${file.name} isn’t a supported file type.`,
      });
      continue;
    }
    if (file.size > props.maxSize) {
      rejected.push({
        file,
        reason: 'size',
        message: `${file.name} is larger than ${formatBytes(props.maxSize)}.`,
      });
      continue;
    }
    if (accepted.length >= props.maxFiles) {
      rejected.push({
        file,
        reason: 'count',
        message: `You can add up to ${props.maxFiles} files at once.`,
      });
      continue;
    }
    accepted.push(file);
  }

  if (!props.multiple && accepted.length > 1) {
    const extra = accepted.splice(1);
    for (const file of extra) {
      rejected.push({ file, reason: 'count', message: 'Only one file can be added here.' });
    }
  }

  return { accepted, rejected };
}

function process(files: FileList | File[] | null) {
  if (!files || props.disabled || props.loading) return;
  const list = Array.from(files);
  if (!list.length) return;

  const result = validate(list);
  rejects.value = result.rejected;

  if (result.rejected.length) {
    emit('reject', result.rejected);
    emit('error', result.rejected[0]?.message ?? 'Some files could not be added.');
  }
  if (result.accepted.length) {
    emit('files', result.accepted);
  }
}

function openPicker() {
  if (props.disabled || props.loading) return;
  input.value?.click();
}

function onChange(event: Event) {
  const target = event.target as HTMLInputElement;
  process(target.files);
  target.value = '';
}

function onDragEnter(event: DragEvent) {
  if (props.disabled || props.loading) return;
  event.preventDefault();
  dragDepth += 1;
  dragging.value = true;
}

function onDragLeave(event: DragEvent) {
  event.preventDefault();
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) dragging.value = false;
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  dragDepth = 0;
  dragging.value = false;
  process(event.dataTransfer?.files ?? null);
}

const rootClasses = computed(() =>
  cn(
    'spdf group relative flex w-full cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed border-border bg-card text-center transition-[border-color,background-color,transform,box-shadow] duration-200',
    'hover:border-primary/40 hover:bg-primary/[0.025]',
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none',
    props.compact ? 'gap-3 rounded-lg px-3.5 py-3 text-left' : 'flex-col gap-3 rounded-2xl px-6 py-10',
    dragging.value ? 'border-primary bg-primary/5 shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_10%,transparent)]' : '',
    props.disabled || props.loading ? 'pointer-events-none opacity-60' : '',
    props.class,
  ),
);
</script>

<template>
  <div>
    <input
      ref="input"
      type="file"
      class="sr-only"
      :accept="props.accept.join(',')"
      :multiple="props.multiple"
      :disabled="props.disabled || props.loading"
      tabindex="-1"
      aria-hidden="true"
      @change="onChange"
    />

    <div
      role="button"
      :tabindex="props.disabled || props.loading ? -1 : 0"
      :aria-disabled="props.disabled || props.loading"
      :aria-label="`${resolvedTitle}. ${resolvedDescription}. ${resolvedHint}`"
      :class="rootClasses"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragenter="onDragEnter"
      @dragover.prevent
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <div
        :class="
          cn(
            'relative flex shrink-0 items-center justify-center rounded-xl transition-transform duration-200',
            props.compact ? 'size-9' : 'size-14',
            dragging ? 'scale-110 bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
          )
        "
      >
        <slot name="icon">
          <Loader2 v-if="props.loading" :class="props.compact ? 'size-4' : 'size-6'" class="animate-spin" aria-hidden="true" />
          <CloudUpload v-else-if="dragging" :class="props.compact ? 'size-5' : 'size-7'" aria-hidden="true" />
          <UploadCloud v-else :class="props.compact ? 'size-5' : 'size-7'" aria-hidden="true" />
        </slot>
      </div>

      <div :class="props.compact ? 'min-w-0 flex-1' : 'grid gap-1'">
        <slot name="title">
          <p :class="cn('font-semibold text-foreground', props.compact ? 'text-sm' : 'text-base')">
            {{ dragging ? 'Release to add your files' : resolvedTitle }}
          </p>
        </slot>
        <slot name="description">
          <p :class="cn('text-muted-foreground', props.compact ? 'text-xs' : 'text-sm')">
            {{ resolvedDescription }}
          </p>
        </slot>
        <p v-if="!props.compact && resolvedHint" class="mt-1 text-[11px] font-medium text-muted-foreground/80">
          {{ resolvedHint }}
        </p>
      </div>

      <slot name="footer">
        <div
          v-if="props.compact"
          class="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary"
        >
          <FileUp class="size-4" aria-hidden="true" />
        </div>
        <span
          v-else
          class="mt-1 inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground shadow-xs transition-colors group-hover:border-primary/30 group-hover:text-primary"
        >
          <FileUp class="size-3.5" aria-hidden="true" />
          Browse files
        </span>
      </slot>
    </div>

    <div v-if="rejects.length" class="mt-2 space-y-1" role="alert">
      <p
        v-for="reject in rejects.slice(0, 3)"
        :key="`${reject.file.name}-${reject.reason}`"
        class="flex items-start gap-1.5 text-xs text-destructive"
      >
        <AlertCircle class="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {{ reject.message }}
      </p>
      <p v-if="rejects.length > 3" class="text-xs text-muted-foreground">+ {{ rejects.length - 3 }} more files were skipped.</p>
    </div>
  </div>
</template>
