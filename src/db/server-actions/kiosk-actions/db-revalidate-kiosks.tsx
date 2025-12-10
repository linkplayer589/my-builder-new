"use server"

import { revalidateTag } from "next/cache"

export async function revalidateKiosks() {
    console.log("🔄 [API] Revalidating kiosks cache...")
    revalidateTag("kiosks", "max")
}