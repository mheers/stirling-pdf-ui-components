# Examples

## `vite-demo`

A realistic mini workspace that consumes the **built** library, not the source. It demonstrates:

- configuring the PDF.js worker in a Vite application
- importing the compiled stylesheet (no Tailwind setup required for the components)
- a viewer with search, thumbnails, zoom, rotation, print, and fullscreen
- a page organizer with drag reordering, rotation, deletion, blank pages, and undo
- light/dark theme switching through the `dark` class

```bash
# from the repository root
pnpm install
pnpm build
pnpm example:dev
```

Then open http://localhost:5173.

The demo serves the sample documents from the repository's `public/` folder via
`publicDir: '../../public'` in `vite.config.ts`.

## Copy-paste recipes

### Upload and read a document

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { PdfDropzone, PdfViewer } from '@mheers/stirling-pdf-ui-components';

const file = ref<File | null>(null);
</script>

<template>
  <PdfDropzone v-if="!file" :multiple="false" @files="file = $event[0] ?? null" />
  <PdfViewer v-else :source="file" :filename="file.name" show-thumbnails />
</template>
```

### Organize pages and send the order to your backend

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { PdfPageOrganizer } from '@mheers/stirling-pdf-ui-components';
import type { PageOrganizerItem } from '@mheers/stirling-pdf-ui-components';

const file = ref<File>();
const pages = ref<PageOrganizerItem[]>([]);
const pageCount = ref(12);

async function apply() {
  await fetch('/api/pdf/organize', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pages: pages.value }),
  });
}
</script>

<template>
  <PdfPageOrganizer v-model="pages" :source="file" :page-count="pageCount" />
  <button @click="apply">Apply page order</button>
</template>
```

### A task form with the processing/result cycle

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  CompressionSettings,
  PdfProcessingState,
  PdfResultPanel,
  defaultCompressionOptions,
} from '@mheers/stirling-pdf-ui-components';

const options = ref(defaultCompressionOptions());
const status = ref<'idle' | 'processing' | 'success' | 'error'>('idle');
const result = ref([]);

async function compress() {
  status.value = 'processing';
  try {
    // call your API here
    result.value = [{ id: '1', name: 'compressed.pdf', url: '/compressed.pdf' }];
    status.value = 'success';
  } catch {
    status.value = 'error';
  }
}
</script>

<template>
  <CompressionSettings v-model="options" :original-size="2_400_000" />
  <PdfProcessingState v-if="status === 'processing'" :progress="45" cancellable />
  <PdfResultPanel v-if="status === 'success'" :results="result" />
</template>
```
