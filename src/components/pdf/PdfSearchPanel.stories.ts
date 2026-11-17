import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import PdfSearchPanelDemo from '../../storybook/PdfSearchPanelDemo.vue';
import { sampleSearchResults } from '../../storybook/fixtures';

const meta: Meta = {
  title: 'Components/PdfSearchPanel',
  component: PdfSearchPanelDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The search panel used by the viewer. Results are grouped by page, snippets are highlighted, and selecting a result asks the viewer to jump to that page.',
      },
    },
  },
  args: {
    initialQuery: 'document',
    results: sampleSearchResults,
    searching: false,
    onSelect: fn(),
    onClose: fn(),
  },
  render: (args) => ({
    components: { PdfSearchPanelDemo },
    setup: () => ({ args }),
    template: '<div class="mx-auto max-w-3xl"><PdfSearchPanelDemo v-bind="args" /></div>',
  }),
};

export default meta;
type Story = StoryObj;

export const Results: Story = {};

export const Searching: Story = {
  args: { results: null, searching: true },
};

export const NoMatches: Story = {
  args: {
    initialQuery: 'not-a-real-word',
    results: { query: 'not-a-real-word', total: 0, matches: [], byPage: [], truncated: false },
  },
};
