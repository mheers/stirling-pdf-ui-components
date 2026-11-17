import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import CompressionSettings from './CompressionSettings.vue';
import { defaultCompressionOptions } from '../../lib/defaults';
import type { CompressionOptions } from '../../lib/types';

const meta = {
  title: 'Components/CompressionSettings',
  component: CompressionSettings,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Three opinionated compression presets, plus custom quality and DPI. When the original size is provided, the panel estimates the output size and savings.',
      },
    },
  },
  args: {
    modelValue: defaultCompressionOptions(),
    originalSize: 2_411_520,
    disabled: false,
    onChange: fn(),
  },
  render: (args) => ({
    components: { CompressionSettings },
    setup() {
      const options = ref<CompressionOptions>({ ...(args.modelValue as CompressionOptions) });
      return { args, options };
    },
    template: '<div class="mx-auto max-w-3xl"><CompressionSettings v-bind="args" v-model="options" /></div>',
  }),
} satisfies Meta<typeof CompressionSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Balanced: Story = {};

export const SmallFile: Story = {
  args: {
    modelValue: { ...defaultCompressionOptions(), level: 'high', quality: 55, dpi: 100 },
  },
};

export const PrintQuality: Story = {
  args: {
    modelValue: { ...defaultCompressionOptions(), level: 'low', quality: 90, dpi: 200 },
  },
};

export const Custom: Story = {
  args: {
    modelValue: {
      ...defaultCompressionOptions(),
      level: 'custom',
      quality: 82,
      dpi: 300,
      grayscale: true,
      optimizeImages: false,
    },
  },
};

export const WithoutOriginalSize: Story = {
  args: { originalSize: undefined },
};

export const Disabled: Story = {
  args: { disabled: true },
};
