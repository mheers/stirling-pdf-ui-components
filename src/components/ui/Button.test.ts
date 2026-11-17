import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from './Button.vue';

describe('Button', () => {
  it('renders the default variant and size', () => {
    const wrapper = mount(Button, { slots: { default: 'Save' } });
    const button = wrapper.get('button');
    expect(button.text()).toBe('Save');
    expect(button.classes()).toContain('bg-primary');
    expect(button.classes()).toContain('h-9');
  });

  it('honors the variant and size props', () => {
    const wrapper = mount(Button, {
      props: { variant: 'ghost', size: 'icon-sm' },
      slots: { default: 'Icon' },
    });
    const button = wrapper.get('button');
    expect(button.classes()).toContain('hover:bg-accent');
    expect(button.classes()).toContain('size-8');
    expect(button.classes()).not.toContain('bg-primary');
  });

  it('disables itself while loading', () => {
    const wrapper = mount(Button, { props: { loading: true }, slots: { default: 'Working' } });
    expect(wrapper.get('button').attributes('disabled')).toBeDefined();
    expect(wrapper.get('button').attributes('aria-busy')).toBe('true');
  });
});
