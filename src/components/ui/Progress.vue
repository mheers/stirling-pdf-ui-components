<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../lib/cn';

interface Props {
  value?: number | null;
  max?: number;
  indeterminate?: boolean;
  label?: string;
  class?: string;
  indicatorClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  max: 100,
  indeterminate: false,
  label: 'Progress',
});

const percent = computed(() => {
  if (props.value === null || props.value === undefined) return 0;
  return Math.min(100, Math.max(0, (props.value / props.max) * 100));
});
</script>

<template>
  <div
    role="progressbar"
    :aria-label="props.label"
    :aria-valuemin="0"
    :aria-valuemax="props.max"
    :aria-valuenow="props.indeterminate ? undefined : props.value ?? 0"
    :class="cn('spdf h-2 w-full overflow-hidden rounded-full bg-muted', props.class)"
  >
    <div
      v-if="props.indeterminate"
      class="spdf-indeterminate h-full w-1/3 rounded-full bg-primary"
    />
    <div
      v-else
      :class="cn('h-full rounded-full bg-primary transition-[width] duration-500 ease-out', props.indicatorClass)"
      :style="{ width: `${percent}%` }"
    />
  </div>
</template>
