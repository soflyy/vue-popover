<script setup lang="ts">
import { ref } from 'vue';
import '../src/style.css';
import { VPopover } from '../src/index';

const innerOpen = ref(false);
const deepOpen = ref(false);
</script>

<template>
  <VPopover
    v-model:open="innerOpen"
    placement="right"
    width="220"
    :close-on-content-click="false"
    :pt="{
      root: { style: 'background: #fffbe6; border: 1px solid #e0c050; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
      header: { style: 'padding: 6px 10px; background: #f5e6a0; border-radius: 8px 8px 0 0; cursor: grab;' },
      content: { style: 'padding: 10px;' },
    }"
  >
    <template #activator="{ props }">
      <button v-bind="props">Open Inner</button>
    </template>
    <template #title>&#9776; Drag Inner</template>
    <p>I'm nested! Higher z-index.</p>
    <VPopover
      v-model:open="deepOpen"
      placement="bottom-start"
      width="200"
      :close-on-content-click="false"
      :pt="{
        root: { style: 'background: #f0e6ff; border: 1px solid #9b7ed9; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' },
        header: { style: 'padding: 6px 10px; background: #e0d0f0; border-radius: 8px 8px 0 0; cursor: grab;' },
        content: { style: 'padding: 10px;' },
      }"
    >
      <template #activator="{ props }">
        <button v-bind="props">Open Deep</button>
      </template>
      <template #title>&#9776; Drag Deep</template>
      <p>3 levels deep! Even higher z-index.</p>
    </VPopover>
  </VPopover>
</template>
