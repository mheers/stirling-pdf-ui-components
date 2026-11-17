import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import PdfMetadataForm from './PdfMetadataForm.vue';
import { sampleMetadata } from '../../storybook/fixtures';

const meta = {
  title: 'Components/PdfMetadataForm',
  component: PdfMetadataForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Edit standard document properties with a keyword tag input, character limits, and a clear reset. Emits the complete metadata object on submit.',
      },
    },
  },
  args: {
    modelValue: sampleMetadata,
    disabled: false,
    loading: false,
    showActions: true,
    submitLabel: 'Apply metadata',
    onSubmit: fn(),
    onReset: fn(),
  },
  render: (args) => ({
    components: { PdfMetadataForm },
    setup() {
      const metadata = ref(args.modelValue);
      return { args, metadata };
    },
    template: '<div class="mx-auto max-w-3xl"><PdfMetadataForm v-bind="args" v-model="metadata" /></div>',
  }),
} satisfies Meta<typeof PdfMetadataForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    modelValue: { title: '', author: '', subject: '', keywords: [], creator: '', producer: '' },
  },
};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithoutActions: Story = {
  args: { showActions: false },
};
