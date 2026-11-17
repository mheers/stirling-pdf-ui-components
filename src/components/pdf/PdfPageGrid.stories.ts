import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import PdfPageGrid from './PdfPageGrid.vue';
import { handbookUrl } from '../../storybook/fixtures';

const meta = {
  title: 'Components/PdfPageGrid',
  component: PdfPageGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A responsive grid of page thumbnails with single or multi-selection. Shift-click extends a range; Ctrl/Cmd-click toggles individual pages.',
      },
    },
  },
  args: {
    source: handbookUrl,
    pageCount: 12,
    selectionMode: 'multiple',
    columns: 'auto',
    thumbnailWidth: 140,
    showNumbers: true,
    disabled: false,
    onPageClick: fn(),
    onPageOpen: fn(),
  },
  render: (args) => ({
    components: { PdfPageGrid },
    setup() {
      const selected = ref<number[]>([]);
      return { args, selected };
    },
    template: '<div class="mx-auto max-w-5xl"><PdfPageGrid v-bind="args" v-model:selected="selected" /></div>',
  }),
} satisfies Meta<typeof PdfPageGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Preselected: Story = {
  render: (args) => ({
    components: { PdfPageGrid },
    setup() {
      const selected = ref([1, 2, 3, 5, 8]);
      return { args, selected };
    },
    template: '<div class="mx-auto max-w-5xl"><PdfPageGrid v-bind="args" v-model:selected="selected" /></div>',
  }),
};

export const SingleSelection: Story = {
  args: { selectionMode: 'single' },
};

export const FourColumns: Story = {
  args: { columns: 4, thumbnailWidth: 180 },
};

export const RotatedPages: Story = {
  args: { rotation: { 2: 90, 5: 180, 8: 270 } },
};

export const ReadOnly: Story = {
  args: { selectionMode: 'none' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
