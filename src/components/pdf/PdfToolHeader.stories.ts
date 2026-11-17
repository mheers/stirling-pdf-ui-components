import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { Download, Scissors } from '@lucide/vue';
import PdfToolHeader from './PdfToolHeader.vue';

const meta = {
  title: 'Components/PdfToolHeader',
  component: PdfToolHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The consistent header for a tool page: an icon tile, title, description, optional badge, back action, and a slot for page-level actions.',
      },
    },
  },
  args: {
    title: 'Split PDF',
    description: 'Break a document into ranges, fixed-size chunks, or single pages.',
    backLabel: 'All tools',
    onBack: fn(),
  },
  render: (args) => ({
    components: { PdfToolHeader, Download },
    setup: () => ({ args, Scissors }),
    template: `
      <div class="max-w-4xl">
        <PdfToolHeader v-bind="args" :icon="Scissors">
          <template #actions>
            <button class="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-xs">
              <Download class="size-3.5" /> Export
            </button>
          </template>
        </PdfToolHeader>
      </div>
    `,
  }),
} satisfies Meta<typeof PdfToolHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithBadge: Story = {
  args: { badge: 'Beta' },
};

export const WithoutBack: Story = {
  args: { backLabel: undefined },
};
