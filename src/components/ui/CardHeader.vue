<script setup lang="ts">
import { cn } from '../../lib/cn';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div :class="cn('spdf flex flex-col gap-1.5 p-5', props.class)">
    <slot />
  </div>
</template>
