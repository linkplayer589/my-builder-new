import { z } from "zod"

export const OverlayContainerPropsSchema = z.object({
  childrenIds: z.array(z.string()).optional(),
  maxLayers: z.number().default(3),
})

export type OverlayContainerProps = z.infer<typeof OverlayContainerPropsSchema>
