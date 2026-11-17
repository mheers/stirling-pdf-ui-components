<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../lib/cn';
import type { PageNumberOptions } from '../../lib/types';
import Field from '../ui/Field.vue';
import Input from '../ui/Input.vue';
import Slider from '../ui/Slider.vue';
import Switch from '../ui/Switch.vue';
import PageRangeInput from './PageRangeInput.vue';
import PdfPositionPicker from './PdfPositionPicker.vue';

interface Props {
  modelValue: PageNumberOptions;
  pageCount?: number;
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), { pageCount: 10 });

const emit = defineEmits<{
  'update:modelValue': [options: PageNumberOptions];
  change: [options: PageNumberOptions];
}>();

const options = computed(() => props.modelValue);
const total = computed(() => props.pageCount || 10);

const formatPresets = [
  { label: '1', value: '{page}' },
  { label: 'Page 1', value: 'Page {page}' },
  { label: '1 / 10', value: '{page} / {total}' },
  { label: 'Page 1 of 10', value: 'Page {page} of {total}' },
  { label: '- 1 -', value: '- {page} -' },
];

const previewText = computed(() => {
  // The preview shows page 3. Skipping the cover moves it one step closer to
  // the first printed number.
  const page = options.value.startNumber + (options.value.skipFirst ? 1 : 2);
  return options.value.format
    .replace(/\{page\}/g, String(page))
    .replace(/\{total\}/g, String(total.value));
});

const alignment = computed(() => {
  const [vertical, horizontal] = options.value.position.split('-');
  return {
    alignItems: vertical === 'top' ? 'flex-start' : vertical === 'bottom' ? 'flex-end' : 'center',
    justifyContent: horizontal === 'left' ? 'flex-start' : horizontal === 'right' ? 'flex-end' : 'center',
  };
});

const previewFontSize = computed(() => Math.max(5, Math.round(options.value.fontSize * 0.62)));
const previewPadding = computed(() => Math.max(4, Math.round(options.value.margin / 4)));

function update(next: PageNumberOptions) {
  emit('update:modelValue', next);
  emit('change', next);
}

function patch<K extends keyof PageNumberOptions>(key: K, value: PageNumberOptions[K]) {
  update({ ...options.value, [key]: value });
}
</script>

<template>
  <div :class="cn('spdf grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]', props.class)">
    <div class="grid gap-5">
      <Field
        v-slot="{ id, describedBy }"
        label="Format"
        description="Use {page} for the page number and {total} for the page count."
      >
        <Input
          :id="id"
          :model-value="options.format"
          :aria-describedby="describedBy"
          :disabled="props.disabled"
          placeholder="{page} of {total}"
          class="spdf-tabular"
          @update:model-value="patch('format', String($event))"
        />
        <div class="mt-2 flex flex-wrap gap-1.5">
          <button
            v-for="preset in formatPresets"
            :key="preset.value"
            type="button"
            :disabled="props.disabled"
            :aria-pressed="options.format === preset.value"
            :class="
              cn(
                'inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:opacity-50',
                options.format === preset.value
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground',
              )
            "
            @click="patch('format', preset.value)"
          >
            {{ preset.label }}
          </button>
        </div>
      </Field>

      <div class="grid gap-2">
        <span class="text-sm font-medium text-foreground">Position</span>
        <PdfPositionPicker
          :model-value="options.position"
          :disabled="props.disabled"
          @update:model-value="patch('position', $event)"
        />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <Slider
          :model-value="options.fontSize"
          :min="6"
          :max="24"
          label="Font size"
          show-value
          suffix=" pt"
          :disabled="props.disabled"
          @update:model-value="patch('fontSize', $event)"
        />
        <Slider
          :model-value="options.margin"
          :min="8"
          :max="72"
          :step="2"
          label="Margin"
          show-value
          suffix=" pt"
          :disabled="props.disabled"
          @update:model-value="patch('margin', $event)"
        />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <Field v-slot="{ id }" label="Start numbering at">
          <Input
            :id="id"
            :model-value="options.startNumber"
            type="number"
            min="1"
            :disabled="props.disabled"
            class="spdf-tabular"
            @update:model-value="patch('startNumber', Math.max(1, Number($event) || 1))"
          />
        </Field>
        <div class="flex items-end justify-between gap-3 rounded-lg border border-border p-3">
          <div>
            <p class="text-sm font-medium text-foreground">Skip first page</p>
            <p class="text-[11px] text-muted-foreground">Common for cover pages.</p>
          </div>
          <Switch
            :model-value="options.skipFirst"
            :disabled="props.disabled"
            aria-label="Skip first page"
            @update:model-value="patch('skipFirst', $event)"
          />
        </div>
      </div>

      <PageRangeInput
        :model-value="options.pageRange"
        :page-count="props.pageCount"
        label="Pages to number"
        :show-presets="false"
        :show-page-strip="false"
        :disabled="props.disabled"
        @update:model-value="patch('pageRange', $event)"
      />
    </div>

    <div class="grid content-start gap-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-muted-foreground">Preview</span>
        <span class="text-[10px] text-muted-foreground/70">page 3</span>
      </div>
      <div class="rounded-xl border border-border bg-muted/30 p-3">
        <div class="relative mx-auto aspect-[0.707] w-full max-w-[210px] overflow-hidden rounded-sm bg-pdf-page shadow-md">
          <div class="absolute inset-0 grid content-start gap-2 p-4">
            <div class="h-1.5 w-2/3 rounded-full bg-muted-foreground/15" />
            <div class="h-1 w-full rounded-full bg-muted-foreground/10" />
            <div class="h-1 w-11/12 rounded-full bg-muted-foreground/10" />
            <div class="mt-2 h-1 w-full rounded-full bg-muted-foreground/10" />
            <div class="h-1 w-10/12 rounded-full bg-muted-foreground/10" />
            <div class="h-1 w-11/12 rounded-full bg-muted-foreground/10" />
            <div class="mt-2 h-1 w-full rounded-full bg-muted-foreground/10" />
            <div class="h-1 w-9/12 rounded-full bg-muted-foreground/10" />
          </div>
          <div
            class="absolute inset-0 flex"
            :style="{
              padding: `${previewPadding}px`,
              alignItems: alignment.alignItems,
              justifyContent: alignment.justifyContent,
            }"
          >
            <span
              class="spdf-tabular leading-none font-medium text-pdf-ink"
              :style="{ fontSize: `${previewFontSize}px` }"
            >
              {{ previewText }}
            </span>
          </div>
        </div>
      </div>
      <p class="text-[11px] leading-relaxed text-muted-foreground">
        Page numbers are drawn on top of the page content at the selected margin.
      </p>
    </div>
  </div>
</template>
