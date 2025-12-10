"use strict";

import { CanvasContainerPropsSchema } from "@/features/email-template-builder/documents/blocks/helpers/block-wrappers/CanvasContainerPropsSchema";
import CanvasContainerReader from "@/features/email-template-builder/documents/blocks/helpers/block-wrappers/CanvasContainerReader";
import ReaderBlockWrapper from "@/features/email-template-builder/documents/blocks/helpers/block-wrappers/ReaderBlockWrapper";
import React from "react";
import { Header, HeaderPropsSchema } from "../../block-header";
import { BottomSection, BottomSectionPropsSchema } from "../../block-bottom";

var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj: any, key: PropertyKey, value: any) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a: any, b: any) => {
  for (let prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (let prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a: any, b: any) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source: any, exclude: string[]) => {
  var target: any = {};
  for (let prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (let prop of __getOwnPropSymbols(source)) {
      // Symbols are always included since exclude only contains strings
      if (__propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target: any, all: any) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

var __copyProps = (to: any, from: any, except: string | undefined, desc: any) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};

var __toESM = (mod: any, isNodeMode?: boolean, target?: any) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod,
  undefined,
  undefined
));

var __toCommonJS = (mod: any) => __copyProps(__defProp({}, "__esModule", { value: true }), mod, undefined, undefined);

// src/index.ts
var src_exports: any = {};
__export(src_exports, {
  Reader: () => Reader,
  ReaderBlock: () => ReaderBlock,
  ReaderBlockSchema: () => ReaderBlockSchema,
  ReaderDocumentSchema: () => ReaderDocumentSchema,
  renderToStaticMarkup: () => renderToStaticMarkup
});
module.exports = __toCommonJS(src_exports);

// src/renderers/renderToStaticMarkup.tsx
var import_react5 = __toESM(require("react"));
var import_server = require("react-dom/server");

// src/Reader/core.tsx
var import_react4 = __toESM(require("react"));
var import_zod4 = require("zod");
var import_block_avatar = require("../../block-avatar");
var import_block_button = require("../../block-button");
var import_block_divider = require("../../block-divider");
var import_block_heading = require("../../block-heading");
var import_block_html = require("../../block-html");
var import_block_image = require("../../block-image");
var import_block_spacer = require("../../block-spacer");
var import_block_text = require("../../block-text");
var import_document_core = require("../../document-core/src");

// src/blocks/ColumnsContainer/ColumnsContainerPropsSchema.ts
var import_zod = require("zod");
var import_block_columns_container = require("../../block-columns-container");
var BasePropsShape = import_block_columns_container.ColumnsContainerPropsSchema.shape.props.unwrap().unwrap().shape;
var ColumnsContainerPropsSchema = import_zod.z.object({
  style: import_block_columns_container.ColumnsContainerPropsSchema.shape.style,
  props: import_zod.z.object(__spreadProps(__spreadValues({}, BasePropsShape), {
    columns: import_zod.z.tuple([
      import_zod.z.object({ childrenIds: import_zod.z.array(import_zod.z.string()) }),
      import_zod.z.object({ childrenIds: import_zod.z.array(import_zod.z.string()) }),
      import_zod.z.object({ childrenIds: import_zod.z.array(import_zod.z.string()) })
    ])
  })).optional().nullable()
});
var ColumnsContainerPropsSchema_default = ColumnsContainerPropsSchema;

// src/blocks/ColumnsContainer/ColumnsContainerReader.tsx
var import_react = __toESM(require("react"));
var import_block_columns_container2 = require("../../block-columns-container");

interface ColumnsContainerReaderProps {
  style?: any;
  props?: {
    columns?: Array<{ childrenIds: string[] }>;
  } & Record<string, any>;
}

function ColumnsContainerReader({ style, props }: ColumnsContainerReaderProps) {
  const _a = props != null ? props : {}, { columns } = _a, restProps = __objRest(_a, ["columns"]);
  let cols: React.ReactNode[][] | undefined;
  if (columns) {
    cols = columns.map((col) => col.childrenIds.map((childId) => /* @__PURE__ */ import_react.default.createElement(ReaderBlock, { key: childId, id: childId })));
  }
  return /* @__PURE__ */ import_react.default.createElement(import_block_columns_container2.ColumnsContainer, { props: restProps, columns: cols, style });
}

// src/blocks/Container/ContainerPropsSchema.tsx
var import_zod2 = require("zod");
var import_block_container = require("../../block-container");
var ContainerPropsSchema = import_zod2.z.object({
  style: import_block_container.ContainerPropsSchema.shape.style,
  props: import_zod2.z.object({
    childrenIds: import_zod2.z.array(import_zod2.z.string()).optional().nullable()
  }).optional().nullable()
});

// src/blocks/Container/ContainerReader.tsx
var import_react2 = __toESM(require("react"));
var import_block_container2 = require("../../block-container");

interface ContainerReaderProps {
  style?: any;
  props?: {
    childrenIds?: string[] | null;
  };
}

function ContainerReader({ style, props }: ContainerReaderProps) {
  var _a;
  const childrenIds = (_a = props?.childrenIds) ?? [];
  return /* @__PURE__ */ import_react2.default.createElement(import_block_container2.Container, { style }, childrenIds.map((childId) => /* @__PURE__ */ import_react2.default.createElement(ReaderBlock, { key: childId, id: childId })));
}

// src/blocks/EmailLayout/EmailLayoutPropsSchema.tsx
var import_zod3 = require("zod");
var COLOR_SCHEMA = import_zod3.z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional();
var FONT_FAMILY_SCHEMA = import_zod3.z.enum([
  "MODERN_SANS",
  "BOOK_SANS",
  "ORGANIC_SANS",
  "GEOMETRIC_SANS",
  "HEAVY_SANS",
  "ROUNDED_SANS",
  "MODERN_SERIF",
  "BOOK_SERIF",
  "MONOSPACE"
]).nullable().optional();
var EmailLayoutPropsSchema = import_zod3.z.object({
  backdropColor: COLOR_SCHEMA,
  borderColor: COLOR_SCHEMA,
  borderRadius: import_zod3.z.number().optional().nullable(),
  canvasColor: COLOR_SCHEMA,
  textColor: COLOR_SCHEMA,
  fontFamily: FONT_FAMILY_SCHEMA,
  childrenIds: import_zod3.z.array(import_zod3.z.string()).optional().nullable()
});

// src/blocks/EmailLayout/EmailLayoutReader.tsx
var import_react3 = __toESM(require("react"));

type FontFamily = "MODERN_SANS" | "BOOK_SANS" | "ORGANIC_SANS" | "GEOMETRIC_SANS" | "HEAVY_SANS" | "ROUNDED_SANS" | "MODERN_SERIF" | "BOOK_SERIF" | "MONOSPACE";

interface EmailLayoutReaderProps {
  backdropColor?: string | null;
  borderColor?: string | null;
  borderRadius?: number | null;
  canvasColor?: string | null;
  textColor?: string | null;
  fontFamily?: FontFamily | null;
  childrenIds?: string[] | null;
}

function getFontFamily(fontFamily?: FontFamily | null): string {
  const f = fontFamily ?? "MODERN_SANS";
  switch (f) {
    case "MODERN_SANS":
      return '"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif';
    case "BOOK_SANS":
      return 'Optima, Candara, "Noto Sans", source-sans-pro, sans-serif';
    case "ORGANIC_SANS":
      return 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", source-sans-pro, sans-serif';
    case "GEOMETRIC_SANS":
      return 'Avenir, "Avenir Next LT Pro", Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif';
    case "HEAVY_SANS":
      return 'Bahnschrift, "DIN Alternate", "Franklin Gothic Medium", "Nimbus Sans Narrow", sans-serif-condensed, sans-serif';
    case "ROUNDED_SANS":
      return 'ui-rounded, "Hiragino Maru Gothic ProN", Quicksand, Comfortaa, Manjari, "Arial Rounded MT Bold", Calibri, source-sans-pro, sans-serif';
    case "MODERN_SERIF":
      return 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif';
    case "BOOK_SERIF":
      return '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif';
    case "MONOSPACE":
      return '"Nimbus Mono PS", "Courier New", "Cutive Mono", monospace';
  }
}

function getBorder({ borderColor }: { borderColor?: string | null }): string | undefined {
  if (!borderColor) {
    return undefined;
  }
  return `1px solid ${borderColor}`;
}

// function EmailLayoutReader(props: EmailLayoutReaderProps) {
//   var _a, _b, _c, _d, _e;
//   const childrenIds = (_a = props.childrenIds) ?? [];
//   return /* @__PURE__ */ import_react3.default.createElement(
//     "div",
//     {
//       style: {
//         backgroundColor: (_b = props.backdropColor) ?? "#F5F5F5",
//         color: (_c = props.textColor) ?? "#262626",
//         fontFamily: getFontFamily(props.fontFamily),
//         fontSize: "16px",
//         fontWeight: "400",
//         letterSpacing: "0.15008px",
//         lineHeight: "1.5",
//         margin: "0",
//         padding: "32px 0",
//         minHeight: "100%",
//         width: "100%"
//       }
//     },
//     /* @__PURE__ */ import_react3.default.createElement(
//       "table",
//       {
//         align: "center",
//         width: "100%",
//         style: {
//           margin: "0 auto",
//           maxWidth: "600px",
//           backgroundColor: (_d = props.canvasColor) ?? "#FFFFFF",
//           borderRadius: (_e = props.borderRadius) ?? undefined,
//           border: getBorder(props)
//         },
//         role: "presentation",
//         cellSpacing: "0",
//         cellPadding: "0",
//         border: 0
//       },
//       /* @__PURE__ */ import_react3.default.createElement("tbody", null, /* @__PURE__ */ import_react3.default.createElement("tr", { style: { width: "100%" } }, /* @__PURE__ */ import_react3.default.createElement("td", null, childrenIds.map((childId) => /* @__PURE__ */ import_react3.default.createElement(ReaderBlock, { key: childId, id: childId })))))
//     )
//   );
// }

// src/Reader/core.tsx


function EmailLayoutReader(props: EmailLayoutReaderProps) {
  const childrenIds = props.childrenIds ?? [];
  
  return /* @__PURE__ */ import_react3.default.createElement(
    "div",
    {
      style: {
        backgroundColor: props.backdropColor ?? "#F5F5F5",
        color: props.textColor ?? "#262626",
        fontFamily: getFontFamily(props.fontFamily),
        fontSize: "16px",
        fontWeight: "400",
        letterSpacing: "0.15008px",
        lineHeight: "1.5",
        margin: "0",
        padding: "32px 0",
        minHeight: "100%",
        width: "100%",
        position: 'relative' // Add this for absolute positioning context
      }
    },
    /* @__PURE__ */ import_react3.default.createElement(
      "div", // Changed from table to div
      {
        style: {
          margin: "0 auto",
          maxWidth: "100%",
          backgroundColor: props.canvasColor ?? "#FFFFFF",
          borderRadius: props.borderRadius ?? undefined,
          border: getBorder(props),
          position: 'relative', // Add this for nested absolute positioning
          minHeight: "400px" // Ensure minimum height for canvas
        }
      },
      childrenIds.map((childId) => /* @__PURE__ */ import_react3.default.createElement(ReaderBlock, { key: childId, id: childId }))
    )
  );
}

interface ReaderDocument {
  [key: string]: any;
}

interface ReaderContextValue {
  [key: string]: any;
}

const ReaderContext = (0, import_react4.createContext)({} as ReaderContextValue);

function useReaderDocument(): ReaderDocument {
  return (0, import_react4.useContext)(ReaderContext);
}


export const READER_DICTIONARY = (0, import_document_core.buildBlockConfigurationDictionary)({
  BottomSection: {
    schema: BottomSectionPropsSchema,
    Component: BottomSection
  },
  Header: {
    schema: HeaderPropsSchema,
    Component: Header,
  },
  CanvasContainer: {
  schema: CanvasContainerPropsSchema, // You'll need to create this
  Component: CanvasContainerReader
},
  ColumnsContainer: {
    schema: ColumnsContainerPropsSchema_default,
    Component: ColumnsContainerReader
  },
  Container: {
    schema: ContainerPropsSchema,
    Component: ContainerReader
  },
  EmailLayout: {
    schema: EmailLayoutPropsSchema,
    Component: EmailLayoutReader
  },
  //
  Avatar: {
    schema: import_block_avatar.AvatarPropsSchema,
    Component: import_block_avatar.Avatar
  },
  Button: {
    schema: import_block_button.ButtonPropsSchema,
    Component: import_block_button.Button
  },
  Divider: {
    schema: import_block_divider.DividerPropsSchema,
    Component: import_block_divider.Divider
  },
  Heading: {
    schema: import_block_heading.HeadingPropsSchema,
    Component: import_block_heading.Heading
  },
  Html: {
    schema: import_block_html.HtmlPropsSchema,
    Component: import_block_html.Html
  },
  Image: {
    schema: import_block_image.ImagePropsSchema,
    Component: import_block_image.Image
  },
  Spacer: {
    schema: import_block_spacer.SpacerPropsSchema,
    Component: import_block_spacer.Spacer
  },
  Text: {
    schema: import_block_text.TextPropsSchema,
    Component: import_block_text.Text
  }
});

const ReaderBlockSchema = (0, import_document_core.buildBlockConfigurationSchema)(READER_DICTIONARY);
const ReaderDocumentSchema = import_zod4.z.record(import_zod4.z.string(), ReaderBlockSchema);
const BaseReaderBlock = (0, import_document_core.buildBlockComponent)(READER_DICTIONARY);

interface ReaderBlockProps {
  id: string;
}

// function ReaderBlock({ id }: ReaderBlockProps) {
//   const document = useReaderDocument();
//   return /* @__PURE__ */ import_react4.default.createElement(BaseReaderBlock, __spreadValues({}, document[id]));
// }

function ReaderBlock({ id }: ReaderBlockProps) {
  const document = useReaderDocument();
  const blockData = document[id];
    console.log('=== DEBUG ReaderBlock ===');
  // Debug logging
  console.log(`Rendering block ${id}:`, {
    type: blockData?.type,
    data: blockData?.data,
    availableTypes: Object.keys(READER_DICTIONARY)
  });
  
  // Error handling
  if (!blockData) {
    console.error(`Block ${id} not found in document`);
    return null;
  }
  
  if (!READER_DICTIONARY[blockData.type]) {
    console.error(`Block type ${blockData.type} not registered. Available:`, Object.keys(READER_DICTIONARY));
    return React.createElement('div', null, `Unknown block type: ${blockData.type}`);
  }

  // Create base block with all data
  const baseBlock = /* @__PURE__ */ import_react4.default.createElement(
    BaseReaderBlock, 
    __spreadValues({}, blockData)
  );

  // For CanvasContainer, don't wrap with ReaderBlockWrapper as it handles its own positioning
  if (blockData.type === 'CanvasContainer') {
    return baseBlock;
  }

  // For other blocks, apply styling wrapper if style exists
  const blockStyle = blockData.data?.style;
  if (blockStyle && Object.keys(blockStyle).length > 0) {
    return /* @__PURE__ */ import_react4.default.createElement(
      ReaderBlockWrapper,
      { style: blockStyle },
      baseBlock
    );
  }

  return baseBlock;
}

interface ReaderProps {
  document: ReaderDocument;
  rootBlockId: string;
}

function Reader({ document, rootBlockId }: ReaderProps) {
  return /* @__PURE__ */ import_react4.default.createElement(ReaderContext.Provider, { value: document }, /* @__PURE__ */ import_react4.default.createElement(ReaderBlock, { id: rootBlockId }));
}

// src/renderers/renderToStaticMarkup.tsx
interface RenderToStaticMarkupOptions {
  rootBlockId: string;
}


// Enhanced variable processing
function processContentWithVariables(content: any, purpose: any) {
  if (!content || !purpose) return content;
  
  if (!content.includes('[')) return content;
  
  // Special handling for multi-variable fields like date ranges
  if (purpose === 'orderDateRange') {
    let replacementCount = 0;
    return content.replace(/\[([^\]]+)\]/g, () => {
      replacementCount++;
      return replacementCount === 1 ? '{{orderStartDate}}' : '{{orderEndDate}}';
    });
  }
  
  // Standard variable replacement
  return content.replace(/\[([^\]]+)\]/g, () => {
    return `{{${purpose}}}`;
  });
}


function processBlockPropsWithVariables(props: any) {
  if (!props || typeof props !== 'object') return props;
  
  const processedProps = { ...props };
  
  // Process all string fields that might contain variables
  const textFields = [
    'text', 'contents', 'alt', 'linkHref', 'url', 'imageUrl', 'src',
    'headingText', 'primaryText', 'secondaryText', 'logoAlt',
    'backgroundImage', 'logoUrl', 'content', 'html'
  ];
  
  textFields.forEach(field => {
    if (processedProps[field] && typeof processedProps[field] === 'string') {
      processedProps[field] = processContentWithVariables(
        processedProps[field], 
        processedProps.purpose
      );
    }
  });
  
  // Process nested objects and arrays
  Object.keys(processedProps).forEach(key => {
    if (Array.isArray(processedProps[key])) {
      processedProps[key] = processedProps[key].map((item) => 
        processBlockPropsWithVariables(item)
      );
    } else if (processedProps[key] && typeof processedProps[key] === 'object' && key !== 'style') {
      processedProps[key] = processBlockPropsWithVariables(processedProps[key]);
    }
  });
  
  return processedProps;
}

function processDocumentWithVariables(document: any) {
  const processedDocument = { ...document };
  
  Object.keys(processedDocument).forEach(key => {
    const block = processedDocument[key];
    if (block && block.data) {
      processedDocument[key] = {
        ...block,
        data: {
          ...block.data,
          props: processBlockPropsWithVariables(block.data.props)
        }
      };
    }
  });
  
  return processedDocument;
}

function renderToStaticMarkup(document: ReaderDocument, { rootBlockId }: RenderToStaticMarkupOptions): string {
  return "<!DOCTYPE html>" + (0, import_server.renderToStaticMarkup)(
    /* @__PURE__ */ import_react5.default.createElement("html", null, /* @__PURE__ */ import_react5.default.createElement("body", null, /* @__PURE__ */ import_react5.default.createElement(Reader, { document, rootBlockId })))
  );
}

export function renderEmailTemplateWithVariables(document: any, { rootBlockId }: any) {
  const processedDocument = processDocumentWithVariables(document);
  return renderToStaticMarkup(processedDocument, { rootBlockId });
}

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Reader,
  ReaderBlock,
  ReaderBlockSchema,
  ReaderDocumentSchema,
  renderToStaticMarkup,
});