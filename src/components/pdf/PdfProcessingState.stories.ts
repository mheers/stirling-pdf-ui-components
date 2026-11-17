import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import PdfProcessingState from './PdfProcessingState.vue';
import { sampleSteps } from '../../storybook/fixtures';

const meta = {
  title: 'Components/PdfProcessingState',
  component: PdfProcessingState,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Processing, success, and error feedback in one component. Supports determinate or indeterminate progress, step lists, cancellation, retry, and an overlay mode.',
      },
    },
  },
  args: {
    status: 'processing',
    progress: 64,
    title: 'Compressing your document',
    description: 'Images are being re-encoded at 150 DPI.',
    steps: sampleSteps,
    cancellable: true,
    onCancel: fn(),
    onRetry: fn(),
  },
  render: (args) => ({
    components: { PdfProcessingState },
    setup: () => ({ args }),
    template: '<div class="mx-auto max-w-xl"><PdfProcessingState v-bind="args" /></div>',
  }),
} satisfies Meta<typeof PdfProcessingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Determinate: Story = {};

export const Indeterminate: Story = {
  args: { progress: undefined, steps: undefined },
};

export const WithoutSteps: Story = {
  args: { steps: undefined },
};

export const Success: Story = {
  args: {
    status: 'success',
    progress: 100,
    title: 'Your document is ready',
    description: 'The compressed PDF is ready to download.',
    steps: undefined,
    cancellable: false,
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    progress: undefined,
    title: 'Compression failed',
    error: 'The server returned an unexpected response. Try again in a moment.',
    steps: undefined,
    cancellable: false,
  },
};

export const Compact: Story = {
  args: { compact: true, steps: undefined, cancellable: false },
};

export const Overlay: Story = {
  render: (args) => ({
    components: { PdfProcessingState },
    setup: () => ({ args }),
    template: `
      <div class="relative mx-auto h-[420px] max-w-2xl overflow-hidden rounded-xl border border-border bg-pdf-canvas">
        <div class="grid h-full place-items-center p-8 text-sm text-muted-foreground">
          The document workspace stays visible behind the overlay.
        </div>
        <PdfProcessingState v-bind="args" overlay />
      </div>
    `,
  }),
};
