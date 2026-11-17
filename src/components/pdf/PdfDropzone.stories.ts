import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import PdfDropzone from './PdfDropzone.vue';

const meta = {
  title: 'Components/PdfDropzone',
  component: PdfDropzone,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'An accessible drag-and-drop upload surface with file type, size, and count validation. The zone is keyboard operable and reports rejected files inline.',
      },
    },
  },
  args: {
    multiple: true,
    accept: ['application/pdf'],
    maxFiles: 20,
    maxSize: 100 * 1024 * 1024,
    disabled: false,
    loading: false,
    compact: false,
    onFiles: fn(),
    onReject: fn(),
    onError: fn(),
  },
  render: (args) => ({
    components: { PdfDropzone },
    setup: () => ({ args }),
    template: '<PdfDropzone v-bind="args" />',
  }),
} satisfies Meta<typeof PdfDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    compact: true,
    multiple: false,
    accept: ['image/png', 'image/jpeg'],
    title: 'Upload a stamp',
    description: 'PNG or JPG up to 10 MB',
    maxSize: 10 * 1024 * 1024,
  },
};

export const SingleFile: Story = {
  args: {
    multiple: false,
    title: 'Drop a PDF here',
    description: 'or click to choose a file',
    maxFiles: 1,
  },
};

export const Restricted: Story = {
  args: {
    maxFiles: 2,
    maxSize: 1.5 * 1024 * 1024,
    hint: 'PDF · up to 2 files · max 1.5 MB',
    title: 'Only two small files',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    title: 'Uploads are paused',
    description: 'An administrator has disabled new uploads.',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    title: 'Checking your files',
    description: 'This will only take a moment.',
  },
};
