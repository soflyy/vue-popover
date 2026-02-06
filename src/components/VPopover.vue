<script setup lang="ts">
import { ref, computed, watch, toRef, nextTick, onBeforeUnmount } from "vue";
import type {
  PopoverProps,
  PopoverEmits,
  Placement,
  StackingStrategy
} from "../types";
import { useFloating, autoUpdate } from "@floating-ui/vue";
import { usePopoverContext } from "../composables/usePopoverContext";
import { useDraggable } from "../composables/useDraggable";
import { toCssValue } from "../utils/css";
import { isClickOutside } from "../utils/dom";
import {
  createPopoverMiddleware,
  calculatePlacement,
  getPopoverReference
} from "../utils/popover";

defineOptions({ inheritAttrs: false });

const DEFAULT_PLACEMENT = "bottom-start";

const props = withDefaults(defineProps<PopoverProps>(), {
  open: false,
  placement: DEFAULT_PLACEMENT,
  offset: 8,
  padding: 8,
  flip: false,
  closeOnClickOutside: true,
  closeOnClick: false
});

const emit = defineEmits<PopoverEmits>();

const slots = defineSlots<{
  activator(): any;
  title(): any;
  actions(): any;
  close(): any;
  header(): any;
  default(): any;
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

  return createPopoverMiddleware({
    offset: props.offset,
    flip: props.flip,
    isStacked
  });
});

const internalPlacement = computed<Placement>(() => {
  return calculatePlacement({
    strategy: activeStackingStrategy.value,
    parentDepth: parent.depth,
    basePlacement: basePlacement.value,
    defaultPlacement: DEFAULT_PLACEMENT
  });
});

const reference = computed(() => {
  return getPopoverReference({
    strategy: activeStackingStrategy.value,
    parentDepth: parent.depth,
    activatorRef: activatorRef.value,
    parentPopoverRef: parent.popoverRef.value,
    parentHeaderRef: parent.headerRef.value
  });
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

const zIndex = computed(() => props.zIndex ?? 1000 + parent.depth * 10);

const popoverStyle = computed(() => {
  const base =
    draggable.shouldUseDragStyles.value
      ? draggable.styles.value
      : floatingStyles.value;

  return {
    ...base,
    width: toCssValue(props.width),
    minWidth: toCssValue(props.minWidth),
    maxWidth: toCssValue(props.maxWidth),
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

function onPopoverClick() {
  if (!props.closeOnClick) return;
  emit("update:open", false);
}
</script>

<template>
  <span
    ref="activatorRef"
    class="v-popover__activator"
    @click="toggleOpen"
    v-bind="props.pt?.activator"
  >
    <slot name="activator" />
  </span>

  <Teleport to="body">
    <div
      v-if="isOpen"
      ref="popoverRef"
      class="v-popover"
      :style="popoverStyle"
      :data-depth="parent.depth"
      @click="onPopoverClick"
      v-bind="{ ...$attrs, ...props.pt?.root }"
    >
      <div
        ref="headerRef"
        class="v-popover__header"
        @pointerdown="draggable.onPointerDown"
        v-bind="props.pt?.header"
        v-if="hasTitle"
      >
        <slot name="title" />

        <div class="v-popover__header-actions" v-bind="props.pt?.actions">
          <slot name="actions" />

          <button
            class="v-popover__close"
            v-bind="props.pt?.close"
            @pointerdown.stop
            @click.stop.prevent="close"
          >
            <slot name="close">&times;</slot>
          </button>
        </div>
      </div>

      <div
        class="v-popover__content"
        v-bind="props.pt?.content"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>
