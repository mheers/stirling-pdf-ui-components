import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import PdfFileCard from './PdfFileCard.vue';
import { sampleFiles } from '../../storybook/fixtures';

const meta = {
  title: 'Components/PdfFileCard',
  component: PdfFileCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A file row with a thumbnail, status badge, progress bar, error message, and optional selection. Used by upload queues, merge lists, and result panels.',
      },
    },
  },
  args: {
    removable: true,
    selectable: false,
    onRemove: fn(),
    onOpen: fn(),
    onRetry: fn(),
    onSelect: fn(),
  },
  render: (args) => ({
    components: { PdfFileCard },
    setup: () => ({ args }),
    template: '<div class="max-w-2xl"><PdfFileCard v-bind="args" /></div>',
  }),
} satisfies Meta<typeof PdfFileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  args: {
    file: sampleFiles[0],
  },
};

export const Uploading: Story = {
  args: {
    file: sampleFiles[1],
  },
};

export const Processing: Story = {
  args: {
    file: sampleFiles[3],
  },
};

export const Failed: Story = {
  args: {
    file: sampleFiles[2],
  },
};

export const Selected: Story = {
  args: {
    file: sampleFiles[0],
    selectable: true,
    selected: true,
  },
};

export const Dense: Story = {
  args: {
    file: sampleFiles[0],
    dense: true,
    removable: false,
  },
};

export const Disabled: Story = {
  args: {
    file: sampleFiles[0],
    disabled: true,
  },
};
