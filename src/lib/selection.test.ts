import { describe, expect, it } from 'vitest';
import { inDocumentOrder, updateSelection } from './selection';

const all = ['a', 'b', 'c', 'd', 'e'];

describe('updateSelection', () => {
  it('replaces the selection on a plain click', () => {
    expect(updateSelection(['a', 'b'], 'c', all, 'a').selection).toEqual(['c']);
  });

  it('toggles with an additive modifier', () => {
    expect(updateSelection(['a', 'b'], 'c', all, 'a', { additive: true }).selection).toEqual(['a', 'b', 'c']);
    expect(updateSelection(['a', 'b'], 'a', all, 'b', { additive: true }).selection).toEqual(['b']);
  });

  it('extends a range from the anchor', () => {
    expect(updateSelection(['a'], 'd', all, 'a', { range: true }).selection).toEqual(['a', 'b', 'c', 'd']);
    expect(updateSelection(['e'], 'b', all, 'e', { range: true }).selection).toEqual(['b', 'c', 'd', 'e']);
  });

  it('merges a range into an existing selection when additive', () => {
    expect(updateSelection(['a', 'e'], 'c', all, 'a', { range: true, additive: true }).selection).toEqual([
      'a',
      'b',
      'c',
      'e',
    ]);
  });

  it('returns the clicked id when there is no anchor', () => {
    const result = updateSelection(['a'], 'c', all, null, { range: true });
    expect(result.selection).toEqual(['c']);
    expect(result.anchor).toBe('c');
  });
});

describe('inDocumentOrder', () => {
  it('sorts ids into document order and removes unknown ids', () => {
    expect(inDocumentOrder(['e', 'b', 'x'], all)).toEqual(['b', 'e']);
  });
});
