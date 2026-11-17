import { describe, expect, it } from 'vitest';
import {
  clampPercent,
  formatBytes,
  formatDuration,
  pageCountLabel,
  savedPercent,
  truncateMiddle,
} from './format';

describe('formatBytes', () => {
  it('formats common sizes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(2_411_520)).toBe('2.3 MB');
    expect(formatBytes(undefined)).toBe('—');
  });
});

describe('formatDuration', () => {
  it('uses ms, s, and min', () => {
    expect(formatDuration(420)).toBe('420 ms');
    expect(formatDuration(4200)).toBe('4.2 s');
    expect(formatDuration(65_000)).toBe('1 min 5 s');
    expect(formatDuration(null)).toBe('—');
  });
});

describe('savedPercent', () => {
  it('computes a clamped saving', () => {
    expect(savedPercent(2_411_520, 1_180_400)).toBe(51);
    expect(savedPercent(0, 100)).toBeNull();
    expect(savedPercent(100, 150)).toBe(0);
  });
});

describe('truncateMiddle', () => {
  it('keeps the extension visible', () => {
    const value = truncateMiddle('pdf-workflow-handbook-v2-final.pdf', 24);
    expect(value.length).toBeLessThanOrEqual(25);
    expect(value.endsWith('.pdf')).toBe(true);
    expect(value).toContain('…');
  });

  it('leaves short names alone', () => {
    expect(truncateMiddle('invoice.pdf', 40)).toBe('invoice.pdf');
  });
});

describe('pageCountLabel', () => {
  it('pluralizes', () => {
    expect(pageCountLabel(1)).toBe('1 page');
    expect(pageCountLabel(12)).toBe('12 pages');
    expect(pageCountLabel(undefined)).toBe('—');
  });
});

describe('clampPercent', () => {
  it('clamps and rounds', () => {
    expect(clampPercent(-10)).toBe(0);
    expect(clampPercent(64.6)).toBe(65);
    expect(clampPercent(140)).toBe(100);
  });
});
