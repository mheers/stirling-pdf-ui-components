import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import PdfToolGrid from './PdfToolGrid.vue';
import { sampleTools } from '../../storybook/fixtures';

const meta = {
  title: 'Components/PdfToolGrid',
  component: PdfToolGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A searchable, filterable catalog of tools. Categories are derived from the tool data, and the grid is responsive without media-query props.',
      },
    },
  },
  args: {
    tools: sampleTools,
    searchable: true,
    groupByCategory: false,
    showCount: true,
    loading: false,
    onSelect: fn(),
  },
  render: (args) => ({
    components: { PdfToolGrid },
    setup() {
      const query = ref('');
      return { args, query };
    },
    template: '<div class="mx-auto max-w-6xl"><PdfToolGrid v-bind="args" v-model:query="query" /></div>',
  }),
} satisfies Meta<typeof PdfToolGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const GroupedByCategory: Story = {
  args: { groupByCategory: true },
};

export const Loading: Story = {
  args: { loading: true, tools: [] },
};

export const Empty: Story = {
  args: {
    tools: [],
    emptyTitle: 'No tools available',
    emptyDescription: 'Your administrator has not enabled any PDF tools yet.',
  },
};

export const WithoutSearch: Story = {
  args: { searchable: false },
};
