<script setup lang="ts">
import { computed } from 'vue';
import {
  PopoverArrow,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from 'reka-ui';
import { cn } from '../../lib/cn';
import { useSpdfUi } from './context';

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
const ui = useSpdfUi();

const contentClasses = computed(() =>
  cn(
    'spdf spdf-popover z-[70] min-w-56 outline-none',
    'rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl',
    ui.classes?.popover,
    props.class,
    props.contentClass,
  ),
);
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
        :class="contentClasses"
      >
        <slot />
        <PopoverArrow class="fill-popover" :width="12" :height="6" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
