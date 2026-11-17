<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
  ArrowUpRight,
  FileText,
  Github,
  Layers,
  Moon,
  Sparkles,
  Sun,
} from 'lucide-vue-next';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PdfDocumentInfo,
  PdfDropzone,
  PdfPageOrganizer,
  PdfViewer,
  Tabs,
  usePdfDocument,
} from '@mheers/stirling-pdf-ui-components';
import type { TabItem } from '@mheers/stirling-pdf-ui-components';

const handbookUrl = '/samples/handbook.pdf';

const source = ref<string | File>(handbookUrl);
const filename = computed(() =>
  typeof source.value === 'string' ? 'pdf-workflow-handbook.pdf' : source.value.name,
);
const dark = ref(false);
const tab = ref('view');

const tabs: TabItem[] = [
  { value: 'view', label: 'View', icon: FileText },
  { value: 'organize', label: 'Organize', icon: Layers },
];

const { numPages } = usePdfDocument(() => source.value);
const pageCount = computed(() => numPages.value || 0);

function onFiles(files: File[]) {
  const file = files[0];
  if (file) source.value = file;
}

function toggleTheme() {
  dark.value = !dark.value;
  document.documentElement.classList.toggle('dark', dark.value);
  localStorage.setItem('spdf-theme', dark.value ? 'dark' : 'light');
}

onMounted(() => {
  const stored = localStorage.getItem('spdf-theme');
  dark.value = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark.value);
});

watch(source, () => {
  tab.value = 'view';
});
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <header class="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div class="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <div class="flex size-9 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm">
          <FileText class="size-5" aria-hidden="true" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="truncate text-sm font-semibold tracking-tight">Stirling PDF UI</span>
            <Badge variant="secondary">Demo</Badge>
          </div>
          <p class="truncate text-[11px] text-muted-foreground">Vue 3 · shadcn-style tokens · MIT</p>
        </div>

        <div class="ml-auto flex items-center gap-1">
          <a
            href="https://github.com/mheers/stirling-pdf-ui-components"
            target="_blank"
            rel="noreferrer"
            class="hidden h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
          >
            <Github class="size-3.5" />
            GitHub
            <ArrowUpRight class="size-3" />
          </a>
          <Button variant="ghost" size="icon" :aria-label="dark ? 'Use light theme' : 'Use dark theme'" @click="toggleTheme">
            <Sun v-if="dark" />
            <Moon v-else />
          </Button>
        </div>
      </div>
    </header>

    <main class="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside class="grid content-start gap-4">
        <PdfDropzone
          compact
          :multiple="false"
          :max-files="1"
          title="Open a PDF"
          description="Drop a file or click to browse"
          :hint="filename"
          @files="onFiles"
        />

        <PdfDocumentInfo :source="source" />

        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="flex items-center gap-2 text-sm">
              <Sparkles class="size-4 text-primary" />
              Try the components
            </CardTitle>
            <CardDescription class="text-xs">
              Everything on this page comes from the published package.
            </CardDescription>
          </CardHeader>
          <CardContent class="grid gap-2 text-xs text-muted-foreground">
            <p><span class="font-medium text-foreground">View</span> — search, zoom, rotate, and page through the document.</p>
            <p><span class="font-medium text-foreground">Organize</span> — drag pages, rotate, delete, and insert blanks with undo.</p>
            <p class="pt-1 text-[11px]">Use the toolbar theme switch to test dark mode.</p>
          </CardContent>
        </Card>
      </aside>

      <section class="grid min-w-0 content-start gap-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <Tabs v-model="tab" :items="tabs" />
          <span class="spdf-tabular text-xs text-muted-foreground">
            {{ pageCount ? `${pageCount} pages` : 'Reading document…' }}
          </span>
        </div>

        <PdfViewer
          v-if="tab === 'view'"
          class="h-[calc(100vh-13rem)] min-h-[560px]"
          :source="source"
          :filename="filename"
          show-thumbnails
          allow-print
        />
        <PdfPageOrganizer
          v-else
          :source="source"
          :page-count="pageCount"
          :thumbnail-width="140"
        />
      </section>
    </main>

    <footer class="border-t border-border py-4">
      <div class="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 text-[11px] text-muted-foreground sm:px-6">
        <span>MIT licensed · Built with Vue 3, Vite, and PDF.js</span>
        <span>Sample document: The PDF Workflow Handbook</span>
      </div>
    </footer>
  </div>
</template>
