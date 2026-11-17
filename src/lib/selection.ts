export interface SelectionModifiers {
  /** Shift-click: select the range between the anchor and the clicked item. */
  range?: boolean;
  /** Ctrl/Cmd-click: toggle without clearing the selection. */
  additive?: boolean;
}

export interface SelectionResult {
  selection: string[];
  anchor: string;
}

/**
 * Selection model shared by the page grid and the page organizer.
 * Plain click replaces, Ctrl/Cmd-click toggles, Shift-click extends.
 */
export function updateSelection(
  current: string[],
  clicked: string,
  allIds: string[],
  anchor: string | null,
  modifiers: SelectionModifiers = {},
): SelectionResult {
  const order = (ids: string[]) => {
    const wanted = new Set(ids);
    return allIds.filter((id) => wanted.has(id));
  };
  const clickedIndex = allIds.indexOf(clicked);
  const anchorIndex = anchor ? allIds.indexOf(anchor) : -1;

  if (modifiers.range && clickedIndex !== -1 && anchorIndex !== -1) {
    const [from, to] = anchorIndex <= clickedIndex ? [anchorIndex, clickedIndex] : [clickedIndex, anchorIndex];
    const range = allIds.slice(from, to + 1);
    const merged = modifiers.additive ? [...new Set([...current, ...range])] : range;
    return { selection: order(merged), anchor: anchor ?? clicked };
  }

  if (modifiers.additive) {
    const next = current.includes(clicked)
      ? current.filter((id) => id !== clicked)
      : [...current, clicked];
    return { selection: order(next), anchor: clicked };
  }

  return { selection: order([clicked]), anchor: clicked };
}

/** Normalize an arbitrary id list into document order. */
export function inDocumentOrder(ids: string[], allIds: string[]): string[] {
  const wanted = new Set(ids);
  return allIds.filter((id) => wanted.has(id));
}
