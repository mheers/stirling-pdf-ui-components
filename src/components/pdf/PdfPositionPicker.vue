<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { PDF_POSITIONS, type PdfPosition } from '../../lib/types';
import { cn } from '../../lib/cn';

interface Props {
  modelValue: PdfPosition;
  disabled?: boolean;
  class?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:modelValue': [value: PdfPosition] }>();

const buttons = ref<HTMLButtonElement[]>([]);

function onKeydown(event: KeyboardEvent, index: number) {
  if (props.disabled) return;

  const enabled = PDF_POSITIONS.map((position, itemIndex) => ({ position, itemIndex }));
  const position = enabled.findIndex(({ itemIndex }) => itemIndex === index);
  if (position === -1) return;

  const columns = 3;
  let next = position;
  if (event.key === 'ArrowRight') next = (position + 1) % enabled.length;
  else if (event.key === 'ArrowLeft') next = (position - 1 + enabled.length) % enabled.length;
  else if (event.key === 'ArrowDown') next = (position + columns) % enabled.length;
  else if (event.key === 'ArrowUp') next = (position - columns + enabled.length) % enabled.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = enabled.length - 1;
  else return;

  event.preventDefault();
  const target = enabled[next];
  if (!target) return;
  emit('update:modelValue', target.position.value);
  void nextTick(() => buttons.value[target.itemIndex]?.focus());
}
</script>

<template>
  <div :class="cn('spdf grid w-fit grid-cols-3 gap-1 rounded-lg border border-border bg-muted/30 p-1', props.class)" role="radiogroup" aria-label="Position">
    <button
      v-for="(position, index) in PDF_POSITIONS"
      :key="position.value"
      type="button"
      role="radio"
      :aria-checked="props.modelValue === position.value"
      :aria-label="position.label"
      :tabindex="props.modelValue === position.value ? 0 : -1"
      :ref="(element) => (buttons[index] = element as HTMLButtonElement)"
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
      @keydown="onKeydown($event, index)"
    >
      <span class="h-1 w-4 rounded-full bg-current" aria-hidden="true" />
    </button>
  </div>
</template>
