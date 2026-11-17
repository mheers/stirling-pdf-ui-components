import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import PageRangeInput from './PageRangeInput.vue';

const meta = {
  title: 'Components/PageRangeInput',
  component: PageRangeInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A page selection input with parsing, validation, presets, a range summary, and an interactive page strip. Accepts `1-3, 5, 8-10`, `all`, `odd`, `even`, `last`, and open ranges such as `7-`.',
      },
    },
  },
  args: {
    modelValue: '1-3, 5, 8-10',
    pageCount: 12,
    label: 'Pages',
    showPresets: true,
    showPreview: true,
    showPageStrip: true,
    disabled: false,
    onChange: fn(),
    onPages: fn(),
  },
  render: (args) => ({
    components: { PageRangeInput },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<div class="max-w-xl"><PageRangeInput v-bind="args" v-model="value" /></div>',
  }),
} satisfies Meta<typeof PageRangeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllPages: Story = {
  args: { modelValue: 'all' },
};

export const OddPages: Story = {
  args: { modelValue: 'odd' },
};

export const InvalidRange: Story = {
  args: { modelValue: '1-3, 99' },
};

export const WithoutPageCount: Story = {
  args: { pageCount: undefined, modelValue: '1-3, 5' },
};

export const Compact: Story = {
  args: { showPresets: false, showPageStrip: false, modelValue: '2-4' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
