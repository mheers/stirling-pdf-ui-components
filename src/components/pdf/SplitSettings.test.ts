import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import SplitSettings from './SplitSettings.vue';
import type { SplitOptions } from '../../lib/types';

const base: SplitOptions = { mode: 'ranges', everyN: 1, ranges: '1-3, 5' };

describe('SplitSettings', () => {
  it('keeps the full page range in generated filenames', () => {
    const wrapper = mount(SplitSettings, {
      props: { modelValue: base, pageCount: 10, filename: 'report.pdf' },
    });

    expect(wrapper.text()).toContain('report_1-3.pdf');
    expect(wrapper.text()).toContain('report_5.pdf');
    expect(wrapper.text()).not.toContain('report_1, 3.pdf');
  });

  it('shows every page as its own output in each mode', () => {
    const wrapper = mount(SplitSettings, {
      props: {
        modelValue: { ...base, mode: 'each', ranges: '' },
        pageCount: 3,
        filename: 'report.pdf',
      },
    });

    expect(wrapper.text()).toContain('report_page-1.pdf');
    expect(wrapper.text()).toContain('report_page-3.pdf');
  });

  it('does not use a one-page range in chunked filenames', () => {
    const wrapper = mount(SplitSettings, {
      props: {
        modelValue: { ...base, mode: 'every', everyN: 1, ranges: '' },
        pageCount: 2,
        filename: 'report.pdf',
      },
    });

    expect(wrapper.text()).toContain('report_1.pdf');
    expect(wrapper.text()).toContain('report_2.pdf');
    expect(wrapper.text()).not.toContain('report_1-1.pdf');
  });
});
