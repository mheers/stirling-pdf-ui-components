<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Check, Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-vue-next';
import { cn } from '../../lib/cn';
import type { PdfPasswordOptions, PdfPermissions } from '../../lib/types';
import Alert from '../ui/Alert.vue';
import Button from '../ui/Button.vue';
import Checkbox from '../ui/Checkbox.vue';
import Field from '../ui/Field.vue';
import Input from '../ui/Input.vue';
import Switch from '../ui/Switch.vue';

interface Props {
  modelValue: PdfPasswordOptions;
  mode?: 'protect' | 'unlock';
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  requireConfirm?: boolean;
  showStrength?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'protect',
  disabled: false,
  loading: false,
  requireConfirm: true,
  showStrength: true,
});

const emit = defineEmits<{
  'update:modelValue': [options: PdfPasswordOptions];
  submit: [password: string, options: PdfPasswordOptions];
}>();

const visible = ref(false);
const capsLock = ref(false);
const showOwner = ref(false);
const validationError = ref('');

const password = computed(() => props.modelValue.password);
const confirm = computed(() => props.modelValue.confirmPassword);

watch([password, confirm], () => {
  if (validationError.value) validationError.value = '';
});

const strength = computed(() => {
  const value = password.value;
  const checks = [
    value.length >= 8,
    value.length >= 12,
    /[a-z]/.test(value) && /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['Very weak', 'Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const tones = ['bg-destructive', 'bg-destructive', 'bg-warning', 'bg-warning', 'bg-primary', 'bg-success'];
  return {
    score,
    checks,
    label: labels[score] ?? 'Very weak',
    tone: tones[score] ?? 'bg-destructive',
    segments: [1, 2, 3, 4].map((segment) => segment <= Math.ceil((score / 5) * 4)),
  };
});

const permissionLabels: { key: keyof PdfPermissions; label: string; description: string }[] = [
  { key: 'printing', label: 'Printing', description: 'Allow printing the document.' },
  { key: 'copying', label: 'Copying text', description: 'Allow copying text and images.' },
  { key: 'modifying', label: 'Modifying', description: 'Allow editing pages and content.' },
  { key: 'annotating', label: 'Annotating', description: 'Allow comments and annotations.' },
  { key: 'formFilling', label: 'Form filling', description: 'Allow filling in interactive forms.' },
  { key: 'accessibility', label: 'Accessibility', description: 'Allow screen readers to extract text.' },
];

function patch<K extends keyof PdfPasswordOptions>(key: K, value: PdfPasswordOptions[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}

function patchPermission(key: keyof PdfPermissions) {
  patch('permissions', {
    ...props.modelValue.permissions,
    [key]: !props.modelValue.permissions[key],
  });
}

function checkCaps(event: KeyboardEvent) {
  capsLock.value = event.getModifierState?.('CapsLock') ?? false;
}

function submit() {
  validationError.value = '';

  if (!password.value) {
    validationError.value = 'Enter a password.';
    return;
  }
  if (props.mode === 'protect' && props.requireConfirm && password.value !== confirm.value) {
    validationError.value = 'The passwords don’t match.';
    return;
  }
  if (props.mode === 'protect' && password.value.length < 4) {
    validationError.value = 'Use at least 4 characters.';
    return;
  }

  emit('submit', password.value, props.modelValue);
}
</script>

<template>
  <form :class="cn('spdf grid gap-5', props.class)" @submit.prevent="submit">
    <div class="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
      <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Lock v-if="props.mode === 'protect'" class="size-4" aria-hidden="true" />
        <KeyRound v-else class="size-4" aria-hidden="true" />
      </div>
      <div class="min-w-0">
        <p class="text-sm font-medium text-foreground">
          {{ props.mode === 'protect' ? 'Encrypt this PDF with a password' : 'Unlock a protected PDF' }}
        </p>
        <p class="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {{
            props.mode === 'protect'
              ? 'Readers will need this password before they can open the document.'
              : 'Enter the document’s open password to continue.'
          }}
        </p>
      </div>
    </div>

    <div class="grid gap-4">
      <Field
        v-slot="{ id, describedBy, invalid }"
        :label="props.mode === 'protect' ? 'Password' : 'Document password'"
        :error="validationError"
        :description="props.mode === 'protect' ? 'At least 8 characters is recommended.' : undefined"
        required
      >
        <div class="relative">
          <Input
            :id="id"
            :model-value="password"
            :type="visible ? 'text' : 'password'"
            :aria-describedby="describedBy"
            :aria-invalid="invalid || undefined"
            :disabled="props.disabled"
            autocomplete="new-password"
            placeholder="Enter a password"
            class="pr-10"
            @update:model-value="patch('password', String($event))"
            @keydown="checkCaps"
            @keyup="checkCaps"
          />
          <button
            type="button"
            class="absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
            :aria-label="visible ? 'Hide password' : 'Show password'"
            @click="visible = !visible"
          >
            <EyeOff v-if="visible" class="size-3.5" aria-hidden="true" />
            <Eye v-else class="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </Field>

      <p v-if="capsLock" class="-mt-2 flex items-center gap-1 text-[11px] text-warning-foreground">
        <ShieldCheck class="size-3.5" aria-hidden="true" />
        Caps Lock is on.
      </p>

      <div v-if="props.mode === 'protect' && props.showStrength" class="grid gap-1.5">
        <div class="flex gap-1" aria-hidden="true">
          <span
            v-for="(segment, index) in strength.segments"
            :key="index"
            class="h-1.5 flex-1 rounded-full transition-colors"
            :class="segment ? strength.tone : 'bg-muted'"
          />
        </div>
        <div class="flex items-center justify-between gap-2 text-[11px]">
          <span class="text-muted-foreground">Password strength</span>
          <span class="font-medium text-foreground">{{ strength.label }}</span>
        </div>
        <ul class="mt-1 grid gap-1 sm:grid-cols-2">
          <li v-for="(check, index) in strength.checks" :key="index" class="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span class="grid size-3.5 place-items-center rounded-full" :class="check ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground/50'">
              <Check v-if="check" class="size-2.5" aria-hidden="true" />
            </span>
            {{ ['8+ characters', '12+ characters', 'Upper & lowercase', 'A number', 'A symbol'][index] }}
          </li>
        </ul>
      </div>

      <Field
        v-if="props.mode === 'protect' && props.requireConfirm"
        v-slot="{ id, describedBy, invalid }"
        label="Confirm password"
        :error="confirm && password !== confirm ? 'Passwords don’t match.' : undefined"
        required
      >
        <Input
          :id="id"
          :model-value="confirm"
          :type="visible ? 'text' : 'password'"
          :aria-describedby="describedBy"
          :aria-invalid="invalid || undefined"
          :disabled="props.disabled"
          autocomplete="new-password"
          placeholder="Repeat the password"
          @update:model-value="patch('confirmPassword', String($event))"
        />
      </Field>
    </div>

    <template v-if="props.mode === 'protect'">
      <div class="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
        <div>
          <p class="text-sm font-medium text-foreground">Set a separate owner password</p>
          <p class="text-xs text-muted-foreground">Controls permissions when the document is opened with the user password.</p>
        </div>
        <Switch v-model="showOwner" aria-label="Set a separate owner password" />
      </div>

      <Field v-if="showOwner" label="Owner password" description="Optional. Leave empty to use the same password.">
        <Input
          :model-value="props.modelValue.ownerPassword"
          type="password"
          autocomplete="new-password"
          placeholder="Owner password"
          :disabled="props.disabled"
          @update:model-value="patch('ownerPassword', String($event))"
        />
      </Field>

      <div class="grid gap-3">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-medium text-foreground">Permissions</p>
          <span class="text-[11px] text-muted-foreground">After opening with the user password</span>
        </div>
        <div class="grid gap-2 sm:grid-cols-2">
          <div
            v-for="permission in permissionLabels"
            :key="permission.key"
            class="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border p-3 transition-colors hover:bg-accent/40"
            @click="patchPermission(permission.key)"
          >
            <span class="mt-0.5" @click.stop>
              <Checkbox
                :model-value="props.modelValue.permissions[permission.key]"
                :aria-label="permission.label"
                :disabled="props.disabled"
                @update:model-value="patchPermission(permission.key)"
              />
            </span>
            <span class="min-w-0">
              <span class="block text-sm font-medium text-foreground">{{ permission.label }}</span>
              <span class="block text-[11px] leading-relaxed text-muted-foreground">{{ permission.description }}</span>
            </span>
          </div>
        </div>
      </div>
    </template>

    <Alert v-if="props.error && !validationError" variant="destructive" :title="props.error" />

    <div class="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
      <slot name="actions" :submit="submit">
        <Button type="submit" :loading="props.loading" :disabled="props.disabled">
          <Lock v-if="props.mode === 'protect'" />
          <KeyRound v-else />
          {{ props.mode === 'protect' ? 'Protect PDF' : 'Unlock PDF' }}
        </Button>
      </slot>
    </div>
  </form>
</template>
