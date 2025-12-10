"use server"

import { revalidateTag } from "next/cache"

export async function revalidateProducts() {
  console.log("revalidating products")
  revalidateTag("products", "max")
}
