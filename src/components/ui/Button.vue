<script setup lang="ts">
import { Primitive } from 'reka-ui';
import { Loader2 } from 'lucide-vue-next';
import { cn } from '../../lib/cn';
import { buttonVariants, type ButtonVariants } from './button-variants';

interface Props {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  type?: 'button' | 'submit' | 'reset';
  asChild?: boolean;
  loading?: boolean;
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  asChild: false,
  loading: false,
  disabled: false,
  variant: 'default',
  size: 'default',
});

const classes = cn(buttonVariants({ variant: props.variant, size: props.size }), props.class);
</script>

<template>
  <Primitive
    v-if="asChild"
    :as-child="true"
    :class="classes"
    :aria-busy="loading || undefined"
    :data-loading="loading || undefined"
  >
    <slot />
  </Primitive>
  <button
    v-else
    v-bind="$attrs"
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <Loader2 v-if="loading" class="animate-spin" aria-hidden="true" />
    <slot />
  </button>
</template>
