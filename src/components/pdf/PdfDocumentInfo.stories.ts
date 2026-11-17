import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import PdfDocumentInfo from './PdfDocumentInfo.vue';
import { handbookUrl, invoiceUrl } from '../../storybook/fixtures';

const meta = {
  title: 'Components/PdfDocumentInfo',
  component: PdfDocumentInfo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Read-only document statistics and metadata. Loads the PDF.js document lazily and emits the parsed statistics for use elsewhere in the page.',
      },
    },
  },
  args: {
    source: handbookUrl,
    showMetadata: true,
    onLoaded: fn(),
  },
  render: (args) => ({
    components: { PdfDocumentInfo },
    setup: () => ({ args }),
    template: '<div class="mx-auto max-w-xl"><PdfDocumentInfo v-bind="args" /></div>',
  }),
} satisfies Meta<typeof PdfDocumentInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Handbook: Story = {};

export const Invoice: Story = {
  args: { source: invoiceUrl },
};

export const WithoutMetadata: Story = {
  args: { showMetadata: false },
};
