<script setup lang="ts">
import { computed, useId } from 'vue';
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui';
import { cn } from '../../lib/cn';
import { useSpdfUi } from './context';
import Label from './Label.vue';

interface Props {
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
  suffix?: string;
  formatValue?: (value: number) => string;
  id?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  showValue: false,
  suffix: '',
});

const model = defineModel<number>({ default: 0 });
const autoId = useId();
const sliderId = computed(() => props.id ?? `spdf-slider-${autoId}`);
const ui = useSpdfUi();
const hostSlider = computed(() => ui.components?.Slider);

function onUpdate(value: number[] | undefined) {
  if (value?.[0] !== undefined) model.value = value[0];
}

const display = () => (props.formatValue ? props.formatValue(model.value) : `${model.value}${props.suffix}`);
</script>

<template>
  <div :class="cn('spdf grid gap-2.5', props.class)">
    <div v-if="props.label || props.showValue" class="flex items-center justify-between gap-3">
      <Label v-if="props.label" :for="sliderId">{{ props.label }}</Label>
      <span v-if="props.showValue" class="spdf-tabular text-xs font-medium text-muted-foreground">{{ display() }}</span>
    </div>
    <component
      :is="hostSlider"
      v-if="hostSlider"
      :id="sliderId"
      :model-value="model"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      :disabled="props.disabled"
      :aria-label="props.label"
      @update:model-value="model = $event as number"
    />
    <SliderRoot
      v-else
      :id="sliderId"
      :model-value="[model]"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      :disabled="props.disabled"
      :aria-label="props.label"
      class="spdf relative flex h-5 w-full touch-none items-center select-none disabled:opacity-50"
      @update:model-value="onUpdate"
    >
      <SliderTrack class="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
        <SliderRange class="absolute h-full bg-primary" />
      </SliderTrack>
      <SliderThumb
        class="block size-4 rounded-full border-2 border-primary bg-background shadow-sm ring-offset-background transition-[box-shadow,transform] hover:scale-110 focus-visible:ring-[3px] focus-visible:ring-ring/35 focus-visible:outline-none disabled:pointer-events-none"
      />
    </SliderRoot>
  </div>
</template>
