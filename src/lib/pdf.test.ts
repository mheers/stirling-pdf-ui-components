import { describe, expect, it, vi } from 'vitest';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { searchPdfDocument } from './pdf';

function fakeDocument(text: string, pages = 1) {
  const getPage = vi.fn(async () => ({
    getTextContent: async () => ({ items: [{ str: text }] }),
  }));
  return { doc: { numPages: pages, getPage } as unknown as PDFDocumentProxy, getPage };
}

describe('searchPdfDocument', () => {
  it('marks results truncated when the per-page cap hides more matches', async () => {
    const { doc, getPage } = fakeDocument('needle needle needle needle', 3);

    const results = await searchPdfDocument(doc, 'needle', { perPage: 2 });

    expect(results.matches).toHaveLength(2);
    expect(results.total).toBe(2);
    expect(results.truncated).toBe(true);
    // The page cap is reached, so later pages are not scanned.
    expect(getPage).toHaveBeenCalledTimes(1);
  });

  it('does not mark complete results as truncated', async () => {
    const { doc } = fakeDocument('needle needle', 2);

    const results = await searchPdfDocument(doc, 'needle', { perPage: 5 });

    expect(results.matches).toHaveLength(4);
    expect(results.total).toBe(4);
    expect(results.truncated).toBe(false);
    expect(results.byPage).toEqual([
      { page: 1, count: 2 },
      { page: 2, count: 2 },
    ]);
  });

  it('requires at least two characters', async () => {
    const { doc, getPage } = fakeDocument('needle');

    const results = await searchPdfDocument(doc, 'n');

    expect(results.matches).toEqual([]);
    expect(getPage).not.toHaveBeenCalled();
  });
});
