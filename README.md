# Stirling PDF UI Components

**Beautiful, accessible Vue 3 components for building PDF applications.**

A focused library of document surfaces: upload, preview, search, organize, protect, compress, OCR,
sign, and deliver PDFs. Built with Vue 3, TypeScript, Tailwind v4, and shadcn-vue conventions, with
a Storybook story for every component.

[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Storybook](https://img.shields.io/badge/Storybook-10-ff4785?logo=storybook&logoColor=white)](https://storybook.js.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-25262b)](LICENSE)

<p align="center">
  <img src="https://raw.githubusercontent.com/mheers/stirling-pdf-ui-components/main/docs/screenshots/hero.png" alt="Stirling PDF UI Components — a PDF viewer with page navigation, zoom, search, and thumbnails" width="100%" />
</p>

> **Unofficial community project.** This library is inspired by the excellent
> [Stirling PDF](https://github.com/Stirling-Tools/Stirling-PDF) frontend. It is not affiliated with
> Stirling PDF Inc.

---

## Why this library

Most PDF apps rebuild the same surfaces: a dropzone, a file list, a viewer, a page organizer, a
password form, a result panel. The details that make them trustworthy are easy to skip when every
app starts from zero: lazy page rendering, keyboard selection, undo, progress states, accessible
labels, dark mode.

This library centralizes those surfaces so you can spend your time on the workflow that makes your
product different.

- **28 PDF components** and **31 UI primitives**, all exported with TypeScript types.
- **PDF.js inside** — continuous scroll, selectable text, fit modes, rotation, search highlights,
  thumbnails, and password unlock.
- **A real page editor** — drag or keyboard reorder, multi-select, rotate, duplicate, delete, insert
  blank pages, undo, redo, and reset.
- **Task panels, not just inputs** — watermark and page-number previews, compression estimates, OCR
  language search, split previews, signature capture.
- **Designed for shadcn-vue** — semantic CSS variables, `class` passthrough on every component, and
  `cn()` class merging. Works without Tailwind in the host app.
- **Accessible by default** — labelled controls, roving tab focus, keyboard shortcuts, focus rings,
  reduced-motion support, and an a11y addon in Storybook.
- **Zero global style leakage** — the shipped stylesheet omits Tailwind preflight and scopes its
  reset to `.spdf`.
- **MIT licensed**, with no runtime service, account, or commercial dependency.

## Screenshots

| Viewer | Page organizer |
| --- | --- |
| ![PDF viewer](https://raw.githubusercontent.com/mheers/stirling-pdf-ui-components/main/docs/screenshots/viewer.png) | ![Page organizer](https://raw.githubusercontent.com/mheers/stirling-pdf-ui-components/main/docs/screenshots/page-organizer.png) |

| Tool catalog | Dark mode |
| --- | --- |
| ![Tool grid](https://raw.githubusercontent.com/mheers/stirling-pdf-ui-components/main/docs/screenshots/tool-grid.png) | ![Viewer in dark mode](https://raw.githubusercontent.com/mheers/stirling-pdf-ui-components/main/docs/screenshots/viewer-dark.png) |

| Watermark settings | Signature capture |
| --- | --- |
| ![Watermark settings](https://raw.githubusercontent.com/mheers/stirling-pdf-ui-components/main/docs/screenshots/watermark.png) | ![Signature input](https://raw.githubusercontent.com/mheers/stirling-pdf-ui-components/main/docs/screenshots/signature.png) |

## Requirements

- **Vue 3.5+**
- **Node 22.13+** for development (PDF.js v6 requires it)
- **pdfjs-dist 5.4+ or 6.x** as a peer dependency for the PDF engine
- A bundler that supports ESM (Vite, Nuxt, Rollup, webpack 5, Rspack, …)

The library is client-side only. If you use Nuxt or another SSR framework, render the PDF
components inside `<ClientOnly>`.

## Install

```bash
pnpm add @mheers/stirling-pdf-ui-components pdfjs-dist
```

```bash
npm install @mheers/stirling-pdf-ui-components pdfjs-dist
```

`pdfjs-dist` is only loaded when a component that renders pages mounts. Components such as
`PdfDropzone`, `PdfToolGrid`, or `PdfMetadataForm` never import the engine.

## Quick start

### 1. Configure the PDF.js worker

Call this once at application start-up, before the first viewer or thumbnail mounts.

```ts
// main.ts
import { createApp } from 'vue';
import { configurePdfJs } from '@mheers/stirling-pdf-ui-components';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

import '@mheers/stirling-pdf-ui-components/style.css';
import App from './App.vue';

configurePdfJs({ workerSrc: workerUrl });

createApp(App).mount('#app');
```

With webpack, copy `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` into your public folder and
pass its URL instead.

### 2. Render a document

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { PdfDropzone, PdfViewer } from '@mheers/stirling-pdf-ui-components';

const file = ref<File | null>(null);
</script>

<template>
  <PdfDropzone
    v-if="!file"
    :multiple="false"
    title="Open a PDF"
    @files="file = $event[0] ?? null"
  />

  <PdfViewer
    v-else
    :source="file"
    :filename="file.name"
    show-thumbnails
    allow-print
  />
</template>
```

`PdfViewer` accepts a `File`, `Blob`, `ArrayBuffer`, `Uint8Array`, URL string, or `URL`.

## Components

### Files and uploads

| Component | What it does |
| --- | --- |
| [`PdfDropzone`](src/components/pdf/PdfDropzone.vue) | Accessible drag-and-drop with type, size, and count validation |
| [`PdfFileCard`](src/components/pdf/PdfFileCard.vue) | File row with thumbnail, status, progress, retry, and selection |
| [`PdfFileList`](src/components/pdf/PdfFileList.vue) | Reorderable, selectable file queue with keyboard support |

### View, search, and inspect

| Component | What it does |
| --- | --- |
| [`PdfViewer`](src/components/pdf/PdfViewer.vue) | Continuous viewer with lazy pages, text layer, zoom, rotation, search, download, print, fullscreen, and password unlock |
| [`PdfViewerToolbar`](src/components/pdf/PdfViewerToolbar.vue) | Standalone toolbar for a custom viewer |
| [`PdfThumbnailSidebar`](src/components/pdf/PdfThumbnailSidebar.vue) | Page rail with current-page tracking |
| [`PdfPageCanvas`](src/components/pdf/PdfPageCanvas.vue) | One rendered page with text selection and search highlights |
| [`PdfSearchPanel`](src/components/pdf/PdfSearchPanel.vue) | Grouped search results with highlighted snippets |
| [`PdfDocumentInfo`](src/components/pdf/PdfDocumentInfo.vue) | Page count, size, version, metadata, and protection status |

### Pages and selection

| Component | What it does |
| --- | --- |
| [`PdfThumbnail`](src/components/pdf/PdfThumbnail.vue) | Lazy, shared-document page thumbnail |
| [`PdfPageGrid`](src/components/pdf/PdfPageGrid.vue) | Responsive selection grid with shift/ctrl semantics |
| [`PdfPageOrganizer`](src/components/pdf/PdfPageOrganizer.vue) | Reorder, rotate, duplicate, delete, insert blanks, undo/redo/reset |
| [`PageRangeInput`](src/components/pdf/PageRangeInput.vue) | `1-3, 5, 8-10`, `all`, `odd`, `even`, `last`, and open ranges, with an interactive page strip |
| [`PdfPositionPicker`](src/components/pdf/PdfPositionPicker.vue) | Accessible nine-point anchor picker |

### Tool catalogs

| Component | What it does |
| --- | --- |
| [`PdfToolCard`](src/components/pdf/PdfToolCard.vue) | One tool card with icon, description, badge, and hover action |
| [`PdfToolGrid`](src/components/pdf/PdfToolGrid.vue) | Searchable, category-filtered, optionally grouped tool catalog |
| [`PdfToolHeader`](src/components/pdf/PdfToolHeader.vue) | Consistent tool page header with back action and actions slot |

### Task panels

| Component | What it does |
| --- | --- |
| [`PdfMetadataForm`](src/components/pdf/PdfMetadataForm.vue) | Title, author, subject, keyword chips, creator, producer |
| [`PdfPasswordForm`](src/components/pdf/PdfPasswordForm.vue) | Protect or unlock, strength meter, confirm, owner password, permissions |
| [`WatermarkSettings`](src/components/pdf/WatermarkSettings.vue) | Text or image, position, color, opacity, rotation, tiling, live preview |
| [`PageNumberSettings`](src/components/pdf/PageNumberSettings.vue) | Format tokens, position, margin, start number, skip first, live preview |
| [`CompressionSettings`](src/components/pdf/CompressionSettings.vue) | Presets, custom quality and DPI, grayscale, estimated output size |
| [`OcrSettings`](src/components/pdf/OcrSettings.vue) | Searchable languages, three OCR modes, deskew, cleanup, optimization |
| [`SplitSettings`](src/components/pdf/SplitSettings.vue) | Fixed chunks, custom ranges, every page, with generated filenames |

### Signing and feedback

| Component | What it does |
| --- | --- |
| [`SignaturePad`](src/components/pdf/SignaturePad.vue) | High-DPI drawing, smoothing, undo, clear, trimmed PNG export |
| [`SignatureInput`](src/components/pdf/SignatureInput.vue) | Draw, type, or upload a signature in one control |
| [`PdfProcessingState`](src/components/pdf/PdfProcessingState.vue) | Determinate/indeterminate progress, steps, cancel, retry, overlay |
| [`PdfResultPanel`](src/components/pdf/PdfResultPanel.vue) | Success state, result files, savings, download all, start over |

### UI primitives

The library also exports the primitives the PDF surfaces are built from:

`Alert`, `Badge`, `Button`, `Card` (+ header, title, description, content, footer), `Checkbox`,
`Dialog`, `EmptyState`, `Field`, `Input`, `Kbd`, `Label`, `Popover`, `Progress`, `RadioGroup`,
`ScrollArea`, `SegmentedControl`, `Select`, `Separator`, `Sheet`, `Skeleton`, `Slider`, `Spinner`,
`Switch`, `Tabs`, `Textarea`, `Tooltip`.

All primitives accept a `class` prop and merge it with `cn()`.

## Recipes

### Organize pages and send the new order to your backend

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { PdfPageOrganizer } from '@mheers/stirling-pdf-ui-components';
import type { PageOrganizerItem } from '@mheers/stirling-pdf-ui-components';

const props = defineProps<{ file: File; pageCount: number }>();
const pages = ref<PageOrganizerItem[]>([]);

async function apply() {
  await fetch('/api/pdf/organize', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pages: pages.value }),
  });
}
</script>

<template>
  <PdfPageOrganizer
    v-model="pages"
    :source="props.file"
    :page-count="props.pageCount"
  />
  <button @click="apply">Apply page order</button>
</template>
```

Each item is `{ id, page, rotation, blank? }`. `page` is the 1-based source page; blank pages use
`page: 0` and `blank: true`. Rotations are additional degrees (0, 90, 180, 270).

### Wire a task to processing and results

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  CompressionSettings,
  PdfProcessingState,
  PdfResultPanel,
  defaultCompressionOptions,
} from '@mheers/stirling-pdf-ui-components';
import type { CompressionOptions, PdfResult } from '@mheers/stirling-pdf-ui-components';

const file = ref<File>();
const options = ref<CompressionOptions>(defaultCompressionOptions());
const status = ref<'idle' | 'processing' | 'success' | 'error'>('idle');
const results = ref<PdfResult[]>([]);

async function run() {
  if (!file.value) return;
  status.value = 'processing';

  const body = new FormData();
  body.append('file', file.value);
  body.append('options', JSON.stringify(options.value));

  try {
    const response = await fetch('/api/pdf/compress', { method: 'POST', body });
    const blob = await response.blob();
    results.value = [
      { id: 'result', name: 'compressed.pdf', size: blob.size, blob },
    ];
    status.value = 'success';
  } catch {
    status.value = 'error';
  }
}
</script>

<template>
  <CompressionSettings
    v-model="options"
    :original-size="file?.size"
  />
  <button :disabled="!file" @click="run">Compress</button>

  <PdfProcessingState
    v-if="status === 'processing'"
    title="Compressing your document"
    cancellable
    @cancel="status = 'idle'"
  />

  <PdfResultPanel
    v-if="status === 'success'"
    :results="results"
    :original-size="file?.size"
    @reset="status = 'idle'"
  />
</template>
```

A complete, buildable consumer app lives in [`examples/vite-demo`](examples/vite-demo).

## Theming

The library uses the standard shadcn-vue token names. Override them in your application CSS and
every component follows.

```css
:root {
  --background: oklch(0.984 0.004 95);
  --foreground: oklch(0.255 0.012 265);
  --primary: oklch(0.545 0.185 262);
  --primary-foreground: oklch(0.99 0.002 95);
  --border: oklch(0.915 0.006 95);
  --ring: oklch(0.545 0.185 262);
  --radius: 0.75rem;
}

.dark,
[data-theme='dark'] {
  --background: oklch(0.165 0.007 265);
  --foreground: oklch(0.945 0.006 95);
  --primary: oklch(0.68 0.16 260);
}
```

Dark mode is class-based (`.dark`) and also works with `[data-theme='dark']`.

| Token group | Variables |
| --- | --- |
| Surfaces | `--background`, `--card`, `--popover`, `--muted`, `--accent`, `--secondary` |
| Text | `--foreground`, `--muted-foreground`, `--primary-foreground` |
| Lines | `--border`, `--input`, `--ring` |
| Status | `--success`, `--warning`, `--destructive`, `--info`, `--brand` |
| Document | `--pdf-canvas`, `--pdf-page`, `--pdf-page-border`, `--pdf-ink`, `--pdf-highlight`, `--pdf-selection` |
| Shape | `--radius` |

PDF pages stay white in dark mode because document ink must remain legible. The page canvas around
them follows `--pdf-canvas`.

Typography is inherited from your app. The default stack is Inter, with a system fallback. Override
`--spdf-font-sans` if you use a different face.

### Styling rules

- Every component root carries the `.spdf` class. The shipped reset is scoped to it.
- The stylesheet does **not** include Tailwind preflight, so importing it cannot reset your app.
- Components do not read raw UI colors. They use semantic tokens, which makes custom themes reliable. Document ink and watermark swatches are intentionally theme-independent.
- `class` is merged through `cn()`, so your utilities win over library defaults.

## Accessibility

- Every icon-only button has an `aria-label`; every toggle reports its state.
- Dialogs, sheets, popovers, sliders, switches, checkboxes, and radio groups use
  [Reka UI](https://reka-ui.com) primitives with correct roles and focus management. Tabs and
  segmented controls use a small roving-focus implementation.
- The page organizer and file list support keyboard reordering (`Alt` + arrow keys), range
  selection, and visible focus rings.
- The viewer shortcuts work when the document pane is focused: arrows for pages, `+`/`-` for zoom,
  `0` to reset, `f` for fit width.
- Motion is disabled under `prefers-reduced-motion`.
- The Storybook a11y panel is enabled for every story.

## PDF.js notes

### Worker, CMaps, and fonts

```ts
configurePdfJs({
  workerSrc: workerUrl,
  cMapUrl: '/pdfjs/cmaps/',
  cMapPacked: true,
  standardFontDataUrl: '/pdfjs/standard_fonts/',
  wasmUrl: '/pdfjs/wasm/',
});
```

`cMapUrl` is needed for some CJK documents. `standardFontDataUrl` helps with PDFs that rely on the
14 standard fonts. `wasmUrl` enables JPEG 2000 and ICC-based rendering in PDF.js 6.

### Shared document cache

Every component that receives the same source shares one `PDFDocumentProxy`. The cache is
reference-counted: when the last viewer or thumbnail unmounts, the document and worker are
destroyed. Use [`usePdfDocument`](src/composables/usePdfDocument.ts) to join the cache in your own
components.

### Password-protected files

`PdfViewer` catches PDF.js `PasswordException`s and opens an unlock dialog. If you build a custom
viewer, use `isPdfPasswordError`, `pdfPasswordErrorCode`, and `acquirePdfDocument(source, { password })`.

## Composables and utilities

| Export | Purpose |
| --- | --- |
| `usePdfDocument(() => source, { password })` | Shared document loading, progress, errors, reload |
| `useElementSize(target)` | ResizeObserver-backed element size |
| `useInView(target, options)` | Lazy rendering helper |
| `configurePdfJs(config)` | Set `workerSrc`, CMaps, fonts, and wasm URLs |
| `parsePageRange(input, pageCount)` | Parse and validate page selections |
| `formatPageRange(pages)` | Format pages as `1–3, 5, 8–10` |
| `formatBytes`, `formatDuration`, `savedPercent` | Human-readable numbers |
| `cn(...classes)` | Tailwind-aware class merging |
| `defaultCompressionOptions()` … | Factories for every task option object |
| `canvasToTrimmedDataUrl`, `renderTypedSignature` | Signature export helpers |

The full list, including low-level PDF helpers, is in [`src/index.ts`](src/index.ts).

## Storybook

Every component has stories for its important states, and the docs pages include prop tables,
controls, and the theme toolbar.

```bash
pnpm dev                 # Storybook at http://localhost:6006
pnpm build:storybook     # static build in storybook-static/
pnpm preview:storybook   # serve the static build
```

The sample PDFs in `public/samples` are generated by [`scripts/generate-samples.py`](scripts/generate-samples.py)
and are committed so Storybook works offline. The encrypted sample uses the password **stirling**.

## Development

```bash
pnpm install
pnpm dev            # Storybook
pnpm typecheck      # vue-tsc
pnpm test           # Vitest
pnpm build          # ESM bundle, CSS, and .d.ts
pnpm example:build  # build the consumer demo
pnpm samples        # regenerate sample PDFs (Python + reportlab)
```

### Project structure

```text
src/
├── components/
│   ├── pdf/          # domain components, one story per component
│   └── ui/           # shadcn-style primitives
├── composables/      # usePdfDocument, useElementSize, useInView
├── lib/              # cn, formatting, page ranges, PDF engine, defaults
├── storybook/        # fixtures, docs, foundations showcase
└── styles/index.css  # design tokens and compiled library styles
examples/vite-demo/   # a real Vite consumer app
scripts/              # sample generator, declaration cleanup
```

### Adding a component

1. Build it in `src/components/pdf/` with `<script setup lang="ts">`.
2. Put the `.spdf` class on the root and use semantic tokens.
3. Add a co-located story with at least one realistic state.
4. Export it from [`src/index.ts`](src/index.ts).
5. Run `pnpm typecheck && pnpm test && pnpm build:storybook`.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the detailed conventions.

## Publishing

No CI is configured. Publishing is a local, explicit step:

```bash
pnpm build
pnpm test
npm publish
```

The `prepublishOnly` script reruns the build and tests. The package is ESM-only and exposes
`./style.css` alongside the component entry.

## License

[MIT](LICENSE) © 2026 Marcel Heers.

The design and component API are original. The MIT-licensed Stirling PDF frontend was used as UX
research and inspiration; no React or Mantine code is included in this package. Stirling PDF is a
trademark of its respective owners. This is an unofficial community project.
