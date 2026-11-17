<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { GripVertical } from '@lucide/vue';
import { cn } from '../../lib/cn';
import { inDocumentOrder, updateSelection } from '../../lib/selection';
import type { PdfFileDescriptor } from '../../lib/types';
import EmptyState from '../ui/EmptyState.vue';
import PdfFileCard from './PdfFileCard.vue';

interface Props {
  reorderable?: boolean;
  removable?: boolean;
  selectable?: boolean;
  dense?: boolean;
  disabled?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  ariaLabel?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  reorderable: false,
  removable: true,
  selectable: false,
  dense: false,
  disabled: false,
  emptyTitle: 'No files yet',
  emptyDescription: 'Drop a PDF above or add one to get started.',
  ariaLabel: 'Files',
});

const emit = defineEmits<{
  remove: [file: PdfFileDescriptor];
  open: [file: PdfFileDescriptor];
  retry: [file: PdfFileDescriptor];
  select: [payload: { file: PdfFileDescriptor; selectedIds: string[] }];
  reorder: [files: PdfFileDescriptor[]];
}>();

const files = defineModel<PdfFileDescriptor[]>({ default: () => [] });
const selectedIds = defineModel<string[]>('selectedIds', { default: () => [] });
const anchor = ref<string | null>(null);

const dragId = ref<string | null>(null);
const overId = ref<string | null>(null);
const dropPosition = ref<'before' | 'after'>('before');

const selectedSet = computed(() => new Set(selectedIds.value));

watch(files, (list) => {
  const ids = new Set(list.map((file) => file.id));
  const next = selectedIds.value.filter((id) => ids.has(id));
  if (next.length !== selectedIds.value.length) selectedIds.value = next;
});

function onSelect(file: PdfFileDescriptor, event: MouseEvent | undefined, source: 'checkbox' | 'row') {
  if (!props.selectable || props.disabled) return;

  const all = files.value.map((entry) => entry.id);
  const additive = source === 'checkbox' || !!event?.metaKey || !!event?.ctrlKey;
  const range = !!event?.shiftKey;
  const result = updateSelection(selectedIds.value, file.id, all, anchor.value, { additive, range });
  const next = inDocumentOrder(result.selection, all);

  selectedIds.value = next;
  anchor.value = result.anchor;
  emit('select', { file, selectedIds: next });
}

function onCheckboxSelect(file: PdfFileDescriptor, event: MouseEvent | undefined) {
  onSelect(file, event, 'checkbox');
}

function clearSelection() {
  selectedIds.value = [];
  anchor.value = null;
}

function reorderByOffset(id: string, offset: number) {
  if (props.disabled) return;
  const current = files.value;
  const from = current.findIndex((file) => file.id === id);
  const to = from + offset;
  if (from === -1 || to < 0 || to >= current.length) return;

  const next = [...current];
  const [moved] = next.splice(from, 1);
  if (!moved) return;
  next.splice(to, 0, moved);
  files.value = next;
  emit('reorder', next);
}

function onDragStart(file: PdfFileDescriptor, event: DragEvent) {
  if (!props.reorderable || props.disabled) return;
  dragId.value = file.id;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', file.id);
  }
}

function onDragOver(file: PdfFileDescriptor, event: DragEvent) {
  if (!props.reorderable || !dragId.value || dragId.value === file.id) return;
  event.preventDefault();
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  overId.value = file.id;
  dropPosition.value = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
}

function onDrop(file: PdfFileDescriptor) {
  const dragged = dragId.value;
  dragId.value = null;
  overId.value = null;
  if (!dragged || dragged === file.id) return;

  const current = [...files.value];
  const from = current.findIndex((entry) => entry.id === dragged);
  if (from === -1) return;
  const [moved] = current.splice(from, 1);
  if (!moved) return;

  const targetIndex = current.findIndex((entry) => entry.id === file.id);
  const insertAt = dropPosition.value === 'after' ? targetIndex + 1 : targetIndex;
  current.splice(insertAt, 0, moved);
  files.value = current;
  emit('reorder', current);
}

function onDragEnd() {
  dragId.value = null;
  overId.value = null;
}

function onGripKeydown(file: PdfFileDescriptor, event: KeyboardEvent) {
  if (props.disabled || !event.altKey) return;
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    reorderByOffset(file.id, -1);
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    reorderByOffset(file.id, 1);
  }
}
</script>

<template>
  <div :class="cn('spdf', props.class)">
    <div v-if="props.selectable && selectedIds.length" class="mb-2 flex items-center justify-between px-0.5 text-xs" aria-live="polite">
      <span class="font-medium text-foreground">{{ selectedIds.length }} selected</span>
      <button
        type="button"
        :disabled="props.disabled"
        class="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        @click="clearSelection"
      >
        Clear selection
      </button>
    </div>

    <EmptyState
      v-if="!files.length"
      :title="props.emptyTitle"
      :description="props.emptyDescription"
      compact
    />

    <TransitionGroup
      v-else
      tag="ul"
      name="spdf-list"
      :aria-label="props.ariaLabel"
      class="relative grid gap-2"
    >
      <li
        v-for="file in files"
        :key="file.id"
        class="relative flex items-stretch gap-1.5"
        @dragover="onDragOver(file, $event)"
        @drop.prevent="onDrop(file)"
      >
        <span
          v-if="overId === file.id"
          :class="
            cn(
              'pointer-events-none absolute inset-x-1 z-10 h-0.5 rounded-full bg-primary shadow-[0_0_0_2px_var(--background)]',
              dropPosition === 'before' ? '-top-1' : '-bottom-1',
            )
          "
        />
        <button
          v-if="props.reorderable"
          type="button"
          :draggable="!props.disabled"
          :disabled="props.disabled"
          class="mt-1 inline-flex h-10 w-6 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
          :aria-label="`Reorder ${file.name}. Use Alt plus arrow up or down to move.`"
          @dragstart="onDragStart(file, $event)"
          @dragend="onDragEnd"
          @keydown="onGripKeydown(file, $event)"
        >
          <GripVertical class="size-4" aria-hidden="true" />
        </button>

        <PdfFileCard
          :file="file"
          :selected="selectedSet.has(file.id)"
          :selectable="props.selectable"
          :removable="props.removable"
          :disabled="props.disabled"
          :dense="props.dense"
          class="min-w-0 flex-1"
          @remove="emit('remove', $event)"
          @open="emit('open', $event)"
          @retry="emit('retry', $event)"
          @select="onCheckboxSelect"
        >
          <template v-if="$slots.actions" #actions="slotProps">
            <slot name="actions" v-bind="slotProps" />
          </template>
        </PdfFileCard>
      </li>
    </TransitionGroup>
  </div>
</template>
