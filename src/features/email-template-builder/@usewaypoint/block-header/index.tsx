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

export const HeaderPropsSchema = z.object({
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
      headingText: z.string().optional().nullable(),
      headingColor: COLOR_SCHEMA,
      headingFontSize: z.number().optional().nullable(),
      headingFontWeight: z.string().optional().nullable(),
      headingTextAlign: z
        .enum(["left", "center", "right"])
        .optional()
        .nullable(),
      headingVerticalAlignment: z
        .enum(["top", "middle", "bottom"])
        .optional()
        .nullable(),
      headingLineHeight: z.number().optional().nullable(),
      headingWidth: z.number().optional().nullable(),
      headingPosition: z
        .object({
          top: z.number().optional().nullable(),
          left: z.number().optional().nullable(),
          right: z.number().optional().nullable(),
          bottom: z.number().optional().nullable(),
        })
        .optional()
        .nullable(),
      headerHeight: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export type HeaderProps = z.infer<typeof HeaderPropsSchema>

const HeaderPropsDefaults = {
  logoWidth: 120,
  logoHeight: 48,
  headingText: "Your Heading Here",
  headingColor: "#333f5f",
  headingFontSize: 40,
  headingFontWeight: "700",
  headingTextAlign: "left" as const,
  headingLineHeight: 1.36,
  headerHeight: 460,
} as const

export function Header({ style, props }: HeaderProps) {
  const headerProps = {
    backgroundImage: props?.backgroundImage,
    logoUrl:
      props?.logoUrl ??
      "https://mountain-technologies-lifepass.b-cdn.net/Mountain%20Technologies/Email%20Templates/Headers/logo.png",
    logoAlt: props?.logoAlt ?? "Logo",
    logoWidth: props?.logoWidth ?? HeaderPropsDefaults.logoWidth,
    logoHeight: props?.logoHeight ?? HeaderPropsDefaults.logoHeight,
    logoAlignment: props?.logoAlignment ?? "center",
    logoVerticalAlignment: props?.logoVerticalAlignment ?? "top",
    logoPosition: props?.logoPosition ?? { top: 20, left: 40 },
    headingText: props?.headingText ?? HeaderPropsDefaults.headingText,
    headingColor: props?.headingColor ?? HeaderPropsDefaults.headingColor,
    headingFontSize:
      props?.headingFontSize ?? HeaderPropsDefaults.headingFontSize,
    headingFontWeight:
      props?.headingFontWeight ?? HeaderPropsDefaults.headingFontWeight,
    headingTextAlign:
      props?.headingTextAlign ?? HeaderPropsDefaults.headingTextAlign,
    headingVerticalAlignment: props?.headingVerticalAlignment ?? "top",
    headingLineHeight:
      props?.headingLineHeight ?? HeaderPropsDefaults.headingLineHeight,
    headingWidth: props?.headingWidth ?? 85,
    headingPosition: props?.headingPosition ?? { top: 120, left: 40 },
    headerHeight: props?.headerHeight ?? HeaderPropsDefaults.headerHeight,
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
    position: "relative",
  }

  // Calculate vertical position for logo
  const getLogoVerticalPosition = (): CSSProperties => {
    const position: CSSProperties = {}

    switch (headerProps.logoVerticalAlignment) {
      case "top":
        position.top = `${headerProps.logoPosition?.top ?? 20}px`
        position.bottom = "auto"
        break
      case "middle":
        position.top = "50%"
        position.bottom = "auto"
        position.transform = `translateY(-50%) ${headerProps.logoAlignment === "center" ? "translateX(-50%)" : ""}`
        break
      case "bottom":
        position.top = "auto"
        position.bottom = `${headerProps.logoPosition?.bottom ?? 20}px`
        break
      default:
        position.top = `${headerProps.logoPosition?.top ?? 20}px`
        position.bottom = "auto"
    }

    return position
  }

  // Calculate horizontal position for logo
  const getLogoHorizontalPosition = (): CSSProperties => {
    const position: CSSProperties = {}

    switch (headerProps.logoAlignment) {
      case "left":
        position.left = `${headerProps.logoPosition?.left ?? 40}px`
        position.right = "auto"
        position.transform =
          headerProps.logoVerticalAlignment === "middle"
            ? "translateY(-50%)"
            : "none"
        break
      case "right":
        position.left = "auto"
        position.right = `${headerProps.logoPosition?.right ?? 40}px`
        position.transform =
          headerProps.logoVerticalAlignment === "middle"
            ? "translateY(-50%)"
            : "none"
        break
      case "center":
        position.left = "50%"
        position.right = "auto"
        position.transform =
          headerProps.logoVerticalAlignment === "middle"
            ? "translate(-50%, -50%)"
            : "translateX(-50%)"
        break
      default:
        position.left = `${headerProps.logoPosition?.left ?? 40}px`
        position.right = "auto"
    }

    return position
  }

  // Calculate vertical position for heading
  const getHeadingVerticalPosition = (): CSSProperties => {
    const position: CSSProperties = {}

    switch (headerProps.headingVerticalAlignment) {
      case "top":
        position.top = `${headerProps.headingPosition?.top ?? 120}px`
        position.bottom = "auto"
        break
      case "middle":
        position.top = "50%"
        position.bottom = "auto"
        position.transform = `translateY(-50%) ${headerProps.headingTextAlign === "center" ? "translateX(-50%)" : ""}`
        break
      case "bottom":
        position.top = "auto"
        position.bottom = `${headerProps.headingPosition?.bottom ?? 20}px`
        break
      default:
        position.top = `${headerProps.headingPosition?.top ?? 120}px`
        position.bottom = "auto"
    }

    return position
  }

  // Calculate horizontal position for heading
  const getHeadingHorizontalPosition = (): CSSProperties => {
    const position: CSSProperties = {}

    switch (headerProps.headingTextAlign) {
      case "left":
        position.left = `${headerProps.headingPosition?.left ?? 40}px`
        position.right = "auto"
        position.transform =
          headerProps.headingVerticalAlignment === "middle"
            ? "translateY(-50%)"
            : "none"
        break
      case "right":
        position.left = "auto"
        position.right = `${headerProps.headingPosition?.right ?? 40}px`
        position.transform =
          headerProps.headingVerticalAlignment === "middle"
            ? "translateY(-50%)"
            : "none"
        break
      case "center":
        position.left = "50%"
        position.right = "auto"
        position.transform =
          headerProps.headingVerticalAlignment === "middle"
            ? "translate(-50%, -50%)"
            : "translateX(-50%)"
        break
      default:
        position.left = `${headerProps.headingPosition?.left ?? 40}px`
        position.right = "auto"
    }

    return position
  }

  const logoStyle: CSSProperties = {
    position: "absolute",
    ...getLogoVerticalPosition(),
    ...getLogoHorizontalPosition(),
  }

  const headingStyle: CSSProperties = {
    fontWeight: headerProps.headingFontWeight,
    fontSize: `${headerProps.headingFontSize}px`,
    color: headerProps.headingColor,
    textAlign: headerProps.headingTextAlign,
    lineHeight: headerProps.headingLineHeight,
    margin: 0,
    padding: 0,
    width: `${headerProps.headingWidth}%`,
    position: "absolute",
    ...getHeadingVerticalPosition(),
    ...getHeadingHorizontalPosition(),
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

        {/* Heading with absolute positioning */}
        <div style={headingStyle}>{headerProps.headingText}</div>
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
