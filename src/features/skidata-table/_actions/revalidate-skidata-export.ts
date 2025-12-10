"use server"

import { revalidatePath } from "next/cache"

export async function revalidateSkidataExport() {
    revalidatePath("/admin/[resortName]/skidata-reporting")
} 