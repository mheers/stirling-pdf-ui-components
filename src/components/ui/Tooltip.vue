<script setup lang="ts">
import { computed } from 'vue';
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'reka-ui';
import { cn } from '../../lib/cn';
import { useSpdfUi } from './context';

interface Props {
  content?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  sideOffset?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  side: 'top',
  align: 'center',
  delay: 250,
  sideOffset: 6,
  disabled: false,
});
const ui = useSpdfUi();
const contentClasses = computed(() =>
  cn(
    'spdf spdf-popover z-[80] max-w-xs',
    'rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs leading-snug text-popover-foreground shadow-md',
    ui.classes?.tooltip,
  ),
);
</script>

<template>
  <slot v-if="props.disabled || (!props.content && !$slots.content)" />
  <TooltipProvider v-else :delay-duration="props.delay">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          :side="props.side"
          :align="props.align"
          :side-offset="props.sideOffset"
          :class="contentClasses"
        >
          <slot name="content">{{ props.content }}</slot>
          <TooltipArrow class="fill-popover" :width="10" :height="5" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
