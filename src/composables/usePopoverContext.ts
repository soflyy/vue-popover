import { computed, inject, provide, ref, Ref, type InjectionKey } from "vue";
import type { Placement, PopoverContext, StackingStrategy } from "../types";

const POPOVER_CONTEXT_KEY: InjectionKey<PopoverContext> = Symbol("PopoverContext");

const DEFAULT_CONTEXT: PopoverContext = {
  depth: 0,
  placement: ref(undefined),
  stackingStrategy: ref(undefined),
  popoverRef: ref(null),
  headerRef: ref(null),
};

export function usePopoverContext(
  placement: Ref<Placement | undefined>,
  stackingStrategy: Ref<StackingStrategy | undefined>,
  popoverRef: Ref<HTMLElement | null>,
  headerRef: Ref<HTMLElement | null>,
) {
  const parent = inject(POPOVER_CONTEXT_KEY, DEFAULT_CONTEXT);
  const depth = parent.depth + 1;

  const newPlacement = computed(() => {
    return parent.placement.value || placement.value;
  });

  const newStackingStrategy = computed(() => {
    return parent.stackingStrategy.value || stackingStrategy.value;
  });

  provide(POPOVER_CONTEXT_KEY, {
    depth,
    placement: newPlacement,
    stackingStrategy: newStackingStrategy,
    popoverRef,
    headerRef,
  });

  return parent;
}
