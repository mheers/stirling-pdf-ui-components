<script setup lang="ts">
import { computed, ref } from 'vue';
import { Check, Languages, Search, X } from 'lucide-vue-next';
import { cn } from '../../lib/cn';
import { COMMON_OCR_LANGUAGES } from '../../lib/defaults';
import type { OcrLanguage, OcrMode, OcrOptions } from '../../lib/types';
import Alert from '../ui/Alert.vue';
import Input from '../ui/Input.vue';
import RadioGroup from '../ui/RadioGroup.vue';
import SegmentedControl from '../ui/SegmentedControl.vue';
import Switch from '../ui/Switch.vue';

interface Props {
  modelValue: OcrOptions;
  languages?: OcrLanguage[];
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  languages: () => COMMON_OCR_LANGUAGES,
});

const emit = defineEmits<{
  'update:modelValue': [options: OcrOptions];
  change: [options: OcrOptions];
}>();

const options = computed(() => props.modelValue);
const search = ref('');

const filteredLanguages = computed(() => {
  const needle = search.value.trim().toLowerCase();
  if (!needle) return props.languages;
  return props.languages.filter(
    (language) => language.name.toLowerCase().includes(needle) || language.code.toLowerCase().includes(needle),
  );
});

const selectedLanguages = computed(() =>
  options.value.languages.map((code) => props.languages.find((language) => language.code === code) ?? { code, name: code }),
);

const modes: { value: OcrMode; label: string; description: string }[] = [
  {
    value: 'skip-text',
    label: 'Skip pages with text',
    description: 'Only OCR pages that have no text layer. Fastest and safest for mixed documents.',
  },
  {
    value: 'redo',
    label: 'Redo OCR on all pages',
    description: 'Replace the existing text layer with a fresh OCR pass.',
  },
  {
    value: 'force',
    label: 'Force OCR',
    description: 'Ignore embedded text and OCR every page as an image.',
  },
];

function update(next: OcrOptions) {
  emit('update:modelValue', next);
  emit('change', next);
}

function patch<K extends keyof OcrOptions>(key: K, value: OcrOptions[K]) {
  update({ ...options.value, [key]: value });
}

function toggleLanguage(code: string) {
  const next = options.value.languages.includes(code)
    ? options.value.languages.filter((language) => language !== code)
    : [...options.value.languages, code];
  patch('languages', next);
}

const optimizeItems = [
  { value: '0', label: 'Off' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
];
</script>

<template>
  <div :class="cn('spdf grid gap-5', props.class)">
    <div class="grid gap-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-1.5">
          <Languages class="size-4 text-muted-foreground" aria-hidden="true" />
          <span class="text-sm font-medium text-foreground">OCR languages</span>
          <span class="rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">{{ options.languages.length }}</span>
        </div>
        <span class="text-[11px] text-muted-foreground">Pick every language present in the document.</span>
      </div>

      <div v-if="selectedLanguages.length" class="flex flex-wrap gap-1.5">
        <span
          v-for="language in selectedLanguages"
          :key="language.code"
          class="inline-flex items-center gap-1 rounded-full bg-primary/10 py-0.5 pr-1 pl-2 text-xs font-medium text-primary"
        >
          {{ language.name }}
          <button
            type="button"
            class="grid size-4 place-items-center rounded-full transition-colors hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
            :aria-label="`Remove ${language.name}`"
            @click="toggleLanguage(language.code)"
          >
            <X class="size-2.5" aria-hidden="true" />
          </button>
        </span>
      </div>

      <div class="relative">
        <Search class="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground/70" aria-hidden="true" />
        <Input
          v-model="search"
          placeholder="Search languages…"
          class="h-8 pl-8 text-xs"
          aria-label="Search OCR languages"
        />
      </div>

      <div class="spdf-scroll grid max-h-52 gap-1 overflow-y-auto rounded-lg border border-border p-1.5 sm:grid-cols-2">
        <button
          v-for="language in filteredLanguages"
          :key="language.code"
          type="button"
          :aria-pressed="options.languages.includes(language.code)"
          :disabled="props.disabled"
          :class="
            cn(
              'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:opacity-50',
              options.languages.includes(language.code)
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          "
          @click="toggleLanguage(language.code)"
        >
          <span class="truncate">{{ language.name }}</span>
          <span class="flex items-center gap-1.5">
            <span class="font-mono text-[9px] uppercase opacity-60">{{ language.code }}</span>
            <Check v-if="options.languages.includes(language.code)" class="size-3.5 shrink-0" aria-hidden="true" />
          </span>
        </button>
        <p v-if="!filteredLanguages.length" class="col-span-full px-2 py-4 text-center text-xs text-muted-foreground">
          No languages match “{{ search }}”.
        </p>
      </div>
    </div>

    <div class="grid gap-2">
      <span class="text-sm font-medium text-foreground">OCR mode</span>
      <RadioGroup
        :model-value="options.mode"
        :items="modes"
        variant="cards"
        aria-label="OCR mode"
        @update:model-value="patch('mode', $event as OcrMode)"
      />
    </div>

    <div class="grid gap-2">
      <div class="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
        <div>
          <p class="text-sm font-medium text-foreground">Deskew pages</p>
          <p class="text-xs text-muted-foreground">Straighten crooked scans before recognition.</p>
        </div>
        <Switch
          :model-value="options.deskew"
          :disabled="props.disabled"
          aria-label="Deskew pages"
          @update:model-value="patch('deskew', $event)"
        />
      </div>
      <div class="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
        <div>
          <p class="text-sm font-medium text-foreground">Clean up images</p>
          <p class="text-xs text-muted-foreground">Remove noise and improve contrast before OCR.</p>
        </div>
        <Switch
          :model-value="options.clean"
          :disabled="props.disabled"
          aria-label="Clean up images"
          @update:model-value="patch('clean', $event)"
        />
      </div>
      <div class="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
        <div>
          <p class="text-sm font-medium text-foreground">Rotate pages automatically</p>
          <p class="text-xs text-muted-foreground">Detect and correct page orientation.</p>
        </div>
        <Switch
          :model-value="options.rotatePages"
          :disabled="props.disabled"
          aria-label="Rotate pages automatically"
          @update:model-value="patch('rotatePages', $event)"
        />
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm font-medium text-foreground">Optimize output</p>
        <p class="text-[11px] text-muted-foreground">Higher levels shrink the file at the cost of speed.</p>
      </div>
      <SegmentedControl
        :model-value="String(options.optimize)"
        :items="optimizeItems"
        size="sm"
        aria-label="OCR output optimization"
        @update:model-value="patch('optimize', Number($event))"
      />
    </div>

    <Alert v-if="options.languages.length > 3" variant="warning" title="More languages means slower OCR">
      Each additional language adds recognition work. Keep only the languages that actually occur in the document.
    </Alert>
  </div>
</template>
