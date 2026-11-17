<script setup lang="ts">
import { computed, useId } from 'vue';
import { AlertCircle, Hash } from 'lucide-vue-next';
import { cn } from '../../lib/cn';
import {
  formatPageRange,
  pageRangePresets,
  pageSelectionSummary,
  parsePageRange,
  type PageRangeParseResult,
  type PageRangePreset,
} from '../../lib/page-range';
import Badge from '../ui/Badge.vue';
import Input from '../ui/Input.vue';

interface Props {
  pageCount?: number;
  showPresets?: boolean;
  showPreview?: boolean;
  showPageStrip?: boolean;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showPresets: true,
  showPreview: true,
  showPageStrip: true,
  label: 'Pages',
  placeholder: 'e.g. 1-3, 5, 8-10',
});

const emit = defineEmits<{
  change: [result: PageRangeParseResult];
  pages: [pages: number[]];
}>();

const value = defineModel<string>({ default: '' });
const autoId = useId();
const inputId = computed(() => props.id ?? `spdf-page-range-${autoId}`);
const errorId = computed(() => `${inputId.value}-error`);
const summaryId = computed(() => `${inputId.value}-summary`);

const parsed = computed(() => parsePageRange(value.value, props.pageCount));
const showError = computed(() => !parsed.value.isEmpty && parsed.value.errors.length > 0);
const presets = computed(() => pageRangePresets(props.pageCount));
const stripPages = computed(() => {
  if (!props.showPageStrip || !props.pageCount || props.pageCount > 96) return 0;
  return props.pageCount;
});
const selectedSet = computed(() => new Set(parsed.value.pages));

function update(next: string) {
  value.value = next;
  const result = parsePageRange(next, props.pageCount);
  emit('change', result);
  emit('pages', result.pages);
}

function applyPreset(preset: PageRangePreset) {
  update(value.value === preset.value ? '' : preset.value);
}

function togglePage(page: number) {
  const next = new Set(parsed.value.pages);
  if (next.has(page)) next.delete(page);
  else next.add(page);
  update(formatPageRange([...next]));
}

const activeClass = 'border-primary/40 bg-primary/10 text-primary';
</script>

<template>
  <div :class="cn('spdf grid gap-2.5', props.class)">
    <div class="flex items-baseline justify-between gap-3">
      <label v-if="props.label" :for="inputId" class="text-sm font-medium text-foreground">{{ props.label }}</label>
      <span v-if="props.showPreview && !parsed.isEmpty" class="spdf-tabular text-xs text-muted-foreground">
        {{ pageSelectionSummary(parsed.count, props.pageCount) }} selected
      </span>
    </div>

    <div class="relative">
      <Hash class="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground/70" aria-hidden="true" />
      <Input
        :id="inputId"
        :model-value="value"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :aria-invalid="showError || undefined"
        :aria-describedby="showError ? errorId : summaryId"
        autocomplete="off"
        spellcheck="false"
        class="spdf-tabular pl-9"
        @update:model-value="update(String($event))"
      />
    </div>

    <div v-if="props.showPresets" class="flex flex-wrap gap-1.5">
      <button
        v-for="preset in presets"
        :key="preset.id"
        type="button"
        :disabled="props.disabled"
        :class="
          cn(
            'inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
            value === preset.value
              ? activeClass
              : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground',          )
        "
        @click="applyPreset(preset)"
      >
        {{ preset.label }}
      </button>
      <button
        v-if="value"
        type="button"
        :disabled="props.disabled"
        class="inline-flex h-6 items-center rounded-full px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
        @click="update('')"
      >
        Clear
      </button>
    </div>

    <div v-if="props.showPreview && !parsed.isEmpty" class="flex flex-wrap items-center gap-1.5">
      <Badge v-for="range in parsed.ranges.slice(0, 10)" :key="`${range.start}-${range.end}`" variant="secondary" class="spdf-tabular">
        {{ range.start === range.end ? range.start : `${range.start}–${range.end}` }}
      </Badge>
      <Badge v-if="parsed.ranges.length > 10" variant="outline">+{{ parsed.ranges.length - 10 }}</Badge>
      <span v-if="parsed.ranges.length === 0" class="text-xs text-muted-foreground">No pages selected</span>
    </div>

    <div v-if="stripPages" class="grid gap-1" :style="{ gridTemplateColumns: `repeat(auto-fill, minmax(22px, 1fr))` }">
      <button
        v-for="page in stripPages"
        :key="page"
        type="button"
        :disabled="props.disabled"
        :aria-label="`Toggle page ${page}`"
        :aria-pressed="selectedSet.has(page)"
        :class="
          cn(
            'spdf-tabular grid h-6 place-items-center rounded border text-[10px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
            selectedSet.has(page)
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
          )
        "
        @click="togglePage(page)"
      >
        {{ page }}
      </button>
    </div>

    <p v-if="showError" :id="errorId" class="flex items-start gap-1.5 text-xs text-destructive" role="alert">
      <AlertCircle class="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      {{ parsed.errors[0] }}
    </p>
    <p v-else-if="parsed.count === 0" :id="summaryId" class="text-[11px] text-muted-foreground/80">
      Use ranges like <span class="font-medium">1-3, 5, 8-10</span> or presets above.
    </p>
    <p v-else-if="!props.showPreview" :id="summaryId" class="text-[11px] text-muted-foreground/80">
      {{ pageSelectionSummary(parsed.count, props.pageCount) }} selected.
    </p>
    <p v-if="props.description" class="text-xs leading-relaxed text-muted-foreground">{{ props.description }}</p>
  </div>
</template>
