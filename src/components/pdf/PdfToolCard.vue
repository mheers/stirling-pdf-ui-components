<script setup lang="ts">
import { computed } from 'vue';
import { ArrowRight, FileText } from '@lucide/vue';
import { cn } from '../../lib/cn';
import type { PdfTool } from '../../lib/types';
import Badge from '../ui/Badge.vue';

interface Props {
  tool: PdfTool;
  featured?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), { featured: false });

const emit = defineEmits<{ select: [tool: PdfTool] }>();

const badgeVariant = computed(() => {
  switch (props.tool.badge) {
    case 'new':
      return 'success' as const;
    case 'beta':
      return 'warning' as const;
    case 'pro':
      return 'brand' as const;
    default:
      return 'secondary' as const;
  }
});

function onClick(event: MouseEvent) {
  if (props.tool.disabled) {
    event.preventDefault();
    return;
  }
  if (props.tool.href) return;
  event.preventDefault();
  emit('select', props.tool);
}
</script>

<template>
  <component
    :is="props.tool.href ? 'a' : 'button'"
    :href="props.tool.href"
    :type="props.tool.href ? undefined : 'button'"
    :disabled="props.tool.href ? undefined : props.tool.disabled"
    :tabindex="props.tool.href && props.tool.disabled ? -1 : undefined"
    :aria-disabled="props.tool.disabled || undefined"
    :class="
      cn(
        'spdf group relative flex w-full flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 text-left text-card-foreground shadow-xs transition-[border-color,box-shadow,transform] duration-200',
        'hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        props.tool.disabled ? 'pointer-events-none opacity-50' : '',
        props.class,
      )
    "
    @click="onClick"
  >
    <div class="flex w-full items-start justify-between gap-2">
      <div
        class="flex items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
        :class="props.featured ? 'size-12' : 'size-10'"
      >
        <slot name="icon">
          <component :is="props.tool.icon ?? FileText" :class="props.featured ? 'size-5' : 'size-4.5'" aria-hidden="true" />
        </slot>
      </div>
      <Badge v-if="props.tool.badge" :variant="badgeVariant" class="capitalize">{{ props.tool.badge }}</Badge>
    </div>

    <div class="min-w-0 flex-1">
      <h3 class="text-sm font-semibold text-foreground">{{ props.tool.name }}</h3>
      <p v-if="props.tool.description" class="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {{ props.tool.description }}
      </p>
    </div>

    <div class="flex w-full items-center justify-between gap-2">
      <span v-if="props.tool.category" class="text-[10px] font-medium tracking-wide text-muted-foreground/80 uppercase">
        {{ props.tool.category }}
      </span>
      <span
        class="ml-auto inline-flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-primary group-hover:text-primary-foreground"
        aria-hidden="true"
      >
        <ArrowRight class="size-3.5" />
      </span>
    </div>
  </component>
</template>
