import { computed, CSSProperties, nextTick, onBeforeUnmount, Ref, ref, watch } from "vue";
import { clamp } from "../utils/css";
import { useResizeObserver } from "./useResizeObserver";

export interface UseManualPositioningOptions {
  popoverRef: Ref<HTMLElement | null>;
  isOpen: Ref<boolean>;
  positionX: Ref<number | undefined>;
  positionY: Ref<number | undefined>;
  padding: Ref<number | undefined>;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export function useManualPositioning(options: UseManualPositioningOptions) {
  const isManualPositioning = computed(() => {
    return options.positionX.value !== undefined && options.positionY.value !== undefined;
  });
  const isManualPositioningActive = computed(() => {
    return options.isOpen.value && isManualPositioning.value;
  });

  const rectRef = ref<DOMRect | null>(null);
  const viewportTick = ref(0);

  function computeManualPosition() {
    if (!isManualPositioning.value || !options.popoverRef.value) return;

    rectRef.value = options.popoverRef.value.getBoundingClientRect();
    viewportTick.value += 1;
  }

  const manualStyles = computed<CSSProperties>(() => {
    if (!isManualPositioning.value || !rectRef.value) return {};

    const rect = rectRef.value;
    // const padding = options.padding.value ?? 0;
    const padding = 0;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const minLeft = padding;
    const maxLeft = window.innerWidth - rect.width - padding;
    const minTop = padding;
    const maxTop = window.innerHeight - rect.height - padding;

    const clampedX = clamp(
      options.positionX.value!,
      minLeft,
      Math.max(minLeft, maxLeft)
    );

    const clampedY = clamp(
      options.positionY.value!,
      minTop,
      Math.max(minTop, maxTop)
    );

    return {
      position: "absolute",
      left: `${scrollX + clampedX}px`,
      top: `${scrollY + clampedY}px`,
    };
  });

  function destroyManualPositioning() {
    window.removeEventListener("resize", computeManualPosition);
  }

  function setupManualPositioning() {
    if (!isManualPositioning.value || !options.popoverRef.value) return;

    computeManualPosition();
    window.addEventListener("resize", computeManualPosition);
  }

  useResizeObserver({
    targetRef: options.popoverRef,
    enabled: isManualPositioningActive,
    onResize: computeManualPosition
  });

  watch(options.isOpen, async (open) => {
    if (open) {
      await nextTick();
      if (isManualPositioning.value) {
        options.onActivate?.();
        setupManualPositioning();
      } else {
        options.onDeactivate?.();
      }
    } else {
      destroyManualPositioning();
    }
  });

  watch(
    () =>
      [
        options.isOpen.value,
        options.positionX.value,
        options.positionY.value,
        options.padding.value,
      ] as const,
    ([open]) => {
      if (!open) return;
      if (!isManualPositioning.value) {
        destroyManualPositioning();
        options.onDeactivate?.();
        return;
      }

      nextTick(() => {
        options.onActivate?.();
        setupManualPositioning();
      });
    }
  );

  watch(
    isManualPositioningActive,
    (active) => {
      destroyManualPositioning();
      if (!active) return;

      nextTick(() => {
        if (!isManualPositioningActive.value) return;
        setupManualPositioning();
      });
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    destroyManualPositioning();
  });

  return {
    isManualPositioning,
    manualStyles,
  };
}
