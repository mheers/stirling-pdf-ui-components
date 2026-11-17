<script setup lang="ts">
import { computed, useId } from 'vue';
import { cn } from '../../lib/cn';
import Label from './Label.vue';

interface Props {
  label?: string;
  description?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  for?: string;
  class?: string;
}

const props = defineProps<Props>();

const autoId = useId();
const id = computed(() => props.for ?? `spdf-field-${autoId}`);
const descriptionId = computed(() => `${id.value}-description`);
const errorId = computed(() => `${id.value}-error`);
const hintId = computed(() => `${id.value}-hint`);
const describedBy = computed(() => {
  if (props.error) return errorId.value;
  if (props.description) return descriptionId.value;
  return props.hint ? hintId.value : undefined;
});
</script>

<template>
  <div :class="cn('spdf grid gap-2', props.class)">
    <div v-if="label" class="flex items-baseline justify-between gap-3">
      <Label :for="id">
        {{ label }}
        <span v-if="required" class="text-destructive" aria-hidden="true">*</span>
        <span v-if="required" class="sr-only">(required)</span>
      </Label>
      <span v-if="optional" class="text-[11px] text-muted-foreground">Optional</span>
    </div>

    <slot :id="id" :described-by="describedBy" :invalid="!!error" />

    <p v-if="error" :id="errorId" class="text-xs font-medium text-destructive" role="alert">
      {{ error }}
    </p>
    <p v-else-if="description" :id="descriptionId" class="text-xs leading-relaxed text-muted-foreground">
      {{ description }}
    </p>
    <p v-if="hint && !error" :id="hintId" class="text-xs leading-relaxed text-muted-foreground/80">
      {{ hint }}
    </p>
  </div>
</template>
