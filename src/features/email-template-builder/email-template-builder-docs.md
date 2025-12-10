## Overview

The email template builder feature provides a drag-and-drop editor for creating and editing MJML-based email templates inside the Lifepass admin. It wraps the `@usewaypoint/*` building blocks and a custom Payload-backed API client to let admins visually construct emails, preview the resulting HTML, and persist templates to a backend. The feature is integrated into the Next.js app via the `TemplateBuilder` client component and the `admin/[resortName]/template-builder` routes.

## File Tree

```text
email-template-builder/
├── @usewaypoint/
│   ├── block-*/index.tsx
│   │   → React components that represent individual building blocks (text, image, button, spacer, etc.)
│   │   → Provide configuration UIs and rendering logic for each block type
│   ├── document-core/
│   │   → Core document model and utility helpers for composing blocks into a full email document
│   └── email-builder/
│       └── utils/emailTemplateRenderer.ts
│           → Utilities for transforming the internal document model into MJML/HTML output
├── App/
│   ├── index.tsx
│   │   → Top-level builder UI composed of the template panel, inspector, and samples drawer
│   ├── InspectorDrawer/**
│   │   → Configuration sidebar for editing block-level and document-level settings
│   ├── SamplesDrawer/**
│   │   → Sample templates and quick-start actions for loading predefined layouts
│   └── TemplatePanel/**
│       → Core editing surface, JSON/HTML tabs, save/update/share controls
├── components/
│   ├── LanguageDropdown*.tsx
│   │   → Dropdown controls for selecting language variants when editing templates
│   └── SaveTemplateDialog.tsx
│       → Modal dialog for naming/describing a template and persisting it via `payloadApi`
├── documents/
│   ├── blocks/**
│   │   → Building block implementations used by the editor surface (containers, columns, overlays, etc.)
│   └── editor/**
│       → Editor context, DnD context, and base components that power drag-and-drop editing
├── getConfiguration/**
│   → Helpers for building the configuration schema used by the inspector panels
├── lib/payload-api.ts
│   → Client-side wrapper around the Payload HTTP API used for CRUD on templates
├── payload/
│   └── payload-types.ts
│       → Generated Payload CMS TypeScript types for editor integration
├── TemplateBuilder.tsx
│   → Next.js-compatible client entry that wraps the builder in MUI `ThemeProvider` and `DndContext`
├── theme.ts
│   → MUI theme configuration shared between the builder and the surrounding Next.js app
└── utils/htmlGenerator.ts
    → Utility to turn the internal document model into standalone email-ready HTML
```

## Functions & Components

### `TemplateBuilder`

**Purpose**: Provide a Next.js-compatible client component that renders the full email template builder UI.

**Location**: `TemplateBuilder.tsx`

**Parameters**:
- None – it internally wires up theming and the editor context.

**Returns**:
- `JSX.Element` – the rendered builder UI.

**Side Effects**:
- Uses MUI `ThemeProvider` and `CssBaseline` to set up styling.
- Mounts the drag-and-drop editor context via `DndContext`.

**Example Usage**:

```tsx
import TemplateBuilder from '@/features/email-template-builder/TemplateBuilder'

export default function CreateTemplate() {
  return <TemplateBuilder />
}
```

**Internal Logic**:
1. Imports the shared MUI theme from `theme.ts`.
2. Imports `DndContext` from `documents/editor/DndContext` to initialise drag-and-drop.
3. Imports the main `App` component from `App/index`.
4. Renders `ThemeProvider` → `DndContext` → `CssBaseline` → `App` to mount the full builder.

**Dependencies**:
- `@mui/material` and `@mui/material/styles` for theming.
- Local editor context from `documents/editor/DndContext`.
- Main builder UI from `App/index`.

## State Management

- **Local UI State**: Most state (selected block, inspector state, active tab, etc.) is managed inside the `App`, `TemplatePanel`, `InspectorDrawer`, and `SamplesDrawer` components via React state and context.
- **Server State**: Template persistence uses `payloadApi` (in `lib/payload-api.ts`) to talk to a Payload HTTP backend; the builder itself does not own global React Query caches.
- **Editor Context**: `documents/editor/EditorContext` and `DndContext` manage the document tree, selection, and drag-and-drop operations shared across all editor components.

## External Dependencies

- **Production**:
  - `@usewaypoint/*` – block and document core packages providing the core builder primitives.
  - `@mui/material` & `@mui/icons-material` – UI framework and icons for the builder chrome and controls.
  - `mjml` / `mjml-browser` – MJML parsing and rendering for email HTML output.
  - `marked`, `highlight.js`, `insane` – markdown rendering and safe HTML handling when editing text blocks.
  - `payload` backend (accessed via `payloadApi`) – external service used to store and retrieve templates.
- **Internal**:
  - `@/features/email-template-builder/lib/payload-api` – HTTP client wrapper for template CRUD.
  - `@/features/email-template-builder/utils/htmlGenerator` – converts document structures to HTML.
  - `@/features/email-template-builder/documents/editor/*` – editor and DnD context providers.

## Usage Examples

### Create Template Route

The `create` page uses the high-level `TemplateBuilder` wrapper:

```tsx
// src/app/admin/[resortName]/template-builder/create/page.tsx
import TemplateBuilder from '@/features/email-template-builder/TemplateBuilder'

export default function CreateTemplate() {
  return <TemplateBuilder />
}
```

### Edit Template Route

The `edit` page can mount the editing panel directly when an existing template is loaded:

```tsx
// src/app/admin/[resortName]/template-builder/edit/[...id]/page.tsx
'use client'

import EditTemplatePanel from '@/features/email-template-builder/App/TemplatePanel/EditTemplatePanel'
import DndContext from '@/features/email-template-builder/documents/editor/DndContext'
import theme from '@/features/email-template-builder/theme'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

export default function TemplateBuilder() {
  return (
    <ThemeProvider theme={theme}>
      <DndContext>
        <CssBaseline />
        <EditTemplatePanel />
      </DndContext>
    </ThemeProvider>
  )
}
```

## Testing Guidelines

- **Unit Tests**:
  - Test `lib/payload-api.ts` in isolation to ensure correct HTTP endpoints, payload shapes, and error handling when the backend is unavailable.
  - Test `utils/htmlGenerator.ts` for a representative set of block trees to guarantee stable and valid HTML output.
- **Integration Tests**:
  - Cover the happy path of creating a new template: open builder, add a few blocks, open the save dialog, and persist via `payloadApi`.
  - Cover editing an existing template: load data, ensure blocks render correctly, modify content, and update successfully.
  - Verify that drag-and-drop operations in `DndContext` correctly update the document tree and re-render the preview.

## Known Issues & Limitations

- The builder currently depends on an external Payload API configured via `payloadApi`; if that service is unavailable, save and load operations will fail.
- The feature was originally extracted from a Vite-based project; Vite-specific entrypoints (`main.tsx`, `vite-env.d.ts`) and standalone Payload server scripts have been removed in this Next.js integration.
- Very large templates with many blocks may impact client-side performance due to the complexity of drag-and-drop operations and MJML/HTML generation.

## Change Log

### [1.0.1] - 2025-12-04
- Removed obsolete Vite entrypoint (`main.tsx`) and its build artifacts from the feature.
- Removed unused standalone Payload server bootstrap and local `payload.config.js` now that Next.js integrates the builder directly.
- Documented the email template builder structure and integration with Next.js routes.

### [1.0.0] - 2025-10-xx
- Initial integration of the email template builder into the Lifepass admin Next.js app.
- Added routes under `admin/[resortName]/template-builder` for creating and editing templates.

