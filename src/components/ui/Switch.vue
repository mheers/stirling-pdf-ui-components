<script setup lang="ts">
import { computed } from 'vue';
import { SwitchRoot, SwitchThumb } from 'reka-ui';
import { cn } from '../../lib/cn';
import { useSpdfUi } from './context';

interface Props {
  id?: string;
  disabled?: boolean;
  class?: string;
}

const props = defineProps<Props>();
const model = defineModel<boolean>({ default: false });
const ui = useSpdfUi();
const hostSwitch = computed(() => ui.components?.Switch);
</script>

<template>
  <component
    :is="hostSwitch"
    v-if="hostSwitch"
    :id="props.id"
    :model-value="model"
    :disabled="props.disabled"
    :class="props.class"
    @update:model-value="model = $event as boolean"
  />
  <SwitchRoot
    v-else
    :id="props.id"
    :model-value="model"
    :disabled="props.disabled"
    :class="
      cn(
        'spdf peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input transition-colors',
        'focus-visible:ring-[3px] focus-visible:ring-ring/35 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-primary',
        props.class,
      )
    "
    @update:model-value="model = $event"
  >
    <SwitchThumb
      class="pointer-events-none block size-4 translate-x-0.5 rounded-full bg-white shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[18px]"
    />
  </SwitchRoot>
</template>
