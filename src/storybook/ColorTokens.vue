<script setup lang="ts">
const groups = [
  {
    name: 'Surfaces',
    tokens: [
      { name: 'background', value: 'var(--background)' },
      { name: 'card', value: 'var(--card)' },
      { name: 'muted', value: 'var(--muted)' },
      { name: 'accent', value: 'var(--accent)' },
      { name: 'popover', value: 'var(--popover)' },
      { name: 'pdf-canvas', value: 'var(--pdf-canvas)' },
    ],
  },
  {
    name: 'Text & borders',
    tokens: [
      { name: 'foreground', value: 'var(--foreground)' },
      { name: 'muted-foreground', value: 'var(--muted-foreground)' },
      { name: 'border', value: 'var(--border)' },
      { name: 'input', value: 'var(--input)' },
      { name: 'ring', value: 'var(--ring)' },
    ],
  },
  {
    name: 'Brand & status',
    tokens: [
      { name: 'primary', value: 'var(--primary)' },
      { name: 'brand', value: 'var(--brand)' },
      { name: 'success', value: 'var(--success)' },
      { name: 'warning', value: 'var(--warning)' },
      { name: 'destructive', value: 'var(--destructive)' },
      { name: 'info', value: 'var(--info)' },
    ],
  },
  {
    name: 'PDF surfaces',
    tokens: [
      { name: 'pdf-page', value: 'var(--pdf-page)' },
      { name: 'pdf-page-border', value: 'var(--pdf-page-border)' },
      { name: 'pdf-highlight', value: 'var(--pdf-highlight)' },
      { name: 'pdf-selection', value: 'var(--pdf-selection)' },
      { name: 'pdf-ink', value: 'var(--pdf-ink)' },
    ],
  },
];

const radii = [
  { name: 'sm', value: 'var(--radius-sm)' },
  { name: 'md', value: 'var(--radius-md)' },
  { name: 'lg', value: 'var(--radius-lg)' },
  { name: 'xl', value: 'var(--radius-xl)' },
];
</script>

<template>
  <div class="spdf grid gap-10">
    <section v-for="group in groups" :key="group.name" class="grid gap-3">
      <h2 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{{ group.name }}</h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="token in group.tokens"
          :key="token.name"
          class="overflow-hidden rounded-xl border border-border bg-card shadow-xs"
        >
          <div class="h-16 border-b border-border" :style="{ background: token.value }" />
          <div class="p-3">
            <p class="text-xs font-semibold text-foreground">{{ token.name }}</p>
            <p class="mt-0.5 font-mono text-[10px] text-muted-foreground">{{ token.value }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-3">
      <h2 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Radius</h2>
      <div class="flex flex-wrap gap-4">
        <div v-for="radius in radii" :key="radius.name" class="grid justify-items-center gap-2">
          <div
            class="size-16 border border-border bg-muted"
            :style="{ borderRadius: radius.value }"
          />
          <span class="text-[11px] text-muted-foreground">{{ radius.name }}</span>
        </div>
      </div>
    </section>

    <section class="grid gap-4">
      <h2 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Typography</h2>
      <div class="grid gap-3 rounded-xl border border-border bg-card p-5">
        <p class="text-3xl font-semibold tracking-tight text-foreground">Document work, without the drag.</p>
        <p class="text-lg font-medium text-foreground">A calmer workflow for PDFs</p>
        <p class="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Inter is the default UI face. Headings use tight tracking; body copy stays at a comfortable 1.6 line height.
          Numbers in page counters and file sizes use tabular figures.
        </p>
        <p class="spdf-tabular font-mono text-xs text-muted-foreground">build · 0123456789 · 32.4 MB · 1–12</p>
      </div>
    </section>
  </div>
</template>
