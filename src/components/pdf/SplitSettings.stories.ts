import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import SplitSettings from './SplitSettings.vue';
import { defaultSplitOptions } from '../../lib/defaults';
import type { SplitOptions } from '../../lib/types';

const meta = {
  title: 'Components/SplitSettings',
  component: SplitSettings,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Split by fixed-size chunks, custom ranges, or one file per page. The output preview lists the generated filenames and page counts before the request is sent.',
      },
    },
  },
  args: {
    modelValue: { ...defaultSplitOptions(), everyN: 3 },
    pageCount: 12,
    filename: 'pdf-workflow-handbook.pdf',
    disabled: false,
    onChange: fn(),
  },
  render: (args) => ({
    components: { SplitSettings },
    setup() {
      const options = ref<SplitOptions>({ ...(args.modelValue as SplitOptions) });
      return { args, options };
    },
    template: '<div class="mx-auto max-w-3xl"><SplitSettings v-bind="args" v-model="options" /></div>',
  }),
} satisfies Meta<typeof SplitSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EveryThreePages: Story = {};

export const CustomRanges: Story = {
  args: {
    modelValue: { ...defaultSplitOptions(), mode: 'ranges', ranges: '1-4, 5-8, 9-12' },
  },
};

export const EveryPage: Story = {
  args: {
    modelValue: { ...defaultSplitOptions(), mode: 'each' },
  },
};

export const InvalidRange: Story = {
  args: {
    modelValue: { ...defaultSplitOptions(), mode: 'ranges', ranges: '1-4, 99' },
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
