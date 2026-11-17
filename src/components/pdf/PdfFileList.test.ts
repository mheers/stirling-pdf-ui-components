import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import PdfFileList from './PdfFileList.vue';
import type { PdfFileDescriptor } from '../../lib/types';

const files: PdfFileDescriptor[] = [
  { id: 'a', name: 'alpha.pdf', size: 1024, pageCount: 1, status: 'ready' },
  { id: 'b', name: 'beta.pdf', size: 2048, pageCount: 2, status: 'ready' },
];

describe('PdfFileList', () => {
  it('selects a file through the checkbox and emits the new selection', async () => {
    const Parent = defineComponent({
      components: { PdfFileList },
      setup() {
        const items = ref(files);
        const selected = ref<string[]>([]);
        return { items, selected };
      },
      template: '<PdfFileList v-model="items" v-model:selected-ids="selected" selectable />',
    });

    const wrapper = mount(Parent);
    await nextTick();

    await wrapper.get('button[aria-label="Select alpha.pdf"]').trigger('click');
    await nextTick();

    expect((wrapper.vm as unknown as { selected: string[] }).selected).toEqual(['a']);
  });

  it('reorders files with the keyboard handle', async () => {
    const Parent = defineComponent({
      components: { PdfFileList },
      setup() {
        const items = ref(files);
        return { items };
      },
      template: '<PdfFileList v-model="items" reorderable />',
    });

    const wrapper = mount(Parent);
    await nextTick();

    const handle = wrapper.get('button[aria-label^="Reorder alpha.pdf"]');
    await handle.trigger('keydown', { key: 'ArrowDown', altKey: true });
    await nextTick();

    const items = (wrapper.vm as unknown as { items: PdfFileDescriptor[] }).items;
    expect(items.map((file) => file.id)).toEqual(['b', 'a']);
  });
});
