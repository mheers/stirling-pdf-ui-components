<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui';
import { Check, Minus } from 'lucide-vue-next';
import { cn } from '../../lib/cn';

interface Props {
  id?: string;
  disabled?: boolean;
  class?: string;
  ariaLabel?: string;
}

const props = defineProps<Props>();
const model = defineModel<boolean | 'indeterminate'>({ default: false });
</script>

<template>
  <CheckboxRoot
    :id="props.id"
    :model-value="model"
    :disabled="props.disabled"
    :aria-label="props.ariaLabel"
    :class="
      cn(
        'spdf peer inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background shadow-xs transition-colors',
        'focus-visible:ring-[3px] focus-visible:ring-ring/35 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
        props.class,
      )
    "
    @update:model-value="model = $event"
  >
    <CheckboxIndicator class="grid place-items-center">
      <Minus v-if="model === 'indeterminate'" class="size-3" aria-hidden="true" />
      <Check v-else class="size-3" aria-hidden="true" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
