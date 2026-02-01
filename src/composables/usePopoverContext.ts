import { computed, inject, provide, ref, Ref, type InjectionKey } from "vue";
import type { PopoverContext, StackingStrategy } from "../types";

const POPOVER_CONTEXT_KEY: InjectionKey<PopoverContext> = Symbol("PopoverContext");

const DEFAULT_CONTEXT: PopoverContext = {
  depth: 0,
  stackingStrategy: ref(undefined),
  popoverRef: ref(null),
  headerRef: ref(null),
};

export function usePopoverContext(
  stackingStrategy: Ref<StackingStrategy | undefined>,
  popoverRef: Ref<HTMLElement | null>,
  headerRef: Ref<HTMLElement | null>,
) {
  const parent = inject(POPOVER_CONTEXT_KEY, DEFAULT_CONTEXT);
  const depth = parent.depth != null ? parent.depth + 1 : 0;
  const newStackingStrategy = computed(() => {
    return parent.stackingStrategy.value || stackingStrategy.value;
  });

  provide(POPOVER_CONTEXT_KEY, {
    depth,
    stackingStrategy: newStackingStrategy,
    popoverRef,
    headerRef,
  });

  return parent;
}
