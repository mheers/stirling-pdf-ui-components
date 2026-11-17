<script setup lang="ts">
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from 'reka-ui';
import { Circle } from 'lucide-vue-next';
import { cn } from '../../lib/cn';
import type { RadioItem } from './types';

interface Props {
  items: RadioItem[];
  variant?: 'list' | 'cards';
  orientation?: 'vertical' | 'horizontal';
  ariaLabel?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'list',
  orientation: 'vertical',
  ariaLabel: 'Options',
});

const model = defineModel<string>();
</script>

<template>
  <RadioGroupRoot
    :model-value="model"
    :orientation="props.orientation"
    :aria-label="props.ariaLabel"
    :class="
      cn(
        'spdf grid gap-2',
        props.variant === 'cards' ? 'sm:grid-cols-2 lg:grid-cols-3' : '',
        props.orientation === 'horizontal' ? 'sm:grid-flow-col sm:auto-cols-fr' : '',
        props.class,
      )
    "
    @update:model-value="model = $event as string"
  >
    <RadioGroupItem
      v-for="item in props.items"
      :key="item.value"
      :value="item.value"
      :disabled="item.disabled"
      :aria-label="item.label"
      :class="
        cn(
          'group flex text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          props.variant === 'cards'
            ? 'items-start gap-3 rounded-lg border border-border bg-background p-3.5 hover:border-border/80 hover:bg-accent/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary/4 data-[state=checked]:ring-1 data-[state=checked]:ring-primary/20'
            : 'items-center gap-2.5 rounded-md px-1 py-1.5',
        )
      "
    >
      <span
        v-if="props.variant === 'list'"
        class="flex size-4 shrink-0 items-center justify-center rounded-full border border-input bg-background transition-colors group-data-[state=checked]:border-primary"
      >
        <RadioGroupIndicator class="grid place-items-center">
          <Circle class="size-2 fill-primary text-primary" aria-hidden="true" />
        </RadioGroupIndicator>
      </span>
      <span v-else class="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-input bg-background group-data-[state=checked]:border-primary">
        <RadioGroupIndicator class="grid place-items-center">
          <Circle class="size-2 fill-primary text-primary" aria-hidden="true" />
        </RadioGroupIndicator>
      </span>
      <span class="min-w-0 flex-1">
        <span class="flex items-center gap-2 text-sm font-medium text-foreground">
          <component :is="item.icon" v-if="item.icon" class="size-4 text-muted-foreground" aria-hidden="true" />
          {{ item.label }}
        </span>
        <span v-if="item.description" class="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {{ item.description }}
        </span>
      </span>
    </RadioGroupItem>
  </RadioGroupRoot>
</template>
