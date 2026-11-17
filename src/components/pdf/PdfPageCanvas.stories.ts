import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import PdfPageCanvasDemo from '../../storybook/PdfPageCanvasDemo.vue';
import { handbookUrl } from '../../storybook/fixtures';

const meta: Meta = {
  title: 'Components/PdfPageCanvas',
  component: PdfPageCanvasDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A single page canvas with scaled rendering, optional selectable text layer, and search highlight boxes. Useful for custom viewers that need their own chrome.',
      },
    },
  },
  args: {
    source: handbookUrl,
    page: 1,
    scale: 1,
    rotation: 0,
    textLayer: true,
    visible: true,
    onRendered: fn(),
    onError: fn(),
  },
  render: (args) => ({
    components: { PdfPageCanvasDemo },
    setup: () => ({ args }),
    template: '<div class="mx-auto w-fit max-w-full"><PdfPageCanvasDemo v-bind="args" /></div>',
  }),
};

export default meta;
type Story = StoryObj;

export const PageOne: Story = {};

export const PageSix: Story = {
  args: { page: 6, scale: 1.2 },
};

export const Rotated: Story = {
  args: { rotation: 90, scale: 1.1 },
};

export const Highlighted: Story = {
  args: { page: 3, searchQuery: 'document', scale: 1.2 },
};

export const Hidden: Story = {
  args: { visible: false, page: 4 },
};
