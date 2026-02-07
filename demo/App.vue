<script setup lang="ts">
import { ref } from 'vue';

// Components
import '../src/style.css';
import { VPopover } from '../src/index';

// Demo
import NestedPopoverDemo from './NestedPopoverDemo.vue';

const basicOpen = ref(false);
const topOpen = ref(false);
const leftOpen = ref(false);
const rightOpen = ref(false);
const bottomLeftOpen = ref(false);
const nestedOuterOpen = ref(false);
const nestedSideBySideOpen = ref(false);
const nestedStackedFirstVisibleOpen = ref(false);
const draggableOpen = ref(false);
const bottomEdgeOpen = ref(false);
const bottomEdgeRows = ref(1);
const externalActivatorOpen = ref(false);
const externalActivatorRef = ref<HTMLElement | null>(null);


const runDemoActions = (event: MouseEvent) => {
  console.log(event);
  alert('runDemoActions');
};
</script>

<template>
  <div style="padding: 80px; font-family: sans-serif;">
    <h1>vue-popover Demo</h1>

    <section style="margin-bottom: 40px;">
      <h2>Basic (bottom)</h2>
      <VPopover
        v-model:open="basicOpen"
        placement="bottom-start"
        :close-on-content-click="false"
        :width="250"
      >
        <template #activator="{ props }">
          <button v-bind="props">Open Bottom</button>
        </template>

        <template #actions>
          <button @click.stop="runDemoActions">Action</button>
        </template>

        <template #title>
          Basic Popover
        </template>

        <template #header>
          <span>&#9776;</span>
        </template>
        <p>This is a basic popover positioned at the bottom.</p>
      </VPopover>
    </section>

    <section style="margin-bottom: 40px; display: flex; gap: 16px;">
      <div>
        <h2>Top</h2>
        <VPopover
          v-model:open="topOpen"
          placement="top"
          :close-on-content-click="false"
          :width="200"
          :pt="{
            root: { style: 'background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
            content: { style: 'padding: 12px;' },
          }"
        >
          <template #activator="{ props }">
            <button v-bind="props">Open Top</button>
          </template>

          <p>Top placement</p>
        </VPopover>
      </div>

      <div>
        <h2>Left</h2>
        <VPopover
          v-model:open="leftOpen"
          placement="left"
          :close-on-content-click="false"
          :width="200"
          :pt="{
            root: { style: 'background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
            content: { style: 'padding: 12px;' },
          }"
        >
          <template #activator="{ props }">
            <button v-bind="props">Open Left</button>
          </template>
          <p>Left placement</p>
        </VPopover>
      </div>

      <div>
        <h2>Right</h2>
        <VPopover
          v-model:open="rightOpen"
          placement="right"
          :width="200"
          :close-on-content-click="false"
          :pt="{
            root: { style: 'background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
            content: { style: 'padding: 12px;' },
          }"
        >
          <template #activator="{ props }">
            <button v-bind="props">Open Right</button>
          </template>
          <p>Right placement</p>
        </VPopover>
      </div>

      <div>
        <h2>Bottom Left</h2>
        <VPopover
          v-model:open="bottomLeftOpen"
          placement="bottom-start"
          :close-on-content-click="false"
          :width="200"
          :pt="{
            root: { style: 'background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
            content: { style: 'padding: 12px;' },
          }"
        >
          <template #activator="{ props }">
            <button v-bind="props">Open Bottom Left</button>
          </template>
          <p>Bottom-left placement</p>
        </VPopover>
      </div>
    </section>

    <section style="margin-bottom: 40px;">
      <h2>Nested Popovers</h2>
      <div style="display: flex; gap: 16px;">
        <VPopover
          v-model:open="nestedOuterOpen"
          placement="stacked"
          :close-on-content-click="false"
          :width="300"
        >
          <template #activator="{ props }">
            <button v-bind="props">Open Stacked</button>
          </template>
          <template #title>&#9776; Drag Outer</template>
          <p>This popover contains a nested popover:</p>
          <NestedPopoverDemo />
        </VPopover>
        <VPopover
          v-model:open="nestedSideBySideOpen"
          placement="side-by-side"
          :close-on-content-click="false"
          :width="300"
        >
          <template #activator="{ props }">
            <button v-bind="props">Open Side By Side</button>
          </template>
          <template #title>&#9776; Drag Side By Side</template>
          <p>This popover is side by side with the outer popover:</p>
          <NestedPopoverDemo />
        </VPopover>
        <VPopover
          v-model:open="nestedStackedFirstVisibleOpen"
          placement="stacked-first-visible"
          :close-on-content-click="false"
          :width="300"
        >
          <template #activator="{ props }">
            <button v-bind="props">Open Stacked First Visible</button>
          </template>
          <template #title>&#9776; Drag Stacked First Visible</template>
          <p>This popover is stacked first visible with the outer popover:</p>
          <NestedPopoverDemo />
        </VPopover>
      </div>
    </section>

    <section style="margin-bottom: 40px;">
      <h2>Activator near bottom of viewport (growing height)</h2>
      <p style="color: #666; margin-bottom: 16px;">
        Activator is fixed near the bottom. Open the popover and click "Add row" to grow it — flip/shift should keep it in view.
      </p>
      <div style="min-height: calc(100vh - 200px); display: flex; align-items: flex-end; justify-content: center;">
        <VPopover
          v-model:open="bottomEdgeOpen"
          placement="right"
          :close-on-content-click="false"
          :width="280"
          :max-height="400"
          :pt="{
            root: { style: 'background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
            content: { style: 'padding: 12px;' },
          }"
        >
          <template #activator="{ props }">
            <button v-bind="props">Open (near bottom)</button>
          </template>
          <p style="margin: 0 0 12px 0;">Click to grow the popover:</p>
          <template v-for="i in bottomEdgeRows" :key="i">
            <div :style="{ padding: '8px', background: i % 2 ? '#f0f0f0' : '#e8e8e8', borderRadius: '4px', marginBottom: i < bottomEdgeRows ? '8px' : 0 }">
              Row {{ i }}
            </div>
          </template>
          <button
            type="button"
            style="margin-top: 12px; padding: 6px 12px; cursor: pointer;"
            @click="bottomEdgeRows = Math.min(bottomEdgeRows + 1, 8)"
          >
            Add row
          </button>
          <button
            v-if="bottomEdgeRows > 1"
            type="button"
            style="margin-top: 12px; margin-left: 8px; padding: 6px 12px; cursor: pointer;"
            @click="bottomEdgeRows = Math.max(bottomEdgeRows - 1, 1)"
          >
            Remove row
          </button>
        </VPopover>
      </div>
    </section>

    <section style="margin-bottom: 40px;">
      <h2>Draggable</h2>
      <VPopover
        v-model:open="draggableOpen"
        placement="bottom-start"
        :close-on-content-click="false"
        width="280"
        height="180"
        :pt="{
          root: { style: 'background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
          header: { style: 'padding: 10px 12px; background: #d4edda; border-radius: 8px 8px 0 0; cursor: grab; user-select: none;' },
          content: { style: 'padding: 12px;' },
        }"
      >
        <template #activator="{ props }">
          <button v-bind="props">Open Draggable</button>
        </template>
        <template #title>
          &#9776; Draggable Popover
        </template>

        <p>Drag me around! I stay within the viewport.</p>
      </VPopover>
    </section>

    <section style="margin-bottom: 40px;">
      <h2>Activator Ref Prop</h2>
      <p style="color: #666; margin-bottom: 12px;">
        The popover is positioned relative to an external button via `activator-ref`.
      </p>
      <button
        ref="externalActivatorRef"
        type="button"
        style="padding: 6px 12px; cursor: pointer;"
        @click="externalActivatorOpen = !externalActivatorOpen"
      >
        Toggle Popover
      </button>
      <VPopover
        v-model:open="externalActivatorOpen"
        placement="bottom-start"
        :close-on-content-click="false"
        :relative-to="externalActivatorRef"
        :pt="{
          root: { style: 'background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
          content: { style: 'padding: 12px;' },
        }"
      >
        <p>This popover uses an external activator element.</p>
      </VPopover>
    </section>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}

p {
  margin-top: 0;
}

.v-popover__content {
  padding: 12px;
}
</style>