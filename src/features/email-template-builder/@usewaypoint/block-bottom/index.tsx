"use client"

import { CSSProperties } from "react"
import { z } from "zod"

const COLOR_SCHEMA = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .nullable()
  .optional()

const PADDING_SCHEMA = z
  .object({
    top: z.number(),
    bottom: z.number(),
    right: z.number(),
    left: z.number(),
  })
  .optional()
  .nullable()

const MARGIN_SCHEMA = z
  .object({
    top: z.number(),
    bottom: z.number(),
    right: z.number(),
    left: z.number(),
  })
  .optional()
  .nullable()

export const BottomSectionPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: COLOR_SCHEMA,
      padding: PADDING_SCHEMA,
      margin: MARGIN_SCHEMA,
    })
    .optional()
    .nullable(),
  props: z
    .object({
      containerWidth: z.string().optional().nullable(),
      backgroundImage: z.string().optional().nullable(),
      logoUrl: z.string().optional().nullable(),
      logoAlt: z.string().optional().nullable(),
      logoWidth: z.number().optional().nullable(),
      logoHeight: z.number().optional().nullable(),
      logoAlignment: z.enum(["left", "center", "right"]).optional().nullable(),
      logoVerticalAlignment: z
        .enum(["top", "middle", "bottom"])
        .optional()
        .nullable(),
      logoPosition: z
        .object({
          top: z.number().optional().nullable(),
          left: z.number().optional().nullable(),
          right: z.number().optional().nullable(),
          bottom: z.number().optional().nullable(),
        })
        .optional()
        .nullable(),

      // First text field
      primaryText: z.string().optional().nullable(),
      primaryTextColor: COLOR_SCHEMA,
      primaryFontSize: z.number().optional().nullable(),
      primaryFontWeight: z.string().optional().nullable(),
      primaryTextAlign: z
        .enum(["left", "center", "right"])
        .optional()
        .nullable(),
      primaryVerticalAlignment: z
        .enum(["top", "middle", "bottom"])
        .optional()
        .nullable(),
      primaryLineHeight: z.number().optional().nullable(),
      primaryWidth: z.number().optional().nullable(),
      primaryPosition: z
        .object({
          top: z.number().optional().nullable(),
          left: z.number().optional().nullable(),
          right: z.number().optional().nullable(),
          bottom: z.number().optional().nullable(),
        })
        .optional()
        .nullable(),

      // Second text field
      secondaryText: z.string().optional().nullable(),
      secondaryTextColor: COLOR_SCHEMA,
      secondaryFontSize: z.number().optional().nullable(),
      secondaryFontWeight: z.string().optional().nullable(),
      secondaryTextAlign: z
        .enum(["left", "center", "right"])
        .optional()
        .nullable(),
      secondaryVerticalAlignment: z
        .enum(["top", "middle", "bottom"])
        .optional()
        .nullable(),
      secondaryLineHeight: z.number().optional().nullable(),
      secondaryWidth: z.number().optional().nullable(),
      secondaryPosition: z
        .object({
          top: z.number().optional().nullable(),
          left: z.number().optional().nullable(),
          right: z.number().optional().nullable(),
          bottom: z.number().optional().nullable(),
        })
        .optional()
        .nullable(),

      // Add spacing between texts
      textSpacing: z.number().optional().nullable(),

      headerHeight: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export type BottomSectionProps = z.infer<typeof BottomSectionPropsSchema>

const BottomSectionPropsDefaults = {
  logoWidth: 120,
  logoHeight: 48,
  primaryText: "Primary Heading",
  primaryTextColor: "#333f5f",
  primaryFontSize: 40,
  primaryFontWeight: "700",
  primaryTextAlign: "left" as const,
  primaryLineHeight: 1.36,
  primaryWidth: 85,
  secondaryText: "Secondary Text",
  secondaryTextColor: "#666666",
  secondaryFontSize: 24,
  secondaryFontWeight: "400",
  secondaryTextAlign: "left" as const,
  secondaryLineHeight: 1.4,
  secondaryWidth: 85,
  textSpacing: 8, // Default spacing between texts
  headerHeight: 460,
  containerWidth: 100,
} as const

export function BottomSection({ style, props }: BottomSectionProps) {
  const headerProps = {
    containerWidth:
      props?.containerWidth ?? BottomSectionPropsDefaults.containerWidth,
    backgroundImage: props?.backgroundImage,
    logoUrl: props?.logoUrl ?? "https://via.placeholder.com/120x48",
    logoAlt: props?.logoAlt ?? "Logo",
    logoWidth: props?.logoWidth ?? BottomSectionPropsDefaults.logoWidth,
    logoHeight: props?.logoHeight ?? BottomSectionPropsDefaults.logoHeight,
    logoAlignment: props?.logoAlignment ?? "center",
    logoVerticalAlignment: props?.logoVerticalAlignment ?? "top",
    logoPosition: props?.logoPosition ?? { top: 20, left: 40 },

    primaryText: props?.primaryText ?? BottomSectionPropsDefaults.primaryText,
    primaryTextColor:
      props?.primaryTextColor ?? BottomSectionPropsDefaults.primaryTextColor,
    primaryFontSize:
      props?.primaryFontSize ?? BottomSectionPropsDefaults.primaryFontSize,
    primaryFontWeight:
      props?.primaryFontWeight ?? BottomSectionPropsDefaults.primaryFontWeight,
    primaryTextAlign:
      props?.primaryTextAlign ?? BottomSectionPropsDefaults.primaryTextAlign,
    primaryVerticalAlignment: props?.primaryVerticalAlignment ?? "top",
    primaryLineHeight:
      props?.primaryLineHeight ?? BottomSectionPropsDefaults.primaryLineHeight,
    primaryWidth:
      props?.primaryWidth ?? BottomSectionPropsDefaults.primaryWidth,
    primaryPosition: props?.primaryPosition ?? { top: 120, left: 40 },

    secondaryText:
      props?.secondaryText ?? BottomSectionPropsDefaults.secondaryText,
    secondaryTextColor:
      props?.secondaryTextColor ??
      BottomSectionPropsDefaults.secondaryTextColor,
    secondaryFontSize:
      props?.secondaryFontSize ?? BottomSectionPropsDefaults.secondaryFontSize,
    secondaryFontWeight:
      props?.secondaryFontWeight ??
      BottomSectionPropsDefaults.secondaryFontWeight,
    secondaryTextAlign:
      props?.secondaryTextAlign ??
      BottomSectionPropsDefaults.secondaryTextAlign,
    secondaryVerticalAlignment: props?.secondaryVerticalAlignment ?? "top",
    secondaryLineHeight:
      props?.secondaryLineHeight ??
      BottomSectionPropsDefaults.secondaryLineHeight,
    secondaryWidth:
      props?.secondaryWidth ?? BottomSectionPropsDefaults.secondaryWidth,
    secondaryPosition: props?.secondaryPosition ?? { top: 180, left: 40 },

    textSpacing: props?.textSpacing ?? BottomSectionPropsDefaults.textSpacing,

    headerHeight:
      props?.headerHeight ?? BottomSectionPropsDefaults.headerHeight,
  }

  const containerStyle: CSSProperties = {
    backgroundColor: style?.backgroundColor ?? undefined,
    padding: getPadding(style?.padding),
    margin: getMargin(style?.margin),
    width: props?.containerWidth ?? "100%",
  }

  const headerStyle: CSSProperties = {
    backgroundImage: headerProps.backgroundImage
      ? `url('${headerProps.backgroundImage}')`
      : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    height: `${headerProps.headerHeight}px`,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  }

  const logoStyle: CSSProperties = {
    position: "absolute",
    top: `${headerProps.logoPosition?.top ?? 20}px`,
    left:
      headerProps.logoAlignment === "left"
        ? `${headerProps.logoPosition?.left ?? 40}px`
        : "auto",
    right:
      headerProps.logoAlignment === "right"
        ? `${headerProps.logoPosition?.right ?? 40}px`
        : "auto",
    transform:
      headerProps.logoAlignment === "center" ? "translateX(-50%)" : "none",
    ...(headerProps.logoAlignment === "center" && {
      left: "50%",
    }),
  }

  // Calculate vertical position for content
  const getContentVerticalPosition = (): CSSProperties => {
    const position: CSSProperties = {}

    switch (headerProps.primaryVerticalAlignment) {
      case "top":
        position.marginTop = `${headerProps.primaryPosition?.top ?? 60}px`
        position.marginBottom = "auto"
        break
      case "middle":
        position.marginTop = "auto"
        position.marginBottom = "auto"
        break
      case "bottom":
        position.marginTop = "auto"
        position.marginBottom = `${headerProps.primaryPosition?.bottom ?? 60}px`
        break
      default:
        position.marginTop = `${headerProps.primaryPosition?.top ?? 60}px`
        position.marginBottom = "auto"
    }

    return position
  }

  const contentStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: headerProps.primaryTextAlign,
    justifyContent: "center",
    width: "100%",
    maxWidth: "90%",
    textAlign: headerProps.primaryTextAlign,
    ...getContentVerticalPosition(),
  }

  const primaryTextStyle: CSSProperties = {
    fontWeight: headerProps.primaryFontWeight,
    fontSize: `${headerProps.primaryFontSize}px`,
    color: headerProps.primaryTextColor,
    textAlign: headerProps.primaryTextAlign,
    lineHeight: headerProps.primaryLineHeight,
    margin: 0,
    padding: 0,
    width: `${headerProps.primaryWidth}%`,
    alignSelf:
      headerProps.primaryTextAlign === "center"
        ? "center"
        : headerProps.primaryTextAlign === "right"
          ? "flex-end"
          : "flex-start",
  }

  const secondaryTextStyle: CSSProperties = {
    fontWeight: headerProps.secondaryFontWeight,
    fontSize: `${headerProps.secondaryFontSize}px`,
    color: headerProps.secondaryTextColor,
    textAlign: headerProps.secondaryTextAlign,
    lineHeight: headerProps.secondaryLineHeight,
    margin: `${headerProps.textSpacing}px 0 0 0`,
    padding: 0,
    width: `${headerProps.secondaryWidth}%`,
    alignSelf:
      headerProps.secondaryTextAlign === "center"
        ? "center"
        : headerProps.secondaryTextAlign === "right"
          ? "flex-end"
          : "flex-start",
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        {/* Logo with absolute positioning */}
        <img
          src={headerProps.logoUrl}
          alt={headerProps.logoAlt}
          width={headerProps.logoWidth}
          height={headerProps.logoHeight}
          style={{
            ...logoStyle,
            background: "transparent",
          }}
        />

        {/* Text Content */}
        <div style={contentStyle}>
          {/* Primary Text */}
          <div style={primaryTextStyle}>{headerProps.primaryText}</div>

          {/* Secondary Text */}
          <div style={secondaryTextStyle}>{headerProps.secondaryText}</div>
        </div>
      </div>
    </div>
  )
}
function getPadding(padding: z.infer<typeof PADDING_SCHEMA>) {
  if (!padding) return undefined
  return `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`
}

function getMargin(margin: z.infer<typeof MARGIN_SCHEMA>) {
  if (!margin) return undefined
  return `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`
}
