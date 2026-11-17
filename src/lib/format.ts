/** Format a byte count as a compact, human-readable string. */
export function formatBytes(bytes: number | null | undefined, decimals = 1): string {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return '—';
  if (bytes === 0) return '0 B';
  if (!Number.isFinite(bytes)) return '—';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  const rounded = index === 0 ? Math.round(value) : Number(value.toFixed(decimals));
  return `${rounded} ${units[index]}`;
}

/** Format a duration in human-friendly units. */
export function formatDuration(milliseconds: number | null | undefined): string {
  if (milliseconds === null || milliseconds === undefined || !Number.isFinite(milliseconds)) {
    return '—';
  }
  if (milliseconds < 1000) return `${Math.round(milliseconds)} ms`;
  const seconds = milliseconds / 1000;
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)} s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return `${minutes} min ${remaining} s`;
}

/** Percentage saved between two byte counts. */
export function savedPercent(original: number | null | undefined, result: number | null | undefined): number | null {
  if (!original || !result || original <= 0) return null;
  return Math.max(0, Math.round(((original - result) / original) * 100));
}

/** Truncate a filename in the middle while keeping the extension visible. */
export function truncateMiddle(value: string, maxLength = 36): string {
  if (value.length <= maxLength) return value;
  const dot = value.lastIndexOf('.');
  const extension = dot > 0 && value.length - dot <= 8 ? value.slice(dot) : '';
  const stem = extension ? value.slice(0, dot) : value;
  const available = Math.max(4, maxLength - extension.length - 1);
  const head = Math.ceil(available * 0.62);
  const tail = available - head;
  return `${stem.slice(0, head)}…${stem.slice(-tail)}${extension}`;
}

/** `1 page` / `12 pages`. */
export function pageCountLabel(count: number | null | undefined): string {
  if (count === null || count === undefined) return '—';
  return `${count} ${count === 1 ? 'page' : 'pages'}`;
}

/** Percentage as a whole number, clamped to 0–100. */
export function clampPercent(value: number | null | undefined): number {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}
