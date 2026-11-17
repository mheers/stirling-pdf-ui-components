<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { PenLine, Trash2, Type, Upload } from '@lucide/vue';
import { cn } from '../../lib/cn';
import { readFileAsDataUrl, renderTypedSignature } from '../../lib/canvas';
import type { SignatureKind, SignatureValue } from '../../lib/types';
import Alert from '../ui/Alert.vue';
import Button from '../ui/Button.vue';
import Input from '../ui/Input.vue';
import Tabs from '../ui/Tabs.vue';
import SignaturePad from './SignaturePad.vue';
import PdfDropzone from './PdfDropzone.vue';

interface Props {
  kinds?: SignatureKind[];
  height?: number;
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  kinds: () => ['draw', 'type', 'upload'],
  height: 180,
  disabled: false,
});

const emit = defineEmits<{ change: [value: SignatureValue | null] }>();
const model = defineModel<SignatureValue | null>({ default: null });

const active = ref<SignatureKind>(props.kinds[0] ?? 'draw');
const drawValue = ref('');
const typedText = ref('');
const typedStyle = ref(0);
const typedDataUrl = ref('');
const uploadValue = ref('');
const uploadName = ref('');
const error = ref('');

const styles = [
  {
    id: 'script',
    label: 'Script',
    font: 'italic 86px "Segoe Script", "Brush Script MT", "Snell Roundhand", cursive',
  },
  {
    id: 'elegant',
    label: 'Elegant',
    font: 'italic 96px Georgia, "Times New Roman", serif',
  },
  {
    id: 'clean',
    label: 'Clean',
    font: 'italic 96px "Inter Variable", "Helvetica Neue", Arial, sans-serif',
  },
];

const tabItems = computed(() => {
  const labels: Record<SignatureKind, { label: string; icon: typeof PenLine }> = {
    draw: { label: 'Draw', icon: PenLine },
    type: { label: 'Type', icon: Type },
    upload: { label: 'Upload', icon: Upload },
  };
  return props.kinds.map((kind) => ({ value: kind, label: labels[kind].label, icon: labels[kind].icon }));
});

const style = computed(() => styles[typedStyle.value] ?? styles[0]);
const hasValue = computed(() => !!model.value?.dataUrl);

function emitCurrent() {
  let value: SignatureValue | null = null;
  if (active.value === 'draw' && drawValue.value) {
    value = { dataUrl: drawValue.value, kind: 'draw' };
  } else if (active.value === 'type' && typedDataUrl.value) {
    value = { dataUrl: typedDataUrl.value, kind: 'type', text: typedText.value };
  } else if (active.value === 'upload' && uploadValue.value) {
    value = { dataUrl: uploadValue.value, kind: 'upload' };
  }
  model.value = value;
  emit('change', value);
}

function selectTab(value: string) {
  active.value = value as SignatureKind;
  emitCurrent();
}

function onDraw(value: string) {
  drawValue.value = value;
  if (active.value === 'draw') emitCurrent();
}

function onUpload(files: File[]) {
  const file = files[0];
  if (!file) return;
  error.value = '';
  readFileAsDataUrl(file)
    .then((dataUrl) => {
      uploadValue.value = dataUrl;
      uploadName.value = file.name;
      if (active.value === 'upload') emitCurrent();
    })
    .catch(() => {
      error.value = 'Could not read that image. Try a PNG or JPG file.';
    });
}

function removeUpload() {
  uploadValue.value = '';
  uploadName.value = '';
  if (active.value === 'upload') emitCurrent();
}

function clearAll() {
  drawValue.value = '';
  typedText.value = '';
  typedDataUrl.value = '';
  uploadValue.value = '';
  uploadName.value = '';
  model.value = null;
  emit('change', null);
}

watch([typedText, typedStyle], () => {
  typedDataUrl.value = typedText.value.trim() ? renderTypedSignature(typedText.value, style.value.font) : '';
  if (active.value === 'type') emitCurrent();
});

watch(model, (value) => {
  if (!value) return;
  if (value.kind === 'type' && value.text !== undefined && value.text !== typedText.value) {
    typedText.value = value.text;
  }
});

onMounted(() => {
  const value = model.value;
  if (!value) return;
  if (value.kind === 'type' && props.kinds.includes('type')) {
    active.value = 'type';
    typedText.value = value.text ?? '';
  } else if (value.kind === 'upload' && props.kinds.includes('upload')) {
    active.value = 'upload';
    uploadValue.value = value.dataUrl;
  } else if (value.kind === 'draw' && props.kinds.includes('draw')) {
    active.value = 'draw';
    drawValue.value = value.dataUrl;
  }
});
</script>

<template>
  <div :class="cn('spdf grid gap-4', props.class)">
    <Tabs
      :model-value="active"
      :items="tabItems"
      variant="pills"
      full-width
      aria-label="Signature method"
      :disabled="props.disabled"
      @update:model-value="selectTab"
    />

    <div v-show="active === 'draw'" class="grid gap-2" role="tabpanel" aria-label="Draw a signature">
      <SignaturePad
        :model-value="drawValue"
        :height="props.height"
        :disabled="props.disabled"
        placeholder="Sign here"
        @update:model-value="onDraw"
      />
    </div>

    <div v-show="active === 'type'" class="grid gap-3" role="tabpanel" aria-label="Type a signature">
      <Input
        :model-value="typedText"
        placeholder="Type your name"
        maxlength="48"
        :disabled="props.disabled"
        aria-label="Typed signature text"
        @update:model-value="typedText = String($event)"
      />

      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="(option, index) in styles"
          :key="option.id"
          type="button"
          :aria-pressed="typedStyle === index"
          :disabled="props.disabled"
          class="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:opacity-50"
          :class="
            typedStyle === index
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-border bg-background text-muted-foreground hover:text-foreground'
          "
          :style="{ fontFamily: option.id === 'elegant' ? 'Georgia, serif' : option.id === 'script' ? 'cursive' : 'inherit' }"
          @click="typedStyle = index"
        >
          {{ option.label }}
        </button>
      </div>

      <div class="spdf-paper relative grid min-h-40 place-items-center overflow-hidden rounded-xl border border-border px-6 py-8">
        <span
          v-if="typedText"
          class="text-pdf-ink"
          :style="{ font: style.font.replace('86px', '46px').replace('96px', '46px') }"
        >{{ typedText }}</span>
        <span v-else class="text-xs text-muted-foreground/50">Your typed signature appears here</span>
        <span class="pointer-events-none absolute right-6 bottom-7 left-6 border-b border-dashed border-border" aria-hidden="true" />
      </div>
    </div>

    <div v-show="active === 'upload'" class="grid gap-3" role="tabpanel" aria-label="Upload a signature">
      <PdfDropzone
        v-if="!uploadValue"
        :accept="['image/png', 'image/jpeg', 'image/webp']"
        :multiple="false"
        :max-files="1"
        :max-size="5 * 1024 * 1024"
        compact
        title="Upload a signature image"
        description="PNG or JPG, preferably with a transparent background"
        :disabled="props.disabled"
        @files="onUpload"
      />
      <div v-else class="spdf-paper grid min-h-40 place-items-center rounded-xl border border-border p-6">
        <img :src="uploadValue" :alt="uploadName ? `Signature ${uploadName}` : 'Uploaded signature'" class="max-h-24 max-w-full object-contain" />
      </div>
      <div v-if="uploadValue" class="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span class="truncate">{{ uploadName || 'Signature image' }}</span>
        <Button variant="ghost" size="sm" :disabled="props.disabled" @click="removeUpload">
          <Trash2 class="size-3.5" />
          Remove
        </Button>
      </div>
    </div>

    <Alert v-if="error" variant="destructive" :title="error" dismissible @close="error = ''" />

    <div class="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
      <p class="text-[11px] text-muted-foreground">Your signature stays in the browser and is never uploaded by this component.</p>
      <Button variant="ghost" size="sm" :disabled="props.disabled || (!hasValue && !typedText)" @click="clearAll">
        Clear signature
      </Button>
    </div>
  </div>
</template>
