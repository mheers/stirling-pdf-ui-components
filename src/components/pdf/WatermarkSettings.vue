<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Image as ImageIcon, Trash2, Type } from 'lucide-vue-next';
import { cn } from '../../lib/cn';
import type { WatermarkOptions } from '../../lib/types';
import Button from '../ui/Button.vue';
import Field from '../ui/Field.vue';
import Input from '../ui/Input.vue';
import SegmentedControl from '../ui/SegmentedControl.vue';
import Slider from '../ui/Slider.vue';
import Switch from '../ui/Switch.vue';
import PageRangeInput from './PageRangeInput.vue';
import PdfDropzone from './PdfDropzone.vue';
import PdfPositionPicker from './PdfPositionPicker.vue';

interface Props {
  modelValue: WatermarkOptions;
  pageCount?: number;
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), { pageCount: 10 });

const emit = defineEmits<{
  'update:modelValue': [options: WatermarkOptions];
  change: [options: WatermarkOptions];
}>();

const options = computed(() => props.modelValue);
const objectUrl = ref('');
const colorSwatches = ['#64748b', '#111827', '#ef4444', '#3b82f6', '#16a34a', '#f59e0b'];
const previewUrl = computed(() => objectUrl.value || options.value.imageUrl);

const alignment = computed(() => {
  const [vertical, horizontal] = options.value.position.split('-');
  return {
    alignItems: vertical === 'top' ? 'flex-start' : vertical === 'bottom' ? 'flex-end' : 'center',
    justifyContent: horizontal === 'left' ? 'flex-start' : horizontal === 'right' ? 'flex-end' : 'center',
  };
});

const previewFontSize = computed(() => Math.max(8, Math.round(options.value.fontSize * 0.42)));
const previewOpacity = computed(() => Math.max(0, Math.min(1, options.value.opacity / 100)));

watch(
  () => options.value.image,
  (file) => {
    if (objectUrl.value) URL.revokeObjectURL(objectUrl.value);
    objectUrl.value = file && typeof URL !== 'undefined' ? URL.createObjectURL(file) : '';
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value);
});

function update(next: WatermarkOptions) {
  emit('update:modelValue', next);
  emit('change', next);
}

function patch<K extends keyof WatermarkOptions>(key: K, value: WatermarkOptions[K]) {
  update({ ...options.value, [key]: value });
}

function onImage(files: File[]) {
  const file = files[0];
  if (!file) return;
  update({ ...options.value, image: file, imageUrl: '' });
}

function removeImage() {
  update({ ...options.value, image: null, imageUrl: '' });
}

const previewStyle = computed(() => ({
  transform: `rotate(${options.value.rotation}deg)`,
  opacity: previewOpacity.value,
}));
</script>

<template>
  <div :class="cn('spdf grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]', props.class)">
    <div class="grid gap-5">
      <SegmentedControl
        :model-value="options.type"
        :items="[
          { value: 'text', label: 'Text', icon: Type },
          { value: 'image', label: 'Image', icon: ImageIcon },
        ]"
        full-width
        aria-label="Watermark type"
        :disabled="props.disabled"
        @update:model-value="patch('type', $event as WatermarkOptions['type'])"
      />

      <template v-if="options.type === 'text'">
        <Field label="Watermark text">
          <Input
            :model-value="options.text"
            placeholder="e.g. CONFIDENTIAL"
            :disabled="props.disabled"
            maxlength="120"
            @update:model-value="patch('text', String($event))"
          />
        </Field>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="grid gap-2">
            <span class="text-sm font-medium text-foreground">Color</span>
            <div class="flex flex-wrap items-center gap-1.5">
              <button
                v-for="color in colorSwatches"
                :key="color"
                type="button"
                class="size-6 rounded-full border border-border ring-offset-2 ring-offset-background transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                :class="options.color === color ? 'ring-2 ring-primary' : ''"
                :style="{ backgroundColor: color }"
                :aria-label="`Use color ${color}`"
                :aria-pressed="options.color === color"
                @click="patch('color', color)"
              />
              <label class="relative size-6 cursor-pointer overflow-hidden rounded-full border border-dashed border-border" aria-label="Custom color">
                <input
                  type="color"
                  :value="options.color"
                  class="absolute inset-0 size-full cursor-pointer opacity-0"
                  @input="patch('color', ($event.target as HTMLInputElement).value)"
                />
                <span class="grid size-full place-items-center text-[10px] font-medium text-muted-foreground">+</span>
              </label>
            </div>
          </div>

          <Slider
            :model-value="options.fontSize"
            :min="8"
            :max="120"
            label="Font size"
            show-value
            suffix=" pt"
            :disabled="props.disabled"
            @update:model-value="patch('fontSize', $event)"
          />
        </div>
      </template>

      <template v-else>
        <PdfDropzone
          v-if="!previewUrl"
          :accept="['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']"
          :multiple="false"
          :max-files="1"
          :max-size="10 * 1024 * 1024"
          compact
          title="Upload a watermark image"
          description="PNG, JPG, WebP, or SVG"
          :disabled="props.disabled"
          @files="onImage"
        />
        <div v-else class="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
          <div class="spdf-checkerboard flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-border">
            <img :src="previewUrl" alt="Watermark image preview" class="max-h-full max-w-full object-contain" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-foreground">{{ options.image?.name ?? 'Watermark image' }}</p>
            <p class="text-xs text-muted-foreground">Transparent PNG works best.</p>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Remove image" @click="removeImage">
            <Trash2 />
          </Button>
        </div>
      </template>

      <div v-if="!options.tile" class="grid gap-2">
        <span class="text-sm font-medium text-foreground">Position</span>
        <PdfPositionPicker
          :model-value="options.position"
          :disabled="props.disabled"
          @update:model-value="patch('position', $event)"
        />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <Slider
          :model-value="options.opacity"
          :min="2"
          :max="100"
          label="Opacity"
          show-value
          suffix="%"
          :disabled="props.disabled"
          @update:model-value="patch('opacity', $event)"
        />
        <Slider
          :model-value="options.rotation"
          :min="-90"
          :max="90"
          :step="5"
          label="Rotation"
          show-value
          suffix="°"
          :disabled="props.disabled"
          @update:model-value="patch('rotation', $event)"
        />
      </div>

      <div class="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
        <div>
          <p class="text-sm font-medium text-foreground">Tile across the page</p>
          <p class="text-xs text-muted-foreground">Repeat the watermark in a grid for stronger protection.</p>
        </div>
        <Switch
          :model-value="options.tile"
          :disabled="props.disabled"
          aria-label="Tile watermark"
          @update:model-value="patch('tile', $event)"
        />
      </div>

      <PageRangeInput
        :model-value="options.pageRange"
        :page-count="props.pageCount"
        label="Pages to watermark"
        :show-presets="false"
        :show-page-strip="false"
        :disabled="props.disabled"
        @update:model-value="patch('pageRange', $event)"
      />
    </div>

    <div class="grid content-start gap-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-muted-foreground">Preview</span>
        <span class="text-[10px] text-muted-foreground/70">page 1</span>
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

          <div v-if="options.tile" class="absolute inset-0 grid grid-cols-2 content-evenly gap-4 p-4" aria-hidden="true">
            <div v-for="index in 6" :key="index" class="flex items-center justify-center overflow-hidden" :style="previewStyle">
              <span
                v-if="options.type === 'text'"
                class="font-semibold whitespace-nowrap"
                :style="{ fontSize: `${previewFontSize}px`, color: options.color }"
              >{{ options.text || 'CONFIDENTIAL' }}</span>
              <img v-else-if="previewUrl" :src="previewUrl" alt="" class="max-h-10 max-w-full object-contain" />
            </div>
          </div>

          <div v-else class="absolute inset-0 flex p-4" :style="alignment" aria-hidden="true">
            <div :style="previewStyle" class="max-w-full">
              <span
                v-if="options.type === 'text'"
                class="block font-semibold whitespace-nowrap"
                :style="{ fontSize: `${previewFontSize}px`, color: options.color }"
              >{{ options.text || 'CONFIDENTIAL' }}</span>
              <img v-else-if="previewUrl" :src="previewUrl" alt="" class="max-h-24 max-w-full object-contain" />
            </div>
          </div>
        </div>
      </div>
      <p class="text-[11px] leading-relaxed text-muted-foreground">
        Preview is approximate. The final watermark is rendered by your PDF backend at full resolution.
      </p>
    </div>
  </div>
</template>
