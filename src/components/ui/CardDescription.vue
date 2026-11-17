<script setup lang="ts">
import { cn } from '../../lib/cn';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <p :class="cn('spdf text-sm leading-relaxed text-muted-foreground', props.class)">
    <slot />
  </p>
</template>
