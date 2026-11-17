import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PageRangeInput from './PageRangeInput.vue';

describe('PageRangeInput', () => {
  it('renders the parsed page count and highlights selected pages', async () => {
    const wrapper = mount(PageRangeInput, {
      props: { modelValue: '2-4, 7', pageCount: 10 },
    });

    expect(wrapper.text()).toContain('4 of 10 pages selected');
    const selected = wrapper.findAll('button[aria-pressed="true"]');
    expect(selected.map((button) => button.text())).toEqual(['2', '3', '4', '7']);
  });

  it('emits the parsed pages when the input changes', async () => {
    const wrapper = mount(PageRangeInput, {
      props: { modelValue: '', pageCount: 10 },
    });

    await wrapper.get('input').setValue('1-3, 5');
    const pages = wrapper.emitted('pages');
    expect(pages?.at(-1)).toEqual([[1, 2, 3, 5]]);
  });

  it('shows an error for an out-of-range page', () => {
    const wrapper = mount(PageRangeInput, {
      props: { modelValue: '1-3, 99', pageCount: 10 },
    });

    expect(wrapper.text()).toContain('outside this document');
  });

  it('toggles a page from the page strip', async () => {
    const wrapper = mount(PageRangeInput, {
      props: { modelValue: '1-2', pageCount: 4 },
    });

    const pageThree = wrapper.findAll('button').find((button) => button.text() === '3');
    await pageThree?.trigger('click');
    expect(wrapper.emitted('pages')?.at(-1)).toEqual([[1, 2, 3]]);
  });
});
