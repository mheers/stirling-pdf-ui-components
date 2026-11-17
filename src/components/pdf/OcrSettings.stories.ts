import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import OcrSettings from './OcrSettings.vue';
import { defaultOcrOptions } from '../../lib/defaults';
import type { OcrOptions } from '../../lib/types';

const meta = {
  title: 'Components/OcrSettings',
  component: OcrSettings,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'OCR language selection with search, three recognition modes, deskew/clean/rotate toggles, and output optimization. Warns when many languages are selected.',
      },
    },
  },
  args: {
    modelValue: defaultOcrOptions(),
    disabled: false,
    onChange: fn(),
  },
  render: (args) => ({
    components: { OcrSettings },
    setup() {
      const options = ref<OcrOptions>({ ...(args.modelValue as OcrOptions) });
      return { args, options };
    },
    template: '<div class="mx-auto max-w-3xl"><OcrSettings v-bind="args" v-model="options" /></div>',
  }),
} satisfies Meta<typeof OcrSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultiLanguage: Story = {
  args: {
    modelValue: { ...defaultOcrOptions(), languages: ['eng', 'deu', 'fra', 'nld'] },
  },
};

export const RedoExistingText: Story = {
  args: {
    modelValue: { ...defaultOcrOptions(), mode: 'redo', optimize: 2 },
  },
};

export const ForceAllPages: Story = {
  args: {
    modelValue: { ...defaultOcrOptions(), mode: 'force', rotatePages: true },
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
