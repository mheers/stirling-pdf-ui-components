<script setup lang="ts">
import { cn } from '../../lib/cn';

interface Props {
  for?: string;
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <label
    :for="props.for"
    :class="cn('spdf inline-flex items-center gap-1 text-sm leading-none font-medium text-foreground', props.class)"
  >
    <slot />
  </label>
</template>
