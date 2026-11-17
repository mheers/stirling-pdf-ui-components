<script setup lang="ts">
import { cn } from '../../lib/cn';

interface Props {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), { orientation: 'horizontal' });
</script>

<template>
  <div
    v-if="props.orientation === 'vertical'"
    role="separator"
    aria-orientation="vertical"
    :class="cn('spdf h-full w-px shrink-0 bg-border', props.class)"
  />
  <div v-else-if="props.label" :class="cn('spdf flex items-center gap-3', props.class)" role="separator">
    <span class="h-px flex-1 bg-border" />
    <span class="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{{ props.label }}</span>
    <span class="h-px flex-1 bg-border" />
  </div>
  <div v-else :class="cn('spdf h-px w-full shrink-0 bg-border', props.class)" role="separator" aria-orientation="horizontal" />
</template>
