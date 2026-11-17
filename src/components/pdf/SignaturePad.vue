<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { PenLine, RotateCcw, Trash2 } from '@lucide/vue';
import { useElementSize } from '../../composables/useElementSize';
import { canvasToTrimmedDataUrl } from '../../lib/canvas';
import { cn } from '../../lib/cn';
import Button from '../ui/Button.vue';
import Tooltip from '../ui/Tooltip.vue';

type Point = { x: number; y: number };

interface Props {
  height?: number;
  lineWidth?: number;
  color?: string;
  background?: string;
  disabled?: boolean;
  showToolbar?: boolean;
  placeholder?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  height: 180,
  lineWidth: 2.5,
  color: '#1f2937',
  background: 'transparent',
  disabled: false,
  showToolbar: true,
  placeholder: 'Sign here',
});

const emit = defineEmits<{
  begin: [];
  end: [];
  clear: [];
}>();

const model = defineModel<string>({ default: '' });

const wrapper = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const strokes = ref<Point[][]>([[]]);
const drawing = ref(false);
const { width } = useElementSize(wrapper);

let lastPoint: Point | null = null;
let lastEmitted = '';

const hasInk = computed(() => strokes.value.some((stroke) => stroke.length > 0));

function setupCanvas() {
  const element = canvas.value;
  if (!element) return;
  const cssWidth = Math.max(1, Math.round(width.value || 500));
  const cssHeight = props.height;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  element.width = Math.round(cssWidth * dpr);
  element.height = Math.round(cssHeight * dpr);
  element.style.width = `${cssWidth}px`;
  element.style.height = `${cssHeight}px`;
  redraw();
}

function redraw() {
  const element = canvas.value;
  if (!element) return;
  const context = element.getContext('2d');
  if (!context) return;

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, element.width / dpr, element.height / dpr);

  if (props.background !== 'transparent') {
    context.fillStyle = props.background;
    context.fillRect(0, 0, element.width / dpr, element.height / dpr);
  }

  context.strokeStyle = props.color;
  context.fillStyle = props.color;
  context.lineWidth = props.lineWidth;
  context.lineCap = 'round';
  context.lineJoin = 'round';

  const cssWidth = element.width / dpr;
  const cssHeight = element.height / dpr;

  for (const stroke of strokes.value) {
    if (!stroke.length) continue;
    const points = stroke.map((point) => ({ x: point.x * cssWidth, y: point.y * cssHeight }));

    if (points.length === 1) {
      const point = points[0];
      context.beginPath();
      context.arc(point.x, point.y, props.lineWidth / 2, 0, Math.PI * 2);
      context.fill();
      continue;
    }

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length - 1; index += 1) {
      const current = points[index];
      const next = points[index + 1];
      context.quadraticCurveTo(current.x, current.y, (current.x + next.x) / 2, (current.y + next.y) / 2);
    }
    const last = points[points.length - 1];
    context.lineTo(last.x, last.y);
    context.stroke();
  }
}

function pointFromEvent(event: PointerEvent): Point {
  const element = canvas.value;
  if (!element) return { x: 0, y: 0 };
  const rect = element.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height,
  };
}

function exportValue(): string {
  const element = canvas.value;
  if (!element || !hasInk.value) return '';
  return canvasToTrimmedDataUrl(element);
}

function emitValue() {
  const value = exportValue();
  lastEmitted = value;
  model.value = value;
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled) return;
  event.preventDefault();
  // A restored signature is displayed as an image. Drawing starts a fresh
  // signature, so the restored image is replaced.
  if (model.value && !hasInk.value) model.value = '';
  canvas.value?.setPointerCapture(event.pointerId);
  drawing.value = true;
  lastPoint = pointFromEvent(event);
  const lastStroke = strokes.value[strokes.value.length - 1];
  if (lastStroke && lastStroke.length === 0) {
    strokes.value = [...strokes.value.slice(0, -1), [lastPoint]];
  } else {
    strokes.value = [...strokes.value, [lastPoint]];
  }
  emit('begin');
  redraw();
}

function onPointerMove(event: PointerEvent) {
  if (!drawing.value || props.disabled) return;
  const point = pointFromEvent(event);
  if (lastPoint) {
    const distance = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);
    if (distance < 0.0015) return;
  }
  lastPoint = point;
  strokes.value[strokes.value.length - 1].push(point);
  redraw();
}

function finishStroke() {
  if (!drawing.value) return;
  drawing.value = false;
  lastPoint = null;
  emit('end');
  emitValue();
}

function clear() {
  if (props.disabled) return;
  strokes.value = [[]];
  drawing.value = false;
  lastPoint = null;
  lastEmitted = '';
  redraw();
  model.value = '';
  emit('clear');
}

function undo() {
  if (props.disabled || !hasInk.value) return;
  const next = strokes.value.slice(0, -1);
  strokes.value = next.length ? next : [[]];
  redraw();
  emitValue();
}

function reset() {
  strokes.value = [[]];
  drawing.value = false;
  lastPoint = null;
  redraw();
}

function onExternalValue(value: string | undefined) {
  if (!value) {
    if (hasInk.value) reset();
    lastEmitted = '';
    return;
  }
  // Ignore the echo of our own export; anything else is a parent-supplied
  // replacement, which supersedes the local strokes.
  if (value === lastEmitted) return;
  reset();
  lastEmitted = value;
}

watch(() => props.height, setupCanvas);
watch(() => props.lineWidth, redraw);
watch(() => props.color, redraw);
watch(() => props.background, redraw);
watch(width, setupCanvas);
watch(model, onExternalValue);

onMounted(async () => {
  await nextTick();
  setupCanvas();
});

defineExpose({
  clear,
  undo,
  isEmpty: () => !hasInk.value,
  toDataURL: exportValue,
});
</script>

<template>
  <div :class="cn('spdf grid gap-2', props.class)">
    <div
      ref="wrapper"
      class="spdf-paper relative overflow-hidden rounded-xl border border-border"
      :class="props.disabled ? 'opacity-60' : ''"
      :style="{ height: `${props.height}px` }"
    >
      <canvas
        ref="canvas"
        class="block touch-none"
        :class="props.disabled ? 'cursor-not-allowed' : 'cursor-crosshair'"
        role="img"
        :aria-label="props.placeholder"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="finishStroke"
        @pointercancel="finishStroke"
      />
      <img
        v-if="!hasInk && model"
        :src="model"
        alt="Current signature"
        class="pointer-events-none absolute inset-0 size-full object-contain p-2"
      />
      <div
        v-if="!hasInk && !model && !props.disabled"
        class="pointer-events-none absolute inset-0 grid place-items-center"
        aria-hidden="true"
      >
        <div class="grid justify-items-center gap-1 text-muted-foreground/50">
          <PenLine class="size-5" />
          <span class="text-xs font-medium">{{ props.placeholder }}</span>
        </div>
      </div>
      <div class="pointer-events-none absolute right-3 bottom-6 left-3 border-b border-dashed border-border" aria-hidden="true" />
    </div>

    <div v-if="props.showToolbar" class="flex items-center justify-between gap-2">
      <p class="text-[11px] text-muted-foreground">Draw with a mouse, finger, or stylus.</p>
      <div class="flex items-center gap-0.5">
        <Tooltip content="Undo last stroke">
          <Button variant="ghost" size="icon-sm" :disabled="props.disabled || !hasInk" aria-label="Undo last stroke" @click="undo">
            <RotateCcw />
          </Button>
        </Tooltip>
        <Tooltip content="Clear signature">
          <Button variant="ghost" size="icon-sm" :disabled="props.disabled || !hasInk" aria-label="Clear signature" @click="clear">
            <Trash2 />
          </Button>
        </Tooltip>
      </div>
    </div>
  </div>
</template>
