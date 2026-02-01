import type { Placement } from "@floating-ui/dom";
import { Ref } from "vue";

export type { Placement };

export type StackingStrategy = "side-by-side" | "stacked" | "stacked-first-visible";

export interface PassthroughOptions {
  root?: Record<string, any>;
  activator?: Record<string, any>;
  handle?: Record<string, any>;
  close?: Record<string, any>;
  header?: Record<string, any>;
  content?: Record<string, any>;
}

export interface PopoverProps {
  /** Whether the popover is open (v-model) */
  open?: boolean;

  /** Preferred placement relative to activator */
  placement?: Placement;

  /** Stacking strategy for nested popovers */
  stackingStrategy?: StackingStrategy;

  /** Width of the popover (CSS value) */
  width?: string | number;

  /** Height of the popover (CSS value) */
  height?: string | number;

  /** Maximum height of the popover (CSS value) */
  maxHeight?: string | number;

  /** Offset distance from activator in pixels */
  offset?: number;

  /** Close when clicking outside this popover (and when clicking on a parent popover, which closes this and any nested popovers after it). Default true. */
  closeOnClickOutside?: boolean;

  /** Per-element passthrough attributes/classes */
  pt?: PassthroughOptions;
}

export interface PopoverEmits {
  (e: "update:open", value: boolean): void;
}

export interface PopoverContext {
  depth: number;
  stackingStrategy: Ref<StackingStrategy | undefined>;
  popoverRef: Ref<HTMLElement | null>;
  headerRef: Ref<HTMLElement | null>;
}