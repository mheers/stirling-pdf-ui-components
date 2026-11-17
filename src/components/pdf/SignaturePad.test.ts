import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import SignaturePad from './SignaturePad.vue';

describe('SignaturePad', () => {
  it('renders a restored signature instead of the empty prompt', () => {
    const wrapper = mount(SignaturePad, {
      props: { modelValue: 'data:image/png;base64,AAAA' },
    });

    expect(wrapper.find('img[alt="Current signature"]').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('Sign here');
  });
});
