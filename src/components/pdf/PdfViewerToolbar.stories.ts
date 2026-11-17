import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import PdfViewerToolbar from './PdfViewerToolbar.vue';

const meta = {
  title: 'Components/PdfViewerToolbar',
  component: PdfViewerToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The standalone viewer toolbar. Compose it with your own canvas when you need a custom viewer but want the familiar navigation, zoom, and action controls.',
      },
    },
  },
  args: {
    page: 3,
    pageCount: 12,
    zoom: 1,
    filename: 'pdf-workflow-handbook.pdf',
    sidebarOpen: false,
    searchOpen: false,
    showSidebarToggle: true,
    showSearch: true,
    canDownload: true,
    canPrint: true,
    fullscreen: false,
    onZoomIn: fn(),
    onZoomOut: fn(),
    onResetZoom: fn(),
    onFitWidth: fn(),
    onFitPage: fn(),
    onRotate: fn(),
    onToggleSidebar: fn(),
    onToggleSearch: fn(),
    onDownload: fn(),
    onPrint: fn(),
    onFullscreen: fn(),
  },
  render: (args) => ({
    components: { PdfViewerToolbar },
    setup() {
      const page = ref(args.page);
      return { args, page };
    },
    template: '<div class="mx-auto max-w-4xl overflow-hidden rounded-xl border border-border"><PdfViewerToolbar v-bind="args" :page="page" @update:page="page = $event" /></div>',
  }),
} satisfies Meta<typeof PdfViewerToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ActivePanels: Story = {
  args: { sidebarOpen: true, searchOpen: true },
};

export const WithoutFilename: Story = {
  args: { filename: undefined },
};

export const DownloadOnly: Story = {
  args: { showSearch: false, canPrint: false },
};
