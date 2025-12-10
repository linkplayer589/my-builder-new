// import { create } from "zustand"

// import getConfiguration from "../../getConfiguration"
// import { TEditorConfiguration } from "./core"

// type TValue = {
//   document: TEditorConfiguration

//   selectedBlockId: string | null
//   selectedSidebarTab: "block-configuration" | "styles"
//   selectedMainTab: "editor" | "preview" | "json" | "html"
//   selectedScreenSize: "desktop" | "mobile"

//   inspectorDrawerOpen: boolean
//   samplesDrawerOpen: boolean
// }

// // Safe function to get configuration that works on both server and client
// const getSafeConfiguration = () => {
//   // Only access window on client side
//   if (typeof window === "undefined") {
//     return getConfiguration("") // Return empty or default configuration for SSR
//   }
//   return getConfiguration(window.location.hash)
// }

// const editorStateStore = create<TValue>(() => ({
//   document: getSafeConfiguration(),
//   selectedBlockId: null,
//   selectedSidebarTab: "styles",
//   selectedMainTab: "editor",
//   selectedScreenSize: "desktop",

//   inspectorDrawerOpen: true,
//   samplesDrawerOpen: false,
// }))

// export function useDocument() {
//   return editorStateStore((s) => s.document)
// }

// export function useSelectedBlockId() {
//   return editorStateStore((s) => s.selectedBlockId)
// }

// export function useSelectedScreenSize() {
//   return editorStateStore((s) => s.selectedScreenSize)
// }

// export function useSelectedMainTab() {
//   return editorStateStore((s) => s.selectedMainTab)
// }

// export function setSelectedMainTab(selectedMainTab: TValue["selectedMainTab"]) {
//   return editorStateStore.setState({ selectedMainTab })
// }

// export function useSelectedSidebarTab() {
//   return editorStateStore((s) => s.selectedSidebarTab)
// }

// export function useInspectorDrawerOpen() {
//   return editorStateStore((s) => s.inspectorDrawerOpen)
// }

// export function useSamplesDrawerOpen() {
//   return editorStateStore((s) => s.samplesDrawerOpen)
// }

// export function setSelectedBlockId(selectedBlockId: TValue["selectedBlockId"]) {
//   const selectedSidebarTab =
//     selectedBlockId === null ? "styles" : "block-configuration"
//   const options: Partial<TValue> = {}
//   if (selectedBlockId !== null) {
//     options.inspectorDrawerOpen = true
//   }
//   return editorStateStore.setState({
//     selectedBlockId,
//     selectedSidebarTab,
//     ...options,
//   })
// }

// export function setSidebarTab(
//   selectedSidebarTab: TValue["selectedSidebarTab"]
// ) {
//   return editorStateStore.setState({ selectedSidebarTab })
// }

// export function resetDocument(document: TValue["document"]) {
//   return editorStateStore.setState({
//     document,
//     selectedSidebarTab: "styles",
//     selectedBlockId: null,
//   })
// }

// export function setDocument(document: TValue["document"]) {
//   const originalDocument = editorStateStore.getState().document
//   return editorStateStore.setState({
//     document: {
//       ...originalDocument,
//       ...document,
//     },
//   })
// }

// export function toggleInspectorDrawerOpen() {
//   const inspectorDrawerOpen = !editorStateStore.getState().inspectorDrawerOpen
//   return editorStateStore.setState({ inspectorDrawerOpen })
// }

// export function toggleSamplesDrawerOpen() {
//   const samplesDrawerOpen = !editorStateStore.getState().samplesDrawerOpen
//   return editorStateStore.setState({ samplesDrawerOpen })
// }

// export function setSelectedScreenSize(
//   selectedScreenSize: TValue["selectedScreenSize"]
// ) {
//   return editorStateStore.setState({ selectedScreenSize })
// }

// // Add this to your EditorContext file
// export function moveBlock(fromId: string, toId: string) {
//   const document = editorStateStore.getState().document

//   // Find source and target containers
//   let sourceContainerId: string | null = null
//   let targetContainerId: string | null = null
//   let sourceChildren: string[] = []
//   let targetChildren: string[] = []

//   // Find which containers hold these blocks
//   for (const [containerId, block] of Object.entries(document)) {
//     const childrenIds = getChildrenIds(block)
//     if (childrenIds.includes(fromId)) {
//       sourceContainerId = containerId
//       sourceChildren = childrenIds
//     }
//     if (childrenIds.includes(toId)) {
//       targetContainerId = containerId
//       targetChildren = childrenIds
//     }
//   }

//   if (!sourceContainerId || !targetContainerId) return

//   // Check if moving within same container
//   if (sourceContainerId === targetContainerId) {
//     const fromIndex = sourceChildren.indexOf(fromId)
//     const toIndex = targetChildren.indexOf(toId)

//     if (fromIndex !== -1 && toIndex !== -1) {
//       const newChildren = [...sourceChildren]
//       const [movedItem] = newChildren.splice(fromIndex, 1)
//       newChildren.splice(toIndex, 0, movedItem!)

//       const updatedDocument = { ...document }
//       updatedDocument[sourceContainerId] = updateChildrenIds(
//         updatedDocument[sourceContainerId],
//         newChildren
//       )
//       editorStateStore.setState({ document: updatedDocument })
//     }
//     return
//   }

//   // Cross-container move
//   // Remove from source
//   const fromIndex = sourceChildren.indexOf(fromId)
//   const newSourceChildren = [...sourceChildren]
//   newSourceChildren.splice(fromIndex, 1)

//   // Add to target (after the toId)
//   const toIndex = targetChildren.indexOf(toId)
//   const newTargetChildren = [...targetChildren]
//   newTargetChildren.splice(toIndex + 1, 0, fromId)

//   // Update both containers
//   const updatedDocument = { ...document }
//   updatedDocument[sourceContainerId] = updateChildrenIds(
//     updatedDocument[sourceContainerId],
//     newSourceChildren
//   )
//   updatedDocument[targetContainerId] = updateChildrenIds(
//     updatedDocument[targetContainerId],
//     newTargetChildren
//   )

//   editorStateStore.setState({ document: updatedDocument })
// }

// // Helper functions
// function getChildrenIds(block: any): string[] {
//   return block.data?.childrenIds || block.data?.props?.childrenIds || []
// }

// function updateChildrenIds(block: any, newChildrenIds: string[]) {
//   if (block.data?.childrenIds) {
//     return { ...block, data: { ...block.data, childrenIds: newChildrenIds } }
//   }
//   if (block.data?.props?.childrenIds) {
//     return {
//       ...block,
//       data: {
//         ...block.data,
//         props: { ...block.data.props, childrenIds: newChildrenIds },
//       },
//     }
//   }
//   return block
// }

// stores/editor-store.ts
import { create } from "zustand"

import getConfiguration from "../../getConfiguration"
import { AzureTranslationService } from "../../lib/translation/azure-translator"
import { TEditorConfiguration } from "./core"

export type Language = "en" | "fr" | "de" | "it"

type TValue = {
  document: TEditorConfiguration
  currentLanguage: Language
  isTranslating: boolean

  selectedBlockId: string | null
  selectedSidebarTab: "block-configuration" | "styles"
  selectedMainTab: "editor" | "preview" | "json" | "html"
  selectedScreenSize: "desktop" | "mobile"

  inspectorDrawerOpen: boolean
  samplesDrawerOpen: boolean
}

// Safe function to get configuration that works on both server and client
const getSafeConfiguration = () => {
  if (typeof window === "undefined") {
    return getConfiguration("")
  }
  return getConfiguration(window.location.hash)
}

const editorStateStore = create<TValue>((set, get) => ({
  document: getSafeConfiguration(),
  currentLanguage: "en",
  isTranslating: false,

  selectedBlockId: null,
  selectedSidebarTab: "styles",
  selectedMainTab: "editor",
  selectedScreenSize: "desktop",

  inspectorDrawerOpen: true,
  samplesDrawerOpen: false,
}))

// Recursive function to translate all text content in the document
const translateDocumentContent = async (
  obj: any,
  translator: AzureTranslationService,
  targetLang: Language
) => {
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === "object") {
      await translateDocumentContent(obj[key], translator, targetLang)
    } else if (typeof obj[key] === "string") {
      // Translate text content in props (expand this list as needed)
      const translatableKeys = [
        "text",
        "contents",
        "headingText",
        "primaryText",
        "secondaryText",
        "purpose",
        "alt",
        "logoUrl",
        "backgroundImage",
        "imageUrl",
      ]

      if (translatableKeys.includes(key)) {
        try {
          // Skip translation for URLs and template variables
          if (
            !obj[key].startsWith("http") &&
            !obj[key].startsWith("#") &&
            !obj[key].includes("{{") &&
            !obj[key].includes("[")
          ) {
            obj[key] = await translator.translate(obj[key], targetLang)
          }
        } catch (error) {
          console.warn(`Failed to translate: ${obj[key]}`, error)
          // Keep original text if translation fails
        }
      }
    }
  }
}

// Translation actions
export const translateDocument = async (targetLanguage: Language) => {
  const { document, currentLanguage } = editorStateStore.getState()

  if (targetLanguage === currentLanguage) {
    return // No translation needed
  }

  editorStateStore.setState({ isTranslating: true })

  try {
    // Initialize Azure Translator
    const translator = new AzureTranslationService(
      process.env.NEXT_PUBLIC_AZURE_TRANSLATION_KEY!,
      process.env.NEXT_PUBLIC_AZURE_REGION || "global"
    )

    // Create a deep copy of the document to avoid mutating the original
    const translatedDoc = JSON.parse(JSON.stringify(document))

    // Translate all text content in the document
    await translateDocumentContent(translatedDoc, translator, targetLanguage)

    // Update the store with translated document and new language
    editorStateStore.setState({
      document: translatedDoc,
      currentLanguage: targetLanguage,
      isTranslating: false,
    })
  } catch (error) {
    console.error("Document translation failed:", error)
    editorStateStore.setState({ isTranslating: false })
    throw error
  }
}

export const setLanguage = (language: Language) => {
  editorStateStore.setState({ currentLanguage: language })
}

// Existing exports (keep all your existing functions)
export function useDocument() {
  return editorStateStore((s) => s.document)
}

export function useCurrentLanguage() {
  return editorStateStore((s) => s.currentLanguage)
}

export function useIsTranslating() {
  return editorStateStore((s) => s.isTranslating)
}

export function useSelectedBlockId() {
  return editorStateStore((s) => s.selectedBlockId)
}

export function useSelectedScreenSize() {
  return editorStateStore((s) => s.selectedScreenSize)
}

export function useSelectedMainTab() {
  return editorStateStore((s) => s.selectedMainTab)
}

export function setSelectedMainTab(selectedMainTab: TValue["selectedMainTab"]) {
  return editorStateStore.setState({ selectedMainTab })
}

export function useSelectedSidebarTab() {
  return editorStateStore((s) => s.selectedSidebarTab)
}

export function useInspectorDrawerOpen() {
  return editorStateStore((s) => s.inspectorDrawerOpen)
}

export function useSamplesDrawerOpen() {
  return editorStateStore((s) => s.samplesDrawerOpen)
}

export function setSelectedBlockId(selectedBlockId: TValue["selectedBlockId"]) {
  const selectedSidebarTab =
    selectedBlockId === null ? "styles" : "block-configuration"
  const options: Partial<TValue> = {}
  if (selectedBlockId !== null) {
    options.inspectorDrawerOpen = true
  }
  return editorStateStore.setState({
    selectedBlockId,
    selectedSidebarTab,
    ...options,
  })
}

export function setSidebarTab(
  selectedSidebarTab: TValue["selectedSidebarTab"]
) {
  return editorStateStore.setState({ selectedSidebarTab })
}

export function resetDocument(document: TValue["document"]) {
  return editorStateStore.setState({
    document,
    selectedSidebarTab: "styles",
    selectedBlockId: null,
  })
}

export function setDocument(document: TValue["document"]) {
  const originalDocument = editorStateStore.getState().document
  return editorStateStore.setState({
    document: {
      ...originalDocument,
      ...document,
    },
  })
}

export function toggleInspectorDrawerOpen() {
  const inspectorDrawerOpen = !editorStateStore.getState().inspectorDrawerOpen
  return editorStateStore.setState({ inspectorDrawerOpen })
}

export function toggleSamplesDrawerOpen() {
  const samplesDrawerOpen = !editorStateStore.getState().samplesDrawerOpen
  return editorStateStore.setState({ samplesDrawerOpen })
}

export function setSelectedScreenSize(
  selectedScreenSize: TValue["selectedScreenSize"]
) {
  return editorStateStore.setState({ selectedScreenSize })
}

// Add this to your EditorContext file
export function moveBlock(fromId: string, toId: string) {
  const document = editorStateStore.getState().document

  // Find source and target containers
  let sourceContainerId: string | null = null
  let targetContainerId: string | null = null
  let sourceChildren: string[] = []
  let targetChildren: string[] = []

  // Find which containers hold these blocks
  for (const [containerId, block] of Object.entries(document)) {
    const childrenIds = getChildrenIds(block)
    if (childrenIds.includes(fromId)) {
      sourceContainerId = containerId
      sourceChildren = childrenIds
    }
    if (childrenIds.includes(toId)) {
      targetContainerId = containerId
      targetChildren = childrenIds
    }
  }

  if (!sourceContainerId || !targetContainerId) return

  // Check if moving within same container
  if (sourceContainerId === targetContainerId) {
    const fromIndex = sourceChildren.indexOf(fromId)
    const toIndex = targetChildren.indexOf(toId)

    if (fromIndex !== -1 && toIndex !== -1) {
      const newChildren = [...sourceChildren]
      const [movedItem] = newChildren.splice(fromIndex, 1)
      newChildren.splice(toIndex, 0, movedItem!)

      const updatedDocument = { ...document }
      updatedDocument[sourceContainerId] = updateChildrenIds(
        updatedDocument[sourceContainerId],
        newChildren
      )
      editorStateStore.setState({ document: updatedDocument })
    }
    return
  }

  // Cross-container move
  // Remove from source
  const fromIndex = sourceChildren.indexOf(fromId)
  const newSourceChildren = [...sourceChildren]
  newSourceChildren.splice(fromIndex, 1)

  // Add to target (after the toId)
  const toIndex = targetChildren.indexOf(toId)
  const newTargetChildren = [...targetChildren]
  newTargetChildren.splice(toIndex + 1, 0, fromId)

  // Update both containers
  const updatedDocument = { ...document }
  updatedDocument[sourceContainerId] = updateChildrenIds(
    updatedDocument[sourceContainerId],
    newSourceChildren
  )
  updatedDocument[targetContainerId] = updateChildrenIds(
    updatedDocument[targetContainerId],
    newTargetChildren
  )

  editorStateStore.setState({ document: updatedDocument })
}

// Helper functions
function getChildrenIds(block: any): string[] {
  return block.data?.childrenIds || block.data?.props?.childrenIds || []
}

function updateChildrenIds(block: any, newChildrenIds: string[]) {
  if (block.data?.childrenIds) {
    return { ...block, data: { ...block.data, childrenIds: newChildrenIds } }
  }
  if (block.data?.props?.childrenIds) {
    return {
      ...block,
      data: {
        ...block.data,
        props: { ...block.data.props, childrenIds: newChildrenIds },
      },
    }
  }
  return block
}
