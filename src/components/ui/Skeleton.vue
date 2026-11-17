<script setup lang="ts">
import { cn } from '../../lib/cn';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div :class="cn('spdf spdf-skeleton rounded-md', props.class)" aria-hidden="true" />
</template>
