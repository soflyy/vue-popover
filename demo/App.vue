<script setup lang="ts">
import { ref } from 'vue';

// Component
import '../src/style.css';
import { VPopover } from '../src/index';

// Demo State
const basicOpen = ref(false);
const topOpen = ref(false);
const leftOpen = ref(false);
const rightOpen = ref(false);
const bottomLeftOpen = ref(false);
const nestedOuterOpen = ref(false);
const nestedInnerOpen = ref(false);
const nestedDeepOpen = ref(false);
const draggableOpen = ref(false);
const bottomEdgeOpen = ref(false);
const bottomEdgeRows = ref(1);
</script>

<template>
  <div style="padding: 80px; font-family: sans-serif;">
    <h1>vue-popover Demo</h1>

    <section style="margin-bottom: 40px;">
      <h2>Basic (bottom)</h2>
      <VPopover
        v-model:open="basicOpen"
        placement="bottom"
        :width="250"
      >
        <template #activator>
          <button>Open Bottom</button>
        </template>

        <template #title>
          Basic Popover
        </template>

        <template #handle>
          <span>&#9776;</span>
        </template>
        <template #content>
          <p>This is a basic popover positioned at the bottom.</p>
        </template>
      </VPopover>
    </section>

    <section style="margin-bottom: 40px; display: flex; gap: 16px;">
      <div>
        <h2>Top</h2>
        <VPopover
          v-model:open="topOpen"
          placement="top"
          :width="200"
          :pt="{
            root: { style: 'background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
            content: { style: 'padding: 12px;' },
          }"
        >
          <template #activator><button>Open Top</button></template>
          <template #content><p>Top placement</p></template>
        </VPopover>
      </div>

      <div>
        <h2>Left</h2>
        <VPopover
          v-model:open="leftOpen"
          placement="left"
          :width="200"
          :pt="{
            root: { style: 'background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
            content: { style: 'padding: 12px;' },
          }"
        >
          <template #activator><button>Open Left</button></template>
          <template #content><p>Left placement</p></template>
        </VPopover>
      </div>

      <div>
        <h2>Right</h2>
        <VPopover
          v-model:open="rightOpen"
          placement="right"
          :width="200"
          :pt="{
            root: { style: 'background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
            content: { style: 'padding: 12px;' },
          }"
        >
          <template #activator>
            <button>Open Right</button>
          </template>
          <template #content><p>Right placement</p></template>
        </VPopover>
      </div>

      <div>
        <h2>Bottom Left</h2>
        <VPopover
          v-model:open="bottomLeftOpen"
          placement="bottom-start"
          :width="200"
          :pt="{
            root: { style: 'background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
            content: { style: 'padding: 12px;' },
          }"
        >
          <template #activator>
            <button>Open Bottom Left</button>
          </template>
          <template #content><p>Bottom-left placement</p></template>
        </VPopover>
      </div>
    </section>

    <section style="margin-bottom: 40px;">
      <h2>Nested Popovers</h2>
      <VPopover
        v-model:open="nestedOuterOpen"
        placement="bottom"
        :width="300"
        :pt="{
          root: { style: 'background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
          handle: { style: 'padding: 8px 12px; background: #e8f4fd; border-radius: 8px 8px 0 0; cursor: grab;' },
          header: { style: 'padding: 8px 12px; font-weight: bold;' },
          content: { style: 'padding: 12px;' },
        }"
      >
        <template #activator><button>Open Outer</button></template>
        <template #title>&#9776; Drag Outer</template>
        <template #content>
          <p>This popover contains a nested popover:</p>
          <VPopover
            v-model:open="nestedInnerOpen"
            placement="right"
            width="220"
            :pt="{
              root: { style: 'background: #fffbe6; border: 1px solid #e0c050; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
              handle: { style: 'padding: 6px 10px; background: #f5e6a0; border-radius: 8px 8px 0 0; cursor: grab;' },
              content: { style: 'padding: 10px;' },
            }"
          >
            <template #activator><button>Open Inner</button></template>
            <template #title>&#9776; Drag Inner</template>
            <template #content>
              <p>I'm nested! Higher z-index.</p>
              <VPopover
                v-model:open="nestedDeepOpen"
                placement="bottom-start"
                width="200"
                :pt="{
                  root: { style: 'background: #f0e6ff; border: 1px solid #9b7ed9; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
                  handle: { style: 'padding: 6px 10px; background: #e0d0f0; border-radius: 8px 8px 0 0; cursor: grab;' },
                  content: { style: 'padding: 10px;' },
                }"
              >
                <template #activator>
                  <button>Open Deep</button>
                </template>

                <template #title>&#9776; Drag Deep</template>

                <template #content>
                  <p>3 levels deep! Even higher z-index.</p>
                </template>
              </VPopover>
            </template>
          </VPopover>
        </template>
      </VPopover>
    </section>

    <section style="margin-bottom: 40px;">
      <h2>Activator near bottom of viewport (growing height)</h2>
      <p style="color: #666; margin-bottom: 16px;">
        Activator is fixed near the bottom. Open the popover and click "Add row" to grow it — flip/shift should keep it in view.
      </p>
      <div style="min-height: calc(100vh - 200px); display: flex; align-items: flex-end; justify-content: center;">
        <VPopover
          v-model:open="bottomEdgeOpen"
          placement="bottom"
          :width="280"
          :max-height="400"
          :pt="{
            root: { style: 'background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
            content: { style: 'padding: 12px;' },
          }"
        >
          <template #activator>
            <button>Open (near bottom)</button>
          </template>
          <template #content>
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
          </template>
        </VPopover>
      </div>
    </section>

    <section style="margin-bottom: 40px;">
      <h2>Draggable</h2>
      <VPopover
        v-model:open="draggableOpen"
        placement="bottom"
        width="280"
        height="180"
        :pt="{
          root: { style: 'background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
          handle: { style: 'padding: 10px 12px; background: #d4edda; border-radius: 8px 8px 0 0; cursor: grab; user-select: none;' },
          content: { style: 'padding: 12px;' },
        }"
      >
        <template #activator>
          <button>Open Draggable</button>
        </template>
        <template #title>
          &#9776; Draggable Popover
        </template>
        <template #content>
          <p>Drag me around! I stay within the viewport.</p>
        </template>
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

</style>