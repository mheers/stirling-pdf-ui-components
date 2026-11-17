<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';

interface Props {
  size?: number | string;
  label?: string;
  class?: string;
}

withDefaults(defineProps<Props>(), {
  size: 16,
  label: 'Loading',
});
</script>

<template>
  <span class="spdf inline-flex items-center justify-center" role="status" :aria-label="label">
    <Loader2
      class="animate-spin text-current"
      :size="typeof size === 'number' ? size : undefined"
      :style="typeof size === 'string' ? { width: size, height: size } : undefined"
      aria-hidden="true"
    />
    <span class="sr-only">{{ label }}</span>
  </span>
</template>
