<script setup lang="ts">
import { cn } from '../../lib/cn';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <kbd
    :class="
      cn(
        'spdf inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-[0_1px_0_var(--border)]',
        props.class,
      )
    "
  >
    <slot />
  </kbd>
</template>
