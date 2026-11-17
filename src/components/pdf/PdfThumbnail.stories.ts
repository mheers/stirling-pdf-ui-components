import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import PdfThumbnail from './PdfThumbnail.vue';
import { handbookUrl } from '../../storybook/fixtures';

const meta = {
  title: 'Components/PdfThumbnail',
  component: PdfThumbnail,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A lazily rendered page thumbnail. It shares one PDF.js document across every thumbnail of the same source, and only paints when it approaches the viewport.',
      },
    },
  },
  args: {
    source: handbookUrl,
    page: 1,
    width: 160,
    rotation: 0,
    selected: false,
    selectable: false,
    showNumber: true,
    lazy: true,
    onSelect: fn(),
    onOpen: fn(),
  },
  render: (args) => ({
    components: { PdfThumbnail },
    setup: () => ({ args }),
    template: '<div class="max-w-xs"><PdfThumbnail v-bind="args" /></div>',
  }),
} satisfies Meta<typeof PdfThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true, selectable: true },
};

export const Rotated: Story = {
  args: { rotation: 90 },
};

export const PageThree: Story = {
  args: { page: 3 },
};

export const Large: Story = {
  args: { width: 240, page: 6 },
};

export const WithoutNumber: Story = {
  args: { showNumber: false },
};
