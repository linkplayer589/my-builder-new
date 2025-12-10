"use server"

import { db } from "@/db"
import { resorts } from "@/db/schema"
import { _createResortSchema, type CreateResortSchemaType } from "./types"
import { revalidateTag } from "next/cache"

export async function createResortHandler(data: CreateResortSchemaType) {
  try {
    const validated = _createResortSchema.parse(data)
    const { id, name, config = "{}", stripeSecretKey, stripeWebhookSecret } = validated

    await db.insert(resorts).values({
      id,
      name,
      config: typeof config === 'string' ? JSON.parse(config) : config,
      stripeSecretKey: stripeSecretKey ?? null,
      stripeWebhookSecret: stripeWebhookSecret ?? null,
    })

    revalidateTag("resorts", "max")
    return validated
  } catch (err: unknown) {
    // Postgres unique-violation
    if (err && typeof err === 'object' && 'code' in err && 'constraint' in err) {
      const dbError = err as { code: string; constraint: string }
      if (dbError.code === "23505" && dbError.constraint === "resorts_id_unique") {
        throw new Error(
          "Failed to create resort because the internal ID sequence is out of sync. " +
          "Please reset the sequence (see documentation) or contact your DBA."
        )
      }
    }
    console.error("Error creating resort:", err)
    // throw new Error("Failed to create resort")
  }
}
