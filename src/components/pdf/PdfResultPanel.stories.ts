import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import PdfResultPanel from './PdfResultPanel.vue';
import { sampleMultipleResults, sampleResults } from '../../storybook/fixtures';

const meta = {
  title: 'Components/PdfResultPanel',
  component: PdfResultPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The finish line: a success state, result files, download actions, savings summary, and a way to start over. Handles both single and batch results.',
      },
    },
  },
  args: {
    results: sampleResults,
    originalSize: 2_411_520,
    elapsedMs: 4200,
    showReset: true,
    onDownload: fn(),
    onPreview: fn(),
    onReset: fn(),
  },
  render: (args) => ({
    components: { PdfResultPanel },
    setup: () => ({ args }),
    template: '<div class="mx-auto max-w-2xl"><PdfResultPanel v-bind="args" /></div>',
  }),
} satisfies Meta<typeof PdfResultPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleFile: Story = {};

export const MultipleFiles: Story = {
  args: { results: sampleMultipleResults, originalSize: undefined },
};

export const WithoutStats: Story = {
  args: { originalSize: undefined, elapsedMs: undefined },
};

export const NoReset: Story = {
  args: { showReset: false },
};
