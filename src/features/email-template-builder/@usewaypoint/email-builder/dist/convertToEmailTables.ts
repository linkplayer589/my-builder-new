///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// import mjml2html from 'mjml-browser';

// interface BlockStyle {
//   padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
//   width?: number;
//   height?: number;
//   backgroundColor?: string;
//   borderColor?: string;
//   borderRadius?: number;
//   color?: string;
//   fontSize?: number;
//   fontWeight?: string;
//   textAlign?: string;
//   fontFamily?: string;
// }

// interface BlockProps {
//   width?: number;
//   height?: number;
//   zIndex?: number;
//   position?: { x: number; y: number };
//   text?: string;
//   color?: string;
//   backgroundColor?: string;
//   purpose?: string;
//   childrenIds?: string[];
//   imageUrl?: string;
//   shape?: string;
//   size?: number;
//   linkHref?: string;
//   lineColor?: string;
//   contents?: string;
//   url?: string;
//   src?: string;
//   alt?: string;
// }

// interface BlockData {
//   props?: BlockProps;
//   style?: BlockStyle;
//   childrenIds?: string[];
// }

// interface Block {
//   type: string;
//   data: BlockData;
// }

// interface Document {
//   root?: Block & {
//     data: BlockData & {
//       textColor?: string;
//       backdropColor?: string;
//       canvasColor?: string;
//     };
//   };
//   [key: string]: Block | undefined;
// }

// interface Element {
//   id: string;
//   type: string;
//   data: BlockData;
//   x: number;
//   y: number;
//   width?: number | null;
//   height?: number | null;
// }


// // Dynamic variable processing function
// function processContentWithVariables(content: string, purpose?: string): string {
//   if (!content || !purpose) return content;
  
//   // Only process if content contains [variables]
//   if (!content.includes('[')) return content;
  
//   // Extract all [variable] patterns and convert to {{variableName}} format
//   return content.replace(/\[([^\]]+)\]/g, (match, variableName) => {
//     // Convert "resort name" to "resortName" format
//     const camelCaseVar = variableName
//       .toLowerCase()
//       .trim()
//       .replace(/\s+(\w)/g, (_: any, char: any) => char.toUpperCase());
    
//     return `{{${camelCaseVar}}}`;
//   });
// }

// export function convertToEmailHTML(document: any): string {
//   try {
//     const rootData = document.root?.data || {};
//     const elements = extractElements(document);
    
//     const canvasContainerId = document.root?.data?.childrenIds?.[0];
//     const canvasContainer = document[canvasContainerId];
//     const canvasPadding = canvasContainer?.data?.style?.padding || {};
//     const canvasWidth = canvasContainer?.data?.style?.width || 600;
//     const canvasHeight = canvasContainer?.data?.style?.height || 400;
    

//        const mjmlTemplate = `
//       <mjml>
//         <mj-head>
//           <mj-attributes>
//             <mj-all font-family="Helvetica, Arial, sans-serif" />
//             <mj-text color="${rootData.textColor || '#262626'}" />
//           </mj-attributes>
//         </mj-head>
//         <mj-body background-color="${rootData.backdropColor || '#F5F5F5'}">
//             <mj-section 
//             background-color="${rootData.canvasColor || '#FFFFFF'}" 
//             padding="${formatPadding(canvasPadding)}"
//             css-class="email-container"
//             width="${canvasWidth}px"
//           >
//             ${generateAbsolutePositionedLayout(elements, canvasHeight)}
//           </mj-section>
//         </mj-body>
//       </mjml>
//     `;
    
//     const { html, errors } = mjml2html(mjmlTemplate);
    
//     if (errors?.length > 0) {
//       console.warn('MJML warnings:', errors);
//     }
    
//     return html;
//   } catch (error) {
//     console.error('MJML conversion failed:', error);
//     throw new Error('Failed to convert to email HTML');
//   }
// }

// function extractElements(document: any) {
//   const elements = [];
//   const canvasContainerId = document.root?.data?.childrenIds?.[0];
//   const canvasContainer = document[canvasContainerId];
  
//   if (canvasContainer?.data?.childrenIds) {
//     for (const childId of canvasContainer.data.childrenIds) {
//       const block = document[childId];
//       if (block) {
//         elements.push({
//           id: childId,
//           type: block.type,
//           data: block.data,
//           x: block.data?.props?.position?.x || 0,
//           y: block.data?.props?.position?.y || 0,
//           width: block.data?.props?.width || null,
//           height: block.data?.props?.height || null
//         });
//       }
//     }
//   }
  
//   return elements;
// }

// // function generateAbsolutePositionedLayout(elements: any[], containerHeight?: number) {
// //   if (elements.length === 0) return '';
  
// //   // Calculate container height based on maximum Y position
// //   const maxY = containerHeight || Math.max(...elements.map(el => el.y)) + 200;
  
// //   // Use mj-raw to inject custom CSS and HTML
// //   return `
// //     <mj-raw>
// //       <div style="position: relative; min-height: ${maxY}px; width: 100%; margin: 0; padding: 0;">
// //         ${elements.map(element => generateAbsoluteElement(element)).join('')}
// //       </div>
// //     </mj-raw>
// //   `;
// // }

// function generateAbsolutePositionedLayout(elements: any[], containerHeight?: number) {
//   if (elements.length === 0) return '';
  
//   const maxY = containerHeight || Math.max(...elements.map(el => el.y)) + 200;
  
//   return `
//     <mj-raw>
//       <!--[if mso]>
//       <div style="position: relative; width: 100%; min-height: ${maxY}px;">
//       <![endif]-->
//       <!--[if !mso]><!-->
//       <div style="position: relative; width: 100%; min-height: ${maxY}px; margin: 0; padding: 0;">
//       <!--<![endif]-->
//         ${elements.map(element => generateAbsoluteElement(element)).join('')}
//       </div>
//     </mj-raw>
//   `;
// }

// function generateAbsoluteElement(element: any): string {
//   const { type, data, x, y } = element;
//   const props = data?.props || {};
//   const style = data?.style || {};
  
//   const padding = formatPadding(style.padding);
  
//   console.log(`Positioning ${type}: X=${x}, Y=${y}`, props);
  
//   switch (type) {
//     case 'Heading':
//       // Process heading text with variables
//       const headingText = processContentWithVariables(props.text || '', props.purpose);
      
//       return `
//         <div style="position: absolute; left: ${x}px; top: ${y}px; ${padding ? `padding: ${padding};` : ''} margin: 0; z-index: 10;">
//           <h2 style="margin: 0; font-size: 20px; font-weight: bold; color: ${props.color || style.color || '#262626'}; font-family: Helvetica, Arial, sans-serif; line-height: 1.2;">
//             ${headingText}
//           </h2>
//         </div>
//       `;
    
//     case 'Avatar':
//       const avatarBorderRadius = props.shape === 'circle' ? '50%' : '0px';
//       const avatarSize = props.size || 64;
      
//       // Process avatar image URL with variables
//       const avatarUrl = processContentWithVariables(
//         props.imageUrl || 'https://ui-avatars.com/api/?name=JD&size=128', 
//         props.purpose
//       );
      
//       return `
//         <div style="position: absolute; left: ${x}px; top: ${y}px; ${padding ? `padding: ${padding};` : ''} margin: 0; z-index: 10;">
//           <img 
//             src="${avatarUrl}" 
//             width="${avatarSize}" 
//             height="${avatarSize}" 
//             style="border-radius: ${avatarBorderRadius}; display: block; border: 0; margin: 0;" 
//             alt="Avatar"
//           />
//         </div>
//       `;
    
//     case 'Text':
//       const textColor = props.color || style.color || '#262626';
//       const textFontSize = style.fontSize || 16;
//       const textFontWeight = style.fontWeight || 'normal';
//       const textAlign = style.textAlign || 'left';
      
//       // Process text with variables
//       const processedText = processContentWithVariables(props.text || '', props.purpose);
      
//       return `
//         <div style="position: absolute; left: ${x}px; top: ${y}px; ${padding ? `padding: ${padding};` : ''} margin: 0; z-index: 10; text-align: ${textAlign};">
//           <p style="margin: 0; font-size: ${textFontSize}px; color: ${textColor}; font-family: Helvetica, Arial, sans-serif; line-height: 1.4; font-weight: ${textFontWeight};">
//             ${processedText}
//           </p>
//         </div>
//       `;
    
//     case 'Button':
//       // Process button text and link with variables
//       const buttonText = processContentWithVariables(props.text || 'Button', props.purpose);
//       const buttonLink = processContentWithVariables(props.linkHref || '#', props.purpose);
      
//       return `
//         <div style="position: absolute; left: ${x}px; top: ${y}px; ${padding ? `padding: ${padding};` : ''} margin: 0; z-index: 10;">
//           <a href="${buttonLink}" style="display: inline-block; padding: 12px 24px; background-color: ${props.backgroundColor || style.backgroundColor || '#007bff'}; color: ${props.color || style.color || 'white'}; text-decoration: none; border-radius: 4px; font-family: Helvetica, Arial, sans-serif; margin: 0;">
//             ${buttonText}
//           </a>
//         </div>
//       `;

//     case 'Divider':
//       const lineColor = props.lineColor || '#CCCCCC';
//       const lineHeight = props.height || 1;
//       const dividerWidth = props.width || '100%';

//       return `
//        <div style="position: absolute; left: ${x}px; top: ${y}px; ${padding ? `padding: ${padding};` : ''} margin: 0; z-index: 10; width: ${dividerWidth}px;">
//         <hr style="border: none; border-top: ${lineHeight}px solid ${lineColor}; margin: 0; width: 100%;" />
//       </div>
//       `;

//     case 'Spacer':
//       const spacerHeight = props.height || 20;
//       return `
//         <div style="position: absolute; left: ${x}px; top: ${y}px; ${padding ? `padding: ${padding};` : ''} margin: 0; z-index: 10; width: 100%; height: ${spacerHeight}px;"></div>
//       `;

//    case 'Html':
//   console.log('🔍 HTML COMPONENT FOUND:', {
//     x, y, 
//     contents: props.contents,
//     hasContents: !!props.contents,
//     contentsLength: props.contents?.length,
//     style: data.style,
//     fullProps: props
//   });
  
//   const htmlContent = props.contents || '';
  
//   // Process HTML content with variables
//   let processedHtml = processContentWithVariables(htmlContent, props.purpose);
  
//   // Apply color to anchor tags if color is defined in style
//   if (data.style?.color && processedHtml.includes('<a')) {
//     processedHtml = processedHtml.replace(
//       /<a(\s[^>]*)?>/g, 
//       (match, attributes) => {
//         // Check if style attribute already exists
//         if (match.includes('style=')) {
//           // Add color to existing style
//           return match.replace(
//             /style=(["'])([^"']*)\1/g,
//             (styleMatch, quote, existingStyle) => {
//               // Add color if not already present
//               if (!existingStyle.includes('color:')) {
//                 return `style=${quote}${existingStyle}; color: ${data.style.color}${quote}`;
//               }
//               return styleMatch;
//             }
//           );
//         } else {
//           // Add new style attribute with color
//           const attr = attributes || '';
//           return `<a${attr} style="color: ${data.style.color}">`;
//         }
//       }
//     );
//   }
  
//   // Build style string from the style object
//   const styleProperties = [];
  
//   if (data.style) {
//     // Color and typography - don't include color here since we're applying it to links
//     if (data.style.backgroundColor) styleProperties.push(`background-color: ${data.style.backgroundColor}`);
//     if (data.style.fontSize) styleProperties.push(`font-size: ${data.style.fontSize}px`);
//     if (data.style.fontWeight) styleProperties.push(`font-weight: ${data.style.fontWeight}`);
    
//     // Text alignment - handle null/undefined values properly
//     if (data.style.textAlign && data.style.textAlign !== 'null' && data.style.textAlign !== null) {
//       styleProperties.push(`text-align: ${data.style.textAlign}`);
//     }
    
//     // Font family - use from block or fallback to root font family
//     const fontFamily = data.style.fontFamily || 'Helvetica, Arial, sans-serif';
//     styleProperties.push(`font-family: ${fontFamily}`);
    
//     // Line height for better readability
//     styleProperties.push(`line-height: 1.4`);
    
//     // Padding - handle properly
//     if (data.style.padding) {
//       const p = data.style.padding;
//       if (typeof p === 'object') {
//         styleProperties.push(`padding: ${p.top || 0}px ${p.right || 0}px ${p.bottom || 0}px ${p.left || 0}px`);
//       } else if (typeof p === 'number') {
//         styleProperties.push(`padding: ${p}px`);
//       }
//     }
//   } else {
//     // Default styles if no style object
//     styleProperties.push('font-family: Helvetica, Arial, sans-serif');
//     styleProperties.push('line-height: 1.4');
//   }
  
//   const styleString = styleProperties.join('; ');
  
//   if (!processedHtml.trim()) {
//     console.warn('⚠️ HTML component has empty contents');
//     return `
//       <div style="position: absolute; left: ${x}px; top: ${y}px; ${styleString}; margin: 0; z-index: 10; background: #fff3cd; border: 1px dashed #ffc107;">
//         <span style="color: #856404; font-family: Helvetica, Arial, sans-serif;">Empty HTML content</span>
//       </div>
//     `;
//   }
  
//   console.log('✅ Rendering HTML content with styles:', { processedHtml, styleString });
//   return `
//     <div style="position: absolute; left: ${x}px; top: ${y}px; ${styleString}; margin: 0; z-index: 10;">
//       ${processedHtml}
//     </div>
//   `;
  
//     case 'Image':
//       // Handle different image URL properties
//       const imageUrl = processContentWithVariables(
//         props.url || props.imageUrl || props.src || '', 
//         props.purpose
//       );
//       const imageWidth = props.width || '200';
//       const imageHeight = props.height || '150';
//       const imageAlt = processContentWithVariables(props.alt || 'Image', props.purpose);
      
//       if (!imageUrl) {
//         console.warn('Image component missing URL:', props);
//         return `
//           <div style="position: absolute; left: ${x}px; top: ${y}px; width: ${imageWidth}px; height: ${imageHeight}px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; margin: 0; z-index: 10;">
//             <span style="color: #666; font-family: Helvetica, Arial, sans-serif; margin: 0;">No Image</span>
//           </div>
//         `;
//       }
      
//       return `
//         <div style="position: absolute; left: ${x}px; top: ${y}px; ${padding ? `padding: ${padding};` : ''} margin: 0; z-index: 10;">
//           <img 
//             src="${imageUrl}" 
//             width="${imageWidth}" 
//             height="${imageHeight}" 
//             style="display: block; border: 0; margin: 0;" 
//             alt="${imageAlt}"
//           />
//         </div>
//       `;

//     // case 'Container':
//     //   // Use props values first, then fall back to style values
//     //   const containerWidth = props.width || style.width || 'auto';
//     //   const containerHeight = props.height || style.height || 'auto';
//     //   const containerZIndex = props.zIndex || 10;
//     //   const containerBorderRadius = style.borderRadius || 0;

//     //   return `
//     //     <div style="position: absolute; left: ${x}px; top: ${y}px; ${padding ? `padding: ${padding};` : ''} margin: 0; z-index: ${containerZIndex}; width: ${containerWidth}px; height: ${containerHeight}px; background-color: ${style.backgroundColor || 'transparent'}; border: ${style.borderColor ? `1px solid ${style.borderColor}` : 'none'}; border-radius: ${containerBorderRadius}px;">
//     //     </div>
//     //   `;  

//    case 'Container':
//   const containerWidth = props.width || style.width || 'auto';
//   const containerHeight = props.height || style.height || 'auto';
//   const containerZIndex = props.zIndex || 10;
//   const containerBorderRadius = style.borderRadius || 0;
//   const containerChildrenIds: string[] = Array.isArray(props.childrenIds) ? props.childrenIds : [];

//   // For email clients, we need to use VML for Outlook and CSS for others
//   return `
//     <!--[if mso]>
//     <v:rect 
//       xmlns:v="urn:schemas-microsoft-com:vml" 
//       xmlns:w="urn:schemas-microsoft-com:office:word"
//       style="position:absolute;left:${x}px;top:${y}px;width:${containerWidth}px;height:${containerHeight}px;z-index:${containerZIndex};"
//       strokeweight="1px" 
//       strokecolor="${style.borderColor || 'transparent'}"
//       fillcolor="${style.backgroundColor || 'transparent'}">
//       <v:fill color="${style.backgroundColor || 'transparent'}" />
//       <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
//         <div style="padding:${padding || '0'}">
//           ${containerChildrenIds.map((childId: string) => {
//             const childBlock = (document as any)[childId];
//             return childBlock ? renderBlockToHtml(childBlock, document as any) : '';
//           }).join('')}
//         </div>
//       </v:textbox>
//     </v:rect>
//     <![endif]-->
//     <!--[if !mso]><!-->
//     <div style="
//       position: absolute !important;
//       left: ${x}px !important; 
//       top: ${y}px !important;
//       width: ${containerWidth}px !important;
//       height: ${containerHeight}px !important;
//       background-color: ${style.backgroundColor || 'transparent'} !important;
//       border: ${style.borderColor ? `1px solid ${style.borderColor}` : 'none'} !important;
//       border-radius: ${containerBorderRadius}px !important;
//       z-index: ${containerZIndex} !important;
//       ${padding ? `padding: ${padding} !important;` : ''}
//       margin: 0 !important;
//       box-sizing: border-box !important;">
//       ${containerChildrenIds.map((childId: string) => {
//         const childBlock = (document as any)[childId];
//         return childBlock ? renderBlockToHtml(childBlock, document as any) : '';
//       }).join('')}
//     </div>
//     <!--<![endif]-->
//   `;

//     case 'CanvasContainer':
//       const canvasW = props.width || style.width || 'auto';
//       const canvasH = props.height || style.height || 'auto';
//       const canvasZ = props.zIndex || 10;
      
//       // Extract nested children
//       const nestedChildren = extractNestedElements(element.id, document);
      
//       return `
//         <div style="position: absolute; left: ${x}px; top: ${y}px; ${padding ? `padding: ${padding};` : ''} margin: 0; z-index: ${canvasZ}; width: ${canvasW}px; height: ${canvasH}px; background-color: ${style.backgroundColor || 'transparent'}; border: ${style.borderColor ? `1px solid ${style.borderColor}` : 'none'}; border-radius: ${style.borderRadius || 0}px;">
//           ${nestedChildren.map(child => generateAbsoluteElement(child)).join('')}
//         </div>
//       `;

//     default:
//       const defaultContent = processContentWithVariables(
//         props.text || props.content || `Unknown component: ${type}`, 
//         props.purpose
//       );
      
//       return `
//         <div style="position: absolute; left: ${x}px; top: ${y}px; ${padding ? `padding: ${padding};` : ''} margin: 0; z-index: 10;">
//           <span style="font-family: Helvetica, Arial, sans-serif; margin: 0;">
//             ${defaultContent}
//           </span>
//         </div>
//       `;
//   }
// }

// function formatPadding(padding: any): string {
//   if (!padding) return '';
  
//   if (typeof padding === 'number') {
//     return `${padding}px`;
//   }
  
//   if (typeof padding === 'object') {
//     const top = padding.top || 0;
//     const right = padding.right || 0;
//     const bottom = padding.bottom || 0;
//     const left = padding.left || 0;
//     return `${top}px ${right}px ${bottom}px ${left}px`;
//   }
  
//   return '';
// }

// function extractNestedElements(containerId: string, document: any) {
//   const elements = [];
//   const container = document[containerId];
  
//   if (container?.data?.childrenIds) {
//     for (const childId of container.data.childrenIds) {
//       const block = document[childId];
//       if (block) {
//         elements.push({
//           id: childId,
//           type: block.type,
//           data: block.data,
//           x: block.data?.props?.position?.x || 0,
//           y: block.data?.props?.position?.y || 0,
//           width: block.data?.props?.width || null,
//           height: block.data?.props?.height || null
//         });
//       }
//     }
//   }
  
//   return elements;
// }

// function renderBlockToHtml(block: Block, document: Document): string {
//   if (!block?.data?.props) return '';
  
//   const { type, data } = block;
//   const props = data.props || {};
//   const style = data.style || {};
//   const x = props.position?.x || 0;
//   const y = props.position?.y || 0;
//   const padding = formatPadding(style.padding);
  
//   // Reuse your existing generateAbsoluteElement logic here
//   // This is a simplified version - you'll need to adapt your full logic
//   return generateAbsoluteElement({
//     id: '',
//     type,
//     data,
//     x,
//     y,
//     width: props.width,
//     height: props.height
//   });
// }

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

// final update with props props handling adjustments and fixes

// import mjml2html from 'mjml-browser';
  
interface BlockStyle {
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  fontFamily?: string;
}

interface BlockProps {
  width?: number;
  height?: number;
  zIndex?: number;
  position?: { x: number; y: number };
  text?: string;
  color?: string;
  backgroundColor?: string;
  purpose?: string;
  childrenIds?: string[];
  imageUrl?: string;
  shape?: string;
  size?: number;
  linkHref?: string;
  lineColor?: string;
  contents?: string;
  url?: string;
  src?: string;
  alt?: string;
  fixedWidths?: string;
  columnsCount?: number;
  columnsGap?: number;
  columns?: { childrenIds: string[] }[];
  // Header specific props
  backgroundImage?: string;
  logoUrl?: string;
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;
  logoAlignment?: string;
  logoVerticalAlignment?: string;
  logoPosition?: { top?: number; left?: number; right?: number; bottom?: number };
  headingText?: string;
  headingColor?: string;
  headingFontSize?: number;
  headingFontWeight?: string;
  headingTextAlign?: string;
  headingVerticalAlignment?: string;
  headingLineHeight?: number;
  headingWidth?: number;
  headingPosition?: { top?: number; left?: number; right?: number; bottom?: number };
  headerHeight?: number;
  containerWidth?: number;

  // BottomSection specific props
  primaryText?: string;
  primaryTextColor?: string;
  primaryFontSize?: number;
  primaryFontWeight?: string;
  primaryTextAlign?: string;
  primaryVerticalAlignment?: string;
  primaryLineHeight?: number;
  primaryWidth?: number;
  secondaryText?: string;
  secondaryTextColor?: string;
  secondaryFontSize?: number;
  secondaryFontWeight?: string;
  secondaryTextAlign?: string;
  secondaryVerticalAlignment?: string;
  secondaryLineHeight?: number;
  secondaryWidth?: number;
  textSpacing?: number;

  // Additional props from JSON
  level?: string;
  contentAlignment?: string;
}

interface BlockData {
  props?: BlockProps;
  style?: BlockStyle;
  childrenIds?: string[];
}

interface Block {
  type: string;
  data: BlockData;
}

interface Document {
  root?: Block & {
    data: BlockData & {
      textColor?: string;
      backdropColor?: string;
      canvasColor?: string;
      fontFamily?: string;
    };
  };
  [key: string]: Block | undefined;
}

// Dynamic variable processing function - uses purpose prop as variable name
// function processContentWithVariables(content: string, purpose?: string): string {
//   console.log('Processing:', { content, purpose });
  
//   if (!content || !purpose) return content;
  
//   if (!content.includes('[')) return content;
  
//   if (purpose === 'orderDateRange') {
//     console.log('Handling orderDateRange specially');
//     let replacementCount = 0;
//     const result = content.replace(/\[([^\]]+)\]/g, () => {
//       replacementCount++;
//       const replacement = replacementCount === 1 ? '${orderStartDate}' : '${orderEndDate}';
//       console.log(`Replacement ${replacementCount}:`, replacement);
//       return replacement;
//     });
//     console.log('Final result:', result);
//     return result;
//   }
  
//   return content.replace(/\[([^\]]+)\]/g, () => {
//     return `\${${purpose}}`;
//   });
// }

function processContentWithVariables(content: string, purpose?: string | string[]): string {
  console.log('Processing:', { content, purpose });
  
  if (!content || !purpose) return content;
  
  if (!content.includes('[')) return content;
  
  // Handle single purpose (backward compatibility)
  if (typeof purpose === 'string') {
    return processSinglePurpose(content, purpose);
  }
  
  // Handle multiple purposes
  if (Array.isArray(purpose) && purpose.length > 0) {
    return processMultiplePurposes(content, purpose);
  }
  
  return content;
}

function processSinglePurpose(content: string, purpose: string): string {
  if (purpose === 'orderDateRange') {
    let replacementCount = 0;
    return content.replace(/\[([^\]]+)\]/g, () => {
      replacementCount++;
      return replacementCount === 1 ? '${orderStartDate}' : '${orderEndDate}';
    });
  }
  
  // For single purpose, replace all placeholders with the same variable
  return content.replace(/\[([^\]]+)\]/g, () => {
    return `\${${purpose}}`;
  });
}

function processMultiplePurposes(content: string, purposes: string[]): string {
  let purposeIndex = 0;
  const usedPurposes: string[] = [];
  
  // Process all placeholders sequentially
  const result = content.replace(/\[([^\]]+)\]/g, (match, placeholder) => {
    if (purposeIndex >= purposes.length) {
      purposeIndex = 0; // Cycle through purposes if we have more placeholders than purposes
    }
    
    const currentPurpose = purposes[purposeIndex];
    let replacement: string;
    
    // Handle orderDateRange specially
    if (currentPurpose === 'orderDateRange') {
      const orderDateRangeCount = purposes.slice(0, purposeIndex + 1).filter(p => p === 'orderDateRange').length;
      replacement = orderDateRangeCount === 1 ? '${orderStartDate}' : '${orderEndDate}';
    } else {
      replacement = `\${${currentPurpose}}`;
    }
    
    console.log(`Replacing [${placeholder}] with ${replacement} (purpose: ${currentPurpose})`);
    
    if (currentPurpose) {
      usedPurposes.push(currentPurpose);
    }
    purposeIndex++;
    return replacement;
  });
  
  // Now process <a> tags to add variables to href attributes
  return processHrefAttributes(result, purposes);
}

function processHrefAttributes(content: string, purposes: string[]): string {
  let purposeIndex = 0;
  
  return content.replace(/<a\s+([^>]*\s+)?href=(["'])([^"']*)\2([^>]*)>/gi, (match, before, quote, hrefValue, after) => {
    // Skip if href already contains a variable (starts with ${)
    if (hrefValue.startsWith('${')) {
      return match;
    }
    
    if (purposeIndex >= purposes.length) {
      purposeIndex = 0; // Reset if we run out of purposes
    }
    
    const currentPurpose = purposes[purposeIndex];
    const replacement = currentPurpose === 'orderDateRange' ? 
      '${orderStartDate}' : // Simplified for orderDateRange in href
      `\${${currentPurpose}}`;
    
    console.log(`Setting href to: ${replacement} for purpose: ${currentPurpose}`);
    
    purposeIndex++;
    
    // Replace the href value with the variable (remove the quotes)
    return `<a ${before || ''}href=${replacement}${after || ''}>`;
  });
}


export async function convertToEmailHTML(document: any): Promise<string> {
  try {
    const rootData = document.root?.data || {};
    const rootChildrenIds = rootData.childrenIds || [];
    const fontFamily = rootData.fontFamily === 'MODERN_SANS' 
      ? 'Arial, Helvetica, sans-serif' 
      : 'Helvetica, Arial, sans-serif';

    const borderStyles = generateBorderStyles(document);
    const emailWidth = rootData.width || 600;

    console.log({emailWidth});
    
    const mjmlTemplate = `
      <mjml>
        <mj-head>
          <mj-attributes>
            <mj-all font-family="${fontFamily}" />
            <mj-text color="${rootData.textColor || '#262626'}" />
            <mj-section padding="0" />
            <mj-column padding="0" />
          </mj-attributes>
          ${borderStyles}
          
          <!-- CRITICAL FIX: Use dynamic emailWidth variable in CSS -->
          <mj-style>
            .email-container {
              width: ${emailWidth}px !important;
              max-width: ${emailWidth}px !important;
              margin: 0 auto !important;
            }
            @media only screen and (max-width: ${emailWidth}px) {
              .email-container {
                width: 100% !important;
              }
            }
            
            /* Additional email client compatibility */
            @media only screen and (max-width: 480px) {
              .email-container table,
              .email-container td,
              .email-container div {
                width: 100% !important;
              }
            }
          </mj-style>
        </mj-head>
        <mj-body background-color="${rootData.backdropColor || '#F5F5F5'}">
          <!-- Main container with dynamic width -->
          <mj-wrapper 
            background-color="${rootData.canvasColor || '#FFFFFF'}" 
            css-class="email-container"
            width="${emailWidth}px"
          >
            ${generateFlowLayout(rootChildrenIds, document)}
          </mj-wrapper>
        </mj-body>
      </mjml>
    `;

    let mjml2html;
    if (typeof window !== 'undefined') {
      const mjmlModule = await import('mjml-browser');
      mjml2html = mjmlModule.default;
    } else {
      // Return a simple HTML structure for server-side rendering
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { background-color: ${rootData.backdropColor || '#F5F5F5'}; margin: 0; padding: 20px; }
              .email-preview { 
                max-width: ${emailWidth}px; 
                margin: 0 auto; 
                background: white; 
                padding: 20px; 
                font-family: ${fontFamily};
              }
            </style>
          </head>
          <body>
            <div class="email-preview">
              Email preview - Full rendering available on client side
            </div>
          </body>
        </html>
      `;
    }
    
    const { html, errors } = mjml2html(mjmlTemplate);
    
    if (errors?.length > 0) {
      console.warn('MJML warnings:', errors);
    }
    
    return html;
  } catch (error) {
    console.error('MJML conversion failed:', error);
    throw new Error('Failed to convert to email HTML');
  }
}

function generateBlockContent(block: Block, document: any): string {
  const { type, data } = block;
  const props = data?.props || {};
  const style = data?.style || {};
  const padding = formatPadding(style.padding);
  
  console.log(`Generating ${type} block:`, { props, style });
  
  switch (type) {
    case 'ColumnsContainer':
      return generateColumnsContainer(block, document);
      
    case 'Heading':
      return generateHeadingBlock(block, document);
      
    case 'Avatar':
      return generateAvatarBlock(block, document);
    
    case 'Text':
      return generateTextBlock(block, document);
    
    case 'Button':
      return generateButtonBlock(block, document);

    case 'Divider':
      return generateDividerBlock(block, document);

    case 'Spacer':
      return generateSpacerBlock(block, document);

    case 'Html':
      return generateHtmlBlock(block, document);

    case 'Image':
      return generateImageBlock(block, document);

    case 'Container':
      return generateContainerBlock(block, document);

    case 'Header':
      return generateHeaderBlock(block, document);

    case 'BottomSection':
      return generateBottomSectionBlock(block, document);

    default:
      return generateDefaultBlock(block, document);
  }
}

function generateHeadingBlock(block: Block, document: any): string {
  const { data } = block;
  const props = data?.props || {};
  const style = data?.style || {};
  
  const headingText = processContentWithVariables(props.text || '', props.purpose);
  const headingLevel = props.level || 'h2';
  const padding = formatPadding(style.padding);
  
  // Define font sizes based on heading level
  const getFontSizeByLevel = (level: string) => {
    switch (level) {
      case 'h1': return '32px';
      case 'h2': return '24px';
      case 'h3': return '20px';
      case 'h4': return '18px';
      case 'h5': return '16px';
      case 'h6': return '14px';
      default: return '20px';
    }
  };
  
  const fontSize = style.fontSize || getFontSizeByLevel(headingLevel);
  const fontWeight = style.fontWeight || 'bold';
  const textAlign = style.textAlign || 'left';
  const color = style.color || props.color || '#262626';
  
  return `
    <mj-section>
      <mj-column>
        <mj-text 
          color="${color}"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          align="${textAlign}"
          padding="${padding}"
          line-height="1.2"
        >
          <${headingLevel} style="margin: 0; font-size: ${fontSize}px; font-weight: ${fontWeight}; color: ${color};">
            ${headingText}
          </${headingLevel}>
        </mj-text>
      </mj-column>
    </mj-section>
  `;
}

function generateAvatarBlock(block: Block, document: any): string {
  const { data } = block;
  const props = data?.props || {};
  const style = data?.style || {};
  
  const avatarBorderRadius = props.shape === 'circle' ? '50%' : '0px';
  const avatarSize = props.size || 64;
  const avatarUrl = processContentWithVariables(
    props.imageUrl || props.url || props.src || 'https://ui-avatars.com/api/?name=JD&size=128', 
    props.purpose
  );
  const padding = formatPadding(style.padding);
  const align = style.textAlign || props.contentAlignment || 'center';
  
  return `
    <mj-column>
      <mj-image 
        src="${avatarUrl}" 
        width="${avatarSize}px" 
        height="${avatarSize}px" 
        border-radius="${avatarBorderRadius}"
        padding="${padding || '0'}"
        align="${align}"
      />
    </mj-column>
  `;
}

function generateTextBlock(block: Block, document: any): string {
  const { data } = block;
  const props = data?.props || {};
  const style = data?.style || {};
  
  const textColor = style.color || props.color || '#262626';
  const textFontSize = style.fontSize || 16;
  const textAlign = style.textAlign || 'left';
  const fontWeight = style.fontWeight || 'normal';
  const padding = formatPadding(style.padding);
  
  const processedText = processContentWithVariables(props.text || '', props.purpose);
  
  // If there's specific padding, wrap in a section with proper MJML structure
  if (padding && padding !== '0') {
    return `
      <mj-section padding="0">
        <mj-column>
          <mj-text 
            color="${textColor}" 
            font-size="${textFontSize}px" 
            font-weight="${fontWeight}"
            align="${textAlign}"
            padding="${padding}"
            line-height="1.4"
          >
            ${processedText}
          </mj-text>
        </mj-column>
      </mj-section>
    `;
  }
  
  // For text without specific padding, use the standard approach
  return `
    <mj-text 
      color="${textColor}" 
      font-size="${textFontSize}px" 
      font-weight="${fontWeight}"
      align="${textAlign}"
      padding="${padding || '0'}"
      line-height="1.4"
    >
      ${processedText}
    </mj-text>
  `;
}

function generateDefaultBlock(block: Block, document: any): string {
  const { data } = block;
  const props = data?.props || {};
  const style = data?.style || {};
  
  const padding = formatPadding(style.padding);
  const defaultContent = processContentWithVariables(
    props.text || props.contents || (props as any).content || `Unknown component: ${block.type}`, 
    props.purpose
  );
  
  const textColor = style.color || props.color || '#262626';
  const textFontSize = style.fontSize || 16;
  const textAlign = style.textAlign || 'left';
  const fontWeight = style.fontWeight || 'normal';
  
  // For default blocks with padding, ensure proper MJML structure
  if (padding && padding !== '0') {
    return `
      <mj-section padding="0">
        <mj-column>
          <mj-text 
            color="${textColor}" 
            font-size="${textFontSize}px" 
            font-weight="${fontWeight}"
            align="${textAlign}"
            padding="${padding}"
            line-height="1.4"
          >
            ${defaultContent}
          </mj-text>
        </mj-column>
      </mj-section>
    `;
  }
  
  return `
    <mj-text 
      color="${textColor}" 
      font-size="${textFontSize}px" 
      font-weight="${fontWeight}"
      align="${textAlign}"
      padding="${padding || '0'}"
      line-height="1.4"
    >
      ${defaultContent}
    </mj-text>
  `;
}

function generateButtonBlock(block: Block, document: any): string {
  const { data } = block;
  const props = data?.props || {};
  const style = data?.style || {};
  
  const buttonText = processContentWithVariables(props.text || 'Button', props.purpose);
  const buttonLink = processContentWithVariables(props.linkHref || '#', props.purpose);
  const buttonBgColor = style.backgroundColor || props.backgroundColor || '#007bff';
  const buttonColor = style.color || props.color || 'white';
  const padding = formatPadding(style.padding);
  const align = style.textAlign || 'center';
  const borderRadius = style.borderRadius || 4;
  
  return `
    <mj-button 
      background-color="${buttonBgColor}" 
      color="${buttonColor}"
      href="${buttonLink}"
      border-radius="${borderRadius}px"
      padding="${padding || '12px 24px'}"
      align="${align}"
    >
      ${buttonText}
    </mj-button>
  `;
}

function generateDividerBlock(block: Block, document: any): string {
  const { data } = block;
  const props = data?.props || {};
  const style = data?.style || {};
  
  const lineColor = props.lineColor || style.borderColor || '#CCCCCC';
  const lineHeight = props.height || style.height || 1;
  const dividerWidth = props.width || style.width || '100%';
  const padding = formatPadding(style.padding);

  return `
    <mj-divider 
      border-color="${lineColor}" 
      border-width="${lineHeight}px"
      width="${dividerWidth}"
      padding="${padding || '0'}"
    />
  `;
}

function generateSpacerBlock(block: Block, document: any): string {
  const { data } = block;
  const props = data?.props || {};
  
  const spacerHeight = props.height || 20;
  
  return `
    <mj-spacer height="${spacerHeight}px" />
  `;
}

// function generateHtmlBlock(block: Block, document: any): string {
//   const { data } = block;
//   const props = data?.props || {};
//   const style = data?.style || {};
  
//   const htmlContent = props.contents || '';
//   let processedHtml = processContentWithVariables(htmlContent, props.purpose);
  
//   // Apply color to anchor tags if color is defined in style
//   if (style.color && processedHtml.includes('<a')) {
//     processedHtml = processedHtml.replace(
//       /<a(\s[^>]*)?>/g, 
//       (match, attributes) => {
//         if (match.includes('style=')) {
//           return match.replace(
//             /style=(["'])([^"']*)\1/g,
//             (styleMatch, quote, existingStyle) => {
//               if (!existingStyle.includes('color:')) {
//                 return `style=${quote}${existingStyle}; color: ${style.color}${quote}`;
//               }
//               return styleMatch;
//             }
//           );
//         } else {
//           const attr = attributes || '';
//           return `<a${attr} style="color: ${style.color}">`;
//         }
//       }
//     );
//   }
  
//   const padding = formatPadding(style.padding);
//   const textAlign = style.textAlign || 'left';
//   const fontSize = style.fontSize || 16;
//   const fontWeight = style.fontWeight || 'normal';
//   const color = style.color || '#262626';
  
//   return `
//     <mj-section padding="0">
//       <mj-column>
//         <mj-text 
//           color="${color}"
//           font-size="${fontSize}px"
//           font-weight="${fontWeight}"
//           align="${textAlign}"
//           padding="${padding}"
//           line-height="1.4"
//         >
//           ${processedHtml}
//         </mj-text>
//       </mj-column>
//     </mj-section>
//   `;
// }

function generateHtmlBlock(block: Block, document: any): string {
  const { data } = block;
  const props = data?.props || {};
  const style = data?.style || {};
  
  const htmlContent = props.contents || '';
  
  // Handle both single purpose (string) and multiple purposes (array)
  const purpose = props.purpose;
  let processedHtml = processContentWithVariables(htmlContent, purpose);
  
  // Apply color to anchor tags if color is defined in style
  if (style.color && processedHtml.includes('<a')) {
    processedHtml = processedHtml.replace(
      /<a(\s[^>]*)?>/g, 
      (match, attributes) => {
        if (match.includes('style=')) {
          return match.replace(
            /style=(["'])([^"']*)\1/g,
            (styleMatch, quote, existingStyle) => {
              if (!existingStyle.includes('color:')) {
                return `style=${quote}${existingStyle}; color: ${style.color}${quote}`;
              }
              return styleMatch;
            }
          );
        } else {
          const attr = attributes || '';
          return `<a${attr} style="color: ${style.color}">`;
        }
      }
    );
  }
  
  const padding = formatPadding(style.padding);
  const textAlign = style.textAlign || 'left';
  const fontSize = style.fontSize || 16;
  const fontWeight = style.fontWeight || 'normal';
  const color = style.color || '#262626';
  
  return `
    <mj-section padding="0">
      <mj-column>
        <mj-text 
          color="${color}"
          font-size="${fontSize}px"
          font-weight="${fontWeight}"
          align="${textAlign}"
          padding="${padding}"
          line-height="1.4"
        >
          ${processedHtml}
        </mj-text>
      </mj-column>
    </mj-section>
  `;
}

function generateImageBlock(block: Block, document: any): string {
  const { data } = block;
  const props = data?.props || {};
  const style = data?.style || {};
  
  const imageUrl = processContentWithVariables(
    props.url || props.imageUrl || props.src || '', 
    props.purpose
  );
  const imageWidth = props.width || style.width || '200';
  const imageHeight = props.height || style.height || '150';
  const imageAlt = processContentWithVariables(props.alt || 'Image', props.purpose);
  const padding = formatPadding(style.padding);
  const align = style.textAlign || props.contentAlignment || 'center';
  const linkHref = props.linkHref;
  
  if (!imageUrl) {
    return `
      <mj-column>
        <mj-text align="center" padding="${padding || '0'}">
          <span style="color: #666;">No Image</span>
        </mj-text>
      </mj-column>
    `;
  }
  
  const imageElement = `
    <mj-image 
      src="${imageUrl}" 
      width="${imageWidth}px" 
      height="${imageHeight}px" 
      alt="${imageAlt}"
      padding="${padding || '0'}"
      align="${align}"
    />
  `;
  
  if (linkHref) {
    return `
      <mj-column>
        <mj-wrapper padding="0">
          <a href="${linkHref}" style="text-decoration: none;">
            ${imageElement}
          </a>
        </mj-wrapper>
      </mj-column>
    `;
  }
  
  return `
    <mj-column>
      ${imageElement}
    </mj-column>
  `;
}

// function generateContainerBlock(block: Block, document: any): string {
//   const { data } = block;
//   const props = data?.props || {};
//   const style = data?.style || {};
  
//   const containerChildrenIds: string[] = Array.isArray(props.childrenIds) ? props.childrenIds : [];
//   const padding = formatPadding(style.padding);
//   const backgroundColor = style.backgroundColor || 'transparent';
//   const borderRadius = style.borderRadius;
//   const borderColor = style.borderColor;
  
//   // For containers with borders, use mj-wrapper with proper border styling
//   if (borderColor) {
//     const borderStyle = `border: 1px solid ${borderColor};${borderRadius ? ` border-radius: ${borderRadius}px;` : ''}`;
    
//     return `
//       <mj-wrapper 
//         background-color="${backgroundColor}"
//         padding="${padding}"
//         ${borderRadius ? `border-radius="${borderRadius}px"` : ''}
//         css-class="bordered-container"
//       >
//         ${containerChildrenIds.map(childId => {
//           const childBlock = document[childId];
//           return childBlock ? generateBlockContent(childBlock, document) : '';
//         }).join('')}
//       </mj-wrapper>
//     `;
//   }
  
//   // For regular containers without borders, use mj-section with proper structure
//   // If container has background color or padding, wrap in a section
//   if (backgroundColor !== 'transparent' || (padding && padding !== '0')) {
//     return `
//       <mj-section 
//         background-color="${backgroundColor}"
//         padding="${padding}"
//         ${borderRadius ? `border-radius="${borderRadius}px"` : ''}
//       >
//         <mj-column>
//           ${containerChildrenIds.map(childId => {
//             const childBlock = document[childId];
//             return childBlock ? generateBlockContent(childBlock, document) : '';
//           }).join('')}
//         </mj-column>
//       </mj-section>
//     `;
//   }
  
//   // For transparent containers without padding, just render children directly
//   // This prevents extra nesting and padding accumulation
//   return containerChildrenIds.map(childId => {
//     const childBlock = document[childId];
//     return childBlock ? generateBlockContent(childBlock, document) : '';
//   }).join('');
// }


function generateContainerBlock(block: Block, document: any): string {
  const { data } = block;
  const props = data?.props || {};
  const style = data?.style || {};
  
  const containerChildrenIds: string[] = Array.isArray(props.childrenIds) ? props.childrenIds : [];
  const padding = formatPadding(style.padding);
  const backgroundColor = style.backgroundColor || 'transparent';
  const borderRadius = style.borderRadius;
  const borderColor = style.borderColor;

  // Get the content of child blocks
  const childrenContent = containerChildrenIds.map(childId => {
    const childBlock = document[childId];
    return childBlock ? generateBlockContent(childBlock, document) : '';
  }).join('');

  // If this is a completely empty container (no background, no border, no padding)
  if (backgroundColor === 'transparent' && 
      !borderRadius && 
      !borderColor && 
      padding === '0px 0px 0px 0px') {
    return childrenContent;
  }

  // For containers with styling, wrap in section
  let sectionAttributes = `background-color="${backgroundColor}"`;
  
  if (padding !== '0px 0px 0px 0px') {
    sectionAttributes += ` padding="${padding}"`;
  }
  
  if (borderRadius) {
    sectionAttributes += ` border-radius="${borderRadius}px"`;
  }
  
  if (borderColor) {
    sectionAttributes += ` border="1px solid ${borderColor}"`;
  }

  return `
    <mj-section ${sectionAttributes}>
      <mj-column>
        ${childrenContent}
      </mj-column>
    </mj-section>
  `;
}

// function generateColumnsContainer(block: Block, document: any): string {
//   const { data } = block;
//   const props = data?.props || {};
//   const style = data?.style || {};
//   const columns = props.columns || [];
  
//   const fixedWidths = props.fixedWidths;
//   const columnsGap = props.columnsGap || 0;
//   const padding = formatPadding(style.padding);
//   const backgroundColor = style.backgroundColor || 'transparent';
//   const borderRadius = style.borderRadius;
  
//   if (columns.length === 0) return '';
  
//   // Parse fixed widths
//   let columnWidths: string[] = [];
//   if (fixedWidths) {
//     columnWidths = fixedWidths.split(' ').map(width => {
//       const trimmed = width.trim();
//       return trimmed.includes('%') ? trimmed : `${trimmed}%`;
//     });
//   } else {
//     const equalWidth = `${Math.floor(100 / columns.length)}%`;
//     columnWidths = Array(columns.length).fill(equalWidth);
//   }

//   const columnsContent = columns.map((column, index) => {
//     const columnWidth = columnWidths[index] || 'auto';
//     const columnChildrenIds = column.childrenIds || [];
    
//     const columnContent = columnChildrenIds.map(childId => {
//       const childBlock = document[childId];
//       return childBlock ? generateBlockContent(childBlock, document) : '';
//     }).join('');
    
//     // Use middle alignment for consistent vertical centering
//     return `
//       <mj-column width="${columnWidth}" vertical-align="middle">
//         ${columnContent}
//       </mj-column>
//     `;
//   }).join('');

//   let sectionAttributes = '';
  
//   if (backgroundColor !== 'transparent') {
//     sectionAttributes += ` background-color="${backgroundColor}"`;
//   }
  
//   if (padding !== '0px 0px 0px 0px') {
//     sectionAttributes += ` padding="${padding}"`;
//   }
  
//   if (borderRadius) {
//     sectionAttributes += ` border-radius="${borderRadius}px"`;
//   }

//   return `
//     <mj-section${sectionAttributes}>
//       <mj-group>
//         ${columnsContent}
//       </mj-group>
//     </mj-section>
//   `;
// }

function generateColumnsContainer(block: Block, document: any): string {
  const { data } = block;
  const props = data?.props || {};
  const style = data?.style || {};
  const columns = props.columns || [];
  
  const fixedWidths = props.fixedWidths;
  const columnsGap = props.columnsGap || 0; // This is the gap value
  const padding = formatPadding(style.padding);
  const backgroundColor = style.backgroundColor || 'transparent';
  const borderRadius = style.borderRadius;
  
  if (columns.length === 0) return '';
  
  // Parse fixed widths
  let columnWidths: string[] = [];
  if (fixedWidths) {
    columnWidths = fixedWidths.split(' ').map(width => {
      const trimmed = width.trim();
      return trimmed.includes('%') ? trimmed : `${trimmed}%`;
    });
  } else {
    const equalWidth = `${Math.floor(100 / columns.length)}%`;
    columnWidths = Array(columns.length).fill(equalWidth);
  }

  const columnsContent = columns.map((column, index) => {
    const columnWidth = columnWidths[index] || 'auto';
    const columnChildrenIds = column.childrenIds || [];
    
    const columnContent = columnChildrenIds.map(childId => {
      const childBlock = document[childId];
      return childBlock ? generateBlockContent(childBlock, document) : '';
    }).join('');
    
    // Add padding to create gap between columns
    let columnPadding = '0px';
    if (columnsGap > 0) {
      if (index === 0) {
        // First column: padding on right only
        columnPadding = `0px ${columnsGap / 2}px 0px 0px`;
      } else if (index === columns.length - 1) {
        // Last column: padding on left only
        columnPadding = `0px 0px 0px ${columnsGap / 2}px`;
      } else {
        // Middle columns: padding on both sides
        columnPadding = `0px ${columnsGap / 2}px 0px ${columnsGap / 2}px`;
      }
    }
    
    return `
      <mj-column width="${columnWidth}" vertical-align="middle" padding="${columnPadding}">
        ${columnContent}
      </mj-column>
    `;
  }).join('');

  let sectionAttributes = '';
  
  if (backgroundColor !== 'transparent') {
    sectionAttributes += ` background-color="${backgroundColor}"`;
  }
  
  if (padding !== '0px 0px 0px 0px') {
    sectionAttributes += ` padding="${padding}"`;
  }
  
  if (borderRadius) {
    sectionAttributes += ` border-radius="${borderRadius}px"`;
  }

  return `
    <mj-section${sectionAttributes}>
      <mj-group>
        ${columnsContent}
      </mj-group>
    </mj-section>
  `;
}

function generateFlowLayout(childrenIds: string[], document: any): string {
  if (childrenIds.length === 0) return '';
  
  return childrenIds.map(childId => {
    const block = document[childId];
    if (!block) return '';
    
    return generateBlockContent(block, document);
  }).join('');
}

// Update the formatPadding function to be more precise
// function formatPadding(padding: any): string {
//   if (!padding) return '0';
  
//   if (typeof padding === 'number') {
//     return padding === 0 ? '0' : `${padding}px`;
//   }
  
//   if (typeof padding === 'object') {
//     const top = padding.top || 0;
//     const right = padding.right || 0;
//     const bottom = padding.bottom || 0;
//     const left = padding.left || 0;
    
//     // If all values are 0, return '0'
//     if (top === 0 && right === 0 && bottom === 0 && left === 0) {
//       return '0';
//     }
    
//     // If all values are the same, use single value
//     if (top === right && right === bottom && bottom === left) {
//       return `${top}px`;
//     }
    
//     return `${top}px ${right}px ${bottom}px ${left}px`;
//   }
  
//   return '0';
// }

function formatPadding(padding: any): string {
  if (!padding) return '0';
  
  if (typeof padding === 'number') {
    return padding === 0 ? '0' : `${padding}px`;
  }
  
  if (typeof padding === 'object') {
    const top = padding.top || 0;
    const right = padding.right || 0;
    const bottom = padding.bottom || 0;
    const left = padding.left || 0;
    
    // If all values are 0, return '0'
    if (top === 0 && right === 0 && bottom === 0 && left === 0) {
      return '0';
    }
    
    // If all values are the same, use single value
    if (top === right && right === bottom && bottom === left) {
      return `${top}px`;
    }
    
    // Format with proper MJML syntax (no 'px' for zero values)
    const formatValue = (value: number) => value === 0 ? '0' : `${value}px`;
    
    return `${formatValue(top)} ${formatValue(right)} ${formatValue(bottom)} ${formatValue(left)}`;
  }
  
  return '0';
}

// function generateHeaderBlock(block: Block, document: any): string {
//   const { data } = block;
//   const props = data?.props || {};
//   const style = data?.style || {};
  
//   const backgroundImage = props.backgroundImage;
//   const logoUrl = props.logoUrl;
//   const logoAlt = props.logoAlt || 'Logo';
//   const logoWidth = props.logoWidth || 120;
//   const logoHeight = props.logoHeight || 48;
//   const logoAlignment = props.logoAlignment || 'center';
//   const logoVerticalAlignment = props.logoVerticalAlignment || 'top';
  
//   const headingText = processContentWithVariables(props.headingText || props.text || 'Your Heading Here', props.purpose);
//   const headingColor = props.headingColor || props.color || '#333f5f';
//   const headingFontSize = props.headingFontSize || style.fontSize || 40;
//   const headingFontWeight = props.headingFontWeight || style.fontWeight || '700';
//   const headingTextAlign = props.headingTextAlign || style.textAlign || 'left';
//   const headingLineHeight = props.headingLineHeight || 1.36;
//   const headingWidth = props.headingWidth || 85;
//   const headerHeight = props.headerHeight || 460;
//   const containerWidth = props.containerWidth || '100%'; // Add this line
  
//   const padding = formatPadding(style.padding);
//   const backgroundColor = style.backgroundColor || 'transparent';

//   // Use position values for padding
//   const logoTop = props.logoPosition?.top || 20;
//   const logoLeft = props.logoPosition?.left || 40;
//   const logoRight = props.logoPosition?.right || 40;
  
//   const headingTop = props.headingPosition?.top || 120;
//   const headingLeft = props.headingPosition?.left || 40;
//   const headingRight = props.headingPosition?.right || 40;

//   // Build heading style using helper function
//   const headingStyle = buildStyleString({
//     fontWeight: headingFontWeight,
//     fontSize: `${headingFontSize}px`,
//     color: headingColor,
//     textAlign: headingTextAlign,
//     lineHeight: `${headingLineHeight}`,
//     margin: '0',
//     padding: '0',
//     width: `${headingWidth}%`
//   });

//   const logoSection = logoUrl ? `
//     <tr>
//       <td align="${logoAlignment}" style="padding: ${logoTop}px ${logoRight}px 0 ${logoLeft}px;">
//         <img 
//           src="${logoUrl}" 
//           alt="${logoAlt}" 
//           width="${logoWidth}" 
//           height="${logoHeight}"
//           style="display: block; background: transparent;"
//         />
//       </td>
//     </tr>
//   ` : '';

//   return `
//     <mj-section 
//       background-color="${backgroundColor}"
//       ${backgroundImage ? `background-url="${backgroundImage}"` : ''}
//       background-size="cover"
//       background-repeat="no-repeat"
//       padding="${padding || '0'}"
//       css-class="header-section"
//       ${containerWidth !== '100%' ? `width="${containerWidth}"` : ''} // Add this line
//     >
//       <mj-column padding="0">
//         <mj-table height="${headerHeight}px">
//           ${logoSection}
//           <!-- Heading Row -->
//           <tr>
//             <td align="${headingTextAlign}" style="padding: ${headingTop}px ${headingRight}px 0 ${headingLeft}px;">
//               <div ${headingStyle}>
//                 ${headingText}
//               </div>
//             </td>
//           </tr>
//         </mj-table>
//       </mj-column>
//     </mj-section>
//   `;
// }

function generateHeaderBlock(block: Block, document: any): string {
  const { data } = block;
  const props = data?.props || {};
  const style = data?.style || {};
  
  const backgroundImage = props.backgroundImage;
  const logoUrl = props.logoUrl;
  const logoAlt = props.logoAlt || 'Logo';
  const logoWidth = props.logoWidth || 120;
  const logoHeight = props.logoHeight || 48;
  const logoAlignment = props.logoAlignment || 'center';
  const logoVerticalAlignment = props.logoVerticalAlignment || 'top';
  
  const headingText = processContentWithVariables(props.headingText || props.text || 'Your Heading Here', props.purpose);
  const headingColor = props.headingColor || props.color || '#333f5f';
  const headingFontSize = props.headingFontSize || 28;
  const headingFontWeight = props.headingFontWeight || '700';
  const headingTextAlign = props.headingTextAlign || 'center';
  const headingLineHeight = props.headingLineHeight || 1.36;
  const headingWidth = props.headingWidth || 100;
  const headingVerticalAlignment = props.headingVerticalAlignment || 'bottom';
  
  const headerHeight = props.headerHeight || 440;
  const containerWidth = props.containerWidth || '100%';

  const padding = formatPadding(style.padding);
  const backgroundColor = style.backgroundColor || 'transparent';

  // Calculate vertical positioning based on alignment
  let logoTop = 20;
  let headingTop = 120;
  
  if (logoVerticalAlignment === 'middle') {
    logoTop = Math.max(20, (headerHeight - logoHeight - 100) / 2);
  } else if (logoVerticalAlignment === 'bottom') {
    logoTop = Math.max(20, headerHeight - logoHeight - 100);
  }
  
  if (headingVerticalAlignment === 'middle') {
    headingTop = Math.max(40, (headerHeight - 100) / 2);
  } else if (headingVerticalAlignment === 'bottom') {
    headingTop = Math.max(40, headerHeight - 120);
  }

  const logoLeft = 40;
  const logoRight = 40;
  const headingLeft = 40;
  const headingRight = 40;

  // FIX: Use buildStyleString correctly - it should return just the style attributes
  const headingStyle = buildStyleString({
    fontWeight: headingFontWeight,
    fontSize: `${headingFontSize}px`,
    color: headingColor,
    textAlign: headingTextAlign,
    lineHeight: `${headingLineHeight}`,
    margin: '0',
    padding: '0',
    width: `${headingWidth}%`,
    fontFamily: 'Arial, Helvetica, sans-serif'
  });

  const logoSection = logoUrl ? `
    <tr>
      <td align="${logoAlignment}" style="padding: ${logoTop}px ${logoRight}px 0 ${logoLeft}px;">
        <img 
          src="${logoUrl}" 
          alt="${logoAlt}" 
          width="${logoWidth}" 
          height="${logoHeight}"
          style="display: block; background: transparent; border: 0; outline: none;"
        />
      </td>
    </tr>
  ` : '';

  // Use MJML background image syntax properly
  const backgroundImageSection = backgroundImage ? `
    <mj-section 
      background-url="${backgroundImage}"
      background-size="cover"
      background-repeat="no-repeat"
      background-position="center center"
      padding="${padding || '0'}"
      css-class="header-section"
       width="${containerWidth}"
    >
  ` : `
    <mj-section 
      background-color="${backgroundColor}"
      padding="${padding || '0'}"
      css-class="header-section"
       width="${containerWidth}"
    >
  `;

  return `
    ${backgroundImageSection}
      <mj-column padding="0">
        <mj-table height="${headerHeight}px" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          ${logoSection}
          <tr>
            <td align="${headingTextAlign}" style="padding: ${headingTop}px ${headingRight}px 0 ${headingLeft}px; vertical-align: ${headingVerticalAlignment};">
              <div ${headingStyle}>
                ${headingText}
              </div>
            </td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>
  `;
}

function generateBottomSectionBlock(block: Block, document: any): any {
  const { data } = block;
  const props = data?.props || {};
  const style = data?.style || {};
  
  const backgroundImage = props.backgroundImage;
  const logoUrl = props.logoUrl;
  const logoAlt = props.logoAlt || 'Logo';
  const logoWidth = props.logoWidth || 120;
  const logoHeight = props.logoHeight || 48;
  const logoAlignment = props.logoAlignment || 'center';
  
  const primaryText = processContentWithVariables(props.primaryText || '', props.purpose);
  const primaryTextColor = props.primaryTextColor || props.color || '#333f5f';
  const primaryFontSize = props.primaryFontSize || style.fontSize || 16;
  const primaryFontWeight = props.primaryFontWeight || style.fontWeight || '400';
  const primaryTextAlign = props.primaryTextAlign || style.textAlign || 'center';
  const primaryLineHeight = props.primaryLineHeight || 1.4;
  const primaryWidth = props.primaryWidth || 85;
  
  const secondaryText = processContentWithVariables(props.secondaryText || '', props.purpose);
  const secondaryTextColor = props.secondaryTextColor || '#666666';
  const secondaryFontSize = props.secondaryFontSize || 14;
  const secondaryFontWeight = props.secondaryFontWeight || '400';
  const secondaryTextAlign = props.secondaryTextAlign || 'center';
  const secondaryLineHeight = props.secondaryLineHeight || 1.4;
  const secondaryWidth = props.secondaryWidth || 85;
  
  const textSpacing = props.textSpacing || 8;
  const headerHeight = props.headerHeight || 200;
  const containerWidth = props.containerWidth || '100%'; // Add this line
  
  const padding = formatPadding(style.padding);
  const backgroundColor = style.backgroundColor || 'transparent';

  const primaryTextStyle = buildStyleString({
    fontWeight: primaryFontWeight,
    fontSize: `${primaryFontSize}px`,
    color: primaryTextColor,
    textAlign: primaryTextAlign,
    lineHeight: `${primaryLineHeight}`,
    margin: '0',
    padding: '0',
    width: `${primaryWidth}%`
  });

  const secondaryTextStyle = buildStyleString({
    fontWeight: secondaryFontWeight,
    fontSize: `${secondaryFontSize}px`,
    color: secondaryTextColor,
    textAlign: secondaryTextAlign,
    lineHeight: `${secondaryLineHeight}`,
    margin: `${textSpacing}px 0 0 0`,
    padding: '0',
    width: `${secondaryWidth}%`
  });

  const logoSection = logoUrl ? `
    <tr>
      <td align="${logoAlignment}">
        <img 
          src="${logoUrl}" 
          alt="${logoAlt}" 
          width="${logoWidth}" 
          height="${logoHeight}"
          style="display: block; background: transparent;"
        />
      </td>
    </tr>
  ` : '';

  return `
    <mj-section 
      background-color="${backgroundColor}"
      ${backgroundImage ? `background-url="${backgroundImage}"` : ''}
      background-size="cover"
      background-repeat="no-repeat"
      padding="${padding || '0'}"
      css-class="bottom-section"
       width="${containerWidth}"
    >
      <mj-column padding="0">
        <mj-table height="${headerHeight}px">
          ${logoSection}
          <tr>
            <td align="${primaryTextAlign}">
              <div ${primaryTextStyle}>
                ${primaryText}
              </div>
            </td>
          </tr>
          <tr>
            <td align="${secondaryTextAlign}" style="padding: 0 40px 0 40px;">
              <div ${secondaryTextStyle}>
                ${secondaryText}
              </div>
            </td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>
  `;
}

function buildStyleString(styles: { [key: string]: string | number | undefined }): string {
  const styleProps = Object.entries(styles)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabKey}: ${value}${typeof value === 'number' ? 'px' : ''}`;
    })
    .join('; ');
  
  return styleProps ? `style="${styleProps}"` : '';
}

function generateBorderStyles(document: any): string {
  const borderColors = new Set();
  
  // Find all unique border colors in the document
  Object.values(document).forEach((block: any) => {
    if (block?.data?.style?.borderColor) {
      borderColors.add(block.data.style.borderColor);
    }
  });
  
  if (borderColors.size === 0) return '';
  
  const styleRules = Array.from(borderColors).map((color: any) => {
    const className = `border-${color.replace('#', '')}`;
    return `.${className} { border: 1px solid ${color}; }`;
  }).join('\n');
  
  return `<mj-style>${styleRules}</mj-style>`;
}
