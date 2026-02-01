import { ref, onBeforeUnmount, type Ref } from "vue";
import { clamp } from "../utils";

export interface UseDraggableOptions {
  headerRef: Ref<HTMLElement | null>;
  popoverRef: Ref<HTMLElement | null>;
  onDragStart?: () => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

export function useDraggable(options: UseDraggableOptions) {
  const isDragging = ref(false);
  const isDragged = ref(false);
  const dragPosition = ref<{ x: number; y: number } | null>(null);

  let startPointer = { x: 0, y: 0 };
  let startPosition = { x: 0, y: 0 };

  function onPointerDown(e: PointerEvent) {
    const handle = options.headerRef.value;
    const popover = options.popoverRef.value;
    if (!handle || !popover) return;

    e.preventDefault();
    handle.setPointerCapture(e.pointerId);

    const rect = popover.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    startPointer = { x: e.clientX + scrollX, y: e.clientY + scrollY };
    startPosition = { x: rect.left + scrollX, y: rect.top + scrollY };

    isDragging.value = true;
    options.onDragStart?.();

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  }

  function onPointerMove(e: PointerEvent) {
    const popover = options.popoverRef.value;
    if (!popover || !isDragging.value) return;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const dx = e.clientX + scrollX - startPointer.x;
    const dy = e.clientY + scrollY - startPointer.y;

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

  function onPointerUp(e: PointerEvent) {
    const handle = options.headerRef.value;
    if (handle) {
      handle.releasePointerCapture(e.pointerId);
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

  onBeforeUnmount(() => {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
  });

  return {
    isDragging,
    isDragged,
    dragPosition,
    onPointerDown,
    reset,
  };
}
