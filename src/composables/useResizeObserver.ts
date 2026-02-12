import { computed, onBeforeUnmount, Ref, watch } from "vue";

export interface UseResizeObserverOptions {
  targetRef: Ref<HTMLElement | null>;
  onResize: () => void;
  enabled?: Ref<boolean>;
}

export function useResizeObserver(options: UseResizeObserverOptions) {
  const isEnabled = computed(() => options.enabled?.value ?? true);
  let observer: ResizeObserver | null = null;

  function destroyObserver() {
    observer?.disconnect();
    observer = null;
  }

  watch(
    () => [isEnabled.value, options.targetRef.value] as const,
    ([enabled, target]) => {
      destroyObserver();

      if (!enabled || !target || typeof ResizeObserver === "undefined") return;

      observer = new ResizeObserver(() => {
        options.onResize();
      });
      observer.observe(target);
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    destroyObserver();
  });

  return {
    destroyObserver
  };
}
