import { inject, provide, type InjectionKey } from "vue";
import type { PopoverContext } from "../types";

const POPOVER_CONTEXT_KEY: InjectionKey<PopoverContext> = Symbol("v-popover");

export function usePopoverContext() {
  const parent = inject(POPOVER_CONTEXT_KEY, null);
  const depth = parent ? parent.depth + 1 : 0;

  provide(POPOVER_CONTEXT_KEY, { depth });

  return { depth };
}
