<script setup lang="ts">
import { cn } from '../../lib/cn';

interface Props {
  type?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), { type: 'text' });
const model = defineModel<string | number>();
</script>

<template>
  <input
    v-bind="$attrs"
    :type="props.type"
    :value="model ?? ''"
    :class="
      cn(
        'spdf flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs transition-[color,box-shadow,border-color] duration-150',
        'placeholder:text-muted-foreground/70',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        props.class,
      )
    "
    @input="model = ($event.target as HTMLInputElement).value"
  />
</template>
