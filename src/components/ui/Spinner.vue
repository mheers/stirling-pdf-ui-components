<script setup lang="ts">
import { computed } from 'vue';
import { Loader2 } from '@lucide/vue';
import { useSpdfUi } from './context';

interface Props {
  size?: number | string;
  label?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
  label: 'Loading',
});
const ui = useSpdfUi();
const hostSpinner = computed(() => ui.components?.Spinner);
</script>

<template>
  <component
    :is="hostSpinner"
    v-if="hostSpinner"
    :size="props.size"
    :label="props.label"
    :class="props.class"
  />
  <span v-else class="spdf inline-flex items-center justify-center" role="status" :aria-label="label">
    <Loader2
      class="animate-spin text-current"
      :size="typeof size === 'number' ? size : undefined"
      :style="typeof size === 'string' ? { width: size, height: size } : undefined"
      aria-hidden="true"
    />
    <span class="sr-only">{{ label }}</span>
  </span>
</template>
