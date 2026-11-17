<script setup lang="ts">
import { PDF_POSITIONS, type PdfPosition } from '../../lib/types';
import { cn } from '../../lib/cn';

interface Props {
  modelValue: PdfPosition;
  disabled?: boolean;
  class?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:modelValue': [value: PdfPosition] }>();
</script>

<template>
  <div :class="cn('spdf grid w-fit grid-cols-3 gap-1 rounded-lg border border-border bg-muted/30 p-1', props.class)" role="radiogroup" aria-label="Position">
    <button
      v-for="position in PDF_POSITIONS"
      :key="position.value"
      type="button"
      role="radio"
      :aria-checked="props.modelValue === position.value"
      :aria-label="position.label"
      :disabled="props.disabled"
      :class="
        cn(
          'grid h-7 w-10 place-items-center rounded transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          props.modelValue === position.value
            ? 'bg-primary text-primary-foreground shadow-xs'
            : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
        )
      "
      @click="emit('update:modelValue', position.value)"
    >
      <span class="h-1 w-4 rounded-full bg-current" aria-hidden="true" />
    </button>
  </div>
</template>
