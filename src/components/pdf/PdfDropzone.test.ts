import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PdfDropzone from './PdfDropzone.vue';

function attachFiles(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, 'files', {
    value: files,
    configurable: true,
  });
}

describe('PdfDropzone', () => {
  it('accepts a PDF even when the browser reports no MIME type', async () => {
    const wrapper = mount(PdfDropzone, { props: { multiple: false } });
    const input = wrapper.get('input[type="file"]');
    const file = new File(['%PDF-1.7'], 'sample.pdf', { type: '' });

    attachFiles(input.element as HTMLInputElement, [file]);
    await input.trigger('change');

    expect(wrapper.emitted('files')?.[0]?.[0]).toEqual([file]);
  });

  it('rejects an unsupported file type', async () => {
    const wrapper = mount(PdfDropzone, { props: { multiple: false } });
    const input = wrapper.get('input[type="file"]');
    const file = new File(['MZ'], 'setup.exe', { type: 'application/x-msdownload' });

    attachFiles(input.element as HTMLInputElement, [file]);
    await input.trigger('change');

    expect(wrapper.emitted('files')).toBeUndefined();
    const rejected = wrapper.emitted('reject')?.[0]?.[0] as { reason: string }[];
    expect(rejected[0]?.reason).toBe('type');
    expect(wrapper.text()).toContain('isn’t a supported file type');
  });

  it('rejects files over the size limit', async () => {
    const wrapper = mount(PdfDropzone, { props: { multiple: false, maxSize: 4 } });
    const input = wrapper.get('input[type="file"]');
    const file = new File(['%PDF-1.7'], 'large.pdf', { type: 'application/pdf' });

    attachFiles(input.element as HTMLInputElement, [file]);
    await input.trigger('change');

    const rejected = wrapper.emitted('reject')?.[0]?.[0] as { reason: string }[];
    expect(rejected[0]?.reason).toBe('size');
  });
});
