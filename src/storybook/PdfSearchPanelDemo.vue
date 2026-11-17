<script setup lang="ts">
import { ref } from 'vue';
import PdfSearchPanel from '../components/pdf/PdfSearchPanel.vue';
import type { PdfSearchResults } from '../lib/pdf';

interface Props {
  initialQuery?: string;
  results?: PdfSearchResults | null;
  searching?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialQuery: 'document',
  results: null,
  searching: false,
});

const emit = defineEmits<{
  select: [page: number];
  close: [];
}>();

const query = ref(props.initialQuery);
</script>

<template>
  <div class="spdf relative h-[500px] w-full overflow-hidden rounded-xl border border-border bg-pdf-canvas">
    <PdfSearchPanel
      v-model="query"
      :results="props.results"
      :searching="props.searching"
      @select="emit('select', $event)"
      @close="emit('close')"
    />
  </div>
</template>
