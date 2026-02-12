import { ref, onBeforeUnmount, type Ref, computed, watch, nextTick } from "vue";
import { clamp } from "../utils/css";

export interface UseDraggableOptions {
  draggableRef: Ref<HTMLElement | null>;
  popoverRef: Ref<HTMLElement | null>;
  onDragStart?: () => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

export function useDraggable(options: UseDraggableOptions) {
  const isDragging = ref(false);
  const isDragged = ref(false);
  const dragPosition = ref<{ x: number; y: number } | null>(null);
  const isActive = computed(() => isDragged.value && dragPosition.value);
  let resizeObserver: ResizeObserver | null = null;

  let startPointer = { x: 0, y: 0 };
  let startPosition = { x: 0, y: 0 };

  const styles = computed(() => {
    return {
      position: "absolute" as const,
      left: `${dragPosition.value!.x}px`,
      top: `${dragPosition.value!.y}px`
    };
  });

  function destroyResizeObserver() {
    resizeObserver?.disconnect();
    resizeObserver = null;
  }

  function recalculatePositionOnHeightChange() {
    const target = options.popoverRef.value;
    const position = dragPosition.value;

    if (!target || !position || !isActive.value) return;

    const rect = target.getBoundingClientRect();
    const maxViewportY = window.innerHeight - rect.height;

    if (rect.top > maxViewportY) {
      dragPosition.value = {
        ...position,
        y: Math.max(window.scrollY + maxViewportY, 0)
      };
    }
  }

  function setupResizeObserver(target: HTMLElement) {
    if (typeof ResizeObserver === "undefined") return;
    if (!isActive.value) return;

    resizeObserver = new ResizeObserver(recalculatePositionOnHeightChange);
    resizeObserver.observe(target);
  }

  function onPointerDown(event: PointerEvent) {
    const handle = options.draggableRef.value;
    const popover = options.popoverRef.value;
    if (!handle || !popover) return;

    event.preventDefault();
    handle.setPointerCapture(event.pointerId);

    const rect = popover.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    startPointer = { x: event.clientX + scrollX, y: event.clientY + scrollY };
    startPosition = { x: rect.left + scrollX, y: rect.top + scrollY };

    isDragging.value = true;
    options.onDragStart?.();

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  }

  function onPointerMove(event: PointerEvent) {
    const popover = options.popoverRef.value;
    if (!popover || !isDragging.value) return;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const dx = event.clientX + scrollX - startPointer.x;
    const dy = event.clientY + scrollY - startPointer.y;

    const rect = popover.getBoundingClientRect();
    const docWidth = document.documentElement.scrollWidth;
    const docHeight = document.documentElement.scrollHeight;
    const maxX = docWidth - rect.width;
    const maxY = docHeight - rect.height;

    const newX = clamp(startPosition.x + dx, 0, maxX);
    const newY = clamp(startPosition.y + dy, 0, maxY);

    dragPosition.value = { x: newX, y: newY };
    isDragged.value = true;
  }

  function onPointerUp(event: PointerEvent) {
    const handle = options.draggableRef.value;

    if (handle) {
      handle.releasePointerCapture(event.pointerId);
    }

    isDragging.value = false;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);

    if (dragPosition.value) {
      options.onDragEnd?.(dragPosition.value);
    }
  }

  function reset() {
    isDragged.value = false;
    dragPosition.value = null;
  }

  watch(
    () => [isActive.value, options.popoverRef.value] as const,
    ([active, popover]) => {
      destroyResizeObserver();

      if (!active || !popover) return;

      nextTick(() => {
        if (!isActive.value || options.popoverRef.value !== popover) return;

        setupResizeObserver(popover);
      });
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    destroyResizeObserver();
  });

  return {
    isDragging,
    isDragged,
    isActive,
    dragPosition,
    onPointerDown,
    styles,
    reset,
  };
}
