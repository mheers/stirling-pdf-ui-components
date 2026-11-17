<script setup lang="ts">
import { cn } from '../../lib/cn';

interface Props {
  class?: string;
  as?: 'h2' | 'h3' | 'h4' | 'div';
}

const props = withDefaults(defineProps<Props>(), { as: 'h3' });
</script>

<template>
  <component :is="props.as" :class="cn('spdf text-base leading-none font-semibold tracking-tight', props.class)">
    <slot />
  </component>
</template>
