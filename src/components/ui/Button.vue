<script setup lang="ts">
import { computed } from 'vue';
import { Primitive } from 'reka-ui';
import { Loader2 } from '@lucide/vue';
import { cn } from '../../lib/cn';
import { buttonVariants, type ButtonVariants } from './button-variants';
import { useSpdfUi } from './context';

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

const ui = useSpdfUi();
const hostButton = computed(() => ui.components?.Button);
const classes = computed(() =>
  cn(buttonVariants({ variant: props.variant, size: props.size }), props.class),
);
// Host buttons such as shadcn-vue's use `icon` rather than the two icon sizes
// this library uses internally.
const hostSize = computed(() =>
  props.size === 'icon-sm' || props.size === 'icon-lg' ? 'icon' : props.size,
);
// The library's own recipe sizes slot icons; a host button may not. Keep the
// structural icon sizing so toolbars do not inherit Lucide's 24px default.
const hostClasses = computed(() => cn('[&_svg]:size-4 [&_svg]:shrink-0', props.class));
</script>

<template>
  <component
    :is="hostButton"
    v-if="hostButton && !asChild"
    v-bind="$attrs"
    :variant="props.variant"
    :size="hostSize"
    :type="props.type"
    :disabled="props.disabled || props.loading"
    :aria-disabled="props.disabled || props.loading || undefined"
    :aria-busy="props.loading || undefined"
    :data-loading="props.loading || undefined"
    :class="hostClasses"
  >
    <Loader2 v-if="props.loading" class="size-4 animate-spin" aria-hidden="true" />
    <slot />
  </component>
  <Primitive
    v-else-if="asChild"
    :as-child="true"
    :class="classes"
    :disabled="disabled || loading || undefined"
    :aria-disabled="disabled || loading || undefined"
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
    <Loader2 v-if="loading" class="size-4 animate-spin" aria-hidden="true" />
    <slot />
  </button>
</template>
