"use server"

import { revalidateTag } from "next/cache"

export async function revalidateSalesChannels() {
  console.log("revalidating sales channels")
  revalidateTag("sales-channels", "max")
}
