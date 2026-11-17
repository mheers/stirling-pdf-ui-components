import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import SignatureInput from './SignatureInput.vue';
import { signatureUrl } from '../../storybook/fixtures';
import type { SignatureValue } from '../../lib/types';

const meta = {
  title: 'Components/SignatureInput',
  component: SignatureInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Capture a signature by drawing, typing, or uploading an image. Returns a single `SignatureValue` with the kind and a data URL ready to place on a page.',
      },
    },
  },
  args: {
    modelValue: null,
    kinds: ['draw', 'type', 'upload'],
    height: 180,
    disabled: false,
    onChange: fn(),
  },
  render: (args) => ({
    components: { SignatureInput },
    setup() {
      const value = ref<SignatureValue | null>(args.modelValue as SignatureValue | null);
      return { args, value };
    },
    template: '<div class="mx-auto max-w-2xl"><SignatureInput v-bind="args" v-model="value" /></div>',
  }),
} satisfies Meta<typeof SignatureInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Draw: Story = {};

export const Typed: Story = {
  args: {
    modelValue: { dataUrl: '', kind: 'type', text: 'Marcel Heers' },
  },
};

export const Uploaded: Story = {
  args: {
    modelValue: { dataUrl: signatureUrl, kind: 'upload' },
  },
};

export const DrawAndTypeOnly: Story = {
  args: { kinds: ['draw', 'type'] },
};

export const Disabled: Story = {
  args: { disabled: true },
};
