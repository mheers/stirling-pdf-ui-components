<script setup lang="ts">
import { cn } from '../../lib/cn';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div :class="cn('spdf p-5 pt-0', props.class)">
    <slot />
  </div>
</template>
