<script setup lang="ts">
import { computed } from 'vue';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui';
import { X } from '@lucide/vue';
import { cn } from '../../lib/cn';
import { useSpdfUi } from './context';

interface Props {
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hideClose?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), { size: 'md', hideClose: false });

const open = defineModel<boolean>('open', { default: false });
const ui = useSpdfUi();

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const overlayClasses = computed(() =>
  cn(
    'spdf spdf-overlay fixed inset-0 z-50 bg-[var(--overlay)] backdrop-blur-[2px]',
    ui.classes?.dialogOverlay,
  ),
);

const contentClasses = computed(() =>
  cn(
    'spdf spdf-dialog fixed top-1/2 left-1/2 z-50 grid max-h-[min(90vh,52rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto spdf-scroll',
    'rounded-xl border border-border bg-popover p-6 text-popover-foreground shadow-2xl',
    ui.classes?.dialog,
    sizes[props.size],
    props.class,
  ),
);
</script>

<template>
  <DialogRoot :open="open" @update:open="open = $event">
    <DialogTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay :class="overlayClasses" />
      <DialogContent :class="contentClasses">
        <div class="grid gap-1.5 pr-8">
          <DialogTitle class="text-lg leading-none font-semibold tracking-tight">{{ props.title }}</DialogTitle>
          <DialogDescription :class="props.description ? 'text-sm leading-relaxed text-muted-foreground' : 'sr-only'">
            {{ props.description || props.title }}
          </DialogDescription>
        </div>

        <slot />

        <div v-if="$slots.footer" class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <slot name="footer" />
        </div>

        <DialogClose
          v-if="!props.hideClose"
          class="spdf absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          aria-label="Close"
        >
          <X class="size-4" aria-hidden="true" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
