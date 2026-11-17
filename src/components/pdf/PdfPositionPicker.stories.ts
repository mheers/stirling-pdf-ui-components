import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import PdfPositionPicker from './PdfPositionPicker.vue';

const meta = {
  title: 'Components/PdfPositionPicker',
  component: PdfPositionPicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A compact nine-point anchor picker used by watermarks and page numbers. Each point is a radio with a text label for screen readers.',
      },
    },
  },
  args: {
    modelValue: 'middle-center',
    disabled: false,
  },
  render: (args) => ({
    components: { PdfPositionPicker },
    setup() {
      const position = ref(args.modelValue);
      return { args, position };
    },
    template: '<PdfPositionPicker v-bind="args" v-model="position" />',
  }),
} satisfies Meta<typeof PdfPositionPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Center: Story = {};

export const BottomRight: Story = {
  args: { modelValue: 'bottom-right' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
