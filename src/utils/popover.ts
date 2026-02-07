import { offset, flip, shift } from "@floating-ui/vue";
import type { Placement, StackingStrategy } from "../types";

export function createPopoverMiddleware(options: {
  offsetY: number;
  offsetX?: number;
  flip: boolean;
  isStacked: boolean;
  padding?: number;
}) {
  const mainAxis = options.offsetY;
  // When stacked, we give a little extra padding so it looks better.
  const crossAxis = options.isStacked ? 15 : options.offsetX ?? 0;
  const padding = options.padding ?? 8;

  const pipeline = [
    offset({
      mainAxis,
      crossAxis
    })
  ];

  if (options.flip) {
    pipeline.push(flip());
  }

  pipeline.push(
    shift({
      padding,
      crossAxis: true,
    })
  );

  return pipeline;
}

export function calculatePlacement(options: {
  strategy: StackingStrategy | null;
  parentDepth: number;
  basePlacement: Placement;
  defaultPlacement: Placement;
}): Placement {
  const { strategy, parentDepth, basePlacement, defaultPlacement } = options;

  if (!strategy) return basePlacement;

  if (strategy === "side-by-side") {
    return parentDepth > 0 ? "right-start" : basePlacement;
  }

  if (strategy === "stacked-first-visible") {
    if (parentDepth === 1) return "right-start";
    if (parentDepth > 1) return defaultPlacement;
    return basePlacement;
  }

  if (strategy === "stacked") {
    return parentDepth > 0 ? defaultPlacement : basePlacement;
  }

  return basePlacement;
}

export function getPopoverReference(options: {
  strategy: StackingStrategy | null;
  parentDepth: number;
  activatorRef: HTMLElement | null;
  parentPopoverRef: HTMLElement | null;
  parentHeaderRef: HTMLElement | null;
}): HTMLElement | null {
  const {
    strategy,
    parentDepth,
    activatorRef,
    parentPopoverRef,
    parentHeaderRef
  } = options;

  if (!strategy) {
    return activatorRef;
  }

  // 1) Side by side
  // If the current depth is 0, return the activator as reference.
  // If the current depth is greater than 0, return the parent's popover as reference. The placement must be fixed to right-start.
  if (strategy === "side-by-side") {
    return parentDepth > 0 ? parentPopoverRef : activatorRef;
  }

  // 2) Stacked (first visible)
  // If the current depth is 0, return the activator as reference.
  // If the current depth is 1, return the parent's popover as reference. The placement must be fixed to right-start.
  // If the current depth is greater than 1, return the parent's header as reference and the placement must be fixed to the bottom.
  if (strategy === "stacked-first-visible") {
    if (parentDepth === 1) return parentPopoverRef;
    if (parentDepth > 1) return parentHeaderRef;
    return activatorRef;
  }

  // 3) Stacked
  // Return the parent's header as reference and the placement must be fixed to the bottom with a 20px offset left and top.
  if (strategy === "stacked") {
    return parentDepth > 0 ? parentHeaderRef : activatorRef;
  }

  // 4) Default
  // Return the activator as reference.
  return activatorRef;
}
