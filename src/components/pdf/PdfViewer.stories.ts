import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import PdfViewer from './PdfViewer.vue';
import { handbookUrl } from '../../storybook/fixtures';

const meta = {
  title: 'Components/PdfViewer',
  component: PdfViewer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A complete continuous-scroll PDF viewer: lazy page rendering, selectable text, zoom and fit modes, rotation, thumbnails, in-document search with highlights, download, print, fullscreen, and a password unlock dialog.',
      },
    },
  },
  args: {
    source: handbookUrl,
    filename: 'pdf-workflow-handbook.pdf',
    initialPage: 1,
    showToolbar: true,
    showThumbnails: false,
    showSearch: true,
    textLayer: true,
    allowDownload: true,
    allowPrint: false,
    onLoaded: fn(),
    onError: fn(),
    onPageChange: fn(),
    onDownload: fn(),
    onPrint: fn(),
    onPasswordRequired: fn(),
  },
  render: (args) => ({
    components: { PdfViewer },
    setup: () => ({ args }),
    template: '<div class="mx-auto max-w-6xl"><PdfViewer v-bind="args" /></div>',
  }),
} satisfies Meta<typeof PdfViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PasswordProtected: Story = {
  args: {
    source: '/samples/protected.pdf',
    filename: 'protected.pdf',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The sample is encrypted with the open password **stirling**. The viewer opens the unlock dialog automatically and retries once the password is correct.',
      },
    },
  },
};

export const WithThumbnails: Story = {
  args: { showThumbnails: true },
};

export const OpenAtPageFive: Story = {
  args: { initialPage: 5 },
};

export const FitPage: Story = {
  args: { initialFit: 'page' },
};

export const WithoutTextLayer: Story = {
  args: { textLayer: false },
};

export const Minimal: Story = {
  args: { showToolbar: false, showSearch: false },
};

export const PrintEnabled: Story = {
  args: { allowPrint: true },
};
