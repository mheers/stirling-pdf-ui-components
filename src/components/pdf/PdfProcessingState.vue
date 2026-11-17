<script setup lang="ts">
import { computed } from 'vue';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Circle,
  Loader2,
  X,
} from 'lucide-vue-next';
import { cn } from '../../lib/cn';
import { clampPercent } from '../../lib/format';
import type { PdfProcessingStatus, PdfProcessingStep } from '../../lib/types';
import Button from '../ui/Button.vue';
import Progress from '../ui/Progress.vue';

interface Props {
  status?: PdfProcessingStatus;
  progress?: number;
  title?: string;
  description?: string;
  steps?: PdfProcessingStep[];
  error?: string;
  cancellable?: boolean;
  overlay?: boolean;
  compact?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  status: 'processing',
  cancellable: false,
  overlay: false,
  compact: false,
});

const emit = defineEmits<{
  cancel: [];
  retry: [];
}>();

const percent = computed(() => clampPercent(props.progress));
const determinate = computed(() => props.progress !== undefined && props.progress !== null);

const resolvedTitle = computed(() => {
  if (props.title) return props.title;
  switch (props.status) {
    case 'success':
      return 'Your document is ready';
    case 'error':
      return 'Something went wrong';
    case 'idle':
      return 'Ready when you are';
    default:
      return props.progress !== undefined ? 'Processing your document' : 'Preparing your document';
  }
});

const resolvedDescription = computed(() => {
  if (props.description) return props.description;
  switch (props.status) {
    case 'success':
      return 'The result is ready to download.';
    case 'error':
      return 'The operation could not be completed. Check the details below and try again.';
    case 'idle':
      return 'Choose a tool and add a PDF to get started.';
    default:
      return 'This usually takes a few seconds. You can keep this page open.';
  }
});
</script>

<template>
  <div
    :class="
      cn(
        'spdf',
        props.overlay
          ? 'absolute inset-0 z-30 grid place-items-center rounded-xl bg-background/85 p-6 backdrop-blur-sm'
          : '',
        props.class,
      )
    "
    :role="props.status === 'error' ? 'alert' : 'status'"
    aria-live="polite"
  >
    <div
      :class="
        cn(
          'w-full rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm',
          props.compact ? 'max-w-xl' : 'max-w-md',
          props.overlay ? 'max-w-sm shadow-2xl' : '',
        )
      "
    >
      <div :class="props.compact ? 'flex items-center gap-4' : ''">
        <div v-if="props.compact" class="shrink-0">
          <div v-if="props.status === 'processing'" class="relative grid size-12 place-items-center">
            <Loader2 class="size-7 animate-spin text-primary" aria-hidden="true" />
          </div>
          <div v-else-if="props.status === 'success'" class="grid size-12 place-items-center rounded-full bg-success/12 text-success">
            <Check class="size-6" aria-hidden="true" />
          </div>
          <div v-else class="grid size-12 place-items-center rounded-full bg-destructive/12 text-destructive">
            <AlertCircle class="size-6" aria-hidden="true" />
          </div>
        </div>

        <div v-else class="mb-5 flex justify-center">
          <div v-if="props.status === 'processing'" class="relative grid size-16 place-items-center">
            <div
              v-if="determinate"
              class="absolute inset-0 rounded-full"
              :style="{
                background: `conic-gradient(var(--primary) ${percent * 3.6}deg, var(--muted) 0deg)`,
              }"
            />
            <div v-if="determinate" class="absolute inset-[5px] rounded-full bg-card" />
            <Loader2 v-else class="size-8 animate-spin text-primary" aria-hidden="true" />
            <span v-if="determinate" class="spdf-tabular relative text-xs font-semibold text-foreground">{{ percent }}%</span>
          </div>
          <div v-else-if="props.status === 'success'" class="grid size-16 place-items-center rounded-full bg-success/12 text-success">
            <svg viewBox="0 0 24 24" class="size-8" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path class="spdf-check-path" d="M5 12.5l4.5 4.5L19 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div v-else class="grid size-16 place-items-center rounded-full bg-destructive/12 text-destructive">
            <AlertCircle class="size-8" aria-hidden="true" />
          </div>
        </div>

        <div :class="props.compact ? 'min-w-0 flex-1' : 'text-center'">
          <p class="text-base font-semibold tracking-tight text-foreground">{{ resolvedTitle }}</p>
          <p class="mt-1 text-sm leading-relaxed text-muted-foreground">{{ resolvedDescription }}</p>

          <div v-if="props.status === 'processing'" class="mt-4">
            <Progress
              :value="determinate ? percent : 0"
              :indeterminate="!determinate"
              :label="resolvedTitle"
            />
          </div>
        </div>
      </div>

      <div v-if="props.steps?.length" class="mt-5 grid gap-2 text-left">
        <div v-for="step in props.steps" :key="step.id" class="flex items-center gap-2.5 text-xs">
          <span
            class="grid size-5 shrink-0 place-items-center rounded-full"
            :class="{
              'bg-success/12 text-success': step.status === 'done',
              'bg-primary/10 text-primary': step.status === 'active',
              'bg-destructive/12 text-destructive': step.status === 'error',
              'bg-muted text-muted-foreground/60': step.status === 'pending',
            }"
          >
            <CheckCircle2 v-if="step.status === 'done'" class="size-3.5" aria-hidden="true" />
            <Loader2 v-else-if="step.status === 'active'" class="size-3.5 animate-spin" aria-hidden="true" />
            <AlertCircle v-else-if="step.status === 'error'" class="size-3.5" aria-hidden="true" />
            <Circle v-else class="size-2 fill-current" aria-hidden="true" />
          </span>
          <span :class="step.status === 'active' || step.status === 'done' ? 'text-foreground' : 'text-muted-foreground'">
            {{ step.label }}
          </span>
        </div>
      </div>

      <div v-if="props.status === 'error' && props.error" class="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-left text-xs text-destructive">
        {{ props.error }}
      </div>

      <div v-if="props.cancellable || props.status === 'error'" class="mt-5 flex justify-center gap-2">
        <Button v-if="props.cancellable && props.status === 'processing'" variant="outline" size="sm" @click="emit('cancel')">
          <X class="size-3.5" />
          Cancel
        </Button>
        <Button v-if="props.status === 'error'" size="sm" @click="emit('retry')">Try again</Button>
      </div>
    </div>
  </div>
</template>
