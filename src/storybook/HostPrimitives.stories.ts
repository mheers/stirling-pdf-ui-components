import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { defineComponent } from 'vue';
import PdfViewerToolbar from '../components/pdf/PdfViewerToolbar.vue';
import { provideSpdfUi } from '../components/ui/context';

/**
 * A deliberately different host button: pill-shaped and primary-tinted. If
 * the toolbar renders these instead of the library's ghost icon buttons, the
 * primitive provider is working.
 */
const HostButton = defineComponent({
  name: 'HostButton',
  props: {
    variant: String,
    size: String,
    type: String,
    disabled: Boolean,
  },
  template: `
    <button
      :type="type"
      :disabled="disabled"
      class="inline-flex items-center justify-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm transition-colors hover:bg-primary/20 disabled:pointer-events-none disabled:opacity-50"
    >
      <slot />
    </button>
  `,
});

const meta = {
  title: 'Foundations/Host primitives',
  component: PdfViewerToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The same toolbar with a host Button supplied through `SpdfUiPlugin`. Use this pattern when your app already owns its shadcn-style primitives.',
      },
    },
  },
  args: {
    page: 2,
    pageCount: 12,
    zoom: 1,
    filename: 'pdf-workflow-handbook.pdf',
    canDownload: true,
    canPrint: true,
  },
  render: (args) => ({
    components: { PdfViewerToolbar },
    setup() {
      provideSpdfUi({ components: { Button: HostButton } });
      return { args };
    },
    template: '<div class="mx-auto max-w-5xl"><PdfViewerToolbar v-bind="args" /></div>',
  }),
} satisfies Meta<typeof PdfViewerToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ToolbarWithHostButtons: Story = {};
