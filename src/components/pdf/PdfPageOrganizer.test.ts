import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import PdfPageOrganizer from './PdfPageOrganizer.vue';
import type { PageOrganizerItem } from '../../lib/types';

function buttonByLabel(wrapper: ReturnType<typeof mount>, label: string) {
  return wrapper.findAll('button').find((button) => button.attributes('aria-label') === label);
}

describe('PdfPageOrganizer', () => {
  it('initializes the page list from pageCount', async () => {
    const wrapper = mount(PdfPageOrganizer, { props: { pageCount: 3 } });
    await nextTick();

    const updates = wrapper.emitted('update:modelValue');
    expect(updates?.at(-1)?.[0]).toEqual([
      { id: 'page-1', page: 1, rotation: 0 },
      { id: 'page-2', page: 2, rotation: 0 },
      { id: 'page-3', page: 3, rotation: 0 },
    ]);
  });

  it('rotates the selected page and undoes the change', async () => {
    const wrapper = mount(PdfPageOrganizer, { props: { pageCount: 3 } });
    await nextTick();

    await buttonByLabel(wrapper, 'Page 2')?.trigger('click');
    await buttonByLabel(wrapper, 'Rotate selected pages right')?.trigger('click');

    let latest = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as PageOrganizerItem[];
    expect(latest[1]?.rotation).toBe(90);

    await buttonByLabel(wrapper, 'Undo')?.trigger('click');
    latest = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as PageOrganizerItem[];
    expect(latest[1]?.rotation).toBe(0);
  });

  it('deletes and restores pages', async () => {
    const wrapper = mount(PdfPageOrganizer, { props: { pageCount: 3 } });
    await nextTick();

    await buttonByLabel(wrapper, 'Page 2')?.trigger('click');
    await buttonByLabel(wrapper, 'Delete selected pages')?.trigger('click');

    let latest = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as PageOrganizerItem[];
    expect(latest.map((page) => page.page)).toEqual([1, 3]);

    await buttonByLabel(wrapper, 'Reset pages')?.trigger('click');
    latest = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as PageOrganizerItem[];
    expect(latest).toHaveLength(3);
  });

  it('adds a blank page after the selection', async () => {
    const wrapper = mount(PdfPageOrganizer, { props: { pageCount: 2 } });
    await nextTick();

    await buttonByLabel(wrapper, 'Page 1')?.trigger('click');
    await buttonByLabel(wrapper, 'Add a blank page')?.trigger('click');

    const latest = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as PageOrganizerItem[];
    expect(latest).toHaveLength(3);
    expect(latest[1]).toMatchObject({ page: 0, blank: true });
  });

  it('keeps updates when a parent binds v-model', async () => {
    const Parent = defineComponent({
      components: { PdfPageOrganizer },
      setup() {
        const pages = ref<PageOrganizerItem[]>([
          { id: 'page-1', page: 1, rotation: 0 },
          { id: 'page-2', page: 2, rotation: 0 },
          { id: 'page-3', page: 3, rotation: 0 },
        ]);
        return { pages };
      },
      template: '<PdfPageOrganizer v-model="pages" :page-count="3" />',
    });

    const wrapper = mount(Parent);
    await nextTick();

    await buttonByLabel(wrapper, 'Page 2')?.trigger('click');
    await buttonByLabel(wrapper, 'Rotate selected pages right')?.trigger('click');
    await nextTick();

    expect(wrapper.text()).toContain('90°');
    const pages = (wrapper.vm as unknown as { pages: PageOrganizerItem[] }).pages;
    expect(pages[1]?.rotation).toBe(90);
  });

  it('moves the selected page with the arrow buttons', async () => {
    const wrapper = mount(PdfPageOrganizer, { props: { pageCount: 3 } });
    await nextTick();

    await buttonByLabel(wrapper, 'Page 1')?.trigger('click');
    await buttonByLabel(wrapper, 'Move selected pages right')?.trigger('click');

    const latest = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as PageOrganizerItem[];
    expect(latest.map((page) => page.page)).toEqual([2, 1, 3]);
  });

  it('rotates the blank page aspect ratio with the page', async () => {
    const wrapper = mount(PdfPageOrganizer, { props: { pageCount: 1 } });
    await nextTick();

    await buttonByLabel(wrapper, 'Page 1')?.trigger('click');
    await buttonByLabel(wrapper, 'Add a blank page')?.trigger('click');
    await buttonByLabel(wrapper, 'Rotate selected pages right')?.trigger('click');

    const blank = wrapper.find('button[aria-label^="Blank page"]');
    expect(blank.attributes('style')).toContain('aspect-ratio: 1.414');
  });
});
