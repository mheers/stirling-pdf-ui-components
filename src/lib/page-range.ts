/**
 * Page range parsing shared by every component that targets a subset of pages.
 *
 * Supported syntax:
 *   all | odd | even | last
 *   3 | 1-5 | 7-        (open range to the last page)
 *   1-3, 5-7, 9         (commas and whitespace are interchangeable)
 */
export interface PageRange {
  start: number;
  end: number;
}

export interface PageRangeParseResult {
  /** Selected pages, de-duplicated and ascending (1-based). */
  pages: number[];
  /** Merged contiguous ranges. */
  ranges: PageRange[];
  errors: string[];
  valid: boolean;
  isEmpty: boolean;
  count: number;
}

const TOKEN_PATTERN = /^(all|odd|even|last|\d+(?:-\d*)?)$/;

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[–—−]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .replace(/[;\n\t]+/g, ',')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',')
    .trim();
}

function mergeRanges(pages: number[]): PageRange[] {
  const ranges: PageRange[] = [];
  for (const page of pages) {
    const last = ranges[ranges.length - 1];
    if (last && page === last.end + 1) {
      last.end = page;
    } else {
      ranges.push({ start: page, end: page });
    }
  }
  return ranges;
}

/**
 * Parse a page selection string. When `pageCount` is known, the result is
 * validated against it; when it is unknown, `all`/`odd`/`even`/`last` cannot be
 * resolved and produce a descriptive error.
 */
export function parsePageRange(input: string, pageCount?: number | null): PageRangeParseResult {
  const text = normalize(input ?? '');
  const errors: string[] = [];
  const selected = new Set<number>();
  const knownCount = typeof pageCount === 'number' && pageCount > 0 ? Math.floor(pageCount) : null;

  if (!text) {
    return { pages: [], ranges: [], errors: [], valid: false, isEmpty: true, count: 0 };
  }

  const tokens = text.split(',').filter(Boolean);

  const addPages = (from: number, to: number) => {
    for (let page = from; page <= to; page += 1) selected.add(page);
  };

  for (const token of tokens) {
    if (!TOKEN_PATTERN.test(token)) {
      errors.push(`“${token}” isn’t a valid page or range.`);
      continue;
    }

    if (token === 'all' || token === 'odd' || token === 'even') {
      if (!knownCount) {
        errors.push(`The page count is required to use “${token}”.`);
        continue;
      }
      const start = token === 'even' ? 2 : 1;
      const step = token === 'all' ? 1 : 2;
      for (let page = start; page <= knownCount; page += step) selected.add(page);
      continue;
    }

    if (token === 'last') {
      if (!knownCount) {
        errors.push('The page count is required to use “last”.');
        continue;
      }
      selected.add(knownCount);
      continue;
    }

    if (token.includes('-')) {
      const [startRaw, endRaw] = token.split('-');
      const start = Number(startRaw);
      const end = endRaw === '' ? knownCount : Number(endRaw);

      if (!Number.isInteger(start) || start < 1) {
        errors.push(`“${token}” must start at page 1 or later.`);
        continue;
      }
      if (end === null) {
        errors.push(`The page count is required for the open range “${token}”.`);
        continue;
      }
      if (!Number.isInteger(end) || end < 1) {
        errors.push(`“${token}” isn’t a valid range.`);
        continue;
      }
      if (end < start) {
        errors.push(`“${token}” counts backwards; the last page must be ≥ ${start}.`);
        continue;
      }
      if (knownCount && (start > knownCount || end > knownCount)) {
        errors.push(
          `“${token}” is outside this document (1–${knownCount}).`,
        );
        continue;
      }
      addPages(start, end);
      continue;
    }

    const page = Number(token);
    if (!Number.isInteger(page) || page < 1) {
      errors.push(`“${token}” isn’t a valid page number.`);
      continue;
    }
    if (knownCount && page > knownCount) {
      errors.push(`Page ${page} is outside this document (1–${knownCount}).`);
      continue;
    }
    selected.add(page);
  }

  const pages = [...selected].sort((a, b) => a - b);
  return {
    pages,
    ranges: mergeRanges(pages),
    errors,
    valid: errors.length === 0,
    isEmpty: pages.length === 0,
    count: pages.length,
  };
}

/** Format pages as a compact range string, e.g. `1–3, 5, 8–10`. */
export function formatPageRange(pages: number[]): string {
  if (!pages.length) return '';
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  return mergeRanges(sorted)
    .map(({ start, end }) => (start === end ? String(start) : `${start}–${end}`))
    .join(', ');
}

const smallNumber = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

/** Human summary for a selection, e.g. `8 of 12 pages`. */
export function pageSelectionSummary(selected: number, total?: number | null): string {
  const count = smallNumber.format(selected);
  if (!total) return `${count} ${selected === 1 ? 'page' : 'pages'}`;
  return `${count} of ${smallNumber.format(total)} ${total === 1 ? 'page' : 'pages'}`;
}

export interface PageRangePreset {
  id: string;
  label: string;
  value: string;
  description?: string;
}

/** Quick presets for a known document. */
export function pageRangePresets(pageCount?: number | null): PageRangePreset[] {
  return [
    { id: 'all', label: 'All pages', value: 'all' },
    { id: 'odd', label: 'Odd pages', value: 'odd' },
    { id: 'even', label: 'Even pages', value: 'even' },
    { id: 'first', label: 'First page', value: '1' },
    ...(pageCount && pageCount > 1
      ? [{ id: 'last', label: 'Last page', value: 'last' }]
      : []),
  ];
}
