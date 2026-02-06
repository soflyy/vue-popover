import { Ref } from "vue";

export type Placement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "left-start"
  | "left-end"
  | "right-start"
  | "right-end";

export type StackingStrategy = "side-by-side" | "stacked" | "stacked-first-visible";

export interface PassthroughOptions {
  root?: Record<string, any>;
  activator?: Record<string, any>;
  header?: Record<string, any>;
  actions?: Record<string, any>;
  close?: Record<string, any>;
  content?: Record<string, any>;
}

export interface PopoverProps {
  /** Whether the popover is open (v-model) */
  open?: boolean;

  /** Preferred placement relative to activator */
  placement?: Placement | StackingStrategy;

  /** z-index of the popover */
  zIndex?: string | number;

  /** Width of the popover (CSS value) */
  width?: string | number;

  /** Minimum width of the popover (CSS value) */
  minWidth?: string | number;

  /** Maximum width of the popover (CSS value) */
  maxWidth?: string | number;

  /** Height of the popover (CSS value) */
  height?: string | number;

  /** Maximum height of the popover (CSS value) */
  maxHeight?: string | number;

  /** Offset distance from activator in pixels */
  offset?: number;

  /** Padding between the popover and the viewport in pixels */
  padding?: number;

  /** Enable floating-ui flip middleware */
  flip?: boolean;

  /** Close when clicking outside this popover (and when clicking on a parent popover, which closes this and any nested popovers after it). Default true. */
  closeOnClickOutside?: boolean;

  /** Close when clicking inside the popover. Default false. */
  closeOnContentClick?: boolean;

  /** Close when pressing Escape. Default true. */
  closeOnEsc?: boolean;

  /** Per-element passthrough attributes/classes */
  pt?: PassthroughOptions;
}

export interface PopoverEmits {
  (e: "update:open", value: boolean): void;
}

export interface PopoverContext {
  depth: number;
  placement: Ref<Placement | StackingStrategy | undefined>;
  popoverRef: Ref<HTMLElement | null>;
  headerRef: Ref<HTMLElement | null>;
}