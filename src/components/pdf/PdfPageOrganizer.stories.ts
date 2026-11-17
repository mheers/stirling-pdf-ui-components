import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import PdfPageOrganizer from './PdfPageOrganizer.vue';
import { handbookUrl, organizerItems } from '../../storybook/fixtures';
import type { PageOrganizerItem } from '../../lib/types';

const meta = {
  title: 'Components/PdfPageOrganizer',
  component: PdfPageOrganizer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The flagship page editor. Reorder by drag or keyboard, rotate, duplicate, delete, and insert blank pages with full undo, redo, and reset. Every change is emitted as a `PageOrganizerItem[]` ready for a backend operation.',
      },
    },
  },
  args: {
    source: handbookUrl,
    pageCount: 12,
    columns: 'auto',
    thumbnailWidth: 150,
    showToolbar: true,
    disabled: false,
    onChange: fn(),
    onSelectionChange: fn(),
    onRotate: fn(),
    onRemove: fn(),
    onDuplicate: fn(),
    onAddBlank: fn(),
    onReorder: fn(),
    onReset: fn(),
  },
  render: (args) => ({
    components: { PdfPageOrganizer },
    setup() {
      const pages = ref<PageOrganizerItem[]>(organizerItems(12));
      return { args, pages };
    },
    template: '<div class="mx-auto max-w-6xl"><PdfPageOrganizer v-bind="args" v-model="pages" /></div>',
  }),
} satisfies Meta<typeof PdfPageOrganizer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const edited: PageOrganizerItem[] = [
  { id: 'page-1', page: 1, rotation: 0 },
  { id: 'page-2', page: 2, rotation: 90 },
  { id: 'copy-1', page: 2, rotation: 90 },
  { id: 'page-3', page: 3, rotation: 0 },
  { id: 'blank-1', page: 0, rotation: 0, blank: true },
  { id: 'page-5', page: 5, rotation: 180 },
  { id: 'page-6', page: 6, rotation: 0 },
  { id: 'page-7', page: 7, rotation: 0 },
];

export const EditedOrder: Story = {
  render: (args) => ({
    components: { PdfPageOrganizer },
    setup() {
      const pages = ref<PageOrganizerItem[]>(edited.map((page) => ({ ...page })));
      return { args, pages };
    },
    template: '<div class="mx-auto max-w-6xl"><PdfPageOrganizer v-bind="args" v-model="pages" /></div>',
  }),
};

export const SixColumns: Story = {
  args: { columns: 6, thumbnailWidth: 110 },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const NoToolbar: Story = {
  args: { showToolbar: false },
};
