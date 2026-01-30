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
    startPointer = { x: e.clientX, y: e.clientY };
    startPosition = { x: rect.left, y: rect.top };

    isDragging.value = true;
    options.onDragStart?.();

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  }

  function onPointerMove(e: PointerEvent) {
    const popover = options.popoverRef.value;
    if (!popover || !isDragging.value) return;

    const dx = e.clientX - startPointer.x;
    const dy = e.clientY - startPointer.y;

    const rect = popover.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

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
