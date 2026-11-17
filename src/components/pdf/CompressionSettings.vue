<script setup lang="ts">
import { computed } from 'vue';
import { Archive, Feather, Scale } from 'lucide-vue-next';
import { cn } from '../../lib/cn';
import { formatBytes, savedPercent } from '../../lib/format';
import type { CompressionLevel, CompressionOptions } from '../../lib/types';
import Badge from '../ui/Badge.vue';
import Field from '../ui/Field.vue';
import Select from '../ui/Select.vue';
import Slider from '../ui/Slider.vue';
import Switch from '../ui/Switch.vue';

interface Props {
  modelValue: CompressionOptions;
  originalSize?: number;
  disabled?: boolean;
  class?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [options: CompressionOptions];
  change: [options: CompressionOptions];
}>();

const options = computed(() => props.modelValue);

const presets = [
  {
    level: 'low' as CompressionLevel,
    title: 'Light',
    description: 'Keep the most detail. Best for print-ready files.',
    quality: 90,
    dpi: 200,
    icon: Feather,
  },
  {
    level: 'medium' as CompressionLevel,
    title: 'Balanced',
    description: 'A good mix of quality and size for sharing.',
    quality: 75,
    dpi: 150,
    icon: Scale,
  },
  {
    level: 'high' as CompressionLevel,
    title: 'Small file',
    description: 'Smallest output. Best for email and the web.',
    quality: 55,
    dpi: 100,
    icon: Archive,
  },
];

const estimatedRatio = computed(() => {
  const qualityFactor = options.value.quality / 100;
  const dpiFactor = Math.pow(Math.min(options.value.dpi, 300) / 200, 0.4);
  const ratio = 0.12 + qualityFactor * 0.5 * dpiFactor;
  return Math.min(0.95, Math.max(0.12, options.value.grayscale ? ratio * 0.94 : ratio));
});

const estimatedSize = computed(() =>
  props.originalSize ? Math.round(props.originalSize * estimatedRatio.value) : null,
);
const saving = computed(() => savedPercent(props.originalSize ?? null, estimatedSize.value));

function update(next: CompressionOptions) {
  emit('update:modelValue', next);
  emit('change', next);
}

function selectPreset(preset: (typeof presets)[number]) {
  update({ ...options.value, level: preset.level, quality: preset.quality, dpi: preset.dpi });
}

function patch<K extends keyof CompressionOptions>(key: K, value: CompressionOptions[K]) {
  update({ ...options.value, [key]: value });
}

function patchQuality(value: number) {
  update({ ...options.value, quality: value, level: 'custom' });
}

function patchDpi(value: string) {
  update({ ...options.value, dpi: Number(value), level: 'custom' });
}

const dpiOptions = [72, 96, 150, 200, 300].map((dpi) => ({ value: String(dpi), label: `${dpi} DPI` }));
</script>

<template>
  <div :class="cn('spdf grid gap-5', props.class)">
    <div class="grid gap-2 sm:grid-cols-3">
      <button
        v-for="preset in presets"
        :key="preset.level"
        type="button"
        :disabled="props.disabled"
        :aria-pressed="options.level === preset.level"
        :class="
          cn(
            'group relative flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-[border-color,background-color,box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none disabled:opacity-50',
            options.level === preset.level
              ? 'border-primary/50 bg-primary/[0.035] ring-1 ring-primary/15'
              : 'border-border bg-background hover:border-primary/30',
          )
        "
        @click="selectPreset(preset)"
      >
        <div class="flex w-full items-start justify-between gap-2">
          <div class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <component :is="preset.icon" class="size-4" aria-hidden="true" />
          </div>
          <span
            class="mt-0.5 grid size-4 place-items-center rounded-full border"
            :class="options.level === preset.level ? 'border-primary bg-primary' : 'border-input'"
            aria-hidden="true"
          >
            <span v-if="options.level === preset.level" class="size-1.5 rounded-full bg-primary-foreground" />
          </span>
        </div>
        <div>
          <p class="text-sm font-semibold text-foreground">{{ preset.title }}</p>
          <p class="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{{ preset.description }}</p>
        </div>
        <div class="mt-1 flex items-center gap-2">
          <Badge variant="secondary">{{ preset.dpi }} DPI</Badge>
          <span class="text-[10px] text-muted-foreground">quality {{ preset.quality }}</span>
        </div>
      </button>
    </div>

    <div v-if="props.originalSize" class="rounded-xl border border-border bg-muted/30 p-4">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Estimated result</p>
          <div class="mt-1 flex flex-wrap items-baseline gap-2">
            <span class="spdf-tabular text-sm text-muted-foreground line-through">{{ formatBytes(props.originalSize) }}</span>
            <span class="spdf-tabular text-xl font-semibold text-foreground">{{ formatBytes(estimatedSize) }}</span>
            <Badge v-if="saving !== null" :variant="saving > 0 ? 'success' : 'muted'">
              {{ saving > 0 ? `−${saving}%` : 'No change' }}
            </Badge>
          </div>
        </div>
        <div class="text-right text-[11px] text-muted-foreground">
          <p v-if="options.level === 'custom'" class="mb-0.5 font-medium text-primary">Custom</p>
          <p>{{ options.dpi }} DPI</p>
          <p>quality {{ options.quality }}</p>
        </div>
      </div>
      <div class="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div class="h-full rounded-full bg-primary transition-[width] duration-500" :style="{ width: `${Math.round(estimatedRatio * 100)}%` }" />
      </div>
      <p class="mt-2 text-[10px] text-muted-foreground">Estimate only; the actual size depends on the document content.</p>
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <Slider
        :model-value="options.quality"        :min="10"
        :max="100"
        :step="5"
        label="Image quality"
        show-value
        suffix="%"
        :disabled="props.disabled"
        @update:model-value="patchQuality"
      />
      <Field label="Image resolution">
        <Select
          :model-value="String(options.dpi)"
          :options="dpiOptions"
          :disabled="props.disabled"
          @update:model-value="patchDpi(String($event))"
        />
      </Field>
    </div>

    <div class="grid gap-2">
      <div class="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
        <div>
          <p class="text-sm font-medium text-foreground">Grayscale images</p>
          <p class="text-xs text-muted-foreground">Can shrink scanned documents significantly.</p>
        </div>
        <Switch
          :model-value="options.grayscale"
          :disabled="props.disabled"
          aria-label="Convert images to grayscale"
          @update:model-value="patch('grayscale', $event)"
        />
      </div>
      <div class="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
        <div>
          <p class="text-sm font-medium text-foreground">Optimize images</p>
          <p class="text-xs text-muted-foreground">Re-encode images and remove unused data.</p>
        </div>
        <Switch
          :model-value="options.optimizeImages"
          :disabled="props.disabled"
          aria-label="Optimize images"
          @update:model-value="patch('optimizeImages', $event)"
        />
      </div>
    </div>
  </div>
</template>
