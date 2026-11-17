import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import PdfFileList from './PdfFileList.vue';
import { sampleFiles } from '../../storybook/fixtures';

const meta = {
  title: 'Components/PdfFileList',
  component: PdfFileList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A reorderable, selectable list of files. Drag the grip or press Alt+Arrow to reorder; click checkboxes to select, Shift-click for ranges.',
      },
    },
  },
  args: {
    modelValue: sampleFiles,
    reorderable: true,
    selectable: true,
    removable: true,
    dense: false,
    onRemove: fn(),
    onOpen: fn(),
    onRetry: fn(),
    onSelect: fn(),
    onReorder: fn(),
  },
  render: (args) => ({
    components: { PdfFileList },
    setup() {
      const files = ref(args.modelValue);
      const selected = ref<string[]>([]);
      return { args, files, selected };
    },
    template: `
      <div class="max-w-2xl">
        <PdfFileList
          v-model="files"
          v-model:selected-ids="selected"
          :reorderable="args.reorderable"
          :selectable="args.selectable"
          :removable="args.removable"
          :dense="args.dense"
          @remove="args.onRemove"
          @open="args.onOpen"
          @retry="args.onRetry"
          @select="args.onSelect"
          @reorder="args.onReorder"
        />
      </div>
    `,
  }),
} satisfies Meta<typeof PdfFileList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  render: (args) => ({
    components: { PdfFileList },
    setup() {
      const files = ref(args.modelValue);
      const selected = ref<string[]>(['file-handbook', 'file-invoice']);
      return { args, files, selected };
    },
    template: `
      <div class="max-w-2xl">
        <PdfFileList
          v-model="files"
          v-model:selected-ids="selected"
          selectable
          removable
          reorderable
          @remove="args.onRemove"
          @open="args.onOpen"
          @retry="args.onRetry"
          @select="args.onSelect"
          @reorder="args.onReorder"
        />
      </div>
    `,
  }),
};

export const Dense: Story = {
  args: { dense: true, selectable: false, reorderable: false },
};

export const Empty: Story = {
  args: {
    modelValue: [],
    emptyTitle: 'No PDFs added',
    emptyDescription: 'Drop a file above to build the merge queue.',
  },
};

export const Locked: Story = {
  args: { reorderable: false, removable: false, selectable: false },
};
