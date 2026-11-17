<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { FileSearch, Search, X } from '@lucide/vue';
import { cn } from '../../lib/cn';
import type { PdfSearchResults } from '../../lib/types';
import Button from '../ui/Button.vue';
import Input from '../ui/Input.vue';
import Spinner from '../ui/Spinner.vue';
import Tooltip from '../ui/Tooltip.vue';

interface Props {
  modelValue: string;
  results: PdfSearchResults | null;
  searching: boolean;
  class?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  select: [page: number];
  close: [];
}>();

const panel = ref<HTMLElement | null>(null);

onMounted(async () => {
  await nextTick();
  panel.value?.querySelector<HTMLInputElement>('input')?.focus();
});

const groups = computed(() => {
  const results = props.results;
  if (!results) return [];
  const map = new Map<number, { page: number; matches: typeof results.matches }>();
  for (const match of results.matches) {
    const entry = map.get(match.page) ?? { page: match.page, matches: [] };
    entry.matches.push(match);
    map.set(match.page, entry);
  }
  return [...map.values()];
});

function parts(snippet: string) {
  const query = props.modelValue.trim();
  if (!query) return [{ text: snippet, match: false }];
  const lower = snippet.toLowerCase();
  const needle = query.toLowerCase();
  const output: { text: string; match: boolean }[] = [];
  let from = 0;

  while (from < snippet.length) {
    const at = lower.indexOf(needle, from);
    if (at === -1) {
      output.push({ text: snippet.slice(from), match: false });
      break;
    }
    if (at > from) output.push({ text: snippet.slice(from, at), match: false });
    output.push({ text: snippet.slice(at, at + query.length), match: true });
    from = at + query.length;
  }

  return output;
}
</script>

<template>
  <div
    ref="panel"
    :class="
      cn(
        'spdf absolute top-3 right-3 z-20 flex max-h-[calc(100%-1.5rem)] w-80 max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl',
        props.class,
      )
    "
    role="search"
    aria-label="Search document"
    @keydown.esc="emit('close')"
  >
    <div class="flex items-center gap-2 border-b border-border p-3">
      <div class="relative min-w-0 flex-1">
        <Search class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          :model-value="props.modelValue"
          placeholder="Search this document…"
          class="h-8 pr-8 pl-8 text-xs"
          aria-label="Search query"
          @update:model-value="emit('update:modelValue', String($event))"
        />
        <button
          v-if="props.modelValue"
          type="button"
          class="absolute top-1/2 right-1.5 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          aria-label="Clear search"
          @click="emit('update:modelValue', '')"
        >
          <X class="size-3.5" aria-hidden="true" />
        </button>
      </div>
      <Tooltip content="Close search">
        <Button variant="ghost" size="icon-sm" aria-label="Close search" @click="emit('close')">
          <X />
        </Button>
      </Tooltip>
    </div>

    <div class="flex items-center justify-between gap-2 px-3 py-2 text-[11px] text-muted-foreground" aria-live="polite">
      <span class="inline-flex items-center gap-1.5">
        <Spinner v-if="props.searching" :size="12" label="Searching" />
        <template v-if="props.searching">Searching…</template>
        <template v-else-if="props.results && props.modelValue.trim().length >= 2">
          <template v-if="props.results.truncated">
            Showing first {{ props.results.matches.length }}
            {{ props.results.matches.length === 1 ? 'match' : 'matches' }}
          </template>
          <template v-else>
            {{ props.results.total }} {{ props.results.total === 1 ? 'match' : 'matches' }}
          </template>
        </template>
        <template v-else-if="props.modelValue.trim().length === 1">Type at least 2 characters</template>
        <template v-else>Search text across every page</template>
      </span>
    </div>

    <div class="spdf-scroll min-h-0 flex-1 overflow-y-auto border-t border-border">
      <div v-if="groups.length && props.modelValue.trim().length >= 2" class="divide-y divide-border">
        <section v-for="group in groups" :key="group.page">
          <div class="sticky top-0 z-10 flex items-center justify-between bg-popover/95 px-3 py-1.5 backdrop-blur">
            <button
              type="button"
              class="text-[11px] font-semibold text-foreground underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              @click="emit('select', group.page)"
            >
              Page {{ group.page }}
            </button>
            <span class="text-[10px] text-muted-foreground">{{ group.matches.length }}</span>
          </div>
          <button
            v-for="match in group.matches"
            :key="match.index"
            type="button"
            class="block w-full px-3 py-2 text-left text-xs leading-relaxed text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none"
            @click="emit('select', match.page)"
          >
            <template v-for="(part, index) in parts(match.snippet)" :key="index">
              <mark v-if="part.match" class="rounded-[2px] bg-pdf-highlight px-0.5 text-foreground">{{ part.text }}</mark>
              <template v-else>{{ part.text }}</template>
            </template>
          </button>
        </section>
      </div>

      <div v-else-if="props.results && props.modelValue.trim().length >= 2 && !props.searching" class="grid justify-items-center gap-2 px-6 py-10 text-center">
        <FileSearch class="size-6 text-muted-foreground/60" aria-hidden="true" />
        <p class="text-xs font-medium text-foreground">No matches found</p>
        <p class="text-[11px] text-muted-foreground">Try a shorter word or a different spelling.</p>
      </div>

      <div v-else class="grid justify-items-center gap-2 px-6 py-10 text-center">
        <Search class="size-6 text-muted-foreground/50" aria-hidden="true" />
        <p class="text-[11px] text-muted-foreground">Results appear as you type.</p>
      </div>
    </div>
  </div>
</template>
