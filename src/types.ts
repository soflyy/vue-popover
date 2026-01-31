import type { Placement, ComputePositionConfig } from "@floating-ui/dom";

export type { Placement };

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
}
