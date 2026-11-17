import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import SignaturePad from './SignaturePad.vue';

const meta = {
  title: 'Components/SignaturePad',
  component: SignaturePad,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A high-DPI signature canvas with smoothed strokes, undo, clear, and a trimmed transparent PNG export. Supports pointer, touch, and stylus input.',
      },
    },
  },
  args: {
    height: 180,
    lineWidth: 2.5,
    color: '#1f2937',
    background: 'transparent',
    disabled: false,
    showToolbar: true,
    onBegin: fn(),
    onEnd: fn(),
    onClear: fn(),
  },
  render: (args) => ({
    components: { SignaturePad },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <div class="mx-auto max-w-2xl">
        <SignaturePad v-bind="args" v-model="value" />
        <div v-if="value" class="mt-4 rounded-xl border border-border bg-muted/30 p-4">
          <p class="mb-2 text-xs font-medium text-muted-foreground">Exported PNG</p>
          <img :src="value" alt="Exported signature" class="spdf-checkerboard max-h-24 rounded" />
        </div>
      </div>
    `,
  }),
} satisfies Meta<typeof SignaturePad>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ThinPen: Story = {
  args: { lineWidth: 1.5 },
};

export const ThickPen: Story = {
  args: { lineWidth: 5, height: 220 },
};

export const Disabled: Story = {
  args: { disabled: true },
};
