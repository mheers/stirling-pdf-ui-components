import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import PdfThumbnailSidebar from './PdfThumbnailSidebar.vue';
import { handbookUrl } from '../../storybook/fixtures';

const meta = {
  title: 'Components/PdfThumbnailSidebar',
  component: PdfThumbnailSidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A narrow, scrollable page rail. The current page is highlighted and scrolled into view as it changes; clicking a thumbnail emits the requested page.',
      },
    },
  },
  args: {
    source: handbookUrl,
    pageCount: 12,
    currentPage: 3,
    title: 'Pages',
    onSelect: fn(),
    onClose: fn(),
  },
  render: (args) => ({
    components: { PdfThumbnailSidebar },
    setup() {
      const page = ref(args.currentPage);
      const select = (value: number) => {
        page.value = value;
      };
      return { args, page, select };
    },
    template: `
      <div class="flex h-[620px] max-w-full overflow-hidden rounded-xl border border-border">
        <PdfThumbnailSidebar v-bind="args" :current-page="page" @select="select" />
        <div class="grid flex-1 place-items-center bg-pdf-canvas text-xs text-muted-foreground">
          Page {{ page }}
        </div>
      </div>
    `,
  }),
} satisfies Meta<typeof PdfThumbnailSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FirstPage: Story = {
  args: { currentPage: 1 },
};

export const Loading: Story = {
  args: { source: null, pageCount: 0 },
};
