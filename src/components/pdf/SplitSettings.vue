<script setup lang="ts">
import { computed } from 'vue';
import { Files, FileText, Scissors } from '@lucide/vue';
import { cn } from '../../lib/cn';
import { parsePageRange } from '../../lib/page-range';
import type { SplitMode, SplitOptions } from '../../lib/types';
import Alert from '../ui/Alert.vue';
import Badge from '../ui/Badge.vue';
import Field from '../ui/Field.vue';
import Input from '../ui/Input.vue';
import SegmentedControl from '../ui/SegmentedControl.vue';
import PageRangeInput from './PageRangeInput.vue';

interface Props {
  modelValue: SplitOptions;
  pageCount?: number;
  filename?: string;
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  pageCount: 10,
  filename: 'document.pdf',
});

const emit = defineEmits<{
  'update:modelValue': [options: SplitOptions];
  change: [options: SplitOptions];
}>();

const options = computed(() => props.modelValue);
const totalPages = computed(() => Math.max(1, props.pageCount || 1));

const modeItems = [
  { value: 'every', label: 'Every N pages', icon: Files },
  { value: 'ranges', label: 'Custom ranges', icon: Scissors },
  { value: 'each', label: 'Every page', icon: FileText },
];

const everyPresets = [1, 2, 5, 10];

const rangeResult = computed(() => parsePageRange(options.value.ranges, totalPages.value));

const outputs = computed<{ label: string; pages: string; name: string }[]>(() => {
  const base = props.filename.replace(/\.pdf$/i, '') || 'document';
  const result: { label: string; pages: string; name: string }[] = [];

  if (options.value.mode === 'each') {
    for (let page = 1; page <= totalPages.value; page += 1) {
      result.push({ label: `Page ${page}`, pages: String(page), name: `${base}_page-${page}.pdf` });
    }
    return result;
  }

  if (options.value.mode === 'ranges') {
    if (!rangeResult.value.valid || rangeResult.value.isEmpty) return [];
    for (const range of rangeResult.value.ranges) {
      const label = range.start === range.end ? `Page ${range.start}` : `${range.start}–${range.end}`;
      const rangeName = range.start === range.end ? String(range.start) : `${range.start}-${range.end}`;
      result.push({
        label,
        pages: String(range.end - range.start + 1),
        name: `${base}_${rangeName}.pdf`,
      });
    }
    return result;
  }

  const size = Math.max(1, Math.floor(options.value.everyN || 1));
  for (let start = 1; start <= totalPages.value; start += size) {
    const end = Math.min(totalPages.value, start + size - 1);
    const label = start === end ? `Page ${start}` : `${start}–${end}`;
    const rangeName = start === end ? String(start) : `${start}-${end}`;
    result.push({
      label,
      pages: String(end - start + 1),
      name: `${base}_${rangeName}.pdf`,
    });
  }
  return result;
});

const visibleOutputs = computed(() => outputs.value.slice(0, 8));
const hiddenOutputs = computed(() => Math.max(0, outputs.value.length - visibleOutputs.value.length));
const fileCount = computed(() => outputs.value.length);

function update(next: SplitOptions) {
  emit('update:modelValue', next);
  emit('change', next);
}

function patch<K extends keyof SplitOptions>(key: K, value: SplitOptions[K]) {
  update({ ...options.value, [key]: value });
}
</script>

<template>
  <div :class="cn('spdf grid gap-5', props.class)">
    <SegmentedControl
      :model-value="options.mode"
      :items="modeItems"
      full-width
      aria-label="Split mode"
      :disabled="props.disabled"
      @update:model-value="patch('mode', $event as SplitMode)"
    />

    <div v-if="options.mode === 'every'" class="grid gap-4">
      <Field
        v-slot="{ id, describedBy }"
        label="Pages per file"
        description="The last file keeps the remaining pages."
      >
        <div class="flex flex-wrap items-center gap-2">
          <Input
            :id="id"
            :aria-describedby="describedBy"
            :model-value="options.everyN"
            type="number"
            min="1"
            :max="totalPages"
            class="spdf-tabular w-24"
            :disabled="props.disabled"
            @update:model-value="patch('everyN', Math.max(1, Number($event) || 1))"
          />
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="preset in everyPresets"
              :key="preset"
              type="button"
              :disabled="props.disabled || preset > totalPages"
              :aria-pressed="options.everyN === preset"
              :class="
                cn(
                  'h-6 rounded-full border px-2 text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:opacity-40',
                  options.everyN === preset
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground',
                )
              "
              @click="patch('everyN', preset)"
            >
              {{ preset }}
            </button>
          </div>
        </div>
      </Field>
    </div>

    <PageRangeInput
      v-else-if="options.mode === 'ranges'"
      :model-value="options.ranges"
      :page-count="totalPages"
      label="Split ranges"
      :show-presets="false"
      :show-page-strip="false"
      :disabled="props.disabled"
      @update:model-value="patch('ranges', $event)"
    />

    <Alert v-else variant="info" title="One PDF per page">
      A {{ totalPages }}-page document becomes {{ totalPages }} separate PDF files. This is useful for forms, tickets, or scanned batches.
    </Alert>

    <div class="overflow-hidden rounded-xl border border-border">
      <div class="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-3.5 py-2.5">
        <div>
          <p class="text-sm font-medium text-foreground">Output</p>
          <p class="text-[11px] text-muted-foreground">Every range becomes a separate PDF.</p>
        </div>
        <Badge :variant="fileCount ? 'default' : 'muted'">{{ fileCount }} {{ fileCount === 1 ? 'file' : 'files' }}</Badge>
      </div>

      <div v-if="!fileCount" class="grid place-items-center gap-1 px-4 py-8 text-center">
        <Files class="size-5 text-muted-foreground/60" aria-hidden="true" />
        <p class="text-xs font-medium text-foreground">No output yet</p>
        <p class="text-[11px] text-muted-foreground">
          {{ options.mode === 'ranges' ? 'Enter at least one valid page range.' : 'Choose a split mode above.' }}
        </p>
      </div>

      <div v-else class="grid divide-y divide-border">
        <div v-for="output in visibleOutputs" :key="output.name" class="flex items-center gap-3 px-3.5 py-2">
          <div class="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary">
            <FileText class="size-3.5" aria-hidden="true" />
          </div>
          <span class="min-w-0 flex-1 truncate text-xs font-medium text-foreground">{{ output.name }}</span>
          <span class="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {{ output.pages }} {{ output.pages === '1' ? 'page' : 'pages' }}
          </span>
        </div>
        <div v-if="hiddenOutputs" class="px-3.5 py-2 text-[11px] text-muted-foreground">
          + {{ hiddenOutputs }} more {{ hiddenOutputs === 1 ? 'file' : 'files' }}
        </div>
      </div>
    </div>

    <p class="text-[11px] text-muted-foreground">
      The split is applied by your PDF backend. Use these options as the request payload.
    </p>
  </div>
</template>
