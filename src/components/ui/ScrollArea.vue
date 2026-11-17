<script setup lang="ts">
import { cn } from '../../lib/cn';

interface Props {
  class?: string;
  maxHeight?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div
    :class="cn('spdf spdf-scroll overflow-auto', props.class)"
    :style="props.maxHeight ? { maxHeight: props.maxHeight } : undefined"
  >
    <slot />
  </div>
</template>
