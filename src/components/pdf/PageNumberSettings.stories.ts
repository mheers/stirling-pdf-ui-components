import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn } from 'storybook/test';
import { ref } from 'vue';
import PageNumberSettings from './PageNumberSettings.vue';
import { defaultPageNumberOptions } from '../../lib/defaults';
import type { PageNumberOptions } from '../../lib/types';

const meta = {
  title: 'Components/PageNumberSettings',
  component: PageNumberSettings,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Page number formatting, position, margin, start number, skip-first behavior, and page targeting with a live A4 preview.',
      },
    },
  },
  args: {
    modelValue: defaultPageNumberOptions(),
    pageCount: 12,
    disabled: false,
    onChange: fn(),
  },
  render: (args) => ({
    components: { PageNumberSettings },
    setup() {
      const options = ref<PageNumberOptions>({ ...(args.modelValue as PageNumberOptions) });
      return { args, options };
    },
    template: '<div class="mx-auto max-w-5xl"><PageNumberSettings v-bind="args" v-model="options" /></div>',
  }),
} satisfies Meta<typeof PageNumberSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BottomCenter: Story = {};

export const TopRight: Story = {
  args: {
    modelValue: {
      ...defaultPageNumberOptions(),
      position: 'top-right',
      format: 'Page {page} of {total}',
      fontSize: 9,
      margin: 36,
    },
  },
};

export const SkipFirstPage: Story = {
  args: {
    modelValue: { ...defaultPageNumberOptions(), skipFirst: true, startNumber: 1 },
  },
};

export const CustomFormat: Story = {
  args: {
    modelValue: {
      ...defaultPageNumberOptions(),
      position: 'bottom-left',
      format: '- {page} -',
      startNumber: 3,
    },
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
