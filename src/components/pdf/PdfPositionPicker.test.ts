import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PdfPositionPicker from './PdfPositionPicker.vue';

describe('PdfPositionPicker', () => {
  it('moves the radio selection with arrow keys', async () => {
    const wrapper = mount(PdfPositionPicker, { props: { modelValue: 'top-left' } });
    const buttons = wrapper.findAll('button');

    expect(buttons[0]?.attributes('tabindex')).toBe('0');
    expect(buttons[1]?.attributes('tabindex')).toBe('-1');

    await buttons[0]?.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['top-center']);

    await buttons[0]?.trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['middle-left']);
  });

  it('stays inert when disabled', async () => {
    const wrapper = mount(PdfPositionPicker, {
      props: { modelValue: 'top-left', disabled: true },
    });

    await wrapper.findAll('button')[0]?.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});
