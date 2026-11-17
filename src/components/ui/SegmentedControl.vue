<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { cn } from '../../lib/cn';
import type { SegmentItem } from './types';

interface Props {
  items: SegmentItem[];
  size?: 'sm' | 'default';
  fullWidth?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  fullWidth: false,
  ariaLabel: 'View options',
});

const model = defineModel<string>({ required: true });
const buttons = ref<HTMLButtonElement[]>([]);
const tabbableIndex = computed(() => {
  if (props.disabled) return -1;
  const active = props.items.findIndex((item) => item.value === model.value && !item.disabled);
  return active !== -1 ? active : props.items.findIndex((item) => !item.disabled);
});

function select(item: SegmentItem) {
  if (props.disabled || item.disabled) return;
  model.value = item.value;
}

function onKeydown(event: KeyboardEvent, index: number) {
  const enabled = props.items
    .map((item, itemIndex) => ({ item, itemIndex }))
    .filter(({ item }) => !item.disabled);
  const position = enabled.findIndex(({ itemIndex }) => itemIndex === index);
  if (position === -1) return;

  let next = position;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (position + 1) % enabled.length;
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (position - 1 + enabled.length) % enabled.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = enabled.length - 1;
  else return;

  event.preventDefault();
  const target = enabled[next];
  if (!target) return;
  model.value = target.item.value;
  void nextTick(() => buttons.value[target.itemIndex]?.focus());
}
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="props.ariaLabel"
    :class="
      cn(
        'spdf inline-flex items-center gap-0.5 rounded-lg bg-muted p-1',
        props.fullWidth ? 'flex w-full' : '',
        props.class,
      )
    "
  >
    <button
      v-for="(item, index) in props.items"
      :key="item.value"
      :ref="(element) => (buttons[index] = element as HTMLButtonElement)"
      type="button"
      role="radio"
      :aria-checked="model === item.value"
      :aria-label="item.title ?? item.label"
      :title="item.title"
      :tabindex="tabbableIndex === index ? 0 : -1"
      :disabled="props.disabled || item.disabled"
      :class="
        cn(
          'inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40',
          props.size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-sm',
          props.fullWidth ? 'flex-1' : '',
          model === item.value
            ? 'bg-background text-foreground shadow-xs ring-1 ring-border/60'
            : 'text-muted-foreground hover:text-foreground',
        )
      "
      @click="select(item)"
      @keydown="onKeydown($event, index)"
    >
      <component :is="item.icon" v-if="item.icon" class="size-4" aria-hidden="true" />
      <span v-if="item.label" :class="item.icon && props.size === 'sm' ? 'sr-only sm:not-sr-only' : ''">{{ item.label }}</span>
    </button>
  </div>
</template>
