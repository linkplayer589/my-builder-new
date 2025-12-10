import { z } from "zod"

// Define the base schema locally
const BaseColumnsContainerPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .nullable()
        .optional(),
      padding: z
        .object({
          top: z.number(),
          bottom: z.number(),
          right: z.number(),
          left: z.number(),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
  props: z
    .object({
      fixedWidths: z.string().optional().nullable(),
      columnsCount: z
        .union([z.literal(2), z.literal(3), z.literal(4)])
        .optional()
        .nullable(),
      columnsGap: z.number().optional().nullable(),
      contentAlignment: z
        .enum(["top", "middle", "bottom"])
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
})

const BasePropsShape = BaseColumnsContainerPropsSchema.shape.props
  .unwrap()
  .unwrap().shape

const ColumnsContainerPropsSchema = z.object({
  style: BaseColumnsContainerPropsSchema.shape.style,
  props: z
    .object({
      ...BasePropsShape,
      columns: z
        .array(
          z.object({
            childrenIds: z.array(z.string()),
          })
        )
        .optional(),
    })
    .optional()
    .nullable(),
})

export type ColumnsContainerProps = z.infer<typeof ColumnsContainerPropsSchema>
export default ColumnsContainerPropsSchema
