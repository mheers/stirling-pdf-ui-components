import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import PdfToolCard from './PdfToolCard.vue';
import { sampleTools } from '../../storybook/fixtures';

const meta = {
  title: 'Components/PdfToolCard',
  component: PdfToolCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The entry point for a tool catalog. A whole card is one target, with a hover lift, a clear icon tile, and an optional badge.',
      },
    },
  },
  args: {
    tool: sampleTools[0],
    featured: false,
    onSelect: fn(),
  },
  render: (args) => ({
    components: { PdfToolCard },
    setup: () => ({ args }),
    template: '<div class="max-w-sm"><PdfToolCard v-bind="args" /></div>',
  }),
} satisfies Meta<typeof PdfToolCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NewBadge: Story = {
  args: { tool: sampleTools[2] },
};

export const BetaBadge: Story = {
  args: { tool: sampleTools[5] },
};

export const ProBadge: Story = {
  args: { tool: sampleTools[9] },
};

export const Featured: Story = {
  args: { tool: sampleTools[0], featured: true },
};

export const WithoutDescription: Story = {
  args: { tool: { ...sampleTools[3], description: undefined } },
};

export const Disabled: Story = {
  args: { tool: { ...sampleTools[0], disabled: true } },
};
