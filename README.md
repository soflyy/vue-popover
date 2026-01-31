# vue-popover

A Vue 3 popover component with flexible positioning, drag-to-move, and customizable styling. Uses [Floating UI](https://floating-ui.com/) for viewport-aware positioning.

## Features

- **Flexible positioning** — Place popovers top, bottom, left, right, or any side with `-start` / `-end` variants. Automatically flips and shifts to stay in view.
- **Draggable** — Popovers with a header (title slot) can be dragged by the header and stay within the viewport.
- **Passthrough API** — Apply custom attributes, classes, and styles to internal elements via the `pt` prop.
- **Teleported** — Renders in `body` to avoid overflow and stacking-context issues.

## Installation

```bash
npm install vue-popover
```

### Peer dependencies

- Vue 3.3+
- [@floating-ui/vue](https://www.npmjs.com/package/@floating-ui/vue) 1.1+

```bash
npm install @floating-ui/vue
```

## Quick start

```vue
<script setup>
import { ref } from 'vue';
import { VPopover } from 'vue-popover';
import 'vue-popover/style.css';

const open = ref(false);
</script>

<template>
  <VPopover v-model:open="open" placement="bottom" :width="250">
    <template #activator>
      <button>Open popover</button>
    </template>

    <template #title>My Popover</template>

    <template #content>
      <p>Popover content goes here.</p>
    </template>
  </VPopover>
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Controls visibility (use with `v-model:open`). |
| `placement` | `Placement` | `'bottom'` | Preferred placement. Values: `'top'`, `'bottom'`, `'left'`, `'right'`, `'top-start'`, `'top-end'`, `'bottom-start'`, `'bottom-end'`, `'left-start'`, `'left-end'`, `'right-start'`, `'right-end'`. |
| `width` | `string \| number` | — | Popover width (CSS value, e.g. `250` or `'20rem'`). |
| `height` | `string \| number` | — | Popover height. |
| `offset` | `number` | `8` | Gap in pixels between popover and activator. |
| `closeOnClickOutside` | `boolean` | `true` | Close when clicking outside the popover. |
| `pt` | `PassthroughOptions` | — | Passthrough attributes/classes/styles for root, activator, header, close, content. |

## Slots

| Slot | Description |
|------|-------------|
| `activator` | Element that toggles the popover (required). |
| `title` | Header content. When present, the header is shown and the popover becomes draggable by the header. |
| `close` | Close button content (default: `×`). |
| `content` | Main popover content (required). |

## Styling

Import the default styles:

```js
import 'vue-popover/style.css';
```

Use the `pt` prop for inline customization:

```vue
<VPopover
  :pt="{
    root: { class: 'my-popover', style: 'background: white; border-radius: 8px;' },
    header: { class: 'my-header' },
    content: { style: 'padding: 16px;' },
  }"
>
  <!-- slots -->
</VPopover>
```

## Development

```bash
npm install
npm run dev   # Demo at http://localhost:5173
npm run build
```
