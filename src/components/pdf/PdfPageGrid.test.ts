import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import PdfPageGrid from './PdfPageGrid.vue';

describe('PdfPageGrid', () => {
  it('extends a selection with shift-click and toggles with ctrl-click', async () => {
    const Parent = defineComponent({
      components: { PdfPageGrid },
      setup() {
        const selected = ref<number[]>([]);
        return { selected };
      },
      template: '<PdfPageGrid :page-count="5" v-model:selected="selected" />',
    });

    const wrapper = mount(Parent);
    await nextTick();

    await wrapper.get('button[aria-label^="Page 2"]').trigger('click');
    await wrapper.get('button[aria-label^="Page 4"]').trigger('click', { shiftKey: true });
    await nextTick();

    let selected = (wrapper.vm as unknown as { selected: number[] }).selected;
    expect(selected).toEqual([2, 3, 4]);

    // The anchor stays at page 2, so a second shift-click extends from there.
    await wrapper.get('button[aria-label^="Page 3"]').trigger('click', { shiftKey: true });
    await nextTick();
    selected = (wrapper.vm as unknown as { selected: number[] }).selected;
    expect(selected).toEqual([2, 3]);

    await wrapper.get('button[aria-label^="Page 3"]').trigger('click', { ctrlKey: true });
    await nextTick();

    selected = (wrapper.vm as unknown as { selected: number[] }).selected;
    expect(selected).toEqual([2]);
  });
});
