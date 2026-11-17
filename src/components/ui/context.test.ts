import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import Button from './Button.vue';
import Input from './Input.vue';
import { provideSpdfUi } from './context';

const HostButton = defineComponent({
  name: 'HostButton',
  // Deliberately does not declare `disabled`; a real host button may rely on
  // attribute fallthrough for it, as the odoo app does.
  props: {
    variant: String,
    size: String,
    type: String,
  },
  template:
    '<button data-host="button" :data-variant="variant" :data-size="size" :type="type"><slot /></button>',
});

const HostInput = defineComponent({
  name: 'HostInput',
  props: {
    modelValue: [String, Number],
    type: String,
  },
  emits: ['update:modelValue'],
  methods: {
    onInput(event: Event) {
      this.$emit('update:modelValue', (event.target as HTMLInputElement).value);
    },
  },
  template: '<input data-host="input" :type="type" :value="modelValue" @input="onInput" />',
});

describe('Spdf UI host integration', () => {
  it('delegates Button to the host component and normalizes loading and sizes', () => {
    const Parent = defineComponent({
      components: { Button, HostButton },
      setup() {
        provideSpdfUi({ components: { Button: HostButton } });
      },
      template:
        '<Button variant="outline" size="icon-sm" loading class="extra">Save</Button>',
    });

    const wrapper = mount(Parent);
    const host = wrapper.get('[data-host="button"]');

    expect(host.attributes('data-variant')).toBe('outline');
    expect(host.attributes('data-size')).toBe('icon');
    expect(host.attributes('disabled')).toBeDefined();
    expect(host.attributes('aria-busy')).toBe('true');
    expect(host.text()).toContain('Save');
    expect(host.find('svg').exists()).toBe(true);
    expect(host.classes()).toContain('extra');
    expect(host.classes()).toContain('[&_svg]:size-4');
    expect(host.classes()).not.toContain('bg-primary');
  });

  it('delegates Input to a host component with modelValue semantics', async () => {
    const Parent = defineComponent({
      components: { Input, HostInput },
      setup() {
        provideSpdfUi({ components: { Input: HostInput } });
        const value = ref('initial');
        return { value };
      },
      template: '<Input v-model="value" />',
    });

    const wrapper = mount(Parent);
    const host = wrapper.get('[data-host="input"]');
    expect((host.element as HTMLInputElement).value).toBe('initial');

    await host.setValue('changed');
    expect((wrapper.vm as unknown as { value: string }).value).toBe('changed');
  });

  it('merges a native control recipe over the library defaults', () => {
    const Parent = defineComponent({
      components: { Input },
      setup() {
        provideSpdfUi({ classes: { input: 'host-input h-11' } });
        return {};
      },
      template: '<Input model-value="x" />',
    });

    const wrapper = mount(Parent);
    const input = wrapper.get('input');

    expect(input.classes()).toContain('host-input');
    expect(input.classes()).toContain('h-11');
    expect(input.classes()).not.toContain('h-9');
  });
});
