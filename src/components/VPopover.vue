<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  toRef,
  nextTick,
  onBeforeUnmount,
  unref,
  CSSProperties,
} from "vue";

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
import { useManualPositioning } from "../composables/useManualPositioning";
import {
  createPopoverMiddleware,
  calculatePlacement,
  getPopoverReference
} from "../utils/popover";

defineOptions({ inheritAttrs: false });

const DEFAULT_PLACEMENT = "bottom-start";

const props = withDefaults(defineProps<PopoverProps>(), {
  open: false,
  disabled: false,
  placement: DEFAULT_PLACEMENT,
  offsetY: 8,
  padding: 8,
  flip: false,
  closeOnClickOutside: true,
  closeOnContentClick: true,
  closeOnEsc: true
});

const emit = defineEmits<PopoverEmits>();

const slots = defineSlots<{
  activator(props: {
    props: {
      onClick: (event: MouseEvent) => void
    };
  }): any;
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
const stackingStrategy = toRef(props, "stackingStrategy");
const resolvedActivatorRef = computed(() => {
  const external = unref(props.relativeTo);
  return external ?? activatorRef.value;
});

const parent = usePopoverContext(
  placement,
  stackingStrategy,
  popoverRef,
  headerRef
);

const isOpen = computed(() => props.open);
const isDisabled = computed(() => props.disabled);
const isOpenEffective = computed(() => isOpen.value && !isDisabled.value);
const hasTitle = computed(() => !!slots.title);

const resolvedStackingStrategy = computed<StackingStrategy | null>(() => {
  return parent.stackingStrategy?.value ?? stackingStrategy.value ?? null;
});

const middleware = computed(() => {
  const isStacked = resolvedStackingStrategy.value === "stacked" && parent.depth > 0;

  return createPopoverMiddleware({
    offsetY: props.offsetY,
    offsetX: props.offsetX,
    flip: props.flip,
    isStacked,
  });
});

const internalPlacement = computed<Placement>(() => {
  return calculatePlacement({
    strategy: resolvedStackingStrategy.value,
    parentDepth: parent.depth,
    placement: placement.value,
  });
});

const reference = computed(() => {
  return getPopoverReference({
    strategy: resolvedStackingStrategy.value,
    parentDepth: parent.depth,
    activatorRef: resolvedActivatorRef.value,
    parentPopoverRef: parent.popoverRef.value,
    parentHeaderRef: parent.headerRef.value
  });
});

const draggable = useDraggable({
  draggableRef: headerRef,
  popoverRef
});

const { isManualPositioning, manualStyles } = useManualPositioning({
  popoverRef,
  isOpen: isOpenEffective,
  positionX: toRef(props, "positionX"),
  positionY: toRef(props, "positionY"),
  padding: toRef(props, "padding")
});

const floatingEnabled = computed(() => {
  if (!isOpenEffective.value) return false;
  if (isManualPositioning.value) return false;
  if (draggable.isDragging.value) return false;
  if (draggable.isDragged.value) return false;
  return true;
});

const { floatingStyles } = useFloating(reference, popoverRef, {
  strategy: "absolute",
  placement: internalPlacement,
  open: floatingEnabled,
  middleware,
  whileElementsMounted: autoUpdate,
});

function destroyEscapeListener() {
  document.removeEventListener("keydown", onEscClick, true);
}

function onEscClick(event: KeyboardEvent) {
  if (event.key !== "Escape" || !isOpenEffective.value) return;
  emit("update:open", false);
}

function setupEscapeListener() {
  if (!props.closeOnEsc) return;

  nextTick(() => {
    document.addEventListener("keydown", onEscClick, true);
  });
}

function destroyClickOutsideListener() {
  document.removeEventListener("click", onDocumentClick, true);
}

function onDocumentClick(event: MouseEvent) {
  if (!isOpenEffective.value) return;

  if (
    isClickOutside(
      event.target,
      popoverRef.value,
      resolvedActivatorRef.value,
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
  () => [
    isOpenEffective.value,
    props.closeOnClickOutside,
    props.closeOnEsc,
    isDisabled.value
  ] as const,
  ([open, closeOnOutside, closeOnEsc]) => {
    destroyEscapeListener();
    destroyClickOutsideListener();

    if (open) {
      if (closeOnEsc) {
        setupEscapeListener();
      }

      if (closeOnOutside) {
        setupClickOutsideListener();
      }
    }
  },
  { immediate: true }
);

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled && isOpen.value) {
      emit("update:open", false);
    }
  }
);

onBeforeUnmount(() => {
  destroyEscapeListener();
  destroyClickOutsideListener();
});

const zIndex = computed(() => props.zIndex ?? 1000 + parent.depth * 10);

const popoverStyle = computed(() => {
  let base: CSSProperties = floatingStyles.value;

  if (isManualPositioning.value) {
    base = manualStyles.value;
  }

  if (draggable.isActive.value) {
    base = draggable.styles.value;
  }

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

function toggleOpen(event: MouseEvent) {
  if (isDisabled.value) return;
  event.stopPropagation();
  activatorRef.value = (event.currentTarget || event.target) as HTMLElement;
  emit("update:open", !props.open);
}

function close() {
  emit("update:open", false);
}

function onPopoverClick(event: MouseEvent) {
  if (!props.closeOnContentClick || isDisabled.value) return;
  if (headerRef.value?.contains(event.target as Node)) return;
  emit("update:open", false);
}
</script>

<template>
  <slot
    class="v-popover__activator"
    name="activator"
    :props="{
      onClick: toggleOpen
    }"
  />

  <Teleport to="body">
    <div
      v-if="isOpenEffective"
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

        <div
          class="v-popover__actions"
          v-bind="props.pt?.actions"
          @pointerdown.stop
        >
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
