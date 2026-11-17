<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { cn } from '../../lib/cn';
import type { TabItem } from './types';

interface Props {
  items: TabItem[];
  variant?: 'underline' | 'pills';
  size?: 'sm' | 'default';
  fullWidth?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'underline',
  size: 'default',
  fullWidth: false,
  ariaLabel: 'Tabs',
});

const model = defineModel<string>({ required: true });
const buttons = ref<HTMLButtonElement[]>([]);
const tabbableIndex = computed(() => {
  if (props.disabled) return -1;
  const active = props.items.findIndex((item) => item.value === model.value && !item.disabled);
  return active !== -1 ? active : props.items.findIndex((item) => !item.disabled);
});

function select(value: string, disabled?: boolean) {
  if (props.disabled || disabled) return;
  model.value = value;
}

function onKeydown(event: KeyboardEvent, index: number) {
  const enabled = props.items.map((item, itemIndex) => ({ item, itemIndex })).filter(({ item }) => !item.disabled);
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
    role="tablist"
    :aria-label="props.ariaLabel"
    :aria-disabled="props.disabled || undefined"
    :class="
      cn(
        'spdf inline-flex items-center gap-1',
        props.variant === 'underline' ? 'border-b border-border' : 'rounded-lg bg-muted p-1',
        props.fullWidth ? 'w-full' : '',
        props.class,
      )
    "
  >
    <button
      v-for="(item, index) in props.items"
      :key="item.value"
      :ref="(element) => (buttons[index] = element as HTMLButtonElement)"
      type="button"
      role="tab"
      :aria-selected="model === item.value"
      :tabindex="tabbableIndex === index ? 0 : -1"
      :disabled="props.disabled || item.disabled"
      :class="
        cn(
          'inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          props.variant === 'underline'
            ? '-mb-px border-b-2 px-3 pb-2.5 pt-1 text-sm'
            : 'rounded-md px-3 py-1.5 text-sm',
          props.size === 'sm' ? 'text-xs' : '',
          model === item.value
            ? props.variant === 'underline'
              ? 'border-primary text-foreground'
              : 'bg-background text-foreground shadow-xs'
            : props.variant === 'underline'
              ? 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          props.fullWidth ? 'flex-1' : '',
        )
      "
      @click="select(item.value, item.disabled)"
      @keydown="onKeydown($event, index)"
    >
      <component :is="item.icon" v-if="item.icon" class="size-4" aria-hidden="true" />
      {{ item.label }}
      <span
        v-if="item.badge !== undefined"
        class="rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground"
      >{{ item.badge }}</span>
    </button>
  </div>
</template>
