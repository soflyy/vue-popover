<script setup lang="ts">
import { ref, computed, watch, toRef, nextTick, onBeforeUnmount, provide } from "vue";
import type {
  PopoverProps,
  PopoverEmits,
  Placement,
  StackingStrategy
} from "../types";
import { useFloating, autoUpdate, offset, flip, shift } from "@floating-ui/vue";
import { usePopoverContext } from "../composables/usePopoverContext";
import { useDraggable } from "../composables/useDraggable";
import { toCssValue, isClickOutside } from "../utils";

defineOptions({ inheritAttrs: false });

const DEFAULT_PLACEMENT = "bottom-start";

const props = withDefaults(defineProps<PopoverProps>(), {
  open: false,
  placement: DEFAULT_PLACEMENT,
  offset: 8,
  closeOnClickOutside: true
});

const emit = defineEmits<PopoverEmits>();

const slots = defineSlots<{
  activator(): any;
  title(): any;
  close(): any;
  header(): any;
  content(): any;
}>();

const activatorRef = ref<HTMLElement | null>(null);
const popoverRef = ref<HTMLElement | null>(null);
const headerRef = ref<HTMLElement | null>(null);

const placement = toRef(props, "placement");

const parent = usePopoverContext(placement, popoverRef, headerRef);

const isOpen = computed(() => props.open);
const floatingEnabled = ref(false);
const hasTitle = computed(() => !!slots.title);

const isStackingStrategy = (
  value: Placement | StackingStrategy | undefined
): value is StackingStrategy => {
  return (
    value === "side-by-side" ||
    value === "stacked" ||
    value === "stacked-first-visible"
  );
};

const activeStackingStrategy = computed<StackingStrategy | null>(() => {
  const parentPlacement = parent.placement?.value;
  if (isStackingStrategy(parentPlacement)) return parentPlacement;
  if (isStackingStrategy(placement.value)) return placement.value;
  return null;
});

const basePlacement = computed<Placement>(() => {
  if (placement.value && !isStackingStrategy(placement.value)) {
    return placement.value;
  }

  return DEFAULT_PLACEMENT;
});

const middleware = computed(() => {
  const isStacked = activeStackingStrategy.value === "stacked" && parent.depth > 0;
  const mainAxis = props.offset;
  const crossAxis = isStacked ? 15 : 0;

  return [
    offset({
      mainAxis,
      crossAxis
    }),
    // flip(),
    shift({
      padding: 8,
      crossAxis: true,
    }),
  ];
});

const internalPlacement = computed<Placement>(() => {
  const strategy = activeStackingStrategy.value;

  if (!strategy) return basePlacement.value;

  if (strategy === "side-by-side") {
    return parent.depth > 0 ? "right-start" : basePlacement.value;
  }

  if (strategy === "stacked-first-visible") {
    if (parent.depth === 1) return "right-start";
    if (parent.depth > 1) return DEFAULT_PLACEMENT;
    return basePlacement.value;
  }

  if (strategy === "stacked") {
    return parent.depth > 0 ? DEFAULT_PLACEMENT : basePlacement.value;
  }

  return basePlacement.value;
});

const reference = computed(() => {
  const strategy = activeStackingStrategy.value;

  if (!strategy) return activatorRef.value;

  // 1) Side by side
  // If the current depth is 0, return the activator as reference.
  // If the current depth is greater than 0, return the parent's popover as reference. The placement must be fixed to right-start.
  //
  if (strategy === "side-by-side") {
    return parent.depth > 0 ? parent.popoverRef.value : activatorRef.value;
  }

  // 2) Stacked (first visible)
  // If the current depth is 0, return the activator as reference.
  // If the current depth is 1, return the parent's popover as reference. The placement must be fixed to right-start.
  // If the current depth is greater than 1, return the parent's header as reference and the placement must be fixed to the bottom.
  if (strategy === "stacked-first-visible") {
    if (parent.depth === 1) return parent.popoverRef.value;
    if (parent.depth > 1) return parent.headerRef.value;
    return activatorRef.value;
  }

  // 3) Stacked
  // Return the parent's header as reference and the placement must be fixed to the bottom with a 20px offset left and top.
  if (strategy === "stacked") {
    return parent.depth > 0 ? parent.headerRef.value : activatorRef.value;
  }

  // 4) Default
  // Return the activator as reference.
  return activatorRef.value;
});

const { floatingStyles } = useFloating(reference, popoverRef, {
  strategy: "absolute",
  placement: internalPlacement,
  open: floatingEnabled,
  middleware,
  whileElementsMounted: autoUpdate,
});

const draggable = useDraggable({
  draggableRef: headerRef,
  popoverRef,
  onDragStart() {
    floatingEnabled.value = false;
  },
});

watch(isOpen, (open) => {
  if (open) {
    nextTick(() => {
      floatingEnabled.value = true;
    });
  } else {
    floatingEnabled.value = false;
  }
});

function destroyEscapeListener() {
  document.removeEventListener("keydown", onEscClick, true);
}

function onEscClick(event: KeyboardEvent) {
  if (event.key !== "Escape" || !props.open) return;
  emit("update:open", false);
}

function setupEscapeListener() {
  nextTick(() => {
    document.addEventListener("keydown", onEscClick, true);
  });
}

function destroyClickOutsideListener() {
  document.removeEventListener("click", onDocumentClick, true);
}

function onDocumentClick(event: MouseEvent) {
  if (!props.open) return;

  if (
    isClickOutside(
      event.target,
      popoverRef.value,
      activatorRef.value,
      parent.depth
    )
  ) {
    emit("update:open", false);
  }
}

function setupClickOutsideListener() {
  if (!props.closeOnClickOutside) return;

  // Defer so the click that opened this popover doesn't immediately close it
  nextTick(() => {
    document.addEventListener("click", onDocumentClick, true);
  });
}

watch(
  () => [isOpen.value, props.closeOnClickOutside] as const,
  ([open, closeOnOutside]) => {
    destroyEscapeListener();
    destroyClickOutsideListener();

    if (open) {
      setupEscapeListener();

      if (closeOnOutside) {
        setupClickOutsideListener();
      }
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  destroyEscapeListener();
  destroyClickOutsideListener();
});

const zIndex = computed(() => 1000 + parent.depth * 10);

const popoverStyle = computed(() => {
  const base =
    draggable.shouldUseDragStyles.value
      ? draggable.styles.value
      : floatingStyles.value;

  return {
    ...base,
    width: toCssValue(props.width),
    height: toCssValue(props.height),
    maxHeight: toCssValue(props.maxHeight),
    zIndex: zIndex.value
  };
});

function toggleOpen() {
  emit("update:open", !props.open);
}

function close() {
  emit("update:open", false);
}
</script>

<template>
  <span
    ref="activatorRef"
    :class="['v-popover__activator', props.pt?.activator?.class]"
    @click="toggleOpen"
    v-bind="props.pt?.activator"
  >
    <slot name="activator" />
  </span>

  <Teleport to="body">
    <div
      v-if="isOpen"
      ref="popoverRef"
      :class="['v-popover', props.pt?.root?.class]"
      :style="popoverStyle"
      :data-depth="parent.depth"
      v-bind="{ ...$attrs, ...props.pt?.root }"
    >
      <div
        ref="headerRef"
        :class="['v-popover__header', props.pt?.header?.class]"
        @pointerdown="draggable.onPointerDown"
        v-bind="props.pt?.header"
        v-if="hasTitle"
      >
        <slot name="title" />

        <div
          :class="['v-popover__close', props.pt?.close?.class]"
          v-bind="props.pt?.close"
          @pointerdown.stop
          @click.stop.prevent="close"
        >
          <slot name="close">
            &times;
          </slot>
        </div>
      </div>

      <div
        :class="['v-popover__content', props.pt?.content?.class]"
        v-bind="props.pt?.content"
      >
        <slot name="content" />
      </div>
    </div>
  </Teleport>
</template>
