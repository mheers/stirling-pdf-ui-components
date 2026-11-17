<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Search, X } from '@lucide/vue';
import { cn } from '../../lib/cn';
import type { PdfTool } from '../../lib/types';
import EmptyState from '../ui/EmptyState.vue';
import Input from '../ui/Input.vue';
import Skeleton from '../ui/Skeleton.vue';
import PdfToolCard from './PdfToolCard.vue';

interface Props {
  tools: PdfTool[];
  searchable?: boolean;
  categories?: string[];
  placeholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  minCardWidth?: number;
  loading?: boolean;
  groupByCategory?: boolean;
  showCount?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  searchable: true,
  placeholder: 'Search tools…',
  emptyTitle: 'No tools found',
  emptyDescription: 'Try a different search or choose another category.',
  minCardWidth: 230,
  loading: false,
  groupByCategory: false,
  showCount: true,
});

const emit = defineEmits<{ select: [tool: PdfTool] }>();
const query = defineModel<string>('query', { default: '' });

const activeCategory = ref('all');

const categories = computed(() => {
  if (props.categories?.length) return props.categories;
  return [...new Set(props.tools.map((tool) => tool.category).filter((value): value is string => !!value))].sort();
});

watch(categories, (list) => {
  if (activeCategory.value !== 'all' && !list.includes(activeCategory.value)) {
    activeCategory.value = 'all';
  }
});

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase();
  return props.tools.filter((tool) => {
    if (activeCategory.value !== 'all' && tool.category !== activeCategory.value) return false;
    if (!needle) return true;
    const haystack = [tool.name, tool.description, tool.category, ...(tool.keywords ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });
});

const groups = computed(() => {
  if (!props.groupByCategory) return [];
  const map = new Map<string, PdfTool[]>();
  for (const tool of filtered.value) {
    const category = tool.category ?? 'Other';
    const list = map.get(category) ?? [];
    list.push(tool);
    map.set(category, list);
  }
  return [...map.entries()].map(([name, tools]) => ({ name, tools })).sort((a, b) => a.name.localeCompare(b.name));
});

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(auto-fill, minmax(${props.minCardWidth}px, 1fr))`,
}));
</script>

<template>
  <div :class="cn('spdf flex flex-col gap-4', props.class)">
    <div v-if="props.searchable || categories.length" class="flex flex-col gap-3">
      <div v-if="props.searchable" class="relative">
        <Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/70" aria-hidden="true" />
        <Input
          v-model="query"
          type="search"
          :placeholder="props.placeholder"
          class="h-10 pr-9 pl-9"
          aria-label="Search tools"
        />
        <button
          v-if="query"
          type="button"
          class="absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          aria-label="Clear search"
          @click="query = ''"
        >
          <X class="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <div v-if="categories.length" class="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          :aria-pressed="activeCategory === 'all'"
          :class="
            cn(
              'inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
              activeCategory === 'all'
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground',
            )
          "
          @click="activeCategory = 'all'"
        >
          All
        </button>
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          :aria-pressed="activeCategory === category"
          :class="
            cn(
              'inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
              activeCategory === category
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground',
            )
          "
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
        <span v-if="props.showCount" class="ml-auto text-[11px] text-muted-foreground" aria-live="polite">
          {{ filtered.length }} {{ filtered.length === 1 ? 'tool' : 'tools' }}
        </span>
      </div>
    </div>

    <div v-if="props.loading" class="grid gap-3" :style="gridStyle">
      <div v-for="index in 6" :key="index" class="grid gap-3 rounded-xl border border-border bg-card p-4">
        <Skeleton class="size-10 rounded-lg" />
        <Skeleton class="h-4 w-2/3" />
        <Skeleton class="h-3 w-full" />
      </div>
    </div>

    <EmptyState
      v-else-if="!filtered.length"
      :title="props.emptyTitle"
      :description="props.emptyDescription"
      :icon="Search"
    />

    <template v-else-if="props.groupByCategory">
      <section v-for="group in groups" :key="group.name" class="grid gap-3">
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-semibold text-foreground">{{ group.name }}</h2>
          <span class="text-[11px] text-muted-foreground">{{ group.tools.length }}</span>
          <span class="h-px flex-1 bg-border" />
        </div>
        <div class="grid gap-3" :style="gridStyle">
          <PdfToolCard v-for="tool in group.tools" :key="tool.id" :tool="tool" @select="emit('select', $event)" />
        </div>
      </section>
    </template>

    <div v-else class="grid gap-3" :style="gridStyle">
      <PdfToolCard v-for="tool in filtered" :key="tool.id" :tool="tool" @select="emit('select', $event)" />
    </div>
  </div>
</template>
