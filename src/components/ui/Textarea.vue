<script setup lang="ts">
import { cn } from '../../lib/cn';

interface Props {
  class?: string;
  rows?: number;
}

const props = withDefaults(defineProps<Props>(), { rows: 4 });
const model = defineModel<string>();
</script>

<template>
  <textarea
    v-bind="$attrs"
    :rows="props.rows"
    :value="model ?? ''"
    :class="
      cn(
        'spdf flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow,border-color] duration-150',
        'placeholder:text-muted-foreground/70',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        props.class,
      )
    "
    @input="model = ($event.target as HTMLTextAreaElement).value"
  />
</template>
