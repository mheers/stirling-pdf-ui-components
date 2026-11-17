import type { Meta, StoryObj } from '@storybook/vue3-vite';
import PrimitivesShowcase from './PrimitivesShowcase.vue';

const meta = {
  title: 'Foundations/Primitives',
  component: PrimitivesShowcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The shadcn-vue-style primitives used by the PDF components. Every primitive is exported, so you can build your own tool surfaces with the same language.',
      },
    },
  },
} satisfies Meta<typeof PrimitivesShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => ({
    components: { PrimitivesShowcase },
    template: '<PrimitivesShowcase />',
  }),
};
