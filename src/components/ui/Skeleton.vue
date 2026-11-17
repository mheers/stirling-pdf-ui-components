<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../lib/cn';
import { useSpdfUi } from './context';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
const ui = useSpdfUi();
const hostSkeleton = computed(() => ui.components?.Skeleton);
</script>

<template>
  <component
    :is="hostSkeleton"
    v-if="hostSkeleton"
    :class="props.class"
    aria-hidden="true"
  />
  <div v-else :class="cn('spdf spdf-skeleton rounded-md', props.class)" aria-hidden="true" />
</template>
