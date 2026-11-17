<script setup lang="ts">
import {
  PopoverArrow,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from 'reka-ui';
import { cn } from '../../lib/cn';

interface Props {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  class?: string;
  contentClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  side: 'bottom',
  align: 'center',
  sideOffset: 6,
});

const open = defineModel<boolean>('open');
</script>

<template>
  <PopoverRoot :open="open" @update:open="open = $event">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        :side="props.side"
        :align="props.align"
        :side-offset="props.sideOffset"
        :class="
          cn(
            'spdf spdf-popover z-[70] min-w-56 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl outline-none',
            props.class,
          )
        "
      >
        <slot />
        <PopoverArrow class="fill-popover" :width="12" :height="6" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
