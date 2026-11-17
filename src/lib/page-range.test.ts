import { describe, expect, it } from 'vitest';
import {
  formatPageRange,
  pageRangePresets,
  pageSelectionSummary,
  parsePageRange,
} from './page-range';

describe('parsePageRange', () => {
  it('returns an empty, invalid result for an empty value', () => {
    const result = parsePageRange('', 10);
    expect(result.isEmpty).toBe(true);
    expect(result.valid).toBe(false);
    expect(result.pages).toEqual([]);
  });

  it('parses single pages, ranges, duplicates, and whitespace', () => {
    const result = parsePageRange(' 1-3, 5, 3 , 8-10 ', 12);
    expect(result.valid).toBe(true);
    expect(result.pages).toEqual([1, 2, 3, 5, 8, 9, 10]);
    expect(result.ranges).toEqual([
      { start: 1, end: 3 },
      { start: 5, end: 5 },
      { start: 8, end: 10 },
    ]);
    expect(result.count).toBe(7);
  });

  it('expands all, odd, even, and last', () => {
    expect(parsePageRange('all', 5).pages).toEqual([1, 2, 3, 4, 5]);
    expect(parsePageRange('odd', 6).pages).toEqual([1, 3, 5]);
    expect(parsePageRange('even', 6).pages).toEqual([2, 4, 6]);
    expect(parsePageRange('last', 6).pages).toEqual([6]);
  });

  it('supports open-ended ranges', () => {
    expect(parsePageRange('3-', 6).pages).toEqual([3, 4, 5, 6]);
  });

  it('accepts typographic dashes from formatted ranges', () => {
    expect(parsePageRange('1–3, 5', 6).pages).toEqual([1, 2, 3, 5]);
    expect(parsePageRange('2—4', 6).pages).toEqual([2, 3, 4]);
  });

  it('requires a page count for relative tokens', () => {
    expect(parsePageRange('all').errors[0]).toContain('page count');
    expect(parsePageRange('odd').errors[0]).toContain('page count');
    expect(parsePageRange('7-').errors[0]).toContain('page count');
  });

  it('rejects out-of-range and backwards ranges', () => {
    const outOfRange = parsePageRange('1-3, 99', 10);
    expect(outOfRange.valid).toBe(false);
    expect(outOfRange.errors[0]).toContain('outside this document');

    const backwards = parsePageRange('8-4', 10);
    expect(backwards.valid).toBe(false);
    expect(backwards.errors[0]).toContain('counts backwards');
  });

  it('rejects unknown tokens', () => {
    const result = parsePageRange('1-3, foo', 10);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('foo');
  });
});

describe('formatPageRange', () => {
  it('merges contiguous pages and sorts input', () => {
    expect(formatPageRange([3, 1, 2, 5, 8, 9, 10])).toBe('1–3, 5, 8–10');
  });

  it('returns an empty string for no pages', () => {
    expect(formatPageRange([])).toBe('');
  });
});

describe('pageSelectionSummary', () => {
  it('formats selections with and without a total', () => {
    expect(pageSelectionSummary(1)).toBe('1 page');
    expect(pageSelectionSummary(7)).toBe('7 pages');
    expect(pageSelectionSummary(7, 12)).toBe('7 of 12 pages');
  });
});

describe('pageRangePresets', () => {
  it('offers the last-page preset only for multi-page documents', () => {
    expect(pageRangePresets(12).some((preset) => preset.id === 'last')).toBe(true);
    expect(pageRangePresets(1).some((preset) => preset.id === 'last')).toBe(false);
  });
});
