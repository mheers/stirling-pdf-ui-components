<script setup lang="ts">
import { usePdfDocument } from '../composables/usePdfDocument';
import PdfPageCanvas from '../components/pdf/PdfPageCanvas.vue';
import Skeleton from '../components/ui/Skeleton.vue';
import Alert from '../components/ui/Alert.vue';

interface Props {
  source: string;
  page?: number;
  scale?: number;
  rotation?: number;
  textLayer?: boolean;
  searchQuery?: string;
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  page: 1,
  scale: 1,
  rotation: 0,
  textLayer: true,
  visible: true,
});

const emit = defineEmits<{
  rendered: [payload: { page: number; width: number; height: number }];
  error: [error: unknown];
}>();

const { doc, error } = usePdfDocument(() => props.source);
</script>

<template>
  <div class="spdf grid justify-items-center gap-3">
    <PdfPageCanvas
      v-if="doc"
      :doc="doc"
      :page="props.page"
      :scale="props.scale"
      :rotation="props.rotation"
      :text-layer="props.textLayer"
      :search-query="props.searchQuery"
      :visible="props.visible"
      @rendered="emit('rendered', $event)"
      @error="emit('error', $event)"
    />
    <Alert v-else-if="error" variant="destructive" title="Could not render the page" class="max-w-sm" />
    <Skeleton v-else class="aspect-[0.707] w-[420px] max-w-full rounded-sm" />
  </div>
</template>
