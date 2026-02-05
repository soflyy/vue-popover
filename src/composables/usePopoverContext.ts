import { computed, inject, provide, ref, Ref, type InjectionKey } from "vue";
import type { Placement, PopoverContext, StackingStrategy } from "../types";

const POPOVER_CONTEXT_KEY: InjectionKey<PopoverContext> = Symbol("PopoverContext");

const DEFAULT_CONTEXT: PopoverContext = {
  depth: 0,
  placement: ref(undefined),
  popoverRef: ref(null),
  headerRef: ref(null),
};

export function usePopoverContext(
  placement: Ref<Placement | StackingStrategy | undefined>,
  popoverRef: Ref<HTMLElement | null>,
  headerRef: Ref<HTMLElement | null>,
) {
  const parent = inject(POPOVER_CONTEXT_KEY, DEFAULT_CONTEXT);
  const depth = parent.depth + 1;

  const newPlacement = computed(() => {
    return parent.placement.value || placement.value;
  });

  provide(POPOVER_CONTEXT_KEY, {
    depth,
    placement: newPlacement,
    popoverRef,
    headerRef,
  });

  return parent;
}
