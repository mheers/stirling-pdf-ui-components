<script setup lang="ts">
import { computed } from 'vue';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from '@lucide/vue';
import { cn } from '../../lib/cn';

type AlertVariant = 'default' | 'info' | 'success' | 'warning' | 'destructive';

interface Props {
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), { variant: 'default' });

const emit = defineEmits<{ close: [] }>();

const icons = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertCircle,
};

const variants: Record<AlertVariant, string> = {
  default: 'border-border bg-muted/40 text-foreground [&_.spdf-alert-icon]:text-muted-foreground',
  info: 'border-info/25 bg-info/8 text-foreground [&_.spdf-alert-icon]:text-info',
  success: 'border-success/25 bg-success/8 text-foreground [&_.spdf-alert-icon]:text-success',
  warning: 'border-warning/30 bg-warning/10 text-foreground [&_.spdf-alert-icon]:text-warning',
  destructive: 'border-destructive/25 bg-destructive/8 text-foreground [&_.spdf-alert-icon]:text-destructive',
};

const icon = computed(() => icons[props.variant]);
</script>

<template>
  <div
    :role="props.variant === 'destructive' || props.variant === 'warning' ? 'alert' : 'status'"
    :class="cn('spdf flex items-start gap-3 rounded-lg border p-3.5 text-sm', variants[props.variant], props.class)"
  >
    <component :is="icon" class="spdf-alert-icon mt-0.5 size-4 shrink-0" aria-hidden="true" />
    <div class="min-w-0 flex-1">
      <p v-if="props.title" class="font-medium text-foreground">{{ props.title }}</p>
      <div :class="props.title ? 'mt-1 text-muted-foreground' : 'text-muted-foreground'">
        <slot />
      </div>
    </div>
    <button
      v-if="props.dismissible"
      type="button"
      class="-m-1 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
      aria-label="Dismiss"
      @click="emit('close')"
    >
      <X class="size-4" aria-hidden="true" />
    </button>
  </div>
</template>
