<script setup lang="ts">
import { cn } from '../../lib/cn';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div :class="cn('spdf rounded-xl border border-border bg-card text-card-foreground shadow-xs', props.class)">
    <slot />
  </div>
</template>
