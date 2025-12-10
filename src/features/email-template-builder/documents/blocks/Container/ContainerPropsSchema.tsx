import { z } from "zod"

// Define the base schema locally (copy from your container code)
const BaseContainerPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .nullable()
        .optional(),
      borderColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .nullable()
        .optional(),
      borderRadius: z.number().optional().nullable(),
      padding: z
        .object({
          top: z.number(),
          bottom: z.number(),
          right: z.number(),
          left: z.number(),
        })
        .optional()
        .nullable(),
      width: z.number().optional().nullable(),
      height: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
  props: z
    .object({
      width: z.number().optional().nullable(),
      height: z.number().optional().nullable(),
      childrenIds: z.array(z.string()).optional().nullable(),
    })
    .optional()
    .nullable(),
})

const ContainerPropsSchema = z.object({
  style: BaseContainerPropsSchema.shape.style,
  props: z
    .object({
      childrenIds: z.array(z.string()).optional().nullable(),
    })
    .optional()
    .nullable(),
})

export default ContainerPropsSchema
export type ContainerProps = z.infer<typeof ContainerPropsSchema>
