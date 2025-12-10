import { z } from "zod"

export const CanvasContainerPropsSchema = z.object({
  style: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
      padding: z
        .object({
          top: z.number(),
          bottom: z.number(),
          left: z.number(),
          right: z.number(),
        })
        .optional(),
    })
    .optional(),
  props: z
    .object({
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
      zIndex: z.number().optional(),
    })
    .optional()
    .nullable(),
  childrenIds: z.array(z.string()).optional().nullable(),
})

export type CanvasContainerProps = z.infer<typeof CanvasContainerPropsSchema>
