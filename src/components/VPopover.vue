<script setup lang="ts">
import { ref, computed, watch, toRef, nextTick, onBeforeUnmount, provide } from "vue";
import type { PopoverProps, PopoverEmits } from "../types";
import { useFloating, autoUpdate, offset, flip, shift } from "@floating-ui/vue";
import { usePopoverContext } from "../composables/usePopoverContext";
import { useDraggable } from "../composables/useDraggable";
import { toCssValue } from "../utils";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PopoverProps>(), {
  open: false,
  placement: "bottom",
  stackingStrategy: "stacked",
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
const stackingStrategy = toRef(props, "stackingStrategy");

const parent = usePopoverContext(stackingStrategy, popoverRef, headerRef);

const isOpen = computed(() => props.open);
const floatingEnabled = ref(false);
const hasTitle = computed(() => !!slots.title);

const middleware = computed(() => [
  offset(props.offset),
  flip(),
  shift({ padding: 8 }),
]);

const reference = computed(() => {
  if (parent.depth > 0 && parent.stackingStrategy.value === "side-by-side") {
    return parent.popoverRef.value;
  }

  if (parent.stackingStrategy.value === "stacked") {
    return parent.headerRef.value;
  }

  return activatorRef.value;
});

const { floatingStyles } = useFloating(reference, popoverRef, {
  placement,
  strategy: "absolute",
  open: floatingEnabled,
  middleware,
  whileElementsMounted: autoUpdate,
});

const draggable = useDraggable({
  headerRef,
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

// Escape to close: when open, close on Escape key.
function destroyEscapeListener() {
  document.removeEventListener("keydown", onEscClick, true);
}

function onEscClick(e: KeyboardEvent) {
  if (e.key !== "Escape" || !props.open) return;
  emit("update:open", false);
}

function setupEscapeListener() {
  nextTick(() => {
    document.addEventListener("keydown", onEscClick, true);
  });
}

// Click outside to close: when open and closeOnClickOutside, close if click is not inside this popover, its activator, or any nested popover.
function destroyClickOutsideListener() {
  document.removeEventListener("click", onDocumentClick, true);
}

function isClickOutside(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Node)) return true;
  const root = popoverRef.value;
  const activator = activatorRef.value;
  if (root?.contains(target) || activator?.contains(target)) return false;


  const clickedPopover = (target as Element).closest?.(".v-popover");

  if (clickedPopover && clickedPopover !== root) {
    const clickedDepth = Number((clickedPopover as HTMLElement).dataset.depth);
    if (!Number.isNaN(clickedDepth)) {
      if (clickedDepth > parent.depth) return false; // nested popover, don't close
      if (clickedDepth < parent.depth) return true; // clicked on parent, close this and any deeper are handled by their own listeners
    }
  }

  return true;
}

function onDocumentClick(e: MouseEvent) {
  if (!props.open) return;
  if (isClickOutside(e.target)) {
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
    draggable.isDragged.value && draggable.dragPosition.value
      ? {
          position: "absolute" as const,
          left: `${draggable.dragPosition.value!.x}px`,
          top: `${draggable.dragPosition.value!.y}px`,
        }
      : floatingStyles.value;

  return {
    ...base,
    width: toCssValue(props.width),
    height: toCssValue(props.height),
    maxHeight: toCssValue(props.maxHeight),
    zIndex: zIndex.value,
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
