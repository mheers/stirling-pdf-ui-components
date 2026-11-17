<script setup lang="ts">
import type { Component } from 'vue';
import { ArrowLeft } from '@lucide/vue';
import { cn } from '../../lib/cn';
import Badge from '../ui/Badge.vue';

interface Props {
  title: string;
  description?: string;
  icon?: Component;
  badge?: string;
  backLabel?: string;
  class?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{ back: [] }>();
</script>

<template>
  <div :class="cn('spdf flex flex-col gap-3', props.class)">
    <button
      v-if="props.backLabel"
      type="button"
      class="inline-flex w-fit items-center gap-1.5 rounded-md text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
      @click="emit('back')"
    >
      <ArrowLeft class="size-3.5" aria-hidden="true" />
      {{ props.backLabel }}
    </button>

    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex min-w-0 items-start gap-3">
        <div
          v-if="props.icon || $slots.icon"
          class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10"
        >
          <slot name="icon">
            <component :is="props.icon" class="size-5" aria-hidden="true" />
          </slot>
        </div>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-xl font-semibold tracking-tight text-foreground">{{ props.title }}</h1>
            <Badge v-if="props.badge" variant="secondary">{{ props.badge }}</Badge>
          </div>
          <p v-if="props.description" class="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {{ props.description }}
          </p>
          <slot />
        </div>
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>