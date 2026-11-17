<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';
import { cn } from '../../lib/cn';
import type { SelectOption } from './types';

defineOptions({ inheritAttrs: false });

interface Props {
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  size?: 'sm' | 'default';
  class?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select…',
  size: 'default',
});

const model = defineModel<string>();
</script>

<template>
  <div :class="cn('spdf relative', props.class)">
    <select
      :id="props.id"
      v-bind="$attrs"
      :value="model ?? ''"
      :disabled="props.disabled"
      :aria-label="props.ariaLabel"
      :class="
        cn(
          'w-full appearance-none rounded-md border border-input bg-background pr-9 pl-3 text-sm text-foreground shadow-xs transition-[color,box-shadow,border-color] duration-150',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          props.size === 'sm' ? 'h-8 text-xs' : 'h-9',
        )
      "
      @change="model = ($event.target as HTMLSelectElement).value"
    >
      <option value="" disabled>{{ props.placeholder }}</option>
      <option v-for="option in props.options" :key="option.value" :value="option.value" :disabled="option.disabled">
        {{ option.label }}
      </option>
    </select>
    <ChevronDown
      class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      aria-hidden="true"
    />
  </div>
</template>
