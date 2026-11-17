<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../lib/cn';
import { useSpdfUi } from './context';

interface Props {
  class?: string;
  rows?: number;
}

const props = withDefaults(defineProps<Props>(), { rows: 4 });
const model = defineModel<string>();
const ui = useSpdfUi();
const hostTextarea = computed(() => ui.components?.Textarea);
const classes = computed(() =>
  cn(
    'spdf flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow,border-color] duration-150',
    'placeholder:text-muted-foreground/70',
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
    ui.classes?.textarea,
    props.class,
  ),
);
</script>

<template>
  <component
    :is="hostTextarea"
    v-if="hostTextarea"
    v-bind="$attrs"
    :rows="props.rows"
    :model-value="model ?? ''"
    :class="props.class"
    @update:model-value="model = $event as string"
  />
  <textarea
    v-else
    v-bind="$attrs"
    :rows="props.rows"
    :value="model ?? ''"
    :class="classes"
    @input="model = ($event.target as HTMLTextAreaElement).value"
  />
</template>
