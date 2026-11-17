<script setup lang="ts">
import { computed, ref } from 'vue';
import { Plus, X } from '@lucide/vue';
import { cn } from '../../lib/cn';
import { defaultPdfMetadata } from '../../lib/defaults';
import type { PdfMetadata } from '../../lib/types';
import Button from '../ui/Button.vue';
import Field from '../ui/Field.vue';
import Input from '../ui/Input.vue';

interface Props {
  modelValue: PdfMetadata;
  disabled?: boolean;
  loading?: boolean;
  showActions?: boolean;
  submitLabel?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  loading: false,
  showActions: true,
  submitLabel: 'Apply metadata',
});

const emit = defineEmits<{
  'update:modelValue': [metadata: PdfMetadata];
  submit: [metadata: PdfMetadata];
  reset: [];
}>();

const keywordDraft = ref('');

const metadata = computed(() => props.modelValue);

function patch<K extends keyof PdfMetadata>(key: K, value: PdfMetadata[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}

function addKeywords(raw: string) {
  if (props.disabled) return;
  const parts = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return;

  const next = [...props.modelValue.keywords];
  for (const part of parts) {
    if (next.length >= 32) break;
    if (!next.some((keyword) => keyword.toLowerCase() === part.toLowerCase())) next.push(part);
  }
  patch('keywords', next);
  keywordDraft.value = '';
}

function onKeywordKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    addKeywords(keywordDraft.value);
  } else if (event.key === 'Backspace' && !keywordDraft.value && props.modelValue.keywords.length) {
    patch('keywords', props.modelValue.keywords.slice(0, -1));
  }
}

function removeKeyword(index: number) {
  patch(
    'keywords',
    props.modelValue.keywords.filter((_, keywordIndex) => keywordIndex !== index),
  );
}

function submit() {
  if (props.disabled || props.loading) return;
  emit('submit', props.modelValue);
}

function clear() {
  keywordDraft.value = '';
  emit('update:modelValue', defaultPdfMetadata());
  emit('reset');
}
</script>

<template>
  <form :class="cn('spdf grid gap-5', props.class)" @submit.prevent="submit">
    <div class="grid gap-4 sm:grid-cols-2">
      <Field v-slot="{ id, describedBy }" label="Title" description="Shown in readers and document properties." class="sm:col-span-2">
        <Input
          :id="id"
          :model-value="metadata.title"
          :aria-describedby="describedBy"
          :disabled="props.disabled"
          maxlength="200"
          placeholder="e.g. Quarterly report 2026"
          @update:model-value="patch('title', String($event))"
        />
      </Field>

      <Field v-slot="{ id, describedBy }" label="Author">
        <Input
          :id="id"
          :model-value="metadata.author"
          :aria-describedby="describedBy"
          :disabled="props.disabled"
          placeholder="e.g. Ada Lovelace"
          @update:model-value="patch('author', String($event))"
        />
      </Field>

      <Field v-slot="{ id, describedBy }" label="Subject">
        <Input
          :id="id"
          :model-value="metadata.subject"
          :aria-describedby="describedBy"
          :disabled="props.disabled"
          placeholder="e.g. Annual financial results"
          @update:model-value="patch('subject', String($event))"
        />
      </Field>

      <Field
        v-slot="{ id, describedBy }"
        label="Keywords"
        description="Press Enter or comma to add a keyword."
        class="sm:col-span-2"
      >
        <div
          class="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 shadow-xs transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30"
        >
          <span
            v-for="(keyword, index) in metadata.keywords"
            :key="`${keyword}-${index}`"
            class="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
          >
            {{ keyword }}
            <button
              type="button"
              class="rounded-full text-muted-foreground transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              :aria-label="`Remove keyword ${keyword}`"
              :disabled="props.disabled"
              @click="removeKeyword(index)"
            >
              <X class="size-3" aria-hidden="true" />
            </button>
          </span>
          <input
            :id="id"
            v-model="keywordDraft"
            :aria-describedby="describedBy"
            :disabled="props.disabled"
            class="h-6 min-w-32 flex-1 border-0 bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            placeholder="Add a keyword"
            @keydown="onKeywordKeydown"
            @blur="addKeywords(keywordDraft)"
          />
        </div>
      </Field>

      <Field v-slot="{ id, describedBy }" label="Creator">
        <Input
          :id="id"
          :model-value="metadata.creator"
          :aria-describedby="describedBy"
          :disabled="props.disabled"
          placeholder="Application that created the file"
          @update:model-value="patch('creator', String($event))"
        />
      </Field>

      <Field v-slot="{ id, describedBy }" label="Producer">
        <Input
          :id="id"
          :model-value="metadata.producer"
          :aria-describedby="describedBy"
          :disabled="props.disabled"
          placeholder="PDF producer"
          @update:model-value="patch('producer', String($event))"
        />
      </Field>
    </div>

    <div v-if="props.showActions" class="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <Button type="button" variant="ghost" size="sm" :disabled="props.disabled || props.loading" @click="clear">
        Clear all
      </Button>
      <div class="flex flex-col-reverse gap-2 sm:flex-row">
        <slot name="actions" :metadata="metadata" :submit="submit">
          <Button type="submit" :loading="props.loading" :disabled="props.disabled">{{ props.submitLabel }}</Button>
        </slot>
      </div>
    </div>
  </form>
</template>
