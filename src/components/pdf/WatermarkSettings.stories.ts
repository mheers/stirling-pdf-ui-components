import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import WatermarkSettings from './WatermarkSettings.vue';
import { defaultWatermarkOptions } from '../../lib/defaults';
import { stampUrl } from '../../storybook/fixtures';
import type { WatermarkOptions } from '../../lib/types';

const meta = {
  title: 'Components/WatermarkSettings',
  component: WatermarkSettings,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Text or image watermark settings with a live page preview, nine-point position picker, color swatches, opacity, rotation, tiling, and a page range.',
      },
    },
  },
  args: {
    modelValue: defaultWatermarkOptions(),
    pageCount: 12,
    disabled: false,
    onChange: fn(),
  },
  render: (args) => ({
    components: { WatermarkSettings },
    setup() {
      const options = ref<WatermarkOptions>({ ...(args.modelValue as WatermarkOptions) });
      return { args, options };
    },
    template: '<div class="mx-auto max-w-5xl"><WatermarkSettings v-bind="args" v-model="options" /></div>',
  }),
} satisfies Meta<typeof WatermarkSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {};

export const Tiled: Story = {
  args: {
    modelValue: { ...defaultWatermarkOptions(), tile: true, opacity: 12, rotation: -25 },
  },
};

export const Image: Story = {
  args: {
    modelValue: {
      ...defaultWatermarkOptions(),
      type: 'image',
      imageUrl: stampUrl,
      opacity: 80,
      rotation: -8,
      position: 'bottom-right',
    },
  },
};

export const TopRight: Story = {
  args: {
    modelValue: {
      ...defaultWatermarkOptions(),
      text: 'DRAFT',
      position: 'top-right',
      rotation: 0,
      opacity: 45,
      fontSize: 64,
    },
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
