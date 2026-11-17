import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import PdfPasswordForm from './PdfPasswordForm.vue';
import { defaultPasswordOptions } from '../../lib/defaults';
import type { PdfPasswordOptions } from '../../lib/types';

const strongPassword = {
  ...defaultPasswordOptions(),
  password: 'correct horse battery',
  confirmPassword: 'correct horse battery',
};

const meta = {
  title: 'Components/PdfPasswordForm',
  component: PdfPasswordForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Protect or unlock a PDF. The protect mode includes password strength, confirmation, a separate owner password, and granular permissions; the unlock mode stays deliberately simple.',
      },
    },
  },
  args: {
    modelValue: strongPassword,
    mode: 'protect',
    disabled: false,
    loading: false,
    requireConfirm: true,
    showStrength: true,
    onSubmit: fn(),
  },
  render: (args) => ({
    components: { PdfPasswordForm },
    setup() {
      const options = ref<PdfPasswordOptions>({ ...(args.modelValue as PdfPasswordOptions) });
      return { args, options };
    },
    template: '<div class="mx-auto max-w-2xl"><PdfPasswordForm v-bind="args" v-model="options" /></div>',
  }),
} satisfies Meta<typeof PdfPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Protect: Story = {};

export const WeakPassword: Story = {
  args: {
    modelValue: { ...defaultPasswordOptions(), password: 'abc', confirmPassword: 'abc' },
  },
};

export const PasswordMismatch: Story = {
  args: {
    modelValue: { ...defaultPasswordOptions(), password: 'correct horse', confirmPassword: 'correct hors' },
  },
};

export const Unlock: Story = {
  args: {
    mode: 'unlock',
    modelValue: defaultPasswordOptions(),
  },
};

export const IncorrectPassword: Story = {
  args: {
    mode: 'unlock',
    error: 'That password is incorrect. Check the password and try again.',
  },
};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
