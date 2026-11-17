<script setup lang="ts">
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
import { X } from 'lucide-vue-next';
import { cn } from '../../lib/cn';

type Side = 'left' | 'right' | 'top' | 'bottom';

interface Props {
  title: string;
  description?: string;
  side?: Side;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), { side: 'right' });

const open = defineModel<boolean>('open', { default: false });

const sides: Record<Side, string> = {
  right: 'inset-y-0 right-0 h-full w-80 max-w-[90vw] border-l',
  left: 'inset-y-0 left-0 h-full w-80 max-w-[90vw] border-r',
  top: 'inset-x-0 top-0 w-full max-h-[85vh] border-b',
  bottom: 'inset-x-0 bottom-0 w-full max-h-[85vh] border-t',
};
</script>

<template>
  <DialogRoot :open="open" @update:open="open = $event">
    <DialogTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="spdf spdf-overlay fixed inset-0 z-50 bg-[var(--overlay)] backdrop-blur-[2px]" />
      <DialogContent
        :class="
          cn(
            'spdf fixed z-50 flex flex-col gap-5 overflow-y-auto border-border bg-popover p-5 text-popover-foreground shadow-2xl spdf-scroll',
            `spdf-sheet-${props.side}`,
            sides[props.side],
            props.class,
          )
        "
      >
        <div class="grid gap-1.5 pr-8">
          <DialogTitle class="text-base leading-none font-semibold tracking-tight">{{ props.title }}</DialogTitle>
          <DialogDescription :class="props.description ? 'text-sm leading-relaxed text-muted-foreground' : 'sr-only'">
            {{ props.description || props.title }}
          </DialogDescription>
        </div>

        <slot />

        <div v-if="$slots.footer" class="mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <slot name="footer" />
        </div>

        <DialogClose
          class="spdf absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          aria-label="Close"
        >
          <X class="size-4" aria-hidden="true" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
