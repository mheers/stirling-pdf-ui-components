<script setup lang="ts">
import { FileText } from 'lucide-vue-next';
import type { Component } from 'vue';
import { cn } from '../../lib/cn';

interface Props {
  title?: string;
  description?: string;
  icon?: Component;
  class?: string;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Nothing here yet',
  compact: false,
});
</script>

<template>
  <div
    :class="
      cn(
        'spdf flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/25 text-center',
        props.compact ? 'gap-2 p-5' : 'gap-3 px-6 py-12',
        props.class,
      )
    "
  >
    <div
      :class="
        cn(
          'flex items-center justify-center rounded-xl bg-background text-muted-foreground shadow-xs ring-1 ring-border',
          props.compact ? 'size-9' : 'size-12',
        )
      "
    >
      <slot name="icon">
        <component :is="props.icon ?? FileText" :class="props.compact ? 'size-4' : 'size-5'" aria-hidden="true" />
      </slot>
    </div>
    <div class="grid max-w-sm gap-1">
      <p :class="cn('font-medium text-foreground', props.compact ? 'text-sm' : 'text-base')">{{ props.title }}</p>
      <p v-if="props.description" class="text-sm leading-relaxed text-muted-foreground">{{ props.description }}</p>
    </div>
    <div v-if="$slots.actions" class="mt-1 flex flex-wrap items-center justify-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
