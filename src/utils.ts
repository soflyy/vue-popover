export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function toCssValue(
  value: string | number | undefined
): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * Returns true if the click target is outside the popover root, its activator,
 * and not inside a nested popover that should keep this one open.
 */
export function isClickOutside(
  target: EventTarget | null,
  root: HTMLElement | null,
  activator: HTMLElement | null,
  depth: number
): boolean {
  if (!target || !(target instanceof Node)) return true;

  if (root?.contains(target) || activator?.contains(target)) return false;

  const clickedPopover = (target as Element).closest?.(".v-popover");

  if (clickedPopover && clickedPopover !== root) {
    const clickedDepth = Number((clickedPopover as HTMLElement).dataset.depth);
    if (!Number.isNaN(clickedDepth)) {
      if (clickedDepth > depth) return false; // nested popover, don't close
      if (clickedDepth < depth) return true; // clicked on parent, close this
    }
  }

  return true;
}
