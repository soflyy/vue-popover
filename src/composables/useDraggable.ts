import { ref, onBeforeUnmount, type Ref, computed } from "vue";
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

  let startPointer = { x: 0, y: 0 };
  let startPosition = { x: 0, y: 0 };

  const styles = computed(() => {
    return {
      position: "absolute" as const,
      left: `${dragPosition.value!.x}px`,
      top: `${dragPosition.value!.y}px`,
    };
  });

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

  onBeforeUnmount(() => {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
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
