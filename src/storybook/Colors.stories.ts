import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ColorTokens from './ColorTokens.vue';

const meta = {
  title: 'Foundations/Colors',
  component: ColorTokens,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Semantic color tokens shared by every component. Override the CSS variables to match your brand; use the toolbar theme switch to inspect dark mode.',
      },
    },
  },
} satisfies Meta<typeof ColorTokens>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Palette: Story = {
  render: () => ({
    components: { ColorTokens },
    template: '<ColorTokens />',
  }),
};
