<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { PDFPageProxy } from 'pdfjs-dist';
import {
  ArrowLeft,
  ArrowRight,
  CheckCheck,
  Copy,
  GalleryHorizontal,
  GripVertical,
  ListRestart,
  Plus,
  RotateCcw,
  RotateCw,
  SquareDashed,
  Trash2,
  Undo2,
  Redo2,
  X,
} from '@lucide/vue';
import { usePdfDocument } from '../../composables/usePdfDocument';
import { cn } from '../../lib/cn';
import { isPdfPasswordError, normalizeRotation, pageRotation } from '../../lib/pdf';
import { updateSelection } from '../../lib/selection';
import type { PageOrganizerItem, PdfSource } from '../../lib/types';
import Alert from '../ui/Alert.vue';
import Button from '../ui/Button.vue';
import EmptyState from '../ui/EmptyState.vue';
import Popover from '../ui/Popover.vue';
import Skeleton from '../ui/Skeleton.vue';
import Slider from '../ui/Slider.vue';
import Tooltip from '../ui/Tooltip.vue';
import PdfThumbnail from './PdfThumbnail.vue';

interface Props {
  source?: PdfSource | null;
  pageCount?: number;
  columns?: number | 'auto';
  thumbnailWidth?: number;
  showToolbar?: boolean;
  disabled?: boolean;
  maxHistory?: number;
  password?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  columns: 'auto',
  thumbnailWidth: 150,
  showToolbar: true,
  disabled: false,
  maxHistory: 50,
});

const emit = defineEmits<{
  change: [items: PageOrganizerItem[]];
  selectionChange: [ids: string[]];
  rotate: [ids: string[], delta: number];
  remove: [ids: string[]];
  duplicate: [ids: string[]];
  addBlank: [afterId: string | null];
  reorder: [items: PageOrganizerItem[]];
  reset: [];
}>();

const items = defineModel<PageOrganizerItem[]>({ default: () => [] });
const selectedIds = ref<string[]>([]);
const anchor = ref<string | null>(null);
const thumbnailSize = ref(props.thumbnailWidth);
const blankAspect = ref(0.707);
const hasInitialized = ref(false);
const hasUserModified = ref(false);

watch(
  () => props.thumbnailWidth,
  (value) => {
    thumbnailSize.value = value;
  },
);

const { doc, numPages, loading, error } = usePdfDocument(() => props.source ?? null, {
  password: () => props.password,
});
const resolvedPageCount = computed(() => props.pageCount ?? numPages.value ?? 0);
const passwordError = computed(() => isPdfPasswordError(error.value));

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `slot-${Date.now().toString(36)}-${idCounter}`;
}

function defaultItems(count: number): PageOrganizerItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `page-${index + 1}`,
    page: index + 1,
    rotation: 0,
  }));
}

watch(
  resolvedPageCount,
  (count) => {
    if (!count) return;
    if (!hasInitialized.value) {
      hasInitialized.value = true;
      if (!items.value.length) {
        items.value = defaultItems(count);
      } else {
        hasUserModified.value = true;
      }
      return;
    }
    if (!hasUserModified.value && items.value.length !== count) {
      items.value = defaultItems(count);
    }
  },
  { immediate: true },
);

watch(
  () => props.source,
  () => {
    hasInitialized.value = false;
    hasUserModified.value = false;
    selectedIds.value = [];
    anchor.value = null;
    past.value = [];
    future.value = [];
    items.value = props.pageCount ? defaultItems(props.pageCount) : [];
    hasInitialized.value = !!props.pageCount;
  },
);

watch(doc, async (document) => {
  if (!document) return;
  try {
    const page: PDFPageProxy = await document.getPage(1);
    const viewport = page.getViewport({ scale: 1, rotation: pageRotation(page, 0) });
    blankAspect.value = viewport.width / viewport.height;
  } catch {
    blankAspect.value = 0.707;
  }
});

const selectedSet = computed(() => new Set(selectedIds.value));
const allIds = computed(() => items.value.map((item) => item.id));

watch(items, (list) => {
  const ids = new Set(list.map((item) => item.id));
  const next = selectedIds.value.filter((id) => ids.has(id));
  if (next.length !== selectedIds.value.length) selectedIds.value = next;
});

const rotationCount = computed(() => items.value.filter((item) => normalizeRotation(item.rotation) !== 0).length);
const blankCount = computed(() => items.value.filter((item) => item.blank).length);
const duplicateCount = computed(() => {
  const pages = items.value.filter((item) => !item.blank).map((item) => item.page);
  return Math.max(0, pages.length - new Set(pages).size);
});
const isDirty = computed(() => {
  const original = defaultItems(resolvedPageCount.value);
  if (items.value.length !== original.length) return true;
  return items.value.some((item, index) => {
    const base = original[index];
    return !base || item.blank || item.page !== base.page || normalizeRotation(item.rotation) !== 0;
  });
});

const gridStyle = computed(() => ({
  gridTemplateColumns:
    props.columns === 'auto'
      ? `repeat(auto-fill, minmax(${thumbnailSize.value}px, 1fr))`
      : `repeat(${props.columns}, minmax(0, 1fr))`,
}));

// ----- History -------------------------------------------------------------
interface Snapshot {
  items: PageOrganizerItem[];
  selected: string[];
}

const past = ref<Snapshot[]>([]);
const future = ref<Snapshot[]>([]);
const canUndo = computed(() => past.value.length > 0);
const canRedo = computed(() => future.value.length > 0);

function snapshot(): Snapshot {
  return {
    items: items.value.map((item) => ({ ...item })),
    selected: [...selectedIds.value],
  };
}

function restore(state: Snapshot) {
  const next = state.items.map((item) => ({ ...item }));
  items.value = next;
  selectedIds.value = state.selected.filter((id) => next.some((item) => item.id === id));
  anchor.value = null;
  hasUserModified.value = true;
  emit('change', next);
}

function pushHistory() {
  past.value.push(snapshot());
  if (past.value.length > props.maxHistory) past.value.shift();
  future.value = [];
}

function mutate(fn: () => PageOrganizerItem[], event?: () => void) {
  if (props.disabled) return;
  pushHistory();
  const next = fn();
  items.value = next;
  hasUserModified.value = true;
  emit('change', next);
  event?.();
}

function undo() {
  if (props.disabled) return;
  const previous = past.value.pop();
  if (!previous) return;
  future.value.push(snapshot());
  restore(previous);
}

function redo() {
  if (props.disabled) return;
  const next = future.value.pop();
  if (!next) return;
  past.value.push(snapshot());
  restore(next);
}

// ----- Selection -----------------------------------------------------------
function selectItem(item: PageOrganizerItem, event: MouseEvent) {
  if (props.disabled) return;
  const result = updateSelection(selectedIds.value, item.id, allIds.value, anchor.value, {
    range: event.shiftKey,
    additive: event.metaKey || event.ctrlKey,
  });
  selectedIds.value = result.selection;
  anchor.value = result.anchor;
  emit('selectionChange', selectedIds.value);
}

function onThumbnailSelect(item: PageOrganizerItem, event: MouseEvent) {
  selectItem(item, event);
}

function selectAll() {
  selectedIds.value = [...allIds.value];
  anchor.value = allIds.value[0] ?? null;
  emit('selectionChange', selectedIds.value);
}

function clearSelection() {
  selectedIds.value = [];
  anchor.value = null;
  emit('selectionChange', selectedIds.value);
}

function invertSelection() {
  selectedIds.value = allIds.value.filter((id) => !selectedSet.value.has(id));
  anchor.value = null;
  emit('selectionChange', selectedIds.value);
}

// ----- Page operations -----------------------------------------------------
function targetIds(): string[] {
  return selectedIds.value.length ? selectedIds.value : [];
}

function rotateSelection(delta: number) {
  const ids = targetIds();
  if (!ids.length) return;
  const next = items.value.map((item) =>
    ids.includes(item.id) ? { ...item, rotation: normalizeRotation(item.rotation + delta) } : item,
  );
  mutate(() => next, () => emit('rotate', ids, delta));
}

function deleteSelection() {
  const ids = targetIds();
  if (!ids.length) return;
  const next = items.value.filter((item) => !ids.includes(item.id));
  mutate(() => next, () => {
    selectedIds.value = [];
    emit('remove', ids);
    emit('selectionChange', selectedIds.value);
  });
}

function deleteItem(item: PageOrganizerItem) {
  const next = items.value.filter((entry) => entry.id !== item.id);
  mutate(() => next, () => {
    selectedIds.value = selectedIds.value.filter((id) => id !== item.id);
    emit('remove', [item.id]);
    emit('selectionChange', selectedIds.value);
  });
}

function duplicateSelection() {
  const ids = targetIds();
  if (!ids.length) return;
  const selected = items.value.filter((item) => ids.includes(item.id));
  if (!selected.length) return;

  const lastIndex = Math.max(...selected.map((item) => items.value.findIndex((entry) => entry.id === item.id)));
  const copies = selected.map((item) => ({ ...item, id: nextId() }));
  const next = [...items.value];
  next.splice(lastIndex + 1, 0, ...copies);

  mutate(() => next, () => {
    selectedIds.value = copies.map((item) => item.id);
    anchor.value = selectedIds.value[0] ?? null;
    emit('duplicate', ids);
    emit('selectionChange', selectedIds.value);
  });
}

function addBlank() {
  const selectedIndex = selectedIds.value.length
    ? Math.max(...selectedIds.value.map((id) => items.value.findIndex((item) => item.id === id)))
    : -1;
  const afterId =
    selectedIndex >= 0
      ? items.value[selectedIndex]?.id ?? null
      : items.value[items.value.length - 1]?.id ?? null;

  const blank: PageOrganizerItem = { id: nextId(), page: 0, rotation: 0, blank: true };
  const index = afterId ? items.value.findIndex((item) => item.id === afterId) : items.value.length - 1;
  const next = [...items.value];
  next.splice(index + 1, 0, blank);

  mutate(() => next, () => {
    selectedIds.value = [blank.id];
    anchor.value = blank.id;
    emit('addBlank', afterId);
    emit('selectionChange', selectedIds.value);
  });
}

function reset() {
  if (!resolvedPageCount.value) return;
  const next = defaultItems(resolvedPageCount.value);
  mutate(() => next, () => {
    selectedIds.value = [];
    anchor.value = null;
    emit('reset');
    emit('selectionChange', selectedIds.value);
  });
}

function moveBy(id: string, offset: number) {
  const index = items.value.findIndex((item) => item.id === id);
  const target = index + offset;
  if (index === -1 || target < 0 || target >= items.value.length) return;
  const next = [...items.value];
  const [moved] = next.splice(index, 1);
  if (!moved) return;
  next.splice(target, 0, moved);
  mutate(() => next);
}

function moveSelection(direction: -1 | 1) {
  const ids = new Set(selectedIds.value);
  if (!ids.size) return;

  const next = [...items.value];
  const positions = next
    .map((item, index) => (ids.has(item.id) ? index : -1))
    .filter((index) => index >= 0);

  if (direction < 0) {
    for (const index of positions) {
      if (index === 0 || ids.has(next[index - 1].id)) continue;
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
    }
  } else {
    for (const index of [...positions].reverse()) {
      if (index >= next.length - 1 || ids.has(next[index + 1].id)) continue;
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
    }
  }

  mutate(() => next);
}

// ----- Drag reorder --------------------------------------------------------
const dragId = ref<string | null>(null);
const overId = ref<string | null>(null);
const dropPosition = ref<'before' | 'after'>('before');

function onDragStart(item: PageOrganizerItem, event: DragEvent) {
  if (props.disabled) return;
  dragId.value = item.id;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', item.id);
  }
}

function onDragOver(item: PageOrganizerItem, event: DragEvent) {
  if (!dragId.value || dragId.value === item.id) return;
  event.preventDefault();
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  overId.value = item.id;
  dropPosition.value = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
}

function onDrop(target: PageOrganizerItem) {
  const dragged = dragId.value;
  dragId.value = null;
  overId.value = null;
  if (!dragged || dragged === target.id) return;
  if (selectedSet.value.has(dragged) && selectedSet.value.has(target.id)) return;

  const movingIds = selectedSet.value.has(dragged) ? [...selectedIds.value] : [dragged];
  const moving = items.value.filter((item) => movingIds.includes(item.id));
  if (!moving.length) return;

  const remaining = items.value.filter((item) => !movingIds.includes(item.id));
  let index = remaining.findIndex((item) => item.id === target.id);
  if (index === -1) index = remaining.length;
  else if (dropPosition.value === 'after') index += 1;
  const next = [...remaining.slice(0, index), ...moving, ...remaining.slice(index)];

  mutate(() => next, () => emit('reorder', next));
}

function onDragEnd() {
  dragId.value = null;
  overId.value = null;
}

// ----- Keyboard ------------------------------------------------------------
const root = ref<HTMLElement | null>(null);

function onWindowKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  const active = document.activeElement as HTMLElement | null;
  if (!root.value || !active || !root.value.contains(active)) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) return;
  if (active.isContentEditable) return;

  const mod = event.metaKey || event.ctrlKey;
  if (mod && event.key.toLowerCase() === 'z') {
    event.preventDefault();
    if (event.shiftKey) redo();
    else undo();
  } else if (mod && event.key.toLowerCase() === 'a') {
    event.preventDefault();
    selectAll();
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    if (selectedIds.value.length) {
      event.preventDefault();
      deleteSelection();
    }
  } else if (!mod && event.key.toLowerCase() === 'r') {
    if (selectedIds.value.length) {
      event.preventDefault();
      rotateSelection(event.shiftKey ? -90 : 90);
    }
  } else if (!mod && event.key.toLowerCase() === 'd') {
    if (selectedIds.value.length) {
      event.preventDefault();
      duplicateSelection();
    }
  }
}

onMounted(() => window.addEventListener('keydown', onWindowKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onWindowKeydown));

function blankAspectFor(item: PageOrganizerItem): number {
  const rotation = normalizeRotation(item.rotation);
  return rotation === 90 || rotation === 270 ? 1 / blankAspect.value : blankAspect.value;
}

const summary = computed(() => {
  const parts = [`${items.value.length} ${items.value.length === 1 ? 'page' : 'pages'}`];
  if (rotationCount.value) parts.push(`${rotationCount.value} rotated`);
  if (blankCount.value) parts.push(`${blankCount.value} blank`);
  if (duplicateCount.value) parts.push(`${duplicateCount.value} duplicated`);
  return parts.join(' · ');
});
</script>

<template>
  <div ref="root" :class="cn('spdf flex flex-col gap-3', props.class)">
    <div
      v-if="props.showToolbar"
      class="sticky top-0 z-20 flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background/95 p-1.5 shadow-xs backdrop-blur"
      role="toolbar"
      aria-label="Page tools"
    >
      <div class="flex min-w-0 items-center gap-1.5 px-1">
        <span class="spdf-tabular rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground" aria-live="polite">
          {{ selectedIds.length ? `${selectedIds.length} selected` : summary }}
        </span>
        <button
          v-if="selectedIds.length"
          type="button"
          class="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          aria-label="Clear selection"
          @click="clearSelection"
        >
          <X class="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <span class="hidden h-5 w-px bg-border sm:block" />

      <div class="flex items-center gap-0.5">
        <Tooltip content="Select all pages (Ctrl/Cmd+A)">
          <Button variant="ghost" size="icon-sm" :disabled="props.disabled || !items.length" aria-label="Select all pages" @click="selectAll">
            <CheckCheck />
          </Button>
        </Tooltip>
        <Tooltip content="Invert selection">
          <Button variant="ghost" size="icon-sm" :disabled="props.disabled || !items.length" aria-label="Invert selection" @click="invertSelection">
            <SquareDashed />
          </Button>
        </Tooltip>
      </div>

      <span class="hidden h-5 w-px bg-border sm:block" />

      <div class="flex items-center gap-0.5">
        <Tooltip content="Rotate left (Shift+R)">
          <Button variant="ghost" size="icon-sm" :disabled="props.disabled || !selectedIds.length" aria-label="Rotate selected pages left" @click="rotateSelection(-90)">
            <RotateCcw />
          </Button>
        </Tooltip>
        <Tooltip content="Rotate right (R)">
          <Button variant="ghost" size="icon-sm" :disabled="props.disabled || !selectedIds.length" aria-label="Rotate selected pages right" @click="rotateSelection(90)">
            <RotateCw />
          </Button>
        </Tooltip>
        <Tooltip content="Duplicate (D)">
          <Button variant="ghost" size="icon-sm" :disabled="props.disabled || !selectedIds.length" aria-label="Duplicate selected pages" @click="duplicateSelection">
            <Copy />
          </Button>
        </Tooltip>
        <Tooltip content="Move selected left">
          <Button variant="ghost" size="icon-sm" :disabled="props.disabled || !selectedIds.length" aria-label="Move selected pages left" @click="moveSelection(-1)">
            <ArrowLeft />
          </Button>
        </Tooltip>
        <Tooltip content="Move selected right">
          <Button variant="ghost" size="icon-sm" :disabled="props.disabled || !selectedIds.length" aria-label="Move selected pages right" @click="moveSelection(1)">
            <ArrowRight />
          </Button>
        </Tooltip>
        <Tooltip content="Add blank page">
          <Button variant="ghost" size="icon-sm" :disabled="props.disabled" aria-label="Add a blank page" @click="addBlank">
            <Plus />
          </Button>
        </Tooltip>
        <Tooltip content="Delete selected (Del)">
          <Button
            variant="ghost"
            size="icon-sm"
            class="text-destructive hover:bg-destructive/10 hover:text-destructive"
            :disabled="props.disabled || !selectedIds.length"
            aria-label="Delete selected pages"
            @click="deleteSelection"
          >
            <Trash2 />
          </Button>
        </Tooltip>
      </div>

      <span class="hidden h-5 w-px bg-border sm:block" />

      <div class="flex items-center gap-0.5">
        <Tooltip content="Undo (Ctrl/Cmd+Z)">
          <Button variant="ghost" size="icon-sm" :disabled="props.disabled || !canUndo" aria-label="Undo" @click="undo">
            <Undo2 />
          </Button>
        </Tooltip>
        <Tooltip content="Redo (Shift+Ctrl/Cmd+Z)">
          <Button variant="ghost" size="icon-sm" :disabled="props.disabled || !canRedo" aria-label="Redo" @click="redo">
            <Redo2 />
          </Button>
        </Tooltip>
        <Tooltip content="Reset to original order">
          <Button variant="ghost" size="icon-sm" :disabled="props.disabled || !isDirty" aria-label="Reset pages" @click="reset">
            <ListRestart />
          </Button>
        </Tooltip>
      </div>

      <div class="ml-auto flex items-center gap-1">
        <Popover side="bottom" align="end">
          <template #trigger>
            <Button variant="ghost" size="icon-sm" :disabled="props.disabled" aria-label="Thumbnail size">
              <GalleryHorizontal />
            </Button>
          </template>
          <div class="grid w-48 gap-3">
            <Slider
              v-model="thumbnailSize"
              :min="110"
              :max="240"
              :step="10"
              label="Thumbnail size"
              show-value
              suffix="px"
              :disabled="props.disabled"
            />
          </div>
        </Popover>
      </div>
    </div>

    <Alert
      v-if="passwordError"
      variant="warning"
      title="This PDF is password protected"
      class="mb-3"
    >
      Pass the open password with the <code class="font-mono text-[11px]">password</code> prop to
      preview and organize its pages.
    </Alert>

    <div class="rounded-xl border border-border bg-muted/20 p-3 sm:p-4">
      <div v-if="loading && !items.length" class="grid gap-4" :style="gridStyle">
        <Skeleton v-for="index in 6" :key="index" class="aspect-[0.707] w-full rounded-sm" />
      </div>

      <EmptyState
        v-else-if="!items.length"
        title="No pages left"
        description="Reset the page list to restore the original document."
        compact
      >
        <template #actions>
          <Button size="sm" variant="outline" :disabled="props.disabled" @click="reset">Reset pages</Button>
        </template>
      </EmptyState>

      <div v-else class="grid items-start gap-x-3 gap-y-5" :style="gridStyle">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          class="group relative min-w-0"
          @dragover="onDragOver(item, $event)"
          @drop.prevent="onDrop(item)"
          @keydown.alt.left.prevent="moveBy(item.id, -1)"
          @keydown.alt.right.prevent="moveBy(item.id, 1)"
        >
          <span
            v-if="overId === item.id"
            :class="
              cn(
                'pointer-events-none absolute inset-x-0 z-20 h-0.5 rounded-full bg-primary shadow-[0_0_0_2px_var(--background)]',
                dropPosition === 'before' ? '-top-2' : '-bottom-2',
              )
            "
          />

          <button
            type="button"
            :draggable="!props.disabled"
            :disabled="props.disabled"
            class="absolute top-1 left-1 z-10 inline-flex size-6 cursor-grab items-center justify-center rounded-md border border-border bg-background/95 text-muted-foreground opacity-0 shadow-xs transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
            :aria-label="`Reorder page ${index + 1}. Use Alt plus arrow keys to move.`"
            @dragstart="onDragStart(item, $event)"
            @dragend="onDragEnd"
          >
            <GripVertical class="size-3.5" aria-hidden="true" />
          </button>

          <div v-if="item.blank" class="w-full">
            <button
              type="button"
              :disabled="props.disabled"
              :aria-pressed="selectedSet.has(item.id)"
              :aria-label="`Blank page ${index + 1}`"
              class="spdf-paper relative block w-full overflow-hidden rounded-sm border border-dashed border-pdf-page-border transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
              :class="selectedSet.has(item.id) ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''"
              :style="{ aspectRatio: `${blankAspectFor(item)}` }"
              @click="selectItem(item, $event)"
            >
              <span class="grid size-full place-items-center bg-pdf-page">
                <span class="rounded-full border border-border bg-background/95 px-2 py-1 text-[10px] font-medium text-muted-foreground">Blank</span>
              </span>
              <span
                v-if="selectedSet.has(item.id)"
                class="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm"
                aria-hidden="true"
              >
                <svg viewBox="0 0 16 16" class="size-3" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M3.5 8.5l3 3 6-7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </button>
          </div>

          <PdfThumbnail
            v-else
            :source="props.source ?? null"
            :page="item.page"
            :item-id="item.id"
            :width="thumbnailSize"
            :rotation="item.rotation"
            :selected="selectedSet.has(item.id)"
            selectable
            :disabled="props.disabled"
            :show-number="false"
            :lazy="true"
            :password="props.password"
            fluid
            @select="onThumbnailSelect(item, $event.event)"
          />

          <div class="mt-1.5 flex h-4 items-center justify-between gap-2 px-0.5">
            <span class="spdf-tabular text-[11px] font-semibold text-foreground">{{ index + 1 }}</span>
            <span class="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span v-if="item.blank">Blank</span>
              <span v-else-if="item.page !== index + 1">p. {{ item.page }}</span>
              <span v-if="item.rotation" class="rounded bg-muted px-1 text-[9px]">{{ normalizeRotation(item.rotation) }}°</span>
            </span>
          </div>

          <button
            type="button"
            :disabled="props.disabled"
            class="absolute top-1 left-8 z-10 inline-flex size-6 items-center justify-center rounded-md border border-border bg-background/95 text-muted-foreground opacity-0 shadow-xs transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-30"
            :aria-label="`Delete page ${index + 1}`"
            @click.stop="deleteItem(item)"
          >
            <X class="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-2 px-0.5 text-[11px] text-muted-foreground">
      <span>{{ summary }}</span>
      <span v-if="selectedIds.length" class="text-foreground">{{ selectedIds.length }} selected</span>
      <span v-else>Drag the grip to reorder · Arrow buttons move the selection · Shift-click selects a range</span>
    </div>
  </div>
</template>
